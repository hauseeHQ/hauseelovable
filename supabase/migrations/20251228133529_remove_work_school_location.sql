/*
  # Remove work_school_location column from dream_home_preferences

  1. Changes
    - Clear all existing work_school_location data before dropping column
    - Drop work_school_location column from dream_home_preferences table
    - max_commute column remains intact as a standalone preference
  
  2. Rationale
    - Work/school location data is no longer needed
    - Removes location tracking while preserving commute time preference
    - Max commute time serves as general lifestyle preference without specific location
  
  3. Data Safety
    - Clear data first before dropping column to ensure clean removal
    - No destructive operations on other columns
    - Max commute preferences remain unchanged
*/

-- Clear all work_school_location data
UPDATE dream_home_preferences
SET work_school_location = NULL
WHERE work_school_location IS NOT NULL;

-- Drop the work_school_location column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'work_school_location'
  ) THEN
    ALTER TABLE dream_home_preferences
    DROP COLUMN work_school_location;
  END IF;
END $$;