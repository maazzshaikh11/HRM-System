/**
 * PayrollPage.tsx
 *
 * Employee's payroll view — shows salary breakdown and payslip history.
 *
 * Integration dependencies:
 *   - Card, CardContent, CardHeader, CardTitle (@/components/ui/card)
 *   - Badge (@/components/ui/badge)
 *   - Button (@/components/ui/button)
 *   - Table (@/components/ui/table)
 */

import React from "react";
import { AlertCircle, RotateCcw, DollarSign, FileText, Download } from "lucide-react";
import { useMySalary, useMyPayslips } from "../hooks/usePayroll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function formatMonth(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    PROCESSING: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };
  return (
    <Badge className={`border text-xs font-semibold ${variants[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Salary Row
// ---------------------------------------------------------------------------

function SalaryRow({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-border/60 last:border-0 ${highlight ? "font-bold" : ""}`}>
      <span className={`text-sm ${highlight ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${highlight ? "text-foreground" : "text-foreground/80"}`}>{INR.format(amount)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PayrollPage() {
  const { data: salary, isLoading: isSalaryLoading, isError: isSalaryError, refetch: refetchSalary } = useMySalary();
  const { data: payslipsData, isLoading: isPayslipsLoading, isError: isPayslipsError } = useMyPayslips();

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
          <DollarSign className="h-4 w-4" />
          <span>Payroll</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Payroll</h1>
      </header>

      {/* ── Salary Breakdown ── */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Structure</CardTitle>
          <CardDescription>Your current monthly salary breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isSalaryLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted" />
              ))}
            </div>
          ) : isSalaryError ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Failed to load salary data.</p>
              <Button variant="outline" size="sm" onClick={() => refetchSalary()}>
                <RotateCcw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
          ) : !salary || salary.basic === 0 ? (
            <div className="text-center py-10 space-y-2">
              <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">Not Configured</p>
              <p className="text-xs text-muted-foreground/70">Your salary structure has not been set up yet.</p>
            </div>
          ) : (
            <div>
              <SalaryRow label="Basic Salary" amount={salary.basic} />
              <SalaryRow label="HRA" amount={salary.hra} />
              <SalaryRow label="LTA" amount={salary.lta} />
              <SalaryRow label="Other Allowances" amount={salary.otherAllowance} />
              <SalaryRow label="PF (Deduction)" amount={-salary.pf} />
              <SalaryRow label="Other Deductions" amount={-salary.deductions} />
              <div className="mt-3 pt-3 border-t-2 border-border">
                <SalaryRow label="Net Salary" amount={salary.netSalary} highlight />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payslip History ── */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>Your monthly payslip records</CardDescription>
        </CardHeader>
        <CardContent>
          {isPayslipsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-muted" />
              ))}
            </div>
          ) : isPayslipsError ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Failed to load payslips.
            </div>
          ) : !payslipsData?.payslips?.length ? (
            <div className="text-center py-10 space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">No Payslips</p>
              <p className="text-xs text-muted-foreground/70">No payslips have been generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslipsData.payslips.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{formatMonth(p.month, p.year)}</TableCell>
                      <TableCell>{INR.format(p.grossSalary)}</TableCell>
                      <TableCell className="font-semibold">{INR.format(p.netSalary)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" aria-label={`Download payslip for ${formatMonth(p.month, p.year)}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
