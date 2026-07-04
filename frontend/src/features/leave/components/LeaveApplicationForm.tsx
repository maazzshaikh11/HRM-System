/**
 * LeaveApplicationForm.tsx
 *
 * Form for submitting a new leave request.
 * Utilizes React Hook Form and Zod for validation.
 * Reuses the `useApplyLeave` mutation hook.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Input (expected shadcn path: @/components/ui/input)
 *   - Textarea (or standard textarea element)
 */

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Send, AlertCircle } from "lucide-react";
import { useApplyLeave } from "../hooks/useApplyLeave";
import type { LeaveType } from "../api/leave.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const leaveFormSchema = z
  .object({
    type: z.enum(["SICK", "CASUAL", "UNPAID", "MATERNITY", "PATERNITY"], {
      errorMap: () => ({ message: "Select a valid leave type" }),
    }),
    startDate: z
      .string()
      .regex(dateRegex, "Invalid start date format (expected YYYY-MM-DD)")
      .refine((val) => !isNaN(new Date(val).getTime()), "Invalid start date"),
    endDate: z
      .string()
      .regex(dateRegex, "Invalid end date format (expected YYYY-MM-DD)")
      .refine((val) => !isNaN(new Date(val).getTime()), "Invalid end date"),
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
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export interface LeaveApplicationFormProps {
  /** Callback on successful submission */
  onSuccess?: () => void;
  className?: string;
}

export function LeaveApplicationForm({
  onSuccess,
  className = "",
}: LeaveApplicationFormProps) {
  const { mutate: apply, isPending, error: mutationError } = useApplyLeave({
    onSuccess: () => {
      reset();
      onSuccess?.();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      type: "CASUAL",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      reason: "",
    },
  });

  const onSubmit = (values: LeaveFormValues) => {
    apply(values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 p-5 rounded-xl border border-border bg-card shadow-sm ${className}`}
      aria-label="Apply for leave"
    >
      <div className="pb-3 border-b border-border/40 mb-2">
        <h3 className="text-sm font-bold text-foreground">Apply for Leave</h3>
        <p className="text-xs text-muted-foreground">Submit a request for time off</p>
      </div>

      {mutationError && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-xs font-medium"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{mutationError.message || "Failed to submit leave request. Try again."}</span>
        </div>
      )}

      {/* Leave Type */}
      <div className="space-y-1.5">
        <label htmlFor="leave-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Leave Type
        </label>
        <select
          id="leave-type"
          {...register("type")}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={errors.type ? "true" : "false"}
        >
          <option value="CASUAL">Casual Leave</option>
          <option value="SICK">Sick Leave</option>
          <option value="UNPAID">Unpaid Leave</option>
          <option value="MATERNITY">Maternity Leave</option>
          <option value="PATERNITY">Paternity Leave</option>
        </select>
        {errors.type && (
          <p className="text-[11px] font-medium text-rose-500" role="alert">
            {errors.type.message}
          </p>
        )}
      </div>

      {/* Dates Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="start-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start Date
          </label>
          <Input
            id="start-date"
            type="date"
            {...register("startDate")}
            aria-invalid={errors.startDate ? "true" : "false"}
          />
          {errors.startDate && (
            <p className="text-[11px] font-medium text-rose-500" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label htmlFor="end-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            End Date
          </label>
          <Input
            id="end-date"
            type="date"
            {...register("endDate")}
            aria-invalid={errors.endDate ? "true" : "false"}
          />
          {errors.endDate && (
            <p className="text-[11px] font-medium text-rose-500" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <label htmlFor="leave-reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reason / Remarks
        </label>
        <textarea
          id="leave-reason"
          placeholder="Brief explanation for time off request..."
          {...register("reason")}
          rows={3}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={errors.reason ? "true" : "false"}
        />
        {errors.reason && (
          <p className="text-[11px] font-medium text-rose-500" role="alert">
            {errors.reason.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 mt-2 h-9 text-sm font-semibold"
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
        {isPending ? "Submitting Request..." : "Submit Leave Request"}
      </Button>
    </form>
  );
}
