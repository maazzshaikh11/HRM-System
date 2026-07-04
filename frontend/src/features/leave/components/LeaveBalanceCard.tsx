/**
 * LeaveBalanceCard.tsx
 *
 * Displays leave balance statistics (allocated, used, remaining) for a specific leave type.
 * Includes a visual progress bar indicating usage percentage.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Card, CardContent, CardHeader, CardTitle (expected shadcn path: @/components/ui/card)
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Calendar, HelpCircle } from "lucide-react";
import type { LeaveType } from "../api/leave.api";

export interface LeaveBalanceCardProps {
  type: LeaveType;
  allocated: number;
  used: number;
  /** Remaining balance supplied by the parent (e.g. from allocation API data). */
  remaining: number | string;
  /** Usage percentage (0–100) supplied by the parent. */
  usagePercent: number;
  /** When true, renders the unlimited-allocation summary instead of a progress bar. */
  isUnlimited?: boolean;
  /** Footer text for unlimited leave types; supplied by the parent. */
  usageSummary?: string;
  loading?: boolean;
  className?: string;
}

const TYPE_CONFIG: Record<
  LeaveType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  SICK: {
    label: "Sick Leave",
    icon: <Stethoscope className="h-4 w-4" />,
    color: "bg-rose-500 text-rose-500",
  },
  CASUAL: {
    label: "Casual Leave",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-blue-500 text-blue-500",
  },
  UNPAID: {
    label: "Unpaid Leave",
    icon: <HelpCircle className="h-4 w-4" />,
    color: "bg-amber-500 text-amber-500",
  },
  MATERNITY: {
    label: "Maternity Leave",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-violet-500 text-violet-500",
  },
  PATERNITY: {
    label: "Paternity Leave",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-indigo-500 text-indigo-500",
  },
};

export function LeaveBalanceCard({
  type,
  allocated,
  used,
  remaining,
  usagePercent,
  isUnlimited = false,
  usageSummary,
  loading = false,
  className = "",
}: LeaveBalanceCardProps) {
  const cfg = TYPE_CONFIG[type] ?? {
    label: type,
    icon: <HelpCircle className="h-4 w-4" />,
    color: "bg-primary text-primary",
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`} aria-busy="true">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 bg-muted rounded mb-2" />
          <div className="h-2 w-full bg-muted rounded mb-1" />
          <div className="h-3 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/40 mb-3">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {cfg.label}
        </CardTitle>
        <div className={`p-1.5 rounded-lg bg-muted text-muted-foreground`}>
          {cfg.icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {remaining}
          </span>
          {!isUnlimited && (
            <span className="text-xs font-medium text-muted-foreground ml-1">
              days remaining
            </span>
          )}
        </div>

        {/* Progress Bar (Only for balance-tracked types) */}
        {!isUnlimited ? (
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cfg.color.split(" ")[0]}`}
                style={{ width: `${usagePercent}%` }}
                role="progressbar"
                aria-valuenow={usagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Usage progress for ${cfg.label}`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground tabular-nums">
              <span>{used} days used</span>
              <span>{allocated} days limit</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-medium text-muted-foreground">
            {usageSummary ?? `${used} days taken`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
