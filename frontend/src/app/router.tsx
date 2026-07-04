import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { EmployeeLayout } from "@/layouts/EmployeeLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

import { AdminDashboard } from '../../modules/dashboard/pages/AdminDashboard';
import { EmployeeDashboard } from '../../modules/dashboard/pages/EmployeeDashboard';
import { AnalyticsDashboard } from '../../modules/analytics/pages/AnalyticsDashboard';
import { SalaryInfoPage } from '../../modules/payroll/pages/SalaryInfo';

// Lazy loading placeholders
const ProfilePlaceholder = () => <div>Profile Module</div>;
const AttendancePlaceholder = () => <div>Attendance Module</div>;
const LeavePlaceholder = () => <div>Leave Module</div>;
const SettingsPlaceholder = () => <div>Settings Module</div>;
const LoginPlaceholder = () => <div>Login Module</div>;
const NotFoundPlaceholder = () => <div>404 Not Found</div>;
const ForbiddenPlaceholder = () => <div>403 Forbidden</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPlaceholder />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "dashboard",
            element: <EmployeeDashboard />,
          },
          {
            path: "analytics",
            element: <AnalyticsDashboard />,
          },
          {
            path: "profile",
            element: <ProfilePlaceholder />,
          },
          {
            path: "attendance",
            element: <AttendancePlaceholder />,
          },
          {
            path: "leave",
            element: <LeavePlaceholder />,
          },
          {
            path: "payroll",
            element: <SalaryInfoPage />,
          },
          {
            path: "settings",
            element: <SettingsPlaceholder />,
          },
          {
            element: <EmployeeLayout />,
            children: [
              // Specific employee-only routes
            ]
          },
          {
            element: <ProtectedRoute allowedRoles={["Admin"]} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  {
                    path: "admin/dashboard",
                    element: <AdminDashboard />
                  }
                ]
              }
            ]
          }
        ],
      },
    ],
  },
  {
    path: "/forbidden",
    element: <ForbiddenPlaceholder />,
  },
  {
    path: "*",
    element: <NotFoundPlaceholder />,
  },
]);
