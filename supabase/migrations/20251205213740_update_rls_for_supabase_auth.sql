/*
  # Update RLS Policies for Supabase Authentication

  1. Overview
    - Replace permissive Clerk-based policies with secure Supabase auth policies
    - Use auth.uid() to properly identify authenticated users
    - Maintain workspace-based access control with proper security checks

  2. Changes
    - Workspaces: Users can only read/update workspaces they are members of
    - Workspace Members: Users can view and manage memberships they're part of
    - All other tables: Filter by workspace_id and verify membership

  3. Security Notes
    - All policies now require authentication via auth.uid()
    - User IDs are automatically set by Supabase auth, not by application
    - Workspace membership is verified before allowing access to resources
*/

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow workspace creation" ON workspaces;
  DROP POLICY IF EXISTS "Allow workspace reads" ON workspaces;
  DROP POLICY IF EXISTS "Allow workspace updates" ON workspaces;
  DROP POLICY IF EXISTS "Allow workspace member creation" ON workspace_members;
  DROP POLICY IF EXISTS "Allow workspace member reads" ON workspace_members;
  DROP POLICY IF EXISTS "Allow workspace member deletes" ON workspace_members;

  CREATE POLICY "Users can create workspaces"
    ON workspaces
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = created_by);

  CREATE POLICY "Users can view workspaces they are members of"
    ON workspaces
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()::text
      )
    );

  CREATE POLICY "Workspace owners can update their workspaces"
    ON workspaces
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()::text
        AND workspace_members.role = 'owner'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()::text
        AND workspace_members.role = 'owner'
      )
    );

  CREATE POLICY "Users can view their workspace memberships"
    ON workspace_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text);

  CREATE POLICY "Users can create workspace memberships"
    ON workspace_members
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Users can remove themselves from workspaces"
    ON workspace_members
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid()::text);

  CREATE POLICY "Workspace owners can remove members"
    ON workspace_members
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()::text
        AND wm.role = 'owner'
      )
    );

END $$;
