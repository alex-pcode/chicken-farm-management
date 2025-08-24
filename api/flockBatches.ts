import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
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

// GET - Retrieve all flock batches for user or a specific batch
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { batchId } = req.query;

    if (batchId) {
      // Get specific batch
      const { data: batch, error } = await supabase
        .from('flock_batches')
        .select('*')
        .eq('id', batchId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Transform single batch
      const transformedBatch = {
        id: batch.id,
        batchName: batch.batch_name,
        breed: batch.breed,
        acquisitionDate: batch.acquisition_date,
        initialCount: batch.initial_count,
        currentCount: batch.current_count,
        type: batch.type,
        ageAtAcquisition: batch.age_at_acquisition,
        expectedLayingStartDate: batch.expected_laying_start_date,
        actualLayingStartDate: batch.actual_laying_start_date,
        source: batch.source,
        cost: batch.cost,
        notes: batch.notes,
        isActive: batch.is_active,
        created_at: batch.created_at,
        updated_at: batch.updated_at,
        hensCount: batch.hens_count,
        roostersCount: batch.roosters_count,
        chicksCount: batch.chicks_count,
        broodingCount: batch.brooding_count
      };

      return res.status(200).json({ success: true, data: { batch: transformedBatch } });
    } else {
      // Get all batches
      const { data: batches, error } = await supabase
        .from('flock_batches')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('acquisition_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform database fields to match TypeScript interface
      const transformedBatches = batches?.map(batch => ({
        id: batch.id,
        batchName: batch.batch_name,
        breed: batch.breed,
        acquisitionDate: batch.acquisition_date,
        initialCount: batch.initial_count,
        currentCount: batch.current_count,
        type: batch.type,
        ageAtAcquisition: batch.age_at_acquisition,
        expectedLayingStartDate: batch.expected_laying_start_date,
        actualLayingStartDate: batch.actual_laying_start_date,
        source: batch.source,
        cost: batch.cost,
        notes: batch.notes,
        isActive: batch.is_active,
        created_at: batch.created_at,
        updated_at: batch.updated_at,
        hensCount: batch.hens_count,
        roostersCount: batch.roosters_count,
        chicksCount: batch.chicks_count,
        broodingCount: batch.brooding_count
      }));

      return res.status(200).json({ success: true, data: { batches: transformedBatches } });
    }
  } catch (error) {
    console.error('Error fetching flock batches:', error);
    return res.status(500).json({ error: 'Failed to fetch flock batches' });
  }
}

