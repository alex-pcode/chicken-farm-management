import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Handler called');
  
  const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Attempting to fetch egg entries...');
    
    // Fetch all egg entries, order by date descending
    const { data: eggEntries, error } = await supabase
      .from('egg_entries')
      .select('id, date, count')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Egg entries fetched successfully:', eggEntries?.length || 0, 'entries');
    
    // Fetch singleton flock profile
    const { data: flockProfiles, error: flockProfileError } = await supabase
      .from('flock_profiles')
      .select('*')
      .limit(1);

    if (flockProfileError) {
      console.error('Supabase flock_profiles error:', flockProfileError);
      throw flockProfileError;
    }

    // Get the first profile instead of looking for profile_data JSONB column
    const flockProfile = flockProfiles && flockProfiles.length > 0 ? flockProfiles[0] : null;
    
    // Map database fields to frontend expectations for flock profile
    let mappedFlockProfile: any = null;
    // Fetch flock events
    let flockEvents: any[] = [];
    if (flockProfile) {
      const { data: events, error: eventsError } = await supabase
        .from('flock_events')
        .select('*')
        .eq('flock_profile_id', flockProfile.id)
        .order('date', { ascending: true });
      
      if (eventsError) {
        console.error('Error fetching flock events:', eventsError);
      } else {
        flockEvents = events || [];
      }
    }

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

    // Fetch feed inventory
    const { data: feedInventory, error: feedError } = await supabase
      .from('feed_inventory')
      .select('*');
    if (feedError) {
      console.error('Supabase feed_inventory error:', feedError);
      throw feedError;
    }

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*');
    if (expensesError) {
      console.error('Supabase expenses error:', expensesError);
      throw expensesError;
    }

    const response = {
      message: 'Data fetched successfully',
      data: {
        eggEntries: eggEntries?.map(entry => ({
          id: entry.id,
          date: entry.date,
          count: entry.count
        })) || [],
        flockProfile: mappedFlockProfile,
        feedInventory: feedInventory?.map(feed => ({
          id: feed.id,
          brand: feed.name, // Map name to brand for frontend
          type: feed.type || 'Layer Feed', // Default type since it's not in DB
          quantity: feed.quantity,
          unit: feed.unit,
          pricePerUnit: feed.cost_per_unit, // Map cost_per_unit to pricePerUnit
          openedDate: feed.purchase_date, // Map purchase_date to openedDate
          depletedDate: feed.expiry_date, // Map expiry_date to depletedDate
          batchNumber: feed.batch_number || '', // Default since not in current schema
          createdAt: feed.created_at,
          updatedAt: feed.updated_at
        })) || [],
        expenses: expenses || []
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning response with data:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getData:', error);
    res.status(500).json({
      message: 'Error fetching data from database',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
