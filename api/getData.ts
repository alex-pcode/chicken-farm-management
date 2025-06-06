import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmohmazolvilxpxhfjie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhweGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNzUsImV4cCI6MjA2NDgwOTE3NX0.b-biGmoVFvMW9vF6YN2fomyh3kzEGdhQCZ69jdmH7G8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }  try {
    console.log('Fetching all data from Supabase...');
    
    // Fetch all data from different tables
    const [flockProfileResult, eggEntriesResult, feedInventoryResult, expensesResult] = await Promise.all([
      supabase.from('flock_profiles').select('*').limit(1).single(),
      supabase.from('egg_entries').select('*').order('date', { ascending: false }),
      supabase.from('feed_inventory').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false })
    ]);

    // Handle errors for each query
    if (flockProfileResult.error && flockProfileResult.error.code !== 'PGRST116') {
      console.error('Error fetching flock profile:', flockProfileResult.error);
    }
    if (eggEntriesResult.error) {
      console.error('Error fetching egg entries:', eggEntriesResult.error);
    }
    if (feedInventoryResult.error) {
      console.error('Error fetching feed inventory:', feedInventoryResult.error);
    }
    if (expensesResult.error) {
      console.error('Error fetching expenses:', expensesResult.error);
    }

    // Transform the data to match the expected format
    const data = {
      flockProfile: flockProfileResult.data ? {
        farmName: flockProfileResult.data.farm_name,
        location: flockProfileResult.data.location,
        flockSize: flockProfileResult.data.flock_size,
        breed: flockProfileResult.data.breed,
        startDate: flockProfileResult.data.start_date,
        notes: flockProfileResult.data.notes
      } : null,
      eggEntries: eggEntriesResult.data?.map(entry => ({
        date: entry.date,
        count: entry.count
      })) || [],
      feedInventory: feedInventoryResult.data?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnit: item.cost_per_unit,
        purchaseDate: item.purchase_date,
        expiryDate: item.expiry_date
      })) || [],
      expenses: expensesResult.data?.map(expense => ({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount
      })) || []
    };
    
    console.log('Data fetched successfully from Supabase');
    
    res.status(200).json({
      message: 'Data fetched successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    res.status(500).json({
      message: 'Error fetching data from database',
      error: error.message,
      stack: error.stack
    });
  }
}
