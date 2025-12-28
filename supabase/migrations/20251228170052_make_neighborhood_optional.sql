/*
  # Make Neighborhood Field Optional
  
  1. Changes
    - Alter `homes` table to make `neighborhood` field nullable
    - This allows users to add homes without specifying a neighborhood
  
  2. Reason
    - Improves user experience by not requiring neighborhood information
    - Some listings may not have clear neighborhood designations
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homes' AND column_name = 'neighborhood' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE homes ALTER COLUMN neighborhood DROP NOT NULL;
  END IF;
END $$;
