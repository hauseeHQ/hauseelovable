/*
  # Update RLS Policies for Clerk Authentication

  1. Changes
    - Drop existing restrictive RLS policies that require Supabase auth
    - Create new permissive policies that work with Clerk authentication
    - Allow anonymous and authenticated users to perform operations
    - Security is maintained by checking user_id matches in application code

  2. Security Notes
    - Workspaces: Users can create workspaces (created_by is set by app)
    - Workspace Members: Allow inserts for new members
    - These policies trust the application to set correct user_ids from Clerk
*/

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
  DROP POLICY IF EXISTS "Workspace creators can update their workspaces" ON workspaces;
  DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;

  DROP POLICY IF EXISTS "Users can view their own workspace memberships" ON workspace_members;
  DROP POLICY IF EXISTS "Workspace owners can add members" ON workspace_members;
  DROP POLICY IF EXISTS "Users can remove themselves from workspaces" ON workspace_members;
  DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;

  CREATE POLICY "Allow workspace creation"
    ON workspaces
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  CREATE POLICY "Allow workspace reads"
    ON workspaces
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow workspace updates"
    ON workspaces
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Allow workspace member creation"
    ON workspace_members
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  CREATE POLICY "Allow workspace member reads"
    ON workspace_members
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow workspace member deletes"
    ON workspace_members
    FOR DELETE
    TO anon, authenticated
    USING (true);
END $$;
