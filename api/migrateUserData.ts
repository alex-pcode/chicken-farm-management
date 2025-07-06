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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    console.log('Migrating data for user:', user.id, user.email);

    // Update all tables to assign orphaned data to current user
    const results: Array<{ table: string; updated: number }> = [];

    // 1. Update egg_entries without user_id
    const { data: eggData, error: eggError } = await supabase
      .from('egg_entries')
      .update({ user_id: user.id })
      .is('user_id', null)
      .select();

    if (eggError) {
      console.error('Error updating egg_entries:', eggError);
    } else {
      results.push({ table: 'egg_entries', updated: eggData?.length || 0 });
    }

    // 2. Update expenses without user_id
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .update({ user_id: user.id })
      .is('user_id', null)
      .select();

    if (expenseError) {
      console.error('Error updating expenses:', expenseError);
    } else {
      results.push({ table: 'expenses', updated: expenseData?.length || 0 });
    }

    // 3. Update flock_profiles without user_id
    const { data: flockData, error: flockError } = await supabase
      .from('flock_profiles')
      .update({ user_id: user.id })
      .is('user_id', null)
      .select();

    if (flockError) {
      console.error('Error updating flock_profiles:', flockError);
    } else {
      results.push({ table: 'flock_profiles', updated: flockData?.length || 0 });
    }

    // 4. Update feed_inventory without user_id
    const { data: feedData, error: feedError } = await supabase
      .from('feed_inventory')
      .update({ user_id: user.id })
      .is('user_id', null)
      .select();

    if (feedError) {
      console.error('Error updating feed_inventory:', feedError);
    } else {
      results.push({ table: 'feed_inventory', updated: feedData?.length || 0 });
    }

    // 5. Update flock_events without user_id
    const { data: eventData, error: eventError } = await supabase
      .from('flock_events')
      .update({ user_id: user.id })
      .is('user_id', null)
      .select();

    if (eventError) {
      console.error('Error updating flock_events:', eventError);
    } else {
      results.push({ table: 'flock_events', updated: eventData?.length || 0 });
    }

    console.log('Migration results:', results);

    res.status(200).json({
      message: 'Data migration completed successfully',
      user: {
        id: user.id,
        email: user.email
      },
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({
      message: 'Error during data migration',
      error: error.message,
      stack: error.stack
    });
  }
}
