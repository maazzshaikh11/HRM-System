/**
 * queryKeys.ts
 *
 * Centralised TanStack Query key factory for the Attendance feature.
 * Ensures cache invalidation is consistent across all hooks.
 *
 * Hierarchy:
 *   ["attendance"]                       ← invalidates everything
 *   ["attendance", "list", filters]      ← paginated list with specific filters
 *   ["attendance", "detail", id]         ← single record by UUID
 */

import type { AttendanceFilters } from "../api/attendance.api";

export const ATTENDANCE_QUERY_KEYS = {
  /** Root key — invalidating this invalidates all attendance queries. */
  all: ["attendance"] as const,

  /**
   * List queries — scoped by filter params so each unique filter set
   * has its own cache entry.
   */
  list: (filters: AttendanceFilters = {}) =>
    ["attendance", "list", filters] as const,

  /** Single record queries — scoped by UUID. */
  detail: (id: string) => ["attendance", "detail", id] as const,
} as const;