// POST - Create new flock batch
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    console.log('POST /api/flockBatches - Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      batchName, 
      breed, 
      acquisitionDate, 
      initialCount, 
      type, 
      ageAtAcquisition, 
      actualLayingStartDate,
      source, 
      cost,
      notes,
      hensCount,
      roostersCount,
      chicksCount
    } = req.body;

    console.log('Extracted fields:', {
      batchName,
      breed,
      acquisitionDate,
      initialCount,
      type,
      ageAtAcquisition,
      actualLayingStartDate,
      source,
      cost,
      notes,
      hensCount,
      roostersCount,
      chicksCount
    });

    // Validate required fields
    if (!batchName || !breed || !acquisitionDate || initialCount === undefined || initialCount === null || !type || !ageAtAcquisition || !source) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse and validate initialCount
    const parsedInitialCount = parseInt(initialCount);
    if (isNaN(parsedInitialCount) || parsedInitialCount <= 0) {
      console.log('Validation failed - invalid initialCount:', initialCount);
      return res.status(400).json({ error: 'Initial count must be a positive number' });
    }

    // Parse and validate individual counts
    const parsedHensCount = parseInt(hensCount) || 0;
    const parsedRoostersCount = parseInt(roostersCount) || 0;
    const parsedChicksCount = parseInt(chicksCount) || 0;
    
    // Parse and validate cost
    const parsedCost = parseFloat(cost) || 0;

    // Validate that individual counts add up to initial count
    const totalIndividualCount = parsedHensCount + parsedRoostersCount + parsedChicksCount;
    if (totalIndividualCount !== parsedInitialCount) {
      console.log(`Count mismatch - initial: ${parsedInitialCount}, individual total: ${totalIndividualCount}`);
      return res.status(400).json({ 
        error: 'Individual bird counts must add up to initial count',
        details: `Hens: ${parsedHensCount}, Roosters: ${parsedRoostersCount}, Chicks: ${parsedChicksCount}, Total: ${totalIndividualCount}, Expected: ${parsedInitialCount}`
      });
    }

    console.log('Parsed counts and cost:', {
      initialCount: parsedInitialCount,
      hensCount: parsedHensCount,
      roostersCount: parsedRoostersCount,
      chicksCount: parsedChicksCount,
      cost: parsedCost
    });

    // Validate laying start date if provided
    if (actualLayingStartDate) {
      const layingDate = new Date(actualLayingStartDate);
      const acquisitionDateObj = new Date(acquisitionDate);
      
      if (layingDate < acquisitionDateObj) {
        return res.status(400).json({ error: 'Laying start date cannot be before acquisition date' });
      }
    }

    const { data: batch, error } = await supabase
      .from('flock_batches')
      .insert({
        user_id: userId,
        batch_name: batchName,
        breed,
        acquisition_date: acquisitionDate,
        initial_count: parsedInitialCount,
        current_count: parsedInitialCount, // Start with same as initial
        type,
        age_at_acquisition: ageAtAcquisition,
        actual_laying_start_date: actualLayingStartDate || null,
        source,
        cost: parsedCost,
        notes,
        hens_count: parsedHensCount,
        roosters_count: parsedRoostersCount,
        chicks_count: parsedChicksCount
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        requestData: {
          user_id: userId,
          batch_name: batchName,
          breed,
          acquisition_date: acquisitionDate,
          initial_count: parsedInitialCount,
          current_count: parsedInitialCount,
          type,
          age_at_acquisition: ageAtAcquisition,
          actual_laying_start_date: actualLayingStartDate || null,
          source,
          cost: parsedCost,
          notes,
          hens_count: parsedHensCount,
          roosters_count: parsedRoostersCount,
          chicks_count: parsedChicksCount
        }
      });
      throw error;
    }

    // Create expense entry if cost > 0
    if (parsedCost > 0) {
      console.log('Creating expense entry for batch cost:', parsedCost);
      
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          date: acquisitionDate,
          category: 'Birds', // Category for chicken acquisitions
          description: `Batch acquisition: ${batchName} (${parsedInitialCount} ${type})`,
          amount: parsedCost
        });

      if (expenseError) {
        console.error('Failed to create expense entry:', expenseError);
        // Don't fail the batch creation if expense creation fails
        // Just log the error and continue
      } else {
        console.log('Expense entry created successfully for batch cost');
      }
    }

    // Transform response
    const transformedBatch = {
      id: batch.id,
      batchName: batch.batch_name,
      breed: batch.breed,
      acquisitionDate: batch.acquisition_date,
      initialCount: batch.initial_count,
      currentCount: batch.current_count,
      type: batch.type,
      ageAtAcquisition: batch.age_at_acquisition,
      expectedLayingStartDate: batch.expected_laying_start_date,
      actualLayingStartDate: batch.actual_laying_start_date,
      source: batch.source,
      cost: batch.cost,
      notes: batch.notes,
      isActive: batch.is_active,
      created_at: batch.created_at,
      updated_at: batch.updated_at,
      hensCount: batch.hens_count,
      roostersCount: batch.roosters_count,
      chicksCount: batch.chicks_count,
      broodingCount: batch.brooding_count
    };

    return res.status(201).json({ success: true, data: { batch: transformedBatch } });
  } catch (error) {
    console.error('Error creating flock batch:', error);
    
    // Provide more specific error messages based on error type
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      if (dbError.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'A batch with this name already exists' });
      }
      if (dbError.code === '23502') { // Not null violation
        return res.status(400).json({ error: 'Missing required field', details: dbError.message });
      }
      if (dbError.code === '23514') { // Check constraint violation
        return res.status(400).json({ error: 'Invalid data format', details: dbError.message });
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to create flock batch',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// PUT - Update existing flock batch
async function handlePut(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { batchId, ...updateData } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    // Transform field names for database
    const dbUpdateData: Partial<{
      batch_name: string;
      breed: string;
      acquisition_date: string;
      initial_count: number;
      current_count: number;
      type: string;
      age_at_acquisition: string;
      expected_laying_start_date: string;
      actual_laying_start_date: string;
      source: string;
      cost: number;
      notes: string;
      is_active: boolean;
      hens_count: number;
      roosters_count: number;
      chicks_count: number;
      brooding_count: number;
      updated_at: string;
    }> = {};
    if (updateData.batchName !== undefined) dbUpdateData.batch_name = updateData.batchName;
    if (updateData.breed !== undefined) dbUpdateData.breed = updateData.breed;
    if (updateData.acquisitionDate !== undefined) dbUpdateData.acquisition_date = updateData.acquisitionDate;
    if (updateData.initialCount !== undefined) dbUpdateData.initial_count = updateData.initialCount;
    if (updateData.currentCount !== undefined) dbUpdateData.current_count = updateData.currentCount;
    if (updateData.type !== undefined) dbUpdateData.type = updateData.type;
    if (updateData.ageAtAcquisition !== undefined) dbUpdateData.age_at_acquisition = updateData.ageAtAcquisition;
    if (updateData.expectedLayingStartDate !== undefined) dbUpdateData.expected_laying_start_date = updateData.expectedLayingStartDate;
    if (updateData.actualLayingStartDate !== undefined) dbUpdateData.actual_laying_start_date = updateData.actualLayingStartDate;
    if (updateData.source !== undefined) dbUpdateData.source = updateData.source;
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;
    if (updateData.isActive !== undefined) dbUpdateData.is_active = updateData.isActive;
    if (updateData.hensCount !== undefined) dbUpdateData.hens_count = updateData.hensCount;
    if (updateData.roostersCount !== undefined) dbUpdateData.roosters_count = updateData.roostersCount;
    if (updateData.chicksCount !== undefined) dbUpdateData.chicks_count = updateData.chicksCount;
    if (updateData.broodingCount !== undefined) dbUpdateData.brooding_count = updateData.broodingCount;

    dbUpdateData.updated_at = new Date().toISOString();

    const { data: batch, error } = await supabase
      .from('flock_batches')
      .update(dbUpdateData)
      .eq('id', batchId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or access denied' });
    }

    // Transform response
    const transformedBatch = {
      id: batch.id,
      batchName: batch.batch_name,
      breed: batch.breed,
      acquisitionDate: batch.acquisition_date,
      initialCount: batch.initial_count,
      currentCount: batch.current_count,
      type: batch.type,
      ageAtAcquisition: batch.age_at_acquisition,
      expectedLayingStartDate: batch.expected_laying_start_date,
      actualLayingStartDate: batch.actual_laying_start_date,
      source: batch.source,
      cost: batch.cost,
      notes: batch.notes,
      isActive: batch.is_active,
      created_at: batch.created_at,
      updated_at: batch.updated_at,
      hensCount: batch.hens_count,
      roostersCount: batch.roosters_count,
      chicksCount: batch.chicks_count,
      broodingCount: batch.brooding_count
    };

    return res.status(200).json({ success: true, data: { batch: transformedBatch } });
  } catch (error) {
    console.error('Error updating flock batch:', error);
    return res.status(500).json({ error: 'Failed to update flock batch' });
  }
}

// DELETE - Deactivate flock batch (soft delete)
async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    const { data: batch, error } = await supabase
      .from('flock_batches')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', batchId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or access denied' });
    }

    return res.status(200).json({ success: true, message: 'Batch deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating flock batch:', error);
    return res.status(500).json({ error: 'Failed to deactivate flock batch' });
  }
}