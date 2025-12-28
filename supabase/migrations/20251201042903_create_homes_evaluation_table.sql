/*
  # Create Homes Evaluation Table

  1. New Tables
    - `homes`
      - `id` (uuid, primary key)
      - `user_id` (text) - owner of the home record
      - `workspace_id` (text) - for co-buyer collaboration
      - `address` (text) - street address
      - `neighborhood` (text) - neighborhood/city
      - `price` (numeric) - listing price
      - `bedrooms` (integer) - number of bedrooms
      - `bathrooms` (numeric) - number of bathrooms
      - `year_built` (integer, optional) - construction year
      - `property_taxes` (numeric, optional) - annual property taxes
      - `square_footage` (integer, optional) - total square feet
      - `favorite` (boolean) - favorite toggle
      - `compare_selected` (boolean) - selected for comparison
      - `evaluation_status` (text) - not_started, in_progress, completed
      - `offer_intent` (text, optional) - yes, maybe, no
      - `overall_rating` (numeric) - rating out of 5
      - `primary_photo` (text, optional) - photo URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `homes` table
    - Add policy for users to view their own homes
    - Add policy for users to insert their own homes
    - Add policy for users to update their own homes
    - Add policy for users to delete their own homes
    - Add policy for workspace members to view shared homes

  3. Indexes
    - Index on `user_id` for fast user lookups
    - Index on `workspace_id` for collaboration features
    - Index on `favorite` for filtering
    - Index on `compare_selected` for comparison view
*/

CREATE TABLE IF NOT EXISTS homes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  address text NOT NULL,
  neighborhood text NOT NULL,
  price numeric NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms numeric NOT NULL,
  year_built integer,
  property_taxes numeric,
  square_footage integer,
  favorite boolean DEFAULT false,
  compare_selected boolean DEFAULT false,
  evaluation_status text DEFAULT 'not_started' CHECK (evaluation_status IN ('not_started', 'in_progress', 'completed')),
  offer_intent text CHECK (offer_intent IN ('yes', 'maybe', 'no')),
  overall_rating numeric DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 5),
  primary_photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own homes"
  ON homes FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view workspace homes"
  ON homes FOR SELECT
  TO authenticated
  USING (workspace_id IN (
    SELECT workspace_id FROM homes WHERE user_id = auth.uid()::text
  ));

CREATE POLICY "Users can insert own homes"
  ON homes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own homes"
  ON homes FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own homes"
  ON homes FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_homes_user_id ON homes(user_id);
CREATE INDEX IF NOT EXISTS idx_homes_workspace_id ON homes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_homes_favorite ON homes(favorite);
CREATE INDEX IF NOT EXISTS idx_homes_compare_selected ON homes(compare_selected);
