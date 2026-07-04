import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h4 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</h4>
          </div>
          {icon && <div className="p-3 bg-primary/10 rounded-full text-primary">{icon}</div>}
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
