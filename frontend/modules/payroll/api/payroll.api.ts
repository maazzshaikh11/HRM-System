import { fetchApi } from '../../../lib/api';

export const getPayrollBreakdown = (employeeId: string): Promise<any> => {
  return fetchApi<any>(`/payroll/${employeeId}`);
};

export const updateSalaryStructure = (employeeId: string, data: any): Promise<any> => {
  return fetchApi<any>(`/payroll/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getPayableDays = (employeeId: string, month: number, year: number): Promise<{ payableDays: number }> => {
  return fetchApi<{ payableDays: number }>(`/payroll/${employeeId}/payable-days?month=${month}&year=${year}`);
};
