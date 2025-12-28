/*
  # Create Dream Home Preferences Table

  1. New Tables
    - `dream_home_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, not null)
      - `construction_status` (text) - 'new' or 'ready'
      - `price_min` (integer)
      - `price_max` (integer)
      - `preferred_cities` (text array)
      - `bedrooms` (text)
      - `bathrooms` (text)
      - `max_condo_fees` (integer)
      - `backyard` (text) - 'small', 'large', or 'indifferent'
      - `timeline` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for anonymous access (for testing)

  3. Indexes
    - Index on user_id
    - Unique constraint on user_id
*/

CREATE TABLE IF NOT EXISTS dream_home_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  construction_status text CHECK (construction_status IN ('new', 'ready')),
  price_min integer DEFAULT 200000,
  price_max integer DEFAULT 2000000,
  preferred_cities text[] DEFAULT '{}',
  bedrooms text,
  bathrooms text,
  max_condo_fees integer,
  backyard text CHECK (backyard IN ('small', 'large', 'indifferent')),
  timeline text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dream_home_preferences_user_id 
  ON dream_home_preferences(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dream_home_preferences_user_id_unique
  ON dream_home_preferences(user_id);

ALTER TABLE dream_home_preferences ENABLE ROW LEVEL SECURITY;

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
