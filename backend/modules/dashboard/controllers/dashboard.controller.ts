import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.status(200).json({ data: stats });
    } catch (error: any) {
      console.error('[DashboardController] Error in getStats:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }

  static async getPendingApprovals(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const list = await dashboardService.getPendingApprovalsList(page, limit);
      res.status(200).json({ data: list, meta: { page, limit } });
    } catch (error: any) {
      console.error('[DashboardController] Error in getPendingApprovals:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}
