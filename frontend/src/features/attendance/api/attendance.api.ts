/**
 * attendance.api.ts
 *
 * All HTTP calls for the Attendance module.
 * Mirrors the backend API contract exactly:
 *   POST /api/attendance/check-in
 *   POST /api/attendance/check-out
 *   GET  /api/attendance
 *   GET  /api/attendance/:id
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
// Shared types (mirrors attendance.types.ts on the backend)
// ---------------------------------------------------------------------------

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "LATE"
  | "HOLIDAY";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/** Shape returned by the detail endpoint (check-in / check-out / GET by id). */
export interface AttendanceDetailDTO {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO datetime string
  checkOut: string | null; // ISO datetime string or null
  status: AttendanceStatus;
  workingHours: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  location: LocationCoordinates | null;
  deviceInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned inside the list endpoint (GET /api/attendance). */
export interface AttendanceSummaryDTO {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: AttendanceStatus;
  workingHours: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AttendanceListResponse {
  records: AttendanceSummaryDTO[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

export interface CheckInPayload {
  location?: LocationCoordinates;
}

export interface CheckOutPayload {
  location?: LocationCoordinates;
}

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: AttendanceStatus;
  month?: number;     // 1–12
  year?: number;
  sort?: "date:asc" | "date:desc" | "checkIn:asc" | "checkIn:desc" | "checkOut:asc" | "checkOut:desc";
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
 * POST /api/attendance/check-in
 * Records the current time as check-in for the authenticated employee.
 * Returns the newly created attendance record.
 */
export async function checkIn(payload: CheckInPayload = {}): Promise<AttendanceDetailDTO> {
  const response = await apiClient.post<ApiResponse<AttendanceDetailDTO>>(
    "/attendance/check-in",
    payload
  );
  return response.data.data;
}

/**
 * POST /api/attendance/check-out
 * Records the current time as check-out for the authenticated employee.
 * Returns the updated attendance record with working hours calculated.
 */
export async function checkOut(payload: CheckOutPayload = {}): Promise<AttendanceDetailDTO> {
  const response = await apiClient.post<ApiResponse<AttendanceDetailDTO>>(
    "/attendance/check-out",
    payload
  );
  return response.data.data;
}

/**
 * GET /api/attendance
 * Returns a paginated, filtered list of attendance records.
 * Employees automatically see only their own records (enforced server-side).
 * HR / Admin can filter by employeeId.
 */
export async function getAttendanceList(
  filters: AttendanceFilters = {}
): Promise<AttendanceListResponse> {
  // Remove undefined values so they are not sent as empty query params
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );

  const response = await apiClient.get<ApiResponse<AttendanceListResponse>>(
    "/attendance",
    { params: cleanedFilters }
  );
  return response.data.data;
}

/**
 * GET /api/attendance/:id
 * Returns a single attendance record by UUID.
 * Employees can only access their own records; HR / Admin can access any.
 */
export async function getAttendanceById(id: string): Promise<AttendanceDetailDTO> {
  const response = await apiClient.get<ApiResponse<AttendanceDetailDTO>>(
    `/attendance/${id}`
  );
  return response.data.data;
}
