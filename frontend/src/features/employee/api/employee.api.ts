/**
 * employee.api.ts
 *
 * All HTTP calls for the Employee / Profile module.
 * Mirrors the backend API contract:
 *   GET    /api/employees/profile        — Get own profile
 *   PUT    /api/employees/profile        — Update own profile
 *   GET    /api/employees                — List all employees (Admin/HR)
 *   GET    /api/employees/:id            — Get employee by ID (Admin/HR)
 *   POST   /api/employees/avatar         — Upload avatar
 */

import apiClient from "../../../lib/apiClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "Admin" | "HR" | "Employee";
  isActive: boolean;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  profile: {
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
    joiningDate?: string | null;
    designation?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    skills?: string[];
  } | null;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  designation?: string;
  bio?: string;
  skills?: string[];
}

export interface EmployeeListItem {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department?: { name: string } | null;
  profile?: { designation?: string | null; avatarUrl?: string | null } | null;
}

export interface EmployeeListResponse {
  employees: EmployeeListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /api/employees/profile — Get authenticated employee's own profile */
export async function getMyProfile(): Promise<EmployeeProfile> {
  const response = await apiClient.get<ApiResponse<EmployeeProfile>>("/employees/profile");
  return response.data.data;
}

/** PUT /api/employees/profile — Update authenticated employee's profile */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<EmployeeProfile> {
  const response = await apiClient.put<ApiResponse<EmployeeProfile>>("/employees/profile", payload);
  return response.data.data;
}

/** POST /api/employees/avatar — Upload avatar image */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
    "/employees/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.data;
}

/** GET /api/employees — List all employees (Admin/HR only) */
export async function getEmployeeList(filters: EmployeeFilters = {}): Promise<EmployeeListResponse> {
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const response = await apiClient.get<ApiResponse<EmployeeListResponse>>("/employees", {
    params: cleanedFilters,
  });
  return response.data.data;
}

/** GET /api/employees/:id — Get single employee by ID (Admin/HR only) */
export async function getEmployeeById(id: string): Promise<EmployeeProfile> {
  const response = await apiClient.get<ApiResponse<EmployeeProfile>>(`/employees/${id}`);
  return response.data.data;
}
