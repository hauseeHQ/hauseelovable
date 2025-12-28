/*
  # Create Evaluation Voice Notes Table

  1. New Tables
    - `evaluation_voice_notes`
      - `id` (uuid, primary key)
      - `evaluation_id` (uuid, foreign key to home_evaluations)
      - `section_id` (text) - which section this voice note belongs to
      - `storage_path` (text) - path in Supabase storage
      - `duration` (integer) - duration in seconds
      - `file_size` (integer) - file size in bytes
      - `transcript` (text) - optional AI-generated transcript
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS with policies for anonymous access
    - Voice notes deleted when evaluation is deleted (CASCADE)

  3. Indexes
    - Index on `evaluation_id` for fast lookups
    - Index on `section_id` for filtering by section
*/

CREATE TABLE IF NOT EXISTS evaluation_voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES home_evaluations(id) ON DELETE CASCADE,
  section_id text NOT NULL,

  storage_path text NOT NULL,

  duration integer NOT NULL,
  file_size integer NOT NULL,
  transcript text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_voice_notes_evaluation_id ON evaluation_voice_notes(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_voice_notes_section ON evaluation_voice_notes(section_id);

ALTER TABLE evaluation_voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view evaluation voice notes"
  ON evaluation_voice_notes FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert evaluation voice notes"
  ON evaluation_voice_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update evaluation voice notes"
  ON evaluation_voice_notes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete evaluation voice notes"
  ON evaluation_voice_notes FOR DELETE USING (true);
