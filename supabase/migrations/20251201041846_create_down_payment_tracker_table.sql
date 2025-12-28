/*
  # Create Down Payment Tracker Table

  1. New Tables
    - `down_payment_tracker`
      - `id` (uuid, primary key)
      - `user_id` (text, unique)
      - `goal` (jsonb) - stores target price, down payment %, timeline
      - `accounts` (jsonb) - stores array of savings accounts with balances and allocations
      - `contributions` (jsonb) - stores array of contribution history
      - `calculations` (jsonb) - stores calculated values like progress %, remaining amount
      - `milestones` (jsonb) - stores milestone completion flags
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `down_payment_tracker` table
    - Add policy for users to read their own data
    - Add policy for users to insert their own data
    - Add policy for users to update their own data

  3. Indexes
    - Index on `user_id` for fast lookups
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

CREATE POLICY "Users can view own down payment tracker"
  ON down_payment_tracker FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own down payment tracker"
  ON down_payment_tracker FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own down payment tracker"
  ON down_payment_tracker FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_down_payment_tracker_user_id ON down_payment_tracker(user_id);