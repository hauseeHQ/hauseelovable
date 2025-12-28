/*
  # Create Workspace Members Table

  1. New Tables
    - `workspace_members`
      - `id` (uuid, primary key) - Unique identifier
      - `workspace_id` (uuid, foreign key) - Reference to workspace
      - `user_id` (text) - Clerk user ID
      - `role` (text) - Member role: 'owner' or 'member'
      - `joined_at` (timestamptz) - When the user joined the workspace
      - `created_at` (timestamptz) - Record creation timestamp

  2. Indexes
    - Unique index on (workspace_id, user_id) to prevent duplicate memberships
    - Index on user_id for efficient lookups

  3. Security
    - Enable RLS on `workspace_members` table
    - Add policy for users to view their own memberships
    - Add policy for workspace owners to add members
    - Add policy for users to remove themselves from workspaces
*/

CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_user_idx 
  ON workspace_members(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx 
  ON workspace_members(user_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workspace memberships"
  ON workspace_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Workspace owners can add members"
  ON workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members existing
      WHERE existing.workspace_id = workspace_members.workspace_id
      AND existing.user_id = auth.jwt()->>'sub'
      AND existing.role = 'owner'
    )
    OR 
    user_id = auth.jwt()->>'sub'
  );

CREATE POLICY "Users can remove themselves from workspaces"
  ON workspace_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Workspace owners can remove members"
  ON workspace_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members existing
      WHERE existing.workspace_id = workspace_members.workspace_id
      AND existing.user_id = auth.jwt()->>'sub'
      AND existing.role = 'owner'
    )
  );