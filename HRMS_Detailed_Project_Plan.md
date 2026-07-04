# Human Resource Management System (HRMS)
## Detailed Project Plan — 8-Hour Build

**Tagline:** *Every workday, perfectly aligned.*
**Team target:** solo or small squad, single sprint day
**Stack:** React/Vite (TypeScript, Tailwind, shadcn/ui, Framer Motion) · Supabase (Auth, Postgres, Storage, Edge Functions, RLS) · No third-party APIs beyond Supabase

---

## 1. Vision & Judging Angle

Most hackathon HRMS submissions are CRUD forms wrapped in default component-library styling. The differentiator here is **execution polish, not feature count**: a small, tightly-scoped set of core HR workflows (auth, profile, attendance, leave, payroll visibility) executed with enterprise-grade visual design, live data-driven micro-interactions (status dots, animated counters, real-time approvals), and zero reliance on brittle external integrations. Every feature is chosen because it is both in the Problem Statement *and* cheap to make delightful.

**Guiding rule used throughout this plan:** when two implementations solve the same requirement, always take the one with the better UX-per-hour ratio.

---

## 2. Source Materials Reconciled

This plan synthesizes two source documents that disagree on one point:

| Topic | PDF (Problem Statement) says | Excalidraw (Wireframe) says | Decision |
|---|---|---|---|
| Account creation | Open self sign-up with role selection (Employee/HR) | Employees cannot self-register; Admin/HR creates accounts with an auto-generated Login ID (`OIJODO20220001` format) and system-generated temp password | **Follow the wireframe.** It's more realistic to a real HRMS, more secure, and is a stronger visual/UX moment for judges (live-generated credentials, forced password reset) than a generic sign-up form. |

All other requirements from both sources are aligned and are carried through as-is.

---

## 3. In-Scope Feature Set (Mapped to Problem Statement Sections)

| PRD Section | Feature | Build Epic |
|---|---|---|
| 3.1 Authentication & Authorization | Admin-created accounts, auto Login ID, Sign In, forced reset | Epic B |
| 3.2 Dashboard | Role-based Employee/Admin dashboards | Epic G |
| 3.3 Employee Profile Management | View/Edit profile (My Profile, Private Info, Resume, Salary Info) | Epic C |
| 3.4 Attendance Management | Check-in/out, day/week/month views, admin all-employee view | Epic D |
| 3.5 Leave & Time-Off Management | Apply, calendar picker, approve/reject, allocations | Epic E |
| 3.6 Payroll/Salary Management | Auto-calculated components, admin edit, employee read-only view | Epic F |

Full ticket-level breakdown lives in the companion **Feature Ticket List** document.

---

## 4. Explicitly Out of Scope (for this 8-hour build)

To protect the timeline, the following are **deliberately excluded** — call this out proactively in the demo so judges see it as a scoping decision, not an oversight:

- Email/SMS delivery of credentials or notifications (no third-party mail API within scope; credentials shown on-screen to admin instead)
- Downloadable/printable payslip PDF generation
- Multi-company / multi-tenant support
- Biometric or geofenced attendance
- Native mobile app (responsive web only)
- Advanced analytics/reporting dashboards beyond the headline stat cards

---

## 5. Architecture Overview

```
┌─────────────────────────┐        ┌──────────────────────────┐
│        Frontend         │  REST  │         Supabase         │
│  React + Vite + TS      │◄──────►│  Postgres + RLS policies │
│  Tailwind + shadcn/ui   │  Auth  │  Auth (email/password)   │
│  Framer Motion          │  RT    │  Storage (avatars/docs)  │
│                          │  subs  │  Edge Function:          │
│  Route guard by role    │        │   create-employee        │
└─────────────────────────┘        └──────────────────────────┘
```

