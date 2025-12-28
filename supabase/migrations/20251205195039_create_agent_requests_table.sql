/*
  # Create Agent Requests Table

  1. New Tables
    - `agent_requests` - stores agent matching requests

  2. Security
    - Enable RLS with policies for anonymous access
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

CREATE POLICY "Allow all users to view agent requests"
  ON agent_requests FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert agent requests"
  ON agent_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update agent requests"
  ON agent_requests FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete agent requests"
  ON agent_requests FOR DELETE USING (true);
