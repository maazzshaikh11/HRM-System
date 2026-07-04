/**
 * LeaveApprovalTable.tsx
 *
 * Displays leave requests pending approval for Admin/HR viewers.
 * Provides inline actions to approve/reject requests with reviewer comments.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Table, TableHeader, TableRow, TableHead, TableBody, TableCell (expected shadcn path: @/components/ui/table)
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Input (expected shadcn path: @/components/ui/input)
 */

import React, { useState } from "react";
import { Check, X, User, AlertCircle, MessageSquare } from "lucide-react";
import type { LeaveSummaryDTO, LeaveDetailDTO } from "../api/leave.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { useUpdateLeave } from "../hooks/useUpdateLeave";

export interface LeaveApprovalTableProps {
  records: (LeaveSummaryDTO | LeaveDetailDTO)[];
  loading?: boolean;
  onActionSuccess?: () => void;
  className?: string;
}

export function LeaveApprovalTable({
  records,
  loading = false,
  onActionSuccess,
  className = "",
}: LeaveApprovalTableProps) {
  const { mutate: updateStatus, isPending } = useUpdateLeave({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  // Track comments separately for each row in local state
  const [commentsState, setCommentsState] = useState<Record<string, string>>({});

  const handleCommentChange = (id: string, value: string) => {
    setCommentsState((prev) => ({ ...prev, [id]: value }));
  };

  const handleAction = (id: string, status: "APPROVED" | "REJECTED") => {
    const comments = commentsState[id]?.trim() || undefined;
    updateStatus({
      id,
      data: { status, comments },
    });
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
        <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
        <p className="text-sm font-semibold text-muted-foreground">No requests pending review</p>
        <p className="text-xs text-muted-foreground/70">All requests are up to date.</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border bg-card/40 ${className}`}>
      {/* Mobile Card-Based Grid Layout */}
      <div className="grid gap-4 p-4 sm:hidden">
        {records.map((record) => {
          const days = calculateDays(record.startDate, record.endDate);
          const isPendingState = record.status === "PENDING";
          return (
            <div
              key={record.id}
              className="p-4 border rounded-lg bg-card space-y-3.5 shadow-sm"
              aria-label={`Leave request review card ${record.id}`}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[120px]">{record.employeeId}</span>
                </div>
                <LeaveStatusBadge status={record.status} />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold text-foreground capitalize">{record.type.toLowerCase()} Leave</span>
                </div>
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
                {"reason" in record && record.reason && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-dashed mt-1.5">
                    <span className="font-semibold text-foreground">Reason:</span>
                    <p className="text-foreground italic bg-muted/40 p-2 rounded">{record.reason}</p>
                  </div>
                )}
              </div>

              {isPendingState && (
                <div className="space-y-3 pt-2 border-t">
                  <Input
                    type="text"
                    placeholder="Enter approval/rejection notes..."
                    value={commentsState[record.id] || ""}
                    onChange={(e) => handleCommentChange(record.id, e.target.value)}
                    className="h-8 text-xs bg-muted/30"
                    aria-label="Comments for leave approval"
                  />
                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAction(record.id, "APPROVED")}
                      disabled={isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold h-8"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(record.id, "REJECTED")}
                      disabled={isPending}
                      className="flex-1 text-xs font-semibold h-8"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
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
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="text-center">Days</TableHead>
            <TableHead>Reason / Notes</TableHead>
            <TableHead className="w-[180px]">Approver Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const days = calculateDays(record.startDate, record.endDate);
            const isPendingState = record.status === "PENDING";
            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium text-xs max-w-[120px] truncate">
                  <div className="flex items-center gap-1.5" title={record.employeeId}>
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{record.employeeId}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold capitalize text-xs">
                  {record.type.toLowerCase()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(record.startDate)} – {formatDate(record.endDate)}
                </TableCell>
                <TableCell className="text-center text-xs font-semibold tabular-nums">
                  {days}
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" title={"reason" in record ? (record as any).reason : ""}>
                  {"reason" in record ? (record as any).reason : <span className="text-muted-foreground italic">Detail view only</span>}
                </TableCell>
                <TableCell>
                  {isPendingState ? (
                    <Input
                      type="text"
                      placeholder="Add comments..."
                      value={commentsState[record.id] || ""}
                      onChange={(e) => handleCommentChange(record.id, e.target.value)}
                      className="h-8 text-xs max-w-[170px]"
                      aria-label={`Comments for leave request ${record.id}`}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={"comments" in record ? (record as any).comments : ""}>
                      {"comments" in record ? (record as any).comments || "—" : "—"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isPendingState ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAction(record.id, "APPROVED")}
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-semibold px-2.5"
                        aria-label={`Approve request ${record.id}`}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(record.id, "REJECTED")}
                        disabled={isPending}
                        className="h-8 text-xs font-semibold px-2.5"
                        aria-label={`Reject request ${record.id}`}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-3">
                      <LeaveStatusBadge status={record.status} />
                    </div>
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
