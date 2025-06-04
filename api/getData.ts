import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all data from KV store
    const [flockProfile, eggEntries, feedInventory, expenses] = await Promise.all([
      kv.get('flockProfile'),
      kv.get('eggEntries'),
      kv.get('feedInventory'),
      kv.get('expenses')
    ]);

    const data = {
      flockProfile: flockProfile || {},
      eggEntries: eggEntries || [],
      feedInventory: feedInventory || {},
      expenses: expenses || []
    };

    console.log('Data retrieved from KV database');
    
    res.status(200).json({ 
      message: 'Data retrieved successfully', 
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ 
      message: 'Error retrieving data', 
      error: error.message,
      stack: error.stack 
    });
  }
}
