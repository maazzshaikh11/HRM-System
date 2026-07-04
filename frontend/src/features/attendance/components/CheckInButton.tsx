/**
 * CheckInButton.tsx
 *
 * Triggers the POST /api/attendance/check-in mutation.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Toast / Notification System
 *     If a notification system (e.g. useToast) is implemented by the
 *     Foundation module, uncomment the import below and swap the local
 *     showNotification calls with the toast() function.
 */

import React, { useCallback } from "react";
import { LogIn, Loader2, CheckCircle2 } from "lucide-react";
import { useCheckIn } from "../hooks/useCheckIn";
import type { AttendanceDetailDTO } from "../api/attendance.api";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// INTEGRATION DEPENDENCY — UNCOMMENT & ADAPT WHEN NOTIFICATION SYSTEM IS AVAILABLE
// ---------------------------------------------------------------------------
// import { useToast } from "@/components/ui/use-toast";
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckInButtonProps {
  /** When true, the button is immediately shown as "Checked In" (disabled). */
  alreadyCheckedIn?: boolean;
  /** Fired with the new record after a successful mutation. */
  onSuccess?: (record: AttendanceDetailDTO) => void;
  /** Fired with the error after a failed mutation. */
  onError?: (error: Error) => void;
  /** Optional extra Tailwind classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Button that triggers the check-in mutation.
 * Automatically disabled while loading and after a successful check-in.
 */
export function CheckInButton({
  alreadyCheckedIn = false,
  onSuccess,
  onError,
  className = "",
}: CheckInButtonProps) {
  // Local placeholder for toast. Wire this to the real toast hook when ready.
  const triggerToast = useCallback((options: { title: string; description: string; variant?: "default" | "destructive" }) => {
    console.log(`[Toast] ${options.variant === "destructive" ? "ERROR" : "SUCCESS"}: ${options.title} - ${options.description}`);
    // INTEGRATION POINT: If your project uses window.toast or another global alert mechanism, dispatch it here.
  }, []);

  const { mutate, isPending, isSuccess } = useCheckIn({
    onSuccess: (data) => {
      triggerToast({
        title: "Check-in Successful",
        description: `Successfully checked in at ${new Date(data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        variant: "default",
      });
      onSuccess?.(data);
    },
    onError: (err) => {
      triggerToast({
        title: "Check-in Failed",
        description: err.message || "An error occurred during check-in.",
        variant: "destructive",
      });
      onError?.(err);
    },
  });

  const handleClick = useCallback(() => {
    mutate({});
  }, [mutate]);

  const isCheckedIn = alreadyCheckedIn || isSuccess;
  const isDisabled = isPending || isCheckedIn;

  if (isCheckedIn) {
    return (
      <Button
        disabled
        className={`bg-emerald-600 text-white opacity-80 cursor-default ${className}`}
        aria-label="Already checked in for today"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 mr-2" aria-hidden="true" />
        Checked In
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`bg-emerald-600 hover:bg-emerald-700 text-white ${className}`}
      aria-label="Check in for today"
      aria-live="polite"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin mr-2" aria-hidden="true" />
          Checking In…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 shrink-0 mr-2" aria-hidden="true" />
          Check In
        </>
      )}
    </Button>
  );
}
