# Docker

Local infrastructure for 479Property+.

```bash
pnpm docker:up     # start PostgreSQL + Redis (detached)
pnpm docker:down   # stop and remove containers
```

Container settings are driven by the variables in your root `.env`
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `REDIS_PORT`).
Application Dockerfiles for `apps/api` and `apps/web` are added at deployment time.
