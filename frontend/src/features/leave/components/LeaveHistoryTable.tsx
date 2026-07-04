/**
 * LeaveHistoryTable.tsx
 *
 * Displays a list of leave requests in a tabular format for employees.
 * Adapts to a list of cards on smaller (mobile) layouts.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Table, TableHeader, TableRow, TableHead, TableBody, TableCell (expected shadcn path: @/components/ui/table)
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Spinner (expected shadcn path: @/components/ui/spinner)
 */

import React from "react";
import { Calendar, Trash2, Clock, AlertCircle } from "lucide-react";
import type { LeaveSummaryDTO, LeaveDetailDTO } from "../api/leave.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { useCancelLeave } from "../hooks/useCancelLeave";

export interface LeaveHistoryTableProps {
  records: (LeaveSummaryDTO | LeaveDetailDTO)[];
  loading?: boolean;
  onActionSuccess?: () => void;
  className?: string;
}

export function LeaveHistoryTable({
  records,
  loading = false,
  onActionSuccess,
  className = "",
}: LeaveHistoryTableProps) {
  const { mutate: cancelLeaveRequest, isPending } = useCancelLeave({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      cancelLeaveRequest(id);
    }
  };

  const calculateDays = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-card animate-pulse space-y-4">
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-card/30">
        <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
        <p className="text-sm font-semibold text-muted-foreground">No leave requests found</p>
        <p className="text-xs text-muted-foreground/70">Adjust filters or submit a new leave request.</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border bg-card/40 ${className}`}>
      {/* Mobile Grid Layout */}
      <div className="grid gap-3.5 p-4 sm:hidden">
        {records.map((record) => {
          const days = calculateDays(record.startDate, record.endDate);
          return (
            <div
              key={record.id}
              className="p-3 border rounded-lg bg-card space-y-2.5 shadow-sm"
              aria-label={`Leave request ${record.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-foreground">
                  {record.type.toLowerCase()} Leave
                </span>
                <LeaveStatusBadge status={record.status} />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-foreground">{days} {days === 1 ? "day" : "days"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(record.startDate)} - {formatDate(record.endDate)}
                  </span>
                </div>
              </div>
              {record.status === "PENDING" && (
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleCancel(record.id)}
                    disabled={isPending}
                    className="h-7 text-xs text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <Table className="hidden sm:table">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead>Requested On</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const days = calculateDays(record.startDate, record.endDate);
            return (
              <TableRow key={record.id}>
                <TableCell className="font-semibold capitalize text-xs">
                  {record.type.toLowerCase()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(record.startDate)} – {formatDate(record.endDate)}
                </TableCell>
                <TableCell className="text-center text-xs font-semibold tabular-nums">
                  {days} {days === 1 ? "day" : "days"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(record.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <LeaveStatusBadge status={record.status} />
                </TableCell>
                <TableCell className="text-right">
                  {record.status === "PENDING" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(record.id)}
                      disabled={isPending}
                      className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/15"
                      aria-label={`Cancel leave request ${record.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Cancel
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
