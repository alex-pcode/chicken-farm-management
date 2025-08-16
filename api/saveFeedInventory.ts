import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

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
    console.log('Received feed inventory data:', JSON.stringify(feedData, null, 2));

    // Map frontend fields to database fields and add user_id
    const mappedFeedData = Array.isArray(feedData) ? feedData.map(item => {
      const mapped = {
        user_id: user.id,
        name: item.brand, // Map 'brand' to 'name'
        quantity: item.quantity,
        unit: item.unit,
        cost_per_unit: item.pricePerUnit, // Map 'pricePerUnit' to 'cost_per_unit'
        purchase_date: item.openedDate, // Map 'openedDate' to 'purchase_date'
        expiry_date: item.depletedDate, // Map 'depletedDate' to 'expiry_date'
        updated_at: item.updatedAt || new Date().toISOString()
      };
      
      // Only include ID if it exists (for updates)
      if (item.id) {
        mapped.id = item.id;
      }
      
      // Include created_at if it exists (preserve original timestamp)
      if (item.createdAt) {
        mapped.created_at = item.createdAt;
      }
      
      return mapped;
    }) : [{
      user_id: user.id,
      name: feedData.brand,
      quantity: feedData.quantity,
      unit: feedData.unit,
      cost_per_unit: feedData.pricePerUnit,
      purchase_date: feedData.openedDate,
      expiry_date: feedData.depletedDate,
      updated_at: feedData.updatedAt || new Date().toISOString(),
      ...(feedData.id && { id: feedData.id }), // Only include ID if it exists
      ...(feedData.createdAt && { created_at: feedData.createdAt })
    }];

    // Use UPSERT to update existing entries or insert new ones
    let data = null;
    if (mappedFeedData.length > 0) {
      console.log('Mapped feed data for UPSERT:', JSON.stringify(mappedFeedData, null, 2));
      
      const { data: upsertData, error: upsertError } = await supabase
        .from('feed_inventory')
        .upsert(mappedFeedData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select(); // Add select to return the inserted/updated data

      if (upsertError) {
        console.error('UPSERT Error:', upsertError);
        throw new Error(`Database upsert error: ${upsertError.message}`);
      }
      
      console.log('UPSERT Result:', upsertData);
      data = upsertData;
    }

    console.log('Feed inventory upserted in Supabase:', data);

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
