import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry } from '../types';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { 
  StatCard, 
  SectionContainer, 
  GridContainer, 
  EmptyState 
} from './ui';
import { ChartCard } from './ui/charts/ChartCard';
import { NeumorphicSelect } from './forms/NeumorphicSelect';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface FlockSizeAtDate {
  date: string;
  totalBirds: number;
  hens: number;
  roosters: number;
  chicks: number;
  brooding: number;
}

interface FlockChange {
  date: string;
  type: 'acquisition' | 'death';
  changeAmount: number;
  previousCount: number;
  newCount: number;
  description: string;
  batchName?: string;
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
  flockChanges?: FlockChange[];
  subPeriods?: FeedPeriod[];
}

interface MonthlyFeedCostData {
  month: string;
  costPerBirdPerMonth: number;
  totalCost: number;
  avgFlockSize: number;
  feedPeriods: number;
}

export const FeedCostCalculator = () => {
  const { data } = useOptimizedAppData();
  const flockProfile = data.flockProfile;
  const feedInventory = data.feedInventory;
  
  const [flockHistory, setFlockHistory] = useState<FlockSizeAtDate[]>([]);
  const [feedPeriods, setFeedPeriods] = useState<FeedPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<FeedPeriod | null>(null);
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '12months' | 'all'>('6months');

    // Build flock size history from flock batches and death records
  useEffect(() => {
    const flockBatches = data.flockBatches;
    const deathRecords = data.deathRecords;
    
    if (!flockBatches.length) return;

    const history: FlockSizeAtDate[] = [];
    
    // Create timeline events from flock batches and death records
    const timelineEvents: Array<{
      date: string;
      type: 'acquisition' | 'death';
      batchId?: string;
      hens: number;
      roosters: number;
      chicks: number;
      brooding: number;
      totalBirds: number;
    }> = [];
    
    // Add acquisition events from flock batches
    flockBatches.forEach(batch => {
      if (!batch.isActive) return; // Skip inactive batches
      
      timelineEvents.push({
        date: batch.acquisitionDate,
        type: 'acquisition',
        batchId: batch.id,
        hens: batch.hensCount || 0,
        roosters: batch.roostersCount || 0,
        chicks: batch.chicksCount || 0,
        brooding: batch.broodingCount || 0,
        totalBirds: batch.initialCount // Use initial count, not current count
      });
    });
    
    // Add death events from death records
    deathRecords.forEach(deathRecord => {
      const batch = flockBatches.find(b => b.id === deathRecord.batchId);
      if (!batch || !batch.isActive) return;
      
      timelineEvents.push({
        date: deathRecord.date,
        type: 'death',
        batchId: deathRecord.batchId,
        hens: 0,
        roosters: 0,
        chicks: 0,
        brooding: 0,
        totalBirds: -deathRecord.count // Negative for death
      });
    });
    
    // Sort events chronologically
    timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Build cumulative flock size history
    let currentSize = {
      hens: 0,
      roosters: 0,
      chicks: 0,
      brooding: 0,
      totalBirds: 0
    };
    
    // Process each timeline event
    for (const event of timelineEvents) {
      if (event.type === 'acquisition') {
        currentSize = {
          hens: currentSize.hens + event.hens,
          roosters: currentSize.roosters + event.roosters,
          chicks: currentSize.chicks + event.chicks,
          brooding: currentSize.brooding + event.brooding,
          totalBirds: currentSize.totalBirds + event.totalBirds
        };
      } else if (event.type === 'death') {
        // For deaths, we reduce the total but maintain proportions
        const deathCount = Math.abs(event.totalBirds);
        currentSize = {
          hens: Math.max(0, currentSize.hens - Math.floor((currentSize.hens / currentSize.totalBirds) * deathCount) || 0),
          roosters: Math.max(0, currentSize.roosters - Math.floor((currentSize.roosters / currentSize.totalBirds) * deathCount) || 0),
          chicks: Math.max(0, currentSize.chicks - Math.floor((currentSize.chicks / currentSize.totalBirds) * deathCount) || 0),
          brooding: Math.max(0, currentSize.brooding - Math.floor((currentSize.brooding / currentSize.totalBirds) * deathCount) || 0),
          totalBirds: Math.max(0, currentSize.totalBirds - deathCount)
        };
      }
      
      // Add snapshot to history
      history.push({
        date: event.date,
        ...currentSize
      });
    }
    
    // If no events, add current flock profile as baseline
    if (history.length === 0 && flockProfile) {
      const profileDate = flockProfile.flockStartDate || new Date().toISOString().split('T')[0];
      history.push({
        date: profileDate,
        hens: flockProfile.hens || 0,
        roosters: flockProfile.roosters || 0,
        chicks: flockProfile.chicks || 0,
        brooding: flockProfile.brooding || 0,
        totalBirds: (flockProfile.hens || 0) + (flockProfile.roosters || 0) + (flockProfile.chicks || 0) + (flockProfile.brooding || 0)
      });
    }
    
    setFlockHistory(history);
  }, [data.flockBatches, data.deathRecords, flockProfile]);

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
      
      // Check if flock size changed during this feed period (inline implementation)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const flockChanges = flockHistory.filter(change => {
        const changeDate = new Date(change.date);
        return changeDate > start && changeDate <= end;
      });
      const hasFlockChanges = flockChanges.length > 0;
      
      if (hasFlockChanges) {
        // Handle periods with flock changes using consumption-based allocation
        const totalCost = feed.total_cost;
        const totalFeedQuantity = feed.quantity;
        
        // Build chronological list of all dates in this period (start + changes + end)
        const periodDates = [startDate, ...flockChanges.map(c => c.date), endDate]
          .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        // Calculate baseline consumption rate: total feed ÷ total bird-days
        const totalBirdDays = periodDates.slice(0, -1).reduce((total, date, i) => {
          const nextDate = periodDates[i + 1];
          const subDuration = Math.ceil(
            (new Date(nextDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
          );
          const flockSize = getFlockSizeAtDate(date);
          return total + (flockSize.totalBirds * subDuration);
        }, 0);
        
        const feedPerBirdPerDay = totalBirdDays > 0 ? totalFeedQuantity / totalBirdDays : 0;
        const costPerBirdPerDay = totalBirdDays > 0 ? totalCost / totalBirdDays : 0;
        const costPerBirdPerMonth = costPerBirdPerDay * 30;
        
        // Create sub-periods with consumption-based allocation
        const subPeriods: FeedPeriod[] = [];
        
        for (let i = 0; i < periodDates.length - 1; i++) {
          const subStartDate = periodDates[i];
          const subEndDate = periodDates[i + 1];
          const subDuration = Math.ceil(
            (new Date(subEndDate).getTime() - new Date(subStartDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (subDuration <= 0) continue;
          
          const subFlockSize = getFlockSizeAtDate(subStartDate);
          const birdDays = subFlockSize.totalBirds * subDuration;
          
          // Feed consumed and cost for this sub-period
          const feedConsumed = birdDays * feedPerBirdPerDay;
          const subCost = birdDays * costPerBirdPerDay;
          
          subPeriods.push({
            feedEntry: { ...feed, quantity: feedConsumed },
            startDate: subStartDate,
            endDate: subEndDate,
            duration: subDuration,
            totalCost: subCost,
            flockSize: subFlockSize,
            costPerBirdPerDay: costPerBirdPerDay, // Same for all sub-periods
            costPerBirdPerMonth: costPerBirdPerMonth, // Same for all sub-periods
            hasFlockChanges: false
          });
        }
        
        // Weighted averages (should equal the consistent rate)
        const weightedCostPerBirdPerDay = costPerBirdPerDay;
        const weightedCostPerBirdPerMonth = costPerBirdPerMonth;
        
        // Build detailed flock change information
        const detailedFlockChanges: FlockChange[] = flockChanges.map((change, index) => {
          const previousChange = index > 0 ? flockChanges[index - 1] : 
            getFlockSizeAtDate(startDate);
          
          // Determine change type and details from our timeline data
          const timelineEvent = data.flockBatches.find(batch => batch.acquisitionDate === change.date) ||
            data.deathRecords.find(record => record.date === change.date);
            
          let changeType: 'acquisition' | 'death' = 'acquisition';
          let description = 'Flock change';
          let batchName: string | undefined;
          let changeAmount = 0;
          
          if (timelineEvent) {
            if ('batchName' in timelineEvent) {
              // It's a batch acquisition
              changeType = 'acquisition';
              changeAmount = timelineEvent.initialCount;
              description = `Added ${changeAmount} birds from batch "${timelineEvent.batchName}"`;
              batchName = timelineEvent.batchName;
            } else {
              // It's a death record
              changeType = 'death';
              changeAmount = -timelineEvent.count;
              const batch = data.flockBatches.find(b => b.id === timelineEvent.batchId);
              description = `Lost ${Math.abs(changeAmount)} birds - ${timelineEvent.cause}`;
              if (batch) {
                description += ` (from batch "${batch.batchName}")`;
                batchName = batch.batchName;
              }
            }
          }
          
          return {
            date: change.date,
            type: changeType,
            changeAmount,
            previousCount: previousChange.totalBirds,
            newCount: change.totalBirds,
            description,
            batchName
          };
        });
        
        // Create parent period with weighted averages
        periods.push({
          feedEntry: feed,
          startDate,
          endDate,
          duration,
          totalCost,
          flockSize: getFlockSizeAtDate(startDate), // Flock size at start of period
          costPerBirdPerDay: weightedCostPerBirdPerDay,
          costPerBirdPerMonth: weightedCostPerBirdPerMonth,
          hasFlockChanges: true,
          flockChanges: detailedFlockChanges,
          subPeriods: subPeriods
        });
      } else {
        // Simple case: flock size constant throughout period
        const flockSize = getFlockSizeAtDate(startDate);
        const totalCost = feed.total_cost;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedInventory, flockHistory]);

  const getFlockSizeAtDate = useCallback((date: string): FlockSizeAtDate => {
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
  }, [flockHistory]);

   
  // @ts-expect-error - Utility function for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getFlockChangesDuringPeriod = useCallback((startDate: string, endDate: string): FlockSizeAtDate[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return flockHistory.filter(change => {
      const changeDate = new Date(change.date);
      return changeDate > start && changeDate <= end;
    });
  }, [flockHistory]);

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
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-orange-600 font-medium">
                    ⚠️ {period.flockChanges?.length || 0} flock change{period.flockChanges?.length !== 1 ? 's' : ''} during period
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    📊 Consumption-based allocation applied
                  </p>
                </div>
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

          {/* Flock Changes Section */}
          {period.hasFlockChanges && period.flockChanges && period.flockChanges.length > 0 && (
            <div className="mt-4 pl-6 border-l-2 border-orange-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">🔄 Flock Changes During This Period:</h5>
              <div className="space-y-2">
                {period.flockChanges.map((change, changeIndex) => (
                  <motion.div
                    key={`${period.feedEntry.id}-change-${changeIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.05) + (changeIndex * 0.02) }}
                    className={`rounded-lg p-3 border ${
                      change.type === 'acquisition' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Date</p>
                        <p className="text-sm font-medium">{change.date}</p>
                        <p className={`text-xs font-medium mt-1 ${
                          change.type === 'acquisition' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.type === 'acquisition' ? '+ Added' : '- Lost'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Change</p>
                        <p className={`text-sm font-medium ${
                          change.type === 'acquisition' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {change.previousCount} → {change.newCount} birds
                        </p>
                        <p className={`text-xs ${
                          change.type === 'acquisition' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.type === 'acquisition' ? '+' : ''}{change.changeAmount} birds
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Details</p>
                        <p className="text-sm text-gray-700">{change.description}</p>
                        {change.batchName && (
                          <p className="text-xs text-blue-600 mt-1">Batch: {change.batchName}</p>
                        )}
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
                    <p><span className="text-gray-600">Total Price:</span> ${period.feedEntry.total_cost}</p>
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

   
  // @ts-expect-error - Utility function for future use  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _calculateSubPeriods = useCallback((feed: FeedEntry, flockChanges: FlockSizeAtDate[], startDate: string, endDate: string): FeedPeriod[] => {
    const subPeriods: FeedPeriod[] = [];
    const totalCost = feed.total_cost;
    
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
  }, [getFlockSizeAtDate]);

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

  const calculateMonthlyTrends = (): MonthlyFeedCostData[] => {
    const filteredPeriods = getFilteredPeriods();
    if (filteredPeriods.length === 0) return [];

    const monthlyData = new Map<string, {
      costs: number[];
      totalCosts: number[];
      flockSizes: number[];
      periodCount: number;
    }>();

    filteredPeriods.forEach(period => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      
      // Generate months this period spans
      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (currentMonth <= endMonth) {
        const monthKey = currentMonth.toISOString().slice(0, 7); // YYYY-MM format
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            costs: [],
            totalCosts: [],
            flockSizes: [],
            periodCount: 0
          });
        }

        const monthData = monthlyData.get(monthKey)!;
        monthData.costs.push(period.costPerBirdPerMonth);
        monthData.totalCosts.push(period.totalCost);
        monthData.flockSizes.push(period.flockSize.totalBirds);
        monthData.periodCount++;

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    });

    // Convert to array and calculate averages
    const result: MonthlyFeedCostData[] = [];
    
    Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([monthKey, data]) => {
        const avgCostPerBird = data.costs.reduce((sum, cost) => sum + cost, 0) / data.costs.length;
        const avgTotalCost = data.totalCosts.reduce((sum, cost) => sum + cost, 0) / data.totalCosts.length;
        const avgFlockSize = data.flockSizes.reduce((sum, size) => sum + size, 0) / data.flockSizes.length;
        
        const date = new Date(monthKey + '-01');
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        result.push({
          month: monthLabel,
          costPerBirdPerMonth: avgCostPerBird,
          totalCost: avgTotalCost,
          avgFlockSize: Math.round(avgFlockSize),
          feedPeriods: data.periodCount
        });
      });

    return result;
  };

  const averages = calculateAverages();
  const filteredPeriods = getFilteredPeriods();
  const monthlyTrends = calculateMonthlyTrends();

  return (
    <div className="space-y-6">
      {/* Key Metrics Section */}
      {averages && (
        <>
          <SectionContainer 
            variant="card"
            className="border-0 bg-gradient-to-br from-gray-50 to-slate-50"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">💰 Cost Summary</h2>
              <div className="min-w-[200px]">
                <NeumorphicSelect
                  label="Time Range"
                  value={timeRange}
                  onChange={(value) => setTimeRange(value as '3months' | '6months' | '12months' | 'all')}
                  options={[
                    { value: '3months', label: 'Last 3 Months' },
                    { value: '6months', label: 'Last 6 Months' },
                    { value: '12months', label: 'Last 12 Months' },
                    { value: 'all', label: 'All Time' }
                  ]}
                />
              </div>
            </div>
          </SectionContainer>

          <GridContainer columns={4} gap="md" equalHeight>
            <StatCard 
              title="Monthly Cost" 
              total={`$${averages.avgCostPerBirdPerMonth.toFixed(2)}`} 
              label="per bird"
              variant="corner-gradient"
              icon="📅"
            />
            <StatCard 
              title="Daily Cost" 
              total={`$${averages.avgCostPerBirdPerDay.toFixed(3)}`} 
              label="per bird"
              variant="corner-gradient"
              icon="🌅"
            />
            <StatCard 
              title="Total Spent" 
              total={`$${averages.totalCost.toFixed(2)}`} 
              label={`over ${averages.totalDays} days`}
              variant="corner-gradient"
              icon="💸"
            />
            <StatCard 
              title="Feed Cycles" 
              total={averages.periodCount} 
              label="completed"
              variant="corner-gradient"
              icon="🔄"
            />
          </GridContainer>
        </>
      )}

      {/* Feed Cost Trends Chart */}
      {monthlyTrends.length > 0 && (
        <SectionContainer
          title="📈 Feed Cost Trends"
          description="Monthly feed cost per bird, total monthly costs, and flock size over time"
          variant="glass"
        >
          <ChartCard
            title="Feed Cost Analysis Over Time"
            subtitle="Monthly feed cost per bird, total monthly cost, and flock size trends"
            height={360}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="cost"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  width={20}
                  fontSize={12}
                  tick={false}
                />
                <YAxis 
                  yAxisId="total"
                  orientation="right"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  width={20}
                  fontSize={12}
                  tick={false}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Cost Per Bird') return [`$${Number(value).toFixed(2)}`, name];
                    if (name === 'Total Cost') return [`$${Number(value).toFixed(2)}`, name];
                    if (name === 'Avg Flock Size') return [`${value} birds`, name];
                    return [value, name];
                  }}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend />
                <Line 
                  yAxisId="cost"
                  type="monotone" 
                  dataKey="costPerBirdPerMonth" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Cost Per Bird"
                  dot={{ r: 5, fill: '#10B981' }}
                  activeDot={{ r: 7, fill: '#059669' }}
                />
                <Line 
                  yAxisId="total"
                  type="monotone" 
                  dataKey="totalCost" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Total Cost"
                  dot={{ r: 5, fill: '#F59E0B' }}
                  activeDot={{ r: 7, fill: '#D97706' }}
                />
                <Line 
                  yAxisId="cost"
                  type="monotone" 
                  dataKey="avgFlockSize" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Avg Flock Size"
                  dot={{ r: 3, fill: '#3B82F6' }}
                  activeDot={{ r: 5, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </SectionContainer>
      )}

      {/* Feed Period Details */}
      <SectionContainer
        title="📈 Feed Period Breakdown"
        description="Detailed analysis of each feed period with flock size considerations"
        variant="glass"
      >
        {filteredPeriods.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No Feed Periods Found"
            message="No completed feed periods found in the selected time range. Complete some feed cycles in your Feed Tracker to see detailed analysis here."
          />
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
      </SectionContainer>

      {/* Flock History Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionContainer
            title="📚 How Calculations Work"
            variant="card"
            className="bg-blue-50 border-blue-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-start gap-4 min-h-[80px]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">🧮</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Consumption-Based Allocation</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Establishes consistent cost per bird per day across the entire period, then allocates feed quantity and costs based on actual consumption patterns.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 min-h-[80px]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Usage Tips</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      For accuracy: Record flock changes in Profile timeline, mark feed as depleted in Feed Tracker.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 min-h-[80px]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Sub-Period Breakdown</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Feed periods with flock changes are divided into sub-periods, each with proportional cost allocation based on actual consumption.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 min-h-[80px]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Planning Tool</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Use these metrics to optimize feed purchasing and budgeting decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionContainer>
        </div>

        <div>
          <SectionContainer
            title="🐔 Flock Timeline"
            variant="card"
            className="h-fit sticky top-4"
          >
            {flockHistory.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  {flockHistory.length > 1 
                    ? `${flockHistory.length} size changes tracked`
                    : `Using current flock size of ${flockHistory[0]?.totalBirds || 0} birds`
                  }
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {flockHistory.slice(0, 5).map((size, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-3 rounded-lg border">
                      <div className="font-medium text-gray-900">{size.date}</div>
                      <div className="text-gray-600 mt-1">
                        <strong>{size.totalBirds}</strong> total birds
                      </div>
                      <div className="text-gray-500 text-xs">
                        {size.hens}H · {size.roosters}R · {size.chicks}C · {size.brooding}B
                      </div>
                    </div>
                  ))}
                  {flockHistory.length > 5 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      ...and {flockHistory.length - 5} more entries
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon="🐔"
                message="Add flock events in your Profile to see timeline"
                variant="compact"
              />
            )}
          </SectionContainer>
        </div>
      </div>
    </div>
  );
}; 