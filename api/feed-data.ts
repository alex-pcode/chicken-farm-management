import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Feed Data API Endpoint
 * 
 * This endpoint implements P2.7 Progressive Data Loading Strategy for feed management
 * It returns only data needed for feed tracking:
 * - Current feed inventory
 * - Recent purchases (last 60 days)
 * - Low stock alerts
 * - Consumption trend analysis
 */

// Helper function to get user from authorization header
async function getAuthenticatedUser(req: VercelRequest, supabase: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error ? null : user;
  } catch (err) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ message: 'Internal Server Error: Missing Supabase configuration.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req, supabase);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    console.log('Fetching feed data for user:', user.id);

    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Current feed inventory
    const { data: feedInventory } = await supabase
      .from('feed_inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 2. Recent purchases (filter inventory by purchase date in last 60 days)
    const recentPurchases = feedInventory?.filter(feed => {
      return feed.purchase_date && feed.purchase_date >= sixtyDaysAgo;
    }) || [];

    // 3. Low stock alerts (assuming threshold of 5 units)
    const LOW_STOCK_THRESHOLD = 5;
    const lowStockAlerts = feedInventory?.filter(feed => {
      return feed.quantity <= LOW_STOCK_THRESHOLD && !feed.expiry_date; // Not depleted
    }) || [];

    // 4. Consumption trend (simplified - based on purchase dates and current quantities)
    // This is a basic implementation - could be enhanced with actual consumption tracking
    const consumptionTrend: { date: string; consumed: number }[] = [];
    
    // Group recent purchases by week for trend analysis
    const weeklyConsumption = new Map<string, number>();
    recentPurchases.forEach(feed => {
      if (feed.purchase_date) {
        const week = feed.purchase_date.slice(0, 7); // YYYY-MM format (monthly for simplicity)
        const consumed = (feed.initial_quantity || feed.quantity) - feed.quantity;
        weeklyConsumption.set(week, (weeklyConsumption.get(week) || 0) + consumed);
      }
    });

    for (const [date, consumed] of weeklyConsumption.entries()) {
      consumptionTrend.push({ date, consumed });
    }
    consumptionTrend.sort((a, b) => a.date.localeCompare(b.date));

    // Map feed inventory to expected frontend format
    const mappedFeedInventory = feedInventory?.map(feed => ({
      id: feed.id,
      brand: feed.name, // Map name to brand for frontend
      type: feed.type || 'Layer Feed', // Default type since it's not in DB
      quantity: feed.quantity,
      unit: feed.unit,
      pricePerUnit: feed.cost_per_unit, // Map cost_per_unit to pricePerUnit
      openedDate: feed.purchase_date, // Map purchase_date to openedDate
      depletedDate: feed.expiry_date, // Map expiry_date to depletedDate
      batchNumber: feed.batch_number || '', // Default since not in current schema
      createdAt: feed.created_at,
      updatedAt: feed.updated_at
    })) || [];

    const feedData = {
      feedInventory: mappedFeedInventory,
      recentPurchases: recentPurchases.map(feed => ({
        id: feed.id,
        brand: feed.name,
        type: feed.type || 'Layer Feed',
        quantity: feed.quantity,
        unit: feed.unit,
        pricePerUnit: feed.cost_per_unit,
        purchaseDate: feed.purchase_date,
        createdAt: feed.created_at
      })),
      lowStockAlerts: lowStockAlerts.map(feed => ({
        id: feed.id,
        brand: feed.name,
        type: feed.type || 'Layer Feed',
        quantity: feed.quantity,
        unit: feed.unit,
        threshold: LOW_STOCK_THRESHOLD
      })),
      consumptionTrend
    };

    console.log(`Feed data fetched successfully: ${feedInventory?.length || 0} inventory items, ${lowStockAlerts.length} low stock alerts`);
    
    res.status(200).json(feedData);
  } catch (error) {
    console.error('Error in feed-data:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}