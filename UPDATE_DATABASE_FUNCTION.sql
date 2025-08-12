-- Update the database function to work with manual laying start dates
-- Run this in your Supabase SQL Editor to update the flock summary function

-- Drop and recreate the function with updated logic
DROP FUNCTION IF EXISTS get_flock_summary(UUID);

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
      -- Updated logic: only count hens/mixed batches that have actual_laying_start_date set
      SUM(CASE 
        WHEN type IN ('hens', 'mixed') AND actual_laying_start_date IS NOT NULL
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