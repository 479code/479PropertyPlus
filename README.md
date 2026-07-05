# 479Property+

**479Property+** is a modern, enterprise-grade, cloud-based Property Management and Revenue Tracking platform for property owners, estate managers, real estate companies, and facility management organizations.

This is a **pnpm + Turborepo** monorepo containing the API, the web client, and shared packages.

---

## Tech Stack

**Frontend** — React · Vite · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · TanStack Table · React Hook Form · Zod · React Router
**Backend** — NestJS · TypeScript · Prisma ORM · PostgreSQL
**Infra** — Docker · Redis · BullMQ · Cloudinary · AWS S3
**Tooling** — pnpm workspaces · Turborepo · ESLint · Prettier · Husky · lint-staged · EditorConfig
**CI** — GitHub Actions (install · lint · build)

---

## Structure

```
479PropertyPlus/
├── apps/
│   ├── api/            # NestJS backend
│   └── web/            # React + Vite frontend
├── packages/
│   ├── ui/             # Shared React component library (shadcn/ui based)
│   ├── types/          # Shared TypeScript types & contracts
│   ├── utils/          # Shared framework-agnostic utilities
│   └── config/         # Shared ESLint + TypeScript presets
├── database/
│   └── prisma/         # Prisma schema & migrations
├── docker/             # docker-compose (PostgreSQL + Redis)
├── docs/               # Documentation
└── .github/workflows/  # CI pipeline
```

---

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- Docker & Docker Compose

---

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env      # then edit values

# 3. Start infrastructure
pnpm docker:up            # PostgreSQL + Redis

# 4. Generate the Prisma client
pnpm prisma:generate

# 5. Run everything in dev mode
pnpm dev
```

- Web dev server: http://localhost:5173
- API: http://localhost:3000/api (health check at `/api/health`)

---

## Workspace Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Run all apps in watch mode (Turborepo)        |
| `pnpm build`            | Build all packages and apps                   |
| `pnpm lint`             | Lint the whole workspace                      |
| `pnpm typecheck`        | Type-check the whole workspace                |
| `pnpm test`             | Run tests                                     |
| `pnpm format`           | Format with Prettier                          |
| `pnpm prisma:generate`  | Generate the Prisma client                    |
| `pnpm prisma:migrate`   | Create/apply a dev migration                  |
| `pnpm docker:up` / `:down` | Start / stop local infrastructure          |

Target a single workspace with `--filter`, e.g. `pnpm --filter @479property/web dev`.

---

## Conventions

Engineering rules, architectural decisions, and coding standards live in
[`CLAUDE.md`](./CLAUDE.md). Read it before contributing.

- Multi-tenancy: shared database, row-level isolation via `organizationId`.
- Backend layering: Controller → Service → Repository (no business logic in controllers).
- Every feature ships validation, error handling, logging, authorization, docs, and tests.

---

## Status

Foundation only. No business modules, authentication, or database tables yet —
the scaffold is ready for feature development.
