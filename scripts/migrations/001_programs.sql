-- Migration: 001_programs
-- Creates the programs table for KUru MVP

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS programs (
    id            TEXT PRIMARY KEY,
    name_th       TEXT NOT NULL,
    name_en       TEXT NOT NULL,
    faculty_th    TEXT NOT NULL,
    faculty_en    TEXT NOT NULL,
    degree        TEXT NOT NULL DEFAULT 'ปริญญาตรี',
    campus        TEXT NOT NULL DEFAULT 'Bang Khen',
    year_by_year_vibe TEXT,
    embedding     vector(768),
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_campus ON programs(campus);
CREATE INDEX IF NOT EXISTS idx_programs_faculty_en ON programs(faculty_en);
