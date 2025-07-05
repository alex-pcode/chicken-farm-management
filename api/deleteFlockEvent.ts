import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eventId } = req.body;
    console.log('Deleting event with ID:', eventId);

    if (!eventId) {
      return res.status(400).json({ message: 'Missing required field: eventId' });
    }

    // Delete the event from database
    const { error } = await supabase
      .from('flock_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    res.status(200).json({
      message: 'Event deleted successfully',
      eventId: eventId,
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
