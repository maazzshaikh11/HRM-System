import { AttendanceRecord } from "./attendance.types";

export class AttendanceMapper {
  /**
   * Formats a raw attendance record for list responses
   */
  static toResponseDTO(record: AttendanceRecord) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      workingHours: record.workingHours,
      overtimeHours: record.overtimeHours,
      lateMinutes: record.lateMinutes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Formats a list of raw attendance records
   */
  static toResponseDTOs(records: AttendanceRecord[]) {
    return records.map(AttendanceMapper.toResponseDTO);
  }

  /**
   * Formats a raw attendance record with full location and details
   */
  static toDetailResponseDTO(record: AttendanceRecord) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      workingHours: record.workingHours,
      overtimeHours: record.overtimeHours,
      lateMinutes: record.lateMinutes,
      location: record.latitude && record.longitude ? {
        latitude: record.latitude,
        longitude: record.longitude,
      } : null,
      deviceInfo: record.deviceInfo,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
