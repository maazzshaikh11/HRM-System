import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export const SalaryBreakdown = ({ breakdown }: { breakdown: any }) => {
  if (!breakdown) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Monthly Wage</span>
            <span className="font-medium">₹{breakdown.wage.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Basic</span>
            <span className="font-medium text-green-600">+ ₹{breakdown.basic.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">HRA</span>
            <span className="font-medium text-green-600">+ ₹{breakdown.hra.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Standard Allowance</span>
            <span className="font-medium text-green-600">+ ₹{breakdown.standardAllowance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Fixed Allowance</span>
            <span className="font-medium text-green-600">+ ₹{breakdown.fixedAllowance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">PF (Employee)</span>
            <span className="font-medium text-red-600">- ₹{breakdown.pfEmployee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Professional Tax</span>
            <span className="font-medium text-red-600">- ₹{breakdown.professionalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 pt-4">
            <span className="font-bold text-gray-900 dark:text-white">Net Take Home</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹{(breakdown.totalComputed - breakdown.pfEmployee - breakdown.professionalTax).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
