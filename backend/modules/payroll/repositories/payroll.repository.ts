import { PrismaClient } from '@prisma/client';
import { ISalaryStructure } from '../types/payroll.types';

const prisma = new PrismaClient();

export class PayrollRepository {
  async findByEmployeeId(employeeId: string): Promise<any> {
    return prisma.salary_structures.findFirst({
      where: { user_id: parseInt(employeeId, 10) },
    });
  }

  async upsert(employeeId: string, data: Partial<ISalaryStructure>): Promise<any> {
    const existing = await prisma.salary_structures.findFirst({
      where: { user_id: parseInt(employeeId, 10) }
    });

    const payload = { ...data } as any;
    delete payload.id;
    delete payload.employee_id;

    if (existing) {
      return prisma.salary_structures.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    return prisma.salary_structures.create({
      data: {
        user_id: parseInt(employeeId, 10),
        ...payload,
      },
    });
  }

  async getAttendanceDays(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    const attendance = await prisma.attendance.findMany({
      where: {
        user_id: parseInt(employeeId, 10),
        date: { gte: startDate, lte: endDate },
        status: 'present',
      },
    });
    return attendance.length;
  }

  async getUnpaidLeaveDays(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    const leaves = await prisma.leave_requests.findMany({
      where: {
        user_id: parseInt(employeeId, 10),
        type: 'unpaid',
        status: 'approved',
        from_date: { gte: startDate },
        to_date: { lte: endDate },
      },
    });
    return leaves.reduce((total: number, leave: any) => total + (leave.days || 0), 0);
  }
}
