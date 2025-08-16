import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Dashboard Summary API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy
 * It returns only the minimal data needed for the dashboard view:
 * - Summary statistics (totals, averages)
 * - Last 30 days trend data for charts
 * - Key metrics without full datasets
 * 
 * This replaces loading 183+ egg entries with just the calculated summaries
 * Expected 80% reduction in dashboard data transfer
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

    console.log('Fetching dashboard summary for user:', user.id);

    // Get summary statistics using efficient SQL queries
    
    // 1. Egg production summary (last 30 days + totals)
    const { data: eggSummary } = await supabase
      .from('egg_entries')
      .select('date, count')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
      .order('date', { ascending: true });

    // 2. Total egg count for all time
    const { data: totalEggData } = await supabase
      .from('egg_entries')
      .select('count')
      .eq('user_id', user.id);

    // 3. Current month vs previous month production
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
    
    const { data: currentMonthData } = await supabase
      .from('egg_entries')
      .select('count')
      .eq('user_id', user.id)
      .gte('date', currentMonth + '-01')
      .lt('date', currentMonth + '-32');

    const { data: previousMonthData } = await supabase
      .from('egg_entries')
      .select('count')
      .eq('user_id', user.id)
      .gte('date', previousMonth + '-01')
      .lt('date', previousMonth + '-32');

    // 4. Sales summary
    const { data: salesData } = await supabase
      .from('sales')
      .select('total_amount, dozen_count, individual_count')
      .eq('user_id', user.id);

    // 5. Expenses summary (current month)
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', currentMonth + '-01');

    // 6. Customer count
    const { data: customersData } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id);

    // Calculate summary statistics
    const totalEggs = totalEggData?.reduce((sum, entry) => sum + entry.count, 0) || 0;
    const last30DaysData = eggSummary || [];
    const dailyAverage = last30DaysData.length > 0 
      ? last30DaysData.reduce((sum, entry) => sum + entry.count, 0) / last30DaysData.length 
      : 0;

    const thisMonthProduction = currentMonthData?.reduce((sum, entry) => sum + entry.count, 0) || 0;
    const lastMonthProduction = previousMonthData?.reduce((sum, entry) => sum + entry.count, 0) || 0;

    // Sales calculations
    const totalRevenue = salesData?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + s.total_amount, 0) || 0;
    const totalEggsSold = salesData?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0) || 0;
    const freeEggsGiven = salesData?.filter(s => s.total_amount === 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0) || 0;
    
    // Estimate egg value (assuming average price per egg based on sales)
    const averagePricePerEgg = totalEggsSold > 0 ? totalRevenue / totalEggsSold : 0.5; // Fallback to $0.50 per egg
    const eggValue = totalEggs * averagePricePerEgg;

    // Expenses summary
    const monthlyExpenses = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    const dashboardSummary = {
      totalEggs,
      dailyAverage: Math.round(dailyAverage * 10) / 10, // Round to 1 decimal
      thisMonthProduction,
      lastMonthProduction,
      eggValue: Math.round(eggValue * 100) / 100, // Round to 2 decimals
      revenue: totalRevenue,
      freeEggs: freeEggsGiven,
      last30DaysData: last30DaysData.map(entry => ({
        date: entry.date,
        count: entry.count
      })),
      totalExpenses: monthlyExpenses,
      monthlyExpenses,
      customerCount: customersData?.length || 0,
      recentSales: salesData?.length || 0
    };

    console.log('Dashboard summary generated successfully');
    
    res.status(200).json(dashboardSummary);
  } catch (error) {
    console.error('Error in dashboard-summary:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}