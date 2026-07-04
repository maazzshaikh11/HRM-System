import { DashboardRepository } from '../repositories/dashboard.repository';
import { IDashboardStats } from '../types/dashboard.types';

export class DashboardService {
  private repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async getDashboardStats(): Promise<IDashboardStats> {
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

  async getPendingApprovalsList(page: number, limit: number): Promise<any[]> {
    const skip = (page - 1) * limit;
    return this.repository.getPendingApprovals(skip, limit);
  }
}
