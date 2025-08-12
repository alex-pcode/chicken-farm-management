import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from JWT token
async function getUserFromToken(req: VercelRequest) {
  const authHeader = req.headers.authorization;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Authenticate user
    const user = await getUserFromToken(req);

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user.id);
      case 'POST':
        return await handlePost(req, res, user.id);
      case 'PUT':
        return await handlePut(req, res, user.id);
      case 'DELETE':
        return await handleDelete(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Unauthorized' });
  }
}

// GET - Retrieve death records (optionally filtered by batch)
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { batchId } = req.query;

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

    return res.status(200).json({ success: true, data: { records: transformedRecords } });
  } catch (error) {
    console.error('Error fetching death records:', error);
    return res.status(500).json({ error: 'Failed to fetch death records' });
  }
}

// POST - Create new death record
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { batchId, date, count, cause, description, notes } = req.body;

    // Validate required fields
    if (!batchId || !date || !count || !cause || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (count <= 0) {
      return res.status(400).json({ error: 'Count must be greater than 0' });
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
      return res.status(404).json({ error: 'Batch not found or access denied' });
    }

    // Check if there are enough birds in the batch
    if (count > batch.current_count) {
      return res.status(400).json({ 
        error: `Cannot record ${count} deaths. Batch "${batch.batch_name}" only has ${batch.current_count} birds remaining.` 
      });
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

    return res.status(201).json({ success: true, data: { record: transformedRecord } });
  } catch (error) {
    console.error('Error creating death record:', error);
    return res.status(500).json({ error: 'Failed to create death record' });
  }
}

// PUT - Update existing death record
async function handlePut(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { recordId, ...updateData } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    // Get the existing record to calculate count difference
    const { data: existingRecord, error: fetchError } = await supabase
      .from('death_records')
      .select('*, flock_batches!inner(current_count, batch_name)')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingRecord) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    // If count is being updated, check if the batch has enough birds
    if (updateData.count && updateData.count !== existingRecord.count) {
      const countDifference = updateData.count - existingRecord.count;
      const currentBatchCount = existingRecord.flock_batches.current_count;
      
      if (countDifference > currentBatchCount) {
        return res.status(400).json({ 
          error: `Cannot update death count. Batch "${existingRecord.flock_batches.batch_name}" only has ${currentBatchCount} birds remaining.` 
        });
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

    return res.status(200).json({ success: true, data: { record: transformedRecord } });
  } catch (error) {
    console.error('Error updating death record:', error);
    return res.status(500).json({ error: 'Failed to update death record' });
  }
}

// DELETE - Remove death record
async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
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

    return res.status(200).json({ success: true, message: 'Death record deleted successfully' });
  } catch (error) {
    console.error('Error deleting death record:', error);
    return res.status(500).json({ error: 'Failed to delete death record' });
  }
}