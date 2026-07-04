import { Request } from "express";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "LATE" | "HOLIDAY";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: "Employee" | "HR" | "Admin";
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: Date;
  checkOut: Date | null;
  workingHours: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  status: AttendanceStatus;
  deviceInfo: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface CheckInDTO {
  location?: LocationCoordinates;
}

export interface CheckOutDTO {
  location?: LocationCoordinates;
}

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  month?: number;
  year?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
