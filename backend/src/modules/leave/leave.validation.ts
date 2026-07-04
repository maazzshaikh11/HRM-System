/**
 * leave.validation.ts
 *
 * Zod validation schemas for Leave module requests.
 */

import { z } from "zod";
import { LEAVE_TYPES, LEAVE_STATUSES } from "./leave.constants";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const createLeaveSchema = z
  .object({
    type: z.nativeEnum(LEAVE_TYPES, {
      errorMap: () => ({ message: "Invalid leave type" }),
    }),
    startDate: z
      .string()
      .regex(dateRegex, "Invalid start date format (expected YYYY-MM-DD)"),
    endDate: z
      .string()
      .regex(dateRegex, "Invalid end date format (expected YYYY-MM-DD)"),
    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters long")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "Start date must be less than or equal to end date",
      path: ["endDate"],
    }
  );

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    errorMap: () => ({ message: "Status must be either APPROVED or REJECTED" }),
  }),
  comments: z
    .string()
    .max(250, "Comments cannot exceed 250 characters")
    .optional(),
});

export const getLeaveSchema = z.object({
  employeeId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  startDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(dateRegex, "Invalid start date format").optional()
  ),
  endDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(dateRegex, "Invalid end date format").optional()
  ),
  status: z.preprocess(emptyToUndefined, z.nativeEnum(LEAVE_STATUSES).optional()),
  type: z.preprocess(emptyToUndefined, z.nativeEnum(LEAVE_TYPES).optional()),
  page: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().int().min(1).optional()
  ),
  limit: z.preprocess(
    (val) => (val === "" ? undefined : val ? Number(val) : undefined),
    z.number().int().min(1).max(100).optional()
  ),
});

export const leaveIdSchema = z.object({
  id: z.string().uuid("Invalid leave request ID format"),
});
