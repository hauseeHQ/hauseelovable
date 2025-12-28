/*
  # Create budget_planner table

  1. New Tables
    - `budget_planner` - stores user budget planning data

  2. Security
    - Enable RLS with policies for anonymous access
*/

CREATE TABLE IF NOT EXISTS budget_planner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  current_budget jsonb NOT NULL DEFAULT '{}'::jsonb,
  homeowner_budget jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculations jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budget_planner ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS budget_planner_user_id_idx ON budget_planner(user_id);

CREATE POLICY "Allow all users to view own budget"
  ON budget_planner FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert own budget"
  ON budget_planner FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update own budget"
  ON budget_planner FOR UPDATE USING (true) WITH CHECK (true);
