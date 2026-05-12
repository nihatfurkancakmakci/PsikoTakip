import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private transporter: nodemailer.Transporter;
  private transporterReady: Promise<void>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.transporterReady = this.initTransporter();
  }

  private async initTransporter() {
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
        port: this.config.get<number>('SMTP_PORT', 587),
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      // Dev modunda Ethereal test hesabı kullan
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(`📧 Dev e-posta: ${testAccount.user} | ${testAccount.pass}`);
      this.logger.log(`📬 E-posta önizleme: https://ethereal.email/messages`);
    }
  }

  async register(dto: RegisterDto, ipAddress?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu e-posta adresi zaten kayıtlı');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.CLIENT,
        verifyToken,
      },
    });

    if (user.role === Role.CLIENT) {
      await this.prisma.client.create({ data: { userId: user.id } });
    }

    await this.auditService.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      details: { role: user.role },
    });

    return {
      message: 'Kayıt başarılı. E-posta adresinizi doğrulayın.',
      userId: user.id,
    };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.isActive) {
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        entity: 'User',
        ipAddress,
        details: { email: dto.email },
      });
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entity: 'User',
        entityId: user.id,
        ipAddress,
      });
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress,
    });

    return { ...tokens, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } };
  }

  async refreshTokens(refreshToken: string, ipAddress?: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Kullanıcı bulunamadı');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    await this.auditService.log({ userId, action: 'LOGOUT', entity: 'User', entityId: userId });
    return { message: 'Çıkış başarılı' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) throw new BadRequestException('Geçersiz doğrulama bağlantısı');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    return { message: 'E-posta başarıyla doğrulandı' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return same message to prevent email enumeration
    if (!user || !user.isActive) {
      return { message: 'Şifre sıfırlama e-postası gönderildi (eğer hesap mevcutsa)' };
    }

    const resetToken = uuidv4();
    const resetTokenExp = new Date();
    resetTokenExp.setHours(resetTokenExp.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const from = this.config.get('SMTP_FROM', 'PsikoTakip <noreply@psikotakip.com>');

    try {
      await this.transporterReady;
      const info = await this.transporter.sendMail({
        from,
        to: user.email,
        subject: 'Şifre Sıfırlama – PsikoTakip',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2>Merhaba ${user.firstName},</h2>
            <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              Şifremi Sıfırla
            </a>
            <p style="margin-top:16px;font-size:13px;color:#888;">Bu bağlantı 1 saat geçerlidir. Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı dikkate almayın.</p>
          </div>
        `,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📬 Şifre sıfırlama e-posta önizleme: ${previewUrl}`);
      }
      this.logger.log(`🔑 Şifre sıfırlama URL (dev): ${resetUrl}`);
    } catch (err) {
      this.logger.warn('Şifre sıfırlama e-postası gönderilemedi', err);
      this.logger.log(`🔑 Şifre sıfırlama URL (dev fallback): ${resetUrl}`);
    }

    return { message: 'Şifre sıfırlama e-postası gönderildi (eğer hesap mevcutsa)' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Geçersiz veya süresi dolmuş token');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    await this.sendPasswordChangedMail(user.email, user.firstName);

    await this.auditService.log({
      userId: user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      details: { action: 'password_reset' },
    });

    return { message: 'Şifre başarıyla sıfırlandı' };
  }

  private async sendPasswordChangedMail(email: string, firstName: string) {
    const from = this.config.get('SMTP_FROM', 'PsikoTakip <noreply@psikotakip.com>');

    try {
      await this.transporterReady;
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Şifreniz güncellendi - PsikoTakip',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2>Merhaba ${firstName},</h2>
            <p>PsikoTakip hesabınızın şifresi başarıyla güncellendi.</p>
            <p style="margin-top:16px;font-size:13px;color:#666;">Bu işlemi siz yapmadıysanız lütfen hemen destek ekibiyle iletişime geçin.</p>
          </div>
        `,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) this.logger.log(`Şifre güncelleme e-posta önizleme: ${previewUrl}`);
    } catch (err) {
      this.logger.warn('Şifre güncelleme e-postası gönderilemedi', err);
    }
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
