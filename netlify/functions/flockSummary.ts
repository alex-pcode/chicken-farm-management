import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from JWT token
async function getUserFromToken(req: VercelRequest) {
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  

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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Authenticate user
    const user = await getUserFromToken(req);
    return await handleGet(req, res, user.id);
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

// GET - Get comprehensive flock summary
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Execute all database queries in parallel to reduce latency
    const [
      flockBatchResult,
      eggDataResult,
      recentDeathsResult
    ] = await Promise.all([
      // Get active flock batches
      supabase
        .from('flock_batches')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
      
      // Get recent egg production data
      supabase
        .from('egg_entries')
        .select('count, date')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      // Get recent death records
      supabase
        .from('death_records')
        .select('count, date, cause, batch_id')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
    ]);

    if (flockBatchResult.error) {
      throw flockBatchResult.error;
    }

    const flockBatches = flockBatchResult.data;
    const eggData = eggDataResult.data;
    const recentDeaths = recentDeathsResult.data;

    // Get all-time mortality records for these batches (if we have batches)
    let mortalityRecords = [];
    if (flockBatches && flockBatches.length > 0) {
      const mortalityResult = await supabase
        .from('death_records')
        .select('count')
        .in('batch_id', flockBatches.map(b => b.id));
      
      if (!mortalityResult.error) {
        mortalityRecords = mortalityResult.data || [];
      }
    }

    // Calculate totals from individual count columns
    const totalBirds = flockBatches?.reduce((sum, batch) => sum + (batch.current_count || 0), 0) || 0;
    const totalHens = flockBatches?.reduce((sum, batch) => sum + (batch.hens_count || 0), 0) || 0;
    const totalRoosters = flockBatches?.reduce((sum, batch) => sum + (batch.roosters_count || 0), 0) || 0;
    const totalChicks = flockBatches?.reduce((sum, batch) => sum + (batch.chicks_count || 0), 0) || 0;
    const totalBrooding = flockBatches?.reduce((sum, batch) => sum + (batch.brooding_count || 0), 0) || 0;
    const activeBatches = flockBatches?.length || 0;
    
    // Count laying hens: hens that have actual_laying_start_date set, minus brooding hens
    const expectedLayers = flockBatches?.reduce((sum, batch) => {
      if ((batch.hens_count || 0) > 0 && batch.actual_laying_start_date) {
        const hens = batch.hens_count || 0;
        const brooding = batch.brooding_count || 0;
        return sum + Math.max(0, hens - brooding); // Subtract brooding hens from laying hens
      }
      return sum;
    }, 0) || 0;

    const totalDeaths = mortalityRecords?.reduce((sum, record) => sum + (record.count || 0), 0) || 0;
    const totalInitial = flockBatches?.reduce((sum, batch) => sum + (batch.initial_count || 0), 0) || 0;
    const mortalityRate = totalInitial > 0 ? Number(((totalDeaths / totalInitial) * 100).toFixed(2)) : 0;

    const summary = {
      total_birds: totalBirds,
      total_hens: totalHens,
      total_roosters: totalRoosters,
      total_chicks: totalChicks,
      total_brooding: totalBrooding,
      active_batches: activeBatches,
      expected_layers: expectedLayers,
      total_deaths: totalDeaths,
      mortality_rate: mortalityRate
    };

    if (eggDataResult.error) {
      console.error('Error fetching egg data:', eggDataResult.error);
    }

    // Calculate average daily eggs and estimated laying hens
    let avgDailyEggs = 0;
    let estimatedLayers = 0;
    let avgEggsPerHen = 0;

    if (eggData && eggData.length > 0) {
      const totalEggs = eggData.reduce((sum, entry) => sum + entry.count, 0);
      avgDailyEggs = totalEggs / eggData.length;
      
      // Estimate actual layers (assuming each laying hen produces 0.7-0.9 eggs per day on average)
      if (avgDailyEggs > 0) {
        estimatedLayers = Math.round(avgDailyEggs / 0.8); // Using 0.8 as average
        
        // Calculate eggs per hen if we have expected layers
        if (summary.expected_layers > 0) {
          avgEggsPerHen = Number((avgDailyEggs / summary.expected_layers).toFixed(2));
        }
      }
    }

    // Calculate age distribution and laying readiness
    const today = new Date();
    let layingReady = 0;
    let tooYoung = 0;
    const brooding = 0;

    flockBatches?.forEach(batch => {
      if (batch.type === 'hens') {
        if (batch.actual_laying_start_date) {
          layingReady += batch.current_count;
        } else if (batch.expected_laying_start_date) {
          const expectedDate = new Date(batch.expected_laying_start_date);
          if (expectedDate <= today) {
            layingReady += batch.current_count;
          } else {
            tooYoung += batch.current_count;
          }
        } else {
          // If no laying dates, assume based on age at acquisition
          const acquisitionDate = new Date(batch.acquisition_date);
          const weeksOld = Math.floor((today.getTime() - acquisitionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          if (batch.age_at_acquisition === 'adult' || 
              (batch.age_at_acquisition === 'juvenile' && weeksOld >= 8) ||
              (batch.age_at_acquisition === 'chick' && weeksOld >= 18)) {
            layingReady += batch.current_count;
          } else {
            tooYoung += batch.current_count;
          }
        }
      }
    });

    if (recentDeathsResult.error) {
      console.error('Error fetching death records:', recentDeathsResult.error);
    }

    const recentMortality = recentDeaths?.reduce((sum, record) => sum + record.count, 0) || 0;

    // Production efficiency assessment
    let productionStatus = 'unknown';
    let productionMessage = 'No recent egg data available';

    if (avgEggsPerHen > 0) {
      if (avgEggsPerHen >= 0.7) {
        productionStatus = 'excellent';
        productionMessage = 'Excellent egg production! Your hens are highly productive.';
      } else if (avgEggsPerHen >= 0.5) {
        productionStatus = 'good';
        productionMessage = 'Good egg production. Consider optimizing nutrition or environment.';
      } else if (avgEggsPerHen >= 0.3) {
        productionStatus = 'fair';
        productionMessage = 'Fair production. May need to address health, nutrition, or stress factors.';
      } else {
        productionStatus = 'poor';
        productionMessage = 'Low production. Check for health issues, stress, molting, or seasonal factors.';
      }
    }

    const flockSummary = {
      totalBirds: Number(summary.total_birds),
      totalHens: Number(summary.total_hens),
      totalRoosters: Number(summary.total_roosters),
      totalChicks: Number(summary.total_chicks),
      totalBrooding: Number(summary.total_brooding),
      activeBatches: Number(summary.active_batches),
      expectedLayers: Number(summary.expected_layers),
      actualLayers: estimatedLayers,
      avgEggsPerHen,
      totalDeaths: Number(summary.total_deaths),
      mortalityRate: Number(summary.mortality_rate),
      
      // Additional insights
      productionMetrics: {
        avgDailyEggs: Number(avgDailyEggs.toFixed(1)),
        productionStatus,
        productionMessage,
        layingReady,
        tooYoung,
        brooding
      },
      
      mortalityMetrics: {
        recentDeaths: recentMortality,
        last30Days: recentMortality,
        overallRate: Number(summary.mortality_rate)
      },
      
      batchSummary: flockBatches?.map(batch => ({
        id: batch.id,
        name: batch.batch_name,
        breed: batch.breed,
        type: batch.type,
        currentCount: batch.current_count,
        acquisitionDate: batch.acquisition_date,
        ageAtAcquisition: batch.age_at_acquisition,
        isLayingAge: batch.type === 'hens' && (
          batch.actual_laying_start_date || 
          (batch.expected_laying_start_date && new Date(batch.expected_laying_start_date) <= today)
        )
      })) || []
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, data: { summary: flockSummary } })
    };
  } catch (error) {
    console.error('Error fetching flock summary:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch flock summary' })
    };
  }
}