import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to create consistent CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
} as const;

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
} as const;

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

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Verify authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await getAuthenticatedUser(authHeader, supabase);
  if (!user) {
    return {
      statusCode: 401,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const userId = user.id;

  try {
    if (event.httpMethod === 'GET') {
      // Get all customers for the user
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: customers
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new customer
      const body = JSON.parse(event.body || '{}');
      const { name, phone, notes } = body;

      if (!name || name.trim() === '') {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Customer name is required' })
        };
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          user_id: userId,
          name: name.trim(),
          phone: phone?.trim() || null,
          notes: notes?.trim() || null
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 201,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: data
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update customer
      const body = JSON.parse(event.body || '{}');
      const { id, name, phone, notes, is_active } = body;

      if (!id) {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Customer ID is required' })
        };
      }

      if (!name || name.trim() === '') {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Customer name is required' })
        };
      }

      const { data, error } = await supabase
        .from('customers')
        .update({
          name: name.trim(),
          phone: phone?.trim() || null,
          notes: notes?.trim() || null,
          is_active: is_active !== undefined ? is_active : true
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return {
          statusCode: 404,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Customer not found' })
        };
      }

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: data
        })
      };
    }

    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Customer API error:', error);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
