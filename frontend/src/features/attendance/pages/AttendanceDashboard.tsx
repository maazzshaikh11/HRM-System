/**
 * AttendanceDashboard.tsx
 *
 * Attendance dashboard page for the authenticated employee.
 * Shows today's working status, live working timer, attendance card,
 * and check-in / check-out action buttons.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Card, CardContent, CardHeader, CardTitle (expected shadcn path: @/components/ui/card)
 *   - Badge (expected shadcn path: @/components/ui/badge)
 */

import React, { useMemo } from "react";
import { AlertCircle, RotateCcw, CalendarDays } from "lucide-react";
import { useAttendance } from "../hooks/useAttendance";
import { AttendanceCard } from "../components/AttendanceCard";
import { WorkingTimer } from "../components/WorkingTimer";
import { CheckInButton } from "../components/CheckInButton";
import { CheckOutButton } from "../components/CheckOutButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get local date string in YYYY-MM-DD format */
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formats the date for header display */
function formatHeaderDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AttendanceDashboard() {
  const todayStr = useMemo(() => getTodayDateString(), []);
  const headerDateStr = useMemo(() => formatHeaderDate(), []);

  // Fetch today's attendance record (limit: 1)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAttendance({
    startDate: todayStr,
    endDate: todayStr,
    limit: 1,
  });

  // Extract today's record if it exists
  const todayRecord = data?.records?.[0] || null;

  // Derive check-in status
  const hasCheckedIn = Boolean(todayRecord?.checkIn);
  const hasCheckedOut = Boolean(todayRecord?.checkOut);

  // Derive overall display status for the badge
  const statusBadge = useMemo(() => {
    if (!todayRecord) {
      return {
        label: "Not Checked In",
        className: "bg-muted text-muted-foreground border-muted",
      };
    }
    switch (todayRecord.status) {
      case "PRESENT":
        return {
          label: "Active / Present",
          className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "LATE":
        return {
          label: "Active / Late In",
          className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "HALF_DAY":
        return {
          label: "Half Day Worked",
          className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "ABSENT":
        return {
          label: "Absent",
          className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
        };
      case "LEAVE":
        return {
          label: "On Leave",
          className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
        };
      default:
        return {
          label: todayRecord.status,
          className: "bg-muted text-muted-foreground border-muted",
        };
    }
  }, [todayRecord]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse"
        aria-busy="true"
        aria-label="Loading attendance dashboard"
      >
        <div className="space-y-3">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  // API Error state
  if (isError) {
    return (
      <main
        className="container max-w-lg mx-auto px-4 py-16 text-center"
        role="alert"
      >
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/25 bg-destructive/5 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Unable to load attendance dashboard
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
            <RotateCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Section */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/65">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            <span>{headerDateStr}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Attendance Dashboard
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Today's Status:
          </span>
          <Badge
            className={`px-3 py-1 text-xs font-semibold border ${statusBadge.className}`}
            role="status"
            aria-label={`Attendance Status: ${statusBadge.label}`}
          >
            {statusBadge.label}
          </Badge>
        </div>
      </header>

      {/* Main Grid Section */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Left Card - Details */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Daily Summary
          </h2>
          <AttendanceCard record={todayRecord} loading={isLoading} />
        </div>

        {/* Right Card - Actions & Live Clock */}
        <div className="flex flex-col space-y-6">
          {/* Live Timer Section */}
          {hasCheckedIn && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                Active Session
              </h2>
              <div className="flex items-center justify-center p-6 rounded-xl border border-border bg-card/40 min-h-[120px]">
                <WorkingTimer
                  checkInTime={todayRecord!.checkIn}
                  checkOutTime={todayRecord?.checkOut}
                  className="scale-125 py-2 px-4 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Action Panel Section */}
          <div className="space-y-2 flex-grow">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Time Clock Actions
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl border border-border bg-card min-h-[120px] justify-center items-center">
              <CheckInButton
                alreadyCheckedIn={hasCheckedIn}
                onSuccess={() => refetch()}
                className="w-full sm:w-auto min-w-[140px]"
              />
              <CheckOutButton
                hasCheckedIn={hasCheckedIn}
                alreadyCheckedOut={hasCheckedOut}
                onSuccess={() => refetch()}
                className="w-full sm:w-auto min-w-[140px]"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
