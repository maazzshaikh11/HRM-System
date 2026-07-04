import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { EmployeeLayout } from "@/layouts/EmployeeLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

// ── Page Loader Fallback ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]" aria-busy="true">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

function LazyPage({ component: Component }: { component: React.ComponentType }) {
  return <Suspense fallback={<PageLoader />}><Component /></Suspense>;
}

// ── Lazy Pages ────────────────────────────────────────────────────────────────
// Auth
const LoginPlaceholder = lazy(() => Promise.resolve({ default: () => <div>Login Module — wire to auth feature</div> }));

// Dashboard (Member 2)
const EmployeeDashboard = lazy(() => import("@/features/dashboard/pages/EmployeeDashboard"));
const AdminDashboard = lazy(() => import("@/features/dashboard/pages/AdminDashboard"));

// Employee / Profile (Member 2)
const ProfilePage = lazy(() => import("@/features/employee/pages/ProfilePage"));

// Attendance (Member 3 — already implemented)
const AttendanceDashboard = lazy(() => import("@/features/attendance/pages/AttendanceDashboard"));

// Leave (Member 3 — already implemented)
const LeaveDashboard = lazy(() => import("@/features/leave/pages/LeaveDashboard"));

// Payroll (Member 2)
const PayrollPage = lazy(() => import("@/features/payroll/pages/PayrollPage"));

// Placeholders for remaining modules
const SettingsPlaceholder = () => <div className="p-8 text-muted-foreground">Settings module coming soon.</div>;
const NotFoundPlaceholder = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold">404 — Page Not Found</h1></div>;
const ForbiddenPlaceholder = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold">403 — Forbidden</h1></div>;

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
            element: <LazyPage component={EmployeeDashboard} />,
          },
          {
            path: "profile",
            element: <LazyPage component={ProfilePage} />,
          },
          {
            path: "attendance",
            element: <LazyPage component={AttendanceDashboard} />,
          },
          {
            path: "leave",
            element: <LazyPage component={LeaveDashboard} />,
          },
          {
            path: "payroll",
            element: <LazyPage component={PayrollPage} />,
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
                    element: <LazyPage component={AdminDashboard} />,
                  },
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
