import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Production Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for production page
 * It returns only data needed for egg production tracking:
 * - Recent egg entries (last 30 days for charts/trends)
 * - Today's entry if exists
 * - Weekly and monthly statistics
 * - No expenses, sales, or other unrelated data
 */

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest, supabase: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error ? null : user;
  } catch (err) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
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

    console.log('Fetching production data for user:', user.id);

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Recent egg entries (last 30 days)
    const { data: recentEggEntries } = await supabase
      .from('egg_entries')
      .select('id, date, count')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false });

    // 2. Today's entry specifically
    const todayEntry = recentEggEntries?.find(entry => entry.date === today) || null;

    // 3. Weekly trend (last 7 days)
    const weeklyEntries = recentEggEntries?.filter(entry => entry.date >= sevenDaysAgo) || [];
    const weeklyTrend = weeklyEntries.map(entry => ({
      date: entry.date,
      count: entry.count
    }));

    // 4. Monthly statistics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
    
    const currentMonthEntries = recentEggEntries?.filter(entry => entry.date.startsWith(currentMonth)) || [];
    const currentMonthTotal = currentMonthEntries.reduce((sum, entry) => sum + entry.count, 0);

    // Get previous month data for comparison
    const { data: previousMonthEntries } = await supabase
      .from('egg_entries')
      .select('count')
      .eq('user_id', user.id)
      .gte('date', previousMonth + '-01')
      .lt('date', previousMonth + '-32');

    const previousMonthTotal = previousMonthEntries?.reduce((sum, entry) => sum + entry.count, 0) || 0;
    const percentageChange = previousMonthTotal > 0 
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
      : 0;

    const productionData = {
      recentEggEntries: recentEggEntries?.map(entry => ({
        id: entry.id,
        date: entry.date,
        count: entry.count
      })) || [],
      todayEntry,
      weeklyTrend,
      monthlyStats: {
        currentMonth: currentMonthTotal,
        previousMonth: previousMonthTotal,
        percentageChange: Math.round(percentageChange * 10) / 10 // Round to 1 decimal
      }
    };

    console.log(`Production data fetched successfully: ${recentEggEntries?.length || 0} recent entries`);
    
    res.status(200).json(productionData);
  } catch (error) {
    console.error('Error in production-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}