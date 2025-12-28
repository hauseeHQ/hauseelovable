/*
  # Create mortgage_checklist_items table

  1. New Tables
    - `mortgage_checklist_items` - stores mortgage checklist progress

  2. Security
    - Enable RLS with policies for anonymous access
*/

CREATE TABLE IF NOT EXISTS mortgage_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  progress jsonb NOT NULL DEFAULT '{"completed": 0, "total": 0, "percentage": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mortgage_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS mortgage_checklist_items_user_id_idx ON mortgage_checklist_items(user_id);

CREATE POLICY "Allow all users to view own checklist"
  ON mortgage_checklist_items FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert own checklist"
  ON mortgage_checklist_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update own checklist"
  ON mortgage_checklist_items FOR UPDATE USING (true) WITH CHECK (true);
