# Batch Management Setup Guide

## 🔧 Database Setup Required

The batch management system requires new database tables. You need to run the migration SQL in your Supabase database.

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Copy the contents of `migrations/002_create_batch_management_tables.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the migration

### Step 2: Verify Tables Created

After running the migration, you should see these new tables in your database:
- `flock_batches` - Stores batch information
- `death_records` - Tracks chicken losses
- `batch_events` - Records batch-specific events

### Step 3: Check API Endpoints

The following API endpoints will be available:
- `/api/flockBatches` - Manage flock batches
- `/api/deathRecords` - Log chicken deaths/losses  
- `/api/flockSummary` - Get flock overview and statistics

### Step 4: Access the Feature

Once the database is set up:
1. Refresh your application
2. You'll see a new **"📦 Flock Batches"** tab in the navigation
3. The Profile tab will show batch management data (no more 500 error)
4. The Production tab will show enhanced analysis based on your actual flock size

## 🚀 Features Available

✅ **Batch Management**: Add chickens in groups with breed, acquisition date, and source  
✅ **Death Logging**: Track losses with automatic count updates  
✅ **Production Analysis**: Compare egg production to actual flock size  
✅ **Mortality Tracking**: Monitor loss rates and causes  
✅ **Enhanced Analytics**: Better insights into flock performance  

## 🐞 Troubleshooting

**If you still see 500 errors:**
1. Check that the migration ran successfully (no SQL errors)
2. Verify the tables exist in your Supabase dashboard
3. Check browser console for specific error messages
4. Ensure your Supabase environment variables are correct

**If the UI doesn't show:**
1. Refresh the page after running the migration
2. Check the browser console for any JavaScript errors
3. Clear browser cache if needed

## 📱 Using the System

**Add Your First Batch:**
1. Go to "📦 Flock Batches" tab
2. Click "Add Batch" tab
3. Fill in batch details (name, breed, count, etc.)
4. Submit to create your first batch

**Log Deaths/Losses:**
1. Go to "💀 Losses" tab in Flock Batches
2. Select the affected batch
3. Enter count and cause
4. Batch counts update automatically

**View Analytics:**
- Check the Overview tab for flock statistics
- Production tab shows eggs per hen based on actual counts
- Profile tab shows batch summary integration