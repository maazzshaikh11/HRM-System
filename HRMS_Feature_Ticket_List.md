# HRMS — Feature Ticket List
**Sprint:** 8-Hour Hackathon Build · **Stack:** React/Next.js (or Vite) + Supabase (Auth, Postgres, Storage, RLS) · **Design goal:** enterprise-grade polish, minimal external APIs

> How to use this doc: each ticket is self-contained and can be pasted directly into Claude Code / Cursor / Copilot as a build prompt. Tickets are ordered so dependencies resolve top-to-bottom. Priority: **P0 = must-have for launch demo, P1 = should-have, P2 = nice-to-have (cut first if time runs short)**.

---

## Epic A — Foundation

### TICKET-001: Project Scaffold & Design System
**Priority:** P0
**Description:** Set up the frontend project (Vite + React + TypeScript + Tailwind CSS + shadcn/ui or Radix). Establish a design token system: color palette (primary brand color, neutral grays, semantic colors for status — green/present, amber/absent, blue/on-leave, red/rejected), typography scale, spacing scale, border-radius, shadow levels. Build a shared component library: Button, Card, Badge, Avatar, Modal, Dropdown, Tabs, Input, Select, DatePicker, Toast, Sidebar shell, Topbar shell.
**Acceptance Criteria:**
- App boots with Tailwind configured and design tokens defined in `tailwind.config` / CSS variables.
- A `/components/ui` library exists with the components listed above, all responsive and keyboard-accessible.
- A style guide page (or Storybook-lite route) renders every component variant for quick visual QA.
**Dependencies:** None.
**AI Prompt:** "Scaffold a Vite + React + TypeScript + Tailwind project. Create a design-token-based theme (CSS variables for colors, spacing, radius, shadows) and a `/components/ui` library with Button, Card, Badge, Avatar, Modal, Dropdown, Tabs, Input, Select, DatePicker, and Toast components, all built with accessible Radix primitives and Tailwind styling."

---

### TICKET-002: Supabase Project, Schema & RLS Policies
**Priority:** P0
**Description:** Create Supabase project. Design and migrate the schema: `profiles` (id, employee_code, name, email, phone, role[employee/admin], department, job_position, manager_id, company, location, date_of_birth, gender, nationality, marital_status, residing_address, personal_email, avatar_url, date_of_joining, pan_no, uan_no, bank_account, bank_name, ifsc_code, about, hobbies), `attendance` (id, employee_id, date, check_in, check_out, work_hours, extra_hours, status[present/absent/half-day/leave]), `leave_requests` (id, employee_id, type[paid/sick/unpaid], start_date, end_date, days, remarks, attachment_url, status[pending/approved/rejected], admin_comment, reviewed_by), `leave_allocations` (id, employee_id, type, days_available), `salary_structures` (id, employee_id, wage, basic_pct, hra_pct, standard_allowance, performance_bonus_pct, lta_pct, pf_employee_pct, pf_employer_pct, professional_tax). Write Row Level Security policies so employees can only read/write their own rows, while admins/HR can read/write all.
**Acceptance Criteria:**
- All tables created with correct types, foreign keys, and default values.
- RLS enabled on every table; a non-admin user querying another employee's row returns nothing.
- Seed script inserts 1 admin + 8 demo employees with attendance/leave/salary sample data.
**Dependencies:** None.
**AI Prompt:** "Using Supabase, write SQL migrations for tables: profiles, attendance, leave_requests, leave_allocations, salary_structures (fields as specified). Add Row Level Security policies so employees only access their own records and admins access all. Include a seed script with 1 admin and 8 sample employees with realistic attendance/leave/salary data."

---

## Epic B — Authentication & Identity

### TICKET-003: Auto-Generated Employee ID & Admin-Created Accounts
**Priority:** P0
**Description:** Per the wireframe spec, employees do not self-register. Admin/HR creates a new employee via a form (name, email, phone, department, role, date of joining); the system auto-generates a Login ID in the format `[Company initials][first 2 letters of first+last name][year of joining][serial number]` (e.g. `OIJODO20220001`) and a random temporary password, then creates the Supabase Auth user (via Supabase Admin API / Edge Function) and the linked `profiles` row.
**Acceptance Criteria:**
- Admin "Add Employee" form creates a working login with a generated Login ID matching the spec format.
- Temporary password is shown once to the admin (or emailed if SMTP is trivially available; otherwise displayed on-screen with a "copy" button — no external email API required).
- Employee is forced to set a new password on first login.
**Dependencies:** TICKET-002.
**AI Prompt:** "Build a Supabase Edge Function that creates a new employee auth user with a generated temporary password, plus a profile row with an auto-generated Login ID in the format [2-letter company code][first 2 letters of first & last name][joining year][4-digit serial]. Expose an Admin-only 'Add Employee' React form that calls this function and displays the generated credentials once."

