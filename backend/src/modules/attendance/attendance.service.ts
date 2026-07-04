import { AttendanceRepository } from "./attendance.repository";
import { AttendanceFilters, AttendanceRecord } from "./attendance.types";
import { WORK_CONFIG, ERROR_CODES } from "./attendance.constants";

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

export class AttendanceService {
  private repository: AttendanceRepository;

  constructor() {
    this.repository = new AttendanceRepository();
  }

  /**
   * Helper to get local date string YYYY-MM-DD (Timezone-safe)
   */
  private getLocalDateString(date: Date): string {
    const timeZone = process.env.TZ || "Asia/Kolkata";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to calculate late minutes relative to shift start (9:00 AM) in a timezone-safe manner
   */
  private calculateLateMinutes(checkInTime: Date): number {
    const timeZone = process.env.TZ || "Asia/Kolkata";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(checkInTime);
    const hourPart = parts.find((p) => p.type === "hour")?.value;
    const minutePart = parts.find((p) => p.type === "minute")?.value;

    const localHours = hourPart ? parseInt(hourPart, 10) : checkInTime.getHours();
    const localMinutes = minutePart ? parseInt(minutePart, 10) : checkInTime.getMinutes();

    const checkInMinutesSinceMidnight = localHours * 60 + localMinutes;
    const shiftStartMinutesSinceMidnight = WORK_CONFIG.SHIFT_START_HOUR * 60;

    return Math.max(0, checkInMinutesSinceMidnight - shiftStartMinutesSinceMidnight);
  }

  /**
   * Check in employee
   */
  async checkIn(employeeId: string, userAgent: string | undefined, location?: { latitude: number; longitude: number }): Promise<AttendanceRecord> {
    const now = new Date();
    const dateStr = this.getLocalDateString(now);

    // 1. Check if employee already has an attendance record for today
    const existingRecord = await this.repository.findByEmployeeAndDate(employeeId, dateStr);
    if (existingRecord) {
      throw new AppError(
        409,
        "Employee has already checked in for today.",
        ERROR_CODES.ALREADY_CHECKED_IN
      );
    }

    // 2. Calculate initial attendance status (PRESENT or LATE)
    const lateMinutes = this.calculateLateMinutes(now);
    const gracePeriodMinutes = WORK_CONFIG.SHIFT_START_MINUTE;

    const status = lateMinutes > gracePeriodMinutes ? "LATE" : "PRESENT";

    // 3. Create check-in record
    return this.repository.createCheckIn({
      employeeId,
      date: dateStr,
      checkIn: now,
      status,
      deviceInfo: userAgent || null,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });
  }

  /**
   * Check out employee
   */
  async checkOut(employeeId: string, location?: { latitude: number; longitude: number }): Promise<AttendanceRecord> {
    const now = new Date();
    const dateStr = this.getLocalDateString(now);

    // 1. Find today's check-in record
    const record = await this.repository.findByEmployeeAndDate(employeeId, dateStr);
    if (!record) {
      throw new AppError(
        404,
        "No active check-in record found for today.",
        ERROR_CODES.NO_ACTIVE_CHECK_IN
      );
    }

    // 2. Prevent duplicate check-out
    if (record.checkOut) {
      throw new AppError(
        409,
        "Employee has already checked out for today.",
        ERROR_CODES.ALREADY_CHECKED_OUT
      );
    }

    // 3. Calculate hours worked
    const checkInMs = new Date(record.checkIn).getTime();
    const checkOutMs = now.getTime();
    const workingHours = parseFloat(((checkOutMs - checkInMs) / 3600000).toFixed(2)); // Round to 2 decimal places

    // 4. Calculate overtime (standard shift is 8 hours)
    const overtimeHours = workingHours > WORK_CONFIG.STANDARD_WORKING_HOURS
      ? parseFloat((workingHours - WORK_CONFIG.STANDARD_WORKING_HOURS).toFixed(2))
      : 0;

    // 5. Determine final status based on total hours worked
    let finalStatus = record.status; // defaults to check-in status (PRESENT or LATE)

    if (workingHours < WORK_CONFIG.HALF_DAY_MIN_HOURS) {
      finalStatus = "ABSENT";
    } else if (workingHours < WORK_CONFIG.FULL_DAY_MIN_HOURS) {
      finalStatus = "HALF_DAY";
    }

    // 6. Calculate late minutes
    const lateMinutes = this.calculateLateMinutes(new Date(record.checkIn));

    // 7. Update and return checkout record
    return this.repository.updateCheckOut(record.id, {
      checkOut: now,
      workingHours,
      overtimeHours,
      lateMinutes,
      status: finalStatus,
    });
  }

  /**
   * Get list of attendance records with filters and pagination
   */
  async getAttendanceList(
    filters: AttendanceFilters,
    currentUser: { id: string; role: string }
  ): Promise<{ records: AttendanceRecord[]; total: number; page: number; limit: number; pages: number }> {
    // Role Authorization Check: Employees can only fetch their own records
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
   * Get single attendance record by ID
   */
  async getAttendanceById(id: string, currentUser: { id: string; role: string }): Promise<AttendanceRecord> {
    const record = await this.repository.findById(id);

    if (!record) {
      throw new AppError(
        404,
        "Attendance record not found.",
        ERROR_CODES.RECORD_NOT_FOUND
      );
    }

    // Role Authorization Check: Employees can only view their own record
    if (currentUser.role === "Employee" && record.employeeId !== currentUser.id) {
      throw new AppError(
        403,
        "You are not authorized to view this attendance record.",
        ERROR_CODES.FORBIDDEN_ACCESS
      );
    }

    return record;
  }
}
