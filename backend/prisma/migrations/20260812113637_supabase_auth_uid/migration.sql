-- Move from Firebase Auth to Supabase Auth.
--
-- `firebaseUid` held the Firebase UID; the equivalent under Supabase Auth is the
-- JWT `sub` claim. Renamed rather than dropped/recreated so any existing rows
-- keep their link. `googleId` was dead in every code path — Supabase tracks
-- linked providers in auth.identities, so the app no longer needs its own column.

DROP INDEX IF EXISTS "User_googleId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleId";

ALTER INDEX IF EXISTS "User_firebaseUid_key" RENAME TO "User_authUid_key";
ALTER TABLE "User" RENAME COLUMN "firebaseUid" TO "authUid";

-- Align a pre-existing drift between the schema and the migration history.
ALTER TABLE "Property" ALTER COLUMN "type" SET DEFAULT 'SALE';
