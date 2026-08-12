import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies Supabase Auth access tokens.
 *
 * Supabase signs access tokens with an asymmetric ES256 key and publishes the
 * public half at /auth/v1/.well-known/jwks.json. `createRemoteJWKSet` fetches
 * and caches those keys, so verification is local after the first request —
 * no network round trip per API call, and no shared secret to leak.
 */

const SUPABASE_URL = () => process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  const base = SUPABASE_URL();
  if (!base) {
    throw new Error('SUPABASE_URL is not set — cannot verify auth tokens');
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`));
  }
  return jwks;
}

export type SupabaseTokenClaims = JWTPayload & {
  sub: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export async function verifySupabaseToken(accessToken: string): Promise<SupabaseTokenClaims> {
  const base = SUPABASE_URL();
  const { payload } = await jwtVerify(accessToken, getJwks(), {
    // Supabase issues tokens with iss = <project>/auth/v1 and aud = "authenticated".
    issuer: `${base}/auth/v1`,
    audience: 'authenticated',
  });

  if (!payload.sub) {
    throw new Error('Token is missing a subject claim');
  }

  return payload as SupabaseTokenClaims;
}

/** Pull the display name / avatar out of whichever metadata key the provider used. */
export function claimsToProfile(claims: SupabaseTokenClaims) {
  const meta = claims.user_metadata ?? {};
  const email = typeof claims.email === 'string' ? claims.email : undefined;
  return {
    authUid: claims.sub,
    email,
    name: meta.full_name || meta.name || (email ? email.split('@')[0] : 'User'),
    profileImage: meta.avatar_url || meta.picture,
  };
}
