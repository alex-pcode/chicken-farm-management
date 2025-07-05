import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Handler called');
  
  const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Attempting to fetch egg entries...');
    
    // Fetch all egg entries, order by date descending
    const { data: eggEntries, error } = await supabase
      .from('egg_entries')
      .select('id, date, count')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Egg entries fetched successfully:', eggEntries?.length || 0, 'entries');
    
    // Fetch singleton flock profile
    const { data: flockProfiles, error: flockProfileError } = await supabase
      .from('flock_profiles')
      .select('*')
      .limit(1);

    if (flockProfileError) {
      console.error('Supabase flock_profiles error:', flockProfileError);
      throw flockProfileError;
    }

    // Get the first profile instead of looking for profile_data JSONB column
    const flockProfile = flockProfiles && flockProfiles.length > 0 ? flockProfiles[0] : null;

    // Fetch feed inventory
    const { data: feedInventory, error: feedError } = await supabase
      .from('feed_inventory')
      .select('*');
    if (feedError) {
      console.error('Supabase feed_inventory error:', feedError);
      throw feedError;
    }

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*');
    if (expensesError) {
      console.error('Supabase expenses error:', expensesError);
      throw expensesError;
    }

    const response = {
      message: 'Data fetched successfully',
      data: {
        eggEntries: eggEntries?.map(entry => ({
          id: entry.id,
          date: entry.date,
          count: entry.count
        })) || [],
        flockProfile,
        feedInventory: feedInventory || [],
        expenses: expenses || []
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning response with data:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getData:', error);
    res.status(500).json({
      message: 'Error fetching data from database',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
