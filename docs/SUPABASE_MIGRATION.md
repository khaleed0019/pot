# Migrating database to Supabase

## 1. Create Supabase project

1. [supabase.com](https://supabase.com) → New project (free tier).
2. Save the database password.

## 2. Connection strings (Prisma + Supabase)

In `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

In **`backend/.env`** (not frontend — Prisma lives in the API):

```env
# Runtime (transaction pooler, port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations (session pooler, port 5432)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
```

URL-encode special characters in the password (`@` → `%40`).

Run migrations from `backend/`:

```bash
npx prisma migrate deploy
npx prisma generate
```

## 3. Apply schema (no Docker Postgres)

From `backend/`:

```bash
npx prisma migrate deploy
npx prisma generate
```

## 4. Export data from old Postgres (optional)

If you had data in Docker/local Postgres:

```bash
pg_dump "postgresql://user:password@localhost:5432/propertyonset" --no-owner --no-acl -f backup.sql
```

Import into Supabase SQL editor or:

```bash
psql "YOUR_SUPABASE_DIRECT_URL" -f backup.sql
```

## 5. Promote admin user

After first Firebase sign-in, set role in Supabase SQL editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Link `firebaseUid` is set automatically on `/api/auth/sync`.
