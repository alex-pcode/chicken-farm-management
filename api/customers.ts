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
      // Get all customers for the user
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      // Create new customer
      const { name, phone, notes } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Customer name is required' });
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

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      // Update customer
      const { id, name, phone, notes, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Customer name is required' });
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
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Customer API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
