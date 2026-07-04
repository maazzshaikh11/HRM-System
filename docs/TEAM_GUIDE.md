# HRMS — Integration, Merge, and Contribution Guide

> Single source of truth for all team members on how to integrate modules, branch, and define completion.

---

## 1. Integration Guide

### How Frontend Connects to Backend

The frontend and backend are separate workspaces. The frontend communicates with the backend via REST API calls.

**Environment Variable:**
Add `VITE_API_URL=http://localhost:3000/api` to `frontend/.env` (create from `.env.example`).

**Authentication Flow:**
```
User submits login form
  → POST /api/auth/login { employee_id, password }
  → Server returns: { access_token } + sets refresh_token cookie (http-only)
  → Store access_token in React context (NOT localStorage)
  → Attach to every protected request: Authorization: Bearer <access_token>
  → On 401 response: call POST /api/auth/refresh → get new access_token
  → On logout: POST /api/auth/logout → cookie cleared
```

**CORS Configuration:**
- Set `FRONTEND_URL=http://localhost:5173` in `backend/.env`
- All fetch calls from frontend must use `credentials: 'include'` to send cookies

**Pattern for a New Feature:**

Backend controller (`backend/src/controllers/employeeController.ts`):
```ts
export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await prisma.users.findUnique({ where: { id: +req.params.id } });
    if (!employee) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(employee);
  } catch (error) { next(error); }
};
```

Route (`backend/src/routes/employee.routes.ts`):
```ts
router.get('/:id', verifyToken, authorizeRoles('Admin', 'HR'), getEmployee);
```

Mount in `backend/src/app.ts`:
```ts
import employeeRoutes from './routes/employee.routes';
app.use('/api/employees', employeeRoutes);
```

Frontend hook (`frontend/src/features/employee/hooks/useEmployee.ts`):
```ts
import { useQuery } from '@tanstack/react-query';
const API = import.meta.env.VITE_API_URL;

export const useEmployee = (id: number) =>
  useQuery({
    queryKey: ['employee', id],
    queryFn: () =>
      fetch(`${API}/employees/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: 'include',
      }).then(r => r.json()),
  });
```

---

## 2. Developer Guide (Summary)

> Full guide: `docs/DEVELOPER_GUIDE.md`

| Task | Command |
|---|---|
| First-time setup | `npm run setup` |
| Start all servers | `npm run dev` |
| Backend only | `npm run dev:backend` |
| Frontend only | `npm run dev:frontend` |
| Apply DB migration | `npm run db:migrate` |
| Seed the database | `npm run db:seed` |
| Reset DB (dev only) | `npm run db:reset` |
| Run all tests | `npm run test` |
| Format all code | `npm run format` |
| Lint all code | `npm run lint` |
| Start Docker | `npm run docker:up` |

---

## 3. Folder Ownership

| Path | Owner | Rule |
|---|---|---|
| `backend/src/controllers/` | Backend members | One controller per module |
| `backend/src/routes/` | Backend members | One router file per module |
| `backend/src/middlewares/` | Backend Lead | Changes require Lead review |
| `backend/prisma/schema.prisma` | Backend Lead | Schema PRs require full team review |
| `backend/tests/` | All backend members | Each member writes tests for their module |
| `frontend/src/components/ui/` | ⛔ LOCKED | shadcn generated — use CLI to update only |
| `frontend/src/components/common/` | Frontend Lead | Shared non-feature components |
| `frontend/src/components/navigation/` | Frontend Lead | Sidebar and Navbar |
| `frontend/src/layouts/` | Frontend Lead | Layout shells |
| `frontend/src/providers/` | Frontend Lead | Global context providers |
| `frontend/src/features/auth/` | Member 1 | Login, logout, token management |
| `frontend/src/features/employee/` | Member 2 | Employee list, detail, edit |
| `frontend/src/features/attendance/` | Member 3 | Check-in/out, calendar, reports |
| `frontend/src/features/leave/` | Member 3 | Leave request, approval workflow |
| `frontend/src/features/payroll/` | Member 4 | Salary structures, payslips |
| `frontend/src/features/dashboard/` | Member 4 | Analytics, stats |
| `docs/API_Contracts.md` | All members | Update when endpoints change |
| `.github/workflows/` | DevOps / Lead | Changes require Lead approval |
| `docker/` | DevOps / Lead | Infrastructure changes |

---

## 4. Merge Strategy

### Branch Model

```
main           ← Production releases only (tagged)
  └── develop  ← Active integration branch
       ├── feature/employee-crud
       ├── feature/attendance-checkin
       ├── fix/leave-date-validation
       └── chore/upgrade-prisma
```

### Rules

| Rule | Detail |
|---|---|
| Branch source | Always branch from `develop` |
| PR target | All PRs target `develop` (never `main` directly) |
| `main` merges | Only `develop` → `main` via a release PR after QA |
| Protected branches | `main` and `develop` — no direct pushes |
| CI required | All 3 GitHub Actions jobs must be green |
| Reviews required | Minimum 1 approval before merge |
| Merge method | **Squash and merge** on features (clean linear history) |
| Rebase policy | Rebase your feature branch on `develop` before opening PR |

### Commit Message Convention

```
feat: add attendance check-in endpoint
fix: resolve JWT refresh token rotation bug
docs: document payroll API endpoints
chore: upgrade Prisma to 7.8.0
test: add leave request integration tests
refactor: extract salary calculation to utility function
```

### Branch Naming

```
feature/<short-description>     feature/employee-delete
fix/<short-description>         fix/checkin-duplicate-error
chore/<short-description>       chore/update-dependencies
docs/<short-description>        docs/api-payroll-contracts
```

---

## 5. Definition of Done

A feature is **Done** only when ALL criteria below are met.

### ✅ Code Quality
- TypeScript strict mode — zero errors, zero `any`
- No `eslint-disable` comments
- All code formatted via Prettier (`npm run format`)
- No dead code, `console.log`, or unresolved TODOs

### ✅ Testing
- Integration tests written for all new backend endpoints
- Edge cases tested: invalid input, unauthenticated, unauthorized, not found
- `npm run test` passes — all existing tests still pass
- No flaky tests

### ✅ Backend
- Endpoint matches the contract in `docs/API_Contracts.md`
- Input validated using Zod schemas
- `verifyToken` + `authorizeRoles` applied to all protected routes
- Errors caught and passed to global error handler via `next(error)`
- No sensitive data (passwords, keys) in API responses

### ✅ Frontend
- All styling uses CSS tokens (`bg-background`, `text-foreground`, etc.)
- No hardcoded colors anywhere
- Dark mode tested — toggle works, nothing breaks
- Tested at: mobile (375px), tablet (768px), desktop (1440px)
- Loading, error, and empty states implemented for all async data
- Keyboard navigable (Tab, Enter, Escape)
- ARIA roles/labels present on all interactive elements

### ✅ Integration
- Frontend calls real backend API (not mocked data) via TanStack Query
- Access token attached to all protected requests
- API errors displayed via Sonner toast or inline validation
- No hardcoded localhost URLs (use `VITE_API_URL`)
- `credentials: 'include'` set for cookie-based auth

### ✅ DevOps
- All GitHub Actions jobs pass (backend, frontend, docker)
- No `.env` or secret files committed to git
- `docker compose up --build` succeeds

### ✅ Documentation
- `docs/API_Contracts.md` updated if endpoints changed
- `README.md` updated if setup steps changed
- PR description written explaining **what**, **why**, and **how to test**
- Ticket/issue number referenced in PR title
