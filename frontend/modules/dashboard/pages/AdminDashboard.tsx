import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/StatCard';
import { PendingApprovalsWidget } from '../components/PendingApprovalsWidget';
import { Spinner } from '@/components/common/Spinner';

export const AdminDashboard = () => {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  if (isError) return <div className="p-8 text-red-500">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats?.totalEmployees || 0} />
        <StatCard title="Present Today" value={stats?.presentToday || 0} />
        <StatCard title="On Leave Today" value={stats?.onLeaveToday || 0} />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PendingApprovalsWidget />
        </div>
        <div className="lg:col-span-1">
          {/* Analytics Chart Widget could go here */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-64 flex items-center justify-center text-gray-500">
            [Chart Area Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
};
