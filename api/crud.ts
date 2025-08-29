import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type User } from '@supabase/supabase-js';
import type { 
  EggEntry, 
  Expense, 
  FeedEntry, 
  FlockEvent, 
  FlockProfile 
} from '../src/types/index';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['POST', 'DELETE'].includes(req.method || '')) {
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
        refresh_token: '',
      });
    }

    const { operation, table } = req.query;

    if (req.method === 'POST') {
      return await handleSave(user, operation as string, table as string, req.body, res);
    } else if (req.method === 'DELETE') {
      return await handleDelete(user, operation as string, table as string, req.body, res);
    }
  } catch (error) {
    console.error('Error in CRUD endpoint:', error);
    res.status(500).json({
      message: 'Error processing request',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Handle save operations (create/update)
async function handleSave(user: User, operation: string, _table: string, body: unknown, res: VercelResponse) {
  switch (operation) {
    case 'eggs':
    case 'eggEntries':
      return await saveEggEntries(user, body as EggEntry | EggEntry[], res);
    case 'expenses':
      return await saveExpenses(user, body as Expense | Expense[], res);
    case 'feed':
    case 'feedInventory':
      return await saveFeedInventory(user, body as FeedEntry | FeedEntry[], res);
    case 'flockEvents':
      return await saveFlockEvents(user, body as FlockEvent | FlockEvent[], res);
    case 'flockProfile':
      return await saveFlockProfile(user, body as FlockProfile, res);
    default:
      return res.status(400).json({ message: 'Invalid operation' });
  }
}

// Handle delete operations
async function handleDelete(user: User, operation: string, _table: string, body: { id: string }, res: VercelResponse) {
  const { id } = body;
  if (!id) {
    return res.status(400).json({ message: 'ID is required for delete operations' });
  }

  switch (operation) {
    case 'eggs':
    case 'eggEntries':
      return await deleteEggEntry(user, id, res);
    case 'expenses':
      return await deleteExpense(user, id, res);
    case 'feed':
    case 'feedInventory':
      return await deleteFeedInventory(user, id, res);
    case 'flockEvents':
      return await deleteFlockEvent(user, id, res);
    default:
      return res.status(400).json({ message: 'Invalid delete operation' });
  }
}

// Helper function to check if an ID is a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Save egg entries
async function saveEggEntries(user: User, eggData: EggEntry | EggEntry[], res: VercelResponse) {
  const eggWithUser = Array.isArray(eggData) 
    ? eggData.map(egg => ({ 
        user_id: user.id,
        date: egg.date,
        count: egg.count,
        ...(egg.size && { size: egg.size }),
        ...(egg.color && { color: egg.color }),
        ...(egg.notes && { notes: egg.notes }),
        ...(egg.id && isValidUUID(egg.id) && { id: egg.id })
      }))
    : {
        user_id: user.id,
        date: eggData.date,
        count: eggData.count,
        ...(eggData.size && { size: eggData.size }),
        ...(eggData.color && { color: eggData.color }),
        ...(eggData.notes && { notes: eggData.notes }),
        ...(eggData.id && isValidUUID(eggData.id) && { id: eggData.id })
      };

  const { data, error } = await supabase
    .from('egg_entries')
    .upsert(eggWithUser, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }

  res.status(200).json({ 
    message: 'Egg entries saved successfully', 
    data: { eggEntries: data },
    timestamp: new Date().toISOString()
  });
}

// Save expenses
async function saveExpenses(user: User, expenseData: Expense | Expense[], res: VercelResponse) {
  const expenseWithUser = Array.isArray(expenseData) 
    ? expenseData.map(expense => {
        const mapped: Partial<Expense & { user_id: string }> = { 
          user_id: user.id,
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          description: expense.description
        };
        if (expense.id && isValidUUID(expense.id)) mapped.id = expense.id;
        if (expense.created_at) mapped.created_at = expense.created_at;
        return mapped;
      })
    : {
        user_id: user.id,
        category: expenseData.category,
        amount: expenseData.amount,
        date: expenseData.date,
        description: expenseData.description,
        ...(expenseData.id && isValidUUID(expenseData.id) && { id: expenseData.id }),
        ...(expenseData.created_at && { created_at: expenseData.created_at })
      };

  const { data, error } = await supabase
    .from('expenses')
    .upsert(expenseWithUser, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }

  res.status(200).json({ 
    message: 'Expenses saved successfully', 
    data: { expenses: data },
    timestamp: new Date().toISOString()
  });
}

// Save feed inventory
async function saveFeedInventory(user: User, feedData: FeedEntry | FeedEntry[], res: VercelResponse) {
  const feedWithUser = Array.isArray(feedData) 
    ? feedData.map(feed => {
        const mapped: Record<string, any> = {
          user_id: user.id,
          name: feed.brand,
          quantity: Number(feed.quantity), // Ensure numeric
          unit: feed.unit || 'lbs',
          total_cost: Number(feed.total_cost), // Ensure numeric
          purchase_date: feed.openedDate
        };
        
        // Only include expiry_date if depletedDate is provided and not null/undefined
        if (feed.depletedDate) {
          mapped.expiry_date = feed.depletedDate;
        }
        
        // Only include id if it's a valid UUID (for updates)
        if (feed.id && isValidUUID(feed.id)) {
          mapped.id = feed.id;
        }
        
        // NOTE: Do NOT include created_at, updated_at, createdAt, updatedAt - these are auto-managed
        
        return mapped;
      })
    : {
        user_id: user.id,
        name: feedData.brand,
        quantity: Number(feedData.quantity), // Ensure numeric
        unit: feedData.unit || 'lbs',
        total_cost: Number(feedData.total_cost), // Ensure numeric
        purchase_date: feedData.openedDate,
        ...(feedData.depletedDate && { expiry_date: feedData.depletedDate }),
        ...(feedData.id && isValidUUID(feedData.id) && { id: feedData.id })
        // NOTE: Do NOT include created_at, updated_at, createdAt, updatedAt - these are auto-managed
        // NOTE: batch_number and type columns don't exist in feed_inventory table
      };

  const { data, error } = await supabase
    .from('feed_inventory')
    .upsert(feedWithUser, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }

  res.status(200).json({ 
    message: 'Feed inventory saved successfully', 
    data: { feedInventory: data },
    timestamp: new Date().toISOString()
  });
}

// Save flock events
async function saveFlockEvents(user: User, eventData: FlockEvent | FlockEvent[], res: VercelResponse) {
  const eventWithUser = Array.isArray(eventData) 
    ? eventData.map(event => ({
        user_id: user.id,
        flock_profile_id: null,
        date: event.date,
        type: event.type,
        description: event.description,
        affected_birds: event.affectedBirds,
        notes: event.notes,
        ...(event.id && isValidUUID(event.id) && { id: event.id })
      }))
    : {
        user_id: user.id,
        flock_profile_id: null,
        date: eventData.date,
        type: eventData.type,
        description: eventData.description,
        affected_birds: eventData.affectedBirds,
        notes: eventData.notes,
        ...(eventData.id && isValidUUID(eventData.id) && { id: eventData.id })
      };

  const { data, error } = await supabase
    .from('flock_events')
    .upsert(eventWithUser, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }

  res.status(200).json({ 
    message: 'Flock events saved successfully', 
    data: { flockEvents: data },
    timestamp: new Date().toISOString()
  });
}

// Save flock profile
async function saveFlockProfile(user: User, profileData: FlockProfile, res: VercelResponse) {
  const profileWithUser = {
    user_id: user.id,
    farm_name: 'Default Farm',
    location: 'Default Location',
    flock_size: profileData.hens + profileData.roosters + profileData.chicks + profileData.brooding,
    breed: Array.isArray(profileData.breedTypes) 
      ? profileData.breedTypes.join(', ') 
      : 'Mixed',
    start_date: profileData.flockStartDate || new Date().toISOString(),
    notes: profileData.notes || '',
    hens: profileData.hens || 0,
    roosters: profileData.roosters || 0,
    chicks: profileData.chicks || 0,
    brooding: profileData.brooding || 0,
    ...(profileData.id && isValidUUID(profileData.id) && { id: profileData.id })
  };

  const { data, error } = await supabase
    .from('flock_profiles')
    .upsert(profileWithUser, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }

  res.status(200).json({ 
    message: 'Flock profile saved successfully', 
    data: { flockProfile: data?.[0] },
    timestamp: new Date().toISOString()
  });
}

// Delete expense
async function deleteExpense(user: User, id: string, res: VercelResponse) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  res.status(200).json({
    message: 'Expense deleted successfully',
    timestamp: new Date().toISOString()
  });
}

// Delete feed inventory
async function deleteFeedInventory(user: User, id: string, res: VercelResponse) {
  const { error } = await supabase
    .from('feed_inventory')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  res.status(200).json({
    message: 'Feed inventory item deleted successfully',
    timestamp: new Date().toISOString()
  });
}

// Delete flock event
async function deleteFlockEvent(user: User, id: string, res: VercelResponse) {
  const { error } = await supabase
    .from('flock_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  res.status(200).json({
    message: 'Flock event deleted successfully',
    timestamp: new Date().toISOString()
  });
}

// Delete egg entry
async function deleteEggEntry(user: User, id: string, res: VercelResponse) {
  const { error } = await supabase
    .from('egg_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  res.status(200).json({
    message: 'Egg entry deleted successfully',
    timestamp: new Date().toISOString()
  });
}