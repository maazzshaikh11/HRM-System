"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const analytics_repository_1 = require("../repositories/analytics.repository");
class AnalyticsService {
    repository;
    constructor() {
        this.repository = new analytics_repository_1.AnalyticsRepository();
    }
    async getAttendanceTrends(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const attendanceRecords = await this.repository.getAttendanceByDateRange(startDate, endDate);
        const trendsMap = {};
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            trendsMap[dateStr] = { date: dateStr, present: 0, absent: 0, leave: 0 };
        }
        for (const record of attendanceRecords) {
            const dateStr = record.date.toISOString().split('T')[0];
            if (trendsMap[dateStr]) {
                if (record.status === 'present')
                    trendsMap[dateStr].present++;
                else if (record.status === 'absent')
                    trendsMap[dateStr].absent++;
                else if (record.status === 'leave')
                    trendsMap[dateStr].leave++;
            }
        }
        return Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));
    }
    async getDepartmentDistribution() {
        return this.repository.getEmployeeDepartmentDistribution();
    }
}
exports.AnalyticsService = AnalyticsService;
