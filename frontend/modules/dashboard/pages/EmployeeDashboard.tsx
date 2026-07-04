import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const EmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              👤
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">My Profile</h3>
            <p className="text-sm text-gray-500 mt-1">View or edit your information</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
              📅
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">Check in and view history</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              🏖️
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Leave Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Apply for time off</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              💰
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Payroll</h3>
            <p className="text-sm text-gray-500 mt-1">View your salary info</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today at a Glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-green-600 text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Checked In
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                09:00 AM
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Paid Leave</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  12 Days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
