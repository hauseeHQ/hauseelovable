/*
  # Add User Overall Rating to Home Evaluations

  ## Summary
  Adds a field for users to provide their own subjective overall rating of a home,
  separate from the auto-calculated rating based on individual item ratings.

  ## Changes Made

  ### 1. Schema Changes
  **home_evaluations table:**
  - Add `user_overall_rating` column (INTEGER, nullable)
  - Values from 1-5 (5-star rating scale)
  - NULL means user hasn't provided an overall rating yet

  ### 2. Update Sync Function
  **sync_home_evaluation_status():**
  - Prefer user_overall_rating over calculated overall_rating when syncing to homes table
  - Falls back to calculated rating if user hasn't provided one

  ## Notes
  - `overall_rating` continues to be auto-calculated from individual ratings
  - `user_overall_rating` is the user's subjective assessment of the entire home
  - When both exist, user_overall_rating takes precedence in homes table

  ## Backwards Compatibility
  - Column is nullable, so existing records are unaffected
  - Existing functionality continues to work as before
*/

-- ============================================================================
-- 1. ADD USER OVERALL RATING COLUMN
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_evaluations'
    AND column_name = 'user_overall_rating'
  ) THEN
    ALTER TABLE home_evaluations
      ADD COLUMN user_overall_rating INTEGER CHECK (
        user_overall_rating IS NULL OR
        (user_overall_rating >= 1 AND user_overall_rating <= 5)
      );

    COMMENT ON COLUMN home_evaluations.user_overall_rating IS
      'User subjective overall rating of the home (1-5 stars). NULL if not provided.';
  END IF;
END $$;

-- ============================================================================
-- 2. UPDATE SYNC FUNCTION TO USE USER RATING
-- ============================================================================

-- Update function to prefer user_overall_rating when syncing to homes table
CREATE OR REPLACE FUNCTION sync_home_evaluation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the homes table with evaluation data
  -- Prefer user_overall_rating if provided, otherwise use calculated overall_rating
  UPDATE homes
  SET
    evaluation_status = NEW.evaluation_status,
    overall_rating = COALESCE(NEW.user_overall_rating, NEW.overall_rating),
    updated_at = NOW()
  WHERE id = NEW.home_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to include user_overall_rating in watch list
DROP TRIGGER IF EXISTS trigger_sync_home_evaluation_status ON home_evaluations;

CREATE TRIGGER trigger_sync_home_evaluation_status
  AFTER INSERT OR UPDATE OF evaluation_status, overall_rating, user_overall_rating
  ON home_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION sync_home_evaluation_status();