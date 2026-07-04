"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const dashboard_repository_1 = require("../repositories/dashboard.repository");
class DashboardService {
    repository;
    constructor() {
        this.repository = new dashboard_repository_1.DashboardRepository();
    }
    async getDashboardStats() {
        const today = new Date();
        const [totalEmployees, presentToday, onLeaveToday, pendingApprovals] = await Promise.all([
            this.repository.getEmployeeCount(),
            this.repository.getPresentTodayCount(new Date(today)),
            this.repository.getOnLeaveTodayCount(new Date(today)),
            this.repository.getPendingApprovalsCount()
        ]);
        return {
            totalEmployees,
            presentToday,
            onLeaveToday,
            pendingApprovals
        };
    }
    async getPendingApprovalsList(page, limit) {
        const skip = (page - 1) * limit;
        return this.repository.getPendingApprovals(skip, limit);
    }
}
exports.DashboardService = DashboardService;
