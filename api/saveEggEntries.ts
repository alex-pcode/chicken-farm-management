import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmohmazolvilxpxhfjie.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhweGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNzUsImV4cCI6MjA2NDgwOTE3NX0.b-biGmoVFvMW9vF6YN2fomyh3kzEGdhQCZ69jdmH7G8';

console.log('SaveEggEntries - Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
  urlFromEnv: process.env.SUPABASE_URL,
  fallbackUrl: supabaseUrl
});

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }  try {
    const entries = req.body;
    console.log('Received egg entries:', entries);
    
    // Upsert egg entries by id (or insert if no id exists)
    const { data, error } = await supabase
      .from('egg_entries')
      .upsert(
        entries.map((entry: any) => ({
          id: entry.id, // Include the id for upsert
          date: entry.date,
          count: entry.count
        })),
        { onConflict: 'id' }
      )
      .select();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }
    
    console.log('Egg entries saved to Supabase:', data);
    
    res.status(200).json({ 
      message: 'Egg entries saved successfully', 
      data: { eggEntries: data },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving egg entries:', error);
    res.status(500).json({ 
      message: 'Error saving egg entries', 
      error: error.message,
      stack: error.stack    });
  }
}
