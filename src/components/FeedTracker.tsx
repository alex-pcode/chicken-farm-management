import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry } from '../types';
import { apiCall, fetchData } from '../utils/apiUtils';
import { v4 as uuidv4 } from 'uuid';

const FEED_TYPES = [
  'Starter',
  'Grower',
  'Layer',
  'Scratch Grains',
  'Other'
];

const saveToDatabase = async (inventory: FeedEntry[]) => {
  try {
    await apiCall('/saveFeedInventory', inventory);
  } catch (error) {
    console.error('Error saving to database:', error);
  }
};

export const FeedTracker = () => {
  const [feedInventory, setFeedInventory] = useState<FeedEntry[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form states for new feed entry
  const [brand, setBrand] = useState('');
  const [type, setType] = useState(FEED_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [openedDate, setOpenedDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');  useEffect(() => {
    // Load from database
    const loadFeedInventory = async () => {
      try {
        const dbData = await fetchData();
        const inventory = dbData.feedInventory;
        
        if (inventory && Array.isArray(inventory)) {
          setFeedInventory(inventory);
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
      await apiCall('/saveExpenses', updatedExpenses);

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
    >
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Feed Management
        </h1>
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
        </form>
        {errorMsg && (
          <div className="text-red-600 font-semibold mb-4">{errorMsg}</div>
        )}
      </motion.div>

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