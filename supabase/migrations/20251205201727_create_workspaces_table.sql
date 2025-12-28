/*
  # Create Workspaces Table

  1. New Tables
    - `workspaces`
      - `id` (uuid, primary key) - Unique identifier for the workspace
      - `name` (text) - Display name for the workspace
      - `created_by` (text) - Clerk user ID of the workspace creator
      - `created_at` (timestamptz) - When the workspace was created
      - `updated_at` (timestamptz) - When the workspace was last updated

  2. Security
    - Enable RLS on `workspaces` table
    - Add policies for workspace creation and updates
    - Read policy will be added after workspace_members table is created
*/

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Workspace',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create workspaces"
  ON workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.jwt()->>'sub');

CREATE POLICY "Workspace creators can update their workspaces"
  ON workspaces
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.jwt()->>'sub')
  WITH CHECK (created_by = auth.jwt()->>'sub');