/**
 * LeaveApprovalPage.tsx
 *
 * Dedicated Leave Approval page for Admin/HR users.
 * Allows managing, filtering, paging, and approving/rejecting all leave requests.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - AlertCircle, ShieldAlert, etc. (icons)
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert, RefreshCw, AlertCircle } from "lucide-react";
import { useLeave } from "../hooks/useLeave";
import { LeaveFilters } from "../components/LeaveFilters";
import { LeaveApprovalTable } from "../components/LeaveApprovalTable";
import { Button } from "@/components/ui/button";
import type { LeaveFilters as FiltersType } from "../api/leave.api";

export function LeaveApprovalPage() {
  // Setup filters default: page 1, 10 items, defaults to PENDING status
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    status: "PENDING",
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
      {/* Header section */}
      <header className="flex flex-col gap-1 pb-5 border-b border-border/55">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" />
          <span>HR Administrative Center</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
          Leave Approval Requests
        </h1>
        <p className="text-xs text-muted-foreground">
          Review, approve, or reject submitted employee leave request records.
        </p>
      </header>

      {/* Filter Section */}
      <section aria-label="Approvals filter panel">
        <LeaveFilters
          filters={filters}
          onChange={handleFilterChange}
          showEmployeeFilter={true} // Always show in approval page
        />
      </section>

      {/* Main Table / Grid Section */}
      <section className="space-y-4" aria-label="Approval requests logs">
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
              <p className="text-sm font-semibold text-foreground">Failed to load requests</p>
              <p className="text-xs text-muted-foreground">{error?.message || "Please check your network and try again."}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        ) : (
          <LeaveApprovalTable
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
