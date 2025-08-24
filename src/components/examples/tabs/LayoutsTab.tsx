import React from 'react';
import { StatCard } from '../../ui/cards/StatCard';
import { MetricDisplay } from '../../ui/cards/MetricDisplay';
import { ProgressCard } from '../../ui/cards/ProgressCard';
import { ComparisonCard } from '../../ui/cards/ComparisonCard';
import { SummaryCard } from '../../ui/cards/SummaryCard';

const LayoutsTab: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Dashboard Layout */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Layout</h2>
          <p className="text-gray-600">Two-column responsive dashboard layout</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ProgressCard
              title="Daily Egg Production"
              value={47}
              max={50}
              label="Target: 50 eggs"
              variant="detailed"
            />
            <ProgressCard
              title="Feed Consumption"
              value={23}
              max={30}
              label="Daily allowance"
              variant="detailed"
            />
          </div>
          <div className="space-y-6">
            <StatCard
              title="Active Hens"
              total="45"
              label="laying hens"
              change={2}
              changeType="increase"
              trend="up"
              icon="🐔"
            />
            <StatCard
              title="Revenue Today"
              total="$23.50"
              label="from sales"
              change={12}
              changeType="increase"
              trend="up"
              icon="💰"
            />
          </div>
        </div>
      </section>

      {/* Analytics Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Grid</h2>
          <p className="text-gray-600">Four-column metrics display</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricDisplay
            label="Daily Production"
            value={47}
            format="number"
            unit=" eggs"
          />
          <MetricDisplay
            label="Weekly Average"
            value={44.2}
            format="decimal"
            precision={1}
            unit=" eggs"
          />
          <MetricDisplay
            label="Efficiency Rate"
            value={94.0}
            format="percentage"
          />
          <MetricDisplay
            label="Revenue/Egg"
            value={0.50}
            format="currency"
          />
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Comparison</h2>
          <p className="text-gray-600">Side-by-side comparison cards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ComparisonCard
            title="This Week vs Last Week"
            before={{ value: 287, label: "Previous Week" }}
            after={{ value: 324, label: "Current Week" }}
            format="number"
          />
          <ComparisonCard
            title="Feed Efficiency"
            before={{ value: 1.2, label: "Last Month" }}
            after={{ value: 1.4, label: "This Month" }}
            format="decimal"
          />
        </div>
      </section>

      {/* Financial Summary Layout */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Summary Layout</h2>
          <p className="text-gray-600">Three-column summary cards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Revenue Streams"
            items={[
              { label: "Egg Sales", value: "$1,247" },
              { label: "Fertilizer", value: "$125" },
              { label: "Consulting", value: "$300" }
            ]}
            variant="detailed"
          />
          <SummaryCard
            title="Operating Costs"
            items={[
              { label: "Feed", value: "$423" },
              { label: "Utilities", value: "$87" },
              { label: "Maintenance", value: "$65" }
            ]}
            variant="detailed"
          />
          <SummaryCard
            title="Profit Analysis"
            items={[
              { label: "Gross Profit", value: "$1,097" },
              { label: "Margin", value: "65.6%" },
              { label: "ROI", value: "23.4%" }
            ]}
            variant="detailed"
          />
        </div>
      </section>

      {/* Mixed Dashboard Layout */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mixed Dashboard Layout</h2>
          <p className="text-gray-600">Complex 12-column grid with mixed component types</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-6">
          {/* Top row - spans 4 columns each on xl screens */}
          <div className="xl:col-span-4">
            <StatCard
              title="Total Eggs"
              total="1,423"
              label="this month"
              change={15}
              changeType="increase"
              trend="up"
              icon="🥚"
            />
          </div>
          
          <div className="xl:col-span-4">
            <MetricDisplay
              label="Revenue Goal"
              value={87.3}
              format="percentage"
            />
          </div>
          
          <div className="xl:col-span-4">
            <ProgressCard
              title="Monthly Target"
              value={1423}
              max={1500}
              label="1,500 egg goal"
              variant="compact"
            />
          </div>
          
          {/* Middle row - 8 and 4 column split */}
          <div className="xl:col-span-8">
            <SummaryCard
              title="Weekly Production Summary"
              items={[
                { label: "Monday", value: "47 eggs" },
                { label: "Tuesday", value: "45 eggs" },
                { label: "Wednesday", value: "49 eggs" },
                { label: "Thursday", value: "46 eggs" },
                { label: "Friday", value: "48 eggs" },
                { label: "Saturday", value: "44 eggs" },
                { label: "Sunday", value: "45 eggs" }
              ]}
              variant="detailed"
              showDividers
            />
          </div>
          
          <div className="xl:col-span-4 space-y-6">
            <ComparisonCard
              title="Daily Average"
              before={{ value: 42.1, label: "Last Month" }}
              after={{ value: 46.3, label: "This Month" }}
              format="decimal"
            />
          </div>
          
          {/* Bottom row - full width stats */}
          <div className="xl:col-span-3">
            <StatCard
              title="Feed Efficiency"
              total="1.4"
              label="eggs per lb"
              change={0.2}
              changeType="increase"
              trend="up"
              variant="compact"
            />
          </div>
          
          <div className="xl:col-span-3">
            <StatCard
              title="Active Hens"
              total="45"
              label="out of 50"
              change={2}
              changeType="increase"
              trend="neutral"
              variant="compact"
            />
          </div>
          
          <div className="xl:col-span-3">
            <StatCard
              title="Nest Usage"
              total="90%"
              label="occupancy rate"
              change={5}
              changeType="increase"
              trend="up"
              variant="compact"
            />
          </div>
          
          <div className="xl:col-span-3">
            <StatCard
              title="Health Score"
              total="9.2"
              label="out of 10"
              change={0.3}
              changeType="increase"
              trend="up"
              variant="compact"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LayoutsTab;