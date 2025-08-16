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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const { type } = req.query;

    switch (type) {
      case 'all':
        return await getAllData(user, res);
      case 'dashboard':
        return await getDashboardSummary(user, res);
      case 'production':
        return await getProductionData(user, res);
      case 'feed':
        return await getFeedData(user, res);
      case 'expenses':
        return await getExpensesData(user, res);
      case 'savings':
        return await getSavingsData(user, res);
      case 'flock':
        return await getFlockData(user, res);
      case 'crm':
        return await getCRMData(user, res);
      default:
        return await getAllData(user, res); // Default to all data
    }
  } catch (error) {
    console.error('Error in data endpoint:', error);
    res.status(500).json({
      message: 'Error fetching data from database',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// All data (original getData.ts functionality)
async function getAllData(user: any, res: VercelResponse) {
  // Fetch user's egg entries, order by date descending
  const { data: eggEntries, error } = await supabase
    .from('egg_entries')
    .select('id, date, count')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;
  
  // Fetch user's flock profile
  const { data: flockProfiles, error: flockProfileError } = await supabase
    .from('flock_profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1);

  if (flockProfileError) throw flockProfileError;

  const flockProfile = flockProfiles && flockProfiles.length > 0 ? flockProfiles[0] : null;
  
  // Fetch flock events
  let flockEvents: any[] = [];
  if (flockProfile) {
    const { data: events, error: eventsError } = await supabase
      .from('flock_events')
      .select('*')
      .eq('flock_profile_id', flockProfile.id)
      .order('date', { ascending: true });
    
    if (!eventsError) {
      flockEvents = events || [];
    }
  }

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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (feedError) throw feedError;

  // Fetch user's expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });
  if (expensesError) throw expensesError;

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (customersError) throw customersError;

  // Fetch sales
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', user.id)
    .order('sale_date', { ascending: false });
  if (salesError) throw salesError;

  const summary = {
    customer_count: customers?.length || 0,
    total_sales: sales?.length || 0,
    total_revenue: sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0),
    total_eggs_sold: sales?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0),
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
        brand: feed.name,
        type: feed.type || 'Layer Feed',
        quantity: feed.quantity,
        unit: feed.unit,
        pricePerUnit: feed.cost_per_unit,
        openedDate: feed.purchase_date,
        depletedDate: feed.expiry_date,
        batchNumber: feed.batch_number || '',
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
  
  res.status(200).json(response);
}

// Dashboard summary data
async function getDashboardSummary(user: any, res: VercelResponse) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get recent egg entries
  const { data: eggEntries } = await supabase
    .from('egg_entries')
    .select('date, count')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo)
    .order('date', { ascending: false });

  // Get recent expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category, date')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo);

  // Get flock profile
  const { data: flockProfiles } = await supabase
    .from('flock_profiles')
    .select('hens, roosters, chicks, brooding')
    .eq('user_id', user.id)
    .limit(1);

  const totalEggs = eggEntries?.reduce((sum, entry) => sum + entry.count, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const flock = flockProfiles?.[0] || { hens: 0, roosters: 0, chicks: 0, brooding: 0 };

  res.status(200).json({
    message: 'Dashboard summary fetched successfully',
    data: {
      totalEggs,
      totalExpenses,
      flockCounts: flock,
      recentEggEntries: eggEntries?.slice(0, 7) || [],
      expensesByCategory: expenses?.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>) || {}
    },
    timestamp: new Date().toISOString()
  });
}

// Production data (egg entries)
async function getProductionData(user: any, res: VercelResponse) {
  const { data: eggEntries, error } = await supabase
    .from('egg_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;

  res.status(200).json({
    message: 'Production data fetched successfully',
    data: { eggEntries: eggEntries || [] },
    timestamp: new Date().toISOString()
  });
}

// Feed data
async function getFeedData(user: any, res: VercelResponse) {
  const { data: feedInventory, error } = await supabase
    .from('feed_inventory')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.status(200).json({
    message: 'Feed data fetched successfully',
    data: { feedInventory: feedInventory || [] },
    timestamp: new Date().toISOString()
  });
}

// Expenses data
async function getExpensesData(user: any, res: VercelResponse) {
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;

  res.status(200).json({
    message: 'Expenses data fetched successfully',
    data: { expenses: expenses || [] },
    timestamp: new Date().toISOString()
  });
}

// Savings data
async function getSavingsData(user: any, res: VercelResponse) {
  // Get sales and expenses for savings calculation
  const { data: sales } = await supabase
    .from('sales')
    .select('total_amount, sale_date')
    .eq('user_id', user.id);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, date')
    .eq('user_id', user.id);

  const totalRevenue = sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const netSavings = totalRevenue - totalExpenses;

  res.status(200).json({
    message: 'Savings data fetched successfully',
    data: {
      totalRevenue,
      totalExpenses,
      netSavings,
      sales: sales || [],
      expenses: expenses || []
    },
    timestamp: new Date().toISOString()
  });
}

// Flock data
async function getFlockData(user: any, res: VercelResponse) {
  const { data: flockProfiles } = await supabase
    .from('flock_profiles')
    .select('*')
    .eq('user_id', user.id);

  const { data: flockEvents } = await supabase
    .from('flock_events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  res.status(200).json({
    message: 'Flock data fetched successfully',
    data: {
      flockProfiles: flockProfiles || [],
      flockEvents: flockEvents || []
    },
    timestamp: new Date().toISOString()
  });
}

// CRM data
async function getCRMData(user: any, res: VercelResponse) {
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', user.id)
    .order('sale_date', { ascending: false });

  const summary = {
    customer_count: customers?.length || 0,
    total_sales: sales?.length || 0,
    total_revenue: sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0),
    total_eggs_sold: sales?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0),
    free_eggs_given: sales?.filter(s => s.total_amount === 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0)
  };

  res.status(200).json({
    message: 'CRM data fetched successfully',
    data: {
      customers: customers || [],
      sales: sales || [],
      summary
    },
    timestamp: new Date().toISOString()
  });
}