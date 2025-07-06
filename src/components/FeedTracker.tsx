import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry, FlockProfile } from '../types';
import { saveFeedInventory, fetchData, saveExpenses } from '../utils/authApiUtils';
import { v4 as uuidv4 } from 'uuid';

const FEED_TYPES = [
  'Baby chicks',
  'Big chicks', 
  'Both'
];

const saveToDatabase = async (inventory: FeedEntry[]) => {
  try {
    await saveFeedInventory(inventory);
  } catch (error) {
    console.error('Error saving to database:', error);
  }
};

export const FeedTracker = () => {
  const [feedInventory, setFeedInventory] = useState<FeedEntry[]>([]);
  const [flockProfile, setFlockProfile] = useState<FlockProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEstimator, setShowEstimator] = useState(false);
  
  // Form states for new feed entry
  const [brand, setBrand] = useState('');
  const [type, setType] = useState(FEED_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [openedDate, setOpenedDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState('');  const [pricePerUnit, setPricePerUnit] = useState('');useEffect(() => {
    // Load from database
    const loadFeedInventory = async () => {
      try {
        const dbData = await fetchData();
        const inventory = dbData.feedInventory;
        const profile = dbData.flockProfile;
        
        if (inventory && Array.isArray(inventory)) {
          setFeedInventory(inventory);
        }
        if (profile) {
          setFlockProfile(profile);
        }
      } catch (error) {
        console.log('Failed to load feed inventory from database:', error);
      }
    };
    
    loadFeedInventory();
  }, []);
  const calculateDuration = (openedDate: string, depletedDate?: string) => {
    if (!depletedDate) return null;
    
    const start = new Date(openedDate);
    const end = new Date(depletedDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Calculate actual consumption rates from your completed feed cycles
  const getActualConsumptionData = () => {
    const completedFeeds = feedInventory.filter(feed => feed.depletedDate);
    
    if (completedFeeds.length === 0) return null;
    
    const consumptionData = completedFeeds.map(feed => {
      const duration = calculateDuration(feed.openedDate, feed.depletedDate) || 1;
      const dailyConsumption = feed.quantity / duration;
      const totalCost = feed.quantity * feed.pricePerUnit;
      const dailyCost = totalCost / duration;
      
      return {
        feedType: feed.type,
        brand: feed.brand,
        duration,
        quantity: feed.quantity,
        unit: feed.unit,
        dailyConsumption,
        totalCost,
        dailyCost,
        startDate: feed.openedDate,
        endDate: feed.depletedDate
      };
    });
    
    // Calculate averages by feed type
    const avgByType: Record<string, any> = {};
    
    ['Baby chicks', 'Big chicks', 'Both'].forEach(type => {
      const typeFeeds = consumptionData.filter(feed => feed.feedType === type);
      if (typeFeeds.length > 0) {
        const avgDaily = typeFeeds.reduce((sum, feed) => sum + feed.dailyConsumption, 0) / typeFeeds.length;
        const avgCost = typeFeeds.reduce((sum, feed) => sum + feed.dailyCost, 0) / typeFeeds.length;
        
        avgByType[type] = {
          count: typeFeeds.length,
          avgDailyConsumption: avgDaily,
          avgDailyCost: avgCost,
          recentFeeds: typeFeeds.slice(-3) // Last 3 feeds of this type
        };
      }
    });
    
    return {
      allFeeds: consumptionData,
      byType: avgByType,
      totalCompleted: completedFeeds.length
    };
  };

  // Estimate future needs based on YOUR actual data
  const estimateFutureNeeds = (days: number = 30) => {
    const actualData = getActualConsumptionData();
    if (!actualData || !flockProfile) return null;
    
    const currentFlockSize = flockProfile.chicks + flockProfile.hens + flockProfile.roosters;
    if (currentFlockSize === 0) return null;
    
    // Use the most appropriate feed type data
    let bestEstimate = null;
    
    // Prefer 'Both' type if available, then 'Big chicks', then 'Baby chicks'
    if (actualData.byType['Both']) {
      bestEstimate = actualData.byType['Both'];
    } else if (actualData.byType['Big chicks']) {
      bestEstimate = actualData.byType['Big chicks'];
    } else if (actualData.byType['Baby chicks']) {
      bestEstimate = actualData.byType['Baby chicks'];
    }
    
    if (!bestEstimate) return null;
    
    return {
      dailyConsumption: bestEstimate.avgDailyConsumption,
      dailyCost: bestEstimate.avgDailyCost,
      totalNeed: bestEstimate.avgDailyConsumption * days,
      totalCost: bestEstimate.avgDailyCost * days,
      basedOnFeeds: bestEstimate.count,
      currentFlockSize
    };
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const newFeed: FeedEntry = {
      id: uuidv4(),
      brand,
      type,
      quantity: parseFloat(quantity),
      unit,
      openedDate, // already in YYYY-MM-DD format
      pricePerUnit: parseFloat(pricePerUnit),
      // Do not include batchNumber or description here
    };
    const updatedInventory = [...feedInventory, newFeed];
    setFeedInventory(updatedInventory);
    try {
      await saveToDatabase(updatedInventory.map(feed => ({
        id: feed.id,
        brand: feed.brand,
        type: feed.type,
        quantity: feed.quantity,
        unit: feed.unit,
        pricePerUnit: feed.pricePerUnit,
        openedDate: feed.openedDate,
        depletedDate: feed.depletedDate // undefined if not set
      })));
    } catch (err) {
      setErrorMsg('Failed to save feed inventory. Please try again.');
    }

    // Add expense entry via database
    try {
      const dbData = await fetchData();
      const expenses = dbData.expenses || [];
      const newExpense = {
        id: Date.now().toString(),
        date: openedDate,
        category: 'Feed',
        description: `${brand} ${type} (${quantity} ${unit})`,
        amount: parseFloat(quantity) * parseFloat(pricePerUnit)
      };

      const updatedExpenses = [...expenses, newExpense];
      await saveExpenses(updatedExpenses);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'expense', data: updatedExpenses } 
      }));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
    
    // Reset form
    setBrand('');
    setQuantity('');
    setBatchNumber('');
    setPricePerUnit('');
  };
  const handleDepleteFeed = (id: string) => {
    const updatedInventory = feedInventory.map(feed => {
      if (feed.id === id) {
        return { ...feed, depletedDate: new Date().toISOString().split('T')[0] };
      }
      return feed;
    });
    setFeedInventory(updatedInventory);
    saveToDatabase(updatedInventory);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {      const updatedInventory = feedInventory.filter(feed => feed.id !== id);
      setFeedInventory(updatedInventory);
      saveToDatabase(updatedInventory);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
      style={{ margin: '0px auto', opacity: 1 }}
    >      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Feed Management
        </h1>        <button
          onClick={() => setShowEstimator(!showEstimator)}
          className="neu-button"
        >
          {showEstimator ? 'Hide Analysis' : 'Show Feed Analysis'}
        </button>
      </div>

      <motion.div 
        id="addFeedForm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-form"
      >
        <h2 className="neu-title">Add New Feed</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="brand">
                Brand Name
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="type">
                Feed Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="neu-input"
              >
                {FEED_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                className="neu-input"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="pricePerUnit">
                Price per Unit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  className="neu-input pl-8"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="openedDate">
                Purchase Date
              </label>
              <input
                id="openedDate"
                type="date"
                value={openedDate}
                onChange={(e) => setOpenedDate(e.target.value)}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="batchNumber">
                Batch Number (Optional)
              </label>
              <input
                id="batchNumber"
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="neu-input"
              />
            </div>
          </div>

          <button type="submit" className="neu-button full-width md:w-auto md:min-w-[200px]">
            Add Feed to Inventory
          </button>
        </form>        {errorMsg && (
          <div className="text-red-600 font-semibold mb-4">{errorMsg}</div>
        )}
      </motion.div>

      {/* Feed Consumption Estimator */}
      {showEstimator && flockProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feed Consumption Based on Your Data</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Flock Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Flock</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{flockProfile.chicks}</div>
                  <div className="text-sm text-gray-600">Baby Chicks</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{flockProfile.hens + flockProfile.roosters}</div>
                  <div className="text-sm text-gray-600">Adult Birds</div>
                </div>
              </div>
              
              {(() => {
                const futureNeeds = estimateFutureNeeds(30);
                const actualData = getActualConsumptionData();
                
                if (!futureNeeds || !actualData) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-600">Complete some feed cycles to see your actual consumption data</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Mark feed bags as "depleted" when empty to build your consumption history
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        Your Daily Consumption: {futureNeeds.dailyConsumption.toFixed(2)} {unit}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Daily Cost: ${futureNeeds.dailyCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Based on {futureNeeds.basedOnFeeds} completed feed cycle(s)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Monthly Estimates</div>
                      <div className="text-lg font-bold text-blue-600">
                        {futureNeeds.totalNeed.toFixed(1)} {unit} • ${futureNeeds.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Consumption History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Feed History</h3>
              {(() => {
                const actualData = getActualConsumptionData();
                
                if (!actualData || actualData.totalCompleted === 0) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                      No completed feed cycles yet. Mark feed as depleted to start tracking!
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {actualData.allFeeds.slice(-5).map((feed, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">
                              {feed.brand} - {feed.feedType}
                            </div>
                            <div className="text-sm text-gray-600">
                              {feed.quantity} {feed.unit} • {feed.duration} days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-700">
                              {feed.dailyConsumption.toFixed(2)} {feed.unit}/day
                            </div>
                            <div className="text-sm text-gray-500">
                              ${feed.dailyCost.toFixed(2)}/day
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-xs text-gray-500 text-center">
                      Showing last 5 completed feeds
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>          {/* Feed Type Guide & Consumption Insights */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Feed Type Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Baby chicks:</span>
                  <div className="text-blue-600">For birds 0-6 weeks old. High protein starter feed.</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Big chicks:</span>
                  <div className="text-blue-600">For birds 6+ weeks old. Layer or grower feed.</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Both:</span>
                  <div className="text-blue-600">All-flock feed suitable for mixed ages.</div>
                </div>
              </div>
            </div>
            
            {(() => {
              const actualData = getActualConsumptionData();
              if (actualData && Object.keys(actualData.byType).length > 0) {
                return (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Your Consumption Patterns</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(actualData.byType).map(([type, data]: [string, any]) => (
                        <div key={type}>
                          <span className="font-medium text-green-700">{type}:</span>
                          <div className="text-green-600">
                            {data.avgDailyConsumption.toFixed(2)} {unit}/day avg
                          </div>
                          <div className="text-green-500 text-xs">
                            ${data.avgDailyCost.toFixed(2)}/day • {data.count} cycles
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Feed Inventory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Brand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Opened</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedInventory.map((feed) => (
                <motion.tr
                  key={feed.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">{feed.brand}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{feed.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {feed.quantity} {feed.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ${(feed.quantity * feed.pricePerUnit).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{feed.openedDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {feed.depletedDate ? (
                      `${calculateDuration(feed.openedDate, feed.depletedDate)} days`
                    ) : (
                      <button
                        onClick={() => handleDepleteFeed(feed.id)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Mark Depleted
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(feed.id)}
                      className={`inline-flex items-center p-2 rounded-full
                        ${deleteConfirm === feed.id
                          ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                          : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                        } transition-colors`}
                      title={deleteConfirm === feed.id ? "Click again to confirm deletion" : "Delete feed"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};