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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const targetUserId = req.query.userId || user.id;
    const targetEventId = req.query.eventId || req.body?.eventId;

    console.log('=== FLOCK EVENT DEBUG SESSION ===');
    console.log('Current user:', user.id);
    console.log('Target user ID:', targetUserId);
    console.log('Target event ID:', targetEventId);

    // 1. Get all flock_events for the target user
    const { data: allUserEvents, error: allEventsError } = await supabase
      .from('flock_events')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (allEventsError) {
      console.error('Error fetching user events:', allEventsError);
    }

    console.log('=== ALL EVENTS FOR USER ===');
    console.log(`Found ${allUserEvents?.length || 0} events for user ${targetUserId}`);
    
    if (allUserEvents && allUserEvents.length > 0) {
      allUserEvents.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event.id,
          type: event.type,
          date: event.date,
          description: event.description,
          created_at: event.created_at,
          updated_at: event.updated_at
        });
      });
    }

    // 2. If a specific event ID is provided, search for it specifically
    let specificEventResult = null;
    if (targetEventId) {
      const { data: specificEvents, error: specificError } = await supabase
        .from('flock_events')
        .select('*')
        .eq('id', targetEventId);

      console.log('=== SPECIFIC EVENT SEARCH ===');
      console.log('Searching for event ID:', targetEventId);
      console.log('Search result:', specificEvents);
      console.log('Search error:', specificError);

      specificEventResult = {
        searchedId: targetEventId,
        found: specificEvents && specificEvents.length > 0,
        events: specificEvents || [],
        error: specificError
      };

      // Also check if the event exists but belongs to a different user
      if (specificEvents && specificEvents.length > 0) {
        const event = specificEvents[0];
        console.log('Event found but checking ownership:');
        console.log('Event user_id:', event.user_id);
        console.log('Current user_id:', user.id);
        console.log('User IDs match:', event.user_id === user.id);
      }
    }

    // 3. Get user's flock profiles
    const { data: userProfiles, error: profilesError } = await supabase
      .from('flock_profiles')
      .select('*')
      .eq('user_id', targetUserId);

    console.log('=== USER FLOCK PROFILES ===');
    console.log(`Found ${userProfiles?.length || 0} profiles for user ${targetUserId}`);
    if (userProfiles && userProfiles.length > 0) {
      userProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          farm_name: profile.farm_name,
          created_at: profile.created_at
        });
      });
    }

    // 4. Summary analysis
    const analysis = {
      user: {
        id: user.id,
        requestedUserId: targetUserId,
        isOwnData: user.id === targetUserId
      },
      events: {
        total: allUserEvents?.length || 0,
        eventIds: allUserEvents?.map(e => e.id) || [],
        recentEvents: allUserEvents?.slice(0, 5).map(e => ({
          id: e.id,
          type: e.type,
          date: e.date,
          description: e.description
        })) || []
      },
      profiles: {
        total: userProfiles?.length || 0,
        profileIds: userProfiles?.map(p => p.id) || []
      },
      specificEventSearch: specificEventResult
    };

    console.log('=== ANALYSIS SUMMARY ===');
    console.log(JSON.stringify(analysis, null, 2));

    res.status(200).json({
      success: true,
      debugInfo: analysis,
      allEvents: allUserEvents || [],
      profiles: userProfiles || [],
      specificEventResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== DEBUG API ERROR ===');
    console.error('Error in debug API:', error);
    res.status(500).json({ 
      message: 'Error in debug API', 
      error: error.message,
      stack: error.stack 
    });
  }
}

export default handler;