import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmohmazolvilxpxhfjie.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhpeGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNzUsImV4cCI6MjA2NDgwOTE3NX0.b-biGmoVFvMW9vF6YN2fomyh3kzEGdhQCZ69jdmH7G8';

console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
  urlFromEnv: process.env.SUPABASE_URL,
  fallbackUrl: supabaseUrl
});

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Use the profile_data JSONB column for the frontend
    const flockProfile =
      flockProfiles && flockProfiles.length > 0 && flockProfiles[0].profile_data
        ? flockProfiles[0].profile_data
        : null;

    // Upsert feed inventory instead of deleting all
    const { data: feedInventory, error: feedError } = await supabase
      .from('feed_inventory')
      .select('*');
    if (feedError) {
      console.error('Supabase feed_inventory error:', feedError);
      throw feedError;
    }

    // Upsert expenses instead of deleting all
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
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getData:', error);
    res.status(500).json({
      message: 'Error fetching data from database',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined    });
  }
}
