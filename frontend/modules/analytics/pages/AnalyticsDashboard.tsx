import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAttendanceTrends, useDepartmentDistribution } from '../hooks/useAnalytics';
import { Spinner } from '@/components/common/Spinner';

export const AnalyticsDashboard = () => {
  const { data: trends, isLoading: trendsLoading } = useAttendanceTrends(7);
  const { data: distro, isLoading: distroLoading } = useDepartmentDistribution();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-64 flex items-center justify-center"><Spinner /></div>
            ) : (
              <div className="h-64 w-full flex items-end gap-2 pt-4">
                {/* Mockup for Recharts/Chart.js */}
                {trends?.map((t: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm" 
                      style={{ height: `${(t.present / 100) * 100}%`, minHeight: '10%' }}
                    ></div>
                    <div className="w-full bg-primary rounded-t-sm" style={{ height: `${(t.absent / 100) * 100}%` }}></div>
                    <p className="text-xs text-center mt-2 text-gray-500 truncate">{t.date}</p>
                    
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                      Present: {t.present} | Absent: {t.absent}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {distroLoading ? (
              <div className="h-64 flex items-center justify-center"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                {distro?.map((d: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{d.department}</span>
                      <span className="text-gray-500">{d.count} Emp</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, d.count * 10)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
