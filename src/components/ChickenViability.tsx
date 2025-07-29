"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from './testCom';

interface FeedOption {
  id: string;
  costPerBird: number;
  title: string;
  details: string[];
  description: string;
}

interface ProductionOption {
  id: string;
  eggsPerBirdPerWeek: number;
  eggsPerBirdPerMonth: number;
  title: string;
  details: string[];
  description: string;
}

interface StartingCostOption {
  id: string;
  cost: number;
  title: string;
  details: string[];
  description: string;
}

const feedOptions: FeedOption[] = [
  {
    id: 'budget',
    costPerBird: 1.5,
    title: 'Budget Approach',
    details: [
      'Free-range during day',
      'Kitchen scraps & garden waste',
      'Buy feed from co-ops in bulk',
      'Minimal supplements'
    ],
    description: '~$1.50 per bird per month'
  },
  {
    id: 'standard',
    costPerBird: 3.5,
    title: 'Standard Approach',
    details: [
      'Commercial feed only',
      'Chain store purchases',
      'Basic layer pellets',
      'Limited free-ranging'
    ],
    description: '~$3.50 per bird per month'
  },
  {
    id: 'premium',
    costPerBird: 5.0,
    title: 'Premium Approach',
    details: [
      'Organic/premium feeds',
      'Treats & supplements',
      'Scratch grains & extras',
      'Spoiled chicken lifestyle'
    ],
    description: '~$5.00 per bird per month'
  }
];

const productionOptions: ProductionOption[] = [
  {
    id: 'conservative',
    eggsPerBirdPerWeek: 4,
    eggsPerBirdPerMonth: 16,
    title: 'Conservative Estimate',
    details: [
      'Older hens or winter months',
      'Less daylight hours',
      'Basic nutrition',
      'Stress or health issues'
    ],
    description: '~4 eggs per bird per week'
  },
  {
    id: 'realistic',
    eggsPerBirdPerWeek: 5.5,
    eggsPerBirdPerMonth: 22,
    title: 'Realistic Average',
    details: [
      'Healthy adult layers',
      'Good nutrition & care',
      'Spring/summer months',
      'Popular breeds (Rhode Island Red, etc.)'
    ],
    description: '~5.5 eggs per bird per week'
  },
  {
    id: 'optimistic',
    eggsPerBirdPerWeek: 6.5,
    eggsPerBirdPerMonth: 26,
    title: 'Optimistic Scenario',
    details: [
      'Prime laying age (1-2 years)',
      'Excellent nutrition & care',
      'Long daylight hours',
      'High-production breeds'
    ],
    description: '~6.5 eggs per bird per week'
  }
];

const startingCostOptions: StartingCostOption[] = [
  {
    id: 'minimal',
    cost: 50,
    title: 'Minimal Setup',
    details: [
      'Existing structure or simple shelter',
      'Basic feeders & waterers',
      'Repurposed materials',
      'Gifted or free chickens'
    ],
    description: '~$50 total investment'
  },
  {
    id: 'basic',
    cost: 200,
    title: 'Basic Setup',
    details: [
      'Simple coop construction',
      'Basic fencing & security',
      'Essential equipment',
      'Store-bought chickens'
    ],
    description: '~$200 total investment'
  },
  {
    id: 'premium',
    cost: 500,
    title: 'Premium Setup',
    details: [
      'Quality coop with features',
      'Professional fencing',
      'Automatic systems',
      'Premium breeds & equipment'
    ],
    description: '~$500 total investment'
  },
  {
    id: 'luxury',
    cost: 1000,
    title: 'Luxury Setup',
    details: [
      'Custom-built coop',
      'Landscaping & features',
      'Automated systems',
      'High-end breeds & accessories'
    ],
    description: '~$1000+ total investment'
  }
];

