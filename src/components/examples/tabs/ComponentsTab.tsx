import React from 'react';
import { StatCard } from '../../ui/cards/StatCard';
import { MetricDisplay } from '../../ui/cards/MetricDisplay';
import { ProgressCard } from '../../ui/cards/ProgressCard';
import { ComparisonCard } from '../../ui/cards/ComparisonCard';
import { SummaryCard } from '../../ui/cards/SummaryCard';

const ComponentsTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* StatCard Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">StatCard Examples</h2>
          <p className="text-gray-600">Versatile cards for displaying key metrics and statistics</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Daily Eggs"
            total="47"
            label="eggs collected"
            change={12}
            changeType="increase"
            trend="up"
          />
          
          <StatCard
            title="Active Hens"
            total="45"
            label="currently laying"
            icon="🐔"
            change={2}
            changeType="increase"
            trend="neutral"
            variant="corner-gradient"
          />
          
          <div style={{ 
            color: '#2A2580',
            '--text-gray-900': '#2A2580',
            '--text-gray-500': '#2A2580'
          } as React.CSSProperties}>
            <StatCard
              title="Feed Remaining"
              total="87"
              label="lbs left"
              change={15}
              changeType="decrease"
              trend="down"
              variant="compact"
              className="[&_.text-gray-900]:!text-[#2A2580] [&_.text-gray-500]:!text-[#2A2580]"
            />
          </div>
          
          <div style={{ 
            color: '#191656',
            '--text-gray-900': '#191656',
            '--text-gray-500': '#191656'
          } as React.CSSProperties}>
            <StatCard
              title="Monthly Revenue"
              total="$1,247"
              label="from egg sales"
              change={23}
              changeType="increase"
              trend="up"
              variant="corner-gradient"
              onClick={() => alert('Revenue details clicked!')}
              className="[&_.text-gray-900]:!text-[#191656] [&_.text-gray-500]:!text-[#191656]"
            />
          </div>
          
          <StatCard
            title="Expenses"
            total="$423"
            label="this month"
            icon="💰"
            change={8}
            changeType="decrease"
            trend="up"
            variant="gradient"
          />
          
          <StatCard
            title="Premium Card"
            total="$2,847"
            label="premium features"
            icon="⭐"
            change={15}
            changeType="increase"
            trend="up"
            variant="corner-gradient"
          />
        </div>
      </section>

      {/* StatCard Dark Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">StatCard Dark Examples</h2>
          <p className="text-gray-600">Dark themed cards with white text styling</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Comparison Card - Exact HTML structure for design comparison */}
          <div className="stat-card">
            <h3 className="text-lg font-medium text-white">Net Profit/Loss</h3>
            <p className="text-3xl font-bold mt-2">-$91.09</p>
            <p className="text-sm text-white/90 mt-1">period profit only</p>
          </div>
          
          {/* Glass card style with icon on left - same colors as stat card */}
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="max-[480px]:hidden size-8 shrink-0 rounded-full bg-white/25 border border-white/50 flex items-center justify-center text-white">
                <span className="text-lg">⭐</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-base lg:text-lg mb-1">
                  Premium Card
                </div>
                <div className="font-semibold mb-2 text-2xl">
                  $2,847
                </div>
                <div className="text-xs text-white/90">
                  <span className="font-medium text-green-400">↗ +15%</span>
                  <span> vs </span>
                  <span>premium features</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MetricDisplay Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">MetricDisplay Examples</h2>
          <p className="text-gray-600">Flexible displays for various data types and formats</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay
            label="Total Revenue"
            value={1247.50}
            format="currency"
          />
          
          <MetricDisplay
            label="Productivity Rate"
            value={94.2}
            format="percentage"
            precision={1}
          />
          
          <MetricDisplay
            label="Average Weight"
            value={2.34}
            format="decimal"
            precision={2}
            unit=" oz"
          />
          
          <MetricDisplay
            label="Total Eggs"
            value={1423}
            format="number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricDisplay
            label="Compact Display"
            value={567}
            format="number"
            variant="compact"
          />
          
          <MetricDisplay
            label="Default Display"
            value={1234.56}
            format="currency"
            variant="default"
          />
          
          <MetricDisplay
            label="Large Display"
            value={89.7}
            format="percentage"
            variant="large"
          />
        </div>
      </section>

      {/* ProgressCard Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ProgressCard Examples</h2>
          <p className="text-gray-600">Visual progress indicators with customizable styling</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProgressCard
            title="Egg Production"
            value={78}
            max={100}
            label="Daily Goal"
          />
          
          <ProgressCard
            title="Feed Consumption"
            value={245}
            max={300}
            label="Weekly Target"
            variant="detailed"
          />
          
          <ProgressCard
            title="Nest Occupancy"
            value={42}
            max={50}
            label="Available Nests"
            variant="compact"
          />
          
          <ProgressCard
            title="Loading Progress"
            value={0}
            max={100}
            label="Processing..."
            loading
          />
        </div>
      </section>

      {/* ComparisonCard Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ComparisonCard Examples</h2>
          <p className="text-gray-600">Before and after comparisons with change indicators</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ComparisonCard
            title="Daily Egg Count"
            before={{ value: 35, label: "Yesterday" }}
            after={{ value: 47, label: "Today" }}
            format="number"
          />
          
          <ComparisonCard
            title="Feed Cost"
            before={{ value: 45.50, label: "Last Month" }}
            after={{ value: 42.75, label: "This Month" }}
            format="currency"
          />
          
          <ComparisonCard
            title="Productivity"
            before={{ value: 87.5, label: "Previous Week" }}
            after={{ value: 94.2, label: "Current Week" }}
            format="percentage"
          />
          
          <ComparisonCard
            title="Loading Comparison"
            before={{ value: 0, label: "Before" }}
            after={{ value: 0, label: "After" }}
            format="number"
            loading
          />
        </div>
      </section>

      {/* SummaryCard Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SummaryCard Examples</h2>
          <p className="text-gray-600">Detailed summaries with lists and actions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Today's Activities"
            items={[
              { label: "Eggs Collected", value: "47 eggs" },
              { label: "Feed Given", value: "25 lbs" },
              { label: "Nest Checks", value: "3 times" },
              { label: "Water Refilled", value: "2 containers" }
            ]}
          />
          
          <SummaryCard
            title="Weekly Summary"
            items={[
              { label: "Total Eggs", value: "324" },
              { label: "Revenue", value: "$162.00" },
              { label: "Feed Used", value: "175 lbs" },
              { label: "Efficiency", value: "94%" }
            ]}
            variant="detailed"
          />
          
          <SummaryCard
            title="Quick Stats"
            items={[
              { label: "Active Hens", value: "45" },
              { label: "Eggs Today", value: "47" }
            ]}
            variant="compact"
          />
          
          <SummaryCard
            title="Monthly Overview"
            items={[
              { label: "Days Active", value: "21/21" },
              { label: "Total Production", value: "987 eggs" },
              { label: "Average Daily", value: "47 eggs" },
              { label: "Best Day", value: "52 eggs" }
            ]}
            showDividers
          />
          
          <SummaryCard
            title="Loading Summary"
            items={[]}
            loading
          />
        </div>
      </section>

      {/* Combined Dashboard Example */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Combined Dashboard Example</h2>
          <p className="text-gray-600">Real-world usage combining multiple card types</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              title="Today's Collection"
              total="47"
              label="eggs"
              change={12}
              changeType="increase"
              trend="up"
              icon="🥚"
              variant="corner-gradient"
            />
            
            <MetricDisplay
              label="Productivity Rate"
              value={104.4}
              format="percentage"
            />
            
            <ProgressCard
              title="Daily Goal"
              value={47}
              max={45}
              label="Target: 45 eggs"
              variant="detailed"
            />
            
            <ComparisonCard
              title="Week over Week"
              before={{ value: 287, label: "Last Week" }}
              after={{ value: 324, label: "This Week" }}
              format="number"
            />
          </div>
          
          <div className="space-y-6">
            <SummaryCard
              title="Farm Status"
              items={[
                { label: "Active Hens", value: "45/50" },
                { label: "Feed Level", value: "87 lbs" },
                { label: "Water", value: "Full" },
                { label: "Nest Boxes", value: "Clean" }
              ]}
              variant="detailed"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsTab;