"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../../ui/cards/StatCard';
import AnimatedChickenViabilityPNG from '../../landing/animations/AnimatedChickenViabilityPNG';
import { LandingNavbar } from '../../landing/LandingNavbar';

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

export const Costs = () => {
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
    const annualProfit = annualEggValue - annualFeedCost - startingCost;
    
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

  // Remove top margin from AnimatedChickenViabilityPNG on this page only
  useEffect(() => {
    const element = document.querySelector('[class*="mt-[70px]"]');
    if (element) {
      (element as HTMLElement).style.marginTop = '0px';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Navigation */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border-b border-gray-200 pt-16 dark:bg-gray-900 dark:border-gray-700"
      >
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How Much Does It Cost to Keep Chickens?
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Calculate the real costs of backyard chicken keeping with our interactive calculator. 
              Get accurate estimates for setup costs, monthly expenses, and potential savings.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free calculator
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Real-world data
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Instant results
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Calculator */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 lg:mt-0 lg:mb-[10%] lg:mx-[10%]" style={{ marginTop: '0' }}>
        
        <AnimatedChickenViabilityPNG />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Starting Investment</h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Starting costs for chicken keeping can vary dramatically based on your situation. Some people can start with minimal investment using existing structures and gifted birds, while others need to build everything from scratch. Consider your available space, DIY skills, and whether you have existing materials or structures to work with.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-700">
            <p className="text-blue-800 dark:text-blue-300">
              <span className="font-semibold">ðŸ’° Don't forget:</span> If you're purchasing birds, include their costs in your starting investment above. Baby chicks typically cost $3-5 each, while laying hens cost $15-25 each. Many people receive birds for free from friends or neighbors!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {startingCostOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedStartingCostOption.id === option.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                }`}
                onClick={() => setSelectedStartingCostOption(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ${option.cost}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </div>
                </div>
                <ul className="space-y-2">
                  {option.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">âœ“</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Custom Amount</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter custom amount"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">USD</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Setup Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="birdCount">
                Number of Chickens
              </label>
              <input
                id="birdCount"
                type="number"
                min="1"
                max="100"
                value={birdCount}
                onChange={(e) => setBirdCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" dark:border-gray-600 dark:bg-gray-800 dark:text-white
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="eggPrice">
                Price per Egg ($)
              </label>
              <input
                id="eggPrice"
                type="number"
                min="0"
                step="0.01"
                value={eggPrice}
                onChange={(e) => setEggPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" dark:border-gray-600 dark:bg-gray-800 dark:text-white
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Acquisition Method</h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Your acquisition method significantly impacts both costs and timeline. Baby chicks cost less upfront but require 5 months of feeding before they start laying eggs. Mature laying hens cost more initially but begin producing immediately. Consider your patience, budget, and desire to raise chickens from the beginning.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acquisitionOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedAcquisitionOption.id === option.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                }`}
                onClick={() => setSelectedAcquisitionOption(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">
                    {option.id === 'baby_chicks' ? 'ðŸ£' : 'ðŸ”'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </div>
                  {option.layingDelayMonths > 0 && (
                    <div className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium mb-3">
                      {option.layingDelayMonths} months until laying
                    </div>
                  )}
                </div>
                <ul className="space-y-2">
                  {option.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">âœ“</span>
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Feeding Approach</h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Your feeding approach significantly impacts both costs and chicken health. Consider your available time, space for free-ranging, access to kitchen scraps, and whether you prefer organic or conventional feeds. The right approach balances cost-effectiveness with your chickens' nutritional needs and your lifestyle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedFeedOption.id === option.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                }`}
                onClick={() => setSelectedFeedOption(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ${option.costPerBird.toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </div>
                </div>
                <ul className="space-y-2">
                  {option.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">âœ“</span>
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Egg Production Scenario</h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Egg production varies significantly based on breed, age, season, and care quality. Younger hens in their prime (1-2 years) with good nutrition and long daylight hours will lay more eggs. Winter months, older hens, and stress can dramatically reduce production. Choose a scenario that matches your expected conditions and chicken care level.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productionOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedProductionOption.id === option.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                }`}
                onClick={() => setSelectedProductionOption(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {option.eggsPerBirdPerWeek}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </div>
                </div>
                <ul className="space-y-2">
                  {option.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">âœ“</span>
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
              className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl shadow-lg p-6 lg:p-8"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Cost Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="flex items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Baby Chick Timeline Impact</h3>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ðŸ“ˆ Annual Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">First Year Feed Cost:</span>
                      <span className="font-semibold">
                        ${results.annualFeedCost.toFixed(2)}
                        <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">(${results.monthlyFeedCost.toFixed(2)} Ã— 12)</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">First Year Egg Value:</span>
                      <span className="font-semibold">
                        ${results.annualEggValue.toFixed(2)}
                        <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
                          (${results.monthlyEggValue.toFixed(2)} Ã— {12 - results.layingDelayMonths})
                        </span>
                      </span>
                    </div>
                    {results.layingDelayMonths > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">â€¢ Non-laying months:</span>
                        <span className="text-orange-600">{results.layingDelayMonths} (feed only)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Starting Investment:</span>
                      <span className="font-semibold">${startingCost}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900 dark:text-white">First Year Profit:</span>
                      <span className={`font-bold ${
                        results.annualProfit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${results.annualProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">â±ï¸ Payback Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Starting Investment:</span>
                      <span className="font-semibold">${startingCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Profit (when laying):</span>
                      <span className={`font-semibold ${
                        results.monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${results.monthlyProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900 dark:text-white">Payback Period:</span>
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
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl shadow-lg p-6 lg:p-8"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">ðŸ’¡ Cost Assessment</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Break-Even Analysis</h4>
              <p className="text-gray-700 dark:text-gray-300">
                A dozen store-bought eggs costs $4-6+ in 2025. Each chicken lays about 20 eggs per month, 
                so your feed cost per bird should be less than $6-10 to break even on eggs alone.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Assessment</h4>
              <p className="text-gray-700 dark:text-gray-300">
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

            <div className="bg-white rounded-lg p-6 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {results.monthlyProfit > 0 
                  ? "This looks like a viable chicken-keeping venture! Consider starting with a small flock and expanding as you gain experience."
                  : "Consider starting with fewer chickens, using a more budget-friendly feeding approach, or increasing your egg prices to make this viable."
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8 text-center"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Start Your Chicken Journey?</h2>
          <p className="text-lg mb-6 opacity-90">
            Get our comprehensive chicken management app to track costs, production, and maximize your flock's potential.
          </p>
          <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Try Our Chicken Manager
          </button>
        </motion.div>
      </div>
    </div>
  );
};
