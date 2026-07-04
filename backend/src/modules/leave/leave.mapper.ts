/**
 * leave.mapper.ts
 *
 * Mapper utility to transform raw leave records from database into DTO shapes.
 */

import { LeaveRequest } from "./leave.types";

export class LeaveMapper {
  /**
   * Formats a raw database record for list responses
   */
  static toSummaryDTO(record: LeaveRequest) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      type: record.type,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Formats a list of raw database records
   */
  static toSummaryDTOs(records: LeaveRequest[]) {
    return records.map(LeaveMapper.toSummaryDTO);
  }

  /**
   * Formats a raw database record with full detail fields
   */
  static toDetailDTO(record: LeaveRequest) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      type: record.type,
      startDate: record.startDate,
      endDate: record.endDate,
      reason: record.reason,
      status: record.status,
      comments: record.comments,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
