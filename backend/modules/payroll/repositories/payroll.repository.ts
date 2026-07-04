import { PrismaClient } from '@prisma/client';
import { ISalaryStructure } from '../types/payroll.types';

const prisma = new PrismaClient();

export class PayrollRepository {
  async findByEmployeeId(employeeId: string): Promise<any> {
    // @ts-ignore - Assuming schema will be generated
    return prisma.salary_structures.findFirst({
      where: { employee_id: employeeId },
    });
  }

  async upsert(employeeId: string, data: Partial<ISalaryStructure>): Promise<any> {
    // @ts-ignore
    const existing = await prisma.salary_structures.findFirst({
      where: { employee_id: employeeId }
    });

    if (existing) {
      // @ts-ignore
      return prisma.salary_structures.update({
        where: { id: existing.id },
        data,
      });
    }

    // @ts-ignore
    return prisma.salary_structures.create({
      data: {
        employee_id: employeeId,
        ...data,
      } as any,
    });
  }

  async getAttendanceDays(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    // @ts-ignore
    const attendance = await prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: { gte: startDate, lte: endDate },
        status: 'present',
      },
    });
    return attendance.length;
  }

  async getUnpaidLeaveDays(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    // @ts-ignore
    const leaves = await prisma.leave_requests.findMany({
      where: {
        employee_id: employeeId,
        type: 'unpaid',
        status: 'approved',
        start_date: { gte: startDate },
        end_date: { lte: endDate },
      },
    });
    return leaves.reduce((total: number, leave: any) => total + (leave.days || 0), 0);
  }
}
