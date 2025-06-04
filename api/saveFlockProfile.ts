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
    const flockData = req.body;
    console.log('Received flock data:', flockData);
    
    // Save to Vercel KV (Redis)
    await kv.set('flockProfile', flockData);
    await kv.set('flockProfile:lastUpdated', new Date().toISOString());
    
    console.log('Flock profile saved to KV database');
    
    res.status(200).json({ 
      message: 'Flock profile saved successfully', 
      data: { flockProfile: flockData },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving flock profile:', error);
    res.status(500).json({ 
      message: 'Error saving flock profile', 
      error: error.message,
      stack: error.stack 
    });
  }
}
