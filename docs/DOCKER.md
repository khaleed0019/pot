# Docker (local dev)

## `lookup auth.docker.io: no such host` (pull / build)

Docker cannot **resolve DNS** for Docker Hub (`auth.docker.io`, `registry-1.docker.io`). Fix your **network/DNS**, not the repo:

1. Confirm the PC has internet; in PowerShell: `nslookup auth.docker.io` (should return addresses).
2. **Pause VPN** or try another network; some VPNs break Docker’s DNS.
3. **Docker Desktop** → **Settings** → **Docker Engine** → add a DNS block if needed, then **Apply & restart**:
   ```json
   {
     "dns": ["8.8.8.8", "1.1.1.1"]
   }
   ```
4. Windows: `ipconfig /flushdns`, restart **Docker Desktop**, or `wsl --shutdown` then open Docker again.
5. Corporate networks: Docker Hub may be blocked — use approved proxy/mirror per IT.
6. This repo also pins service DNS in `docker-compose.yml` (`1.1.1.1`, `8.8.8.8`) for `frontend`/`backend`.

## Build fails with `npm error network ECONNRESET` or `aborted`

Docker runs `npm ci` **inside** the build; a flaky Wi‑Fi, VPN, firewall, or npm registry blip causes this. **Retry** `docker compose build --no-cache` (or just `docker compose up --build`). The Dockerfiles increase npm **fetch retries** and timeouts. If it keeps failing: try another network, pause VPN, or configure Docker/npm **proxy** if your workplace requires it.

## Quick start

1. Copy `.env.example` to `.env` in the **project root** and set at least `JWT_SECRET`, `CLOUDINARY_URL`, and `NEXT_PUBLIC_MAPBOX_TOKEN`.
2. From the project root:

```bash
docker compose up --build
```

3. Open **http://localhost:3000** (frontend) and **http://localhost:5000** (API).

**First start:** Images **do not** run `npm ci` during `docker build` (unreliable on some networks). The **frontend and backend entrypoints** install dependencies when the container starts. The **first** `docker compose up` can take **several minutes** while `npm ci` runs; ensure the machine has a working internet connection when containers start.

The backend runs `prisma migrate deploy` on each start so the database schema stays applied.

## Admin user

Sign up a normal account, then promote it (replace the email):

```bash
docker compose exec db psql -U user -d propertyonset -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'you@example.com';"
```

Refresh the app / log in again so the UI picks up the admin role if your JWT was issued before the change.

## `.next` / `node_modules` and Docker volumes

Compose mounts **`frontend_next`** on **`/app/.next`** and **`frontend_node_modules`** on **`/app/node_modules`**. Those paths are **volume mount points**, so **`rm -rf .next`** or **`rm -rf node_modules`** fails with *Device or resource busy*. The entrypoint clears **contents only** (`find … -mindepth 1 -delete`) before `npm ci` when reinstalling.

## Next.js / Turbopack / SWC errors in Docker

The frontend image uses **Debian (`bookworm-slim`)**, not Alpine, because **Next.js native SWC** targets **glibc**. On Alpine you may see `__register_atfork: symbol not found` and then WASM fallback errors like `turbo.createProject is not supported by the wasm bindings`.

After changing the frontend base image, **delete the frontend `node_modules` volume** once so dependencies reinstall for Linux/glibc:

```bash
docker compose down
docker volume rm "$(basename "$(pwd)")_frontend_node_modules" 2>/dev/null || true
# Or: docker volume ls   → find *frontend_node_modules* → docker volume rm <full_name>
docker compose up --build
```

On Windows PowerShell, list volumes with `docker volume ls`, then:

`docker volume rm propertyonset_frontend_node_modules` (prefix may match your project folder name).

## If nothing “goes live” (containers exit or localhost won’t load)

1. See logs: `docker compose logs -f` (or `docker compose logs frontend` / `backend`).
2. **Backend** often fails on the first DB seconds: migrations now **retry** automatically. If it still fails, run `docker compose logs backend` and check `DATABASE_URL`.
3. **Frontend** stuck on `npm ci`: ensure `frontend/package-lock.json` is committed and run `docker compose build --no-cache frontend`.
4. Clear stale caches:  
   `docker compose down`  
   then remove volumes named `*_frontend_node_modules` and optionally `*_frontend_next` (`docker volume ls`), then `docker compose up --build`.
5. Ports **3000** and **5000** must be free on the host (nothing else using them).

## Windows / shell scripts

If containers show **`exec … docker-entrypoint.sh: no such file or directory`**, the script usually has **CRLF** line endings (broken shebang). Dockerfiles run `sed` to strip `\r` on build; keep **`*.sh` as LF** in the editor (see `.gitattributes`). Old error: `/bin/sh^M`.

## Existing SQLite databases

The checked-in migration targets **PostgreSQL** only. If you previously applied an old SQLite migration locally, use a fresh Postgres volume (`docker compose down -v`) or create a new migration from your current schema.

## Production

For production, build images without bind-mounting source, set strong secrets, use `npm start` / `next start`, and put the stack behind HTTPS and a reverse proxy.
