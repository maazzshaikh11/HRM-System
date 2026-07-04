/**
 * queryKeys.ts
 *
 * Centralised TanStack Query key factory for the Employee feature.
 *
 * Hierarchy:
 *   ["employee"]                     ← invalidates everything
 *   ["employee", "profile"]          ← own profile
 *   ["employee", "list", filters]    ← paginated employee list
 *   ["employee", "detail", id]       ← single employee by ID
 */

import type { EmployeeFilters } from "../api/employee.api";

export const EMPLOYEE_QUERY_KEYS = {
  all: ["employee"] as const,
  profile: () => ["employee", "profile"] as const,
  list: (filters: EmployeeFilters = {}) => ["employee", "list", filters] as const,
  detail: (id: string) => ["employee", "detail", id] as const,
} as const;
