import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: VercelRequest, res: VercelResponse) {
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
    const flockData = req.body;
    console.log('Received flock data:', flockData);
    
    // Check if a profile already exists
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('flock_profiles')
      .select('id')
      .limit(1);

    if (fetchError) {
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    // Prepare data for updated schema with proper columns
    const dbData = {
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
