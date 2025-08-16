import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function handler(req: VercelRequest, res: VercelResponse) {
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

    const flockData = req.body;
    console.log('Received flock data:', flockData);
    
    // Check if user already has a profile
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('flock_profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (fetchError) {
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    // Prepare data for updated schema with proper columns
    const dbData = {
      user_id: user.id,
      farm_name: flockData.farmName || 'My Chicken Farm',
      location: flockData.location || '',
      flock_size: flockData.flockSize || (flockData.hens + flockData.roosters + flockData.chicks) || 0,
      breed: flockData.breedTypes?.join(', ') || '',
      start_date: flockData.flockStartDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      hens: flockData.hens || 0,
      roosters: flockData.roosters || 0,
      chicks: flockData.chicks || 0,
      brooding: flockData.brooding || 0,
      notes: flockData.notes || '',
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile
      const { data, error } = await supabase
        .from('flock_profiles')
        .update(dbData)
        .eq('id', existingProfiles[0].id)
        .eq('user_id', user.id) // Extra security check
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('flock_profiles')
        .insert({
          ...dbData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }
    
    console.log('Flock profile saved to Supabase:', result);
    
    res.status(200).json({ 
      message: 'Flock profile saved successfully', 
      data: { flockProfile: result },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving flock profile:', error);
    res.status(500).json({ 
      message: 'Error saving flock profile', 
      error: error.message,    stack: error.stack 
    });
  }
}

export default handler;
