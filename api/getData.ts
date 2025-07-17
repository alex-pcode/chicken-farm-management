import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Log the relevant environment variables to check if they are loaded
console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL ? 'Loaded' : 'Not Loaded');
console.log('SUPABASE_SERVICE_ROLE_KEY from env:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'Not Loaded');

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest, supabase: any) {
  const authHeader = req.headers.authorization;
  console.log('Auth header check:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    console.log('No authorization header found');
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted, length:', token.length);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log('Supabase auth result:', { user: !!user, error: error?.message });
    return error ? null : user;
  } catch (err) {
    console.log('Auth error:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Handler called');
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not set!');
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

    console.log('Attempting to fetch data for user:', user.id);
    
    // Fetch user's egg entries, order by date descending
    const { data: eggEntries, error } = await supabase
      .from('egg_entries')
      .select('id, date, count')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Egg entries fetched successfully:', eggEntries?.length || 0, 'entries');
    
    // Fetch user's flock profile
    const { data: flockProfiles, error: flockProfileError } = await supabase
      .from('flock_profiles')
      .select('*')
      .eq('user_id', user.id)
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

    // Fetch user's feed inventory
    const { data: feedInventory, error: feedError } = await supabase
      .from('feed_inventory')
      .select('*')
      .eq('user_id', user.id);
    if (feedError) {
      console.error('Supabase feed_inventory error:', feedError);
      throw feedError;
    }

    // Fetch user's expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id);
    if (expensesError) {
      console.error('Supabase expenses error:', expensesError);
      throw expensesError;
    }

    // Fetch customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (customersError) {
      console.error('Supabase customers error:', customersError);
      throw customersError;
    }

    // Fetch sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .order('sale_date', { ascending: false });
    if (salesError) {
      console.error('Supabase sales error:', salesError);
      throw salesError;
    }

    // Build summary (simple example)
    const summary = {
      customer_count: customers?.length || 0,
      total_sales: sales?.length || 0,
      total_revenue: sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0),
      total_eggs_sold: sales?.reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0),
      free_eggs_given: sales?.filter(s => s.total_amount === 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0),
      top_customer: (() => {
        if (!sales || !customers) return undefined;
        const counts: Record<string, number> = {};
        sales.forEach(s => {
          counts[s.customer_id] = (counts[s.customer_id] || 0) + ((s.dozen_count || 0) * 12 + (s.individual_count || 0));
        });
        const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return customers.find(c => c.id === topId)?.name || undefined;
      })()
    };

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
        expenses: expenses || [],
        customers: customers || [],
        sales: sales || [],
        summary
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
