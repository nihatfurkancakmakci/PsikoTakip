import {
  Controller, Get, Put, Patch, Delete, Body, Param, Query, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role, PsychologistApprovalStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdatePsychologistDto } from './dto/update-psychologist.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

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
}
