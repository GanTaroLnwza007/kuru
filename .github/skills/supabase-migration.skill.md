---
description: How to write, name, and apply Supabase migrations in KUru. Use this skill whenever a task requires adding tables, columns, indexes, RLS policies, or RPC functions to the database.
---

# Skill: Supabase migration

Every database change in KUru goes through a numbered migration file. Never alter tables directly in the Supabase dashboard.

## File naming

```
supabase/migrations/YYYYMMDDHHMMSS_short_description.sql
```

Use the current UTC timestamp. Examples:
```
20250601120000_create_programs.sql
20250601120100_add_embedding_index_plos.sql
20250601120200_rls_user_sessions.sql
```

## Migration file structure

```sql
-- Migration: 20250601120000_create_programs.sql
-- Description: Creates the programs table with pgvector embedding column.
-- Spec ref: data-schema.md §2.1

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_th         TEXT NOT NULL,
    name_en         TEXT NOT NULL,
    faculty_th      TEXT NOT NULL,
    faculty_en      TEXT NOT NULL,
    degree_level    TEXT NOT NULL CHECK (degree_level IN ('bachelor','master','doctoral')),
    campus          TEXT NOT NULL,
    tcas_rounds     TEXT[] NOT NULL DEFAULT '{}',
    total_credits   INT,
    program_code    TEXT UNIQUE,
    year_by_year_vibe TEXT,
    embedding       vector(768),        -- gemini-embedding-001 output; DO NOT change dimension
    is_in_scope     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- IVFFlat index for cosine similarity search (pgvector-search.skill.md)
CREATE INDEX IF NOT EXISTS programs_embedding_idx
    ON programs USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Always add an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Public read: programs data is not sensitive
CREATE POLICY "programs_public_read" ON programs
    FOR SELECT USING (true);

-- Write restricted to service_role only (admin pipeline)
CREATE POLICY "programs_service_write" ON programs
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- DOWN (for rollback — always include)
-- ============================================================
-- DROP TABLE IF EXISTS programs CASCADE;
```

## Adding a vector search RPC function

Add RPC functions in a dedicated migration after the table is created:

```sql
-- Migration: 20250601120300_search_rpc_programs.sql

CREATE OR REPLACE FUNCTION search_programs(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE(
    id uuid,
    name_en text,
    name_th text,
    faculty_en text,
    year_by_year_vibe text,
    similarity float
)
LANGUAGE sql STABLE AS $$
    SELECT
        id, name_en, name_th, faculty_en, year_by_year_vibe,
        1 - (embedding <=> query_embedding) AS similarity
    FROM programs
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
```

## RLS policy patterns

```sql
-- User can only read/write their own rows
CREATE POLICY "user_own_sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Public read, service_role write (for reference tables)
CREATE POLICY "public_read" ON careers FOR SELECT USING (true);
CREATE POLICY "service_write" ON careers FOR ALL USING (auth.role() = 'service_role');

-- Authenticated read only
CREATE POLICY "auth_read" ON portfolio_criteria
    FOR SELECT USING (auth.role() = 'authenticated');
```

## Applying migrations locally

```bash
# Apply all pending migrations
supabase db push

# Reset and reapply everything (dev only — destroys all data)
supabase db reset

# Check migration status
supabase migration list
```

## Rules — never violate

- **Never alter a `vector(768)` column dimension** without a full migration that drops and recreates the index and re-embeds all rows.
- **Always include a commented DOWN block** even if it's just a `DROP TABLE`.
- **Always enable RLS** (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`) in the same migration that creates the table.
- **Always add an IVFFlat index** on every `vector(768)` column with `lists = 100`.
- **Never write migrations that depend on data** in other tables unless that data is guaranteed to exist (use a separate seeding migration).
- Migrations run in timestamp order — if two developers write migrations simultaneously, the one with the later timestamp wins. Coordinate before committing.