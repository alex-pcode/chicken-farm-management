import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

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
  }  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const entries = req.body;
    console.log('Received egg entries:', entries);
    
    // Use upsert with date as the conflict resolution key
    // The database has a unique constraint on 'date' field
    const { data, error } = await supabase
      .from('egg_entries')
      .upsert(
        entries.map((entry: any) => ({
          date: entry.date,
          count: entry.count,
          user_id: user.id
        })),
        { 
          onConflict: 'date',
          ignoreDuplicates: false 
        }
      )
      .select();

    if (error) {
      throw new Error(`Database upsert error: ${error.message}`);
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
