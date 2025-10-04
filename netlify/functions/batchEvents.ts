import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to delete corresponding flock event when batch event is deleted
async function deleteCorrespondingFlockEvent(batchEvent: { description: string; date: string }, userId: string) {
  try {
    // Find and delete the corresponding flock event
    // We'll match by date, description pattern, and user
    const searchPattern = `%${batchEvent.description}%`;
    
    const { error: deleteError } = await supabase
      .from('flock_events')
      .delete()
      .eq('user_id', userId)
      .eq('date', batchEvent.date)
      .like('description', searchPattern);

    if (deleteError) {
      console.error('Error deleting corresponding flock event:', deleteError);
    } else {
      console.log(`Successfully deleted corresponding flock event for batch event: ${batchEvent.description}`);
    }
  } catch (error) {
    console.error('Error in deleteCorrespondingFlockEvent:', error);
  }
}

// Function to create flock-level event when batch event is created
async function createFlockEventFromBatchEvent(batchEvent: { 
  type: string; 
  description: string; 
  date: string; 
  affected_count?: number; 
  notes?: string 
}, batchName: string, userId: string) {
  try {
    // Map batch event types to flock event types and descriptions
    const eventMapping = {
      health_check: {
        type: 'other' as const,
        description: `Health check performed on ${batchName} batch`
      },
      vaccination: {
        type: 'other' as const,
        description: `Vaccination administered to ${batchName} batch`
      },
      relocation: {
        type: 'other' as const,
        description: `${batchName} batch relocated`
      },
      breeding: {
        type: 'broody' as const,
        description: `Breeding activity in ${batchName} batch`
      },
      laying_start: {
        type: 'laying_start' as const,
        description: `${batchName} batch started laying eggs`
      },
      production_note: {
        type: 'other' as const,
        description: `Production update for ${batchName} batch`
      },
      brooding_start: {
        type: 'broody' as const,
        description: `Brooding started in ${batchName} batch`
      },
      brooding_stop: {
        type: 'other' as const,
        description: `Brooding ended in ${batchName} batch`
      },
      other: {
        type: 'other' as const,
        description: `${batchName}: ${batchEvent.description}`
      }
    };

    const mapping = eventMapping[batchEvent.type as keyof typeof eventMapping] || eventMapping.other;
    
    // Create flock event (same pattern as crud.ts - flock_profile_id is null, user_id is the key)
    const flockEventData = {
      user_id: userId,
      flock_profile_id: null,
      date: batchEvent.date,
      type: mapping.type,
      description: mapping.description,
      affected_birds: batchEvent.affected_count || null,
      notes: batchEvent.notes ? `From ${batchName} batch: ${batchEvent.notes}` : `From ${batchName} batch`
    };

    const { error: flockEventError } = await supabase
      .from('flock_events')
      .insert([flockEventData]);

    if (flockEventError) {
      console.error('Error creating flock event:', flockEventError);
    } else {
      console.log(`Successfully created flock event for batch event: ${batchEvent.description}`);
    }
  } catch (error) {
    console.error('Error in createFlockEventFromBatchEvent:', error);
  }
}

// Function to update batch laying start date when laying_start event is created
async function updateBatchLayingStartDate(batchId: string, layingStartDate: string, userId: string) {
  try {
    // Get current batch data to check if actualLayingStartDate is already set
    const { data: currentBatch, error: fetchError } = await supabase
      .from('flock_batches')
      .select('actual_laying_start_date')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current batch data:', fetchError);
      return;
    }

    // Only update if actualLayingStartDate is not already set, or if the new date is earlier
    const currentDate = currentBatch?.actual_laying_start_date ? new Date(currentBatch.actual_laying_start_date) : null;
    const newDate = new Date(layingStartDate);

    if (!currentDate || newDate < currentDate) {
      const { error: updateError } = await supabase
        .from('flock_batches')
        .update({ actual_laying_start_date: layingStartDate })
        .eq('id', batchId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating batch laying start date:', updateError);
      } else {
        console.log(`Successfully updated batch ${batchId} actualLayingStartDate to ${layingStartDate}`);
      }
    } else {
      console.log(`Batch ${batchId} already has an earlier or same actualLayingStartDate, not updating`);
    }
  } catch (error) {
    console.error('Error in updateBatchLayingStartDate:', error);
  }
}

