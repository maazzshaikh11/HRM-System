/**
 * leave.service.ts
 *
 * Service layer for the Leave module.
 * Implements business rules and authorization guards.
 */

import { LeaveRepository } from "./leave.repository";
import { LeaveFilters, LeaveRequest, LeaveType } from "./leave.types";
import { ERROR_CODES } from "./leave.constants";

// ---------------------------------------------------------------------------
// INTEGRATION DEPENDENCY — SHARED ERROR CLASS
// AppError is defined locally as a temporary stand-in.
// Owner : Foundation / Auth module (Member 1).
// Once a shared error utility is published (e.g. src/utils/AppError.ts),
// replace this class with: import { AppError } from "../../../utils/AppError";
// The expected contract: constructor(statusCode: number, message: string, code?: string)
// ---------------------------------------------------------------------------
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// INTEGRATION DEPENDENCY — LEAVE BALANCE COLUMN NAMES
// ---------------------------------------------------------------------------
// These field names MUST match the actual Prisma LeaveAllocation model columns
// defined in prisma/schema.prisma (owned by the Foundation module / Member 1).
//
// Verification steps before deployment:
//   1. Open prisma/schema.prisma.
//   2. Locate the LeaveAllocation model.
//   3. Confirm each mapped field name matches the exact column name (camelCase).
//   4. Update this map if the schema uses different names (e.g. sick_balance).
//
// Mapping rules:
//   string  → the allocation column to check and decrement on approval
//   null    → no balance tracking for this type; approval skips balance check
// ---------------------------------------------------------------------------
const BALANCE_FIELD_MAP: Record<LeaveType, string | null> = {
  SICK:       "sickBalance",  // VERIFY: matches prisma column name
  CASUAL:     "paidBalance",  // VERIFY: matches prisma column name
  UNPAID:     null,           // UNPAID leave is not balance-gated
  MATERNITY:  null,           // MATERNITY leave is not balance-gated
  PATERNITY:  null,           // PATERNITY leave is not balance-gated
};

export class LeaveService {
  private repository: LeaveRepository;

  constructor() {
    this.repository = new LeaveRepository();
  }

  /**
   * Helper to calculate leave duration in days (inclusive)
   */
  private calculateDurationInDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Submit a new leave request
   */
  async applyLeave(
    employeeId: string,
    data: {
      type: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
    }
  ): Promise<LeaveRequest> {
    const start = new Date(`${data.startDate}T00:00:00.000Z`);
    const end = new Date(`${data.endDate}T23:59:59.999Z`);

    // 1. Prevent overlapping leave requests
    const overlapping = await this.repository.findOverlapping(employeeId, start, end);
    if (overlapping.length > 0) {
      throw new AppError(
        409,
        "Leave request dates overlap with an existing pending or approved leave.",
        ERROR_CODES.OVERLAPPING_LEAVE
      );
    }

    // 2. Validate leave balance availability before creating request (pre-check)
    const duration = this.calculateDurationInDays(start, end);
    const year = start.getFullYear();

    const balanceField = BALANCE_FIELD_MAP[data.type];
    if (balanceField !== null) {
      // This leave type consumes a tracked balance — validate before creating
      const allocation = await this.repository.findAllocation(employeeId, year);
      if (!allocation) {
        throw new AppError(
          404,
          "No leave allocation found for the current year.",
          ERROR_CODES.NO_ALLOCATION_FOUND
        );
      }

      const availableBalance = allocation[balanceField];
      if (typeof availableBalance !== "number") {
        throw new AppError(
          500,
          `Balance field "${balanceField}" is missing from the leave allocation record. Verify BALANCE_FIELD_MAP matches the Prisma schema.`,
          ERROR_CODES.INVALID_INPUT
        );
      }

      if (availableBalance < duration) {
        throw new AppError(
          400,
          `Insufficient ${data.type} Leave balance. Requested: ${duration} days, Available: ${availableBalance} days.`,
          ERROR_CODES.INSUFFICIENT_BALANCE
        );
      }
    }

    // 3. Create the request, starting as PENDING
    return this.repository.create({
      employeeId,
      type: data.type,
      startDate: start,
      endDate: end,
      reason: data.reason,
      status: "PENDING",
    });
  }

