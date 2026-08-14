# Google Sign-In

## How it works

Auth is handled entirely by **Supabase Auth** — there is no custom Google OAuth
code in this repo. The frontend calls
`supabase.auth.signInWithOAuth({ provider: 'google' })`
(`frontend/src/contexts/AuthContext.tsx`), Supabase runs the OAuth exchange
with Google, and redirects back to `/auth/callback`, which waits for the
session and routes the user by role. The backend never talks to Google
directly — it verifies the Supabase-issued access token against Supabase's
JWKS (`backend/src/utils/supabaseAuth.ts`).

> An earlier version of this doc described a custom `@react-oauth/google` +
> `POST /api/auth/google` flow. That code no longer exists — don't follow
> old instructions referencing `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
> env vars or a backend `/api/auth/google` route.

## One-time setup

### 1. Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **OAuth consent screen** → configure, add scopes `email`, `profile`, `openid`. Add yourself as a test user if the app is still in Testing mode.
2. **Credentials** → **Create credentials** → **OAuth client ID** → **Web application**.
3. **Authorized JavaScript origins** (optional but recommended): your app URLs, e.g. `http://localhost:3000` and your production domain.
4. **Authorized redirect URIs** — this is the one that actually matters for Supabase-managed OAuth, and the step most setups get wrong:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   This is a **Supabase** URL, not your app's URL. Find `<YOUR-PROJECT-REF>` in Supabase → **Project Settings** → **API** → Project URL.
5. Copy the **Client ID** and **Client Secret**.

### 2. Supabase Dashboard

1. **Authentication** → **Providers** → **Google** → toggle **Enabled**.
2. Paste the Google **Client ID** and **Client Secret** from step 1.
3. **Authentication** → **URL Configuration** → **Redirect URLs** → add:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://your-app.vercel.app/auth/callback` (production)

   Supabase refuses the final redirect back into the app if the URL isn't on this list — this is the single most common cause of "it redirects to Google fine, then fails on the way back."

### 3. App environment variables

Only Supabase's own project URL and public key are needed — both are safe to expose to the browser:

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `frontend/.env.local` (and Vercel) | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `frontend/.env.local` (and Vercel) | Supabase → Project Settings → API → anon/publishable key |
| `SUPABASE_URL` | `backend/.env` (and Render) | Same Project URL — used to fetch the JWKS that verifies tokens |

Restart `npm run dev` (frontend and backend) after changing env vars.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Supabase is not configured" error the instant you click the button | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` missing from `frontend/.env.local` |
| Redirects to Google, signs in, then bounces back to `/login` with an error banner | `/auth/callback` surfaces Supabase/Google's `error_description` verbatim — read it, it's usually accurate |
| Google shows **"Error 400: redirect_uri_mismatch"** | The Authorized redirect URI in Google Cloud Console isn't exactly `https://<project-ref>.supabase.co/auth/v1/callback` |
| Callback page error mentions the redirect/site URL | The exact `/auth/callback` URL you're testing from isn't in Supabase's **Redirect URLs** allow-list |
| Email/password login works but Google doesn't | Google isn't toggled on under Supabase **Authentication → Providers**, or the Client ID/Secret there is stale (regenerated in Google Cloud Console since) |
| Google sign-in completes but every API call 401s afterward | Backend's `SUPABASE_URL` is missing or points at a different Supabase project than the frontend's `NEXT_PUBLIC_SUPABASE_URL` |
