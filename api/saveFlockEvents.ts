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

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const { flockProfileId, event, eventId } = req.body;
    console.log('Received event data:', { flockProfileId, event, eventId });

    if (!flockProfileId || !event) {
      return res.status(400).json({ message: 'Missing required fields: flockProfileId and event' });
    }

    // Verify the flock profile belongs to the user
    const { data: flockProfile, error: profileError } = await supabase
      .from('flock_profiles')
      .select('id')
      .eq('id', flockProfileId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !flockProfile) {
      return res.status(403).json({ message: 'Access denied - Flock profile not found or not owned by user' });
    }

    // Prepare event data for database
    const eventData = {
      flock_profile_id: flockProfileId,
      user_id: user.id,
      date: event.date,
      type: event.type,
      description: event.description,
      affected_birds: event.affectedBirds || null,
      notes: event.notes || null,
      updated_at: new Date().toISOString()
    };

    let data, error;

    if (req.method === 'PUT' && eventId) {
      // Update existing event
      const result = await supabase
        .from('flock_events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new event
      const result = await supabase
        .from('flock_events')
        .insert({
          ...eventData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw new Error(`Database operation error: ${error.message}`);
    }

    console.log('Flock event saved to Supabase:', data);

    res.status(200).json({ 
      message: req.method === 'PUT' ? 'Flock event updated successfully' : 'Flock event saved successfully', 
      data: { event: data },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving flock event:', error);
    res.status(500).json({ 
      message: 'Error saving flock event', 
      error: error.message,
      stack: error.stack 
    });
  }
}

export default handler;
