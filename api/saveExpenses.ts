import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    // Set the user session on the Supabase client for RLS policies
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // Not needed for API operations
      });
    }

    const expenseData = req.body;
    console.log('Received expense data:', expenseData);

    // Add user_id to expense data, only include id if it exists
    const expenseWithUser = Array.isArray(expenseData) 
      ? expenseData.map(expense => {
          const mapped: any = { 
            user_id: user.id,
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
            description: expense.description
          };
          // Only include ID if it exists (for updates)
          if (expense.id) {
            mapped.id = expense.id;
          }
          // Include created_at if it exists (preserve original timestamp)
          if (expense.created_at) {
            mapped.created_at = expense.created_at;
          }
          return mapped;
        })
      : {
          user_id: user.id,
          category: expenseData.category,
          amount: expenseData.amount,
          date: expenseData.date,
          description: expenseData.description,
          ...(expenseData.id && { id: expenseData.id }),
          ...(expenseData.created_at && { created_at: expenseData.created_at })
        };

    // Upsert expenses by id
    const { data, error } = await supabase
      .from('expenses')
      .upsert(expenseWithUser, { onConflict: 'id' })
      .select(); // Add select to return the inserted/updated data

    if (error) {
      throw new Error(`Database upsert error: ${error.message}`);
    }

    console.log('Expenses upserted to Supabase:', data);

    res.status(200).json({ 
      message: 'Expenses saved successfully', 
      data: { expenses: data },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving expenses:', error);
    res.status(500).json({ 
      message: 'Error saving expenses',     error: error.message,
      stack: error.stack 
    });
  }
}
