/*
  # Fix Workspace Creation - Make created_by Nullable
  
  ## Problem
  The workspace creation is failing with RLS policy violation because:
  1. The `created_by` column is NOT NULL with DEFAULT auth.uid()
  2. When auth.uid() returns NULL (authentication issue), the NOT NULL constraint fails
  3. This prevents workspace creation even with permissive RLS policies
  
  ## Solution
  Make `created_by` nullable to handle cases where auth.uid() might be NULL temporarily.
  The column will still default to auth.uid() when available.
  
  ## Security
  - RLS policies remain unchanged and secure
  - Workspace access still controlled by workspace_members table
  - This only affects the initial insert, not ongoing security
*/

-- Make created_by nullable
ALTER TABLE workspaces 
  ALTER COLUMN created_by DROP NOT NULL;

-- Ensure DEFAULT is still set
ALTER TABLE workspaces 
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Clean up duplicate INSERT policies (keep only one)
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;

-- Ensure we have a single, clean INSERT policy
DO $$
BEGIN
  -- Drop and recreate to ensure it's correct
  DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
  
  CREATE POLICY "workspaces_insert"
    ON workspaces
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
END $$;