export const ChickenViability = () => {
  const [birdCount, setBirdCount] = useState(5);
  const [selectedFeedOption, setSelectedFeedOption] = useState<FeedOption>(feedOptions[1]); // Default to standard
  const [selectedProductionOption, setSelectedProductionOption] = useState<ProductionOption>(productionOptions[1]); // Default to realistic
  const [selectedStartingCostOption, setSelectedStartingCostOption] = useState<StartingCostOption>(startingCostOptions[1]); // Default to basic
  const [eggPrice, setEggPrice] = useState(0.30);
  const [startingCost, setStartingCost] = useState(200);
  const [showResults, setShowResults] = useState(false);

  const calculateViability = () => {
    const monthlyFeedCost = birdCount * selectedFeedOption.costPerBird;
    const monthlyEggProduction = birdCount * selectedProductionOption.eggsPerBirdPerMonth;
    const monthlyEggValue = monthlyEggProduction * eggPrice;
    const monthlyProfit = monthlyEggValue - monthlyFeedCost;
    const breakEvenMonths = startingCost / monthlyProfit;
    const annualFeedCost = monthlyFeedCost * 12;
    const annualEggValue = monthlyEggValue * 12;
    const annualProfit = annualEggValue - annualFeedCost;
    const paybackPeriod = monthlyProfit > 0 ? startingCost / monthlyProfit : null;

    return {
      monthlyFeedCost,
      monthlyEggProduction,
      monthlyEggValue,
      monthlyProfit,
      breakEvenMonths,
      annualFeedCost,
      annualEggValue,
      annualProfit,
      paybackPeriod
    };
  };

  const results = calculateViability();

  useEffect(() => {
    if (birdCount > 0 && selectedFeedOption && selectedProductionOption) {
      setShowResults(true);
    }
  }, [birdCount, selectedFeedOption, selectedProductionOption]);

  // Update starting cost when option changes (but not for custom amounts)
  useEffect(() => {
    if (selectedStartingCostOption.id && selectedStartingCostOption.id !== 'custom') {
      setStartingCost(selectedStartingCostOption.cost);
    }
  }, [selectedStartingCostOption]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto p-0"
    >
      <div className="header">
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          🐔 Chicken Viability Calculator
        </h1>
        <p className="text-gray-600 mt-2">Calculate if keeping chickens makes financial sense for you</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">🏠 Starting Investment</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">💡</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Understanding Your Initial Investment</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Starting costs for chicken keeping can vary dramatically based on your situation. Some people can start with minimal investment using existing structures and gifted birds, while others need to build everything from scratch. Consider your available space, DIY skills, and whether you have existing materials or structures to work with.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {startingCostOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedStartingCostOption.id === option.id 
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 border-2 border-indigo-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedStartingCostOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  ${option.cost}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg">💡</span>
            <h3 className="font-semibold text-gray-900">Custom Amount</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            If your setup doesn't match these scenarios, you can enter a custom amount below:
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={startingCost}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setStartingCost(value);
                // Clear selection if custom amount is entered
                if (value !== selectedStartingCostOption.cost) {
                  setSelectedStartingCostOption({ id: 'custom', cost: value, title: 'Custom Amount', details: [], description: 'Custom investment amount' } as StartingCostOption);
                }
              }}
              className="neu-input flex-1"
              placeholder="Enter custom amount"
            />
            <span className="text-gray-600 text-sm">USD</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">📊 Setup Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="birdCount">
              Number of Chickens
            </label>
            <input
              id="birdCount"
              type="number"
              min="1"
              max="100"
              value={birdCount}
              onChange={(e) => setBirdCount(parseInt(e.target.value) || 0)}
              className="neu-input"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="eggPrice">
              Price per Egg ($)
            </label>
            <input
              id="eggPrice"
              type="number"
              min="0"
              step="0.01"
              value={eggPrice}
              onChange={(e) => setEggPrice(parseFloat(e.target.value) || 0)}
              className="neu-input"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">🌾 Feeding Approach</h2>
        
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">🌱</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Understanding Your Feeding Strategy</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your feeding approach significantly impacts both costs and chicken health. Consider your available time, space for free-ranging, access to kitchen scraps, and whether you prefer organic or conventional feeds. The right approach balances cost-effectiveness with your chickens' nutritional needs and your lifestyle.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {feedOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedFeedOption.id === option.id 
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 border-2 border-indigo-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedFeedOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  ${option.costPerBird.toFixed(2)}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>


      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">🥚 Egg Production Scenario</h2>
        
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">📊</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Understanding Egg Production Variables</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Egg production varies significantly based on breed, age, season, and care quality. Younger hens in their prime (1-2 years) with good nutrition and long daylight hours will lay more eggs. Winter months, older hens, and stress can dramatically reduce production. Choose a scenario that matches your expected conditions and chicken care level.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {productionOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedProductionOption.id === option.id 
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 border-2 border-indigo-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedProductionOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {option.eggsPerBirdPerWeek}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showResults && (
                      <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="glass-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">💰 Financial Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <StatCard 
                title="Monthly Feed Cost" 
                total={`$${results.monthlyFeedCost.toFixed(2)}`} 
                label="total feed expense"
              />
              <StatCard 
                title="Monthly Egg Production" 
                total={results.monthlyEggProduction} 
                label="eggs per month"
              />
              <StatCard 
                title="Monthly Egg Value" 
                total={`$${results.monthlyEggValue.toFixed(2)}`} 
                label="potential revenue"
              />
              <StatCard 
                title="Monthly Profit" 
                total={`$${results.monthlyProfit.toFixed(2)}`} 
                label={
                  <span className={`text-xs px-2 py-1 rounded ${
                    results.monthlyProfit > 0 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {results.monthlyProfit > 0 ? 'Profitable' : 'Loss'}
                  </span>
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="neu-form">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Annual Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Feed Cost:</span>
                    <span className="font-semibold">${results.annualFeedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Egg Value:</span>
                    <span className="font-semibold">${results.annualEggValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Annual Profit:</span>
                    <span className={`font-bold ${
                      results.annualProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${results.annualProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="neu-form">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Payback Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Investment:</span>
                    <span className="font-semibold">${startingCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Profit:</span>
                    <span className={`font-semibold ${
                      results.monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${results.monthlyProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Payback Period:</span>
                    <span className={`font-bold ${
                      results.paybackPeriod && results.paybackPeriod > 0 
                        ? results.paybackPeriod <= 12 ? 'text-green-600' : 'text-orange-600'
                        : 'text-red-600'
                    }`}>
                      {results.paybackPeriod && results.paybackPeriod > 0 
                        ? `${results.paybackPeriod.toFixed(1)} months`
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

              <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">💡 Viability Assessment</h2>
        
        <div className="space-y-4">
          <div className="info-point">
            <div className="info-icon">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Break-Even Analysis</h4>
              <p className="text-gray-700 text-sm">
                A dozen store-bought eggs costs $4-6+ in 2025. Each chicken lays about 20 eggs per month, 
                so your feed cost per bird should be less than $6-10 to break even on eggs alone.
              </p>
            </div>
          </div>

          <div className="info-point">
            <div className="info-icon">📊</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Your Assessment</h4>
                             <p className="text-gray-700 text-sm">
                 {results.monthlyProfit > 0 
                   ? `With ${birdCount} chickens using the ${selectedFeedOption.title.toLowerCase()} and ${selectedProductionOption.title.toLowerCase()}, 
                      you'll make $${results.monthlyProfit.toFixed(2)} per month. 
                      ${results.paybackPeriod && results.paybackPeriod > 0 
                        ? `Your $${startingCost} investment will pay for itself in ${results.paybackPeriod.toFixed(1)} months!`
                        : `Your $${startingCost} investment will pay for itself in ${results.paybackPeriod?.toFixed(1)} months.`
                      }`
                   : `With ${birdCount} chickens using the ${selectedFeedOption.title.toLowerCase()} and ${selectedProductionOption.title.toLowerCase()}, 
                      you'll lose $${Math.abs(results.monthlyProfit).toFixed(2)} per month. 
                      Consider reducing costs or increasing egg production to make it viable.`
                 }
               </p>
            </div>
          </div>

          <div className="info-point">
            <div className="info-icon">🎯</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Recommendations</h4>
              <p className="text-gray-700 text-sm">
                {results.monthlyProfit > 0 
                  ? "This looks like a viable chicken-keeping venture! Consider starting with a small flock and expanding as you gain experience."
                  : "Consider starting with fewer chickens, using a more budget-friendly feeding approach, or increasing your egg prices to make this viable."
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 