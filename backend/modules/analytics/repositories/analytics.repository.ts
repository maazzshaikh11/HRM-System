import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsRepository {
  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    // @ts-ignore
    return prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        status: true
      }
    });
  }

  async getEmployeeDepartmentDistribution(): Promise<any[]> {
    const users = await prisma.users.findMany({
      include: { department: true }
    });

    const distro: Record<string, number> = {};
    for (const u of users) {
      const dept = u.department?.name || 'Unassigned';
      distro[dept] = (distro[dept] || 0) + 1;
    }

    return Object.keys(distro).map(dept => ({
      department: dept,
      count: distro[dept]
    }));
  }
}
