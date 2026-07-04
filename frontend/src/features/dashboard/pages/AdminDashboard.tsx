/**
 * AdminDashboard.tsx
 *
 * Admin home dashboard — shows workforce KPI cards:
 * total employees, present today, absent today, pending leaves.
 *
 * Integration dependencies:
 *   - Shadcn UI Card, Badge, Button
 *   - useAdminDashboardStats (dashboard feature hook)
 */

import React from "react";
import { Users, UserCheck, UserMinus, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { useAdminDashboardStats } from "../hooks/useDashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  icon: Icon,
  label,
  value,
  borderColor,
  iconClass,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  borderColor: string;
  iconClass: string;
  loading?: boolean;
}) {
  return (
    <Card className={`border-l-4 ${borderColor} hover:-translate-y-0.5 transition-transform duration-200`}>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-lg p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-8 w-16 mt-1 rounded bg-muted animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch, isFetching } = useAdminDashboardStats();

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of today's workforce metrics</p>
        </div>
        {isFetching && (
          <span className="text-xs text-muted-foreground/60 animate-pulse">Refreshing...</span>
        )}
      </header>

      {/* Error State */}
      {isError && (
        <div
          className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/25 bg-destructive/5 space-y-4 max-w-md mx-auto text-center"
          role="alert"
        >
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Unable to load dashboard</h2>
            <p className="text-sm text-muted-foreground">An error occurred fetching workforce stats.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RotateCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      )}

      {/* KPI Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Workforce KPIs">
        <KpiCard
          icon={Users}
          label="Total Employees"
          value={stats?.totalEmployees ?? 0}
          borderColor="border-l-indigo-500"
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          loading={isLoading}
        />
        <KpiCard
          icon={UserCheck}
          label="Present Today"
          value={stats?.presentToday ?? 0}
          borderColor="border-l-emerald-500"
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          loading={isLoading}
        />
        <KpiCard
          icon={UserMinus}
          label="Absent Today"
          value={stats?.absentToday ?? 0}
          borderColor="border-l-rose-500"
          iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          loading={isLoading}
        />
        <KpiCard
          icon={Clock}
          label="Pending Leaves"
          value={stats?.pendingLeaves ?? 0}
          borderColor="border-l-amber-500"
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          loading={isLoading}
        />
      </section>

      {/* Placeholder for Charts / Quick Actions */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workforce Overview</CardTitle>
            <CardDescription>
              Chart visualizations will be integrated here once the analytics module is released.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">Charts coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start text-sm" asChild>
              <a href="/leave">Review Leave Requests</a>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" asChild>
              <a href="/payroll">Manage Payroll</a>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" asChild>
              <a href="/profile">Employee Directory</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
