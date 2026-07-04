/**
 * AttendanceCard.tsx
 *
 * Displays today's attendance summary for the authenticated employee.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Card, CardContent, CardHeader, CardTitle (expected shadcn path: @/components/ui/card)
 *   - Badge (expected shadcn path: @/components/ui/badge)
 */

import React from "react";
import { Clock, LogIn, LogOut, Timer, TrendingUp, AlertCircle } from "lucide-react";
import type { AttendanceDetailDTO, AttendanceSummaryDTO, AttendanceStatus } from "../api/attendance.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

type AnyAttendanceRecord = AttendanceDetailDTO | AttendanceSummaryDTO;

// ---------------------------------------------------------------------------
// Status config — maps backend AttendanceStatus to display values
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; variant: string }
> = {
  PRESENT:  { label: "Present",  variant: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  LATE:     { label: "Late",     variant: "bg-amber-500/15  text-amber-600  dark:text-amber-400  border-amber-500/20"  },
  HALF_DAY: { label: "Half Day", variant: "bg-blue-500/15   text-blue-600   dark:text-blue-400   border-blue-500/20"   },
  ABSENT:   { label: "Absent",   variant: "bg-rose-500/15   text-rose-600   dark:text-rose-400   border-rose-500/20"   },
  LEAVE:    { label: "On Leave", variant: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  HOLIDAY:  { label: "Holiday",  variant: "bg-sky-500/15    text-sky-600    dark:text-sky-400    border-sky-500/20"    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format an ISO datetime string to a human-readable local time (e.g. "09:15 AM"). */
function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert decimal hours to "Xh Ym" format (e.g. 8.75 → "8h 45m"). */
function formatHours(hours: number | null | undefined): string {
  if (hours == null) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function StatRow({ icon, label, value, valueClassName = "" }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      <span className={`text-sm font-medium tabular-nums ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

/** Animated skeleton placeholder shown while loading. */
function AttendanceCardSkeleton() {
  return (
    <Card
      className="w-full animate-pulse"
      aria-label="Loading attendance record"
      aria-busy="true"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Empty state shown when no attendance record exists for today. */
function NoRecordState() {
  return (
    <Card
      className="w-full border-dashed flex flex-col items-center justify-center p-6 text-center"
      role="status"
    >
      <AlertCircle
        className="h-8 w-8 text-muted-foreground/50 mb-2"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-muted-foreground">
        No attendance record for today
      </p>
      <p className="text-xs text-muted-foreground/70">
        Check in to start your working day.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// AttendanceCard — public component
// ---------------------------------------------------------------------------

export interface AttendanceCardProps {
  /** Today's attendance record. Pass null/undefined to show empty/no-record state. */
  record: AnyAttendanceRecord | null | undefined;
  /** When true, renders a skeleton loader instead of actual content. */
  loading?: boolean;
  /** Optional extra className for the card wrapper. */
  className?: string;
}

/**
 * Displays today's attendance status, check-in/out times, working hours,
 * overtime, and late minutes in a single, compact card.
 */
export function AttendanceCard({
  record,
  loading = false,
  className = "",
}: AttendanceCardProps) {
  if (loading) return <AttendanceCardSkeleton />;
  if (!record) return <NoRecordState />;

  const statusCfg = STATUS_CONFIG[record.status] ?? {
    label: record.status,
    variant: "bg-muted text-muted-foreground border-muted",
  };

  const todayLabel = new Date(record.date).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card
      className={`shadow-sm transition-shadow hover:shadow-md ${className}`}
      aria-label={`Attendance record for ${todayLabel}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/50">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Today
          </p>
          <CardTitle className="text-sm font-semibold text-card-foreground mt-0.5">
            {todayLabel}
          </CardTitle>
        </div>

        {/* Status Badge */}
        <Badge
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.variant}`}
          role="status"
          aria-label={`Attendance status: ${statusCfg.label}`}
        >
          {statusCfg.label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4">
        <StatRow
          icon={<LogIn className="h-3.5 w-3.5" aria-hidden="true" />}
          label="Check In"
          value={formatTime(record.checkIn)}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />

        <StatRow
          icon={<LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
          label="Check Out"
          value={formatTime(record.checkOut)}
        />

        <StatRow
          icon={<Timer className="h-3.5 w-3.5" aria-hidden="true" />}
          label="Working Hours"
          value={formatHours(record.workingHours)}
        />

        {record.overtimeHours != null && record.overtimeHours > 0 && (
          <StatRow
            icon={<TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Overtime"
            value={formatHours(record.overtimeHours)}
            valueClassName="text-violet-600 dark:text-violet-400"
          />
        )}

        {record.lateMinutes != null && record.lateMinutes > 0 && (
          <StatRow
            icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Late By"
            value={`${record.lateMinutes}m`}
            valueClassName="text-amber-600 dark:text-amber-400"
          />
        )}
      </CardContent>
    </Card>
  );
}
