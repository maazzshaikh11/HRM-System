/**
 * AttendanceCalendar.tsx
 *
 * Displays a monthly attendance calendar grid using native React & Tailwind.
 * Fetches attendance records for the selected month/year using `useAttendance`.
 * Color-codes calendar day indicators based on the daily attendance status.
 * Allows clicking a day to view its detailed check-in/out log and hours.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Card, CardContent, CardHeader, CardTitle (expected shadcn path: @/components/ui/card)
 *   - Badge (expected shadcn path: @/components/ui/badge)
 */

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, RotateCcw, CalendarDays, LogIn, LogOut, Clock, Timer } from "lucide-react";
import { useAttendance } from "../hooks/useAttendance";
import type { AttendanceSummaryDTO, AttendanceStatus } from "../api/attendance.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Status Badge Mapping
// ---------------------------------------------------------------------------

const STATUS_THEME: Record<
  AttendanceStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  PRESENT:  { label: "Present",  dot: "bg-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
  LATE:     { label: "Late In",   dot: "bg-amber-500",   bg: "bg-amber-50/50 dark:bg-amber-950/20",   text: "text-amber-700 dark:text-amber-400"   },
  HALF_DAY: { label: "Half Day", dot: "bg-blue-500",    bg: "bg-blue-50/50 dark:bg-blue-950/20",    text: "text-blue-700 dark:text-blue-400"     },
  ABSENT:   { label: "Absent",   dot: "bg-rose-500",    bg: "bg-rose-50/50 dark:bg-rose-950/20",    text: "text-rose-700 dark:text-rose-400"     },
  LEAVE:    { label: "On Leave", dot: "bg-violet-500",  bg: "bg-violet-50/50 dark:bg-violet-950/20",  text: "text-violet-700 dark:text-violet-400" },
  HOLIDAY:  { label: "Holiday",  dot: "bg-sky-500",     bg: "bg-sky-50/50 dark:bg-sky-950/20",     text: "text-sky-700 dark:text-sky-400"       },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedRecord, setSelectedRecord] = useState<AttendanceSummaryDTO | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Fetch all records for the selected month/year
  const { data, isLoading, isError, error, refetch, isFetching } = useAttendance(
    {
      month: month + 1,
      year,
      limit: 100, // retrieve all records of the month
    },
    true
  );

  const records = data?.records || [];

  // Map records to a lookup dictionary keyed by YYYY-MM-DD
  const recordsMap = useMemo(() => {
    const map: Record<string, AttendanceSummaryDTO> = {};
    records.forEach((rec) => {
      // Normalize backend date format to YYYY-MM-DD
      const dateKey = rec.date.split("T")[0];
      map[dateKey] = rec;
    });
    return map;
  }, [records]);

  // Calendar calculations
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [currentDate]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedRecord(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedRecord(null);
  };

  // Day click handler
  const handleDaySelect = (dayRecord: AttendanceSummaryDTO | null) => {
    setSelectedRecord(dayRecord);
  };

  // Check if a day is today
  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // Calendar Day render mapping
  const calendarCells = useMemo(() => {
    const cells: React.ReactNode[] = [];

    // 1. Render empty grid blocks for month offsets
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="min-h-[70px] sm:min-h-[85px] bg-muted/10 border border-border/20"
        />
      );
    }

    // 2. Render actual calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const record = recordsMap[dateString] || null;
      const today = isToday(day);

      // Determine day cell theme
      const statusTheme = record ? STATUS_THEME[record.status] : null;

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDaySelect(record)}
          disabled={!record}
          className={[
            "min-h-[70px] sm:min-h-[85px] p-2 flex flex-col justify-between text-left border border-border/40 focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
            record ? "hover:bg-accent/40 cursor-pointer" : "cursor-default opacity-85",
            today ? "bg-accent/30 font-bold border-primary/50" : "bg-card",
            statusTheme ? statusTheme.bg : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`${dateString} - ${record ? `Status: ${record.status}` : "No Record"}`}
        >
          {/* Day number */}
          <div className="flex justify-between items-start w-full">
            <span
              className={[
                "text-xs sm:text-sm rounded-full w-5 h-5 flex items-center justify-center tabular-nums",
                today ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground",
              ].join(" ")}
            >
              {day}
            </span>

            {/* Micro dot indicator */}
            {statusTheme && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusTheme.dot}`}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Label status on medium+ screens */}
          {statusTheme && (
            <span
              className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider truncate max-w-full ${statusTheme.text}`}
            >
              {statusTheme.label}
            </span>
          )}
        </button>
      );
    }

    return cells;
  }, [daysInMonth, firstDayIndex, recordsMap, year, month]);

  return (
    <div className="space-y-6">
      {/* Calendar Card Panel */}
      <Card className="shadow-sm border-border bg-card">
        {/* Title / Controls */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">{monthLabel}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-20 space-y-3 animate-pulse" aria-busy="true">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="grid grid-cols-7 gap-1 w-full max-w-lg pt-4">
                {[...Array(28)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-md" />
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3" role="alert">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">Failed to load calendar</p>
                <p className="text-xs text-muted-foreground">{error?.message || "Check connection."}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
                <RotateCcw className={`h-3 w-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Day Header */}
              <div className="grid grid-cols-7 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider py-2 bg-muted/30 border-b border-border/40">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-7 gap-[1px] bg-border/20">
                {calendarCells}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Logs Panel */}
      {selectedRecord && (
        <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">
              Details for {new Date(selectedRecord.date).toLocaleDateString(undefined, { dateStyle: "long" })}
            </h4>
            <Badge className={`px-2 py-0.5 text-xs font-semibold border ${STATUS_THEME[selectedRecord.status].bg} ${STATUS_THEME[selectedRecord.status].text}`}>
              {STATUS_THEME[selectedRecord.status].label}
            </Badge>
          </CardHeader>
          <CardContent className="py-4 px-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2.5">
              <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Check In</p>
                <p className="text-sm font-semibold tabular-nums">
                  {new Date(selectedRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Check Out</p>
                <p className="text-sm font-semibold tabular-nums">
                  {selectedRecord.checkOut
                    ? new Date(selectedRecord.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Hours Worked</p>
                <p className="text-sm font-semibold tabular-nums">
                  {selectedRecord.workingHours != null ? `${selectedRecord.workingHours}h` : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Late Minutes</p>
                <p className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {selectedRecord.lateMinutes && selectedRecord.lateMinutes > 0 ? `${selectedRecord.lateMinutes}m` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
