import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const feedData = req.body;
    console.log('Received feed inventory data:', feedData);

    // Map frontend fields to database fields and add user_id
    const mappedFeedData = Array.isArray(feedData) ? feedData.map(item => ({
      id: item.id,
      user_id: user.id,
      name: item.brand, // Map 'brand' to 'name'
      quantity: item.quantity,
      unit: item.unit,
      cost_per_unit: item.pricePerUnit, // Map 'pricePerUnit' to 'cost_per_unit'
      purchase_date: item.openedDate, // Map 'openedDate' to 'purchase_date'
      expiry_date: item.depletedDate, // Map 'depletedDate' to 'expiry_date'
      // Note: type and batch_number are not stored in current schema
      created_at: item.createdAt,
      updated_at: item.updatedAt || new Date().toISOString()
    })) : [{
      id: feedData.id,
      name: feedData.brand,
      quantity: feedData.quantity,
      unit: feedData.unit,
      cost_per_unit: feedData.pricePerUnit,
      purchase_date: feedData.openedDate,
      expiry_date: feedData.depletedDate,
      created_at: feedData.createdAt,
      updated_at: feedData.updatedAt || new Date().toISOString()
    }];

    // Upsert feed inventory items by id
    const { data, error } = await supabase
      .from('feed_inventory')
      .upsert(mappedFeedData, { onConflict: 'id' });

    if (error) {
      throw new Error(`Database upsert error: ${error.message}`);
    }

    console.log('Feed inventory upserted to Supabase:', data);

    res.status(200).json({ 
      message: 'Feed inventory saved successfully', 
      data: { feedInventory: data },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving feed inventory:', error);
    res.status(500).json({ 
      message: 'Error saving feed inventory', 
      error: error.message,    stack: error.stack 
    });
  }
}

export default handler;
