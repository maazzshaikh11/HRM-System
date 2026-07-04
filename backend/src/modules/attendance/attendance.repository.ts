import { prisma } from "../../../config/db";
import { AttendanceFilters, AttendanceRecord } from "./attendance.types";

export class AttendanceRepository {
  /**
   * Finds a check-in record for a specific employee on a specific date
   */
  async findByEmployeeAndDate(employeeId: string, dateStr: string): Promise<AttendanceRecord | null> {
    // We assume the Prisma model is named 'attendance'
    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: dateStr,
      },
    });
    return record as AttendanceRecord | null;
  }

  /**
   * Creates a new check-in attendance record
   */
  async createCheckIn(data: {
    employeeId: string;
    date: string;
    checkIn: Date;
    status: string;
    deviceInfo: string | null;
    latitude: number | null;
    longitude: number | null;
  }): Promise<AttendanceRecord> {
    const record = await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        checkIn: data.checkIn,
        status: data.status,
        deviceInfo: data.deviceInfo,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return record as AttendanceRecord;
  }

  /**
   * Updates an existing attendance record for check-out
   */
  async updateCheckOut(
    id: string,
    data: {
      checkOut: Date;
      workingHours: number;
      overtimeHours: number;
      lateMinutes: number;
      status: string;
    }
  ): Promise<AttendanceRecord> {
    const record = await prisma.attendance.update({
      where: { id },
      data: {
        checkOut: data.checkOut,
        workingHours: data.workingHours,
        overtimeHours: data.overtimeHours,
        lateMinutes: data.lateMinutes,
        status: data.status,
      },
    });
    return record as AttendanceRecord;
  }

  /**
   * Finds an attendance record by ID
   */
  async findById(id: string): Promise<AttendanceRecord | null> {
    const record = await prisma.attendance.findUnique({
      where: { id },
    });
    return record as AttendanceRecord | null;
  }

  /**
   * Finds attendance records based on filters, with sorting and pagination
   */
  async findMany(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    const {
      employeeId,
      startDate,
      endDate,
      status,
      month,
      year,
      sort = "date:desc",
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Build the query filters
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    // Handle date range filters
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.date.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    // Handle month and year filters (Prisma compatible range queries)
    if (month || year) {
      const filterYear = year || new Date().getFullYear();
      let start: Date;
      let end: Date;

      if (month) {
        start = new Date(Date.UTC(filterYear, month - 1, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(filterYear, month, 0, 23, 59, 59, 999));
      } else {
        start = new Date(Date.UTC(filterYear, 0, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(filterYear, 11, 31, 23, 59, 59, 999));
      }

      where.date = {
        gte: start,
        lte: end,
      };
    }

    // Parse sort: e.g. "date:desc" -> { date: "desc" }
    // Strict sorting whitelist checks
    const orderBy: any = {};
    const allowedSortFields = ["date", "checkIn", "checkOut"];
    if (sort) {
      const [field, direction] = sort.split(":");
      if (allowedSortFields.includes(field)) {
        orderBy[field] = direction === "asc" ? "asc" : "desc";
      } else {
        orderBy.date = "desc";
      }
    } else {
      orderBy.date = "desc";
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return records as AttendanceRecord[];
  }

  /**
   * Counts the total number of attendance records matching filters (for pagination)
   */
  async count(filters: AttendanceFilters): Promise<number> {
    const { employeeId, startDate, endDate, status, month, year } = filters;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.date.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (month || year) {
      const filterYear = year || new Date().getFullYear();
      let start: Date;
      let end: Date;

      if (month) {
        start = new Date(Date.UTC(filterYear, month - 1, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(filterYear, month, 0, 23, 59, 59, 999));
      } else {
        start = new Date(Date.UTC(filterYear, 0, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(filterYear, 11, 31, 23, 59, 59, 999));
      }

      where.date = {
        gte: start,
        lte: end,
      };
    }

    const count = await prisma.attendance.count({
      where,
    });

    return count;
  }
}

// Recommended Prisma Indexes (for Member 1 schema registration):
// @@unique([employeeId, date])
// @@index([employeeId, date, status])

