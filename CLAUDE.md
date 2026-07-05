# 479Property+ — Engineering Context (CLAUDE.md)

This file is the source of truth for anyone (human or AI) writing code in this
repository. Read it before implementing anything.

---

## 1. Mandate

- **Role:** Lead Software Engineer. Responsibility is **implementation**.
- **Product Owner:** Uthman. **System Architect:** ChatGPT.
- This is a **commercial SaaS product** — not a prototype, MVP, or demo. It is
  intended to compete with enterprise property management platforms and must
  serve thousands of organizations and millions of records reliably.
- **Do not redesign the architecture without instruction.**
- **Do not replace technologies without instruction.**
- Always follow the architecture defined here.
- If a requirement is unclear, **ask before coding**. Do not make assumptions
  that affect architecture.
- Never generate placeholder implementations unless explicitly requested.

---

## 2. Core Principles

Clean Architecture · SOLID · DRY · KISS · Enterprise standards · Modular design
· Type safety · Security first · Performance first · Maintainability over
shortcuts.

---

## 3. Tech Stack (fixed)

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query,
  TanStack Table, React Hook Form, Zod, React Router.
- **Backend:** NestJS, TypeScript, Prisma ORM, PostgreSQL.
- **Auth:** JWT, refresh tokens, RBAC, permission-based authorization.
- **Infrastructure:** Docker, Redis, BullMQ, Cloudinary, AWS S3.
- **Maps:** Google Maps API. **Charts:** Recharts.
- **Testing:** Jest, Vitest, Playwright.
- **Monorepo tooling:** pnpm workspaces + Turborepo.

---

## 4. Repository Structure

```
apps/        api (NestJS) · web (React/Vite)
packages/    ui · utils · config · types
database/    Prisma schema, migrations, seeds
docker/      Dockerfiles, docker-compose
docs/        architecture & product docs
.github/     CI/CD workflows
```

---

## 5. Architectural Decisions (locked)

- **Multi-tenancy: shared database, row-level isolation.** Every tenant-scoped
  table carries `organizationId` (indexed). Isolation is enforced **centrally**
  via a Prisma extension/middleware + request-scoped org context derived from
  the JWT — never rely on individual queries remembering to filter by org.
- **Layered backend.** Controller → Service → Repository. Controllers are thin;
  **no business logic in controllers.** DTOs, entities, interfaces, validators,
  utilities, and middlewares are kept in separate, clearly named files.

---

## 6. Backend Rules

- Separate: Controllers, Services, Repositories, DTOs, Entities, Interfaces,
  Validators, Utilities, Middlewares.
- Never place business logic inside controllers.
- Always validate inputs (Zod / class-validator DTOs).
- Always use Prisma migrations for schema changes.
- No duplicate code and no duplicate components — extract and reuse.
- Never hardcode values — everything configurable via env/config.

**Every feature must ship with:** validation · error handling · logging ·
authorization · documentation · tests.

---

## 7. Database Rules

- Normalized schema, proper foreign keys, indexes, unique constraints.
- Audit fields on tenant data: `createdAt`, `updatedAt`, `createdBy`,
  `updatedBy`, `organizationId`.
- Soft deletes where appropriate (`deletedAt`).

---

## 8. Security

- Every endpoint authenticated **and** authorized (RBAC + permissions).
- Every request validated.
- Passwords hashed; sensitive data encrypted.
- Audit logs for meaningful actions.
- Rate limiting on public/auth-sensitive endpoints.
- Never log secrets. Never commit `.env`.

---

## 9. Frontend / UI Rules

- Every screen must feel premium: modern spacing, strong typography,
  professional tables, advanced filtering.
- Loading skeletons, tasteful animations.
- Light mode + dark mode.
- Responsive and accessible (a11y is a requirement, not a nice-to-have).
- Reusable components; shared primitives live in `packages/ui`.

---

## 10. Code Quality

- Production-ready code. Meaningful names.
- Document complex logic; no unnecessary comments; no dead code.
- No `console.log` in production paths — use the logger.

---

## 11. Feature Workflow

For every feature, in order:

1. Understand the requirement.
2. Design the database changes.
3. Implement the backend.
4. Implement the frontend.
5. Write tests.
6. Verify functionality.

Only then move on to the next feature.

---

## 12. First Foundation

The platform core comes first because everything depends on it:
Organization · User · Role · Permission · RolePermission · AuditLog,
plus authentication (JWT access/refresh, password hashing, guards), the
RBAC/permission authorization layer, and the tenant-scoping mechanism.
