import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  }  try {
    const entries = req.body;
    console.log('Received egg entries:', entries);
    
    // Clear existing entries and insert new ones
    await supabase.from('egg_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new entries
    const { data, error } = await supabase
      .from('egg_entries')
      .insert(
        entries.map((entry: any) => ({
          date: entry.date,
          count: entry.count
        }))
      )
      .select();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }
    
    console.log('Egg entries saved to Supabase:', data);
    
    res.status(200).json({ 
      message: 'Egg entries saved successfully', 
      data: { eggEntries: data },
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
