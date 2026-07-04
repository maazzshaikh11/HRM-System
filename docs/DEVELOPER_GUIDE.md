# Developer Guide

> Internal reference for developers working on the HRMS codebase.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Project Architecture](#project-architecture)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Database Workflow](#database-workflow)
6. [Testing](#testing)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Code Style & Standards](#code-style--standards)
9. [Debugging](#debugging)
10. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Local Development Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 22 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | Included with Node |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| VSCode | Latest | [code.visualstudio.com](https://code.visualstudio.com) |

### Step-by-step

```bash
# 1. Clone
git clone https://github.com/your-org/hrms.git && cd hrms

# 2. Run automated setup
npm run setup

# 3. Fill credentials
nano backend/.env

# 4. Apply DB schema
npm run db:migrate

# 5. Seed initial data
npm run db:seed

# 6. Start dev servers (both run concurrently)
npm run dev
```

After step 6:
- **API** is live at `http://localhost:3000`
- **Frontend** is live at `http://localhost:5173`
- **Prisma Studio** (optional): `npm run db:studio` → `http://localhost:5555`

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (React)                     │
│    React Router → TanStack Query → Zod Forms            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST JSON
┌──────────────────────▼──────────────────────────────────┐
│                   Express API (Node)                     │
│    Routes → Middleware → Controllers → Prisma            │
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────────┐
│              Supabase (PostgreSQL + Storage)             │
└─────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Request
  → CORS Middleware
  → Cookie Parser
  → JSON Body Parser
  → Route Match
  → verifyToken Middleware (if protected)
  → authorizeRoles Middleware (if RBAC required)
  → Controller
  → Prisma Query
  → JSON Response
```

---

## Backend Development

### Folder Structure

```
backend/src/
├── app.ts              # Express app factory (middleware + routes)
├── index.ts            # Server entry point
├── controllers/        # Route handlers (no business logic in routes)
│   └── authController.ts
├── middlewares/        # Express middleware
│   ├── authMiddleware.ts   # verifyToken, authorizeRoles
│   └── errorHandler.ts
├── routes/             # Express routers
│   └── auth.routes.ts
└── utils/              # Pure utility functions
    ├── jwt.ts
    └── bcrypt.ts
```

### Adding a New Module

1. **Create a controller**: `src/controllers/moduleController.ts`
2. **Create a router**: `src/routes/module.routes.ts`
3. **Mount in `app.ts`**:
   ```ts
   import moduleRoutes from './routes/module.routes';
   app.use('/api/module', moduleRoutes);
   ```
4. **Add tests**: `tests/module.test.ts`

### Auth Pattern

All protected routes use the `verifyToken` middleware. Role restriction uses `authorizeRoles`:

```ts
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

router.get('/admin-resource', verifyToken, authorizeRoles('Admin', 'HR'), handler);
router.get('/my-resource',    verifyToken, handler);
```

The authenticated user is available as `req.user`:
```ts
const userId = req.user!.id;
const role   = req.user!.role;
```

### Error Handling

Throw errors with a `status` property or use `next(error)` to pass to the global error handler in `middlewares/errorHandler.ts`.

---

## Frontend Development

### Folder Structure

```
frontend/src/
├── app/
│   ├── App.tsx           # Root component
│   ├── providers.tsx     # ThemeProvider, QueryProvider, AuthProvider
│   └── router.tsx        # createBrowserRouter config
│
├── components/
│   ├── ui/               # shadcn/ui primitives (DO NOT MODIFY)
│   ├── common/           # Reusable app components (Spinner, EmptyState)
│   └── navigation/       # Sidebar, Navbar
│
├── constants/
│   └── navigation.ts     # MAIN_NAVIGATION — drives sidebar links
│
├── features/             # Feature modules (one per HRMS module)
│   ├── auth/
│   ├── employee/
│   ├── attendance/
│   └── ...
│
├── hooks/                # Custom React hooks
├── layouts/              # AppLayout, AuthLayout, etc.
├── providers/            # AuthProvider, ThemeProvider, QueryProvider
├── styles/
│   └── globals.css       # CSS variables + Tailwind v4 theme
└── lib/
    ├── cn.ts             # Tailwind class merger
    └── utils.ts          # Re-export for shadcn compatibility
```

### Adding a New Feature

1. Create folder: `src/features/your-feature/`
2. Add sub-folders: `components/`, `hooks/`, `pages/`, `api.ts`, `types.ts`
3. Register page routes in `src/app/router.tsx`
4. Add navigation entry in `src/constants/navigation.ts` if needed

### Theming

All colors use CSS variables defined in `src/styles/globals.css`. Dark mode is applied via the `dark` class on `<html>`. Components MUST use semantic tokens:

```tsx
// ✅ Correct
<div className="bg-background text-foreground border-border" />

// ❌ Wrong — hardcoded color
<div className="bg-white text-gray-900" />
```

### API Calls

Use TanStack Query for all server state. Create hooks inside `features/*/hooks/`:

```ts
import { useQuery } from '@tanstack/react-query';

export const useEmployee = (id: number) =>
  useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetch(`/api/employees/${id}`).then(r => r.json()),
  });
```

---

## Database Workflow

### Create a New Migration

```bash
# After editing prisma/schema.prisma
npm run db:migrate
# Enter a descriptive name when prompted, e.g. "add_employee_skills"
```

### Applying to Production

```bash
npm run db:migrate:prod   # Runs: prisma migrate deploy
```

### Reset (Development Only)

```bash
npm run db:reset   # ⚠️ Drops all data!
```

### Prisma Studio (GUI)

```bash
npm run db:studio   # Opens browser GUI at localhost:5555
```

---

## Testing

### Backend Tests

Tests live in `backend/tests/` and use Jest + Supertest.

```bash
npm run test:backend          # Run all tests
cd backend && npm test -- --watch   # Watch mode
```

Prisma is mocked in all tests — no real DB connection required.

### Writing a New Test

```ts
import request from 'supertest';
import app from '../src/app';

describe('GET /api/resource', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/resource');
    expect(res.statusCode).toEqual(401);
  });
});
```

---

## Environment Variables Reference

| Variable | Workspace | Description |
|---|---|---|
| `DATABASE_URL` | backend | Pooled Supabase connection (pgbouncer) |
| `DIRECT_URL` | backend | Direct Supabase connection (migrations only) |
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | backend | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Supabase admin key — keep secret |
| `JWT_SECRET` | backend | HS256 access token signing key |
| `JWT_REFRESH_SECRET` | backend | HS256 refresh token signing key |
| `FRONTEND_URL` | backend | CORS allowed origin |
| `PORT` | backend | API listen port (default: 3000) |
| `NODE_ENV` | backend | `development` or `production` |

> Generate strong JWT secrets: `openssl rand -hex 64`

---

## Code Style & Standards

### TypeScript

- Strict mode is enabled (`"strict": true`)
- **Never use `any`** — use `unknown` and type narrowing
- Use `import type` for all type-only imports (required by `verbatimModuleSyntax`)

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | `camelCase.ts` or `PascalCase.tsx` | `authController.ts`, `Sidebar.tsx` |
| Components | `PascalCase` | `EmptyState`, `AuthLayout` |
| Hooks | `useNoun` | `useAuth`, `useEmployee` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAIN_NAVIGATION` |
| DB models | `snake_case` | `leave_requests`, `salary_structures` |

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add leave cancellation endpoint
fix: correct JWT expiry handling
docs: update API contracts
chore: upgrade Prisma to v7
refactor: extract token utilities to jwt.ts
test: add auth middleware unit tests
```

---

## Debugging

### Backend (VSCode)

Use the included launch configuration:
- `Run & Debug` → **Debug Backend**
- Breakpoints work natively via ts-node source maps.

### Backend (CLI)

```bash
cd backend && npm run dev   # Starts with ts-node-dev (hot reload)
```

### Frontend (Browser)

React DevTools and the browser's built-in debugger work out of the box with Vite source maps.

### Docker Container Logs

```bash
npm run docker:logs          # All containers
docker compose logs backend  # Backend only
docker compose logs frontend # Frontend only
```

---

## Common Issues & Troubleshooting

### `Cannot find module '@prisma/client'`
The Prisma client hasn't been generated. Run:
```bash
npm run db:generate
```

### `Cannot connect to database`
- Ensure `DATABASE_URL` is set in `backend/.env`
- Verify your Supabase project is active and the connection string includes `?pgbouncer=true`

### `CORS error` on frontend
- Ensure `FRONTEND_URL` in `backend/.env` matches the frontend dev server URL (default: `http://localhost:5173`)

### `shadcn component not found`
The shadcn CLI may write components to a literal `@/` directory instead of `src/`. Run:
```bash
cp -r frontend/@/components/ui/* frontend/src/components/ui/
rm -rf frontend/@/
```

### Port already in use
```bash
lsof -ti :3000 | xargs kill   # Kill process on port 3000
lsof -ti :5173 | xargs kill   # Kill process on port 5173
```
