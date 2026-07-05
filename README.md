# 479Property+

**479Property+** is a modern, enterprise-grade, cloud-based Property Management and Revenue Tracking platform built for property owners, estate managers, real estate companies, and facility management organizations.

This repository is a monorepo containing the API, the web client, and the shared packages that power the platform.

---

## Tech Stack

**Frontend** — React · TypeScript · Vite · Tailwind CSS · shadcn/ui · TanStack Query · TanStack Table · React Hook Form · Zod · React Router
**Backend** — NestJS · TypeScript · Prisma ORM · PostgreSQL
**Auth** — JWT (access + refresh) · RBAC · permission-based authorization
**Infrastructure** — Docker · Redis · BullMQ · Cloudinary · AWS S3
**Maps** — Google Maps API
**Charts** — Recharts
**Testing** — Jest · Vitest · Playwright
**Tooling** — pnpm workspaces · Turborepo

---

## Monorepo Structure

```
479PropertyPlus/
├── apps/
│   ├── api/          # NestJS backend (REST API, auth, business logic)
│   └── web/          # React + Vite frontend
├── packages/
│   ├── ui/           # Shared UI component library (shadcn/ui based)
│   ├── utils/        # Shared utilities & helpers
│   ├── config/       # Shared config (eslint, tsconfig, tailwind presets)
│   └── types/        # Shared TypeScript types & contracts
├── database/         # Prisma schema, migrations, seed scripts
├── docker/           # Dockerfiles & docker-compose definitions
├── docs/             # Architecture & product documentation
└── .github/          # CI/CD workflows
```

---

## Architecture Highlights

- **Multi-tenancy:** shared database with row-level isolation. Every tenant-scoped record carries an `organizationId`, enforced centrally so queries cannot cross tenant boundaries.
- **Layered backend:** strict separation of Controller → Service → Repository, with DTOs, entities, validators, and interfaces kept distinct. No business logic in controllers.
- **Security-first:** every endpoint authenticated and authorized, all inputs validated, passwords hashed, sensitive data encrypted, audit logging, and rate limiting.
- **Auditable data:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `organizationId`, and soft deletes where appropriate.

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for PostgreSQL and Redis)

---

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# then edit .env and fill in real values

# 3. Start infrastructure (PostgreSQL, Redis)
docker compose -f docker/docker-compose.yml up -d

# 4. Apply database migrations & generate the Prisma client
pnpm --filter api prisma migrate dev

# 5. Run everything in dev mode
pnpm dev
```

---

## Common Scripts

> Exact script names are finalized as the workspaces are scaffolded; the table
> below reflects the intended developer workflow.

| Command                     | Description                                  |
| --------------------------- | -------------------------------------------- |
| `pnpm dev`                  | Run all apps in development mode             |
| `pnpm build`                | Build all apps and packages                  |
| `pnpm lint`                 | Lint the entire workspace                    |
| `pnpm test`                 | Run unit tests                               |
| `pnpm test:e2e`             | Run end-to-end tests (Playwright)            |
| `pnpm --filter api ...`     | Target the API workspace                     |
| `pnpm --filter web ...`     | Target the web workspace                     |

---

## Status

Early development. The platform core (organizations, users, authentication, RBAC/permissions, tenant scoping) is the current foundation; feature modules build on top of it.

---

## Roles

- **Product Owner:** Uthman
- **Engineering:** implementation follows the architecture defined in [`CLAUDE.md`](./CLAUDE.md).