### TICKET-004: Sign In + First-Login Password Reset
**Priority:** P0
**Description:** Build the Sign In screen matching the wireframe (logo, Login ID/Email field, password field, error states). On successful auth, check a `must_reset_password` flag; if true, redirect to a "Set New Password" screen before allowing dashboard access. On failure, show a clear inline error without revealing whether the email exists.
**Acceptance Criteria:**
- Wrong credentials show a non-specific error message.
- Successful login redirects Admin → Admin Dashboard, Employee → Employee Dashboard.
- First-time login always forces a password reset before proceeding.
**Dependencies:** TICKET-002, TICKET-003.
**AI Prompt:** "Build a Sign In page using Supabase Auth (email + password) matching this layout: centered card, logo, Login ID/Email field, password field, 'Sign In' button. On success, check a must_reset_password flag on the profile and route accordingly; on failure show a generic error toast."

### TICKET-005: Role-Based Route Guarding & App Shell
**Priority:** P0
**Description:** Build the persistent app shell: left sidebar (Company logo, nav: Employees, Attendance, Time Off, Settings) and topbar (search, avatar with dropdown → "My Profile", "Log Out"). Wrap all routes in a role-aware guard so Admin-only routes (Employee Directory management, Payroll editing, Approvals) 404/redirect for regular employees.
**Acceptance Criteria:**
- Sidebar/topbar render identically to wireframe structure and are present on every authenticated page.
- Avatar dropdown opens on click with "My Profile" and "Log Out" options.
- Employee attempting to hit an admin-only route is redirected with a friendly "Not authorized" state.
**Dependencies:** TICKET-004.
**AI Prompt:** "Build a persistent app shell (sidebar with logo + Employees/Attendance/Time Off/Settings nav, topbar with search bar and avatar dropdown containing 'My Profile' and 'Log Out'). Add a role-based route guard component that redirects non-admins away from admin-only routes with a friendly message."

---

## Epic C — Employee Directory & Profile

### TICKET-006: Employee Directory Grid with Live Status Badges
**Priority:** P0
**Description:** Build the Employees list as a card grid. Each card shows avatar, name, department, and a status indicator in the top-right corner: 🟢 green dot = present (checked in today), ✈️ = on approved leave today, 🟡 amber dot = absent (no check-in, no approved leave). Cards are clickable → open that employee's profile in read-only view. Include a search bar (name/department) and a department filter chip row.
**Acceptance Criteria:**
- Status dot/icon is computed live from today's attendance + leave_requests tables, matching the 3-state spec exactly.
- Search filters the grid instantly (client-side debounce ok).
- Clicking a card opens the profile view in non-editable mode; admins additionally see an "Edit" button.
**Dependencies:** TICKET-002, TICKET-005.
**AI Prompt:** "Build an Employee Directory grid of cards (avatar, name, department, status badge). Compute status per employee as: green dot if checked in today, airplane icon if on approved leave today, amber dot otherwise. Add a debounced search input and department filter chips. Cards link to a read-only profile view; add an Edit button visible only to admins."

### TICKET-007: Employee Profile View — Tabs (My Profile / Private Info / Resume)
**Priority:** P0
**Description:** Build the profile page with tabs: **My Profile** (name, mobile, email, department, job position, manager, company, location, "About", "What I love about my job", "Interests & hobbies"), **Private Info** (DOB, residing address, personal email, gender, nationality, marital status, bank account/bank name/IFSC, PAN, UAN), **Resume** (skills as tags with "+ Add Skill", certifications list, resume file upload/download via Supabase Storage).
**Acceptance Criteria:**
- All fields from the PRD/wireframe render correctly for the logged-in user's own profile.
- Employees can edit only: address, phone, profile picture (per PRD); all other fields are read-only for employees.
- Resume/certification files upload to Supabase Storage and are downloadable.
**Dependencies:** TICKET-002, TICKET-006.
**AI Prompt:** "Build a tabbed Employee Profile page (My Profile / Private Info / Resume) rendering the specified fields. Employees can edit only phone, address, and avatar; everything else is read-only. Resume/certificates upload to Supabase Storage with a download link. Skills render as removable tags with an 'Add Skill' input."

