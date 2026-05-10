-- Migration: 002_add_slug_year_vibe
-- Adds URL-friendly slug and computed year_by_year_vibe text to programs table

ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS year_by_year_vibe text;

CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
