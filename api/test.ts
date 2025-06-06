import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const envCheck = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('VITE')
      )
    };

    console.log('Environment debug:', envCheck);

    res.status(200).json({
      message: 'Environment test',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      message: 'Test endpoint error',
      error: error.message
    });
  }
}
