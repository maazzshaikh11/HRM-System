/**
 * WorkingTimer.tsx
 *
 * A timer component that shows elapsed working time since check-in.
 * It runs internally to avoid triggering re-renders in parent components.
 *
 * Props:
 *   checkInTime  - ISO datetime string or Date object representing check-in.
 *   checkOutTime - ISO datetime string or Date object representing check-out (if already checked out).
 *                  If provided, the timer stops updating and displays the fixed duration.
 *   className    - Optional extra Tailwind styling.
 */

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkingTimerProps {
  /** The check-in timestamp. */
  checkInTime: string | Date;
  /** The check-out timestamp (if the user has checked out). */
  checkOutTime?: string | Date | null;
  /** Optional styling classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Format milliseconds into HH:MM:SS
 */
function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Live timer component tracking elapsed time since check-in.
 * Automatically stops updating if a checkout time is present.
 */
export function WorkingTimer({
  checkInTime,
  checkOutTime,
  className = "",
}: WorkingTimerProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    const start = new Date(checkInTime).getTime();

    // If checkOutTime is provided, we display a static duration
    if (checkOutTime) {
      const end = new Date(checkOutTime).getTime();
      setElapsedMs(Math.max(0, end - start));
      return;
    }

    // Otherwise, start the interval to update the timer every second
    const updateTimer = () => {
      const now = Date.now();
      setElapsedMs(Math.max(0, now - start));
    };

    // Initial update
    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    // Cleanup interval on unmount or when checkInTime / checkOutTime change
    return () => {
      clearInterval(intervalId);
    };
  }, [checkInTime, checkOutTime]);

  const formattedTime = formatDuration(elapsedMs);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm font-semibold tabular-nums text-secondary-foreground border border-border/50 ${className}`}
      role="timer"
      aria-label={`Working duration: ${formattedTime}`}
      aria-live="off"
    >
      <Timer className="h-4 w-4 text-muted-foreground animate-pulse" aria-hidden="true" />
      <span>{formattedTime}</span>
    </div>
  );
}
