/**
 * EmployeeDashboard.tsx
 *
 * Employee home dashboard — shows today's attendance status,
 * leave balance summary, salary summary, and profile completion.
 *
 * Integration dependencies:
 *   - useAttendance  (@/features/attendance/hooks/useAttendance)
 *   - useLeave       (@/features/leave/hooks/useLeave)
 *   - useMySalary    (@/features/payroll/hooks/usePayroll)
 *   - useProfile     (@/features/employee/hooks/useProfile)
 *   - Shadcn UI components
 */

import React, { useMemo } from "react";
import { Clock, CalendarDays, DollarSign, User, TrendingUp, AlertCircle } from "lucide-react";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useLeave } from "@/features/leave/hooks/useLeave";
import { useMySalary } from "@/features/payroll/hooks/usePayroll";
import { useProfile } from "@/features/employee/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClass,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  loading?: boolean;
}) {
  return (
    <Card className="hover:-translate-y-0.5 transition-transform duration-200">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-lg p-3 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-6 w-24 mt-1 rounded bg-muted animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-foreground truncate">{value}</p>
          )}
          {sub && !loading && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmployeeDashboard() {
  const todayStr = useMemo(() => getTodayDateString(), []);

  const { data: attendanceData, isLoading: isAttendanceLoading } = useAttendance({
    startDate: todayStr,
    endDate: todayStr,
    limit: 1,
  });

  const { data: leaveData, isLoading: isLeaveLoading } = useLeave({ limit: 5 });
  const { data: salary, isLoading: isSalaryLoading } = useMySalary();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const todayRecord = attendanceData?.records?.[0] ?? null;

  const attendanceStatus = todayRecord
    ? todayRecord.checkOut
      ? `Checked out • ${todayRecord.workingHours?.toFixed(1) ?? "?"} hrs`
      : "Currently checked in"
    : "Not checked in";

  const pendingLeaves = leaveData?.records?.filter((r) => r.status === "PENDING").length ?? 0;

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const p = profile.profile;
    const fields = [p?.phone, p?.address, p?.city, p?.designation, p?.bio, p?.gender, p?.dateOfBirth];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const isLoading = isAttendanceLoading || isLeaveLoading || isSalaryLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pulse" aria-busy="true">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-56 rounded-xl bg-muted" />
          <div className="h-56 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="pb-4 border-b border-border/60">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {profile?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
        <StatCard
          icon={Clock}
          label="Today's Attendance"
          value={todayRecord ? (todayRecord.checkOut ? "Done" : "Active") : "Absent"}
          sub={attendanceStatus}
          colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={CalendarDays}
          label="Pending Leaves"
          value={String(pendingLeaves)}
          sub="Awaiting approval"
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={DollarSign}
          label="Net Salary"
          value={salary?.netSalary ? INR.format(salary.netSalary) : "N/A"}
          sub="This month"
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={User}
          label="Profile Complete"
          value={`${profileCompletion}%`}
          sub={profileCompletion < 100 ? "Update your profile" : "All good!"}
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
      </section>

      {/* Lower Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leave Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Your latest 5 leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            {!leaveData?.records?.length ? (
              <div className="text-center py-8 space-y-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No leave requests found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveData.records.map((leave) => {
                  const statusColor: Record<string, string> = {
                    PENDING: "bg-amber-500/15 text-amber-600 border-amber-500/20",
                    APPROVED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
                    REJECTED: "bg-rose-500/15 text-rose-600 border-rose-500/20",
                    CANCELLED: "bg-muted text-muted-foreground border-muted",
                  };
                  return (
                    <div key={leave.id} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{leave.type} Leave</p>
                        <p className="text-xs text-muted-foreground">{leave.startDate} → {leave.endDate}</p>
                      </div>
                      <Badge className={`border text-xs ${statusColor[leave.status] ?? ""}`}>
                        {leave.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Your check-in details for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!todayRecord ? (
              <div className="text-center py-6 space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Not checked in yet.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Check In</span>
                  <span className="text-sm font-semibold text-foreground">
                    {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Check Out</span>
                  <span className="text-sm font-semibold text-foreground">
                    {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Hours</span>
                  <span className="text-sm font-semibold text-foreground">
                    {todayRecord.workingHours != null ? `${todayRecord.workingHours.toFixed(1)} hrs` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/60">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</span>
                  <Badge className="text-xs bg-indigo-500/15 text-indigo-600 border-indigo-500/20 border">
                    {todayRecord.status}
                  </Badge>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-border/60">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Profile</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
