ALTER TABLE match_metadata
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
