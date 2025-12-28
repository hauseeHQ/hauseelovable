/*
  # Create moving_todo_items table

  1. New Tables
    - `moving_todo_items` - stores moving task progress

  2. Security
    - Enable RLS with policies for anonymous access
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
  ON moving_todo_items FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert own moving list"
  ON moving_todo_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update own moving list"
  ON moving_todo_items FOR UPDATE USING (true) WITH CHECK (true);
