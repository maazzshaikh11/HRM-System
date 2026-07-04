/**
 * leave.api.ts
 *
 * All HTTP calls for the Leave module.
 * Mirrors the backend API contract exactly:
 *   POST   /api/leave              — Apply for leave
 *   GET    /api/leave              — List leave requests (filtered, paginated)
 *   GET    /api/leave/:id          — Get leave request by ID
 *   PATCH  /api/leave/:id          — Approve or reject (HR/Admin)
 *   POST   /api/leave/:id/cancel   — Cancel a pending leave request
 */

// ---------------------------------------------------------------------------
// INTEGRATION DEPENDENCY — DO NOT IMPLEMENT HERE
// ---------------------------------------------------------------------------
// `apiClient` is the project's shared Axios instance.
// Owner : Foundation / Auth module (Member 1)
// Path  : src/lib/apiClient.ts
//
// Expected contract:
//   - Axios instance with baseURL set to VITE_API_BASE_URL
//   - Automatically attaches the JWT Authorization header on every request
//   - Handles 401 globally (clears token, redirects to /login)
//   - Default export: AxiosInstance
// ---------------------------------------------------------------------------
import apiClient from "../../../lib/apiClient";

// ---------------------------------------------------------------------------
// Shared types (mirrors leave.types.ts on the backend)
// ---------------------------------------------------------------------------

export type LeaveType = "SICK" | "CASUAL" | "UNPAID" | "MATERNITY" | "PATERNITY";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/** Shape returned by detail endpoints (apply / update / cancel / GET by id). */
export interface LeaveDetailDTO {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  reason: string;
  status: LeaveStatus;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned inside the list endpoint (GET /api/leave). */
export interface LeaveSummaryDTO {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LeaveListResponse {
  records: LeaveSummaryDTO[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

export interface ApplyLeavePayload {
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
}

export interface UpdateLeaveStatusPayload {
  status: "APPROVED" | "REJECTED";
  comments?: string;
}

export interface LeaveFilters {
  employeeId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: LeaveStatus;
  type?: LeaveType;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Generic API response wrapper (matches backend { success, message, data })
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * POST /api/leave
 * Submit a new leave request for the authenticated employee.
 */
export async function applyLeave(payload: ApplyLeavePayload): Promise<LeaveDetailDTO> {
  const response = await apiClient.post<ApiResponse<LeaveDetailDTO>>(
    "/leave",
    payload
  );
  return response.data.data;
}

/**
 * GET /api/leave
 * Returns a paginated, filtered list of leave requests.
 * Employees see only their own; HR/Admin see all.
 */
export async function getLeaveList(filters: LeaveFilters = {}): Promise<LeaveListResponse> {
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );

  const response = await apiClient.get<ApiResponse<LeaveListResponse>>(
    "/leave",
    { params: cleanedFilters }
  );
  return response.data.data;
}

/**
 * GET /api/leave/:id
 * Returns a single leave request by UUID.
 */
export async function getLeaveById(id: string): Promise<LeaveDetailDTO> {
  const response = await apiClient.get<ApiResponse<LeaveDetailDTO>>(
    `/leave/${id}`
  );
  return response.data.data;
}

/**
 * PATCH /api/leave/:id
 * Approve or reject a leave request (HR/Admin only).
 */
export async function updateLeaveStatus(
  id: string,
  payload: UpdateLeaveStatusPayload
): Promise<LeaveDetailDTO> {
  const response = await apiClient.patch<ApiResponse<LeaveDetailDTO>>(
    `/leave/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * POST /api/leave/:id/cancel
 * Cancel a pending leave request (employee only).
 */
export async function cancelLeave(id: string): Promise<LeaveDetailDTO> {
  const response = await apiClient.post<ApiResponse<LeaveDetailDTO>>(
    `/leave/${id}/cancel`
  );
  return response.data.data;
}

