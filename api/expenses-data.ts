import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Expenses Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for expenses page
 * It returns only data needed for expense tracking:
 * - Recent expenses (last 90 days for expense management)
 * - Monthly totals for trend analysis
 * - Category breakdown for budgeting
 * - Weekly trend for insights
 * - No egg entries, sales, or feed data
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

    console.log('Fetching expenses data for user:', user.id);

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Recent expenses (last 90 days)
    const { data: recentExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: false });

    // 2. Get expenses for last 12 months for monthly totals
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: yearlyExpenses } = await supabase
      .from('expenses')
      .select('date, amount, category')
      .eq('user_id', user.id)
      .gte('date', twelveMonthsAgo)
      .order('date', { ascending: true });

    // Calculate monthly totals
    const monthlyTotals: { month: string; total: number }[] = [];
    const monthlyMap = new Map<string, number>();

    yearlyExpenses?.forEach(expense => {
      const month = expense.date.slice(0, 7); // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + expense.amount);
    });

    // Convert to array and sort
    for (const [month, total] of monthlyMap.entries()) {
      monthlyTotals.push({ month, total });
    }
    monthlyTotals.sort((a, b) => a.month.localeCompare(b.month));

    // 3. Category breakdown (from all recent expenses)
    const categoryBreakdown: { [category: string]: number } = {};
    recentExpenses?.forEach(expense => {
      const category = expense.category || 'Other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
    });

    // 4. Weekly trend (last 7 days)
    const weeklyExpenses = recentExpenses?.filter(expense => expense.date >= sevenDaysAgo) || [];
    
    // Group by date for weekly trend
    const weeklyMap = new Map<string, number>();
    weeklyExpenses.forEach(expense => {
      const date = expense.date;
      weeklyMap.set(date, (weeklyMap.get(date) || 0) + expense.amount);
    });

    const weeklyTrend: { date: string; amount: number }[] = [];
    for (const [date, amount] of weeklyMap.entries()) {
      weeklyTrend.push({ date, amount });
    }
    weeklyTrend.sort((a, b) => a.date.localeCompare(b.date));

    const expensesData = {
      recentExpenses: recentExpenses || [],
      monthlyTotals,
      categoryBreakdown,
      weeklyTrend
    };

    console.log(`Expenses data fetched successfully: ${recentExpenses?.length || 0} recent expenses`);
    
    res.status(200).json(expensesData);
  } catch (error) {
    console.error('Error in expenses-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}