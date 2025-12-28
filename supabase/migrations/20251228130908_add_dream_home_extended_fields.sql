/*
  # Add Extended Fields to Dream Home Preferences

  1. Overview
    - Adds new fields for property types, priority system, and lifestyle preferences
    - Supports dual-view architecture with completion tracking
    - Enables advanced filtering and AI recommendations

  2. New Columns
    - `property_types` (text array) - Selected home types (condo, townhouse, semi, detached)
    - `parking_priority` (text) - must-have, nice-to-have, not-needed
    - `outdoor_space_priority` (text) - must-have, nice-to-have, not-needed
    - `basement_priority` (text) - must-have, nice-to-have, not-needed
    - `work_school_location` (text) - Address for commute calculations
    - `max_commute` (text) - 15, 30, 45, 60, not-a-factor
    - `school_proximity_importance` (text) - high, medium, low
    - `walkability_importance` (text) - high, medium, low
    - `neighborhood_vibe` (text) - quiet, lively, no-preference
    - `is_complete` (boolean) - Tracks if user completed initial form
    - `completed_at` (timestamptz) - Timestamp of first completion

  3. Changes
    - Adds columns with proper constraints and defaults
    - Maintains backward compatibility with existing data
    - No RLS policy changes needed (uses existing policies)
*/

DO $$
BEGIN
  -- Add property_types array field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'property_types'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN property_types text[] DEFAULT '{}';
  END IF;

  -- Add priority system fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'parking_priority'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN parking_priority text CHECK (parking_priority IN ('must-have', 'nice-to-have', 'not-needed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'outdoor_space_priority'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN outdoor_space_priority text CHECK (outdoor_space_priority IN ('must-have', 'nice-to-have', 'not-needed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'basement_priority'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN basement_priority text CHECK (basement_priority IN ('must-have', 'nice-to-have', 'not-needed'));
  END IF;

  -- Add lifestyle preference fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'work_school_location'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN work_school_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'max_commute'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN max_commute text CHECK (max_commute IN ('15', '30', '45', '60', 'not-a-factor'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'school_proximity_importance'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN school_proximity_importance text CHECK (school_proximity_importance IN ('high', 'medium', 'low'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'walkability_importance'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN walkability_importance text CHECK (walkability_importance IN ('high', 'medium', 'low'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'neighborhood_vibe'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN neighborhood_vibe text CHECK (neighborhood_vibe IN ('quiet', 'lively', 'no-preference'));
  END IF;

  -- Add completion tracking fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'is_complete'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN is_complete boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_home_preferences' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE dream_home_preferences
    ADD COLUMN completed_at timestamptz;
  END IF;
END $$;
