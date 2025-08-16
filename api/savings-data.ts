import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Savings Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for savings page
 * It returns only data needed for financial analysis:
 * - Financial summary (revenue, expenses, profit)
 * - Monthly trends for charts
 * - Annual projections
 * - No detailed transaction data (eggs, individual sales, etc.)
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

    console.log('Fetching savings data for user:', user.id);

    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Get all sales for revenue calculation
    const { data: allSales } = await supabase
      .from('sales')
      .select('total_amount, sale_date')
      .eq('user_id', user.id)
      .gte('sale_date', twelveMonthsAgo);

    // 2. Get all expenses for cost calculation
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', twelveMonthsAgo);

    // Calculate financial summary
    const totalRevenue = allSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const totalExpenses = allExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate monthly trends
    const monthlyData = new Map<string, { revenue: number; expenses: number }>();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      monthlyData.set(monthKey, { revenue: 0, expenses: 0 });
    }

    // Aggregate sales by month
    allSales?.forEach(sale => {
      if (sale.sale_date) {
        const month = sale.sale_date.slice(0, 7);
        const existing = monthlyData.get(month);
        if (existing) {
          existing.revenue += sale.total_amount || 0;
        }
      }
    });

    // Aggregate expenses by month
    allExpenses?.forEach(expense => {
      if (expense.date) {
        const month = expense.date.slice(0, 7);
        const existing = monthlyData.get(month);
        if (existing) {
          existing.expenses += expense.amount;
        }
      }
    });

    // Convert to array for frontend
    const monthlyTrends = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    }));

    // Calculate annual projections based on current trends
    const currentMonthData = monthlyTrends.slice(-3); // Last 3 months for trend
    const avgMonthlyRevenue = currentMonthData.reduce((sum, m) => sum + m.revenue, 0) / Math.max(currentMonthData.length, 1);
    const avgMonthlyExpenses = currentMonthData.reduce((sum, m) => sum + m.expenses, 0) / Math.max(currentMonthData.length, 1);

    const projections = {
      annualRevenue: Math.round(avgMonthlyRevenue * 12),
      annualExpenses: Math.round(avgMonthlyExpenses * 12),
      annualProfit: Math.round((avgMonthlyRevenue - avgMonthlyExpenses) * 12)
    };

    const savingsData = {
      financialSummary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 10) / 10 // Round to 1 decimal
      },
      monthlyTrends,
      projections
    };

    console.log(`Savings data calculated successfully: $${totalRevenue} revenue, $${totalExpenses} expenses, $${netProfit} profit`);
    
    res.status(200).json(savingsData);
  } catch (error) {
    console.error('Error in savings-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}