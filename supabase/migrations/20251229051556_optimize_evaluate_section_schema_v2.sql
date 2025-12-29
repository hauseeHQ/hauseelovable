/*
  # Optimize Evaluate Section Database Schema

  ## Overview
  This migration enhances the evaluation system with better performance,
  security, and audit capabilities.

  ## 1. Performance Optimizations
  
  ### JSONB Indexes
  - Add GIN indexes on `home_evaluations.ratings` for fast rating queries
  - Add GIN indexes on `home_evaluations.item_notes` for note searches
  - Add GIN indexes on `home_evaluations.section_notes` for section searches
  - Add GIN indexes on `home_inspections.categories` for inspection queries
  
  ### Composite Indexes
  - Add composite indexes for common query patterns
  - Optimize filtering by status and workspace

  ## 2. Audit Fields
  
  Add tracking columns to all evaluation tables:
  - `created_by` - text ID of user who created the record
  - `last_modified_by` - text ID of user who last modified the record
  
  ## 3. Security Enhancements
  
  ### Replace Permissive RLS Policies
  Current policies use `USING (true)` which allows unrestricted access.
  
  New policies enforce:
  - Users can only access their own data
  - Users can access workspace data if they're workspace members
  - Proper authentication checks with auth.uid()
  
  ### Tables to Secure
  - homes
  - home_evaluations
  - home_inspections
  - evaluation_photos (via evaluation_id join)
  - evaluation_voice_notes (via evaluation_id join)

  ## 4. Helper Functions
  
  ### calculate_evaluation_completion
  Automatically calculates completion percentage based on rated items
  
  ### update_evaluation_timestamp
  Trigger function to update `updated_at` and `last_modified_by`

  ## 5. Data Integrity
  
  - Add check constraints for valid data ranges
  - Add triggers for automatic timestamp updates
*/

-- =============================================================================
-- PART 1: PERFORMANCE OPTIMIZATIONS
-- =============================================================================

-- Add GIN indexes for JSONB columns (enables fast queries on JSON data)
CREATE INDEX IF NOT EXISTS idx_home_evaluations_ratings_gin 
  ON home_evaluations USING GIN (ratings);

CREATE INDEX IF NOT EXISTS idx_home_evaluations_item_notes_gin 
  ON home_evaluations USING GIN (item_notes);

CREATE INDEX IF NOT EXISTS idx_home_evaluations_section_notes_gin 
  ON home_evaluations USING GIN (section_notes);

CREATE INDEX IF NOT EXISTS idx_home_inspections_categories_gin 
  ON home_inspections USING GIN (categories);

CREATE INDEX IF NOT EXISTS idx_home_inspections_progress_gin 
  ON home_inspections USING GIN (overall_progress);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_homes_workspace_user 
  ON homes(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_homes_status_workspace 
  ON homes(evaluation_status, workspace_id) 
  WHERE evaluation_status != 'not_started';

CREATE INDEX IF NOT EXISTS idx_evaluations_status_user 
  ON home_evaluations(evaluation_status, user_id);

-- Index for finding favorite homes quickly
CREATE INDEX IF NOT EXISTS idx_homes_favorite_workspace 
  ON homes(workspace_id, favorite) 
  WHERE favorite = true;

-- =============================================================================
-- PART 2: AUDIT FIELDS
-- =============================================================================

-- Add audit columns to homes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'homes' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE homes ADD COLUMN created_by text;
    ALTER TABLE homes ADD COLUMN last_modified_by text;
  END IF;
END $$;

-- Add audit columns to home_evaluations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'home_evaluations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE home_evaluations ADD COLUMN created_by text;
    ALTER TABLE home_evaluations ADD COLUMN last_modified_by text;
  END IF;
END $$;

-- Add audit columns to home_inspections table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'home_inspections' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE home_inspections ADD COLUMN created_by text;
    ALTER TABLE home_inspections ADD COLUMN last_modified_by text;
  END IF;
END $$;

-- =============================================================================
-- PART 3: HELPER FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF TG_OP = 'UPDATE' THEN
    NEW.last_modified_by = auth.uid()::text;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid()::text);
    NEW.last_modified_by = auth.uid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to all evaluation tables
