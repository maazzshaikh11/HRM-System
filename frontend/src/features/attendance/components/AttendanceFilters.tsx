/**
 * AttendanceFilters.tsx
 *
 * Filter panel for the attendance module.
 * Provides controls for filtering by Date Range, Status, Month, and Year.
 * Manages local filter state and propagates updates to the parent via `onApply` callback.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Card, CardContent (expected shadcn path: @/components/ui/card)
 *   - Input (expected shadcn path: @/components/ui/input)
 *   - Select, SelectContent, SelectItem, SelectTrigger, SelectValue (expected shadcn path: @/components/ui/select)
 */

import React, { useState, useEffect } from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import type { AttendanceFilters as FilterType, AttendanceStatus } from "../api/attendance.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: AttendanceStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LEAVE", label: "On Leave" },
  { value: "HOLIDAY", label: "Holiday" },
];

const MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate last 5 years
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = ["", ...Array.from({ length: 6 }, (_, i) => String(currentYear - i))];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AttendanceFiltersProps {
  /** The currently active filters. */
  currentFilters: FilterType;
  /** Fired when filters are applied. */
  onApply: (filters: FilterType) => void;
  /** Fired when filters are reset to default values. */
  onReset: () => void;
  /** Additional wrapper styles. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttendanceFilters({
  currentFilters,
  onApply,
  onReset,
  className = "",
}: AttendanceFiltersProps) {
  // Local state for the filter controls (committed only on "Apply")
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");
  const [status, setStatus] = useState<AttendanceStatus | "">(currentFilters.status || "");
  const [month, setMonth] = useState(currentFilters.month ? String(currentFilters.month) : "");
  const [year, setYear] = useState(currentFilters.year ? String(currentFilters.year) : "");

  // Keep local state in sync if parent changes filters directly
  useEffect(() => {
    setStartDate(currentFilters.startDate || "");
    setEndDate(currentFilters.endDate || "");
    setStatus(currentFilters.status || "");
    setMonth(currentFilters.month ? String(currentFilters.month) : "");
    setYear(currentFilters.year ? String(currentFilters.year) : "");
  }, [currentFilters]);

  // Apply Handler
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFilters: FilterType = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status ? (status as AttendanceStatus) : undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    };

    onApply(updatedFilters);
  };

  // Reset Handler
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
    setMonth("");
    setYear("");
    onReset();
  };

  return (
    <Card className={`shadow-sm border-border bg-card ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <form onSubmit={handleApply} className="space-y-4" aria-label="Filter Attendance Logs">
          {/* Form Fields Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus | "")}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="month" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="year" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y === "" ? "All Years" : y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset Filters
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
            >
              <Check className="h-3 w-3 mr-1.5" />
              Apply Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
