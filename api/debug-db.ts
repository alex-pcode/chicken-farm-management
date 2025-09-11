import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment check:');
    console.log('SUPABASE_URL:', supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
    console.log('Service key length:', supabaseServiceKey?.length);
    
    // Test 1: Simple query to check database connection
    console.log('Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'flock_batches')
      .limit(1);

    console.log('Connection test result:', connectionTest);
    console.log('Connection error:', connectionError);

    // Test 2: List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    console.log('Tables query result:', tables);
    console.log('Tables error:', tablesError);

    // Test 3: Try direct flock_batches query
    const { data: batchTest, error: batchError } = await supabase
      .from('flock_batches')
      .select('id, batch_name')
      .limit(1);

    console.log('Flock batches test result:', batchTest);
    console.log('Flock batches error:', batchError);

    // Test 4: Try the exact failing query with real batch ID
    const realBatchId = batchTest?.[0]?.id;
    let failingQueryTest = null;
    let failingQueryError = null;
    
    if (realBatchId) {
      console.log('Testing failing query with batch ID:', realBatchId);
      const result = await supabase
        .from('flock_batches')
        .select('id, current_count, batch_name')
        .eq('id', realBatchId)
        .eq('is_active', true)
        .single();
      
      failingQueryTest = result.data;
      failingQueryError = result.error;
      console.log('Failing query test result:', failingQueryTest);
      console.log('Failing query error:', failingQueryError);
    }

    // Test 5: Try inserting a death record directly
    console.log('Testing direct death record insert...');
    let insertTest = null;
    let insertError = null;
    
    try {
      const result = await supabase
        .from('death_records')
        .insert({
          user_id: '50baaf75-e955-40a7-b86d-05080e7aa4b1', // Your user ID from logs
          batch_id: realBatchId,
          date: '2025-01-09',
          count: 1,
          cause: 'test',
          description: 'Test death record',
          notes: 'This is a test'
        })
        .select('*')
        .single();
      
      insertTest = result.data;
      insertError = result.error;
      console.log('Insert test result:', insertTest);
      console.log('Insert test error:', insertError);
      
      // Clean up test record if successful
      if (result.data && !result.error) {
        await supabase
          .from('death_records')
          .delete()
          .eq('id', result.data.id);
        console.log('Test record cleaned up');
      }
    } catch (error) {
      console.log('Insert test catch error:', error);
      insertError = error;
    }

    return res.status(200).json({
      environment: {
        supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        serviceKeyLength: supabaseServiceKey?.length
      },
      connectionTest: {
        data: connectionTest,
        error: connectionError
      },
      tablesTest: {
        data: tables,
        error: tablesError
      },
      batchTest: {
        data: batchTest,
        error: batchError
      },
      failingQueryTest: {
        data: failingQueryTest,
        error: failingQueryError
      },
      insertTest: {
        data: insertTest,
        error: insertError
      }
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}