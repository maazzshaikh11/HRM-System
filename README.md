<h1 align="center">
  Enterprise HRMS
</h1>

<p align="center">
  A full-stack Human Resource Management System built with React, Node.js/Express, Prisma, and Supabase.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-22-green?logo=node.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-6-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" />
</p>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Docker](#docker)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## Features

- 🔐 **JWT Authentication** — Access + Refresh token flow with HTTP-only cookies
- 👥 **Employee Management** — Full CRUD with departments and profiles
- 📅 **Attendance Tracking** — Check-in / check-out with monthly summaries
- 🌴 **Leave Management** — Apply, review, and approve leave requests
- 💰 **Payroll** — Salary structures and auto-generated payslips
- 📊 **Dashboard Analytics** — Real-time stats for Admin and Employee views
- 🔔 **Notifications** — In-app notification system
- 🌙 **Dark Mode** — System-aware theme with manual toggle
- 📱 **Responsive** — Mobile-first design using Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS v4, shadcn/ui |
| **State** | TanStack Query, React Hook Form, Zod |
| **Backend** | Node.js 22, Express 5, TypeScript |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Database** | PostgreSQL (Supabase), Prisma ORM |
| **Storage** | Supabase Storage |
| **CI/CD** | GitHub Actions |
| **Containers** | Docker, Docker Compose |

---

## Project Structure

```
hrms/
├── backend/              # Express API
│   ├── prisma/           # Schema, migrations, seed
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middlewares/  # Auth, error handling
│   │   ├── routes/       # Express routers
│   │   └── utils/        # JWT, bcrypt helpers
│   └── tests/            # Jest + Supertest integration tests
│
├── frontend/             # React SPA
│   └── src/
│       ├── app/          # Providers, router, store
│       ├── components/   # Reusable UI components
│       ├── constants/    # Navigation, config
│       ├── features/     # Feature modules (auth, employee, ...)
│       ├── hooks/        # Custom React hooks
│       ├── layouts/      # Page layout shells
│       └── styles/       # Global CSS variables
│
├── docs/                 # All project documentation
├── docker/               # Dockerfiles & nginx config
├── scripts/              # Developer utility scripts
└── .github/workflows/    # GitHub Actions CI
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 22
- npm ≥ 10
- A [Supabase](https://supabase.com) account (or local Docker instance)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/hrms.git
cd hrms
npm run setup
```

This will:
- Install all dependencies (backend + frontend)
- Copy `backend/.env.example` → `backend/.env`
- Generate the Prisma client

### 2. Configure Environment

Edit `backend/.env` with your Supabase credentials. See [Environment Variables](#environment-variables) below.

### 3. Run Migrations & Seed

```bash
npm run db:migrate   # Apply schema migrations
npm run db:seed      # Insert roles, departments, admin & demo user
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string (with pgbouncer) |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection (for migrations) |
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `JWT_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `PORT` | ❌ | API server port (default: `3000`) |
| `NODE_ENV` | ❌ | `development` or `production` |

> **Generate strong secrets:**
> ```bash
> openssl rand -hex 64
> ```

---

## Available Scripts

All scripts can be run from the project root.

| Script | Description |
|---|---|
| `npm run setup` | First-time setup: install deps + copy env |
| `npm run dev` | Start backend + frontend concurrently |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build both workspaces for production |
| `npm run test` | Run all backend tests |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Auto-format all code with Prettier |
| `npm run db:migrate` | Run Prisma migrations (development) |
| `npm run db:migrate:prod` | Deploy migrations (production) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:reset` | ⚠️ Drop, remigrate, and reseed |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run docker:up` | Build and start all containers |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs` | Tail container logs |

---

## Docker

### Development (with hot reload)

```bash
cp backend/.env.example backend/.env
# Fill in credentials, then:
docker compose -f docker-compose.yml -f docker/docker-compose.override.yml up
```

### Production

```bash
docker compose up --build
```

Services:
- `hrms-backend` → http://localhost:3000
- `hrms-frontend` → http://localhost:80

---

## API Documentation

Full API contracts are documented in [`docs/API_Contracts.md`](docs/API_Contracts.md).

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.hrms.com/api`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Contributing

See [`docs/07_Git_Workflow.md`](docs/07_Git_Workflow.md) for the branching strategy and PR guidelines.

1. Branch off `develop`: `git checkout -b feature/your-feature`
2. Commit using conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
3. Open a PR against `develop`
4. CI must pass before merging

---

<p align="center">Built for the Hackathon 2024</p>
