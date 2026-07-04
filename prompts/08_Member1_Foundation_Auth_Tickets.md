
# Member 1 – Foundation, Authentication & Shared Infrastructure

## Ownership
- Project bootstrap
- PostgreSQL + Prisma
- Authentication
- RBAC
- Shared UI
- Shared backend utilities
- CI/CD

| ID | Title | Priority | Depends On | Est. |
|---|---|---|---|---|
| M1-001 | Initialize Git repository | P0 | None | 15m |
| M1-002 | Create monorepo structure | P0 | M1-001 | 20m |
| M1-003 | Configure React + Vite + TS | P0 | M1-002 | 30m |
| M1-004 | Configure Express + TS | P0 | M1-002 | 30m |
| M1-005 | Docker Compose | P0 | M1-004 | 30m |
| M1-006 | PostgreSQL connection | P0 | M1-005 | 20m |
| M1-007 | Prisma schema | P0 | M1-006 | 45m |
| M1-008 | Initial migration | P0 | M1-007 | 15m |
| M1-009 | Seed roles/departments | P0 | M1-008 | 20m |
| M1-010 | JWT auth | P0 | M1-007 | 45m |
| M1-011 | Login API | P0 | M1-010 | 30m |
| M1-012 | Logout API | P1 | M1-011 | 15m |
| M1-013 | Auth middleware | P0 | M1-010 | 20m |
| M1-014 | RBAC middleware | P0 | M1-013 | 20m |
| M1-015 | Validation middleware | P0 | M1-004 | 20m |
| M1-016 | Error handler | P0 | M1-004 | 20m |
| M1-017 | Logger | P1 | M1-004 | 20m |
| M1-018 | Shared UI library | P1 | M1-003 | 60m |
| M1-019 | Theme/Layout | P1 | M1-018 | 45m |
| M1-020 | GitHub Actions CI | P2 | M1-004 | 30m |

## Acceptance
- Everyone can clone, run and login.
- Shared contracts frozen before feature work.
