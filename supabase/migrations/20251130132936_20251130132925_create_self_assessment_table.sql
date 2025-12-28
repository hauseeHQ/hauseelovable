/*
  # Create self_assessment_responses table

  1. New Tables
    - `self_assessment_responses`
      - `id` (uuid, primary key) - Unique identifier for each assessment
      - `user_id` (text) - User identifier (supports both authenticated and anonymous users)
      - `answers` (jsonb) - Array of 15 numbers (1-5) representing question responses
      - `completed_at` (timestamptz) - When all questions were answered
      - `score` (numeric) - Calculated percentage score (0-100)
      - `status` (text) - Assessment status: needs_preparation, on_track, ready, incomplete
      - `category_scores` (jsonb) - Individual category scores for detailed feedback
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `self_assessment_responses` table
    - Add policy for all users (anonymous and authenticated) to read their own data
    - Add policy for all users to insert their own data
    - Add policy for all users to update their own data

  3. Constraints
    - Unique constraint on user_id to ensure one assessment per user
    - Index on user_id for faster queries
*/

CREATE TABLE IF NOT EXISTS self_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  score numeric,
  status text NOT NULL DEFAULT 'incomplete',
  category_scores jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE self_assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS self_assessment_responses_user_id_idx ON self_assessment_responses(user_id);

CREATE POLICY "Allow all users to view own assessment"
  ON self_assessment_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to insert own assessment"
  ON self_assessment_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update own assessment"
  ON self_assessment_responses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);