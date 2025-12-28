/*
  # Create Agent Requests Table

  1. New Tables
    - `agent_requests`
      - `id` (uuid, primary key)
      - `user_id` (text) - authenticated user
      - `workspace_id` (text) - for co-buyer support
      - `form_data` (jsonb) - complete form submission
      - `status` (text) - draft or submitted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `agent_requests` table
    - Add policy for authenticated users to read their own requests
    - Add policy for authenticated users to insert their own requests
    - Add policy for authenticated users to update their own requests

  3. Indexes
    - Index on user_id for faster lookups
    - Index on workspace_id for filtering
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS agent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  
  form_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_requests_user_id ON agent_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_workspace_id ON agent_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON agent_requests(status);

ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent requests"
  ON agent_requests FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own agent requests"
  ON agent_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own agent requests"
  ON agent_requests FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own agent requests"
  ON agent_requests FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);