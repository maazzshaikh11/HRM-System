"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_service_1 = require("../services/analytics.service");
describe('AnalyticsService', () => {
    let analyticsService;
    beforeEach(() => {
        analyticsService = new analytics_service_1.AnalyticsService();
        analyticsService.repository = {
            getAttendanceByDateRange: jest.fn().mockResolvedValue([
                { date: new Date(), status: 'present' }
            ]),
            getEmployeeDepartmentDistribution: jest.fn().mockResolvedValue([
                { department: 'Engineering', count: 5 }
            ])
        };
    });
    it('should get attendance trends', async () => {
        const trends = await analyticsService.getAttendanceTrends(7);
        expect(trends.length).toBeGreaterThan(0);
    });
    it('should get department distribution', async () => {
        const distro = await analyticsService.getDepartmentDistribution();
        expect(distro[0].department).toBe('Engineering');
        expect(distro[0].count).toBe(5);
    });
});
