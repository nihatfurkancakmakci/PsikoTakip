import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SessionsService } from './sessions.service';
import { CreateSessionNoteDto } from './dto/create-session-note.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('notes')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Seans notu oluştur (psikolog)' })
  createNote(@Body() dto: CreateSessionNoteDto, @CurrentUser() user: JwtPayload) {
    return this.sessionsService.createNote(dto, user.sub);
  }

  @Get('notes/:appointmentId')
  @ApiOperation({ summary: 'Seans notunu görüntüle (psikolog/danışan/admin)' })
  findNote(@Param('appointmentId') appointmentId: string, @CurrentUser() user: JwtPayload) {
    return this.sessionsService.findNote(appointmentId, user.sub, user.role as Role);
  }

  @Patch('notes/:id')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Seans notunu güncelle (psikolog)' })
  updateNote(
    @Param('id') id: string,
    @Body() body: { content?: string; isSharedWithClient?: boolean; emotionalState?: string; goals?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.sessionsService.updateNote(id, body, user.sub);
  }

  @Get('clients/:clientUserId/notes')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Danışana ait tüm seans notları (psikolog)' })
  findClientNotes(
    @Param('clientUserId') clientUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.sessionsService.findClientNotes(clientUserId, user.sub);
  }
}
