import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient, type User } from '@supabase/supabase-js';
import type { 
  EggEntry, 
  Expense, 
  FeedEntry, 
  FlockEvent, 
  FlockProfile 
} from '../../src/types/index';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user from authorization header
async function getAuthenticatedUser(authHeader: string | undefined) {
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Enable CORS
  

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  if (!['POST', 'DELETE'].includes(event.httpMethod || '')) {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(event.headers.authorization || event.headers.Authorization);
    if (!user) {
      return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Unauthorized - Please log in' })
    };
    }

    // Set the user session on the Supabase client for RLS policies
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      });
    }

    const operation = event.queryStringParameters?.operation;
    const table = event.queryStringParameters?.table;

    if (event.httpMethod === 'POST') {
      return await handleSave(user, operation as string, table as string, JSON.parse(event.body || '{}'));
    } else if (event.httpMethod === 'DELETE') {
      return await handleDelete(user, operation as string, table as string, JSON.parse(event.body || '{}'));
    }

    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Invalid request method' })
    };
  } catch (error) {
    console.error('Error in CRUD endpoint:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error processing request',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

// Handle save operations (create/update)
async function handleSave(user: User, operation: string, _table: string, body: unknown) {
  switch (operation) {
    case 'eggs':
    case 'eggEntries':
      return await saveEggEntries(user, body as EggEntry | EggEntry[]);
    case 'expenses':
      return await saveExpenses(user, body as Expense | Expense[]);
    case 'feed':
    case 'feedInventory':
      return await saveFeedInventory(user, body as FeedEntry | FeedEntry[]);
    case 'flockEvents':
      return await saveFlockEvents(user, body as FlockEvent | FlockEvent[]);
    case 'flockProfile':
      return await saveFlockProfile(user, body as FlockProfile);
    case 'userProfile':
      return await saveUserProfile(user, body as {
        profile: {
          onboarding_completed?: boolean;
          onboarding_step?: string;
          setup_progress?: Record<string, unknown>;
          subscription_status?: string;
        }
      });
    case 'completeOnboarding':
      return await completeOnboarding(user, body as {
        formData: {
          hasChickens?: boolean;
          henCount?: number;
          roosterCount?: number;
          chickCount?: number;
          broodingCount?: number;
          breed?: string;
          acquisitionDate?: string;
          batchName?: string;
          cost?: number;
          [key: string]: unknown;
        }
      });
    default:
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Invalid operation' })
    };
  }
}

// Handle delete operations
async function handleDelete(user: User, operation: string, _table: string, body: { id: string }) {
  const { id } = body;
  if (!id) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'ID is required for delete operations' })
    };
  }

  switch (operation) {
    case 'eggs':
    case 'eggEntries':
      return await deleteEggEntry(user, id);
    case 'expenses':
      return await deleteExpense(user, id);
    case 'feed':
    case 'feedInventory':
      return await deleteFeedInventory(user, id);
    case 'flockEvents':
      return await deleteFlockEvent(user, id);
    default:
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Invalid delete operation' })
    };
  }
}

// Helper function to check if an ID is a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Save egg entries
async function saveEggEntries(user: User, eggData: EggEntry | EggEntry[]) {
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Egg entries saved successfully',
      data: { eggEntries: data },
      timestamp: new Date().toISOString()
    })
  };
}

// Save expenses
async function saveExpenses(user: User, expenseData: Expense | Expense[]) {
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Expenses saved successfully',
      data: { expenses: data },
      timestamp: new Date().toISOString()
    })
  };
}

// Save feed inventory
async function saveFeedInventory(user: User, feedData: FeedEntry | FeedEntry[]) {
  const feedWithUser = Array.isArray(feedData) 
    ? feedData.map(feed => {
        const mapped: {
          user_id: string;
          name: string;
          quantity: number;
          unit: string;
          total_cost: number;
          purchase_date: string;
          expiry_date?: string;
          id?: string;
        } = {
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Feed inventory saved successfully',
      data: { feedInventory: data },
      timestamp: new Date().toISOString()
    })
  };
}

// Save flock events
async function saveFlockEvents(user: User, eventData: FlockEvent | FlockEvent[]) {
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Flock events saved successfully',
      data: { flockEvents: data },
      timestamp: new Date().toISOString()
    })
  };
}

