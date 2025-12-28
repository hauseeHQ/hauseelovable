/*
  # Create Guide Progress Table

  1. New Tables
    - `guide_progress` - stores video lesson progress

  2. Security
    - Enable RLS with policies for anonymous access
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

CREATE POLICY "Allow all users to view guide progress"
  ON guide_progress FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert guide progress"
  ON guide_progress FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update guide progress"
  ON guide_progress FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete guide progress"
  ON guide_progress FOR DELETE USING (true);
