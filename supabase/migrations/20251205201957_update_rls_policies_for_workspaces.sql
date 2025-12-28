/*
  # Update RLS Policies for Workspace Filtering

  1. Changes
    - Drop existing policies that don't filter by workspace
    - Add new policies that check workspace membership for all tables
    - Users can only access data in workspaces they are members of

  2. Security
    - All SELECT, INSERT, UPDATE, DELETE operations filtered by workspace membership
    - Users must be authenticated to access any data
*/

DROP POLICY IF EXISTS "Users can view their own dream home preferences" ON dream_home_preferences;
DROP POLICY IF EXISTS "Users can insert their own dream home preferences" ON dream_home_preferences;
DROP POLICY IF EXISTS "Users can update their own dream home preferences" ON dream_home_preferences;

CREATE POLICY "Users can view dream home in their workspaces"
  ON dream_home_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = dream_home_preferences.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert dream home in their workspaces"
  ON dream_home_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = dream_home_preferences.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update dream home in their workspaces"
  ON dream_home_preferences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = dream_home_preferences.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = dream_home_preferences.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own assessment responses" ON self_assessment_responses;
DROP POLICY IF EXISTS "Users can insert their own assessment responses" ON self_assessment_responses;
DROP POLICY IF EXISTS "Users can update their own assessment responses" ON self_assessment_responses;

CREATE POLICY "Users can view assessments in their workspaces"
  ON self_assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = self_assessment_responses.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert assessments in their workspaces"
  ON self_assessment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = self_assessment_responses.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update assessments in their workspaces"
  ON self_assessment_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = self_assessment_responses.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = self_assessment_responses.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own mortgage checklist" ON mortgage_checklist_items;
DROP POLICY IF EXISTS "Users can insert their own mortgage checklist" ON mortgage_checklist_items;
DROP POLICY IF EXISTS "Users can update their own mortgage checklist" ON mortgage_checklist_items;

CREATE POLICY "Users can view mortgage checklist in their workspaces"
  ON mortgage_checklist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = mortgage_checklist_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert mortgage checklist in their workspaces"
  ON mortgage_checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = mortgage_checklist_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update mortgage checklist in their workspaces"
  ON mortgage_checklist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = mortgage_checklist_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = mortgage_checklist_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own moving todo items" ON moving_todo_items;
DROP POLICY IF EXISTS "Users can insert their own moving todo items" ON moving_todo_items;
DROP POLICY IF EXISTS "Users can update their own moving todo items" ON moving_todo_items;

CREATE POLICY "Users can view moving todos in their workspaces"
  ON moving_todo_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = moving_todo_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert moving todos in their workspaces"
  ON moving_todo_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = moving_todo_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update moving todos in their workspaces"
  ON moving_todo_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = moving_todo_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = moving_todo_items.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own budget" ON budget_planner;
DROP POLICY IF EXISTS "Users can insert their own budget" ON budget_planner;
DROP POLICY IF EXISTS "Users can update their own budget" ON budget_planner;

CREATE POLICY "Users can view budget in their workspaces"
  ON budget_planner
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = budget_planner.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert budget in their workspaces"
  ON budget_planner
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = budget_planner.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update budget in their workspaces"
  ON budget_planner
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = budget_planner.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = budget_planner.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own down payment tracker" ON down_payment_tracker;
DROP POLICY IF EXISTS "Users can insert their own down payment tracker" ON down_payment_tracker;
DROP POLICY IF EXISTS "Users can update their own down payment tracker" ON down_payment_tracker;

CREATE POLICY "Users can view down payment tracker in their workspaces"
  ON down_payment_tracker
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = down_payment_tracker.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert down payment tracker in their workspaces"
  ON down_payment_tracker
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = down_payment_tracker.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update down payment tracker in their workspaces"
  ON down_payment_tracker
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = down_payment_tracker.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = down_payment_tracker.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view homes they created" ON homes;
DROP POLICY IF EXISTS "Users can insert their own homes" ON homes;
DROP POLICY IF EXISTS "Users can update homes they created" ON homes;
DROP POLICY IF EXISTS "Users can delete homes they created" ON homes;

CREATE POLICY "Users can view homes in their workspaces"
  ON homes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = homes.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert homes in their workspaces"
  ON homes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = homes.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update homes in their workspaces"
  ON homes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = homes.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = homes.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can delete homes in their workspaces"
  ON homes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = homes.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view home evaluations they created" ON home_evaluations;
DROP POLICY IF EXISTS "Users can insert their own home evaluations" ON home_evaluations;
DROP POLICY IF EXISTS "Users can update home evaluations they created" ON home_evaluations;

CREATE POLICY "Users can view evaluations in their workspaces"
  ON home_evaluations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_evaluations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert evaluations in their workspaces"
  ON home_evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_evaluations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update evaluations in their workspaces"
  ON home_evaluations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_evaluations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_evaluations.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view home inspections they created" ON home_inspections;
DROP POLICY IF EXISTS "Users can insert their own home inspections" ON home_inspections;
DROP POLICY IF EXISTS "Users can update home inspections they created" ON home_inspections;

CREATE POLICY "Users can view inspections in their workspaces"
  ON home_inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_inspections.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert inspections in their workspaces"
  ON home_inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_inspections.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update inspections in their workspaces"
  ON home_inspections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_inspections.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = home_inspections.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view their own guide progress" ON guide_progress;
DROP POLICY IF EXISTS "Users can insert their own guide progress" ON guide_progress;
DROP POLICY IF EXISTS "Users can update their own guide progress" ON guide_progress;

CREATE POLICY "Users can view guide progress in their workspaces"
  ON guide_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = guide_progress.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert guide progress in their workspaces"
  ON guide_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = guide_progress.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update guide progress in their workspaces"
  ON guide_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = guide_progress.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = guide_progress.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view agent requests they created" ON agent_requests;
DROP POLICY IF EXISTS "Users can insert their own agent requests" ON agent_requests;
DROP POLICY IF EXISTS "Users can update agent requests they created" ON agent_requests;

CREATE POLICY "Users can view agent requests in their workspaces"
  ON agent_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_requests.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert agent requests in their workspaces"
  ON agent_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_requests.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can update agent requests in their workspaces"
  ON agent_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_requests.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_requests.workspace_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view evaluation photos for their homes" ON evaluation_photos;
DROP POLICY IF EXISTS "Users can insert evaluation photos for their homes" ON evaluation_photos;
DROP POLICY IF EXISTS "Users can delete evaluation photos for their homes" ON evaluation_photos;

CREATE POLICY "Users can view evaluation photos in their workspaces"
  ON evaluation_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_photos.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert evaluation photos in their workspaces"
  ON evaluation_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_photos.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can delete evaluation photos in their workspaces"
  ON evaluation_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_photos.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can view evaluation voice notes for their homes" ON evaluation_voice_notes;
DROP POLICY IF EXISTS "Users can insert evaluation voice notes for their homes" ON evaluation_voice_notes;
DROP POLICY IF EXISTS "Users can delete evaluation voice notes for their homes" ON evaluation_voice_notes;

CREATE POLICY "Users can view evaluation voice notes in their workspaces"
  ON evaluation_voice_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_voice_notes.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can insert evaluation voice notes in their workspaces"
  ON evaluation_voice_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_voice_notes.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Users can delete evaluation voice notes in their workspaces"
  ON evaluation_voice_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      JOIN workspace_members ON workspace_members.workspace_id = home_evaluations.workspace_id
      WHERE home_evaluations.id = evaluation_voice_notes.evaluation_id
      AND workspace_members.user_id = auth.jwt()->>'sub'
    )
  );