-- Reversible account suspension: block sign-in/API access without deleting
-- the account or cascading into their listings/deals.
ALTER TABLE "User" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;
