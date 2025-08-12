-- Fix existing batches that don't have expected_laying_start_date set
-- Run this in your Supabase SQL Editor to fix your August 2024 batch

-- Update adult hens to have expected laying date = acquisition date
UPDATE flock_batches 
SET expected_laying_start_date = acquisition_date
WHERE age_at_acquisition = 'adult' 
  AND type IN ('hens', 'mixed')
  AND expected_laying_start_date IS NULL
  AND is_active = true;

-- Update juvenile hens to have expected laying date = acquisition_date + 9 weeks  
UPDATE flock_batches 
SET expected_laying_start_date = (acquisition_date + INTERVAL '9 weeks')::date
WHERE age_at_acquisition = 'juvenile' 
  AND type IN ('hens', 'mixed')
  AND expected_laying_start_date IS NULL
  AND is_active = true;

-- Update chick hens to have expected laying date = acquisition_date + 19 weeks
UPDATE flock_batches 
SET expected_laying_start_date = (acquisition_date + INTERVAL '19 weeks')::date
WHERE age_at_acquisition = 'chick' 
  AND type IN ('hens', 'mixed')
  AND expected_laying_start_date IS NULL
  AND is_active = true;

-- Verify the updates
SELECT 
  batch_name,
  type,
  age_at_acquisition,
  acquisition_date,
  expected_laying_start_date,
  CASE 
    WHEN expected_laying_start_date <= CURRENT_DATE THEN 'Should be laying'
    ELSE 'Too young to lay'
  END as laying_status
FROM flock_batches 
WHERE is_active = true 
  AND type IN ('hens', 'mixed')
ORDER BY acquisition_date;