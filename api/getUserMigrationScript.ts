import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    // Generate migration SQL script
    const migrationSQL = `
-- Migration script to assign orphaned data to user: ${user.email}
-- User ID: ${user.id}
-- Run this in your Supabase SQL Editor

-- Update egg_entries
UPDATE egg_entries 
SET user_id = '${user.id}' 
WHERE user_id IS NULL;

-- Update expenses
UPDATE expenses 
SET user_id = '${user.id}' 
WHERE user_id IS NULL;

-- Update flock_profiles
UPDATE flock_profiles 
SET user_id = '${user.id}' 
WHERE user_id IS NULL;

-- Update feed_inventory
UPDATE feed_inventory 
SET user_id = '${user.id}' 
WHERE user_id IS NULL;

-- Update flock_events
UPDATE flock_events 
SET user_id = '${user.id}' 
WHERE user_id IS NULL;

-- Check the results
SELECT 'egg_entries' as table_name, COUNT(*) as count FROM egg_entries WHERE user_id = '${user.id}'
UNION ALL
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses WHERE user_id = '${user.id}'
UNION ALL
SELECT 'flock_profiles' as table_name, COUNT(*) as count FROM flock_profiles WHERE user_id = '${user.id}'
UNION ALL
SELECT 'feed_inventory' as table_name, COUNT(*) as count FROM feed_inventory WHERE user_id = '${user.id}'
UNION ALL
SELECT 'flock_events' as table_name, COUNT(*) as count FROM flock_events WHERE user_id = '${user.id}';
    `.trim();

    res.status(200).json({
      message: 'Migration SQL script generated',
      user: {
        id: user.id,
        email: user.email
      },
      migrationSQL,
      instructions: [
        '1. Copy the SQL script below',
        '2. Go to your Supabase Dashboard -> SQL Editor',
        '3. Paste and run the script',
        '4. Refresh your chicken app to see your data'
      ]
    });

  } catch (error) {
    console.error('Error generating migration script:', error);
    res.status(500).json({
      message: 'Error generating migration script',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
