-- Add active column to models and garments tables for soft delete functionality
-- This allows users to "undo" deletions and recover items

-- Add active column to models table
ALTER TABLE models
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add active column to garments table
ALTER TABLE garments
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Set existing records to active
UPDATE models SET active = true WHERE active IS NULL;
UPDATE garments SET active = true WHERE active IS NULL;

-- Create indexes for better performance when filtering by active status
CREATE INDEX IF NOT EXISTS idx_models_active ON models(active);
CREATE INDEX IF NOT EXISTS idx_garments_active ON garments(active);

-- Create indexes for user_id + active for better query performance
CREATE INDEX IF NOT EXISTS idx_models_user_active ON models(user_id, active);
CREATE INDEX IF NOT EXISTS idx_garments_user_active ON garments(user_id, active);