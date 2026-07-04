"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AnalyticsRepository {
    async getAttendanceByDateRange(startDate, endDate) {
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
    async getEmployeeDepartmentDistribution() {
        const users = await prisma.users.findMany({
            include: { department: true }
        });
        const distro = {};
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
exports.AnalyticsRepository = AnalyticsRepository;
