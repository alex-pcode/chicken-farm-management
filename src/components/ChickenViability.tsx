"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from './ui/cards/StatCard';
import AnimatedChickenViabilityPNG from './AnimatedChickenViabilityPNG';

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

interface AcquisitionOption {
  id: string;
  title: string;
  details: string[];
  description: string;
  layingDelayMonths: number;
  costMultiplier: number;
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

const acquisitionOptions: AcquisitionOption[] = [
  {
    id: 'baby_chicks',
    title: 'Raise Baby Chicks',
    details: [
      'Lower initial cost per bird',
      '5 months before laying begins',
      'More feed costs before production',
      'Higher mortality risk',
      'Bond with chickens from day one'
    ],
    description: 'Start with day-old chicks (~$3-5 each)',
    layingDelayMonths: 5,
    costMultiplier: 0.3
  },
  {
    id: 'laying_hens',
    title: 'Buy Laying Hens',
    details: [
      'Higher upfront cost per bird',
      'Immediate egg production',
      'Already mature and healthy',
      'Lower mortality risk',
      'Instant gratification'
    ],
    description: 'Purchase ready-to-lay hens (~$15-25 each)',
    layingDelayMonths: 0,
    costMultiplier: 1.0
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
  const [selectedAcquisitionOption, setSelectedAcquisitionOption] = useState<AcquisitionOption>(acquisitionOptions[1]); // Default to laying hens
  const [eggPrice, setEggPrice] = useState(0.30);
  const [startingCost, setStartingCost] = useState(200);
  const [showResults, setShowResults] = useState(false);

  const calculateViability = () => {
    const monthlyFeedCost = birdCount * selectedFeedOption.costPerBird;
    const layingDelayMonths = selectedAcquisitionOption.layingDelayMonths;
    
    // Egg production starts after laying delay
    const monthlyEggProduction = birdCount * selectedProductionOption.eggsPerBirdPerMonth;
    const monthlyEggValue = monthlyEggProduction * eggPrice;
    
    // Calculate first year with laying delay
    const layingMonths = Math.max(0, 12 - layingDelayMonths);
    const nonLayingFeedCost = monthlyFeedCost * layingDelayMonths;
    const layingFeedCost = monthlyFeedCost * layingMonths;
    const annualFeedCost = nonLayingFeedCost + layingFeedCost;
    const annualEggValue = monthlyEggValue * layingMonths;
    const annualProfit = annualEggValue - annualFeedCost;
    
    // Calculate ongoing monthly profit (after laying period starts)
    const monthlyProfit = monthlyEggValue - monthlyFeedCost;
    
    // Calculate payback period including non-laying months
    const totalFirstYearCost = startingCost + annualFeedCost;
    const paybackPeriod = monthlyProfit > 0 ? 
      (totalFirstYearCost - annualEggValue) / monthlyProfit + 12 : null;

    return {
      monthlyFeedCost,
      monthlyEggProduction,
      monthlyEggValue,
      monthlyProfit,
      annualFeedCost,
      annualEggValue,
      annualProfit,
      paybackPeriod,
      layingDelayMonths,
      nonLayingFeedCost
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
      <AnimatedChickenViabilityPNG />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Starting Investment</h2>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          Starting costs for chicken keeping can vary dramatically based on your situation. Some people can start with minimal investment using existing structures and gifted birds, while others need to build everything from scratch. Consider your available space, DIY skills, and whether you have existing materials or structures to work with.
        </p>
        
        <div className="text-sm p-3 bg-blue-50 rounded border border-blue-200 mb-6">
          <p className="text-blue-800">
            <span className="font-semibold">💰 Don't forget:</span> If you're purchasing birds, include their costs in your starting investment above. Baby chicks typically cost $3-5 each, while laying hens cost $15-25 each. Many people receive birds for free from friends or neighbors!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {startingCostOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedStartingCostOption.id === option.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50 border-2 border-purple-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedStartingCostOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  ${option.cost}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
                  {option.title}
                </div>
                <div className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 p-4 glass-card">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold" style={{ color: '#111827' }}>Custom Amount</h3>
          </div>
          <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
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
            <span className="text-sm" style={{ color: '#6B7280' }}>USD</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Setup Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B7280' }} htmlFor="birdCount">
              Number of Chickens
            </label>
            <input
              id="birdCount"
              type="number"
              min="1"
              max="100"
              value={birdCount}
              onChange={(e) => setBirdCount(parseInt(e.target.value) || 0)}
              className="neu-input focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B7280' }} htmlFor="eggPrice">
              Price per Egg ($)
            </label>
            <input
              id="eggPrice"
              type="number"
              min="0"
              step="0.01"
              value={eggPrice}
              onChange={(e) => setEggPrice(parseFloat(e.target.value) || 0)}
              className="neu-input focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Acquisition Method</h2>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          Your acquisition method significantly impacts both costs and timeline. Baby chicks cost less upfront but require 5 months of feeding before they start laying eggs. Mature laying hens cost more initially but begin producing immediately. Consider your patience, budget, and desire to raise chickens from the beginning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {acquisitionOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedAcquisitionOption.id === option.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50 border-2 border-purple-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedAcquisitionOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {option.id === 'baby_chicks' ? '🐣' : '🐔'}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
                  {option.title}
                </div>
                <div className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  {option.description}
                </div>
                {option.layingDelayMonths > 0 && (
                  <div className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-600 mb-2">
                    {option.layingDelayMonths} months until laying
                  </div>
                )}
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
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
        transition={{ delay: 0.15 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Feeding Approach</h2>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          Your feeding approach significantly impacts both costs and chicken health. Consider your available time, space for free-ranging, access to kitchen scraps, and whether you prefer organic or conventional feeds. The right approach balances cost-effectiveness with your chickens' nutritional needs and your lifestyle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {feedOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedFeedOption.id === option.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50 border-2 border-purple-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedFeedOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  ${option.costPerBird.toFixed(2)}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
                  {option.title}
                </div>
                <div className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
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
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Egg Production Scenario</h2>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          Egg production varies significantly based on breed, age, season, and care quality. Younger hens in their prime (1-2 years) with good nutrition and long daylight hours will lay more eggs. Winter months, older hens, and stress can dramatically reduce production. Choose a scenario that matches your expected conditions and chicken care level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {productionOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`neu-form cursor-pointer transition-all duration-200 ${
                selectedProductionOption.id === option.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50 border-2 border-purple-500' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setSelectedProductionOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {option.eggsPerBirdPerWeek}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
                  {option.title}
                </div>
                <div className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  {option.description}
                </div>
              </div>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
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
              className="glass-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
            >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>Financial Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <StatCard 
                title="Monthly Egg Production" 
                total={results.monthlyEggProduction} 
                label={results.layingDelayMonths > 0 ? `after ${results.layingDelayMonths} months` : "eggs per month"}
                variant="corner-gradient"
              />
              <StatCard 
                title="Monthly Egg Value" 
                total={`$${results.monthlyEggValue.toFixed(2)}`} 
                label="potential revenue"
                variant="corner-gradient"
              />
              <StatCard 
                title="Monthly Feed Cost" 
                total={`$${results.monthlyFeedCost.toFixed(2)}`} 
                label="total feed expense"
                variant="corner-gradient"
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
                    {results.monthlyProfit > 0 ? 'Profitable' : 'Loss'} (when laying)
                  </span>
                }
                variant="corner-gradient"
              />
            </div>

            {results.layingDelayMonths > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>Baby Chick Timeline Impact</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Non-laying period:</span> {results.layingDelayMonths} months with $${results.nonLayingFeedCost.toFixed(2)} feed costs and no egg revenue
                      </p>
                      <p>
                        <span className="font-semibold">First year production:</span> Only {12 - results.layingDelayMonths} months of egg laying
                      </p>
                      <p>
                        <span className="font-semibold">Starting investment:</span> Remember to include chick costs in your starting investment above if purchasing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="neu-form">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>📈 Annual Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>First Year Feed Cost:</span>
                    <span className="font-semibold">
                      ${results.annualFeedCost.toFixed(2)}
                      <span className="text-xs ml-1 text-gray-500">(${results.monthlyFeedCost.toFixed(2)} × 12)</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>First Year Egg Value:</span>
                    <span className="font-semibold">
                      ${results.annualEggValue.toFixed(2)}
                      <span className="text-xs ml-1 text-gray-500">
                        (${results.monthlyEggValue.toFixed(2)} × {12 - results.layingDelayMonths})
                      </span>
                    </span>
                  </div>
                  {results.layingDelayMonths > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }}>• Non-laying months:</span>
                      <span className="text-orange-600">{results.layingDelayMonths} (feed only)</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold" style={{ color: '#111827' }}>First Year Profit:</span>
                    <span className={`font-bold ${
                      results.annualProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${results.annualProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="neu-form">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>⏱️ Payback Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Starting Investment:</span>
                    <span className="font-semibold">${startingCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Monthly Profit (when laying):</span>
                    <span className={`font-semibold ${
                      results.monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${results.monthlyProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold" style={{ color: '#111827' }}>Payback Period:</span>
                    <span className={`font-bold ${
                      results.paybackPeriod && results.paybackPeriod > 0 
                        ? results.paybackPeriod <= 12 ? 'text-green-600' : results.paybackPeriod <= 24 ? 'text-orange-600' : 'text-red-600'
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
          className="glass-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
        >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 lg:mb-6" style={{ color: '#111827' }}>💡 Viability Assessment</h2>
        
        <div className="space-y-4">
          <div className="info-point">
            <div>
              <h4 className="font-semibold mb-1" style={{ color: '#111827' }}>Break-Even Analysis</h4>
              <p className="text-sm" style={{ color: '#374151' }}>
                A dozen store-bought eggs costs $4-6+ in 2025. Each chicken lays about 20 eggs per month, 
                so your feed cost per bird should be less than $6-10 to break even on eggs alone.
              </p>
            </div>
          </div>

          <div className="info-point">
            <div>
              <h4 className="font-semibold mb-1" style={{ color: '#111827' }}>Your Assessment</h4>
                             <p className="text-sm" style={{ color: '#374151' }}>
                 {results.monthlyProfit > 0 
                   ? `With ${birdCount} chickens using ${selectedAcquisitionOption.title.toLowerCase()}, ${selectedFeedOption.title.toLowerCase()}, and ${selectedProductionOption.title.toLowerCase()}, 
                      you'll make $${results.monthlyProfit.toFixed(2)} per month once laying begins. 
                      ${results.layingDelayMonths > 0 
                        ? `However, with baby chicks, you'll wait ${results.layingDelayMonths} months and spend $${results.nonLayingFeedCost.toFixed(2)} on feed before seeing any eggs. `
                        : ''}
                      ${results.paybackPeriod && results.paybackPeriod > 0 
                        ? `Your $${startingCost} investment will pay for itself in ${results.paybackPeriod.toFixed(1)} months.`
                        : ''}`
                   : `With ${birdCount} chickens using ${selectedAcquisitionOption.title.toLowerCase()}, ${selectedFeedOption.title.toLowerCase()}, and ${selectedProductionOption.title.toLowerCase()}, 
                      you'll lose $${Math.abs(results.monthlyProfit).toFixed(2)} per month once laying begins. 
                      ${results.layingDelayMonths > 0 
                        ? `With baby chicks, you'd also spend ${results.layingDelayMonths} months feeding them before any egg production. `
                        : ''}
                      Consider reducing costs, choosing laying hens for faster returns, or increasing egg production to make it viable.`
                 }
               </p>
            </div>
          </div>

          <div className="info-point">
            <div>
              <h4 className="font-semibold mb-1" style={{ color: '#111827' }}>Recommendations</h4>
              <p className="text-sm" style={{ color: '#374151' }}>
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