/**
 * LeaveCard.tsx
 *
 * Displays detailed information about a single leave request in a card format.
 * Provides a "Cancel Request" action for pending requests (only for employees).
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Card, CardContent, CardHeader, CardTitle, CardFooter (expected shadcn path: @/components/ui/card)
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Dialog alerts or loading spinners
 */

import React from "react";
import { Calendar, MessageSquare, User, Clock, CheckCircle, XCircle } from "lucide-react";
import type { LeaveDetailDTO } from "../api/leave.api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { useCancelLeave } from "../hooks/useCancelLeave";

export interface LeaveCardProps {
  leave: LeaveDetailDTO;
  /** Whether the current viewer is the owner of the leave (allows cancellation) */
  isOwner?: boolean;
  /** Optional callback after status changes (e.g. cancellation) */
  onStatusChange?: () => void;
  className?: string;
}

export function LeaveCard({
  leave,
  isOwner = true,
  onStatusChange,
  className = "",
}: LeaveCardProps) {
  const { mutate: cancelLeaveRequest, isPending } = useCancelLeave({
    onSuccess: () => {
      onStatusChange?.();
    },
  });

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      cancelLeaveRequest(leave.id);
    }
  };

  const formattedStartDate = new Date(leave.startDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedEndDate = new Date(leave.endDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Calculate duration in days (inclusive)
  const duration = Math.ceil(
    Math.abs(new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <Card className={`shadow-sm border border-border/80 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border/40">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Request #{leave.id.substring(0, 8)}
          </p>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="capitalize">{leave.type.toLowerCase()} Leave</span>
            <span className="text-xs font-normal text-muted-foreground">({duration} {duration === 1 ? "day" : "days"})</span>
          </CardTitle>
        </div>
        <LeaveStatusBadge status={leave.status} />
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5">
        {/* Date Row */}
        <div className="flex items-center gap-3 text-sm text-foreground/90">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <div className="flex items-center gap-1.5 font-medium">
            <span>{formattedStartDate}</span>
            <span className="text-muted-foreground font-normal">to</span>
            <span>{formattedEndDate}</span>
          </div>
        </div>

        {/* Reason Row */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
            <span>Reason</span>
          </div>
          <p className="text-sm text-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/30">
            {leave.reason}
          </p>
        </div>

        {/* Admin Comments Row (only if present) */}
        {leave.comments && (
          <div className="space-y-1 border-t border-dashed border-border/60 pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {leave.status === "APPROVED" ? (
                <CheckCircle className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              ) : leave.status === "REJECTED" ? (
                <XCircle className="h-3 w-3 text-rose-500" aria-hidden="true" />
              ) : (
                <Clock className="h-3 w-3" aria-hidden="true" />
              )}
              <span>Approver Comments</span>
            </div>
            <p className="text-sm text-muted-foreground italic bg-muted/15 p-2 rounded border border-border/20">
              {leave.comments}
            </p>
          </div>
        )}
      </CardContent>

      {/* Footer Cancel Action */}
      {isOwner && leave.status === "PENDING" && (
        <CardFooter className="pt-2 border-t border-border/30 justify-end">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs font-semibold px-3 h-8"
          >
            {isPending ? "Cancelling..." : "Cancel Request"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
