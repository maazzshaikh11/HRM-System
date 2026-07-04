/**
 * leave.types.ts
 *
 * TypeScript types and interfaces for the Leave module.
 */

import { Request } from "express";

export type LeaveType = "SICK" | "CASUAL" | "UNPAID" | "MATERNITY" | "PATERNITY";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: "Employee" | "HR" | "Admin";
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
  // ---------------------------------------------------------------------------
  // INTEGRATION DEPENDENCY — LEAVE BALANCE COLUMN NAMES
  // The exact field names representing leave balances in the database model
  // are owned by the Foundation module. Use bracket/index mapping.
  // ---------------------------------------------------------------------------
  [key: string]: any;
}

export interface CreateLeaveDTO {
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
}

export interface UpdateLeaveStatusDTO {
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
