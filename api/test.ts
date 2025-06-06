import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Very simple test
    res.status(200).json({
      message: 'Test endpoint working - ES modules fixed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      nodeVersion: process.version,
      environment: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      message: 'Test endpoint failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
