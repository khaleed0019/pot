-- Enum values must be committed before use (Postgres). This migration only adds enum values.
ALTER TYPE "ListingType" ADD VALUE IF NOT EXISTS 'SHORTLET';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