### TICKET-008: Admin Full Profile Edit
**Priority:** P1
**Description:** Allow Admin/HR to edit every field on any employee's profile (all tabs unlocked) from the read-only profile view via an "Edit" toggle.
**Acceptance Criteria:**
- Admin sees an Edit button on any employee profile; toggling it makes all fields editable inline.
- Save persists to `profiles` and shows a success toast; Cancel discards changes.
**Dependencies:** TICKET-007.
**AI Prompt:** "Add an admin-only 'Edit' mode to the Employee Profile page that unlocks every field (across all tabs) for inline editing, with Save/Cancel actions and optimistic UI updates against Supabase."

---

## Epic D — Attendance

### TICKET-009: Check-In / Check-Out Systray Widget
**Priority:** P0
**Description:** Persistent topbar widget with a "Check In" button; once clicked, it records `check_in` timestamp, flips to "Check Out", and on check-out records `check_out`, computes `work_hours`/`extra_hours`, and updates today's attendance row to `present`. Status dot on the employee's own card updates from red/amber to green immediately after check-in (per wireframe note).
**Acceptance Criteria:**
- Check In creates today's attendance row if absent; Check Out updates it with computed hours.
- Widget state persists across refresh (reflects DB state for today).
- Directory status badge reflects the change without a full page reload.
**Dependencies:** TICKET-002, TICKET-005.
**AI Prompt:** "Build a topbar Check In / Check Out widget backed by Supabase. Check In upserts today's attendance row with a check_in timestamp and status='present'; Check Out sets check_out and computes work_hours/extra_hours. Use Supabase realtime or a shared query cache so the Employee Directory status badge updates immediately."

### TICKET-010: Employee Attendance Calendar & List View (Self)
**Priority:** P0
**Description:** Build the employee's own Attendance page: month navigator (◀ Oct 2025 ▶), a calendar showing Present/Absent/Leave markers per day, and a table below listing Date, Check In, Check Out, Work Hours, Extra Hours for the selected month, plus a summary strip (Total working days, Count of days present, Leaves count).
**Acceptance Criteria:**
- Calendar and table both reflect the selected month from the `attendance` table for the logged-in employee only.
- Summary counts recompute correctly when month changes.
**Dependencies:** TICKET-002, TICKET-009.
**AI Prompt:** "Build an Attendance page for employees: a month-switcher calendar with Present/Absent/Leave day markers, and a table of Date/Check In/Check Out/Work Hours/Extra Hours for that month, plus a summary strip showing total working days, days present, and leave count. Query only the logged-in employee's attendance rows."

### TICKET-011: Admin Attendance List View (All Employees)
**Priority:** P1
**Description:** Build the Admin variant of the Attendance page: default view is all employees present *today*, with a searchable/sortable table (Employee, Check In, Check Out, Work Hours, Extra Hours, Status) and a date picker to view any past day.
**Acceptance Criteria:**
- Default load shows current day, all employees.
- Search filters by employee name; date picker reloads the table for the chosen date.
- Only accessible to Admin/HR role.
**Dependencies:** TICKET-010, TICKET-005.
**AI Prompt:** "Build an Admin Attendance view: a searchable table of all employees' attendance for a selected date (default today), columns Employee/Check In/Check Out/Work Hours/Extra Hours/Status, with a date picker and name search. Restrict access to admin/HR role."

---

## Epic E — Time Off / Leave

### TICKET-012: Leave Balance Cards (Allocation)
**Priority:** P0
**Description:** Build the "Time Off" landing header showing allocation cards per leave type (e.g. "Paid Time Off — 24 Days Available", "Sick Time Off — 07 Days Available"), driven by `leave_allocations` minus approved/consumed days.
**Acceptance Criteria:**
- Cards show correct remaining balance after approved leaves are deducted.
- Balances update immediately after an approval changes status.
**Dependencies:** TICKET-002.
**AI Prompt:** "Build allocation summary cards for Time Off (e.g. Paid Time Off, Sick Time Off) showing days available = allocated days minus approved leave days taken, computed live from Supabase."

### TICKET-013: Apply for Leave Modal
**Priority:** P0
**Description:** "+ New" button opens a modal: Employee (auto-filled, read-only), Leave Type (Paid/Sick/Unpaid dropdown), Start Date & End Date (calendar range picker), auto-computed Days, Remarks textarea, and a file attachment field (shown only when Sick Leave is selected, for medical certificate) uploading to Supabase Storage. Submit creates a `pending` leave_request.
**Acceptance Criteria:**
- Date range picker computes `days` automatically and blocks past dates.
- Attachment field appears conditionally for Sick Leave and uploads successfully.
- Submitting inserts a `pending` row and closes the modal with a success toast; Discard closes without saving.
**Dependencies:** TICKET-002, TICKET-012.
**AI Prompt:** "Build an 'Apply for Leave' modal with: leave type dropdown (Paid/Sick/Unpaid), calendar date-range picker computing total days automatically, a remarks textarea, and a conditional file upload (visible only for Sick Leave) to Supabase Storage. Submit inserts a pending row into leave_requests; include Submit and Discard actions."

