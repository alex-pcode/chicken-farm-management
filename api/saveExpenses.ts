import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmohmazolvilxpxhfjie.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhweGhmanllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTQwNTIsImV4cCI6MjA1MDE3MDA1Mn0.rqGHJQgaXeRWZO8YdxC0VW_F5Yxgp3xIjC4tWnuwUhw';

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
    const expenseData = req.body;
    console.log('Received expense data:', expenseData);
    
    // Clear existing expenses and insert new ones
    await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new expenses
    const { data, error } = await supabase
      .from('expenses')
      .insert(
        expenseData.map((expense: any) => ({
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount
        }))
      )
      .select();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }
    
    console.log('Expenses saved to Supabase:', data);
    
    res.status(200).json({ 
      message: 'Expenses saved successfully', 
      data: { expenses: data },
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
