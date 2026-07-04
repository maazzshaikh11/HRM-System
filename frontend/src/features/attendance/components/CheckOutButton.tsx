/**
 * CheckOutButton.tsx
 *
 * Triggers the POST /api/attendance/check-out mutation.
 *
 * Integration dependencies (owned by Foundation / shared components):
 *   - Button (expected shadcn path: @/components/ui/button)
 *   - Toast / Notification System
 *     If a notification system (e.g. useToast) is implemented by the
 *     Foundation module, uncomment the import below and swap the local
 *     showNotification calls with the toast() function.
 */

import React, { useCallback } from "react";
import { LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { useCheckOut } from "../hooks/useCheckOut";
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

export interface CheckOutButtonProps {
  /** When true, indicates the user has checked in today. */
  hasCheckedIn: boolean;
  /** When true, the button is immediately shown as "Checked Out" (disabled). */
  alreadyCheckedOut?: boolean;
  /** Fired with the updated record after a successful mutation. */
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
 * Button that triggers the check-out mutation.
 * Disabled if the user has not checked in yet, or has already checked out.
 */
export function CheckOutButton({
  hasCheckedIn,
  alreadyCheckedOut = false,
  onSuccess,
  onError,
  className = "",
}: CheckOutButtonProps) {
  // Local placeholder for toast. Wire this to the real toast hook when ready.
  const triggerToast = useCallback((options: { title: string; description: string; variant?: "default" | "destructive" }) => {
    console.log(`[Toast] ${options.variant === "destructive" ? "ERROR" : "SUCCESS"}: ${options.title} - ${options.description}`);
    // INTEGRATION POINT: If your project uses window.toast or another global alert mechanism, dispatch it here.
  }, []);

  const { mutate, isPending, isSuccess } = useCheckOut({
    onSuccess: (data) => {
      triggerToast({
        title: "Check-out Successful",
        description: `Checked out at ${new Date(data.checkOut!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total hours: ${data.workingHours}h.`,
        variant: "default",
      });
      onSuccess?.(data);
    },
    onError: (err) => {
      triggerToast({
        title: "Check-out Failed",
        description: err.message || "An error occurred during check-out.",
        variant: "destructive",
      });
      onError?.(err);
    },
  });

  const handleClick = useCallback(() => {
    mutate({});
  }, [mutate]);

  // Resolve states
  const isCheckedOut = alreadyCheckedOut || isSuccess;
  const isDisabled = !hasCheckedIn || isCheckedOut || isPending;

  if (isCheckedOut) {
    return (
      <Button
        disabled
        className={`bg-amber-600 text-white opacity-80 cursor-default ${className}`}
        aria-label="Already checked out for today"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 mr-2" aria-hidden="true" />
        Checked Out
      </Button>
    );
  }

  if (!hasCheckedIn) {
    return (
      <Button
        disabled
        variant="outline"
        className={`cursor-not-allowed opacity-50 ${className}`}
        aria-label="Cannot check out before checking in"
      >
        <LogOut className="h-4 w-4 shrink-0 mr-2" aria-hidden="true" />
        Check Out
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`bg-amber-600 hover:bg-amber-700 text-white ${className}`}
      aria-label="Check out for today"
      aria-live="polite"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin mr-2" aria-hidden="true" />
          Checking Out…
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 shrink-0 mr-2" aria-hidden="true" />
          Check Out
        </>
      )}
    </Button>
  );
}
