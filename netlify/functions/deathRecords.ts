import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;


if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from JWT token
async function getUserFromToken(event: HandlerEvent) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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

  try {
    // Authenticate user
    const user = await getUserFromToken(event);

    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event, user.id);
      case 'POST':
        return await handlePost(event, user.id);
      case 'PUT':
        return await handlePut(event, user.id);
      case 'DELETE':
        return await handleDelete(event, user.id);
      default:
        return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unauthorized' })
    };
  }
}

// GET - Retrieve death records (optionally filtered by batch)
async function handleGet(event: HandlerEvent, userId: string) {
  try {
    const { batchId } = event.queryStringParameters || {};

    let query = supabase
      .from('death_records')
      .select(`
        *,
        flock_batches!inner(
          id,
          batch_name,
          breed,
          type
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { data: records, error } = await query;

    if (error) {
      throw error;
    }

    // Transform database fields to match TypeScript interface
    const transformedRecords = records?.map(record => ({
      id: record.id,
      batchId: record.batch_id,
      batchName: record.flock_batches?.batch_name,
      breed: record.flock_batches?.breed,
      type: record.flock_batches?.type,
      date: record.date,
      count: record.count,
      cause: record.cause,
      description: record.description,
      notes: record.notes,
      created_at: record.created_at
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, data: { records: transformedRecords } })
    };
  } catch (error) {
    console.error('Error fetching death records:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch death records' })
    };
  }
}

// POST - Create new death record
async function handlePost(event: HandlerEvent, userId: string) {
  try {
    const { batchId, date, count, cause, description, notes } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!batchId || !date || !count || !cause || !description) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Missing required fields' })
    };
    }

    // Validate cause against allowed values
    const validCauses = ['predator', 'disease', 'age', 'injury', 'unknown', 'culled', 'other'];
    if (!validCauses.includes(cause)) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: `Invalid cause value "${cause}". Must be one of: ${validCauses.join(', ')}` 
      })
    };
    }

    if (count <= 0) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Count must be greater than 0' })
    };
    }

    // Verify the batch exists and belongs to the user
    const { data: batch, error: batchError } = await supabase
      .from('flock_batches')
      .select('id, current_count, batch_name')
      .eq('id', batchId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (batchError || !batch) {
      return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Batch not found or access denied' })
    };
    }

    // Check if there are enough birds in the batch
    if (count > batch.current_count) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: `Cannot record ${count} deaths. Batch "${batch.batch_name}" only has ${batch.current_count} birds remaining.` 
      })
    };
    }

    // Create the death record (trigger will automatically update batch count)
    const { data: record, error } = await supabase
      .from('death_records')
      .insert({
        user_id: userId,
        batch_id: batchId,
        date,
        count,
        cause,
        description,
        notes
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Get the batch info for the response
    const { data: batchInfo, error: batchInfoError } = await supabase
      .from('flock_batches')
      .select('id, batch_name, breed, type')
      .eq('id', batchId)
      .single();

    if (batchInfoError) {
      throw batchInfoError;
    }

    // Create automatic "Gone but not forgotten" timeline event
    console.log('Creating flock loss timeline event for death record:', record.id);
    
    const { error: eventError } = await supabase
      .from('batch_events')
      .insert({
        user_id: userId,
        batch_id: batchId,
        date: date,
        type: 'flock_loss',
        description: 'Gone but not forgotten',
        affected_count: count,
        notes: `${count} bird(s) lost due to ${cause}: ${description}${notes ? ` - ${notes}` : ''}`
      });

    if (eventError) {
      console.error('Failed to create flock loss timeline event:', eventError);
      // Don't fail the death record creation if event creation fails
      // Just log the error and continue
    } else {
      console.log('Flock loss timeline event created successfully');
    }

    // Transform response
    const transformedRecord = {
      id: record.id,
      batchId: record.batch_id,
      batchName: batchInfo?.batch_name,
      breed: batchInfo?.breed,
      type: batchInfo?.type,
      date: record.date,
      count: record.count,
      cause: record.cause,
      description: record.description,
      notes: record.notes,
      created_at: record.created_at
    };

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, data: { record: transformedRecord } })
    };
  } catch (error) {
    console.error('Error creating death record:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to create death record' })
    };
  }
}

// PUT - Update existing death record
async function handlePut(event: HandlerEvent, userId: string) {
  try {
    const { recordId, ...updateData } = JSON.parse(event.body || '{}');

    if (!recordId) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Record ID is required' })
    };
    }

    // Get the existing record to calculate count difference
    const { data: existingRecord, error: fetchError } = await supabase
      .from('death_records')
      .select('*, flock_batches!inner(current_count, batch_name)')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingRecord) {
      return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Record not found or access denied' })
    };
    }

    // If count is being updated, check if the batch has enough birds
    if (updateData.count && updateData.count !== existingRecord.count) {
      const countDifference = updateData.count - existingRecord.count;
      const currentBatchCount = existingRecord.flock_batches.current_count;
      
      if (countDifference > currentBatchCount) {
        return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
          error: `Cannot update death count. Batch "${existingRecord.flock_batches.batch_name}" only has ${currentBatchCount} birds remaining.` 
        })
    };
      }
    }

    // Update the record
    const { data: record, error } = await supabase
      .from('death_records')
      .update({
        date: updateData.date || existingRecord.date,
        count: updateData.count || existingRecord.count,
        cause: updateData.cause || existingRecord.cause,
        description: updateData.description || existingRecord.description,
        notes: updateData.notes !== undefined ? updateData.notes : existingRecord.notes
      })
      .eq('id', recordId)
      .eq('user_id', userId)
      .select(`
        *,
        flock_batches!inner(
          id,
          batch_name,
          breed,
          type
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Manually adjust batch count if count changed (since trigger only handles inserts)
    if (updateData.count && updateData.count !== existingRecord.count) {
      const countDifference = updateData.count - existingRecord.count;
      
      const { error: updateError } = await supabase
        .from('flock_batches')
        .update({ 
          current_count: existingRecord.flock_batches.current_count - countDifference,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.batch_id);

      if (updateError) {
        console.error('Error updating batch count:', updateError);
      }
    }

    // Transform response
    const transformedRecord = {
      id: record.id,
      batchId: record.batch_id,
      batchName: record.flock_batches?.batch_name,
      breed: record.flock_batches?.breed,
      type: record.flock_batches?.type,
      date: record.date,
      count: record.count,
      cause: record.cause,
      description: record.description,
      notes: record.notes,
      created_at: record.created_at
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, data: { record: transformedRecord } })
    };
  } catch (error) {
    console.error('Error updating death record:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to update death record' })
    };
  }
}

// DELETE - Remove death record
async function handleDelete(event: HandlerEvent, userId: string) {
  try {
    const { recordId } = JSON.parse(event.body || '{}');

    if (!recordId) {
      return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Record ID is required' })
    };
    }

    // The trigger will automatically adjust the batch count when the record is deleted
    const { error } = await supabase
      .from('death_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, message: 'Death record deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting death record:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to delete death record' })
    };
  }
}