export interface IAttendanceTrend {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

export interface IDepartmentDistribution {
  department: string;
  count: number;
}
