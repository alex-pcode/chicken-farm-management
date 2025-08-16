import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Flock Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for profile/flock page
 * It returns only data needed for flock management:
 * - Flock profile information
 * - Flock events history
 * - Health summary statistics
 * - No eggs, expenses, sales, or feed data
 */

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest, supabase: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error ? null : user;
  } catch (err) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ message: 'Internal Server Error: Missing Supabase configuration.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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
    const user = await getAuthenticatedUser(req, supabase);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    console.log('Fetching flock data for user:', user.id);

    // 1. Fetch user's flock profile
    const { data: flockProfiles } = await supabase
      .from('flock_profiles')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    const flockProfile = flockProfiles && flockProfiles.length > 0 ? flockProfiles[0] : null;

    // 2. Fetch flock events if profile exists
    let flockEvents: any[] = [];
    if (flockProfile) {
      const { data: events } = await supabase
        .from('flock_events')
        .select('*')
        .eq('flock_profile_id', flockProfile.id)
        .order('date', { ascending: false }); // Most recent first
      
      flockEvents = events || [];
    }

    // 3. Map flock profile to expected frontend format
    let mappedFlockProfile: any = null;
    if (flockProfile) {
      mappedFlockProfile = {
        id: flockProfile.id,
        farmName: flockProfile.farm_name,
        location: flockProfile.location,
        flockSize: flockProfile.flock_size,
        breedTypes: flockProfile.breed ? flockProfile.breed.split(', ') : [],
        flockStartDate: flockProfile.start_date,
        notes: flockProfile.notes || '',
        // Use proper columns for bird counts
        hens: flockProfile.hens || 0,
        roosters: flockProfile.roosters || 0,
        chicks: flockProfile.chicks || 0,
        brooding: flockProfile.brooding || 0,
        events: flockEvents.map(event => ({
          id: event.id,
          date: event.date,
          type: event.type,
          description: event.description,
          affectedBirds: event.affected_birds,
          notes: event.notes
        })),
        createdAt: flockProfile.created_at,
        updatedAt: flockProfile.updated_at
      };
    }

    // 4. Calculate health summary
    const healthSummary = flockProfile ? {
      totalBirds: (flockProfile.hens || 0) + (flockProfile.roosters || 0) + (flockProfile.chicks || 0) + (flockProfile.brooding || 0),
      layingHens: Math.max(0, (flockProfile.hens || 0) - (flockProfile.brooding || 0)), // Brooding hens don't lay
      broodingHens: flockProfile.brooding || 0,
      recentEvents: flockEvents.slice(0, 5).map(event => ({ // Last 5 events
        id: event.id,
        date: event.date,
        type: event.type,
        description: event.description,
        affectedBirds: event.affected_birds
      }))
    } : {
      totalBirds: 0,
      layingHens: 0,
      broodingHens: 0,
      recentEvents: []
    };

    const flockData = {
      flockProfile: mappedFlockProfile,
      flockEvents: flockEvents.map(event => ({
        id: event.id,
        date: event.date,
        type: event.type,
        description: event.description,
        affectedBirds: event.affected_birds,
        notes: event.notes
      })),
      healthSummary
    };

    console.log(`Flock data fetched successfully: Profile ${flockProfile ? 'found' : 'not found'}, ${flockEvents.length} events`);
    
    res.status(200).json(flockData);
  } catch (error) {
    console.error('Error in flock-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}