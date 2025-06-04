import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const feedData = req.body;
    console.log('Received feed inventory data:', feedData);
    
    // Save to Vercel KV (Redis)
    await kv.set('feedInventory', feedData);
    await kv.set('feedInventory:lastUpdated', new Date().toISOString());
    
    console.log('Feed inventory saved to KV database');
    
    res.status(200).json({ 
      message: 'Feed inventory saved successfully', 
      data: { feedInventory: feedData },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving feed inventory:', error);
    res.status(500).json({ 
      message: 'Error saving feed inventory', 
      error: error.message,
      stack: error.stack 
    });
  }
}
