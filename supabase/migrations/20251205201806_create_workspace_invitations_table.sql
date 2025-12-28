/*
  # Create Workspace Invitations Table

  1. New Tables
    - `workspace_invitations`
      - `id` (uuid, primary key) - Unique identifier
      - `workspace_id` (uuid, foreign key) - Reference to workspace
      - `invitation_token` (text, unique) - Unique token for the invitation link
      - `created_by` (text) - Clerk user ID of invitation creator
      - `expires_at` (timestamptz) - When the invitation expires
      - `used_at` (timestamptz) - When the invitation was used (null if not used)
      - `used_by` (text) - Clerk user ID who used the invitation
      - `created_at` (timestamptz) - Record creation timestamp

  2. Indexes
    - Unique index on invitation_token for quick lookups
    - Index on workspace_id for efficient filtering

  3. Security
    - Enable RLS on `workspace_invitations` table
    - Add policy for workspace owners to create invitations
    - Add policy for workspace owners to view invitations for their workspace
    - Add policy for authenticated users to view invitation details by token (for accepting)
*/

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invitation_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  used_by text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_invitations_token_idx 
  ON workspace_invitations(invitation_token);

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_id_idx 
  ON workspace_invitations(workspace_id);

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can create invitations"
  ON workspace_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
      AND workspace_members.role = 'owner'
    )
  );

CREATE POLICY "Workspace owners can view their workspace invitations"
  ON workspace_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
      AND workspace_members.role = 'owner'
    )
  );

CREATE POLICY "Anyone can view invitation by token for acceptance"
  ON workspace_invitations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can mark invitation as used when they accept"
  ON workspace_invitations
  FOR UPDATE
  TO authenticated
  USING (used_at IS NULL AND expires_at > now())
  WITH CHECK (used_by = auth.jwt()->>'sub');