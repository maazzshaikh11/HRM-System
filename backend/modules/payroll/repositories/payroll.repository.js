"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PayrollRepository {
    async findByEmployeeId(employeeId) {
        return prisma.salary_structures.findFirst({
            where: { user_id: parseInt(employeeId, 10) },
        });
    }
    async upsert(employeeId, data) {
        const existing = await prisma.salary_structures.findFirst({
            where: { user_id: parseInt(employeeId, 10) }
        });
        const payload = { ...data };
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
    async getAttendanceDays(employeeId, startDate, endDate) {
        const attendance = await prisma.attendance.findMany({
            where: {
                user_id: parseInt(employeeId, 10),
                date: { gte: startDate, lte: endDate },
                status: 'present',
            },
        });
        return attendance.length;
    }
    async getUnpaidLeaveDays(employeeId, startDate, endDate) {
        const leaves = await prisma.leave_requests.findMany({
            where: {
                user_id: parseInt(employeeId, 10),
                type: 'unpaid',
                status: 'approved',
                from_date: { gte: startDate },
                to_date: { lte: endDate },
            },
        });
        return leaves.reduce((total, leave) => total + (leave.days || 0), 0);
    }
}
exports.PayrollRepository = PayrollRepository;
