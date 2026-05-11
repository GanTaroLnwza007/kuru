-- Run this in the Supabase SQL Editor once
CREATE TABLE IF NOT EXISTS feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text,
  question    text,
  answer      text,
  rating      smallint CHECK (rating IN (-1, 1)),
  created_at  timestamptz DEFAULT now()
);
