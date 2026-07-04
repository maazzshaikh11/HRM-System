import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayrollBreakdown, updateSalaryStructure, getPayableDays } from '../api/payroll.api';

export const usePayrollBreakdown = (employeeId: string) => {
  return useQuery({
    queryKey: ['payroll', employeeId],
    queryFn: () => getPayrollBreakdown(employeeId),
    enabled: !!employeeId,
  });
};

export const usePayableDays = (employeeId: string, month: number, year: number) => {
  return useQuery({
    queryKey: ['payroll', employeeId, 'payableDays', month, year],
    queryFn: () => getPayableDays(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
  });
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) => updateSalaryStructure(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', variables.employeeId] });
    },
  });
};