// Function to recalculate batch laying start date from remaining laying_start events
async function recalculateBatchLayingStartDate(batchId: string, userId: string) {
  try {
    // Get all remaining laying_start events for this batch, ordered by date
    const { data: layingEvents, error: eventsError } = await supabase
      .from('batch_events')
      .select('date')
      .eq('batch_id', batchId)
      .eq('user_id', userId)
      .eq('type', 'laying_start')
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching laying_start events:', eventsError);
      return;
    }

    // Update batch with earliest remaining laying_start date, or null if no events remain
    const earliestLayingDate = layingEvents && layingEvents.length > 0 ? layingEvents[0].date : null;

    const { error: updateError } = await supabase
      .from('flock_batches')
      .update({ actual_laying_start_date: earliestLayingDate })
      .eq('id', batchId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error recalculating batch laying start date:', updateError);
    } else {
      console.log(`Successfully recalculated batch ${batchId} actualLayingStartDate to ${earliestLayingDate || 'null'}`);
    }
  } catch (error) {
    console.error('Error in recalculateBatchLayingStartDate:', error);
  }
}

// Function to update batch brooding count based on timeline events
async function updateBatchBroodingCount(batchId: string, userId: string) {
  try {
    // Get all brooding events for this batch, ordered by date
    const { data: events, error: eventsError } = await supabase
      .from('batch_events')
      .select('*')
      .eq('batch_id', batchId)
      .eq('user_id', userId)
      .in('type', ['brooding_start', 'brooding_stop'])
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching brooding events:', eventsError);
      return;
    }

    // Calculate current brooding count based on events
    let broodingCount = 0;
    for (const event of events || []) {
      if (event.type === 'brooding_start') {
        const countToAdd = parseInt(String(event.affected_count)) || 1;
        broodingCount += countToAdd;
      } else if (event.type === 'brooding_stop') {
        const countToRemove = parseInt(String(event.affected_count)) || 1;
        broodingCount -= countToRemove;
      }
    }

    // Ensure count doesn't go below 0
    broodingCount = Math.max(0, broodingCount);

    // Update the batch with new brooding count
    const { error: updateError } = await supabase
      .from('flock_batches')
      .update({ brooding_count: broodingCount })
      .eq('id', batchId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating batch brooding count:', updateError);
    }
  } catch (error) {
    console.error('Error in updateBatchBroodingCount:', error);
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Get user from auth header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Authorization header required' })
    };
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user?.user) {
      return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid token' })
    };
    }

    const userId = user.user.id;

    if (event.httpMethod === 'GET') {
      // Get batch events for a specific batch
      const { batchId } = event.queryStringParameters;

      if (!batchId) {
        return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'batchId parameter required' })
    };
      }

      const { data: events, error } = await supabase
        .from('batch_events')
        .select('*')
        .eq('batch_id', batchId)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching batch events:', error);
        return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch batch events' })
    };
      }

      return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: { events: events || [] }
      })
    };

    } else if (event.httpMethod === 'POST') {
      // Create new batch event
      const { batchId, date, type, description, affectedCount, notes } = JSON.parse(event.body || '{}');

      // Validation
      if (!batchId || !date || !type || !description) {
        return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
          error: 'batchId, date, type, and description are required' 
        })
    };
      }

      // Verify batch belongs to user
      const { data: batch, error: batchError } = await supabase
        .from('flock_batches')
        .select('id')
        .eq('id', batchId)
        .eq('user_id', userId)
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

      // Insert new event
      const { data: event, error } = await supabase
        .from('batch_events')
        .insert([{
          user_id: userId,
          batch_id: batchId,
          date,
          type,
          description,
          affected_count: affectedCount || null,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating batch event:', error);
        return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to create batch event' })
    };
      }

      // Get batch name for flock event creation
      const { data: batchData } = await supabase
        .from('flock_batches')
        .select('batch_name')
        .eq('id', batchId)
        .single();

      // Create corresponding flock event
      await createFlockEventFromBatchEvent(event, batchData?.batch_name || 'Unknown Batch', userId);

      // Update batch counts for brooding events
      if (type === 'brooding_start' || type === 'brooding_stop') {
        await updateBatchBroodingCount(batchId, userId);
      }

      // Update batch actualLayingStartDate for laying_start events
      if (type === 'laying_start') {
        await updateBatchLayingStartDate(batchId, date, userId);
      }

      return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: { event }
      })
    };

    } else if (event.httpMethod === 'PUT') {
      // Update existing batch event
      const { eventId, date, type, description, affectedCount, notes } = JSON.parse(event.body || '{}');

      if (!eventId) {
        return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'eventId is required' })
    };
      }

      // Verify event belongs to user
      const { data: existingEvent, error: fetchError } = await supabase
        .from('batch_events')
        .select('id')
        .eq('id', eventId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingEvent) {
        return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Event not found or access denied' })
    };
      }

      // Update event
      const updateData: Partial<{
        date: string;
        type: string;
        description: string;
        affected_count: number;
        notes: string;
      }> = {};
      if (date !== undefined) updateData.date = date;
      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (affectedCount !== undefined) updateData.affected_count = affectedCount;
      if (notes !== undefined) updateData.notes = notes;

      const { data: event, error } = await supabase
        .from('batch_events')
        .update(updateData)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating batch event:', error);
        return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to update batch event' })
    };
      }

      // Get batch name for flock event creation
      const { data: batchData } = await supabase
        .from('flock_batches')
        .select('batch_name')
        .eq('id', event.batch_id)
        .single();

      // Create new flock event for the updated batch event
      await createFlockEventFromBatchEvent(event, batchData?.batch_name || 'Unknown Batch', userId);

      // Update batch counts if brooding event was modified
      if (type === 'brooding_start' || type === 'brooding_stop') {
        await updateBatchBroodingCount(event.batch_id, userId);
      }

      // Update batch actualLayingStartDate for laying_start events
      if (type === 'laying_start') {
        await updateBatchLayingStartDate(event.batch_id, event.date, userId);
      }

      return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: { event }
      })
    };

    } else if (event.httpMethod === 'DELETE') {
      // Delete batch event
      const { eventId } = JSON.parse(event.body || '{}');

      if (!eventId) {
        return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'eventId is required' })
    };
      }

      // Get event details before deleting for brooding count update
      const { data: eventToDelete, error: fetchError } = await supabase
        .from('batch_events')
        .select('*')
        .eq('id', eventId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !eventToDelete) {
        return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Event not found or access denied' })
    };
      }

      // Delete the event
      const { error } = await supabase
        .from('batch_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting batch event:', error);
        return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to delete batch event' })
    };
      }

      // Delete corresponding flock event
      await deleteCorrespondingFlockEvent(eventToDelete, userId);

      // Update batch counts if brooding event was deleted
      if (eventToDelete.type === 'brooding_start' || eventToDelete.type === 'brooding_stop') {
        await updateBatchBroodingCount(eventToDelete.batch_id, userId);
      }

      // Recalculate batch actualLayingStartDate if laying_start event was deleted
      if (eventToDelete.type === 'laying_start') {
        await recalculateBatchLayingStartDate(eventToDelete.batch_id, userId);
      }

      return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: { message: 'Event deleted successfully' }
      })
    };

    } else {
      return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed` })
    };
    }

  } catch (error) {
    console.error('Batch events API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}