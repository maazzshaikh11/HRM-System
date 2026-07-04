import { usePayrollBreakdown } from '../hooks/usePayroll';
import { SalaryStructureForm } from '../components/SalaryStructureForm';
import { SalaryBreakdown } from '../components/SalaryBreakdown';
import { Spinner } from '@/components/common/Spinner';

// Assuming we get this from an auth context or router param
const CURRENT_EMPLOYEE_ID = 'emp-123';
const IS_ADMIN = true; // Hardcoded for mockup, replace with actual auth logic

export const SalaryInfoPage = () => {
  const { data: breakdown, isLoading, isError } = usePayrollBreakdown(CURRENT_EMPLOYEE_ID);

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  if (isError) return <div className="p-8 text-red-500">Failed to load salary information.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Information</h1>
        <p className="text-gray-500 mt-1">Manage and view payroll details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {IS_ADMIN && (
          <div>
            <SalaryStructureForm employeeId={CURRENT_EMPLOYEE_ID} initialData={breakdown} />
          </div>
        )}
        
        <div>
          <SalaryBreakdown breakdown={breakdown} />
        </div>
      </div>
    </div>
  );
};