### TICKET-014: My Time Off List (Employee)
**Priority:** P0
**Description:** Table/list of the logged-in employee's own leave requests: Name, Start Date, End Date, Type, Status badge (Pending/Approved/Rejected, color-coded).
**Acceptance Criteria:**
- List only shows the current employee's requests, newest first.
- Status badge colors match global status color tokens.
**Dependencies:** TICKET-013.
**AI Prompt:** "Build a list view of the logged-in employee's own leave requests (Start Date, End Date, Type, color-coded Status badge), sorted newest first, reading from Supabase leave_requests filtered by the current user."

### TICKET-015: Admin Leave Approval Workflow
**Priority:** P0
**Description:** Admin/HR variant of the Time Off list shows requests from *all* employees with Approve/Reject buttons and an optional comment field. Approving/rejecting updates status, `admin_comment`, and `reviewed_by`, and instantly reflects in the employee's own list and leave balance.
**Acceptance Criteria:**
- Admin sees all pending requests with working Approve/Reject actions and comment capture.
- Status change is reflected in the employee's balance cards and list without manual refresh.
**Dependencies:** TICKET-014, TICKET-005.
**AI Prompt:** "Build the Admin Time Off view: a table of all leave requests with Approve/Reject buttons and an optional comment field. On action, update status/admin_comment/reviewed_by in Supabase and ensure the employee's balance and list reflect it immediately (Supabase realtime or refetch)."

---

## Epic F — Payroll / Salary (Admin-Configured, Auto-Calculated)

### TICKET-016: Salary Structure Engine (Admin-Only Tab)
**Priority:** P1
**Description:** Build the "Salary Info" tab (visible only to Admin) on an employee's profile: input Wage (monthly), then auto-calculate Basic (50% of wage), HRA (50% of Basic), Standard Allowance (fixed ₹4,167 default, editable), Performance Bonus (% of Basic), Leave Travel Allowance (% of Basic), Fixed Allowance (= Wage − sum of all other components), PF Employee/Employer (12% of Basic each, editable rate), Professional Tax (fixed ₹200, editable). All values recompute live as Wage or any percentage changes, and the UI blocks totals from exceeding the defined Wage.
**Acceptance Criteria:**
- Changing Wage recalculates every dependent component in real time.
- Sum of components never exceeds Wage; UI shows a validation warning if it would.
- Saved structure persists to `salary_structures` and is only editable by Admin.
**Dependencies:** TICKET-002, TICKET-007.
**AI Prompt:** "Build an Admin-only Salary Info tab where entering a monthly Wage auto-calculates: Basic (50% of wage), HRA (50% of Basic), Standard Allowance (default ₹4167, editable), Performance Bonus (% of Basic), LTA (% of Basic), Fixed Allowance (wage minus sum of other components), PF Employee/Employer (12% of Basic, editable rate), Professional Tax (default ₹200). All fields recompute live and the form warns if the component total exceeds the wage. Persist to Supabase, admin-editable only."

### TICKET-017: Employee Payroll View (Read-Only)
**Priority:** P1
**Description:** Read-only "Salary Info" view for employees showing their own current wage breakdown, mirroring the same components as TICKET-016 but with no edit controls.
**Acceptance Criteria:**
- Employee sees an accurate, nicely formatted breakdown of their own salary_structures row.
- No input is editable; no other employee's salary is ever fetched (enforced by RLS from TICKET-002).
**Dependencies:** TICKET-016.
**AI Prompt:** "Build a read-only Salary Info view for the logged-in employee, displaying their salary_structures breakdown (Wage, Basic, HRA, Standard Allowance, Bonus, LTA, Fixed Allowance, PF, Professional Tax) in a clean summary layout with no editable fields."

