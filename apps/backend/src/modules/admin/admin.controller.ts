import {
  Controller, Get, Patch, Param, Body, Query,
  UseGuards, DefaultValuePipe, ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Sistem istatistikleri (admin)' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Tüm kullanıcılar (admin)' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('role') role?: Role,
  ) {
    return this.adminService.findAllUsers(page, limit, role);
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: 'Kullanıcı aktif/pasif yap (admin)' })
  toggleUserActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleUserActive(id, body.isActive);
  }

  @Get('psychologists/pending')
  @ApiOperation({ summary: 'Onay bekleyen psikologlar (admin)' })
  getPendingPsychologists() {
    return this.adminService.getPendingPsychologists();
  }
}
