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
    const expenseData = req.body;
    console.log('Received expense data:', expenseData);
    
    // Save to Vercel KV (Redis)
    await kv.set('expenses', expenseData);
    await kv.set('expenses:lastUpdated', new Date().toISOString());
    
    console.log('Expenses saved to KV database');
    
    res.status(200).json({ 
      message: 'Expenses saved successfully', 
      data: { expenses: expenseData },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving expenses:', error);
    res.status(500).json({ 
      message: 'Error saving expenses', 
      error: error.message,
      stack: error.stack 
    });
  }
}