- **Auth:** Supabase Auth, email+password. Admin-created users via an Edge Function using the Supabase service role key (never exposed client-side).
- **Data:** Single Postgres schema, secured entirely by Row Level Security — no custom backend server needed.
- **Realtime:** Supabase Realtime channels (or simple refetch-on-focus) to reflect attendance/leave changes instantly across views (e.g., admin approves leave → employee's balance updates without refresh).
- **Storage:** Supabase Storage buckets for avatars, resumes, certifications, and sick-leave attachments, with per-user folder policies.

---

## 6. Data Model Summary

- `profiles` — identity + HR fields (see Ticket-002 for full field list)
- `attendance` — one row per employee per date, with check_in/out, hours, status
- `leave_requests` — leave applications with type, date range, status, attachments
- `leave_allocations` — per-employee, per-type balance
- `salary_structures` — per-employee wage + computed components

All tables reference `profiles.id`; RLS restricts row access by `auth.uid()` unless role = `admin`.

---

## 7. Role-Based Experience Summary

**Employee can:**
- View own profile (My Profile / Private Info / Resume), edit address/phone/avatar
- Check in / check out; view own attendance calendar + history
- Apply for leave, view own requests + balances
- View own salary breakdown (read-only)

**Admin / HR Officer can additionally:**
- Create new employees (auto Login ID + temp password)
- View/edit any employee's full profile
- View attendance for all employees on any date
- Approve/reject leave requests with comments
- Define and edit salary structures per employee
- See dashboard-level org stats (headcount, present today, pending approvals)

---

## 8. Design Language

- **Palette:** deep navy/indigo primary (trust, enterprise feel), warm neutral grays, semantic status colors — green (present/approved), amber (absent/pending), blue (on leave), red (rejected).
- **Typography:** one clean sans-serif (e.g., Inter) — tight tracking for headings, comfortable line-height for body/tables.
- **Cards over tables** wherever the data is scannable (employee directory, leave balances); **tables** only where dense comparison is needed (attendance logs).
- **Status is always visual first, text second** — colored dot/icon before any status label, consistent everywhere (directory cards, leave badges, dashboard stats).
- **Motion with restraint:** entrance stagger on grids, spring-based modals, count-up stat numbers, skeleton loaders — never gratuitous animation that delays task completion.

---

## 9. Hour-by-Hour Timeline

| Hours | Focus | Key Tickets |
|---|---|---|
| 0–1 | Scaffold app, design tokens, component library; Supabase schema + RLS + seed data | 001, 002 |
| 1–2 | Admin-create-employee Edge Function, Sign In flow, forced reset, app shell (sidebar/topbar) | 003, 004, 005 |
| 2–3.5 | Employee Directory grid w/ live status badges; Profile view tabs | 006, 007 |
| 3.5–4.5 | Check-in/out widget; employee attendance calendar view | 009, 010 |
| 4.5–5.5 | Leave allocations, apply-for-leave modal, my-requests list, admin approval workflow | 012, 013, 014, 015 |
| 5.5–6.5 | Salary structure auto-calc engine (admin) + employee read-only payroll view | 016, 017 |
| 6.5–7.5 | Dashboards (stat cards, quick access), responsive + accessibility pass | 019, 022 |
| 7.5–8 | Buffer: bug bash, seed realistic demo data, rehearse demo script; stretch tickets (008, 011, 018, 020, 021) only if time remains |

---

## 10. Demo Script (5 Minutes)

1. **Admin creates an employee live** → show auto-generated Login ID + temp password appear instantly (10s "wow" moment).
2. **Sign in as that employee**, forced password reset → lands on Employee Dashboard.
3. **Check in** from the topbar → status dot on Directory flips green in real time.
4. **Apply for leave** with the calendar picker → switch to Admin, show it appear in Pending Approvals on the dashboard, approve it with one click → switch back to Employee, balance card updates.
5. **Open Salary Info as Admin**, change Wage → watch every component recompute live.
6. Close on the **Admin Dashboard** stat cards animating in, to leave judges with the most "enterprise SaaS" impression last.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Realtime sync adds complexity under time pressure | Fall back to refetch-on-navigation/interval if Supabase Realtime wiring slips; visually indistinguishable in a live demo |
| Edge Function for employee creation blocked by local setup issues | Have a fallback seed script that pre-creates a few "admin-created" demo accounts so the live-creation moment can be skipped if broken |
| Scope creep into P2 tickets before P0 is solid | Hard timeboxes per epic above; P2 tickets are explicitly last and droppable |
| Salary calculation edge cases (rounding, over-100% allocation) | Cap component sum at Wage in the UI layer; round to 2 decimals consistently |

---

## 12. Deliverables Checklist

- [x] Detailed project plan (this document)
- [ ] Functional & Non-Functional Requirements (Word doc)
- [x] Feature Ticket List (AI-prompt-ready)
- [ ] Working deployed build + demo script rehearsal
