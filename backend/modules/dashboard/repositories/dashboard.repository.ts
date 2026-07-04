import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardRepository {
  async getEmployeeCount(): Promise<number> {
    // @ts-ignore
    return prisma.profiles.count();
  }

  async getPresentTodayCount(date: Date): Promise<number> {
    // @ts-ignore
    return prisma.attendance.count({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999))
        },
        status: 'present'
      }
    });
  }

  async getOnLeaveTodayCount(date: Date): Promise<number> {
    // @ts-ignore
    return prisma.leave_requests.count({
      where: {
        status: 'approved',
        start_date: { lte: date },
        end_date: { gte: date }
      }
    });
  }

  async getPendingApprovalsCount(): Promise<number> {
    // @ts-ignore
    return prisma.leave_requests.count({
      where: { status: 'pending' }
    });
  }

  async getPendingApprovals(skip: number = 0, take: number = 5): Promise<any[]> {
    // @ts-ignore
    return prisma.leave_requests.findMany({
      where: { status: 'pending' },
      skip,
      take,
      orderBy: { id: 'desc' }
    });
  }
}
