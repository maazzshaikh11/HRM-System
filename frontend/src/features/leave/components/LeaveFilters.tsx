/**
 * LeaveFilters.tsx
 *
 * Filtering controls for the Leave request history list.
 * Supports status, leave type, date range, and employee ID (for Admin/HR).
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Input (expected shadcn path: @/components/ui/input)
 *   - Select, SelectContent, SelectItem, SelectTrigger, SelectValue (expected shadcn path: @/components/ui/select)
 *   - Button (expected shadcn path: @/components/ui/button)
 */

import React from "react";
import { Filter, X, Search } from "lucide-react";
import type { LeaveFilters as FiltersType, LeaveStatus, LeaveType } from "../api/leave.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LeaveFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  showEmployeeFilter?: boolean;
  className?: string;
}

export function LeaveFilters({
  filters,
  onChange,
  showEmployeeFilter = false,
  className = "",
}: LeaveFiltersProps) {
  const handleSelectChange = (name: keyof FiltersType, value: string) => {
    onChange({
      ...filters,
      [name]: value === "ALL" ? undefined : value,
      page: 1, // Reset page on filter change
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value === "" ? undefined : value,
      page: 1, // Reset page
    });
  };

  const handleClearFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "page" && key !== "limit" && value !== undefined && value !== ""
  );

  return (
    <div className={`p-4 rounded-xl border border-border bg-card/60 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>Filter Requests</span>
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <X className="h-3 w-3 mr-1" aria-hidden="true" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Leave Status Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            value={filters.status || "ALL"}
            onChange={(e) => handleSelectChange("status", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Filter by leave status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Leave Type Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-type" className="text-xs font-medium text-muted-foreground">
            Leave Type
          </label>
          <select
            id="filter-type"
            name="type"
            value={filters.type || "ALL"}
            onChange={(e) => handleSelectChange("type", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Filter by leave type"
          >
            <option value="ALL">All Types</option>
            <option value="SICK">Sick Leave</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
            <option value="MATERNITY">Maternity Leave</option>
            <option value="PATERNITY">Paternity Leave</option>
          </select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-startDate" className="text-xs font-medium text-muted-foreground">
            From Date
          </label>
          <Input
            id="filter-startDate"
            name="startDate"
            type="date"
            value={filters.startDate || ""}
            onChange={handleInputChange}
            aria-label="Filter from start date"
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-endDate" className="text-xs font-medium text-muted-foreground">
            To Date
          </label>
          <Input
            id="filter-endDate"
            name="endDate"
            type="date"
            value={filters.endDate || ""}
            onChange={handleInputChange}
            aria-label="Filter to end date"
          />
        </div>

        {/* Employee ID Filter (HR/Admin only) */}
        {showEmployeeFilter && (
          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label htmlFor="filter-employeeId" className="text-xs font-medium text-muted-foreground">
              Employee ID
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
              <Input
                id="filter-employeeId"
                name="employeeId"
                type="text"
                placeholder="UUID format..."
                value={filters.employeeId || ""}
                onChange={handleInputChange}
                className="pl-9 text-xs"
                aria-label="Filter by employee uuid"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
