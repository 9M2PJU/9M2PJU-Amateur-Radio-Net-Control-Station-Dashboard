-- Add slug column to nets table for user-friendly URLs
-- Run this migration in your Supabase SQL editor

-- Add slug column
ALTER TABLE nets ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_nets_slug ON nets(slug);

-- Backfill existing nets with slugs (optional, for existing data)
-- This will generate slugs for existing nets based on their name and created_at
UPDATE nets 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^\w\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ) || '-' || TO_CHAR(created_at, 'YYYY-MM-DD')
)
WHERE slug IS NULL;
