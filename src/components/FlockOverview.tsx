import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from './ui/cards/StatCard';
import { SubmitButton } from './forms/SubmitButton';
import { useFlockBatchData, useFlockProfile } from '../contexts/OptimizedDataProvider';

interface FlockOverviewProps {
  className?: string;
}

export const FlockOverview: React.FC<FlockOverviewProps> = ({
  className
}) => {
  const navigate = useNavigate();
  // Use optimized data context
  const { data: { flockBatches: batches }, isLoading } = useFlockBatchData();
  const flockProfile = useFlockProfile();
  
  // Show skeleton if loading OR no data yet
  const shouldShowSkeleton = isLoading || batches.length === 0 || !flockProfile;

  // Always render the container to prevent CLS
  return (
    <div className={`neu-form ${className || ''}`} style={{ paddingLeft: 15, paddingRight: 15 }}>
      {shouldShowSkeleton ? (
        // True-to-form skeleton matching actual FlockOverview structure
        <>
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded w-28"></div>
          </div>

          {/* Stats grid skeleton - matches actual layout */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="glass-card p-6 space-y-4 animate-pulse">
                {/* Icon and title skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                {/* Total count skeleton */}
                <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                {/* Label skeleton */}
                <div className="h-3 bg-gray-200 rounded-full w-28"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Actual content
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="neu-title" style={{ marginBottom: 0 }}>Flock Overview</h2>
            <SubmitButton
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/flock-batches')}
              text="Manage Batches"
            />
          </div>

          {/* Batch-Specific Flock Overview Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-${batches.some(b => (b.broodingCount || 0) > 0) ? '5' : '4'} gap-4`}>
            <StatCard
              title="Laying"
              total={batches
                .filter(batch => batch.actualLayingStartDate)
                .reduce((sum, batch) => {
                  const hens = batch.hensCount || 0;
                  const brooding = batch.broodingCount || 0;
                  return sum + Math.max(0, hens - brooding);
                }, 0)}
              label={`${batches.filter(b => b.actualLayingStartDate && (b.hensCount || 0) > 0).length} batches laying`}
              icon="🐔"
              variant="corner-gradient"
            />
            <StatCard
              title="Not Laying"
              total={batches
                .filter(batch => !batch.actualLayingStartDate && ((batch.hensCount || 0) > 0 || batch.type === 'hens'))
                .reduce((sum, batch) => {
                  const hens = batch.hensCount || 0;
                  const brooding = batch.broodingCount || 0;
                  return sum + Math.max(0, hens - brooding);
                }, 0)}
              label={`${batches.filter(b => !b.actualLayingStartDate && ((b.hensCount || 0) > 0 || b.type === 'hens')).length} batches`}
              icon="⏳"
              variant="corner-gradient"
            />
            {batches.some(b => (b.broodingCount || 0) > 0) && (
              <StatCard
                title="Brooding"
                total={batches.reduce((sum, batch) => sum + (batch.broodingCount || 0), 0)}
                label={`${batches.filter(b => (b.broodingCount || 0) > 0).length} hen brooding`}
                icon="🐣"
                variant="corner-gradient"
              />
            )}
            <StatCard
              title="Roosters"
              total={batches.reduce((sum, batch) => sum + (batch.roostersCount || 0), 0)}
              label={`${batches.filter(b => (b.roostersCount || 0) > 0).length} batches`}
              icon="🐓"
              variant="corner-gradient"
            />
            <StatCard
              title="Chicks"
              total={batches.reduce((sum, batch) => sum + (batch.chicksCount || 0), 0)}
              label={`${batches.filter(b => (b.chicksCount || 0) > 0).length} batches`}
              icon="🐥"
              variant="corner-gradient"
            />
          </div>
        </>
      )}
    </div>
  );
};