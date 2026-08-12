# Property On Set

Real estate marketplace with agent listing workflow, admin CMS, and published-only public listings.

**Full setup & run guide:** [docs/RUN_FULL_STACK.md](docs/RUN_FULL_STACK.md) (local dev + Vercel + Render + Supabase + Firebase).

## Stack (free tiers)

| Layer | Service | Notes |
|-------|---------|--------|
| Frontend | [Vercel](https://vercel.com) | Next.js, auto-deploy from GitHub |
| Backend | [Render](https://render.com) | Docker, free tier (~30s cold start) |
| Database | [Supabase](https://supabase.com) | PostgreSQL pooler, 500MB free |
| Auth | [Firebase](https://firebase.google.com) | Email/password + Google |

## Local development

### Prerequisites

- Node.js 20+
- Supabase project (or any Postgres with `DATABASE_URL`)
- Firebase project with Email/Password and Google sign-in enabled

### Backend

```bash
cd backend
cp .env.example .env
# Fill DATABASE_URL, FIREBASE_SERVICE_ACCOUNT_JSON, FRONTEND_URL=http://localhost:3000
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
# Fill Firebase NEXT_PUBLIC_* and NEXT_PUBLIC_API_URL=http://localhost:5001/api
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

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_API_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`
   - `NEXT_PUBLIC_MAPBOX_TOKEN` (optional)

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
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON (one line) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `PORT` | `5000` |
   | `CLOUDINARY_URL` | optional |

6. Deploy. Render free tier sleeps after 15 minutes idle; first request may take ~30 seconds.

`render.yaml` in the repo documents the same setup for Blueprint deploys.

---

## Supabase database

See [docs/SUPABASE_MIGRATION.md](docs/SUPABASE_MIGRATION.md) for schema migration and data import.

---

## Firebase Authentication

### Console setup

1. Create Firebase project.
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Project settings → Your apps → Web**: register app, copy `apiKey`, `authDomain`, `projectId` → frontend env.
4. **Project settings → Service accounts → Generate new private key** → paste JSON into Render `FIREBASE_SERVICE_ACCOUNT_JSON` (never commit).

### Auth flow

1. User signs up / signs in on the frontend (Firebase SDK).
2. Frontend calls `POST /api/auth/sync` with `Authorization: Bearer <Firebase ID token>`.
3. Backend verifies token with Firebase Admin and creates/updates the Prisma `User` row.
4. All protected API routes verify the same Firebase ID token and load `req.user` from the database.

### Admin users

After first login, set role in Supabase:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## API routes

- `GET /health` — Render health check (200 OK)
- `POST /api/auth/sync` — Register/link user after Firebase sign-in
- `GET /api/auth/me` — Current app user (protected)
- Public listings: `GET /api/properties` (published only)
- Agent: `/api/listings/drafts/*`
- Admin: `/api/admin/*`

---

## CORS

Backend allows `FRONTEND_URL` and `*.vercel.app` preview deployments. Set `FRONTEND_URL` to your production Vercel domain.

---

## Test auth end-to-end

1. Sign up on `/signup` (Firebase + sync).
2. Open browser devtools → Application; confirm Firebase session.
3. Create a listing as agent → `POST /api/listings/drafts` should return 201 (not 401).
4. In Supabase Table Editor, confirm a `User` row with `firebaseUid` set.
