import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentForClientDto } from './dto/create-appointment-for-client.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Randevu oluştur (danışan)' })
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: JwtPayload) {
    return this.appointmentsService.create(user.sub, dto);
  }

  @Post('for-client')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Danışana randevu oluştur (psikolog)' })
  createForClient(@Body() dto: CreateAppointmentForClientDto, @CurrentUser() user: JwtPayload) {
    return this.appointmentsService.createForClient(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Kendi randevularım' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.appointmentsService.findMyAppointments(user.sub, user.role as Role);
  }

  @Get('slots')
  @ApiOperation({ summary: 'Psikolog müsait slotları' })
  getSlots(
    @Query('psychologistId') psychologistId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(psychologistId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Randevu detayı' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.appointmentsService.findById(id, user.sub, user.role as Role);
  }

  @Patch(':id/reschedule')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Randevuyu yeniden zamanla (danışan)' })
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appointmentsService.reschedule(id, dto, user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Randevu durumunu güncelle (onayla/iptal et)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appointmentsService.updateStatus(id, dto, user.sub, user.role as Role);
  }
}
