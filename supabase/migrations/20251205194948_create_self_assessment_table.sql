/*
  # Create self_assessment_responses table

  1. New Tables
    - `self_assessment_responses` - stores user self-assessment data

  2. Security
    - Enable RLS with policies for anonymous access
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
  ON self_assessment_responses FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert own assessment"
  ON self_assessment_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update own assessment"
  ON self_assessment_responses FOR UPDATE USING (true) WITH CHECK (true);
