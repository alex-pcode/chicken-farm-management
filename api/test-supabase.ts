
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Fetch a small amount of data from a table to test the connection
    const { data, error } = await supabase
      .from('flock_profiles')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      message: 'Supabase connection successful!',
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Supabase connection failed.',
      error: error.message,
    });
  }
}
