import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

interface MonthlyTotal {
  month: string;
  total_sales: number;
  total_revenue: number;
  total_eggs: number;
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from authorization header
async function getAuthenticatedUser(authHeader: string | undefined, supabaseClient: typeof supabase) {
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    return error ? null : user;
  } catch {
    return null;
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await getAuthenticatedUser(authHeader, supabase);
  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const userId = user.id;

  try {
    const type = event.queryStringParameters?.type;
    const customer_id = event.queryStringParameters?.customer_id;

    if (type === 'summary') {
      // Get overall sales summary
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, dozen_count, individual_count')
        .eq('user_id', userId);

      if (salesError) throw salesError;

      const { data: customerCount, error: customerError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (customerError) throw customerError;

      // Calculate totals
      const totalSales = salesData.length;
      const totalRevenue = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
      const freeSales = salesData.filter(sale => parseFloat(sale.total_amount) === 0);
      const paidSales = salesData.filter(sale => parseFloat(sale.total_amount) > 0);
      const totalEggsSold = paidSales.reduce((sum, sale) => sum + (sale.dozen_count * 12) + sale.individual_count, 0);
      const freeEggsGiven = freeSales.reduce((sum, sale) => sum + (sale.dozen_count * 12) + sale.individual_count, 0);

      // Get top customer
      const { data: topCustomerData, error: topCustomerError } = await supabase
        .from('sales')
        .select(`
          customer_id,
          customers!inner(name),
          total_amount
        `)
        .eq('user_id', userId);

      if (topCustomerError) throw topCustomerError;

      let topCustomer = null;
      if (topCustomerData && topCustomerData.length > 0) {
        const customerTotals: Record<string, { name: string; total: number }> = topCustomerData.reduce((acc, sale) => {
          const customerId = sale.customer_id;
          const customerName = (sale.customers as { name: string } | null)?.name || 'Unknown';
          if (!acc[customerId]) {
            acc[customerId] = { name: customerName, total: 0 };
          }
          acc[customerId].total += parseFloat(sale.total_amount);
          return acc;
        }, {} as Record<string, { name: string; total: number }>);

        const topCustomerEntry = Object.entries(customerTotals)
          .sort(([,a], [,b]) => (b as { name: string; total: number }).total - (a as { name: string; total: number }).total)[0];

        topCustomer = topCustomerEntry ? (topCustomerEntry[1] as { name: string; total: number }).name : null;
      }

      const summary = {
        total_sales: totalSales,
        total_revenue: totalRevenue,
        total_eggs_sold: totalEggsSold,
        free_eggs_given: freeEggsGiven,
        customer_count: customerCount?.length || 0,
        top_customer: topCustomer
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      };
    }

    if (type === 'monthly') {
      // Get monthly sales breakdown
      const { data: monthlyData, error } = await supabase
        .from('sales')
        .select('sale_date, total_amount, dozen_count, individual_count')
        .eq('user_id', userId)
        .order('sale_date');

      if (error) throw error;

      // Group by month
      const monthlyTotals: Record<string, MonthlyTotal> = monthlyData.reduce((acc, sale) => {
        const month = sale.sale_date.substring(0, 7); // YYYY-MM format
        const isPaidSale = parseFloat(sale.total_amount) > 0;

        if (!acc[month]) {
          acc[month] = {
            month,
            total_sales: 0,
            total_revenue: 0,
            total_eggs: 0
          };
        }
        acc[month].total_sales += 1;
        acc[month].total_revenue += parseFloat(sale.total_amount);

        // Only count eggs from paid sales
        if (isPaidSale) {
          acc[month].total_eggs += (sale.dozen_count * 12) + sale.individual_count;
        }

        return acc;
      }, {} as Record<string, MonthlyTotal>);

      const monthlyArray = Object.values(monthlyTotals).sort((a: MonthlyTotal, b: MonthlyTotal) => a.month.localeCompare(b.month));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monthlyArray)
      };
    }

    if (type === 'customer_stats' && customer_id) {
      // Get stats for a specific customer
      const { data: customerSales, error } = await supabase
        .from('sales')
        .select('total_amount, dozen_count, individual_count, sale_date')
        .eq('user_id', userId)
        .eq('customer_id', customer_id as string)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      const totalPurchases = customerSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
      const totalEggs = customerSales.reduce((sum, sale) => sum + (sale.dozen_count * 12) + sale.individual_count, 0);
      const lastPurchaseDate = customerSales.length > 0 ? customerSales[0].sale_date : null;

      const stats = {
        total_purchases: totalPurchases,
        total_eggs: totalEggs,
        last_purchase_date: lastPurchaseDate,
        purchase_count: customerSales.length
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid query parameters' })
    };
  } catch (error) {
    console.error('Sales reports API error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
