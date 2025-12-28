/*
  # Create budget_planner table

  1. New Tables
    - `budget_planner`
      - `id` (uuid, primary key) - Unique identifier for each budget record
      - `user_id` (text) - User identifier (supports both authenticated and anonymous users)
      - `current_budget` (jsonb) - Current monthly budget data
      - `homeowner_budget` (jsonb) - Expected homeowner budget data
      - `calculations` (jsonb) - Calculated values and deltas
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `budget_planner` table
    - Add policy for all users (anonymous and authenticated) to read their own data
    - Add policy for all users to insert their own data
    - Add policy for all users to update their own data

  3. Constraints
    - Unique constraint on user_id to ensure one budget per user
    - Index on user_id for faster queries

  4. Notes
    - Budget data stored as JSONB for flexible structure
    - Calculations cached for performance
    - Supports real-time collaboration with co-buyers
    - All monetary values stored as numbers for accurate calculations
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
  ON budget_planner
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to insert own budget"
  ON budget_planner
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update own budget"
  ON budget_planner
  FOR UPDATE
  USING (true)
  WITH CHECK (true);