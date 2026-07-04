import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useUpdateSalary } from '../hooks/usePayroll';

const salarySchema = z.object({
  wage: z.number().min(1, "Wage must be positive"),
  basic_pct: z.number().min(0).max(100).default(50),
  hra_pct: z.number().min(0).max(100).default(50),
  standard_allowance: z.number().min(0).default(4167),
  pf_employee_pct: z.number().min(0).max(100).default(12),
  pf_employer_pct: z.number().min(0).max(100).default(12),
  professional_tax: z.number().min(0).default(200),
});

type SalaryFormData = z.infer<typeof salarySchema>;

export const SalaryStructureForm = ({ employeeId, initialData }: { employeeId: string, initialData?: any }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: initialData || {
      wage: 50000,
      basic_pct: 50,
      hra_pct: 50,
      standard_allowance: 4167,
      pf_employee_pct: 12,
      pf_employer_pct: 12,
      professional_tax: 200,
    }
  });

  const { mutate: updateSalary, isPending } = useUpdateSalary();

  const wage = watch('wage');
  const basicPct = watch('basic_pct');
  const hraPct = watch('hra_pct');
  const stdAllowance = watch('standard_allowance');

  const { basic, hra, standardAllowance, sum, fixedAllowance } = useMemo(() => {
    const b = (wage * (basicPct / 100)) || 0;
    const h = (b * (hraPct / 100)) || 0;
    const s = stdAllowance || 0;
    const sm = b + h + s;
    const f = Math.max(0, wage - sm);
    return { basic: b, hra: h, standardAllowance: s, sum: sm, fixedAllowance: f };
  }, [wage, basicPct, hraPct, stdAllowance]);

  const onSubmit = (data: SalaryFormData) => {
    updateSalary({ employeeId, data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Structure Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="wage-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Wage (₹)</label>
              <input id="wage-input" type="number" {...register('wage', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
              {errors.wage && <p className="text-red-500 text-sm mt-1">{errors.wage.message}</p>}
            </div>
            
            <div>
              <label htmlFor="basic-pct-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Basic (%)</label>
              <input id="basic-pct-input" type="number" {...register('basic_pct', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
            </div>

            <div>
              <label htmlFor="hra-pct-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">HRA (% of Basic)</label>
              <input id="hra-pct-input" type="number" {...register('hra_pct', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
            </div>

            <div>
              <label htmlFor="standard-allowance-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Standard Allowance (₹)</label>
              <input id="standard-allowance-input" type="number" {...register('standard_allowance', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2">Live Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Basic: ₹{basic.toFixed(2)}</div>
              <div>HRA: ₹{hra.toFixed(2)}</div>
              <div>Standard Allowance: ₹{standardAllowance.toFixed(2)}</div>
              <div>Fixed Allowance: ₹{fixedAllowance.toFixed(2)}</div>
              <div className="col-span-2 pt-2 border-t font-bold mt-2">
                Total Computed: ₹{(basic + hra + standardAllowance + fixedAllowance).toFixed(2)}
              </div>
            </div>
            {sum > wage && (
              <p className="text-red-500 text-sm mt-2 font-medium">⚠️ Warning: Sum of components exceeds total wage.</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isPending || sum > wage} 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Structure'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
