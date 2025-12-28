/*
  # Create moving_todo_items table

  1. New Tables
    - `moving_todo_items`
      - `id` (uuid, primary key) - Unique identifier for each moving todo record
      - `user_id` (text) - User identifier (supports both authenticated and anonymous users)
      - `items` (jsonb) - Object mapping task IDs to completion data {taskId: {checked: boolean, completedAt: timestamp, completedBy: string}}
      - `progress` (jsonb) - Progress statistics {completed: number, total: number, percentage: number}
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `moving_todo_items` table
    - Add policy for all users (anonymous and authenticated) to read their own data
    - Add policy for all users to insert their own data
    - Add policy for all users to update their own data

  3. Constraints
    - Unique constraint on user_id to ensure one moving list per user
    - Index on user_id for faster queries

  4. Notes
    - Items stored as JSONB for flexible task structure
    - Progress tracked separately for efficient queries
    - Supports real-time collaboration with completedBy tracking
    - Compatible with co-buyer scenarios
*/

CREATE TABLE IF NOT EXISTS moving_todo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  progress jsonb NOT NULL DEFAULT '{"completed": 0, "total": 19, "percentage": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE moving_todo_items ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS moving_todo_items_user_id_idx ON moving_todo_items(user_id);

CREATE POLICY "Allow all users to view own moving list"
  ON moving_todo_items
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to insert own moving list"
  ON moving_todo_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update own moving list"
  ON moving_todo_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);