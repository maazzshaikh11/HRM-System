/**
 * LeaveStatusBadge.tsx
 *
 * Displays a styled status badge for a leave request.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Badge (expected shadcn path: @/components/ui/badge)
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "../api/leave.api";

export interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; variant: string }
> = {
  PENDING: {
    label: "Pending",
    variant: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approved",
    variant: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    variant: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "bg-muted text-muted-foreground border-muted",
  },
};

export function LeaveStatusBadge({ status, className = "" }: LeaveStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Badge
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${cfg.variant} ${className}`}
      role="status"
      aria-label={`Leave request status: ${cfg.label}`}
    >
      {cfg.label}
    </Badge>
  );
}