DROP TRIGGER IF EXISTS update_homes_updated_at ON homes;
CREATE TRIGGER update_homes_updated_at
  BEFORE INSERT OR UPDATE ON homes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_home_evaluations_updated_at ON home_evaluations;
CREATE TRIGGER update_home_evaluations_updated_at
  BEFORE INSERT OR UPDATE ON home_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_home_inspections_updated_at ON home_inspections;
CREATE TRIGGER update_home_inspections_updated_at
  BEFORE INSERT OR UPDATE ON home_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate evaluation completion percentage
CREATE OR REPLACE FUNCTION calculate_evaluation_completion(ratings_json jsonb)
RETURNS integer AS $$
DECLARE
  total_items integer := 0;
  rated_items integer := 0;
  category_key text;
  item_key text;
  category_obj jsonb;
  item_value jsonb;
BEGIN
  -- Iterate through all categories in the ratings JSON
  FOR category_key, category_obj IN SELECT * FROM jsonb_each(ratings_json)
  LOOP
    -- Iterate through all items in each category
    FOR item_key, item_value IN SELECT * FROM jsonb_each(category_obj)
    LOOP
      total_items := total_items + 1;
      -- Check if item has a rating (not null and not empty string)
      IF item_value IS NOT NULL AND item_value::text != '""' AND item_value::text != 'null' THEN
        rated_items := rated_items + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Return percentage (avoid division by zero)
  IF total_items = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((rated_items::numeric / total_items::numeric) * 100);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate overall rating from individual ratings
CREATE OR REPLACE FUNCTION calculate_overall_rating(ratings_json jsonb)
RETURNS numeric AS $$
DECLARE
  total_rating numeric := 0;
  rating_count integer := 0;
  category_obj jsonb;
  item_value text;
  numeric_rating numeric;
BEGIN
  -- Iterate through all categories and items
  FOR category_obj IN SELECT jsonb_array_elements(jsonb_path_query_array(ratings_json, '$.*'))
  LOOP
    FOR item_value IN SELECT jsonb_array_elements_text(jsonb_path_query_array(category_obj, '$.*'))
    LOOP
      -- Try to convert rating to numeric (handles 1-5 ratings)
      BEGIN
        numeric_rating := item_value::numeric;
        IF numeric_rating >= 1 AND numeric_rating <= 5 THEN
          total_rating := total_rating + numeric_rating;
          rating_count := rating_count + 1;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Skip non-numeric ratings (good/fair/poor, yes/no, etc.)
          CONTINUE;
      END;
    END LOOP;
  END LOOP;
  
  -- Return average rating (avoid division by zero)
  IF rating_count = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((total_rating / rating_count), 1);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- PART 4: SECURITY ENHANCEMENTS - UPDATE RLS POLICIES
-- =============================================================================

-- Drop existing permissive policies for homes
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all users to view homes" ON homes;
  DROP POLICY IF EXISTS "Allow all users to insert homes" ON homes;
  DROP POLICY IF EXISTS "Allow all users to update homes" ON homes;
  DROP POLICY IF EXISTS "Allow all users to delete homes" ON homes;
END $$;

-- Create secure policies for homes table
CREATE POLICY "Users can view their own homes"
  ON homes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own homes"
  ON homes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own homes"
  ON homes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    user_id = auth.uid()::text OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own homes"
  ON homes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Drop existing permissive policies for home_evaluations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all users to view evaluations" ON home_evaluations;
  DROP POLICY IF EXISTS "Allow all users to insert evaluations" ON home_evaluations;
  DROP POLICY IF EXISTS "Allow all users to update evaluations" ON home_evaluations;
  DROP POLICY IF EXISTS "Allow all users to delete evaluations" ON home_evaluations;
END $$;

