/*
  # Create Guide Progress Table

  1. New Tables
    - `guide_progress`
      - `id` (uuid, primary key)
      - `user_id` (text) - individual user, NOT workspace_id
      - `lesson_id` (text) - lesson identifier
      - `module_id` (text) - module identifier
      - `completed` (boolean) - completion status
      - `notes` (text) - private user notes
      - `updated_at` (timestamptz)

  2. Important Notes
    - Uses user_id NOT workspace_id for individual tracking
    - Each user has their own progress separate from co-buyers
    - Notes are private to each user

  3. Security
    - Enable RLS on `guide_progress` table
    - Add policy for authenticated users to read their own progress
    - Add policy for authenticated users to insert their own progress
    - Add policy for authenticated users to update their own progress

  4. Indexes
    - Index on user_id for faster lookups
    - Index on lesson_id for filtering
    - Unique constraint on user_id + lesson_id combination
*/

CREATE TABLE IF NOT EXISTS guide_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  
  completed BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_guide_progress_user_id ON guide_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_progress_lesson_id ON guide_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_guide_progress_module_id ON guide_progress(module_id);

ALTER TABLE guide_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guide progress"
  ON guide_progress FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own guide progress"
  ON guide_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own guide progress"
  ON guide_progress FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own guide progress"
  ON guide_progress FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);