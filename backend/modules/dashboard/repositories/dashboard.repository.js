"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardRepository {
    async getEmployeeCount() {
        // @ts-ignore
        return prisma.profiles.count();
    }
    async getPresentTodayCount(date) {
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
    async getOnLeaveTodayCount(date) {
        // @ts-ignore
        return prisma.leave_requests.count({
            where: {
                status: 'approved',
                start_date: { lte: date },
                end_date: { gte: date }
            }
        });
    }
    async getPendingApprovalsCount() {
        // @ts-ignore
        return prisma.leave_requests.count({
            where: { status: 'pending' }
        });
    }
    async getPendingApprovals(skip = 0, take = 5) {
        // @ts-ignore
        return prisma.leave_requests.findMany({
            where: { status: 'pending' },
            skip,
            take,
            orderBy: { id: 'desc' }
        });
    }
}
exports.DashboardRepository = DashboardRepository;
