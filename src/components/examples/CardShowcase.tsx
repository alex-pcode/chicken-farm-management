import React, { useState } from 'react';
import { StatCard } from '../ui/cards/StatCard';
import { MetricDisplay } from '../ui/cards/MetricDisplay';
import { ProgressCard } from '../ui/cards/ProgressCard';
import { ComparisonCard } from '../ui/cards/ComparisonCard';
import { SummaryCard } from '../ui/cards/SummaryCard';
import { Modal } from '../ui/modals/Modal';
import { AlertDialog } from '../ui/modals/AlertDialog';
import { ConfirmDialog } from '../ui/modals/ConfirmDialog';
import { FormModal } from '../ui/modals/FormModal';
import { DataTable } from '../ui/tables/DataTable';
import { DataList } from '../ui/tables/DataList';
import { EmptyState } from '../ui/tables/EmptyState';
import { FormCard } from '../ui/forms/FormCard';
import { FormField } from '../ui/forms/FormField';
import { FormButton } from '../ui/forms/FormButton';
import { ChartCard } from '../ui/charts/ChartCard';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const CardShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'components' | 'layouts' | 'modals' | 'tables' | 'forms' | 'charts'>('components');
  
  // Modal states
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Table states and data
  const [sortColumn, setSortColumn] = useState<'date' | 'eggs' | 'hens' | 'rate' | 'notes' | 'id' | undefined>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    eggDate: new Date().toISOString().split('T')[0],
    eggCount: '',
    customerName: '',
    email: '',
    category: '',
    amount: '',
  });
  
  // Sample table data
  const eggData = [
    { id: 1, date: '2024-08-17', eggs: 47, hens: 45, rate: 104.4, notes: 'Good production day' },
    { id: 2, date: '2024-08-16', eggs: 43, hens: 45, rate: 95.6, notes: 'Slightly below average' },
    { id: 3, date: '2024-08-15', eggs: 51, hens: 45, rate: 113.3, notes: 'Excellent day!' },
    { id: 4, date: '2024-08-14', eggs: 38, hens: 45, rate: 84.4, notes: 'Rainy weather impact' },
    { id: 5, date: '2024-08-13', eggs: 45, hens: 45, rate: 100.0, notes: 'Perfect average' },
  ];
  
  const customerData = [
    { id: 1, name: 'John Smith', email: 'john@email.com', orders: 12, total: 156.50, status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', orders: 8, total: 89.25, status: 'Active' },
    { id: 3, name: 'Mike Brown', email: 'mike@email.com', orders: 15, total: 203.75, status: 'Inactive' },
    { id: 4, name: 'Lisa Davis', email: 'lisa@email.com', orders: 6, total: 78.00, status: 'Active' },
  ];
  
  const recentSales = [
    { id: 1, date: '2024-08-17', customer: 'John Smith', dozens: 3, amount: 18.75 },
    { id: 2, date: '2024-08-16', customer: 'Sarah Johnson', dozens: 2, amount: 12.50 },
    { id: 3, date: '2024-08-15', customer: 'Mike Brown', dozens: 4, amount: 25.00 },
    { id: 4, date: '2024-08-14', customer: 'Lisa Davis', dozens: 1, amount: 6.25 },
  ];
  
  // Chart data
  const monthlyProductionData = [
    { month: 'Jan', eggs: 890, target: 900, revenue: 445 },
    { month: 'Feb', eggs: 1020, target: 900, revenue: 510 },
    { month: 'Mar', eggs: 1150, target: 1000, revenue: 575 },
    { month: 'Apr', eggs: 980, target: 1000, revenue: 490 },
    { month: 'May', eggs: 1280, target: 1100, revenue: 640 },
    { month: 'Jun', eggs: 1350, target: 1200, revenue: 675 },
    { month: 'Jul', eggs: 1247, target: 1200, revenue: 623 },
  ];
  
  const weeklyData = [
    { day: 'Mon', eggs: 42, hens: 45 },
    { day: 'Tue', eggs: 38, hens: 45 },
    { day: 'Wed', eggs: 51, hens: 45 },
    { day: 'Thu', eggs: 47, hens: 45 },
    { day: 'Fri', eggs: 43, hens: 45 },
    { day: 'Sat', eggs: 49, hens: 45 },
    { day: 'Sun', eggs: 45, hens: 45 },
  ];
  
  const expenseData = [
    { category: 'Feed', amount: 480, color: '#8884d8' },
    { category: 'Equipment', amount: 125, color: '#82ca9d' },
    { category: 'Veterinary', amount: 75, color: '#ffc658' },
    { category: 'Utilities', amount: 95, color: '#ff7c7c' },
    { category: 'Other', amount: 45, color: '#8dd1e1' },
  ];
  
  const quarterlyTrends = [
    { quarter: 'Q1 2023', production: 2850, sales: 2750, profit: 890 },
    { quarter: 'Q2 2023', production: 3100, sales: 3050, profit: 1250 },
    { quarter: 'Q3 2023', production: 3350, sales: 3200, profit: 1450 },
    { quarter: 'Q4 2023', production: 3200, sales: 3150, profit: 1380 },
    { quarter: 'Q1 2024', production: 3450, sales: 3400, profit: 1620 },
    { quarter: 'Q2 2024', production: 3680, sales: 3580, profit: 1890 },
  ];

  return (
    <>
    <div className="bg-gray-50 min-h-screen">
      {/* Header and Navigation - Always Full Width */}
      <div className="space-y-8 p-8 pt-20 lg:pt-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Card Components Showcase
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 flex gap-2 overflow-x-auto whitespace-nowrap max-w-full">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'components'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab('layouts')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'layouts'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Layouts
            </button>
            <button
              onClick={() => setActiveTab('modals')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'modals'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Modals
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'tables'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'forms'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Forms
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === 'charts'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Charts
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Content - Constrained for non-charts tabs */}
      {activeTab !== 'charts' && (
        <div className="max-w-7xl mx-auto space-y-8 px-8 pb-8">
          {activeTab === 'components' && (
          <div className="space-y-8">
            {/* StatCard Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
            StatCard Component
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Total Eggs"
              total="1,247"
              label="This month"
              change={12}
              changeType="increase"
              trend="up"
              icon="🥚"
            />
            <StatCard
              title="Active Hens"
              total={45}
              label="Currently laying"
              change={-5}
              changeType="decrease"
              trend="down"
              icon="🐔"
              variant="compact"
            />
            <StatCard
              title="Revenue"
              total="$3,240"
              label="Monthly income"
              change={8}
              changeType="increase"
              trend="up"
              icon="💰"
              variant="gradient"
            />
            <StatCard
              title="Feed Consumption"
              total="125"
              label="lbs this week"
              trend="neutral"
              icon="🌾"
            />
            <StatCard
              title="Loading Example"
              total=""
              loading={true}
            />
            <StatCard
              title="Clickable Card"
              total="234"
              label="Click me!"
              icon="👆"
              onClick={() => alert('Card clicked!')}
            />
          </div>
        </section>

        {/* MetricDisplay Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
            MetricDisplay Component
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card p-6">
              <MetricDisplay
                value={1247.89}
                label="Total Revenue"
                format="currency"
                precision={2}
                color="success"
              />
            </div>
            <div className="glass-card p-6">
              <MetricDisplay
                value={87.5}
                label="Success Rate"
                format="percentage"
                precision={1}
                color="info"
              />
            </div>
            <div className="glass-card p-6">
              <MetricDisplay
                value={3.14159}
                label="Pi Value"
                format="decimal"
                precision={3}
                color="default"
              />
            </div>
            <div className="glass-card p-6">
              <MetricDisplay
                value={42000}
                label="Total Items"
                format="number"
                precision={0}
                color="warning"
                unit="pcs"
              />
            </div>
          </div>
          
          {/* MetricDisplay Variants */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Size Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="glass-card p-6">
                <MetricDisplay
                  value={1247}
                  label="Compact Size"
                  format="number"
                  color="default"
                  variant="compact"
                />
              </div>
              <div className="glass-card p-6">
                <MetricDisplay
                  value={1247}
                  label="Default Size"
                  format="number"
                  color="default"
                />
              </div>
              <div className="glass-card p-6">
                <MetricDisplay
                  value={1247}
                  label="Large Size"
                  format="number"
                  color="default"
                  variant="large"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ProgressCard Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
            ProgressCard Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressCard
              title="Egg Production Goal"
              value={847}
              max={1000}
              label="Monthly target"
              color="success"
              showPercentage={true}
              showValues={true}
            />
            <ProgressCard
              title="Feed Inventory"
              value={125}
              max={500}
              label="Pounds remaining"
              color="warning"
              variant="detailed"
            />
            <ProgressCard
              title="Brooding Progress"
              value={18}
              max={21}
              label="Days until hatching"
              color="info"
              variant="compact"
              animated={false}
            />
            <ProgressCard
              title="Loading Progress"
              value={0}
              max={100}
              loading={true}
            />
          </div>
        </section>

        {/* ComparisonCard Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
            ComparisonCard Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComparisonCard
              title="Monthly Egg Production"
              before={{ value: 890, label: "Last Month" }}
              after={{ value: 1247, label: "This Month" }}
              change={40.1}
              changeType="increase"
              format="number"
              icon="📈"
            />
            <ComparisonCard
              title="Feed Costs"
              before={{ value: 245.50, label: "Previous" }}
              after={{ value: 198.75, label: "Current" }}
              change={-19.0}
              changeType="decrease"
              format="currency"
              icon="📉"
            />
            <ComparisonCard
              title="Efficiency Rate"
              before={{ value: 78, label: "Q3" }}
              after={{ value: 85, label: "Q4" }}
              change={9.0}
              changeType="increase"
              format="percentage"
              variant="compact"
              icon="📈"
            />
            <ComparisonCard
              title="Loading Comparison"
              before={{ value: 0, label: "Before" }}
              after={{ value: 0, label: "After" }}
              loading={true}
            />
          </div>
        </section>

        {/* SummaryCard Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-red-200 pb-2">
            SummaryCard Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard
              title="Monthly Financial Summary"
              items={[
                { label: "Egg Sales", value: 2450, format: "currency", color: "success" },
                { label: "Feed Costs", value: 380, format: "currency", color: "danger" },
                { label: "Equipment", value: 125, format: "currency", color: "warning" },
                { label: "Veterinary", value: 75, format: "currency", color: "default" },
              ]}
              variant="detailed"
            />
            <SummaryCard
              title="Production Metrics"
              items={[
                { label: "Daily Average", value: 42, format: "number" },
                { label: "Weekly Total", value: 294, format: "number" },
                { label: "Success Rate", value: 87.5, format: "percentage", color: "success" },
              ]}
              showDividers={true}
            />
            <SummaryCard
              title="Quick Stats"
              items={[
                { label: "Active Hens", value: 45 },
                { label: "Roosters", value: 3 },
                { label: "Chicks", value: 12 },
              ]}
              variant="compact"
              showDividers={false}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard
              title="Loading Summary"
              items={[]}
              loading={true}
            />
            <SummaryCard
              title="Inventory Status"
              items={[
                { label: "Feed (lbs)", value: 125, color: "warning" },
                { label: "Bedding (bales)", value: 8, color: "success" },
                { label: "Medicine (doses)", value: 3, color: "danger" },
                { label: "Equipment", value: 15, color: "default" },
              ]}
            />
          </div>
        </section>

        {/* Combined Example */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-400 pb-2">
            Combined Dashboard Example
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <ProgressCard
                title="Annual Production Goal"
                value={8947}
                max={15000}
                label="Eggs this year"
                color="success"
                variant="detailed"
              />
            </div>
            <StatCard
              title="Today's Eggs"
              total={47}
              label="Fresh today"
              icon="🥚"
              trend="up"
              change={6}
              changeType="increase"
            />
            <div className="glass-card p-6">
              <MetricDisplay
                value={4.75}
                label="Avg Price/Dozen"
                format="currency"
                precision={2}
                color="success"
                variant="large"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComparisonCard
              title="Week-over-Week"
              before={{ value: 312, label: "Last Week" }}
              after={{ value: 329, label: "This Week" }}
              change={5.4}
              changeType="increase"
              format="number"
              icon="📈"
            />
            <SummaryCard
              title="Current Flock"
              items={[
                { label: "Laying Hens", value: 45, color: "success" },
                { label: "Roosters", value: 3, color: "default" },
                { label: "Chicks", value: 12, color: "warning" },
                { label: "Brooding", value: 2, color: "default" },
              ]}
              variant="compact"
            />
            <SummaryCard
              title="This Month"
              items={[
                { label: "Revenue", value: 2450, format: "currency", color: "success" },
                { label: "Expenses", value: 580, format: "currency", color: "danger" },
                { label: "Profit", value: 1870, format: "currency", color: "success" },
              ]}
              variant="detailed"
            />
          </div>
        </section>
          </div>
        )}
        
        {/* Layouts Tab */}
        {activeTab === 'layouts' && (
          <div className="space-y-8">
            {/* Dashboard Layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                Dashboard Layout
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProgressCard
                    title="Monthly Production Goal"
                    value={2847}
                    max={3000}
                    label="eggs this month"
                    color="success"
                    variant="detailed"
                  />
                </div>
                <StatCard
                  title="Today's Collection"
                  total={52}
                  label="Fresh eggs"
                  icon="🥚"
                  change={8}
                  changeType="increase"
                />
              </div>
            </section>

            {/* Analytics Grid */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Analytics Grid
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="glass-card p-3 lg:p-6">
                  <MetricDisplay
                    value={4.25}
                    label="Avg Price"
                    format="currency"
                    color="success"
                  />
                </div>
                <div className="glass-card p-3 lg:p-6">
                  <MetricDisplay
                    value={89.5}
                    label="Efficiency"
                    format="percentage"
                    color="default"
                  />
                </div>
                <div className="glass-card p-3 lg:p-6">
                  <MetricDisplay
                    value={1247}
                    label="Total Eggs"
                    format="number"
                    color="default"
                  />
                </div>
                <div className="glass-card p-3 lg:p-6">
                  <MetricDisplay
                    value={2450}
                    label="Revenue"
                    format="currency"
                    color="success"
                  />
                </div>
              </div>
            </section>

            {/* Comparison Layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
                Performance Comparison
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComparisonCard
                  title="Monthly Production"
                  before={{ value: 1890, label: "Last Month" }}
                  after={{ value: 2347, label: "This Month" }}
                  change={24.2}
                  changeType="increase"
                  format="number"
                  icon="📈"
                />
                <ComparisonCard
                  title="Feed Efficiency"
                  before={{ value: 76, label: "Previous" }}
                  after={{ value: 89, label: "Current" }}
                  change={17.1}
                  changeType="increase"
                  format="percentage"
                  icon="⚡"
                />
              </div>
            </section>

            {/* Summary Cards Layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-orange-200 pb-2">
                Financial Summary Layout
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SummaryCard
                  title="Income Sources"
                  items={[
                    { label: "Egg Sales", value: 2450, format: "currency", color: "success" },
                    { label: "Chick Sales", value: 380, format: "currency", color: "success" },
                    { label: "Equipment Sales", value: 125, format: "currency", color: "default" },
                  ]}
                />
                <SummaryCard
                  title="Monthly Expenses"
                  items={[
                    { label: "Feed Costs", value: 480, format: "currency", color: "danger" },
                    { label: "Equipment", value: 125, format: "currency", color: "warning" },
                    { label: "Veterinary", value: 75, format: "currency", color: "default" },
                  ]}
                />
                <SummaryCard
                  title="Flock Overview"
                  items={[
                    { label: "Laying Hens", value: 45, color: "success" },
                    { label: "Roosters", value: 3, color: "default" },
                    { label: "Chicks", value: 12, color: "warning" },
                  ]}
                  variant="compact"
                />
              </div>
            </section>

            {/* Mixed Layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-red-200 pb-2">
                Mixed Dashboard Layout
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column - Stats */}
                <div className="lg:col-span-3 space-y-4">
                  <StatCard
                    title="Active Hens"
                    total={45}
                    label="Currently laying"
                    icon="🐔"
                    change={2}
                    changeType="increase"
                  />
                  <StatCard
                    title="Feed Stock"
                    total="125 lbs"
                    label="Days remaining: 8"
                    icon="🌾"
                    change={-12}
                    changeType="decrease"
                  />
                </div>
                
                {/* Center column - Progress */}
                <div className="lg:col-span-6">
                  <ProgressCard
                    title="Weekly Production Target"
                    value={284}
                    max={350}
                    label="eggs this week"
                    color="info"
                    showPercentage={true}
                    showValues={true}
                  />
                </div>
                
                {/* Right column - Summary */}
                <div className="lg:col-span-3">
                  <SummaryCard
                    title="Quick Stats"
                    items={[
                      { label: "Today", value: 47, color: "success" },
                      { label: "Yesterday", value: 43, color: "default" },
                      { label: "This Week", value: 284, color: "default" },
                    ]}
                    variant="compact"
                    showDividers={false}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
        
        {/* Modals Tab */}
        {activeTab === 'modals' && (
          <div className="space-y-8">
            {/* Basic Modals */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
                Basic Modals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowBasicModal(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-900">Basic Modal</h3>
                  <p className="text-sm text-gray-600">Simple content modal</p>
                </button>
                
                <button
                  onClick={() => setShowLargeModal(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-900">Large Modal</h3>
                  <p className="text-sm text-gray-600">Expanded content area</p>
                </button>
              </div>
            </section>

            {/* Alert Dialogs */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Alert Dialogs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowInfoAlert(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">ℹ️</div>
                  <h3 className="font-semibold text-gray-900">Info Alert</h3>
                  <p className="text-sm text-gray-600">Information message</p>
                </button>
                
                <button
                  onClick={() => setShowSuccessAlert(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="font-semibold text-gray-900">Success Alert</h3>
                  <p className="text-sm text-gray-600">Success confirmation</p>
                </button>
                
                <button
                  onClick={() => setShowWarningAlert(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">⚠️</div>
                  <h3 className="font-semibold text-gray-900">Warning Alert</h3>
                  <p className="text-sm text-gray-600">Warning message</p>
                </button>
                
                <button
                  onClick={() => setShowErrorAlert(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">❌</div>
                  <h3 className="font-semibold text-gray-900">Error Alert</h3>
                  <p className="text-sm text-gray-600">Error notification</p>
                </button>
              </div>
            </section>

            {/* Confirmation Dialogs */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
                Confirmation Dialogs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">❓</div>
                  <h3 className="font-semibold text-gray-900">Confirm Action</h3>
                  <p className="text-sm text-gray-600">Standard confirmation</p>
                </button>
                
                <button
                  onClick={() => setShowDangerConfirm(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">🗑️</div>
                  <h3 className="font-semibold text-gray-900">Danger Confirm</h3>
                  <p className="text-sm text-gray-600">Destructive action</p>
                </button>
                
                <button
                  onClick={() => setShowFormModal(true)}
                  className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <h3 className="font-semibold text-gray-900">Form Modal</h3>
                  <p className="text-sm text-gray-600">Input form dialog</p>
                </button>
              </div>
            </section>
          </div>
        )}
        
        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-8">
            {/* Data Table */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                DataTable Component
              </h2>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🥚 Egg Production Records</h3>
                <DataTable
                  data={eggData}
                  columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'eggs', label: 'Eggs Collected' },
                    { key: 'hens', label: 'Active Hens' },
                    { 
                      key: 'rate', 
                      label: 'Production Rate (%)',
                      render: (value) => (
                        <span 
                          className={`font-medium ${
                            value >= 100 ? '' : 
                            value >= 90 ? 'text-yellow-600' : 'text-red-600'
                          }`}
                          style={value >= 100 ? { color: 'oklch(0.44 0.11 162.79)' } : undefined}
                        >
                          {value.toFixed(1)}%
                        </span>
                      )
                    },
                    { key: 'notes', label: 'Notes' },
                  ]}
                  sortable={true}
                  onSort={(column, direction) => {
                    setSortColumn(column);
                    setSortDirection(direction);
                  }}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </section>

            {/* Customer Table */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Customer Management Table
              </h2>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Customer Database</h3>
                <DataTable
                  data={customerData}
                  columns={[
                    { key: 'name', label: 'Customer Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'orders', label: 'Total Orders' },
                    { 
                      key: 'total', 
                      label: 'Total Spent',
                      render: (value) => `$${value.toFixed(2)}`
                    },
                    { 
                      key: 'status', 
                      label: 'Status',
                      render: (value) => (
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            value === 'Active' 
                              ? 'bg-green-100' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          style={value === 'Active' ? { color: 'oklch(0.44 0.11 162.79)' } : undefined}
                        >
                          {value}
                        </span>
                      )
                    },
                  ]}
                  sortable={true}
                />
              </div>
            </section>

            {/* DataList Component */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
                DataList Component
              </h2>
              
              {/* Default List */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Sales (List View)</h3>
                <DataList
                  data={recentSales}
                  renderItem={(sale) => (
                    <div className="glass-card p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{sale.customer}</h4>
                        <p className="text-sm text-gray-600">{sale.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${sale.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{sale.dozens} dozen</p>
                      </div>
                    </div>
                  )}
                  variant="default"
                />
              </div>

              {/* Grid Layout */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Sales Cards (Grid View)</h3>
                <DataList
                  data={recentSales}
                  renderItem={(sale) => (
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl mb-2">🛒</div>
                      <h4 className="font-medium text-gray-900 mb-1">{sale.customer}</h4>
                      <p className="text-sm text-gray-600 mb-2">{sale.date}</p>
                      <div className="flex justify-between text-sm">
                        <span>{sale.dozens} dozen</span>
                        <span className="font-semibold">${sale.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  variant="grid"
                  columns={2}
                  gap="md"
                />
              </div>

              {/* Compact Layout */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Compact Sales List</h3>
                <DataList
                  data={recentSales}
                  renderItem={(sale) => (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">{sale.customer}</span>
                      <span className="text-sm text-gray-600">${sale.amount.toFixed(2)}</span>
                    </div>
                  )}
                  variant="compact"
                />
              </div>
            </section>

            {/* Empty States */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-orange-200 pb-2">
                Empty State Component
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Empty State */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Empty State</h3>
                  <EmptyState
                    icon="📊"
                    title="No Data Available"
                    message="There are no records to display at this time. Add some data to get started."
                    action={{
                      text: "Add First Record",
                      onClick: () => alert("Add record clicked!")
                    }}
                  />
                </div>

                {/* Compact Empty State */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compact Empty State</h3>
                  <EmptyState
                    icon="🔍"
                    title="No Results Found"
                    message="Try adjusting your search criteria."
                    variant="compact"
                  />
                </div>
              </div>

              {/* Empty Table Demo */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty Table Example</h3>
                <DataTable
                  data={[]}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'value', label: 'Value' },
                    { key: 'status', label: 'Status' },
                  ]}
                  emptyMessage="No transactions found. Start by adding your first transaction."
                />
              </div>

              {/* Empty List Demo */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty List Example</h3>
                <DataList
                  data={[]}
                  renderItem={() => <div />}
                  emptyMessage="No items in your inventory."
                  emptyIcon="📦"
                  emptyTitle="Inventory Empty"
                  emptyAction={{
                    text: "Add Items",
                    onClick: () => alert("Add items clicked!")
                  }}
                />
              </div>
            </section>

            {/* Loading States */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-red-200 pb-2">
                Loading States
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Table</h3>
                  <DataTable
                    data={[]}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'value', label: 'Value' },
                    ]}
                    loading={true}
                  />
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading List</h3>
                  <DataList
                    data={[]}
                    renderItem={() => <div />}
                    loading={true}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
        
        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className="space-y-8">
            {/* Basic Form Example */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
                Basic Form Components
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Egg Logging Form */}
                <FormCard
                  title="Log Daily Eggs"
                  subtitle="Record your daily egg production"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormLoading(true);
                    setTimeout(() => {
                      setFormLoading(false);
                      alert(`Logged ${formData.eggCount} eggs for ${formData.eggDate}`);
                    }, 2000);
                  }}
                  loading={formLoading}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Date" required>
                        <input
                          id="eggDate"
                          type="date"
                          value={formData.eggDate}
                          onChange={(e) => setFormData({...formData, eggDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>
                      
                      <FormField label="Number of Eggs" required>
                        <input
                          type="number"
                          value={formData.eggCount}
                          onChange={(e) => setFormData({...formData, eggCount: e.target.value})}
                          placeholder="Enter egg count"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>
                    </div>
                    
                    <FormButton 
                      type="submit" 
                      variant="primary" 
                      loading={formLoading}
                      fullWidth
                    >
                      Log Eggs
                    </FormButton>
                  </div>
                </FormCard>

                {/* Customer Registration Form */}
                <FormCard
                  title="Add New Customer"
                  subtitle="Register a new customer for egg sales"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(`Customer ${formData.customerName} added successfully!`);
                  }}
                >
                  <div className="space-y-4">
                    <FormField label="Customer Name" required>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        placeholder="Enter customer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Email Address" required>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="customer@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <div className="flex gap-3">
                      <FormButton type="submit" variant="primary">
                        Add Customer
                      </FormButton>
                      <FormButton type="button" variant="secondary">
                        Cancel
                      </FormButton>
                    </div>
                  </div>
                </FormCard>
              </div>
            </section>

            {/* Form Layouts */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
                Form Layout Variations
              </h2>
              
              {/* Inline Form */}
              <FormCard
                title="Quick Expense Entry"
                subtitle="Inline form layout for rapid data entry"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField label="Category">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="feed">Feed</option>
                        <option value="equipment">Equipment</option>
                        <option value="veterinary">Veterinary</option>
                        <option value="other">Other</option>
                      </select>
                    </FormField>
                    
                    <FormField label="Amount">
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Date">
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormButton type="submit" variant="primary" size="md">
                      Add Expense
                    </FormButton>
                  </div>
                </div>
              </FormCard>
            </section>

            {/* Form Buttons Showcase */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Form Button Variations
              </h2>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Variants & Sizes</h3>
                
                <div className="space-y-6">
                  {/* Primary Buttons */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Primary Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <FormButton variant="primary" size="sm">Small Primary</FormButton>
                      <FormButton variant="primary" size="md">Medium Primary</FormButton>
                      <FormButton variant="primary" size="lg">Large Primary</FormButton>
                    </div>
                  </div>
                  
                  {/* Secondary Buttons */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Secondary Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <FormButton variant="secondary" size="sm">Small Secondary</FormButton>
                      <FormButton variant="secondary" size="md">Medium Secondary</FormButton>
                      <FormButton variant="secondary" size="lg">Large Secondary</FormButton>
                    </div>
                  </div>
                  
                  {/* Danger Buttons */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Danger Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <FormButton variant="danger" size="sm">Delete Item</FormButton>
                      <FormButton variant="danger" size="md">Remove Record</FormButton>
                      <FormButton variant="danger" size="lg">Clear All Data</FormButton>
                    </div>
                  </div>
                  
                  {/* States */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Button States</h4>
                    <div className="flex flex-wrap gap-3">
                      <FormButton variant="primary">Normal</FormButton>
                      <FormButton variant="primary" loading={true}>Loading</FormButton>
                      <FormButton variant="primary" disabled={true}>Disabled</FormButton>
                      <FormButton variant="primary" fullWidth>Full Width</FormButton>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Field Types Showcase */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                Form Field Types
              </h2>
              
              <FormCard title="Field Types Showcase">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Text Input" required>
                      <input
                        type="text"
                        placeholder="Enter text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Number Input" help="Enter a positive number">
                      <input
                        type="number"
                        placeholder="123"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Email Input">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Date Input">
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField label="Select Dropdown">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Choose option...</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </select>
                    </FormField>
                    
                    <FormField label="Range Input">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        className="w-full"
                      />
                    </FormField>
                  </div>
                  
                  <FormField label="Textarea">
                    <textarea
                      placeholder="Enter description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                  
                  <FormField label="Checkbox Options">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enable notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Auto-save data</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Share analytics</span>
                      </label>
                    </div>
                  </FormField>
                  
                  <FormField label="Radio Button Group">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="priority" value="low" />
                        <span className="text-sm">Low Priority</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="priority" value="medium" defaultChecked />
                        <span className="text-sm">Medium Priority</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="priority" value="high" />
                        <span className="text-sm">High Priority</span>
                      </label>
                    </div>
                  </FormField>
                  
                  <FormField label="Field with Error" error="This field is required">
                    <input
                      type="text"
                      placeholder="This field has an error..."
                      className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </FormField>
                </div>
              </FormCard>
            </section>
          </div>
          )}
        </div>
      )}
      
      {/* Charts Tab - Full Width */}
      {activeTab === 'charts' && (
        <div className="w-full space-y-8 px-4 sm:px-6 lg:px-8 pb-8">
          {/* Bar Charts */}
          <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
                Bar Charts
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                {/* Monthly Production Bar Chart */}
                <ChartCard 
                  title="Monthly Egg Production" 
                  subtitle="Production vs Target comparison"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={monthlyProductionData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="eggs" fill="#4F46E5" name="Actual Production" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="#E5E7EB" name="Target" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Weekly Production Bar Chart */}
                <ChartCard 
                  title="Weekly Production Overview" 
                  subtitle="Daily egg collection this week"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={weeklyData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Bar dataKey="eggs" fill="#10B981" name="Eggs Collected" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </section>

            {/* Line Charts */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
                Line Charts
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                {/* Quarterly Trends Line Chart */}
                <ChartCard 
                  title="Quarterly Business Trends" 
                  subtitle="Production, sales, and profit over time"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={quarterlyTrends}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="quarter" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="production" 
                        stroke="#4F46E5" 
                        strokeWidth={3}
                        dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                        name="Production"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Sales"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Revenue Area Chart */}
                <ChartCard 
                  title="Monthly Revenue Trend" 
                  subtitle="Revenue growth over the year"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={monthlyProductionData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8B5CF6" 
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </section>

            {/* Pie Charts */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Pie Charts
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                {/* Expense Breakdown Pie Chart */}
                <ChartCard 
                  title="Monthly Expenses Breakdown" 
                  subtitle="Distribution of farm expenses"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({category, percent}) => `${category} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        formatter={(value) => [`$${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Simple Donut Chart */}
                <ChartCard 
                  title="Production Efficiency" 
                  subtitle="Current vs potential production"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Current Production', value: 87.5, color: '#10B981' },
                          { name: 'Potential Improvement', value: 12.5, color: '#E5E7EB' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        formatter={(value) => [`${value}%`, 'Efficiency']}
                      />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
                        87.5%
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </section>

            {/* Chart Variations */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                Chart Variations & States
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                {/* Loading State */}
                <ChartCard 
                  title="Loading Chart" 
                  subtitle="Chart in loading state"
                  loading={true}
                  height={250}
                />

                {/* Compact Chart */}
                <ChartCard 
                  title="Compact View" 
                  subtitle="Smaller chart for dashboards"
                  height={250}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData.slice(0, 4)}>
                      <XAxis dataKey="day" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Bar dataKey="eggs" fill="#6366F1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Mini Pie Chart */}
                <ChartCard 
                  title="Mini Summary" 
                  subtitle="Key metrics at a glance"
                  height={250}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData.slice(0, 3)}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {expenseData.slice(0, 3).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        formatter={(value) => [`$${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </section>

          {/* Full-Width Showcase */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-pink-200 pb-2">
              Full-Width Chart Examples
            </h2>
              
              {/* Single Full-Width Chart */}
              <ChartCard 
                title="Complete Farm Analytics Dashboard" 
                subtitle="Comprehensive view with all metrics displayed at full width"
                height={500}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={monthlyProductionData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="eggs" 
                      stackId="1"
                      stroke="#4F46E5" 
                      fill="#4F46E5"
                      fillOpacity={0.3}
                      name="Egg Production"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="2"
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Revenue ($)"
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="target" 
                      stroke="#F59E0B" 
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target Production"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            {/* Dashboard Style Layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-orange-200 pb-2">
                Dashboard Layout Example
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-8">
                  <ChartCard 
                    title="Production & Revenue Dashboard" 
                    subtitle="Combined view of key metrics"
                    height={400}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyProductionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="eggs" 
                          stackId="1"
                          stroke="#4F46E5" 
                          fill="#4F46E5"
                          fillOpacity={0.6}
                          name="Egg Production"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stackId="2"
                          stroke="#10B981" 
                          fill="#10B981"
                          fillOpacity={0.6}
                          name="Revenue ($)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                {/* Side Charts */}
                <div className="lg:col-span-4 space-y-6">
                  <ChartCard 
                    title="Weekly Summary" 
                    subtitle="This week's performance"
                    height={180}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <XAxis dataKey="day" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="eggs" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard 
                    title="Quick Stats" 
                    subtitle="Key performance indicators"
                    height={180}
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">1,247</div>
                          <div className="text-xs text-gray-600">Total Eggs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'oklch(0.44 0.11 162.79)' }}>$623</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">87.5%</div>
                          <div className="text-xs text-gray-600">Efficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">45</div>
                          <div className="text-xs text-gray-600">Active Hens</div>
                        </div>
                      </div>
                    </div>
                  </ChartCard>
                </div>
              </div>
          </section>
        </div>
      )}
        
        {/* Modal Components */}
        <Modal
          isOpen={showBasicModal}
          onClose={() => setShowBasicModal(false)}
          title="Basic Modal Example"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a basic modal component with standard content. It includes a title, content area, and can be closed by clicking the X button, pressing Escape, or clicking the backdrop.
            </p>
            <div className="glass-card p-4">
              <StatCard
                title="Sample Data"
                total={1247}
                label="Items processed"
                icon="📊"
                change={12}
                changeType="increase"
              />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showLargeModal}
          onClose={() => setShowLargeModal(false)}
          title="Large Modal with Cards"
          size="xl"
        >
          <div className="space-y-6">
            <p className="text-gray-600">
              This large modal demonstrates how cards can be used within modal content for rich data presentation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgressCard
                title="Processing Status"
                value={847}
                max={1000}
                label="Tasks completed"
                color="success"
              />
              <SummaryCard
                title="Quick Stats"
                items={[
                  { label: "Active", value: 25, color: "success" },
                  { label: "Pending", value: 8, color: "warning" },
                  { label: "Completed", value: 847, color: "default" },
                ]}
                variant="compact"
              />
            </div>
            
            <ComparisonCard
              title="Performance Comparison"
              before={{ value: 734, label: "Last Week" }}
              after={{ value: 847, label: "This Week" }}
              change={15.4}
              changeType="increase"
              format="number"
              icon="📈"
            />
          </div>
        </Modal>

        <AlertDialog
          isOpen={showInfoAlert}
          onClose={() => setShowInfoAlert(false)}
          title="Information"
          message="This is an informational alert dialog. It provides users with helpful information about system status or actions."
          variant="info"
        />

        <AlertDialog
          isOpen={showSuccessAlert}
          onClose={() => setShowSuccessAlert(false)}
          title="Success!"
          message="Your action has been completed successfully. All data has been saved and processed."
          variant="success"
        />

        <AlertDialog
          isOpen={showWarningAlert}
          onClose={() => setShowWarningAlert(false)}
          title="Warning"
          message="Please note that this action may have consequences. Make sure you understand the implications before proceeding."
          variant="warning"
        />

        <AlertDialog
          isOpen={showErrorAlert}
          onClose={() => setShowErrorAlert(false)}
          title="Error Occurred"
          message="An error has occurred while processing your request. Please try again or contact support if the problem persists."
          variant="error"
        />

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            setShowConfirmDialog(false);
            // Handle confirmation
          }}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action? This will update your data."
          variant="default"
        />

        <ConfirmDialog
          isOpen={showDangerConfirm}
          onClose={() => setShowDangerConfirm(false)}
          onConfirm={() => {
            setShowDangerConfirm(false);
            // Handle dangerous action
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />

        <FormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Add New Entry"
          onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
            // Simulate form submission
            setTimeout(() => {
              setIsLoading(false);
              setShowFormModal(false);
            }, 2000);
          }}
          loading={isLoading}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Enter description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select category...</option>
                <option value="production">Production</option>
                <option value="expenses">Expenses</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>
        </FormModal>
    </div>
    </>
  );
};

export default CardShowcase;