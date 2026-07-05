# Database

Prisma schema, migrations, and seed scripts for 479Property+.

- `prisma/schema.prisma` — schema definition (generator + datasource).
- Migrations are created with `pnpm prisma:migrate` and committed to version control.

The API app (`apps/api`) references this schema via its `prisma.schema` config,
so Prisma commands can be run from the repo root:

```bash
pnpm prisma:generate   # generate the Prisma client
pnpm prisma:migrate    # create/apply a dev migration
pnpm prisma:studio     # open Prisma Studio
```
