/*
  # Add Read Policy to Workspaces Table

  1. Changes
    - Add SELECT policy for workspaces table
    - Users can view workspaces they are members of
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspaces' 
    AND policyname = 'Users can view workspaces they are members of'
  ) THEN
    CREATE POLICY "Users can view workspaces they are members of"
      ON workspaces
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.jwt()->>'sub'
        )
      );
  END IF;
END $$;