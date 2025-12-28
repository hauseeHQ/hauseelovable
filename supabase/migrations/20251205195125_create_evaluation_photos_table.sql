/*
  # Create Evaluation Photos Table

  1. New Tables
    - `evaluation_photos`
      - `id` (uuid, primary key)
      - `evaluation_id` (uuid, foreign key to home_evaluations)
      - `section_id` (text) - which section this photo belongs to
      - `storage_path` (text) - path in Supabase storage
      - `thumbnail_path` (text) - path to thumbnail
      - `caption` (text) - optional photo caption
      - `file_size` (integer) - file size in bytes
      - `mime_type` (text) - image mime type
      - `width` (integer) - image width in pixels
      - `height` (integer) - image height in pixels
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS with policies for anonymous access
    - Photos deleted when evaluation is deleted (CASCADE)

  3. Indexes
    - Index on `evaluation_id` for fast lookups
    - Index on `section_id` for filtering by section
*/

CREATE TABLE IF NOT EXISTS evaluation_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES home_evaluations(id) ON DELETE CASCADE,
  section_id text NOT NULL,

  storage_path text NOT NULL,
  thumbnail_path text NOT NULL,

  caption text,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_photos_evaluation_id ON evaluation_photos(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_photos_section ON evaluation_photos(section_id);

ALTER TABLE evaluation_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view evaluation photos"
  ON evaluation_photos FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert evaluation photos"
  ON evaluation_photos FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update evaluation photos"
  ON evaluation_photos FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete evaluation photos"
  ON evaluation_photos FOR DELETE USING (true);
