import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmohmazolvilxpxhfjie.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhweGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNzUsImV4cCI6MjA2NDgwOTE3NX0.b-biGmoVFvMW9vF6YN2fomyh3kzEGdhQCZ69jdmH7G8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }  try {
    const feedData = req.body;
    console.log('Received feed inventory data:', feedData);
    
    // Clear existing inventory and insert new items
    await supabase.from('feed_inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new inventory items
    const { data, error } = await supabase
      .from('feed_inventory')
      .insert(
        feedData.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          cost_per_unit: item.costPerUnit,
          purchase_date: item.purchaseDate,
          expiry_date: item.expiryDate
        }))
      )
      .select();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }
    
    console.log('Feed inventory saved to Supabase:', data);
    
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
