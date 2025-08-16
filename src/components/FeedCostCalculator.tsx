import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry } from '../types';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { StatCard } from './testCom';

interface FlockSizeAtDate {
  date: string;
  totalBirds: number;
  hens: number;
  roosters: number;
  chicks: number;
  brooding: number;
}

interface FeedPeriod {
  feedEntry: FeedEntry;
  startDate: string;
  endDate: string;
  duration: number;
  totalCost: number;
  flockSize: FlockSizeAtDate;
  costPerBirdPerDay: number;
  costPerBirdPerMonth: number;
  hasFlockChanges?: boolean;
  subPeriods?: FeedPeriod[];
}

export const FeedCostCalculator = () => {
  const { data } = useOptimizedAppData();
  const flockProfile = data.flockProfile;
  const feedInventory = data.feedInventory;
  
  const [flockHistory, setFlockHistory] = useState<FlockSizeAtDate[]>([]);
  const [feedPeriods, setFeedPeriods] = useState<FeedPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedPeriod | null>(null);
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '12months' | 'all'>('6months');

    // Build flock size history from events and profile
  useEffect(() => {
    if (!flockProfile) return;



    const history: FlockSizeAtDate[] = [];
    
    // Process events chronologically to build the flock history
    const sortedEvents = [...(flockProfile.events || [])].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Use the earliest event date as the start date, or flock start date if earlier
    let startDate = flockProfile.flockStartDate || new Date().toISOString().split('T')[0];
    if (sortedEvents.length > 0) {
      const earliestEventDate = sortedEvents[0].date;
      if (new Date(earliestEventDate) < new Date(startDate)) {
        startDate = earliestEventDate;
      }
    }

    
    // Find the first acquisition event to use as our baseline
    const firstAcquisition = sortedEvents.find(event => event.type === 'acquisition' && event.affectedBirds);
    
    let currentSize;
    if (firstAcquisition && firstAcquisition.affectedBirds) {
      // Use the first acquisition as the baseline
      currentSize = {
        totalBirds: firstAcquisition.affectedBirds,
        hens: firstAcquisition.affectedBirds,
        roosters: 0,
        chicks: 0,
        brooding: 0
      };
    } else {
      // No acquisition event, use reasonable default
      currentSize = {
        totalBirds: 10,
        hens: 10,
        roosters: 0,
        chicks: 0,
        brooding: 0
      };
    }
    
    // Add the starting point
    history.push({
      date: startDate,
      ...currentSize
    });
    
    // Process remaining events (skip the first acquisition since we used it as baseline)
    for (const event of sortedEvents) {
      if (event.type === 'acquisition' && event === firstAcquisition) {
        continue;
      }
      
      // Handle different event types that affect flock size
      if (event.affectedBirds) {
        const affectedBirds = event.affectedBirds;
        
        if (event.type === 'acquisition' || event.type === 'hatching') {
          currentSize = {
            ...currentSize,
            chicks: currentSize.chicks + affectedBirds,
            totalBirds: currentSize.totalBirds + affectedBirds
          };
        } else if (event.type === 'other') {
          // Check if this is a loss/death event (negative impact)
          // For now, let's assume "other" events with affected birds are losses
          if (event.description?.toLowerCase().includes('loss') || 
              event.description?.toLowerCase().includes('death') ||
              event.description?.toLowerCase().includes('died') ||
              event.notes?.toLowerCase().includes('loss') ||
              event.notes?.toLowerCase().includes('death') ||
              event.notes?.toLowerCase().includes('died')) {
            currentSize = {
              ...currentSize,
              totalBirds: Math.max(0, currentSize.totalBirds - affectedBirds),
              // Reduce from chicks first, then hens
              chicks: Math.max(0, currentSize.chicks - Math.min(affectedBirds, currentSize.chicks)),
              hens: currentSize.chicks >= affectedBirds ? currentSize.hens : Math.max(0, currentSize.hens - (affectedBirds - currentSize.chicks))
            };
          } else {
            currentSize = {
              ...currentSize,
              chicks: currentSize.chicks + affectedBirds,
              totalBirds: currentSize.totalBirds + affectedBirds
            };
          }
        } else {
          continue;
        }
        
        history.push({
          date: event.date,
          ...currentSize
        });
      }
    }
    setFlockHistory(history);
  }, [flockProfile]);

  // Calculate feed periods with flock size
  useEffect(() => {
    if (!feedInventory.length || !flockHistory.length) return;

    const periods: FeedPeriod[] = [];
    
    feedInventory.forEach(feed => {
      if (!feed.depletedDate) return; // Skip active feeds
      
      const startDate = feed.openedDate;
      const endDate = feed.depletedDate;
      const duration = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Check if flock size changed during this feed period
      const flockChanges = getFlockChangesDuringPeriod(startDate, endDate);
      const hasFlockChanges = flockChanges.length > 0;
      
      if (hasFlockChanges) {
        // Handle periods with flock changes by creating a parent period with sub-periods
        const subPeriods = calculateSubPeriods(feed, flockChanges, startDate, endDate);
        const totalCost = feed.quantity * feed.pricePerUnit;
        
        // Create parent period that contains the sub-periods
        periods.push({
          feedEntry: feed,
          startDate,
          endDate,
          duration,
          totalCost,
          flockSize: getFlockSizeAtDate(startDate), // Initial flock size
          costPerBirdPerDay: 0, // Will be calculated from sub-periods
          costPerBirdPerMonth: 0, // Will be calculated from sub-periods
          hasFlockChanges: true,
          subPeriods: subPeriods
        });
      } else {
        // Simple case: flock size constant throughout period
        const flockSize = getFlockSizeAtDate(startDate);
        const totalCost = feed.quantity * feed.pricePerUnit;
        const costPerBirdPerDay = flockSize.totalBirds > 0 ? totalCost / duration / flockSize.totalBirds : 0;
        const costPerBirdPerMonth = costPerBirdPerDay * 30;

        periods.push({
          feedEntry: feed,
          startDate,
          endDate,
          duration,
          totalCost,
          flockSize,
          costPerBirdPerDay,
          costPerBirdPerMonth,
          hasFlockChanges: false
        });
      }
    });

    // Sort by start date
    periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    setFeedPeriods(periods);
  }, [feedInventory, flockHistory]);

  const getFlockSizeAtDate = (date: string): FlockSizeAtDate => {
    const targetDate = new Date(date);
    
    // Find the most recent flock size before or on the target date
    for (let i = flockHistory.length - 1; i >= 0; i--) {
      const historyDate = new Date(flockHistory[i].date);
      if (historyDate <= targetDate) {
        return flockHistory[i];
      }
    }
    
    // Fallback to first entry
    return flockHistory[0] || {
      date,
      totalBirds: 0,
      hens: 0,
      roosters: 0,
      chicks: 0,
      brooding: 0
    };
  };

  const getFlockChangesDuringPeriod = (startDate: string, endDate: string): FlockSizeAtDate[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return flockHistory.filter(change => {
      const changeDate = new Date(change.date);
      return changeDate > start && changeDate <= end;
    });
  };

  const FeedPeriodTreeItem = ({ 
    period, 
    index, 
    selectedPeriod, 
    setSelectedPeriod 
  }: { 
    period: FeedPeriod; 
    index: number; 
    selectedPeriod: FeedPeriod | null; 
    setSelectedPeriod: (period: FeedPeriod | null) => void; 
  }) => {
    const isSelected = selectedPeriod?.feedEntry.id === period.feedEntry.id;
    const hasSubPeriods = period.subPeriods && period.subPeriods.length > 0;
    
    return (
      <div className="space-y-2">
        {/* Main Period */}
        <div
          className={`neu-form cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'ring-2 ring-green-500 bg-green-50 border-2 border-green-500' 
              : 'hover:bg-gray-50 border-2 border-transparent'
          }`}
          onClick={() => setSelectedPeriod(isSelected ? null : period)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">{period.feedEntry.brand}</h4>
              <p className="text-sm text-gray-600">{period.feedEntry.type}</p>
              {period.hasFlockChanges && (
                <p className="text-xs text-orange-600 font-medium mt-1">⚠️ Flock changed during period</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-medium">{period.startDate} to {period.endDate}</p>
              <p className="text-xs text-gray-500">{period.duration} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Flock Size</p>
              <p className="font-medium">{period.flockSize.totalBirds} birds</p>
              <p className="text-xs text-gray-500">
                {period.flockSize.hens}H {period.flockSize.roosters}R {period.flockSize.chicks}C {period.flockSize.brooding}B
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cost Per Bird</p>
              <p className="font-medium text-green-600">${period.costPerBirdPerMonth.toFixed(2)}/month</p>
              <p className="text-xs text-gray-500">${period.costPerBirdPerDay.toFixed(3)}/day</p>
            </div>
          </div>

          {/* Sub-periods (tree structure) */}
          {hasSubPeriods && (
            <div className="mt-4 pl-6 border-l-2 border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Sub-periods (flock changes):</h5>
              <div className="space-y-2">
                {period.subPeriods!.map((subPeriod, subIndex) => (
                  <motion.div
                    key={`${period.feedEntry.id}-sub-${subIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.05) + (subIndex * 0.02) }}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Sub-period</p>
                        <p className="text-sm font-medium">{subPeriod.startDate} to {subPeriod.endDate}</p>
                        <p className="text-xs text-gray-500">{subPeriod.duration} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Flock Size</p>
                        <p className="text-sm font-medium">{subPeriod.flockSize.totalBirds} birds</p>
                        <p className="text-xs text-gray-500">
                          {subPeriod.flockSize.hens}H {subPeriod.flockSize.roosters}R {subPeriod.flockSize.chicks}C {subPeriod.flockSize.brooding}B
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cost Per Bird</p>
                        <p className="text-sm font-medium text-green-600">${subPeriod.costPerBirdPerMonth.toFixed(2)}/month</p>
                        <p className="text-xs text-gray-500">${subPeriod.costPerBirdPerDay.toFixed(3)}/day</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed view when selected */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Feed Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Quantity:</span> {period.feedEntry.quantity} {period.feedEntry.unit}</p>
                    <p><span className="text-gray-600">Price per {period.feedEntry.unit}:</span> ${period.feedEntry.pricePerUnit}</p>
                    <p><span className="text-gray-600">Total Cost:</span> ${period.totalCost.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Consumption</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Daily per bird:</span> {(period.feedEntry.quantity / period.duration / period.flockSize.totalBirds).toFixed(3)} {period.feedEntry.unit}</p>
                    <p><span className="text-gray-600">Monthly per bird:</span> {(period.feedEntry.quantity / period.duration / period.flockSize.totalBirds * 30).toFixed(2)} {period.feedEntry.unit}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Cost Analysis</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Daily total:</span> ${(period.totalCost / period.duration).toFixed(2)}</p>
                    <p><span className="text-gray-600">Monthly total:</span> ${(period.totalCost / period.duration * 30).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const calculateSubPeriods = (feed: FeedEntry, flockChanges: FlockSizeAtDate[], startDate: string, endDate: string): FeedPeriod[] => {
    const subPeriods: FeedPeriod[] = [];
    const totalCost = feed.quantity * feed.pricePerUnit;
    
    // Sort changes by date
    const sortedChanges = [...flockChanges].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // First, build all sub-periods to calculate total bird-days
    const periods: Array<{
      startDate: string;
      endDate: string;
      duration: number;
      flockSize: FlockSizeAtDate;
      birdDays: number;
    }> = [];
    
    let currentDate = new Date(startDate);
    let currentFlockSize = getFlockSizeAtDate(startDate);
    
    // Add initial period before first change
    if (sortedChanges.length > 0) {
      const firstChangeDate = new Date(sortedChanges[0].date);
      const initialDays = Math.ceil((firstChangeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (initialDays > 0) {
        const birdDays = initialDays * currentFlockSize.totalBirds;
        periods.push({
          startDate: currentDate.toISOString().split('T')[0],
          endDate: firstChangeDate.toISOString().split('T')[0],
          duration: initialDays,
          flockSize: currentFlockSize,
          birdDays
        });
        
        currentDate = firstChangeDate;
        currentFlockSize = sortedChanges[0];
      }
    }
    
    // Add periods for each change
    for (let i = 0; i < sortedChanges.length; i++) {
      const change = sortedChanges[i];
      const nextChange = sortedChanges[i + 1];
      const endOfPeriod = nextChange ? new Date(nextChange.date) : new Date(endDate);
      const periodDays = Math.ceil((endOfPeriod.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (periodDays > 0) {
        const birdDays = periodDays * change.totalBirds;
        periods.push({
          startDate: currentDate.toISOString().split('T')[0],
          endDate: endOfPeriod.toISOString().split('T')[0],
          duration: periodDays,
          flockSize: change,
          birdDays
        });
        
        currentDate = endOfPeriod;
        currentFlockSize = change;
      }
    }
    
    // Calculate total bird-days across all periods
    const totalBirdDays = periods.reduce((sum, period) => sum + period.birdDays, 0);
    

    
    // Distribute cost based on actual consumption (bird-days)
    for (const period of periods) {
      const proportionalCost = totalBirdDays > 0 ? (totalCost * period.birdDays) / totalBirdDays : 0;
      const costPerBirdPerDay = period.flockSize.totalBirds > 0 && period.duration > 0 
        ? proportionalCost / period.duration / period.flockSize.totalBirds 
        : 0;
      

      
      subPeriods.push({
        feedEntry: feed,
        startDate: period.startDate,
        endDate: period.endDate,
        duration: period.duration,
        totalCost: proportionalCost,
        flockSize: period.flockSize,
        costPerBirdPerDay,
        costPerBirdPerMonth: costPerBirdPerDay * 30,
        hasFlockChanges: true
      });
    }
    
    return subPeriods;
  };

  const getFilteredPeriods = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '3months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '12months':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return feedPeriods;
    }
    
    return feedPeriods.filter(period => 
      new Date(period.startDate) >= filterDate
    );
  };

  const calculateAverages = () => {
    const filteredPeriods = getFilteredPeriods();
    if (filteredPeriods.length === 0) return null;

    const totalCost = filteredPeriods.reduce((sum, period) => sum + period.totalCost, 0);
    const totalDays = filteredPeriods.reduce((sum, period) => sum + period.duration, 0);
    const avgCostPerBirdPerDay = filteredPeriods.reduce((sum, period) => sum + period.costPerBirdPerDay, 0) / filteredPeriods.length;
    const avgCostPerBirdPerMonth = avgCostPerBirdPerDay * 30;

    return {
      totalCost,
      totalDays,
      avgCostPerBirdPerDay,
      avgCostPerBirdPerMonth,
      periodCount: filteredPeriods.length
    };
  };

  const averages = calculateAverages();
  const filteredPeriods = getFilteredPeriods();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto p-0"
    >
      <div className="header">
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          🧮 Feed Cost Per Chicken Calculator
        </h1>
        <p className="text-gray-600 mt-2">Calculate accurate feed costs per bird using your timeline data</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">📊 Time Range</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="neu-input"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {averages && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <StatCard 
              title="Average Cost Per Bird" 
              total={`$${averages.avgCostPerBirdPerMonth.toFixed(2)}`} 
              label="per month"
            />
            <StatCard 
              title="Average Cost Per Bird" 
              total={`$${averages.avgCostPerBirdPerDay.toFixed(3)}`} 
              label="per day"
            />
            <StatCard 
              title="Total Feed Cost" 
              total={`$${averages.totalCost.toFixed(2)}`} 
              label={`over ${averages.totalDays} days`}
            />
            <StatCard 
              title="Feed Periods" 
              total={averages.periodCount} 
              label="completed cycles"
            />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">📈 Feed Period Analysis</h2>
        
        {filteredPeriods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No completed feed periods found in the selected time range.</p>
            <p className="text-sm text-gray-500 mt-2">Complete some feed cycles in your Feed Tracker to see analysis here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPeriods.map((period, index) => (
              <FeedPeriodTreeItem 
                key={period.feedEntry.id} 
                period={period} 
                index={index}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
              />
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">💡 How This Works</h2>
        
        <div className="space-y-4">
          <div className="info-point">
            <div className="info-icon">📅</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Flock Size History</h4>
              <p className="text-gray-700 text-sm">
                Based on your timeline events and current flock size, here's the flock size history:
              </p>
              <div className="mt-2 space-y-1">
                {flockHistory.map((size, index) => (
                  <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                    <strong>{size.date}:</strong> {size.totalBirds} birds ({size.hens}H {size.roosters}R {size.chicks}C {size.brooding}B)
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="info-point">
            <div className="info-icon">🧮</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Accurate Calculations</h4>
              <p className="text-gray-700 text-sm">
                For each completed feed cycle, we calculate the cost per bird by dividing the total feed cost by the number of days and the flock size during that period. 
                This gives you the most accurate per-bird costs, even when your flock size changes frequently.
              </p>
            </div>
          </div>

          <div className="info-point">
            <div className="info-icon">📊</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Usage Tips</h4>
              <p className="text-gray-700 text-sm">
                To get the most accurate results, make sure to: 1) Record all flock changes in your Profile timeline, 
                2) Mark feed as depleted when finished in Feed Tracker, 3) Use this data to adjust your Chicken Viability Calculator inputs.
              </p>
            </div>
          </div>

          <div className="info-point">
            <div className="info-icon">⚠️</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Current Flock History</h4>
              <p className="text-gray-700 text-sm">
                {flockHistory.length > 1 
                  ? `The calculator tracks your flock size changes over time. Your flock started with ${flockHistory[0]?.totalBirds} birds and has grown through ${flockHistory.length - 1} recorded events to your current size of ${flockHistory[flockHistory.length - 1]?.totalBirds} birds.`
                  : `Using current flock size of ${flockHistory[0]?.totalBirds || 0} birds for all calculations. Add timeline events in your Profile to get more accurate historical analysis.`
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 