/*
  # Allow Anonymous Access to Dream Home Preferences (Temporary)

  1. Changes
    - Drop existing RLS policies that require authentication
    - Create new permissive policies for anonymous users
    - Allow full CRUD operations without authentication for testing

  2. Security Note
    - This is a temporary change for development/testing purposes
    - RLS is still enabled but allows anonymous access
    - Should be reverted when authentication is re-enabled
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own dream home preferences" ON dream_home_preferences;
DROP POLICY IF EXISTS "Users can insert own dream home preferences" ON dream_home_preferences;
DROP POLICY IF EXISTS "Users can update own dream home preferences" ON dream_home_preferences;
DROP POLICY IF EXISTS "Users can delete own dream home preferences" ON dream_home_preferences;

-- Create permissive policies for anonymous access
CREATE POLICY "Allow anonymous read access"
  ON dream_home_preferences
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access"
  ON dream_home_preferences
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
  ON dream_home_preferences
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access"
  ON dream_home_preferences
  FOR DELETE
  TO anon
  USING (true);