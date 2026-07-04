/**
 * leave.repository.ts
 *
 * Repository layer for the Leave module.
 * Direct database access using the Prisma client.
 */

import { prisma } from "../../../config/db";
import { PrismaClient } from "@prisma/client";
import { LeaveRequest, LeaveAllocation, LeaveFilters } from "./leave.types";

// ---------------------------------------------------------------------------
// INTEGRATION DEPENDENCY — PRISMA DB MODELS
// The exact names of the Prisma models for Leave Requests and Leave Allocations
// are owned by the Foundation module (Member 1).
// Modify these assignments when the prisma/schema.prisma is finalized.
// ---------------------------------------------------------------------------
const leaveRequestModel = (prisma as any).leaveRequest || (prisma as any).leave_requests;
const leaveAllocationModel = (prisma as any).leaveAllocation || (prisma as any).leave_allocations;

export class LeaveRepository {
  /**
   * Finds a leave request by ID
   */
  async findById(id: string): Promise<LeaveRequest | null> {
    const record = await leaveRequestModel.findUnique({
      where: { id },
    });
    return record as LeaveRequest | null;
  }

  /**
   * Finds the leave allocation for a user for a specific year
   */
  async findAllocation(employeeId: string, year: number): Promise<LeaveAllocation | null> {
    const record = await leaveAllocationModel.findFirst({
      where: {
        employeeId,
        year,
      },
    });
    return record as LeaveAllocation | null;
  }

  /**
   * Updates a user's leave allocation balances
   */
  async updateAllocation(
    id: string,
    data: Record<string, number>
  ): Promise<LeaveAllocation> {
    const record = await leaveAllocationModel.update({
      where: { id },
      data,
    });
    return record as LeaveAllocation;
  }

  /**
   * Finds all non-rejected, non-cancelled leaves overlapping the given date range
   */
  async findOverlapping(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LeaveRequest[]> {
    const records = await leaveRequestModel.findMany({
      where: {
        employeeId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
    });
    return records as LeaveRequest[];
  }

  /**
   * Creates a new leave request in the database
   */
  async create(data: {
    employeeId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
  }): Promise<LeaveRequest> {
    const record = await leaveRequestModel.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: data.status,
      },
    });
    return record as LeaveRequest;
  }

  /**
   * Updates an existing leave request
   */
  async update(
    id: string,
    data: {
      status?: string;
      comments?: string | null;
    }
  ): Promise<LeaveRequest> {
    const record = await leaveRequestModel.update({
      where: { id },
      data,
    });
    return record as LeaveRequest;
  }

  /**
   * Atomically deducts a leave balance and updates the leave request status
   * inside a single Prisma interactive transaction.
   *
   * Both operations succeed together or both are rolled back — there is no
   * intermediate state where the balance is deducted but the status is still PENDING.
   *
   * @param allocationId  - Primary key of the LeaveAllocation row to update
   * @param balanceField  - The balance column name to decrement (e.g. "sickBalance")
   * @param newBalance    - The post-deduction balance value
   * @param leaveId       - Primary key of the LeaveRequest row to approve
   * @param comments      - Optional HR comment attached to the approval
   */
  async approveWithTransaction(
    allocationId: string,
    balanceField: string,
    newBalance: number,
    leaveId: string,
    comments: string | null
  ): Promise<LeaveRequest> {
    const [, updatedLeave] = await prisma.$transaction([
      // Step 1 – deduct the consumed balance
      (leaveAllocationModel as any).update({
        where: { id: allocationId },
        data: { [balanceField]: newBalance },
      }),
      // Step 2 – mark the leave request as APPROVED
      (leaveRequestModel as any).update({
        where: { id: leaveId },
        data: { status: "APPROVED", comments },
      }),
    ]);
    return updatedLeave as LeaveRequest;
  }

  /**
   * Queries leave requests with filtering, pagination, and sorting
   */
  async findMany(filters: LeaveFilters): Promise<LeaveRequest[]> {
    const {
      employeeId,
      startDate,
      endDate,
      status,
      type,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.startDate.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const records = await leaveRequestModel.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return records as LeaveRequest[];
  }

  /**
   * Counts the total number of leave requests matching filters (for pagination)
   */
  async count(filters: LeaveFilters): Promise<number> {
    const { employeeId, startDate, endDate, status, type } = filters;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.startDate.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const count = await leaveRequestModel.count({
      where,
    });

    return count;
  }
}
