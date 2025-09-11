import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import type { FlockSummary, FlockProfile } from '../../types';
import { StatCard, SectionContainer, GridContainer } from '../ui';
// import { EmptyState } from '../ui'; // Unused import

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface FlockSummaryDisplayProps extends BaseUIComponentProps {
  flockSummary: FlockSummary | null;
  profile: FlockProfile;
  batchLoading: boolean;
  hasLoadedOnce: boolean;
  onRefreshSummary: () => void;
}

export const FlockSummaryDisplay = memo(({
  flockSummary,
  profile,
  batchLoading,
  hasLoadedOnce,
  onRefreshSummary,
  className = '',
  testId
}: FlockSummaryDisplayProps) => {
  // Loading skeleton
  if (batchLoading && flockSummary === null) {
    return (
      <div className={`space-y-6 ${className}`}>
        <SectionContainer
          title="🐔 Flock Overview"
          variant="glass"
          testId={testId ? `${testId}-loading` : undefined}
        >
          <div className="flex items-center justify-end mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <GridContainer columns={{ md: 2, lg: 4 }} gap="md">
            <StatCard title="🐔 Total Birds" total={0} label="active birds" loading={true} />
            <StatCard title="🐔 Hens" total={0} label="female birds" loading={true} />
            <StatCard title="🐓 Roosters" total={0} label="male birds" loading={true} />
            <StatCard title="🐥 Chicks" total={0} label="young birds" loading={true} />
          </GridContainer>
          
          <GridContainer columns={{ md: 2, lg: 3 }} gap="md" className="mt-6">
            <StatCard title="🥚 Laying Hens" total={0} label="productive birds" loading={true} />
            <StatCard title="📦 Active Batches" total={0} label="managed groups" loading={true} />
            <StatCard title="💀 Total Losses" total={0} label="loading..." loading={true} />
          </GridContainer>
        </SectionContainer>

        <SectionContainer
          title="Batch Summary"
          variant="glass"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Batches...</h3>
          <GridContainer columns={{ md: 2, lg: 3 }} gap="sm">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </GridContainer>
        </SectionContainer>
      </div>
    );
  }

  // No data available state
  if (flockSummary === null && !batchLoading && hasLoadedOnce) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">📦</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">🚀 Batch Management Available!</h2>
            <p className="text-gray-700 mb-4">
              Upgrade your flock tracking with our new batch management system. Track groups of chickens, 
              log losses automatically, and get better production insights.
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">✨ Benefits:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Track chickens in groups instead of individual counts</li>
                <li>• Automatic count updates when logging deaths/losses</li>
                <li>• Production analysis based on actual flock size</li>
                <li>• Mortality tracking with detailed insights</li>
                <li>• Better egg production rate analysis</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">🔧 Setup Required:</h4>
              <p className="text-sm text-blue-800">
                Run the database migration in your Supabase dashboard. 
                See <code className="bg-blue-100 px-1 rounded">BATCH_MANAGEMENT_SETUP.md</code> for instructions.
              </p>
            </div>

            <div className="flex gap-3">
              <Link 
                to="/app/flock-batches" 
                className="neu-button-secondary text-sm"
              >
                View Batch Manager
              </Link>
              <button 
                onClick={onRefreshSummary}
                className="neu-button text-sm"
                disabled={batchLoading}
              >
                {batchLoading ? 'Checking...' : 'Check Again'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Flock summary data available
  if (flockSummary) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="space-y-6"
      >
        {/* Flock Statistics */}
        <div className="neu-form">
          <div className="flex items-center justify-between mb-6">
            <h2 className="neu-title">🐔 Flock Overview</h2>
            <Link 
              to="/app/flock-batches" 
              className="neu-button-secondary text-sm"
            >
              Manage Batches
            </Link>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="🐔 Total Birds" 
              total={batchLoading ? 0 : flockSummary.totalBirds} 
              label="active birds"
              loading={batchLoading}
            />
            <StatCard 
              title="🐔 Hens" 
              total={batchLoading ? 0 : (flockSummary.totalHens || 0)} 
              label="female birds"
              loading={batchLoading}
            />
            <StatCard 
              title="🐓 Roosters" 
              total={batchLoading ? 0 : (flockSummary.totalRoosters || 0)} 
              label="male birds"
              loading={batchLoading}
            />
            <StatCard 
              title="🐥 Chicks" 
              total={batchLoading ? 0 : (flockSummary.totalChicks || 0)} 
              label="young birds"
              loading={batchLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <StatCard 
              title="📦 Active Batches" 
              total={batchLoading ? 0 : flockSummary.activeBatches} 
              label="managed groups"
              loading={batchLoading}
            />
            <StatCard 
              title="🥚 Laying Hens" 
              total={batchLoading ? 0 : flockSummary.expectedLayers} 
              label="productive birds"
              loading={batchLoading}
            />
            <StatCard 
              title="💀 Total Losses" 
              total={batchLoading ? 0 : flockSummary.totalDeaths} 
              label={batchLoading ? "loading..." : `${flockSummary.mortalityRate}% mortality`}
              loading={batchLoading}
            />
          </div>
        </div>

        {/* Quick Batch Summary */}
        <div className="neu-form">
          <h2 className="neu-title">Batch Summary</h2>
          {batchLoading ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Batches...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : flockSummary.batchSummary.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500">No batches yet. Add your first batch to get started!</p>
              <Link
                to="/app/flock-batches"
                className="neu-button mt-4"
              >
                Add First Batch
              </Link>
            </div>
          ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Batches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flockSummary.batchSummary.slice(0, 6).map((batch) => (
                    <div key={batch.id} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {batch.type === 'hens' ? '🐔' : 
                           batch.type === 'roosters' ? '🐓' : 
                           batch.type === 'chicks' ? '🐥' : '🐔'}
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm">{batch.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{batch.breed}</p>
                      <p className="text-lg font-bold text-indigo-600">{batch.currentCount} birds</p>
                      <p className="text-xs text-gray-500">
                        Since {new Date(batch.acquisitionDate).toLocaleDateString()}
                      </p>
                      {batch.type === 'hens' && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                          batch.isLayingAge 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {batch.isLayingAge ? 'Laying Age' : 'Pre-Laying'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                {flockSummary.batchSummary.length > 6 && (
                  <div className="mt-4 text-center">
                    <button 
                      className="neu-button-secondary text-sm"
                      onClick={() => {
                        console.log('Show all batches');
                      }}
                    >
                      View All {flockSummary.batchSummary.length} Batches
                    </button>
                  </div>
                )}
              </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Migration notice
  if (flockSummary !== null && (flockSummary as FlockSummary).totalBirds === 0 && (profile.hens > 0 || profile.roosters > 0 || profile.chicks > 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="neu-form"
      >
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-lg">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Upgrade to Batch Management</h4>
              <p className="text-sm text-yellow-700 mb-3">
                You're currently tracking {profile.hens + profile.roosters + profile.chicks + profile.brooding} birds individually. 
                Batch management lets you track groups of chickens, log losses automatically, and get better production insights.
              </p>
              <Link 
                to="/app/flock-batches"
                className="neu-button-secondary text-sm bg-yellow-100 hover:bg-yellow-200"
              >
                Start Using Batches
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
});