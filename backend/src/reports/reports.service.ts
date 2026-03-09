import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    const totalClients = await this.prisma.user.count({ where: { role: 'CLIENT' } });
    const totalStaff = await this.prisma.user.count({ where: { role: 'STAFF' } });
    const totalAppointments = await this.prisma.appointment.count();
    const todayAppointments = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    const totalSales = await this.prisma.sale.aggregate({
      _sum: { total: true },
    });

    const recentSales = await this.prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    return {
      totalClients,
      totalStaff,
      totalAppointments,
      todayAppointments,
      totalRevenue: totalSales._sum.total || 0,
      recentSales,
    };
  }
}