// Save flock profile
async function saveFlockProfile(user: User, profileData: FlockProfile) {
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Flock profile saved successfully',
      data: { flockProfile: data?.[0] },
      timestamp: new Date().toISOString()
    })
  };
}

// Delete expense
async function deleteExpense(user: User, id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Expense deleted successfully',
      timestamp: new Date().toISOString()
    })
  };
}

// Delete feed inventory
async function deleteFeedInventory(user: User, id: string) {
  const { error } = await supabase
    .from('feed_inventory')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Feed inventory item deleted successfully',
      timestamp: new Date().toISOString()
    })
  };
}

// Delete flock event
async function deleteFlockEvent(user: User, id: string) {
  const { error } = await supabase
    .from('flock_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Flock event deleted successfully',
      timestamp: new Date().toISOString()
    })
  };
}

// Delete egg entry
async function deleteEggEntry(user: User, id: string) {
  const { error } = await supabase
    .from('egg_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Database delete error: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Egg entry deleted successfully',
      timestamp: new Date().toISOString()
    })
  };
}

// Save user profile (create or update)
async function saveUserProfile(user: User, profileData: {
  profile: {
    onboarding_completed?: boolean;
    onboarding_step?: string;
    setup_progress?: Record<string, unknown>;
    subscription_status?: string;
  }
}) {
  const { profile } = profileData;
  
  if (!profile) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Profile data is required' })
    };
  }

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const updateData: {
      updated_at: string;
      onboarding_completed?: boolean;
      onboarding_step?: string;
      setup_progress?: Record<string, unknown>;
      subscription_status?: string;
    } = {
      updated_at: new Date().toISOString()
    };

    if (profile.onboarding_completed !== undefined) {
      updateData.onboarding_completed = profile.onboarding_completed;
    }
    if (profile.onboarding_step !== undefined) {
      updateData.onboarding_step = profile.onboarding_step;
    }
    if (profile.setup_progress !== undefined) {
      updateData.setup_progress = profile.setup_progress;
    }
    if (profile.subscription_status !== undefined) {
      updateData.subscription_status = profile.subscription_status;
    }

    let data, error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new profile
      const createData = {
        user_id: user.id,
        onboarding_completed: profile.onboarding_completed || false,
        onboarding_step: profile.onboarding_step || 'welcome',
        setup_progress: profile.setup_progress || {
          hasFlockProfile: false,
          hasRecordedProduction: false,
          hasRecordedExpense: false,
          hasCustomer: false,
          hasSale: false,
          hasMultipleBatches: false,
          hasFeedTracking: false
        },
        subscription_status: profile.subscription_status || 'free',
        ...updateData
      };

      const result = await supabase
        .from('user_profiles')
        .insert(createData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'User profile saved successfully',
        data: { profile: data },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Save user profile error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Failed to save user profile',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

// Complete onboarding with flock creation
async function completeOnboarding(user: User, requestData: {
  formData: {
    hasChickens?: boolean;
    henCount?: number;
    roosterCount?: number;
    chickCount?: number;
    broodingCount?: number;
    breed?: string;
    acquisitionDate?: string;
    batchName?: string;
    cost?: number;
    [key: string]: unknown;
  }
}) {
  const { formData } = requestData;
  
  if (!formData) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Form data is required' })
    };
  }

  try {
    console.log('Starting onboarding completion for user:', user.id);
    let flockCreated = false;

    // If user has chickens, use the existing flock batch API
    if (formData.hasChickens) {
      console.log('User has chickens, creating flock profile and batch via batch API');
      const totalCount = (formData.henCount || 0) + (formData.roosterCount || 0) + (formData.chickCount || 0) + (formData.broodingCount || 0);
      
      if (totalCount > 0) {
        // Generate simple UUID alternative to avoid import issues
        const generateId = () => crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        
        // Create flock profile first
        const flockProfileData = {
          id: generateId(),
          user_id: user.id,
          farm_name: 'My Chicken Farm',
          location: '',
          flock_size: totalCount,
          breed: formData.breed,
          start_date: formData.acquisitionDate,
          hens: formData.henCount,
          roosters: formData.roosterCount,
          chicks: formData.chickCount,
          brooding: formData.broodingCount || 0,
          notes: 'Created during onboarding'
        };

        console.log('Creating flock profile:', flockProfileData);
        const { error: flockError } = await supabase
          .from('flock_profiles')
          .insert(flockProfileData);

        if (flockError) {
          console.error('Flock profile creation failed:', flockError);
          throw flockError;
        }
        console.log('Flock profile created successfully');

        // Create batch using the same logic as the Add New Batch API
        const batchId = generateId();
        const batchData = {
          id: batchId,
          user_id: user.id,
          batch_name: formData.batchName || 'Initial Flock',
          breed: formData.breed,
          acquisition_date: formData.acquisitionDate,
          initial_count: totalCount,
          current_count: totalCount,
          hens_count: formData.henCount,
          roosters_count: formData.roosterCount,
          chicks_count: formData.chickCount,
          brooding_count: formData.broodingCount || 0,
          type: totalCount === formData.henCount ? 'hens' : 
                totalCount === formData.roosterCount ? 'roosters' : 
                totalCount === formData.chickCount ? 'chicks' : 'mixed',
          age_at_acquisition: formData.ageAtAcquisition || 'adult',
          source: formData.source || 'onboarding',
          cost: formData.cost || 0.00,
          notes: formData.notes || 'Initial batch created during onboarding',
          is_active: true
        };

        console.log('Creating flock batch:', batchData);
        const { data: batch, error: batchError } = await supabase
          .from('flock_batches')
          .insert(batchData)
          .select()
          .single();

        if (batchError) {
          console.error('Flock batch creation failed:', batchError);
          throw batchError;
        }
        console.log('Flock batch created successfully');

        // Create the "flock_added" batch event just like the Add New Batch API does
        console.log('Creating initial timeline event for batch:', batch.id);
        const { error: eventError } = await supabase
          .from('batch_events')
          .insert({
            user_id: user.id,
            batch_id: batch.id,
            date: formData.acquisitionDate,
            type: 'flock_added',
            description: 'Welcome to the Coop!',
            affected_count: totalCount,
            notes: `Initial batch creation: ${totalCount} ${batchData.type} acquired from ${batchData.source}`
          });

        if (eventError) {
          console.error('Failed to create initial timeline event:', eventError);
          // Don't fail the onboarding if event creation fails, just log the error
        } else {
          console.log('Initial "Welcome to the Coop!" timeline event created successfully');
        }

        // Create expense entry if cost is provided
        if (formData.cost && formData.cost > 0) {
          console.log('Creating expense entry for batch cost:', formData.cost);
          const { error: expenseError } = await supabase
            .from('expenses')
            .insert({
              user_id: user.id,
              date: formData.acquisitionDate,
              category: 'Birds',
              description: `Batch acquisition: ${batchData.batch_name} (${totalCount} ${batchData.type})`,
              amount: formData.cost
            });

          if (expenseError) {
            console.error('Failed to create expense entry:', expenseError);
            // Don't fail the onboarding if expense creation fails
          } else {
            console.log('Expense entry created successfully for batch cost');
          }
        }

        flockCreated = true;
      }
    }

    // Update user profile to mark onboarding as complete
    const profileData = {
      user_id: user.id,
      onboarding_completed: true,
      onboarding_step: 'complete',
      setup_progress: {
        hasFlockProfile: flockCreated,
        hasRecordedProduction: false,
        hasRecordedExpense: false,
        hasCustomer: false,
        hasSale: false,
        hasMultipleBatches: false,
        hasFeedTracking: false
      },
      updated_at: new Date().toISOString()
    };

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If there was an error checking for profile (not just "not found"), throw it
    if (profileCheckError) {
      throw profileCheckError;
    }

    let profileResult;

    console.log('Profile data to save:', profileData);
    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile');
      profileResult = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Create new profile
      console.log('Creating new profile');
      profileResult = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
    }

    if (profileResult.error) {
      throw profileResult.error;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Onboarding completed successfully',
        data: {
          profile: profileResult.data,
          flockCreated
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Complete onboarding error:', error);

    // Handle Supabase errors properly
    let errorMessage = 'Unknown error occurred';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Failed to complete onboarding',
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
    };
  }
}

