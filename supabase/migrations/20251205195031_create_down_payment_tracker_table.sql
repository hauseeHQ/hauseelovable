/*
  # Create Down Payment Tracker Table

  1. New Tables
    - `down_payment_tracker` - stores down payment goals and progress

  2. Security
    - Enable RLS with policies for anonymous access
*/

CREATE TABLE IF NOT EXISTS down_payment_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  goal jsonb DEFAULT '{}',
  accounts jsonb DEFAULT '[]',
  contributions jsonb DEFAULT '[]',
  calculations jsonb DEFAULT '{}',
  milestones jsonb DEFAULT '{"reached25": false, "reached50": false, "reached75": false, "reached100": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE down_payment_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view own down payment tracker"
  ON down_payment_tracker FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert own down payment tracker"
  ON down_payment_tracker FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update own down payment tracker"
  ON down_payment_tracker FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_down_payment_tracker_user_id ON down_payment_tracker(user_id);
