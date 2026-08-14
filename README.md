# Property On Set

Real estate marketplace with agent listing workflow, admin CMS, and published-only public listings.

**Full setup & run guide:** [docs/RUN_FULL_STACK.md](docs/RUN_FULL_STACK.md) (local dev + Vercel + Render + Supabase). Google sign-in setup: [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md).

## Stack (free tiers)

| Layer | Service | Notes |
|-------|---------|--------|
| Frontend | [Vercel](https://vercel.com) | Next.js, auto-deploy from GitHub |
| Backend | [Render](https://render.com) | Docker, free tier (~30s cold start) |
| Database | [Supabase](https://supabase.com) | PostgreSQL pooler, 500MB free |
| Auth | [Supabase Auth](https://supabase.com/auth) | Email/password + Google, JWKS-verified on the API |

## Local development

### Prerequisites

- Node.js 20+
- Supabase project (database **and** Auth — email/password + Google provider enabled, see [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md))

### Backend

```bash
cd backend
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, SUPABASE_URL, FRONTEND_URL=http://localhost:3000
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

API: `http://localhost:5001` (or `PORT` in `.env`) · Health: `GET /health`

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_API_URL=http://localhost:5001/api
npm install
npm run dev
```

App: `http://localhost:3000`

### Optional Docker (API only)

```bash
docker compose up --build backend
```

Uses `backend/.env` — no Postgres or frontend containers.

---

## Deploy frontend (Vercel)

1. Push repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. Set **Root Directory** to `frontend`.
4. Environment variables (Production + Preview):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_API_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`
   - `NEXT_PUBLIC_MAPBOX_TOKEN` (optional)

   If you're adding Google sign-in, also add your production URL (`https://your-app.vercel.app/auth/callback`) to Supabase's Redirect URLs allow-list — see [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md).

5. Deploy. Vercel rebuilds on every push to the connected branch.

---

## Deploy backend (Render)

1. [render.com](https://render.com) → **New → Web Service** → connect GitHub repo.
2. **Root Directory**: `backend` (or use repo root with Dockerfile path `./backend/Dockerfile`).
3. **Environment**: Docker.
4. **Health Check Path**: `/health`
5. Environment variables:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Supabase **transaction pooler** URI |
   | `SUPABASE_URL` | Supabase project URL — used to verify auth tokens |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `PORT` | `5000` |
   | `CLOUDINARY_URL` | optional |

6. Deploy. Render free tier sleeps after 15 minutes idle; first request may take ~30 seconds.

`render.yaml` in the repo documents the same setup for Blueprint deploys.

---

## Supabase database

See [docs/SUPABASE_MIGRATION.md](docs/SUPABASE_MIGRATION.md) for schema migration and data import.

---

## Supabase Authentication

### Console setup

1. In your Supabase project: **Authentication → Sign-in method** → enable **Email** and (optionally) **Google**. For Google, see the full walkthrough in [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md) — it needs matching config in both Google Cloud Console and the Supabase dashboard.
2. **Project Settings → API**: copy the Project URL and anon/publishable key into the frontend env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) and the Project URL into the backend env (`SUPABASE_URL`).

### Auth flow

1. User signs up / signs in on the frontend (`@supabase/supabase-js`, including the Google OAuth redirect).
2. Frontend calls `POST /api/auth/sync` with `Authorization: Bearer <Supabase access token>`.
3. Backend verifies the token locally against Supabase's published JWKS (no secret key needed) and creates/updates the Prisma `User` row, keyed on `authUid`.
4. All protected API routes verify the same token and load `req.user` from the database.

### Admin users

After first login, set role in Supabase:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## API routes

- `GET /health` — Render health check (200 OK)
- `POST /api/auth/sync` — Register/link user after Supabase sign-in
- `GET /api/auth/me` — Current app user (protected)
- Public listings: `GET /api/properties` (published only)
- Agent: `/api/listings/drafts/*`
- Admin: `/api/admin/*`

---

## CORS

Backend allows `FRONTEND_URL` and `*.vercel.app` preview deployments. Set `FRONTEND_URL` to your production Vercel domain.

---

## Test auth end-to-end

1. Sign up on `/signup` (Supabase sign-up + `/api/auth/sync`).
2. Open browser devtools → Application → Local Storage; confirm a Supabase session is stored.
3. Create a listing as agent → `POST /api/listings/drafts` should return 201 (not 401).
4. In Supabase Table Editor, confirm a `User` row with `authUid` set.
