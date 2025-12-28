/*
  # Create Homes Table

  1. New Tables
    - `homes` - stores home listings for evaluation

  2. Security
    - Enable RLS with policies for anonymous access
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

CREATE POLICY "Allow all users to view homes"
  ON homes FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert homes"
  ON homes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update homes"
  ON homes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all users to delete homes"
  ON homes FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_homes_user_id ON homes(user_id);
CREATE INDEX IF NOT EXISTS idx_homes_workspace_id ON homes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_homes_favorite ON homes(favorite);
CREATE INDEX IF NOT EXISTS idx_homes_compare_selected ON homes(compare_selected);
