"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
class AnalyticsController {
    static async getAttendanceTrends(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const trends = await analyticsService.getAttendanceTrends(days);
            res.status(200).json({ data: trends });
        }
        catch (error) {
            console.error('[AnalyticsController] Error in getAttendanceTrends:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    static async getDepartmentDistro(req, res) {
        try {
            const distro = await analyticsService.getDepartmentDistribution();
            res.status(200).json({ data: distro });
        }
        catch (error) {
            console.error('[AnalyticsController] Error in getDepartmentDistro:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
