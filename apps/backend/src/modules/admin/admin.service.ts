import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Role, AppointmentStatus, PsychologistApprovalStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalClients,
      totalPsychologists,
      pendingPsychologists,
      totalAppointments,
      completedAppointments,
      totalTests,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.client.count(),
      this.prisma.psychologist.count({ where: { approvalStatus: PsychologistApprovalStatus.APPROVED } }),
      this.prisma.psychologist.count({ where: { approvalStatus: PsychologistApprovalStatus.PENDING_APPROVAL } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.prisma.testResult.count({ where: { completedAt: { not: null } } }),
    ]);

    return {
      totalUsers,
      totalClients,
      totalPsychologists,
      pendingPsychologists,
      totalAppointments,
      completedAppointments,
      completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      totalTestsCompleted: totalTests,
    };
  }

  async findAllUsers(page = 1, limit = 20, role?: Role) {
    const where = role ? { role } : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, isVerified: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });
  }

  async getPendingPsychologists() {
    return this.prisma.psychologist.findMany({
      where: { approvalStatus: PsychologistApprovalStatus.PENDING_APPROVAL },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } },
      },
    });
  }
}
