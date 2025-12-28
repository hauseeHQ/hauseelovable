/*
  # Create Home Inspections Table

  1. New Tables
    - `home_inspections`
      - `id` (uuid, primary key)
      - `home_id` (uuid, foreign key to homes)
      - `user_id` (text)
      - `categories` (jsonb) - stores all inspection data
      - `overall_progress` (jsonb) - stores progress metrics
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `home_inspections` table
    - Add policy for authenticated users to read their own inspections
    - Add policy for authenticated users to insert their own inspections
    - Add policy for authenticated users to update their own inspections

  3. Indexes
    - Index on home_id for faster lookups
    - Index on user_id for filtering
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

CREATE POLICY "Users can view own inspections"
  ON home_inspections FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own inspections"
  ON home_inspections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own inspections"
  ON home_inspections FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own inspections"
  ON home_inspections FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);