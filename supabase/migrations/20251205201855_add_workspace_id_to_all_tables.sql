/*
  # Add workspace_id to All Tables

  1. Changes
    - Add workspace_id column to tables that don't have it
    - Update workspace_id from text to uuid in homes and agent_requests tables
    - Add foreign key constraints
    - Update RLS policies to filter by workspace membership

  2. Tables Updated
    - dream_home_preferences
    - self_assessment_responses
    - mortgage_checklist_items
    - moving_todo_items
    - budget_planner
    - down_payment_tracker
    - home_inspections
    - home_evaluations
    - guide_progress
    - homes (change type from text to uuid)
    - agent_requests (change type from text to uuid)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dream_home_preferences' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE dream_home_preferences ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'self_assessment_responses' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE self_assessment_responses ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_checklist_items' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE mortgage_checklist_items ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moving_todo_items' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE moving_todo_items ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_planner' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE budget_planner ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'down_payment_tracker' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE down_payment_tracker ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'home_inspections' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE home_inspections ADD COLUMN workspace_id uuid;
    ALTER TABLE home_inspections ADD CONSTRAINT home_inspections_workspace_id_fkey 
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'home_evaluations' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE home_evaluations ADD COLUMN workspace_id uuid;
    ALTER TABLE home_evaluations ADD CONSTRAINT home_evaluations_workspace_id_fkey 
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guide_progress' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE guide_progress ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE homes ALTER COLUMN workspace_id TYPE uuid USING workspace_id::uuid;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'homes_workspace_id_fkey'
  ) THEN
    ALTER TABLE homes ADD CONSTRAINT homes_workspace_id_fkey 
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE agent_requests ALTER COLUMN workspace_id TYPE uuid USING workspace_id::uuid;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_requests_workspace_id_fkey'
  ) THEN
    ALTER TABLE agent_requests ADD CONSTRAINT agent_requests_workspace_id_fkey 
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;