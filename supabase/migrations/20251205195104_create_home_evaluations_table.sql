/*
  # Create Home Evaluations Table

  1. New Tables
    - `home_evaluations`
      - `id` (uuid, primary key)
      - `home_id` (uuid, foreign key to homes table)
      - `user_id` (text) - owner of the evaluation
      - `ratings` (jsonb) - stores all rating values by category and item
      - `item_notes` (jsonb) - stores notes for individual items (max 500 chars each)
      - `section_notes` (jsonb) - stores notes for entire sections (max 1000 chars each)
      - `overall_rating` (numeric) - calculated rating from 0-5
      - `completion_percentage` (integer) - percentage of items rated (0-100)
      - `evaluation_status` (text) - not_started, in_progress, completed
      - `started_at` (timestamptz) - when evaluation was first started
      - `completed_at` (timestamptz) - when evaluation was marked complete
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS with policies for anonymous access

  3. Indexes
    - Index on `home_id` for fast lookups by home
    - Index on `user_id` for fast lookups by user
    - Index on `evaluation_status` for filtering
    - Unique constraint on (home_id, user_id) - one evaluation per home per user

  4. Constraints
    - Ensure one evaluation per home per user
    - Rating must be between 0 and 5
    - Completion percentage must be between 0 and 100
    - Status must be valid value
*/

CREATE TABLE IF NOT EXISTS home_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id text NOT NULL,

  ratings jsonb DEFAULT '{}',
  item_notes jsonb DEFAULT '{}',
  section_notes jsonb DEFAULT '{}',

  overall_rating numeric DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 5),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  evaluation_status text DEFAULT 'not_started' CHECK (evaluation_status IN ('not_started', 'in_progress', 'completed')),

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(home_id, user_id)
);

ALTER TABLE home_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view evaluations"
  ON home_evaluations FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert evaluations"
  ON home_evaluations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update evaluations"
  ON home_evaluations FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete evaluations"
  ON home_evaluations FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_home_evaluations_home_id ON home_evaluations(home_id);
CREATE INDEX IF NOT EXISTS idx_home_evaluations_user_id ON home_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_home_evaluations_status ON home_evaluations(evaluation_status);
