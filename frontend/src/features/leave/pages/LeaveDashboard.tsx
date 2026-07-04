/**
 * LeaveDashboard.tsx
 *
 * Leave Management Dashboard page.
 * Acts as a self-contained hub for applying for leaves, checking balances,
 * viewing request history, and managing approvals (HR/Admin role).
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - useAuth (expected path: @/hooks/useAuth) — required for role-based views
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Spinner (expected shadcn path: @/components/ui/spinner)
 */

import React, { useState } from "react";
import { CalendarDays, AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { useLeave } from "../hooks/useLeave";
import { LeaveApplicationForm } from "../components/LeaveApplicationForm";
import { LeaveHistoryTable } from "../components/LeaveHistoryTable";
import { LeaveApprovalTable } from "../components/LeaveApprovalTable";
import { Button } from "@/components/ui/button";

// Integration dependency: import { useAuth } from "@/hooks/useAuth";
type AuthenticatedUser = { role: "Employee" | "HR" | "Admin"; id: string };

export function LeaveDashboard() {
  // Replace with `const { user } = useAuth()` once the shared auth module is wired.
  const user: AuthenticatedUser | null = null;
  const currentRole = user?.role;
  
  // List filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  // Fetch leave requests (if employee, server scopes to own; if HR, server returns all)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeave(
    currentRole === "HR" || currentRole === "Admin"
      ? { ...filters, status: "PENDING" }
      : filters
  );

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className="container max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pulse"
        aria-busy="true"
        aria-label="Loading leave dashboard"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
          <div className="h-9 w-32 rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 h-80 rounded-xl bg-muted" />
          <div className="md:col-span-2 h-80 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <main className="container max-w-lg mx-auto px-4 py-16 text-center" role="alert">
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/25 bg-destructive/5 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Unable to load leave dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              {error?.message || "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header section */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" />
            <span>Leave Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {currentRole === "Employee"
              ? "My Leave Dashboard"
              : currentRole === "HR" || currentRole === "Admin"
                ? "HR Leave Approval Center"
                : "Leave Dashboard"}
          </h1>
        </div>
      </header>

      {!user && (
        <section
          className="p-6 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-2.5 shadow-sm"
          aria-label="Authentication integration required"
        >
          <AlertCircle className="h-6 w-6 text-muted-foreground/60 mx-auto" />
          <h2 className="text-sm font-bold text-muted-foreground">Authentication Required</h2>
          <p className="text-xs text-muted-foreground/75 max-w-md mx-auto">
            Wire <code className="text-foreground/80">useAuth</code> from{" "}
            <code className="text-foreground/80">@/hooks/useAuth</code> to enable role-based leave
            dashboard views.
          </p>
        </section>
      )}

      {/* Employee View */}
      {currentRole === "Employee" && (
        <div className="space-y-8">
          {/* Leave Balances Integration State Card */}
          <section
            className="p-6 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-2.5 shadow-sm"
            aria-label="Leave allocations info"
          >
            <CalendarDays className="h-6 w-6 text-muted-foreground/60 mx-auto" />
            <h2 className="text-sm font-bold text-muted-foreground">Leave Balances Unavailable</h2>
            <p className="text-xs text-muted-foreground/75 max-w-md mx-auto">
              Leave balance tracking is currently pending backend integration of the Leave Allocation API. Balance statistics will be automatically displayed once the allocation endpoints are released.
            </p>
          </section>

          {/* Form and History split grid */}
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Left: Apply Form */}
            <div className="lg:col-span-1">
              <LeaveApplicationForm onSuccess={() => refetch()} />
            </div>

            {/* Right: History Table */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Recent Leave Requests
                </h2>
                {isFetching && <span className="text-xs text-muted-foreground/60 animate-pulse">Updating...</span>}
              </div>
              <LeaveHistoryTable
                records={data?.records || []}
                loading={isLoading}
                onActionSuccess={() => refetch()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin/HR View */}
      {(currentRole === "HR" || currentRole === "Admin") && (
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Pending Leave Requests
              </h2>
              <p className="text-xs text-muted-foreground">
                Review and approve/reject employee leave requests.
              </p>
            </div>
            {isFetching && <span className="text-xs text-muted-foreground/60 animate-pulse">Updating...</span>}
          </div>

          <LeaveApprovalTable
            records={data?.records || []}
            loading={isLoading}
            onActionSuccess={() => refetch()}
          />
        </section>
      )}
    </main>
  );
}

