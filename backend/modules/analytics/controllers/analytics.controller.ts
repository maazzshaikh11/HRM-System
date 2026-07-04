import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static async getAttendanceTrends(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trends = await analyticsService.getAttendanceTrends(days);
      res.status(200).json({ data: trends });
    } catch (error: any) {
      console.error('[AnalyticsController] Error in getAttendanceTrends:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }

  static async getDepartmentDistro(req: Request, res: Response): Promise<void> {
    try {
      const distro = await analyticsService.getDepartmentDistribution();
      res.status(200).json({ data: distro });
    } catch (error: any) {
      console.error('[AnalyticsController] Error in getDepartmentDistro:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}
