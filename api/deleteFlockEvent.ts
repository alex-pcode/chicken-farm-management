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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const { eventId } = req.body;
    console.log('Deleting event with ID:', eventId);

    if (!eventId) {
      return res.status(400).json({ message: 'Missing required field: eventId' });
    }

    // Delete the event (RLS will ensure user can only delete their own events)
    const { data, error } = await supabase
      .from('flock_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id) // Extra security check
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    res.status(200).json({
      message: 'Event deleted successfully',
      eventId: eventId,
      deletedData: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default handler;
