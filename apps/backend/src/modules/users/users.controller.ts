import {
  BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Role, PsychologistApprovalStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdatePsychologistDto } from './dto/update-psychologist.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreatePsychologistDto } from './dto/create-psychologist.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

const profilePhotoUploadDir = join(process.cwd(), 'uploads', 'psychologists');
const allowedProfilePhotoMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function ensureProfilePhotoUploadDir() {
  if (!existsSync(profilePhotoUploadDir)) {
    mkdirSync(profilePhotoUploadDir, { recursive: true });
  }
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tüm kullanıcılar (admin)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  findAll(
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAllUsers(search, role);
  }

  @Post('psychologists')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Psikolog oluştur (admin)' })
  createPsychologist(@Body() dto: CreatePsychologistDto, @CurrentUser() admin: JwtPayload) {
    return this.usersService.createPsychologist(dto, admin.sub);
  }

  @Get('my-clients')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Psikologun danışanları' })
  getMyClients(@CurrentUser() user: JwtPayload) {
    return this.usersService.getPsychologistClients(user.sub);
  }

  @Public()
  @Get('psychologists')
  @ApiOperation({ summary: 'Onaylı psikolog listesi (misafir erişilebilir)' })
  @ApiQuery({ name: 'status', enum: PsychologistApprovalStatus, required: false })
  findAllPsychologists(@Query('status') status?: PsychologistApprovalStatus) {
    return this.usersService.findAllPsychologists(status);
  }

  @Get('psychologists/profile')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Psikolog kendi profilini görüntüle' })
  getPsychologistProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findPsychologistByUserId(user.sub);
  }

  @Public()
  @Get('psychologists/:id')
  @ApiOperation({ summary: 'Psikolog detayı (misafir erişilebilir)' })
  findPsychologist(@Param('id') id: string) {
    return this.usersService.findPsychologistById(id);
  }

  @Put('psychologists/profile')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Psikolog profili güncelle' })
  updatePsychologistProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePsychologistDto,
  ) {
    return this.usersService.updatePsychologistProfile(user.sub, dto);
  }

  @Post('psychologists/profile/photo')
  @Roles(Role.PSYCHOLOGIST)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        ensureProfilePhotoUploadDir();
        cb(null, profilePhotoUploadDir);
      },
      filename: (_req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedProfilePhotoMimeTypes.includes(file.mimetype)) {
        cb(new BadRequestException('Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz'), false);
        return;
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Psikolog profil fotoğrafı yükle' })
  uploadPsychologistProfilePhoto(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: any,
  ) {
    if (!file) throw new BadRequestException('Fotoğraf dosyası zorunludur');
    const photoUrl = `/uploads/psychologists/${file.filename}`;
    return this.usersService.updatePsychologistPhoto(user.sub, photoUrl);
  }

  @Delete('psychologists/profile/photo')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Psikolog profil fotoğrafını kaldır' })
  removePsychologistProfilePhoto(@CurrentUser() user: JwtPayload) {
    return this.usersService.removePsychologistPhoto(user.sub);
  }

  @Post('psychologists/profile/certificate')
  @Roles(Role.PSYCHOLOGIST)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dir = join(process.cwd(), 'uploads', 'certificates');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase() || '.pdf';
        cb(null, `${randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        cb(new BadRequestException('Sadece PDF, JPG, PNG veya WEBP yükleyebilirsiniz'), false);
        return;
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Psikolog sertifika dosyası yükle' })
  uploadCertificateFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: any,
    @Body() body: { name?: string },
  ) {
    if (!file) throw new BadRequestException('Sertifika dosyası zorunludur');
    const fileUrl = `/uploads/certificates/${file.filename}`;
    return { fileUrl, name: body.name ?? file.originalname };
  }

  @Patch('psychologists/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Psikolog onayla/reddet (admin) - eski' })
  approvePsychologist(
    @Param('id') id: string,
    @Body() body: { approve: boolean; reason?: string },
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.usersService.approvePsychologist(id, admin.sub, body.approve, body.reason);
  }

  @Patch('psychologists/:id/approval')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Psikolog onayla/reddet (admin)' })
  approvePsychologistByStatus(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; reason?: string },
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.usersService.approvePsychologistByStatus(id, admin.sub, body.status, body.reason);
  }

  @Get('clients/profile')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Danışan profili görüntüle' })
  getClientProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findClientProfile(user.sub);
  }

  @Put('clients/profile')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Danışan profili güncelle' })
  updateClientProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateClientDto,
  ) {
    return this.usersService.updateClientProfile(user.sub, dto);
  }

  @Get('me/export')
  @ApiOperation({ summary: 'KVKK – kişisel verileri dışa aktar (JSON)' })
  exportMyData(@CurrentUser() user: JwtPayload) {
    return this.usersService.exportUserData(user.sub);
  }

  @Delete('me')
  @ApiOperation({ summary: 'KVKK – hesabı sil (soft-delete)' })
  deleteMyAccount(@CurrentUser() user: JwtPayload) {
    return this.usersService.deleteMyAccount(user.sub);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Kullanıcıyı sil (admin)' })
  deleteUser(@Param('id') id: string, @CurrentUser() admin: JwtPayload) {
    return this.usersService.deleteUser(id, admin.sub);
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Kullanıcı şifresini değiştir (admin)' })
  changeUserPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.usersService.adminChangePassword(id, body.newPassword, admin.sub);
  }
}
