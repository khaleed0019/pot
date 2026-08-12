# Run Property On Set — full stack guide

## Architecture

| Part | Where it runs | URL |
|------|----------------|-----|
| Frontend | Vercel (or `npm run dev`) | `https://your-app.vercel.app` |
| API | Render (or `npm run dev`) | `https://your-api.onrender.com` |
| Database | Supabase Postgres | connection string only |
| Auth | Firebase | browser + Admin SDK on API |

---

## One-time cloud setup

### 1. Supabase (database)

1. Create project at [supabase.com](https://supabase.com).
2. Copy **Transaction pooler** URI (port **6543**) → `DATABASE_URL`.
3. For migrations only, also copy **Direct** URI (port **5432**).

From your machine (use **direct** URL once):

```powershell
cd backend
$env:DATABASE_URL="postgresql://...direct..."
npx prisma migrate deploy
npx prisma generate
```

Use the **pooler** URL in Render and local `backend/.env` for running the API.

### 2. Firebase (auth)

1. [Firebase Console](https://console.firebase.google.com) → new project.
2. **Authentication** → enable **Email/Password** and **Google**.
3. **Project settings** → Web app → copy:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
4. **Service accounts** → **Generate new private key** → entire JSON → `FIREBASE_SERVICE_ACCOUNT_JSON` on Render (one line).

**Authorized domains (Firebase → Authentication → Settings):**

- `localhost` (local dev)
- `your-app.vercel.app` (production)

### 3. Render (backend)

1. New **Web Service** → connect GitHub repo.
2. **Root Directory:** `backend`
3. **Runtime:** Docker
4. **Health check path:** `/health`
5. Environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase pooler URI |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{...}` full JSON |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_URL` | optional |

6. Deploy → note URL: `https://property-on-set-api.onrender.com`

Test: open `https://YOUR-API.onrender.com/health` → `{"ok":true}`  
First request after idle may take **~30 seconds** (free tier).

### 4. Vercel (frontend)

1. Import GitHub repo.
2. **Root Directory:** `frontend`
3. Environment variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from Firebase |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | optional |

4. Deploy.

Update Render `FRONTEND_URL` to match your final Vercel domain.

---

## Local development (recommended)

### Terminal 1 — API

```powershell
cd "c:\Users\adele\Desktop\Property On Set\backend"
copy .env.example .env
# Edit .env: DATABASE_URL, FIREBASE_SERVICE_ACCOUNT_JSON, FRONTEND_URL=http://localhost:3000
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
# Edit: all NEXT_PUBLIC_FIREBASE_* and NEXT_PUBLIC_API_URL=http://localhost:5001/api
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
3. **Supabase** → `User` table has your row with `firebaseUid` set
4. **Protected API:** Agent dashboard loads listings (`/agent/dashboard`)
5. **Public listings:** `/buy` loads (only `PUBLISHED` properties)
6. **Admin:** `/admin/properties` after role = `ADMIN`

---

## Common issues

| Problem | Fix |
|---------|-----|
| CORS error in browser | Set `FRONTEND_URL` on Render to exact Vercel URL (no trailing slash) |
| 401 on API after login | Call failed on `/api/auth/sync` — check Firebase service account JSON |
| `Invalid Firebase token` | Clock skew rare; re-login; check service account matches Firebase project |
| Prisma migrate fails on pooler | Use **direct** Supabase URL for `migrate deploy` only |
| Render slow first load | Normal on free tier; use `/health` to wake service |
| Missing env banner on site | Fill `frontend/.env.local` or Vercel env vars |

---

## Optional: Docker API only

```powershell
cd "c:\Users\adele\Desktop\Property On Set"
# Ensure backend/.env has Supabase DATABASE_URL + Firebase JSON
docker compose up --build backend
```

Maps host port **5001** → container **5000** (see `docker-compose.yml`).
