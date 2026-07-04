/**
 * ProfilePage.tsx
 *
 * Employee's own profile view page.
 * Displays personal info, contact details, and avatar.
 *
 * Integration dependencies:
 *   - Button  (@/components/ui/button)
 *   - Card    (@/components/ui/card)
 *   - Badge   (@/components/ui/badge)
 *   - Avatar  (@/components/ui/avatar)
 */

import React from "react";
import { AlertCircle, RotateCcw, User, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Info Row
// ---------------------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/60 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { data: employee, isLoading, isError, error, refetch, isFetching } = useProfile();

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse" aria-busy="true">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-64 rounded-xl bg-muted" />
          <div className="md:col-span-2 h-64 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <main className="container max-w-lg mx-auto px-4 py-16 text-center" role="alert">
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/25 bg-destructive/5 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Unable to load profile</h2>
            <p className="text-sm text-muted-foreground">
              {error?.message || "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RotateCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const profile = employee?.profile;

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
          <User className="h-4 w-4" />
          <span>Employee Profile</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left — Avatar + Identity */}
        <Card className="flex flex-col items-center text-center p-6 space-y-4">
          <Avatar className="h-24 w-24 text-2xl ring-2 ring-primary/20">
            <AvatarImage
              src={profile?.avatarUrl ?? undefined}
              alt={employee?.name ?? "Profile photo"}
              loading="lazy"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {employee?.name ? getInitials(employee.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">{employee?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.designation || "—"}</p>
            <Badge variant="secondary" className="text-xs mt-1">
              {employee?.employeeId}
            </Badge>
          </div>
          <div className="w-full pt-2 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
            <p><span className="font-semibold">Role:</span> {employee?.role}</p>
            <p><span className="font-semibold">Dept:</span> {employee?.department?.name || "—"}</p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span className={employee?.isActive ? "text-emerald-600" : "text-rose-600"}>
                {employee?.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </Card>

        {/* Right — Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Personal contact and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <InfoRow icon={Mail} label="Email" value={employee?.email} />
              <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
              <InfoRow icon={MapPin} label="City" value={profile?.city} />
              <InfoRow icon={MapPin} label="State" value={profile?.state} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Date of birth, gender and other information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(profile?.dateOfBirth)} />
              <InfoRow icon={User} label="Gender" value={profile?.gender} />
              <InfoRow icon={User} label="Marital Status" value={profile?.maritalStatus} />
              <InfoRow icon={Briefcase} label="Joining Date" value={formatDate(profile?.joiningDate)} />
            </CardContent>
          </Card>

          {profile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
