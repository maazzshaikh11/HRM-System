import { AnalyticsRepository } from '../repositories/analytics.repository';
import { IAttendanceTrend, IDepartmentDistribution } from '../types/analytics.types';

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor() {
    this.repository = new AnalyticsRepository();
  }

  async getAttendanceTrends(days: number): Promise<IAttendanceTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendanceRecords = await this.repository.getAttendanceByDateRange(startDate, endDate);

    const trendsMap: Record<string, IAttendanceTrend> = {};
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      trendsMap[dateStr] = { date: dateStr, present: 0, absent: 0, leave: 0 };
    }

    for (const record of attendanceRecords) {
      const dateStr = record.date.toISOString().split('T')[0];
      if (trendsMap[dateStr]) {
        if (record.status === 'present') trendsMap[dateStr].present++;
        else if (record.status === 'absent') trendsMap[dateStr].absent++;
        else if (record.status === 'leave') trendsMap[dateStr].leave++;
      }
    }

    return Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getDepartmentDistribution(): Promise<IDepartmentDistribution[]> {
    return this.repository.getEmployeeDepartmentDistribution();
  }
}