-- Create secure policies for home_evaluations table
CREATE POLICY "Users can view their own evaluations"
  ON home_evaluations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    home_id IN (
      SELECT id FROM homes 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can insert their own evaluations"
  ON home_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text AND
    home_id IN (
      SELECT id FROM homes 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update their own evaluations"
  ON home_evaluations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own evaluations"
  ON home_evaluations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Drop existing permissive policies for home_inspections
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all users to view inspections" ON home_inspections;
  DROP POLICY IF EXISTS "Allow all users to insert inspections" ON home_inspections;
  DROP POLICY IF EXISTS "Allow all users to update inspections" ON home_inspections;
  DROP POLICY IF EXISTS "Allow all users to delete inspections" ON home_inspections;
END $$;

-- Create secure policies for home_inspections table
CREATE POLICY "Users can view their own inspections"
  ON home_inspections FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    home_id IN (
      SELECT id FROM homes 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can insert their own inspections"
  ON home_inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text AND
    home_id IN (
      SELECT id FROM homes 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update their own inspections"
  ON home_inspections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own inspections"
  ON home_inspections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Secure evaluation_photos table (uses evaluation_id join)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all users to view evaluation photos" ON evaluation_photos;
  DROP POLICY IF EXISTS "Allow all users to insert evaluation photos" ON evaluation_photos;
  DROP POLICY IF EXISTS "Allow all users to update evaluation photos" ON evaluation_photos;
  DROP POLICY IF EXISTS "Allow all users to delete evaluation photos" ON evaluation_photos;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create secure policies for evaluation_photos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evaluation_photos') THEN
    CREATE POLICY "Users can view photos for their evaluations"
      ON evaluation_photos FOR SELECT
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can insert photos for their evaluations"
      ON evaluation_photos FOR INSERT
      TO authenticated
      WITH CHECK (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can update photos for their evaluations"
      ON evaluation_photos FOR UPDATE
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      )
      WITH CHECK (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can delete photos for their evaluations"
      ON evaluation_photos FOR DELETE
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );
  END IF;
END $$;

-- Secure evaluation_voice_notes table (uses evaluation_id join)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all users to view evaluation voice notes" ON evaluation_voice_notes;
  DROP POLICY IF EXISTS "Allow all users to insert evaluation voice notes" ON evaluation_voice_notes;
  DROP POLICY IF EXISTS "Allow all users to update evaluation voice notes" ON evaluation_voice_notes;
  DROP POLICY IF EXISTS "Allow all users to delete evaluation voice notes" ON evaluation_voice_notes;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create secure policies for evaluation_voice_notes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evaluation_voice_notes') THEN
    CREATE POLICY "Users can view voice notes for their evaluations"
      ON evaluation_voice_notes FOR SELECT
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can insert voice notes for their evaluations"
      ON evaluation_voice_notes FOR INSERT
      TO authenticated
      WITH CHECK (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can update voice notes for their evaluations"
      ON evaluation_voice_notes FOR UPDATE
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      )
      WITH CHECK (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );

    CREATE POLICY "Users can delete voice notes for their evaluations"
      ON evaluation_voice_notes FOR DELETE
      TO authenticated
      USING (
        evaluation_id IN (
          SELECT id FROM home_evaluations WHERE user_id = auth.uid()::text
        )
      );
  END IF;
END $$;

-- =============================================================================
-- PART 5: DATA INTEGRITY ENHANCEMENTS
-- =============================================================================

-- Add check constraint for valid price values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'homes' AND constraint_name = 'homes_price_positive'
  ) THEN
    ALTER TABLE homes ADD CONSTRAINT homes_price_positive 
      CHECK (price IS NULL OR price >= 0);
  END IF;
END $$;

-- Add check constraint for valid square footage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'homes' AND constraint_name = 'homes_square_footage_positive'
  ) THEN
    ALTER TABLE homes ADD CONSTRAINT homes_square_footage_positive 
      CHECK (square_footage IS NULL OR square_footage > 0);
  END IF;
END $$;

-- Add check constraint for valid bedrooms/bathrooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'homes' AND constraint_name = 'homes_bedrooms_valid'
  ) THEN
    ALTER TABLE homes ADD CONSTRAINT homes_bedrooms_valid 
      CHECK (bedrooms IS NULL OR bedrooms >= 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'homes' AND constraint_name = 'homes_bathrooms_valid'
  ) THEN
    ALTER TABLE homes ADD CONSTRAINT homes_bathrooms_valid 
      CHECK (bathrooms IS NULL OR bathrooms >= 0);
  END IF;
END $$;
