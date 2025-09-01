import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { FlockEvent, FlockBatch, FeedEntry, Expense, Customer, Sale, DeathRecord } from '../src/types/index';

// Database record types (snake_case as they come from Supabase)
interface DBFeedInventory {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  quantity: number;
  unit: string;
  total_cost: number;
  purchase_date: string;
  expiry_date?: string;
  batch_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface DBFlockBatch {
  id: string;
  user_id: string;
  batch_name: string;
  breed: string;
  acquisition_date: string;
  initial_count: number;
  current_count: number;
  type: string;
  age_at_acquisition: string;
  expected_laying_start_date?: string;
  actual_laying_start_date?: string;
  source: string;
  cost?: number;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  hens_count?: number;
  roosters_count?: number;
  chicks_count?: number;
  brooding_count?: number;
}

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
interface AuthUser {
  id: string;
  email?: string;
}

async function getAllData(user: AuthUser, res: VercelResponse) {
  // First, fetch user profile to determine tier
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single();
  
  const isFreeTier = !userProfile || userProfile.subscription_status !== 'premium';
  const eggEntriesLimit = isFreeTier ? 90 : 730; // 90 days for free, 2 years for premium

  // Fetch user's egg entries with tier-based limits
  const { data: eggEntries, error } = await supabase
    .from('egg_entries')
    .select('id, date, count, size, color, notes, created_at, user_id')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(eggEntriesLimit);

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
  let flockEvents: FlockEvent[] = [];
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

  let mappedFlockProfile: {
    id: string;
    farmName: string;
    location: string;
    flockSize: number;
    breedTypes: string[];
    flockStartDate: string;
    notes: string;
    hens: number;
    roosters: number;
    chicks: number;
    brooding: number;
    events: FlockEvent[];
    createdAt?: string;
    updatedAt?: string;
  } | null = null;
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
        affectedBirds: event.affectedBirds,
        notes: event.notes
      })),
      createdAt: flockProfile.created_at,
      updatedAt: flockProfile.updated_at
    };
  }

  // Fetch user's feed inventory (premium only)
  let feedInventory: DBFeedInventory[] = [];
  if (!isFreeTier) {
    const { data: feedInventoryData, error: feedError } = await supabase
      .from('feed_inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (feedError) throw feedError;
    feedInventory = feedInventoryData || [];
  }

  // Fetch premium features only for premium users
  let expenses: Expense[] = [];
  let customers: Customer[] = [];
  let sales: Sale[] = [];
  
  if (!isFreeTier) {
    // Fetch user's expenses (premium only)
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(500);
    if (expensesError) throw expensesError;
    expenses = expensesData || [];

    // Fetch customers (premium only)
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (customersError) throw customersError;
    customers = customersData || [];

    // Fetch sales (premium only)
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        customers!inner(name)
      `)
      .eq('user_id', user.id)
      .order('sale_date', { ascending: false })
      .limit(200);
    if (salesError) throw salesError;
    
    // Transform the data to include customer_name
    sales = (salesData || []).map(sale => ({
      ...sale,
      customer_name: sale.customers?.name || 'Unknown Customer'
    }));
  }

  // Fetch flock batches (premium only)
  let flockBatches: DBFlockBatch[] = [];
  if (!isFreeTier) {
    const { data: flockBatchesData, error: batchesError } = await supabase
      .from('flock_batches')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('acquisition_date', { ascending: false });
    if (batchesError) throw batchesError;
    flockBatches = flockBatchesData || [];
  }

  // Fetch full user profile for response (we already fetched subscription_status earlier)
  const { data: fullUserProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  // Don't throw error if profile doesn't exist - new users won't have one

  // Fetch death records (premium only)
  let deathRecords: any[] = [];
  if (!isFreeTier) {
    const { data: deathRecordsData, error: deathsError } = await supabase
      .from('death_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(150);
    if (deathsError) throw deathsError;
    deathRecords = deathRecordsData || [];
  }

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
        count: entry.count,
        size: entry.size,
        color: entry.color,
        notes: entry.notes,
        created_at: entry.created_at,
        user_id: entry.user_id
      })) || [],
      flockProfile: mappedFlockProfile,
      feedInventory: feedInventory?.map(feed => ({
        id: feed.id,
        brand: feed.name,
        type: feed.type || 'Layer Feed',
        quantity: feed.quantity,
        unit: feed.unit,
        total_cost: feed.total_cost,
        openedDate: feed.purchase_date,
        depletedDate: feed.expiry_date,
        batchNumber: feed.batch_number || '',
        createdAt: feed.created_at,
        updatedAt: feed.updated_at
      })) || [],
      expenses: expenses || [],
      customers: customers || [],
      sales: sales || [],
      flockBatches: flockBatches?.map(batch => ({
        id: batch.id,
        batchName: batch.batch_name,
        breed: batch.breed,
        acquisitionDate: batch.acquisition_date,
        initialCount: batch.initial_count,
        currentCount: batch.current_count,
        type: batch.type,
        ageAtAcquisition: batch.age_at_acquisition,
        expectedLayingStartDate: batch.expected_laying_start_date,
        actualLayingStartDate: batch.actual_laying_start_date,
        source: batch.source,
        cost: batch.cost,
        notes: batch.notes,
        isActive: batch.is_active,
        created_at: batch.created_at,
        updated_at: batch.updated_at,
        hensCount: batch.hens_count,
        roostersCount: batch.roosters_count,
        chicksCount: batch.chicks_count,
        broodingCount: batch.brooding_count
      })) || [],
      deathRecords: deathRecords?.map(record => ({
        id: record.id,
        batchId: record.batch_id,
        date: record.date,
        count: record.count,
        cause: record.cause,
        description: record.description,
        notes: record.notes,
        created_at: record.created_at
      })) || [],
      userProfile: fullUserProfile ? {
        id: fullUserProfile.id,
        user_id: fullUserProfile.user_id,
        onboarding_completed: fullUserProfile.onboarding_completed,
        onboarding_step: fullUserProfile.onboarding_step,
        setup_progress: fullUserProfile.setup_progress,
        subscription_status: fullUserProfile.subscription_status || 'free',
        created_at: fullUserProfile.created_at,
        updated_at: fullUserProfile.updated_at
      } : null,
      summary
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(response);
}

// Dashboard summary data
async function getDashboardSummary(user: AuthUser, res: VercelResponse) {
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
async function getProductionData(user: AuthUser, res: VercelResponse) {
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
async function getFeedData(user: AuthUser, res: VercelResponse) {
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
async function getExpensesData(user: AuthUser, res: VercelResponse) {
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
async function getSavingsData(user: AuthUser, res: VercelResponse) {
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
async function getFlockData(user: AuthUser, res: VercelResponse) {
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
async function getCRMData(user: AuthUser, res: VercelResponse) {
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