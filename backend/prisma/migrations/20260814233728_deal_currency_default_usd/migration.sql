-- The Deal model's currency default was NGN, left over from before this
-- project's USD conversion. New Deal rows should default to USD like every
-- other price field in the app. Existing rows (there are none yet) are
-- unaffected — DEFAULT only applies to future inserts that omit the column.

ALTER TABLE "Deal" ALTER COLUMN "currency" SET DEFAULT 'USD';
