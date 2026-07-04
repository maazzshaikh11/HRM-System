"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = require("../services/dashboard.service");
describe('DashboardService', () => {
    let dashboardService;
    beforeEach(() => {
        dashboardService = new dashboard_service_1.DashboardService();
        dashboardService.repository = {
            getEmployeeCount: jest.fn().mockResolvedValue(100),
            getPresentTodayCount: jest.fn().mockResolvedValue(80),
            getOnLeaveTodayCount: jest.fn().mockResolvedValue(5),
            getPendingApprovalsCount: jest.fn().mockResolvedValue(10),
            getPendingApprovals: jest.fn().mockResolvedValue([])
        };
    });
    it('should get correct dashboard stats', async () => {
        const stats = await dashboardService.getDashboardStats();
        expect(stats.totalEmployees).toBe(100);
        expect(stats.presentToday).toBe(80);
        expect(stats.onLeaveToday).toBe(5);
        expect(stats.pendingApprovals).toBe(10);
    });
});