  /**
   * Approve or reject a leave request (HR/Admin only)
   */
  async updateStatus(
    id: string,
    action: {
      status: "APPROVED" | "REJECTED";
      comments?: string;
    },
    currentUserRole: string
  ): Promise<LeaveRequest> {
    // 1. Only HR/Admin can APPROVE or REJECT
    if (currentUserRole !== "HR" && currentUserRole !== "Admin") {
      throw new AppError(
        403,
        "Only HR or Admin are authorized to approve/reject leave requests.",
        ERROR_CODES.FORBIDDEN_ACCESS
      );
    }

    const request = await this.repository.findById(id);
    if (!request) {
      throw new AppError(404, "Leave request not found.", ERROR_CODES.RECORD_NOT_FOUND);
    }

    // 2. Prevent modification of final states
    if (request.status !== "PENDING") {
      throw new AppError(
        400,
        `Cannot update status of a leave request that is already ${request.status}.`,
        ERROR_CODES.INVALID_STATUS_TRANSITION
      );
    }

    // 3. Validate leave balance and atomically approve where applicable
    const balanceField = BALANCE_FIELD_MAP[request.type];

    if (action.status === "APPROVED" && balanceField !== null) {
      // This leave type consumes a tracked balance
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const duration = this.calculateDurationInDays(start, end);
      const year = start.getFullYear();

      const allocation = await this.repository.findAllocation(request.employeeId, year);
      if (!allocation) {
        throw new AppError(
          404,
          "No leave allocation found for the current year.",
          ERROR_CODES.NO_ALLOCATION_FOUND
        );
      }

      const availableBalance = allocation[balanceField];
      if (typeof availableBalance !== "number") {
        throw new AppError(
          500,
          `Balance field "${balanceField}" is missing from the leave allocation record. Verify BALANCE_FIELD_MAP matches the Prisma schema.`,
          ERROR_CODES.INVALID_INPUT
        );
      }

      if (availableBalance < duration) {
        throw new AppError(
          400,
          `Insufficient ${request.type} Leave balance. Requested: ${duration} days, Available: ${availableBalance} days.`,
          ERROR_CODES.INSUFFICIENT_BALANCE
        );
      }

      // Atomically deduct the balance AND update the leave status in one transaction.
      // If either write fails the other is rolled back automatically.
      return this.repository.approveWithTransaction(
        allocation.id,
        balanceField,
        availableBalance - duration,
        id,
        action.comments || null
      );
    }

    // 4. No balance involved — update status directly (REJECTED, or non-balance types)
    return this.repository.update(id, {
      status: action.status,
      comments: action.comments || null,
    });
  }

  /**
   * Cancel a leave request (Employee only, and only if PENDING)
   */
  async cancelLeave(id: string, currentUserId: string): Promise<LeaveRequest> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new AppError(404, "Leave request not found.", ERROR_CODES.RECORD_NOT_FOUND);
    }

    // 1. Correct authorization checks
    if (request.employeeId !== currentUserId) {
      throw new AppError(
        403,
        "You are not authorized to cancel this leave request.",
        ERROR_CODES.FORBIDDEN_ACCESS
      );
    }

    // 2. Employee can CANCEL only while status is PENDING
    if (request.status !== "PENDING") {
      throw new AppError(
        400,
        `Cannot cancel a leave request that is already ${request.status}.`,
        ERROR_CODES.INVALID_STATUS_TRANSITION
      );
    }

    return this.repository.update(id, {
      status: "CANCELLED",
    });
  }

  /**
   * Retrieve a paginated list of leave requests
   */
  async getLeaveList(
    filters: LeaveFilters,
    currentUser: { id: string; role: string }
  ): Promise<{ records: LeaveRequest[]; total: number; page: number; limit: number; pages: number }> {
    // 1. Role Authorization Check: Employees can only view their own leave requests
    if (currentUser.role === "Employee") {
      filters.employeeId = currentUser.id;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const [records, total] = await Promise.all([
      this.repository.findMany(filters),
      this.repository.count(filters),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      records,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * Retrieve a single leave request by ID
   */
  async getLeaveById(id: string, currentUser: { id: string; role: string }): Promise<LeaveRequest> {
    const record = await this.repository.findById(id);

    if (!record) {
      throw new AppError(404, "Leave request not found.", ERROR_CODES.RECORD_NOT_FOUND);
    }

    // 1. Role Authorization Check: Employees can only view their own requests
    if (currentUser.role === "Employee" && record.employeeId !== currentUser.id) {
      throw new AppError(
        403,
        "You are not authorized to view this leave request.",
        ERROR_CODES.FORBIDDEN_ACCESS
      );
    }

    return record;
  }
}
