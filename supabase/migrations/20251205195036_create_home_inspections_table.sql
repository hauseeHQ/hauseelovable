/*
  # Create Home Inspections Table

  1. New Tables
    - `home_inspections` - stores DIY inspection data

  2. Security
    - Enable RLS with policies for anonymous access
*/

CREATE TABLE IF NOT EXISTS home_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  categories JSONB DEFAULT '{}'::jsonb,
  overall_progress JSONB DEFAULT '{
    "completed": 0,
    "total": 0,
    "percentage": 0,
    "goodCount": 0,
    "fixCount": 0,
    "replaceCount": 0
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(home_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_inspections_home_id ON home_inspections(home_id);
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON home_inspections(user_id);

ALTER TABLE home_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view inspections"
  ON home_inspections FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert inspections"
  ON home_inspections FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update inspections"
  ON home_inspections FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete inspections"
  ON home_inspections FOR DELETE USING (true);
