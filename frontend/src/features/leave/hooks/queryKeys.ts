/**
 * queryKeys.ts
 *
 * Centralised TanStack Query key factory for the Leave feature.
 * Ensures cache invalidation is consistent across all hooks.
 *
 * Hierarchy:
 *   ["leave"]                       ← invalidates everything
 *   ["leave", "list", filters]      ← paginated list with specific filters
 *   ["leave", "detail", id]         ← single record by UUID
 */

import type { LeaveFilters } from "../api/leave.api";

export const LEAVE_QUERY_KEYS = {
  /** Root key — invalidating this invalidates all leave queries. */
  all: ["leave"] as const,

  /**
   * List queries — scoped by filter params so each unique filter set
   * has its own cache entry.
   */
  list: (filters: LeaveFilters = {}) =>
    ["leave", "list", filters] as const,

  /** Single record queries — scoped by UUID. */
  detail: (id: string) => ["leave", "detail", id] as const,
} as const;
