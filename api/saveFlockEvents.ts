import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { flockProfileId, event, eventId } = req.body;
    console.log('Received event data:', { flockProfileId, event, eventId });

    if (!flockProfileId || !event) {
      return res.status(400).json({ message: 'Missing required fields: flockProfileId and event' });
    }

    // Prepare event data for database
    const eventData = {
      flock_profile_id: flockProfileId,
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
