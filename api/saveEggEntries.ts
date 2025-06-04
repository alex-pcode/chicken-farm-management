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
    const entries = req.body;
    console.log('Received egg entries:', entries);
    
    // Save to Vercel KV (Redis)
    await kv.set('eggEntries', entries);
    await kv.set('eggEntries:lastUpdated', new Date().toISOString());
    
    console.log('Egg entries saved to KV database');
    
    res.status(200).json({ 
      message: 'Egg entries saved successfully', 
      data: { eggEntries: entries },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving egg entries:', error);
    res.status(500).json({ 
      message: 'Error saving egg entries', 
      error: error.message,
      stack: error.stack 
    });
  }
}
