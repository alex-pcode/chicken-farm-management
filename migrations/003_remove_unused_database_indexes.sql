-- Migration: Remove Unused Database Indexes
-- Date: 2025-08-16
-- Purpose: Remove 4 unused indexes consuming storage and slowing write operations
-- Total storage reclaimed: ~64 kB (4 indexes × 16 kB each)

-- Background: These indexes have 0 scans in pg_stat_user_indexes, indicating they are unused.
-- For small tables (2-3 rows each), PostgreSQL uses sequential scans which are more efficient
-- than index scans. Removing these indexes will improve write performance without affecting
-- query performance.

-- Remove unused single-column user_id index (covered by composite idx_expenses_date_user)
DROP INDEX IF EXISTS idx_expenses_user_id;

-- Remove unused flock_events indexes (queries use flock_profile_id, not user_id)  
DROP INDEX IF EXISTS idx_flock_events_user_id;
DROP INDEX IF EXISTS idx_flock_events_date_user;

-- Remove unused flock_profiles user_id index (table too small, seq scans more efficient)
DROP INDEX IF EXISTS idx_flock_profiles_user_id;

-- Verify remaining indexes are sufficient for current query patterns:
-- - idx_expenses_date_user (composite) handles all expense user queries efficiently
-- - flock_events queries primarily use flock_profile_id (no index needed for small tables)
-- - flock_profiles queries will use sequential scans (more efficient for 2-row table)

-- Storage optimization:
-- Before: 16 total custom indexes consuming ~256 kB
-- After: 12 custom indexes consuming ~192 kB  
-- Reclaimed: 64 kB storage space + reduced write operation overhead