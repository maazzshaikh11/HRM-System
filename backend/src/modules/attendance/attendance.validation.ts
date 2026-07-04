import { z } from "zod";
import { ATTENDANCE_STATUSES } from "./attendance.constants";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).optional();

export const checkInSchema = z.object({
  location: locationSchema,
});

export const checkOutSchema = z.object({
  location: locationSchema,
});

// Helper to transform empty strings to undefined
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const getAttendanceSchema = z.object({
  employeeId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  startDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)").optional()
  ),
  endDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)").optional()
  ),
  status: z.preprocess(emptyToUndefined, z.nativeEnum(ATTENDANCE_STATUSES).optional()),
  month: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().min(1).max(12).optional()
  ),
  year: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().int().min(2000).max(2100).optional()
  ),
  sort: z.preprocess(
    emptyToUndefined,
    z.enum([
      "date:asc",
      "date:desc",
      "checkIn:asc",
      "checkIn:desc",
      "checkOut:asc",
      "checkOut:desc"
    ]).optional()
  ),
  page: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().int().min(1).optional()
  ),
  limit: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().int().min(1).max(100).optional()
  ),
});

export const attendanceIdSchema = z.object({
  id: z.string().uuid("Invalid attendance ID format"),
});

