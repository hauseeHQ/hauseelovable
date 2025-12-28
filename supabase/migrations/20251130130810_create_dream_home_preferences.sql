/*
  # Create Dream Home Preferences Table

  1. New Tables
    - `dream_home_preferences`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `user_id` (text, not null) - Clerk user ID for the owner
      - `construction_status` (text) - 'new' or 'ready'
      - `price_min` (integer) - Minimum price in dollars
      - `price_max` (integer) - Maximum price in dollars
      - `preferred_cities` (text array) - List of preferred Ontario cities
      - `bedrooms` (text) - Number of bedrooms (1, 2, 3, 4, 5+)
      - `bathrooms` (text) - Number of bathrooms (1, 1.5, 2, 2.5, 3, 3.5, 4+)
      - `max_condo_fees` (integer) - Maximum acceptable condo/POTL fees
      - `backyard` (text) - Preference: 'small', 'large', or 'indifferent'
      - `timeline` (text) - Timeline to buy (0-6 months, 6-12 months, etc.)
      - `notes` (text) - Additional notes (max 500 characters)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `dream_home_preferences` table
    - Add policy for users to read their own preferences
    - Add policy for users to insert their own preferences
    - Add policy for users to update their own preferences
    - Add policy for users to delete their own preferences

  3. Indexes
    - Create index on `user_id` for fast user-specific queries

  4. Important Notes
    - Each user should have only one dream home preference record
    - The `user_id` must match the authenticated Clerk user ID
    - All fields except user_id are optional to allow partial saves
    - Data is auto-saved as users fill out the form
*/

-- Create the dream_home_preferences table
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

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_dream_home_preferences_user_id 
  ON dream_home_preferences(user_id);

-- Create unique constraint to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_dream_home_preferences_user_id_unique
  ON dream_home_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE dream_home_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own preferences
CREATE POLICY "Users can read own dream home preferences"
  ON dream_home_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt()->>'sub');

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own dream home preferences"
  ON dream_home_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt()->>'sub');

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own dream home preferences"
  ON dream_home_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt()->>'sub')
  WITH CHECK (user_id = auth.jwt()->>'sub');

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own dream home preferences"
  ON dream_home_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.jwt()->>'sub');