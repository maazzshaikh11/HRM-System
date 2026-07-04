/**
 * AttendanceHistoryTable.tsx
 *
 * Displays a paginated, sortable table of attendance history records.
 * Uses the `useAttendance` hook internally to manage data fetching,
 * pagination, and sorting dynamically against the backend API.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Table, TableBody, TableCell, TableHead, TableHeader, TableRow (from @/components/ui/table)
 *   - Button (from @/components/ui/button)
 *   - Badge (from @/components/ui/badge)
 */

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAttendance } from "../hooks/useAttendance";
import type { AttendanceSummaryDTO, AttendanceStatus } from "../api/attendance.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Status Badge Mapping
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  PRESENT:  { label: "Present",  className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  LATE:     { label: "Late",     className: "bg-amber-500/15  text-amber-600  dark:text-amber-400  border-amber-500/20"  },
  HALF_DAY: { label: "Half Day", className: "bg-blue-500/15   text-blue-600   dark:text-blue-400   border-blue-500/20"   },
  ABSENT:   { label: "Absent",   className: "bg-rose-500/15   text-rose-600   dark:text-rose-400   border-rose-500/20"   },
  LEAVE:    { label: "On Leave", className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  HOLIDAY:  { label: "Holiday",  className: "bg-sky-500/15    text-sky-600    dark:text-sky-400    border-sky-500/20"    },
};

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "—";
  return new Date(timeStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHours(hours: number | null): string {
  if (hours == null) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AttendanceHistoryTableProps {
  /** Optional filter to scope records to a specific employee (Admin / HR use-case). */
  employeeId?: string;
  /** Number of items to display per page (default: 10). */
  pageSize?: number;
  /** Additional custom class styles for outer table wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttendanceHistoryTable({
  employeeId,
  pageSize = 10,
  className = "",
}: AttendanceHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"date:asc" | "date:desc">("date:desc");

  // Fetch Attendance Records
  const { data, isLoading, isError, error, refetch, isFetching } = useAttendance(
    {
      employeeId,
      page,
      limit: pageSize,
      sort,
    },
    true
  );

  const records = data?.records || [];
  const meta = data?.pagination;

  // Toggle Sorting direction
  const handleSortToggle = () => {
    setSort((prev) => (prev === "date:desc" ? "date:asc" : "date:desc"));
    setPage(1); // Reset page to first page
  };

  // Loading skeleton placeholder
  if (isLoading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`} aria-busy="true">
        <div className="rounded-lg border border-border bg-card">
          <div className="h-10 border-b border-border bg-muted/40" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-border last:border-0">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State with Retry option
  if (isError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/20 bg-destructive/5 space-y-3 ${className}`} role="alert">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">Could not load history</p>
          <p className="text-xs text-muted-foreground">{error?.message || "An unexpected error occurred."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className={`text-center p-12 border border-dashed rounded-lg bg-card ${className}`} role="status">
        <p className="text-sm font-medium text-muted-foreground">No attendance records found</p>
        <p className="text-xs text-muted-foreground/75 mt-1">There is no history available for the selected range.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Wrapper (Responsive overflow) */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px] w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                {/* Sortable Date Header */}
                <TableHead className="w-[180px]">
                  <button
                    type="button"
                    onClick={handleSortToggle}
                    className="inline-flex items-center gap-1.5 hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-colors"
                    aria-label={`Sort by date, current direction: ${sort === "date:desc" ? "descending" : "ascending"}`}
                  >
                    <span>Date</span>
                    {sort === "date:desc" ? (
                      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Check In</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Check Out</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Working Hours</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Overtime</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Late Minutes</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const statusCfg = STATUS_CONFIG[record.status] || {
                  label: record.status,
                  className: "bg-muted text-muted-foreground border-muted",
                };

                return (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm tabular-nums">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell className="text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatTime(record.checkIn)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {formatTime(record.checkOut)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {formatHours(record.workingHours)}
                    </TableCell>
                    <TableCell className="text-sm text-violet-600 dark:text-violet-400 tabular-nums">
                      {record.overtimeHours && record.overtimeHours > 0 ? formatHours(record.overtimeHours) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-amber-600 dark:text-amber-400 tabular-nums">
                      {record.lateMinutes && record.lateMinutes > 0 ? `${record.lateMinutes}m` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`px-2 py-0.5 text-xs font-semibold border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {meta && meta.pages > 1 && (
        <nav
          className="flex items-center justify-between px-1"
          aria-label="Pagination Navigation"
        >
          <div className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{meta.page}</span> of{" "}
            <span className="font-semibold text-foreground">{meta.pages}</span> (Total{" "}
            <span className="font-semibold text-foreground">{meta.total}</span> records)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={meta.page === meta.pages}
              aria-label="Next Page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
