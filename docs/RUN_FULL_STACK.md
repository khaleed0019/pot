# Run Property On Set — full stack guide

## Architecture

| Part | Where it runs | URL |
|------|----------------|-----|
| Frontend | Vercel (or `npm run dev`) | `https://your-app.vercel.app` |
| API | Render (or `npm run dev`) | `https://your-api.onrender.com` |
| Database | Supabase Postgres | connection string only |
| Auth | Supabase Auth | browser SDK + JWKS verification on the API |

---

## One-time cloud setup

### 1. Supabase (database + auth)

Supabase provides both the Postgres database and auth in this stack — one project covers both.

1. Create project at [supabase.com](https://supabase.com).
2. Copy **Transaction pooler** URI (port **6543**) → `DATABASE_URL`.
3. For migrations only, also copy **Direct** URI (port **5432**).
4. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL` (frontend) and `SUPABASE_URL` (backend)
   - anon/publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (frontend only — safe to expose)
5. **Authentication → Sign-in method** → enable **Email**. To also enable **Google**, follow [docs/GOOGLE_AUTH.md](GOOGLE_AUTH.md) — it requires matching config in Google Cloud Console (redirect URI) and here (Client ID/Secret + redirect URL allow-list).

From your machine (use **direct** URL once):

```powershell
cd backend
$env:DATABASE_URL="postgresql://...direct..."
npx prisma migrate deploy
npx prisma generate
```

Use the **pooler** URL in Render and local `backend/.env` for running the API.

### 2. Render (backend)

1. New **Web Service** → connect GitHub repo.
2. **Root Directory:** `backend`
3. **Runtime:** Docker
4. **Health check path:** `/health`
5. Environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase pooler URI |
| `SUPABASE_URL` | Supabase project URL — used to verify auth tokens |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_URL` | optional |

6. Deploy → note URL: `https://property-on-set-api.onrender.com`

Test: open `https://YOUR-API.onrender.com/health` → `{"ok":true}`  
First request after idle may take **~30 seconds** (free tier).

### 3. Vercel (frontend)

1. Import GitHub repo.
2. **Root Directory:** `frontend`
3. Environment variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from Supabase → Project Settings → API |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | optional |

4. Deploy.

Update Render `FRONTEND_URL` to match your final Vercel domain. If Google sign-in is enabled, also add `https://your-app.vercel.app/auth/callback` to Supabase's Redirect URLs allow-list (see [GOOGLE_AUTH.md](GOOGLE_AUTH.md)).

---

## Local development (recommended)

### Terminal 1 — API

```powershell
cd "c:\Users\adele\Desktop\Property On Set\backend"
copy .env.example .env
# Edit .env: DATABASE_URL, DIRECT_URL, SUPABASE_URL, FRONTEND_URL=http://localhost:3000
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

API: http://localhost:5001 (or whatever `PORT` is in `.env`)  
Health: http://localhost:5001/health

### Terminal 2 — Frontend

```powershell
cd "c:\Users\adele\Desktop\Property On Set\frontend"
copy .env.example .env.local
# Edit: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_API_URL=http://localhost:5001/api
npm install
npm run dev
```

App: http://localhost:3000

### Make yourself admin (once)

After signing up in the app, in Supabase SQL editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Sign out and sign in again.

---

## Verify everything works

1. **Health:** `GET /health` → 200
2. **Sign up** at `/signup` → no errors in browser console
3. **Supabase** → `User` table has your row with `authUid` set
4. **Protected API:** Agent dashboard loads listings (`/agent/dashboard`)
5. **Public listings:** `/buy` loads (only `PUBLISHED` properties)
6. **Admin:** `/admin/properties` after role = `ADMIN`

---

## Common issues

| Problem | Fix |
|---------|-----|
| CORS error in browser | Set `FRONTEND_URL` on Render to exact Vercel URL (no trailing slash) |
| 401 on API after login | Call failed on `/api/auth/sync`, or backend `SUPABASE_URL` is missing/wrong |
| Token verification fails | Backend `SUPABASE_URL` must point at the **same** Supabase project as the frontend's `NEXT_PUBLIC_SUPABASE_URL` |
| Google button fails or bounces back with an error | See the troubleshooting table in [GOOGLE_AUTH.md](GOOGLE_AUTH.md) — almost always a redirect URL not on Supabase's allow-list |
| Prisma migrate fails on pooler | Use **direct** Supabase URL for `migrate deploy` only |
| Render slow first load | Normal on free tier; use `/health` to wake service |
| Missing env banner on site | Fill `frontend/.env.local` or Vercel env vars |

---

## Optional: Docker API only

```powershell
cd "c:\Users\adele\Desktop\Property On Set"
# Ensure backend/.env has DATABASE_URL and SUPABASE_URL set
docker compose up --build backend
```

Maps host port **5001** → container **5000** (see `docker-compose.yml`).
