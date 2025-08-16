import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * CRM Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for CRM page
 * It returns only data needed for customer relationship management:
 * - All customers (needed for CRM workflow)
 * - Recent sales (last 90 days for relevance)
 * - Sales summary statistics
 * - No egg entries, expenses, or feed data
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

    console.log('Fetching CRM data for user:', user.id);

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. All customers (needed for CRM functionality)
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    // 2. Recent sales (last 90 days)
    const { data: recentSales } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .gte('sale_date', ninetyDaysAgo)
      .order('sale_date', { ascending: false });

    // 3. All sales for summary calculations
    const { data: allSales } = await supabase
      .from('sales')
      .select('total_amount, dozen_count, individual_count, customer_id')
      .eq('user_id', user.id);

    // Calculate sales summary
    const totalSales = allSales?.length || 0;
    const totalRevenue = allSales?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + s.total_amount, 0) || 0;
    const totalEggsSold = allSales?.filter(s => s.total_amount > 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0) || 0;
    const freeEggsGiven = allSales?.filter(s => s.total_amount === 0).reduce((sum, s) => sum + ((s.dozen_count || 0) * 12 + (s.individual_count || 0)), 0) || 0;

    // Find top customer
    let topCustomer: string | undefined;
    if (allSales && customers) {
      const customerEggCounts: Record<string, number> = {};
      allSales.forEach(sale => {
        const customerId = sale.customer_id;
        const eggCount = (sale.dozen_count || 0) * 12 + (sale.individual_count || 0);
        customerEggCounts[customerId] = (customerEggCounts[customerId] || 0) + eggCount;
      });
      
      const topCustomerId = Object.entries(customerEggCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      
      topCustomer = customers.find(c => c.id === topCustomerId)?.name;
    }

    const crmData = {
      customers: customers || [],
      recentSales: recentSales || [],
      salesSummary: {
        totalSales,
        totalRevenue,
        totalEggsSold,
        freeEggsGiven,
        topCustomer
      }
    };

    console.log(`CRM data fetched successfully: ${customers?.length || 0} customers, ${recentSales?.length || 0} recent sales`);
    
    res.status(200).json(crmData);
  } catch (error) {
    console.error('Error in crm-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}