### TICKET-018: Payslip Days Computation from Attendance
**Priority:** P2
**Description:** Compute "payable days" per employee per month = total working days − unpaid leave days − missing/absent attendance days, and surface it as a read-only figure on the Admin payroll view (does not need to generate an actual downloadable payslip PDF within the 8-hour scope).
**Acceptance Criteria:**
- Payable days figure correctly subtracts unpaid leave and absent days from total working days for the selected month.
- Figure is visible to Admin next to the employee's salary breakdown.
**Dependencies:** TICKET-010, TICKET-016.
**AI Prompt:** "Add a computed 'Payable Days' metric to the Admin payroll view: total working days in month minus unpaid-leave days minus absent days (from the attendance and leave_requests tables), shown read-only next to the salary breakdown."

---

## Epic G — Polish / Wow-Factor (highest UX value per effort)

### TICKET-019: Dashboard Overview Widgets
**Priority:** P1
**Description:** Employee Dashboard: quick-access cards (Profile, Attendance, Leave Requests, Logout) plus a "today at a glance" strip (check-in status, leave balance snippet). Admin Dashboard: headline stats (Total Employees, Present Today, On Leave Today, Pending Approvals) as animated counter cards, plus a compact "Pending Leave Approvals" mini-list with one-click Approve/Reject.
**Acceptance Criteria:**
- Stat cards animate on mount (count-up) and are backed by real Supabase counts, not static numbers.
- Admin can approve/reject directly from the dashboard mini-list.
**Dependencies:** TICKET-005, TICKET-015.
**AI Prompt:** "Build role-based dashboard home pages: Employee dashboard with quick-access cards (Profile/Attendance/Leave Requests/Logout) and a today-at-a-glance strip; Admin dashboard with animated count-up stat cards (Total Employees, Present Today, On Leave Today, Pending Approvals) and a compact pending-approvals mini-list with inline Approve/Reject."

### TICKET-020: Global Search & Command Palette
**Priority:** P2
**Description:** Topbar search becomes a `⌘K` command palette that fuzzy-searches employees, jumps to Attendance/Time Off/Settings, and (for admins) jumps straight to "Add Employee."
**Acceptance Criteria:**
- `⌘K` / `Ctrl+K` opens the palette from anywhere in the app.
- Typing a name filters employees and Enter navigates to their profile.
**Dependencies:** TICKET-006.
**AI Prompt:** "Add a Cmd/Ctrl+K command palette (using cmdk or similar) that fuzzy-searches employees and app sections, navigating on select."

### TICKET-021: Micro-interactions & Motion Pass
**Priority:** P2
**Description:** Apply consistent Framer Motion transitions: page fade/slide-in, staggered card grid entrance on Employee Directory, modal enter/exit springs, button press states, skeleton loaders for all async data fetches (replace blank/spinner states).
**Acceptance Criteria:**
- No route or data fetch shows a jarring blank flash; skeletons appear during load.
- All modals and dropdowns animate in/out smoothly (no instant pop).
**Dependencies:** TICKET-001 and all page tickets.
**AI Prompt:** "Add Framer Motion micro-interactions across the app: staggered entrance for card grids, smooth modal/dropdown transitions, and skeleton loaders for every async Supabase fetch, replacing blank loading states."

### TICKET-022: Responsive & Accessibility Pass
**Priority:** P1
**Description:** Ensure the sidebar collapses to a bottom nav / hamburger on mobile, all tables become horizontally scrollable or card-stacked on small screens, and run an accessibility sweep: color contrast on status badges, focus rings on all interactive elements, ARIA labels on icon-only buttons, keyboard navigation through modals.
**Acceptance Criteria:**
- App is usable at 375px width with no horizontal overflow bugs.
- Lighthouse accessibility score ≥ 90; all icon-only buttons have `aria-label`.
**Dependencies:** All UI tickets.
**AI Prompt:** "Audit the app for responsive behavior (mobile sidebar → bottom nav/hamburger, tables → stacked cards below 640px) and accessibility (contrast, focus-visible states, aria-labels on icon buttons, keyboard-trap-free modals). Fix issues found."

---

## Suggested Build Order for the 8-Hour Window
1. **Hour 0–1:** TICKET-001, TICKET-002
2. **Hour 1–2:** TICKET-003, TICKET-004, TICKET-005
3. **Hour 2–3.5:** TICKET-006, TICKET-007
4. **Hour 3.5–4.5:** TICKET-009, TICKET-010
5. **Hour 4.5–5.5:** TICKET-012, TICKET-013, TICKET-014, TICKET-015
6. **Hour 5.5–6.5:** TICKET-016, TICKET-017
7. **Hour 6.5–7.5:** TICKET-019, TICKET-022 (polish pass)
8. **Hour 7.5–8:** Buffer / bug bash / demo script rehearsal — TICKET-008, TICKET-011, TICKET-018, TICKET-020, TICKET-021 only if time remains, in that order.
