# Google Sign-In / Sign-Up

## What was added

- **Backend:** `POST /api/auth/google` with body `{ "idToken": "<Google JWT>" }`. Verifies the token with Google and creates or links a user, then returns your app JWT (same as email/password login).
- **Database:** `User.password` is optional; `User.googleId` stores the Google subject id.
- **Frontend:** “Continue with Google” on **Login** and **Signup** (`@react-oauth/google`).

## Google Cloud setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) → select or create a project.
2. **APIs & Services** → **OAuth consent screen** → configure (External or Internal) and add scopes **email**, **profile**, **openid**.
3. **Credentials** → **Create credentials** → **OAuth client ID** → **Web application**.
4. **Authorized JavaScript origins** (required for the Sign-In button):
   - `http://localhost:3000`
   - Add your production URL when you deploy (e.g. `https://yourdomain.com`).
5. Copy the **Client ID** (looks like `xxxxx.apps.googleusercontent.com`).

## Environment variables

Use the **same** OAuth 2.0 Web Client ID in both places:

| Variable | Where |
|----------|--------|
| `GOOGLE_CLIENT_ID` | Backend (server verifies tokens) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Frontend (renders the Google button) |

Add them to `.env` at the project root (Docker Compose loads them) or to `frontend/.env.local` for local Next dev.

Restart the API and Next after changing env.

## Database migration

After pulling changes, apply the Prisma migration (includes nullable `password` and `googleId`):

```bash
cd backend
npx prisma migrate deploy
```

## Behavior

- **New Google user:** Creates a `USER` account with no password; sign-in is via Google only unless you add a password flow later.
- **Existing email/password user, same Google email:** First Google sign-in **links** `googleId` to the existing account.
- **Login with password** for a Google-only account: API returns *“This account uses Google sign-in”*.

## Troubleshooting

- **Button shows “Set NEXT_PUBLIC_GOOGLE_CLIENT_ID”:** Set the public env var and rebuild/restart the frontend.
- **“Google sign-in is not configured”:** Set `GOOGLE_CLIENT_ID` on the backend.
- **“Invalid Google token” / 400:** Origins mismatch → add your exact app URL (scheme + host + port) to **Authorized JavaScript origins** in Google Cloud.
