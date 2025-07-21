import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  // Verify authentication
  const user = await getAuthenticatedUser(req, supabase);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.id;

  try {
    if (req.method === 'GET') {
      const { type, period, customer_id } = req.query;

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
            const customerName = (sale.customers as any)?.name || 'Unknown';
            if (!acc[customerId]) {
              acc[customerId] = { name: customerName, total: 0 };
            }
            acc[customerId].total += parseFloat(sale.total_amount);
            return acc;
          }, {} as Record<string, { name: string; total: number }>);

          const topCustomerEntry = Object.entries(customerTotals)
            .sort(([,a], [,b]) => (b as any).total - (a as any).total)[0];
          
          topCustomer = topCustomerEntry ? (topCustomerEntry[1] as any).name : null;
        }

        const summary = {
          total_sales: totalSales,
          total_revenue: totalRevenue,
          total_eggs_sold: totalEggsSold,
          free_eggs_given: freeEggsGiven,
          customer_count: customerCount?.length || 0,
          top_customer: topCustomer
        };

        return res.status(200).json(summary);
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
        const monthlyTotals: Record<string, any> = monthlyData.reduce((acc, sale) => {
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
        }, {} as Record<string, any>);

        const monthlyArray = Object.values(monthlyTotals).sort((a: any, b: any) => a.month.localeCompare(b.month));

        return res.status(200).json(monthlyArray);
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

        return res.status(200).json(stats);
      }

      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sales reports API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
