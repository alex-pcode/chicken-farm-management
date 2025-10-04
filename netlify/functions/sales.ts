import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  // Verify authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await getAuthenticatedUser(authHeader, supabase);
  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: { message: 'Unauthorized' }
      })
    };
  }

  const userId = user.id;

  try {
    if (event.httpMethod === 'GET') {
      // Get all sales for the user with customer names
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers!inner(name)
        `)
        .eq('user_id', userId)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      // Transform the data to include customer_name
      const salesWithCustomers = sales.map(sale => ({
        ...sale,
        customer_name: sale.customers?.name || 'Unknown Customer'
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: salesWithCustomers
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new sale
      const body = JSON.parse(event.body || '{}');
      const { customer_id, sale_date, dozen_count, individual_count, total_amount, notes } = body;

      // Validation
      if (!customer_id || !sale_date || total_amount === undefined) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Customer ID, sale date, and total amount are required' }
          })
        };
      }

      if (total_amount < 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Total amount cannot be negative' }
          })
        };
      }

      if ((dozen_count || 0) < 0 || (individual_count || 0) < 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Egg counts cannot be negative' }
          })
        };
      }

      // Verify customer belongs to user
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', customer_id)
        .eq('user_id', userId)
        .single();

      if (customerError || !customer) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Invalid customer ID' }
          })
        };
      }

      const { data, error } = await supabase
        .from('sales')
        .insert([{
          user_id: userId,
          customer_id,
          sale_date,
          dozen_count: dozen_count || 0,
          individual_count: individual_count || 0,
          total_amount,
          notes: notes?.trim() || null
        }])
        .select(`
          *,
          customers!inner(name)
        `)
        .single();

      if (error) throw error;

      // Transform the response to include customer_name
      const saleWithCustomer = {
        ...data,
        customer_name: data.customers?.name || 'Unknown Customer'
      };

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: saleWithCustomer
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update sale
      const body = JSON.parse(event.body || '{}');
      const { id, customer_id, sale_date, dozen_count, individual_count, total_amount, notes } = body;

      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Sale ID is required' }
          })
        };
      }

      // Validation
      if (total_amount !== undefined && total_amount < 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Total amount cannot be negative' }
          })
        };
      }

      if ((dozen_count !== undefined && dozen_count < 0) || (individual_count !== undefined && individual_count < 0)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Egg counts cannot be negative' }
          })
        };
      }

      // If customer_id is being updated, verify it belongs to user
      if (customer_id) {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', customer_id)
          .eq('user_id', userId)
          .single();

        if (customerError || !customer) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            success: false,
            error: { message: 'Invalid customer ID' }
          })
          };
        }
      }

      const updateData: Record<string, unknown> = {};
      if (customer_id !== undefined) updateData.customer_id = customer_id;
      if (sale_date !== undefined) updateData.sale_date = sale_date;
      if (dozen_count !== undefined) updateData.dozen_count = dozen_count;
      if (individual_count !== undefined) updateData.individual_count = individual_count;
      if (total_amount !== undefined) updateData.total_amount = total_amount;
      if (notes !== undefined) updateData.notes = notes?.trim() || null;

      const { data, error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select(`
          *,
          customers!inner(name)
        `)
        .single();

      if (error) throw error;

      if (!data) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Sale not found' }
          })
        };
      }

      // Transform the response to include customer_name
      const saleWithCustomer = {
        ...data,
        customer_name: data.customers?.name || 'Unknown Customer'
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: saleWithCustomer
        })
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete sale
      const body = JSON.parse(event.body || '{}');
      const { id } = body;

      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Sale ID is required' }
          })
        };
      }

      const { data, error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: { message: 'Sale not found' }
          })
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: { success: true }
        })
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: { message: 'Method not allowed' }
      })
    };
  } catch (error) {
    console.error('Sales API error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: { message: 'Internal server error' }
      })
    };
  }
};
