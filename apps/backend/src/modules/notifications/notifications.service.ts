import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Appointment, AppointmentStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.initTransporter();
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
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(`📧 Dev e-posta (notifications): https://ethereal.email/messages`);
    }
  }

  async sendAppointmentNotification(
    appointment: Appointment & { client?: any; psychologist?: any },
    type: string,
  ) {
    try {
      const titles: Record<string, string> = {
        APPOINTMENT_CREATED: 'Randevu Talebiniz Alındı',
        APPOINTMENT_CONFIRMED: 'Randevunuz Onaylandı',
        APPOINTMENT_CANCELLED: 'Randevunuz İptal Edildi',
        APPOINTMENT_REMINDER: 'Randevu Hatırlatması',
        APPOINTMENT_RESCHEDULED: 'Randevunuz Yeniden Düzenlendi',
      };

      const body = `${titles[type] ?? type}: ${new Date(appointment.startTime).toLocaleString('tr-TR')}`;

      if (appointment.client?.user?.email) {
        await this.prisma.notification.create({
          data: {
            userId: appointment.client.user.id ?? '',
            appointmentId: appointment.id,
            type,
            title: titles[type] ?? type,
            body,
          },
        });
        await this.sendEmail(appointment.client.user.email, titles[type] ?? type, body);
      }

      if (appointment.psychologist?.user?.email) {
        await this.prisma.notification.create({
          data: {
            userId: appointment.psychologist.user.id ?? '',
            appointmentId: appointment.id,
            type,
            title: titles[type] ?? type,
            body,
          },
        });
        await this.sendEmail(appointment.psychologist.user.email, titles[type] ?? type, body);
      }
    } catch (err) {
      this.logger.error('Bildirim gönderilemedi', err);
    }
  }

  async sendGeneralNotification(userId: string, type: string, title: string, body: string) {
    try {
      await this.prisma.notification.create({ data: { userId, type, title, body } });
    } catch (err) {
      this.logger.error('Bildirim oluşturulamadı', err);
    }
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendAppointmentReminders() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourPlusFive = new Date(now.getTime() + 65 * 60 * 1000);

    const upcoming = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        startTime: { gte: oneHourLater, lte: oneHourPlusFive },
      },
      include: {
        client: { include: { user: { select: { id: true, email: true, firstName: true } } } },
        psychologist: { include: { user: { select: { id: true, email: true, firstName: true } } } },
      },
    });

    for (const appointment of upcoming) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          appointmentId: appointment.id,
          type: 'APPOINTMENT_REMINDER',
        },
      });
      if (existing) continue;

      await this.sendAppointmentNotification(appointment, 'APPOINTMENT_REMINDER');
      this.logger.log(`Hatırlatma gönderildi: randevu ${appointment.id}`);
    }
  }

  private async sendEmail(to: string, subject: string, text: string) {
    const from = this.config.get('SMTP_FROM', 'PsikoTakip <noreply@psikotakip.com>');
    try {
      const info = await this.transporter.sendMail({ from, to, subject, text });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📬 E-posta önizleme: ${previewUrl}`);
      } else {
        this.logger.log(`E-posta gönderildi: ${to}`);
      }
    } catch (err) {
      this.logger.warn(`E-posta gönderilemedi: ${to}`, err);
    }
  }
}
