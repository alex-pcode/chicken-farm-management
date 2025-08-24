import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StatCard } from './ui/cards/StatCard';
import type { FlockSummary } from '../types';

interface FlockOverviewProps {
  flockSummary: FlockSummary | null;
  isLoading?: boolean;
}

export const FlockOverview: React.FC<FlockOverviewProps> = ({
  flockSummary,
  isLoading = false,
}) => {
  if (!flockSummary && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="neu-form"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="neu-title">🐔 Flock Overview</h2>
        <Link 
          to="/flock-batches" 
          className="neu-button-secondary text-sm"
        >
          Manage Batches
        </Link>
      </div>

      {/* Flock Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Total Birds" 
          total={isLoading ? 0 : flockSummary?.totalBirds || 0} 
          label="active birds"
          icon="🐔"
          variant="gradient"
          loading={isLoading}
        />
        <StatCard 
          title="Hens" 
          total={isLoading ? 0 : flockSummary?.totalHens || 0} 
          label="female birds"
          icon="🐔"
          loading={isLoading}
        />
        <StatCard 
          title="Roosters" 
          total={isLoading ? 0 : flockSummary?.totalRoosters || 0} 
          label="male birds"
          icon="🐓"
          loading={isLoading}
        />
        <StatCard 
          title="Chicks" 
          total={isLoading ? 0 : flockSummary?.totalChicks || 0} 
          label="young birds"
          icon="🐥"
          loading={isLoading}
        />
        <StatCard 
          title="Active Batches" 
          total={isLoading ? 0 : flockSummary?.activeBatches || 0} 
          label="managed groups"
          icon="📦"
          loading={isLoading}
        />
        <StatCard 
          title="Laying Hens" 
          total={isLoading ? 0 : flockSummary?.expectedLayers || 0} 
          label="productive birds"
          icon="🥚"
          loading={isLoading}
        />
        <StatCard 
          title="Total Losses" 
          total={isLoading ? 0 : flockSummary?.totalDeaths || 0} 
          label={isLoading ? "loading..." : `${flockSummary?.mortalityRate || 0}% mortality`}
          icon="💀"
          trend={flockSummary?.mortalityRate && flockSummary.mortalityRate > 5 ? 'up' : 'neutral'}
          changeType={flockSummary?.mortalityRate && flockSummary.mortalityRate > 5 ? 'decrease' : undefined}
          loading={isLoading}
        />
        <StatCard 
          title="Mortality Rate" 
          total={isLoading ? 0 : `${flockSummary?.mortalityRate || 0}%`} 
          label="loss percentage"
          icon="📊"
          loading={isLoading}
        />
      </div>
    </motion.div>
  );
};