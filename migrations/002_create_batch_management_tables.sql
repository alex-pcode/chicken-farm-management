-- Migration 002: Create Batch Management Tables
-- Run this in Supabase SQL Editor after 001_create_crm_tables.sql

-- Create flock_batches table for group-based chicken management
CREATE TABLE IF NOT EXISTS flock_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL,
  acquisition_date DATE NOT NULL,
  initial_count INTEGER NOT NULL CHECK (initial_count > 0),
  current_count INTEGER NOT NULL CHECK (current_count >= 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('hens', 'roosters', 'chicks', 'mixed')),
  age_at_acquisition VARCHAR(50) NOT NULL CHECK (age_at_acquisition IN ('chick', 'juvenile', 'adult')),
  expected_laying_start_date DATE,
  actual_laying_start_date DATE,
  source VARCHAR(255) NOT NULL, -- hatchery, farm, store, etc.
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create death_records table for tracking mortality
CREATE TABLE IF NOT EXISTS death_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES flock_batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  cause VARCHAR(50) NOT NULL CHECK (cause IN ('predator', 'disease', 'age', 'injury', 'unknown', 'culled', 'other')),
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batch_events table for batch-specific events
CREATE TABLE IF NOT EXISTS batch_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES flock_batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('health_check', 'vaccination', 'relocation', 'breeding', 'laying_start', 'production_note', 'other')),
  description TEXT NOT NULL,
  affected_count INTEGER CHECK (affected_count > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flock_batches_user_id ON flock_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_flock_batches_acquisition_date ON flock_batches(acquisition_date DESC);
CREATE INDEX IF NOT EXISTS idx_flock_batches_type ON flock_batches(type);
CREATE INDEX IF NOT EXISTS idx_flock_batches_active ON flock_batches(is_active, user_id);

CREATE INDEX IF NOT EXISTS idx_death_records_user_id ON death_records(user_id);
CREATE INDEX IF NOT EXISTS idx_death_records_batch_id ON death_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_death_records_date ON death_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_death_records_cause ON death_records(cause);

CREATE INDEX IF NOT EXISTS idx_batch_events_user_id ON batch_events(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_events_batch_id ON batch_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_events_date ON batch_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_batch_events_type ON batch_events(type);

-- Enable Row Level Security (RLS)
ALTER TABLE flock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can only access their own flock batches" ON flock_batches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own death records" ON death_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own batch events" ON batch_events
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger to update current_count when deaths are recorded
CREATE OR REPLACE FUNCTION update_batch_count_on_death()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the current count of the batch when a death is recorded
  UPDATE flock_batches 
  SET current_count = current_count - NEW.count,
      updated_at = NOW()
  WHERE id = NEW.batch_id;
  
  -- Ensure current_count doesn't go below 0
  UPDATE flock_batches 
  SET current_count = 0
  WHERE id = NEW.batch_id AND current_count < 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_batch_count_on_death
  AFTER INSERT ON death_records
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_count_on_death();

-- Create trigger to revert batch count when death record is deleted
CREATE OR REPLACE FUNCTION revert_batch_count_on_death_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Add back the count when a death record is deleted
  UPDATE flock_batches 
  SET current_count = current_count + OLD.count,
      updated_at = NOW()
  WHERE id = OLD.batch_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_revert_batch_count_on_death_delete
  AFTER DELETE ON death_records
  FOR EACH ROW
  EXECUTE FUNCTION revert_batch_count_on_death_delete();

-- Create function to get flock summary for a user
CREATE OR REPLACE FUNCTION get_flock_summary(user_uuid UUID)
RETURNS TABLE(
  total_birds BIGINT,
  total_hens BIGINT,
  total_roosters BIGINT,
  total_chicks BIGINT,
  active_batches BIGINT,
  expected_layers BIGINT,
  total_deaths BIGINT,
  mortality_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH batch_summary AS (
    SELECT 
      SUM(current_count) as total_birds,
      SUM(CASE WHEN type = 'hens' THEN current_count ELSE 0 END) as total_hens,
      SUM(CASE WHEN type = 'roosters' THEN current_count ELSE 0 END) as total_roosters,
      SUM(CASE WHEN type = 'chicks' THEN current_count ELSE 0 END) as total_chicks,
      COUNT(*) as active_batches,
      SUM(CASE 
        WHEN type = 'hens' AND (actual_laying_start_date IS NOT NULL OR (expected_laying_start_date IS NOT NULL AND expected_laying_start_date <= CURRENT_DATE))
        THEN current_count 
        ELSE 0 
      END) as expected_layers,
      SUM(initial_count) as total_initial
    FROM flock_batches 
    WHERE user_id = user_uuid AND is_active = true
  ),
  death_summary AS (
    SELECT 
      COALESCE(SUM(dr.count), 0) as total_deaths
    FROM death_records dr
    JOIN flock_batches fb ON dr.batch_id = fb.id
    WHERE fb.user_id = user_uuid AND fb.is_active = true
  )
  SELECT 
    COALESCE(bs.total_birds, 0) as total_birds,
    COALESCE(bs.total_hens, 0) as total_hens,
    COALESCE(bs.total_roosters, 0) as total_roosters,
    COALESCE(bs.total_chicks, 0) as total_chicks,
    COALESCE(bs.active_batches, 0) as active_batches,
    COALESCE(bs.expected_layers, 0) as expected_layers,
    COALESCE(ds.total_deaths, 0) as total_deaths,
    CASE 
      WHEN COALESCE(bs.total_initial, 0) > 0 
      THEN ROUND((COALESCE(ds.total_deaths, 0)::NUMERIC / bs.total_initial::NUMERIC) * 100, 2)
      ELSE 0 
    END as mortality_rate
  FROM batch_summary bs
  CROSS JOIN death_summary ds;
END;
$$ LANGUAGE plpgsql;