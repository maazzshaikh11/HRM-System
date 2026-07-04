"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    static async getStats(req, res) {
        try {
            const stats = await dashboardService.getDashboardStats();
            res.status(200).json({ data: stats });
        }
        catch (error) {
            console.error('[DashboardController] Error in getStats:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    static async getPendingApprovals(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const list = await dashboardService.getPendingApprovalsList(page, limit);
            res.status(200).json({ data: list, meta: { page, limit } });
        }
        catch (error) {
            console.error('[DashboardController] Error in getPendingApprovals:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
exports.DashboardController = DashboardController;
