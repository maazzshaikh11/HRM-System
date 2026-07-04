/**
 * LeaveHistoryPage.tsx
 *
 * Dedicated History page for Leave Requests.
 * Integrates LeaveFilters, LeaveHistoryTable, pagination, and loading/error states.
 * Supports viewing own requests (Employee) or all requests (Admin/HR).
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - useAuth (expected path: @/hooks/useAuth) — required for admin/HR filter visibility
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Spinner (expected shadcn path: @/components/ui/spinner)
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, History, RefreshCw, AlertCircle } from "lucide-react";
import { useLeave } from "../hooks/useLeave";
import { LeaveFilters } from "../components/LeaveFilters";
import { LeaveHistoryTable } from "../components/LeaveHistoryTable";
import { Button } from "@/components/ui/button";
import type { LeaveFilters as FiltersType } from "../api/leave.api";

// Integration dependency: import { useAuth } from "@/hooks/useAuth";
type AuthenticatedUser = { role: "Employee" | "HR" | "Admin"; id: string };

export function LeaveHistoryPage() {
  // Replace with `const { user } = useAuth()` once the shared auth module is wired.
  const user: AuthenticatedUser | null = null;
  const isAdminOrHR = user?.role === "HR" || user?.role === "Admin";

  // Filters State
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    status: undefined,
    type: undefined,
    startDate: undefined,
    endDate: undefined,
    employeeId: undefined,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeave(filters);

  const pagination = data?.pagination;

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border/55">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Leave Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Leave Request History
          </h1>
        </div>
      </header>

      {/* Filter Section */}
      <section aria-label="Filters">
        <LeaveFilters
          filters={filters}
          onChange={handleFilterChange}
          showEmployeeFilter={isAdminOrHR}
        />
      </section>


      {/* Main Table / Grid Section */}
      <section className="space-y-4" aria-label="History logs">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Showing {data?.records?.length || 0} of {pagination?.total || 0} records
          </p>
          {isFetching && <span className="text-xs text-muted-foreground/60 animate-pulse">Refreshing data...</span>}
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Failed to load history log</p>
              <p className="text-xs text-muted-foreground">{error?.message || "Please check your network and try again."}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        ) : (
          <LeaveHistoryTable
            records={data?.records || []}
            loading={isLoading}
            onActionSuccess={() => refetch()}
          />
        )}
      </section>

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-border/40 pt-4 mt-2"
          aria-label="Pagination Navigation"
        >
          <div className="text-xs text-muted-foreground font-medium">
            Page <span className="text-foreground font-semibold">{pagination.page}</span> of{" "}
            <span className="text-foreground font-semibold">{pagination.pages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isFetching}
              className="h-8 text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isFetching}
              className="h-8 text-xs font-semibold"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </nav>
      )}
    </main>
  );
}
