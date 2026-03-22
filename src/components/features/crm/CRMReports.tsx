import { useMemo, useState, useCallback } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { useOptimizedAppData } from '../../../contexts/OptimizedDataProvider';
import { useTheme } from '../../../contexts/ThemeContext';
import { RevenueTrendChart } from '../../ui/charts/RevenueTrendChart';
import { StatCard } from '../../ui/cards/StatCard';
import { SelectInput } from '../../ui/forms';
import { SalesList } from '../sales/SalesList';
import type { SaleWithCustomer, Customer } from '../../../types/crm';
import type { EggEntry } from '../../../types';

type TimePeriod = 'all' | 'month' | 'year' | 'custom';
type ReportView = 'overview' | 'customer';

interface CRMReportsProps {
  sales: SaleWithCustomer[];
  customers: Customer[];
  onDataChange: () => void;
}

// Helper: get total eggs from a sale
const getSaleEggs = (s: SaleWithCustomer) => s.dozen_count * 12 + s.individual_count;

export const CRMReports: React.FC<CRMReportsProps> = ({ sales, customers, onDataChange }) => {
  const { data } = useOptimizedAppData();
  const { resolvedTheme } = useTheme();
  const eggEntries: EggEntry[] = data.eggEntries || [];

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportView, setReportView] = useState<ReportView>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const filterByPeriod = useCallback((date: string) => {
    const now = new Date();
    const d = new Date(date);
    switch (timePeriod) {
      case 'month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'year':
        return d.getFullYear() === now.getFullYear();
      case 'custom': {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return d >= start && d <= end;
        }
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return d >= threeMonthsAgo;
      }
      default:
        return true;
    }
  }, [timePeriod, customStartDate, customEndDate]);

  const chartStyles = useMemo(() => ({
    tooltip: {
      backgroundColor: resolvedTheme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      border: 'none',
      borderRadius: '12px',
      boxShadow: resolvedTheme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
      color: resolvedTheme === 'dark' ? '#fff' : '#1f2937',
    },
    gridStroke: resolvedTheme === 'dark' ? '#374151' : '#e5e7eb',
    axisColor: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
  }), [resolvedTheme]);

  // ── Revenue Overview (filtered by time period) ──
  const revenueData = useMemo(() => {
    const filteredSales = sales.filter(s => filterByPeriod(s.sale_date));

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalSales = filteredSales.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalEggsSold = filteredSales.reduce((sum, s) => sum + getSaleEggs(s), 0);
    const freeEggs = filteredSales.filter(s => s.total_amount === 0).reduce((sum, s) => sum + getSaleEggs(s), 0);

    return { totalRevenue, totalSales, avgSaleValue, totalEggsSold, freeEggs };
  }, [sales, filterByPeriod]);

  // ── Customer Analytics ──
  const customerData = useMemo(() => {
    // Build per-customer stats
    const statsMap = new Map<string, { name: string; revenue: number; eggs: number; transactions: number; freeEggs: number; lastDate: string }>();
    for (const sale of sales) {
      const existing = statsMap.get(sale.customer_id) || {
        name: sale.customer_name,
        revenue: 0,
        eggs: 0,
        transactions: 0,
        freeEggs: 0,
        lastDate: '',
      };
      existing.revenue += sale.total_amount;
      existing.eggs += getSaleEggs(sale);
      existing.transactions += 1;
      if (sale.total_amount === 0) existing.freeEggs += getSaleEggs(sale);
      if (sale.sale_date > existing.lastDate) existing.lastDate = sale.sale_date;
      statsMap.set(sale.customer_id, existing);
    }

    // Top 5 by revenue
    const topCustomers = [...statsMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Inactive customers (no purchase in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().substring(0, 10);

    const inactive = customers
      .filter(c => c.is_active)
      .filter(c => {
        const stat = statsMap.get(c.id);
        return !stat || stat.lastDate < cutoff;
      });

    // Free vs Paid pie
    const totalPaidEggs = [...statsMap.values()].reduce((sum, s) => sum + (s.eggs - s.freeEggs), 0);
    const totalFreeEggs = [...statsMap.values()].reduce((sum, s) => sum + s.freeEggs, 0);

    // Purchase frequency (avg days between purchases per customer)
    const frequencyData: { name: string; avgDays: number }[] = [];
    for (const [customerId, stat] of statsMap.entries()) {
      if (stat.transactions < 2) continue;
      const customerSales = sales
        .filter(s => s.customer_id === customerId)
        .map(s => new Date(s.sale_date).getTime())
        .sort((a, b) => a - b);
      const totalDays = (customerSales[customerSales.length - 1] - customerSales[0]) / (1000 * 60 * 60 * 24);
      const avgDays = Math.round(totalDays / (stat.transactions - 1));
      frequencyData.push({ name: stat.name, avgDays });
    }
    frequencyData.sort((a, b) => a.avgDays - b.avgDays); // most frequent first

    return { topCustomers, inactive, totalPaidEggs, totalFreeEggs, frequencyData: frequencyData.slice(0, 5) };
  }, [sales, customers]);

  // ── Production-to-Sales Pipeline ──
  const pipelineData = useMemo(() => {
    const now = new Date();

    // Group egg production by month
    const prodMap = new Map<string, number>();
    for (const entry of eggEntries) {
      const month = entry.date.substring(0, 7);
      prodMap.set(month, (prodMap.get(month) || 0) + entry.count);
    }

    // Group egg sales by month
    const soldMap = new Map<string, number>();
    for (const sale of sales) {
      const month = sale.sale_date.substring(0, 7);
      soldMap.set(month, (soldMap.get(month) || 0) + getSaleEggs(sale));
    }

    // Get all months, last 6
    const allMonths = new Set([...prodMap.keys(), ...soldMap.keys()]);
    const sortedMonths = [...allMonths].sort().slice(-6);

    const chart = sortedMonths.map(month => {
      const produced = prodMap.get(month) || 0;
      const sold = soldMap.get(month) || 0;
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        produced,
        sold,
        surplus: produced - sold,
      };
    });

    // Current month totals
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthProduced = prodMap.get(currentMonth) || 0;
    const thisMonthSold = soldMap.get(currentMonth) || 0;
    const sellThroughRate = thisMonthProduced > 0 ? (thisMonthSold / thisMonthProduced) * 100 : 0;

    return { chart, thisMonthProduced, thisMonthSold, sellThroughRate };
  }, [eggEntries, sales]);

  // ── Per-Customer Detail ──
  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomerId) return null;

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return null;

    const customerSales = sales
      .filter(s => s.customer_id === selectedCustomerId)
      .sort((a, b) => b.sale_date.localeCompare(a.sale_date));

    const totalRevenue = customerSales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalEggs = customerSales.reduce((sum, s) => sum + getSaleEggs(s), 0);
    const freeEggs = customerSales.filter(s => s.total_amount === 0).reduce((sum, s) => sum + getSaleEggs(s), 0);
    const paidEggs = totalEggs - freeEggs;
    const avgSaleValue = customerSales.length > 0 ? totalRevenue / customerSales.length : 0;

    // Average days between purchases
    let avgDaysBetween: number | null = null;
    if (customerSales.length >= 2) {
      const sorted = customerSales.map(s => new Date(s.sale_date).getTime()).sort((a, b) => a - b);
      const totalDays = (sorted[sorted.length - 1] - sorted[0]) / (1000 * 60 * 60 * 24);
      avgDaysBetween = Math.round(totalDays / (customerSales.length - 1));
    }

    // Monthly spending trend (last 6 months)
    const monthlyMap = new Map<string, { revenue: number; eggs: number }>();
    for (const sale of customerSales) {
      const month = sale.sale_date.substring(0, 7);
      const existing = monthlyMap.get(month) || { revenue: 0, eggs: 0 };
      existing.revenue += sale.total_amount;
      existing.eggs += getSaleEggs(sale);
      monthlyMap.set(month, existing);
    }
    const monthlyTrend = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: data.revenue,
        eggs: data.eggs,
      }));

    return {
      customer,
      totalRevenue,
      totalEggs,
      freeEggs,
      paidEggs,
      avgSaleValue,
      avgDaysBetween,
      totalTransactions: customerSales.length,
      lastPurchase: customerSales[0]?.sale_date || null,
      recentSales: customerSales.slice(0, 10),
      monthlyTrend,
    };
  }, [selectedCustomerId, sales, customers]);

  const PIE_COLORS = ['#6366f1', '#a5b4fc'];

  const hasNoData = sales.length === 0 && eggEntries.length === 0;

  if (hasNoData) {
    return (
      <div className="p-8 text-center">
        <span className="text-5xl block mb-4">📊</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Start recording sales and egg production to see your reports.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* ── View Toggle ── */}
      <div className="flex gap-2">
        <button
          onClick={() => { setReportView('overview'); setSelectedCustomerId(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            reportView === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setReportView('customer')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            reportView === 'customer'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          Per Customer
        </button>
      </div>

      {reportView === 'customer' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Customer selector */}
          <div className="mb-6">
            <SelectInput
              label="Select Customer"
              value={selectedCustomerId}
              onChange={(value) => setSelectedCustomerId(value)}
              options={[
                { value: '', label: 'Choose a customer...' },
                ...customers
                  .filter(c => c.is_active)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(c => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          {!selectedCustomerId && (
            <div className="p-8 text-center">
              <span className="text-5xl block mb-4">👤</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Customer</h3>
              <p className="text-gray-500 dark:text-gray-400">Choose a customer above to see their detailed report.</p>
            </div>
          )}

          {selectedCustomerData && (
            <div className="space-y-6">
              {/* Customer header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedCustomerData.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCustomerData.customer.name}</h3>
                  {selectedCustomerData.customer.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomerData.customer.phone}</p>
                  )}
                </div>
                {selectedCustomerData.lastPurchase && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400">Last purchase</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(selectedCustomerData.lastPurchase).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Revenue" total={`$${selectedCustomerData.totalRevenue.toFixed(2)}`} label="total spent" icon="💰" variant="corner-gradient" />
                <StatCard title="Eggs Bought" total={selectedCustomerData.totalEggs} label={`${selectedCustomerData.freeEggs} free`} icon="🥚" variant="corner-gradient" />
                <StatCard title="Transactions" total={selectedCustomerData.totalTransactions} label={selectedCustomerData.avgDaysBetween !== null ? `every ${selectedCustomerData.avgDaysBetween}d` : 'single purchase'} icon="🧾" variant="corner-gradient" />
                <StatCard title="Avg Sale" total={`$${selectedCustomerData.avgSaleValue.toFixed(2)}`} label="per transaction" icon="📊" variant="corner-gradient" />
              </div>

              {/* Monthly trend chart */}
              {selectedCustomerData.monthlyTrend.length > 1 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Monthly Spending Trend</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={selectedCustomerData.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridStroke} />
                      <XAxis dataKey="month" tick={{ fill: chartStyles.axisColor, fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fill: chartStyles.axisColor, fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: chartStyles.axisColor, fontSize: 12 }} />
                      <Tooltip contentStyle={chartStyles.tooltip} />
                      <Bar yAxisId="left" dataKey="revenue" fill="#6366f1" name="Revenue ($)" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="eggs" stroke="#34d399" name="Eggs" strokeWidth={2} dot={{ fill: '#34d399' }} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Eggs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Paid vs Free pie */}
              {selectedCustomerData.totalEggs > 0 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Paid vs Free Eggs</p>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="40%" height={140}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Paid', value: selectedCustomerData.paidEggs },
                            { name: 'Free', value: selectedCustomerData.freeEggs },
                          ]}
                          cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}
                        >
                          {PIE_COLORS.map((color, index) => (
                            <Cell key={index} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartStyles.tooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Paid: {selectedCustomerData.paidEggs}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Free: {selectedCustomerData.freeEggs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent transactions table */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 overflow-x-auto">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Transactions</p>
                {selectedCustomerData.recentSales.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 pr-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Eggs</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                        <th className="text-right py-2 pl-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomerData.recentSales.map((sale) => {
                        const eggs = getSaleEggs(sale);
                        const pricePerEgg = eggs > 0 && sale.total_amount > 0 ? sale.total_amount / eggs : 0;
                        return (
                          <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <td className="py-2 pr-3">
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(sale.sale_date).toLocaleDateString()}</p>
                              {sale.notes && <p className="text-xs text-gray-400">{sale.notes}</p>}
                            </td>
                            <td className="text-right py-2 px-3 text-gray-900 dark:text-white">{eggs}</td>
                            <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-300">
                              {sale.total_amount === 0 ? <span className="text-amber-500">Free</span> : `$${pricePerEgg.toFixed(2)}`}
                            </td>
                            <td className={`text-right py-2 pl-3 font-bold ${sale.total_amount === 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                              {sale.total_amount === 0 ? '—' : `$${sale.total_amount.toFixed(2)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                        <td className="py-2 pr-3 font-bold text-gray-900 dark:text-white">Totals</td>
                        <td className="text-right py-2 px-3 font-bold text-gray-900 dark:text-white">
                          {selectedCustomerData.recentSales.reduce((sum, s) => sum + getSaleEggs(s), 0)}
                        </td>
                        <td className="text-right py-2 px-3"></td>
                        <td className="text-right py-2 pl-3 font-bold text-indigo-600 dark:text-indigo-400">
                          ${selectedCustomerData.recentSales.reduce((sum, s) => sum + s.total_amount, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="text-sm text-gray-400">No transactions yet</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {reportView === 'overview' && <>
      {/* ── Revenue Trend ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <RevenueTrendChart sales={sales} />
      </motion.div>

      {/* ── Revenue Overview ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
          <div className="w-48">
            <SelectInput
              label=""
              value={timePeriod}
              onChange={(value) => {
                const newPeriod = value as TimePeriod;
                setTimePeriod(newPeriod);
                if (newPeriod === 'custom' && !customStartDate && !customEndDate) {
                  const today = new Date();
                  const threeMonthsAgo = new Date(today);
                  threeMonthsAgo.setMonth(today.getMonth() - 3);
                  setCustomStartDate(threeMonthsAgo.toISOString().split('T')[0]);
                  setCustomEndDate(today.toISOString().split('T')[0]);
                }
              }}
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Period' },
                { value: 'all', label: 'All Time' },
              ]}
            />
          </div>
        </div>

        {timePeriod === 'custom' && (
          <div className="mb-4 p-4 glass-card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Revenue"
            total={`$${revenueData.totalRevenue.toFixed(2)}`}
            label="total earnings"
            icon="💰"
            variant="corner-gradient"
          />
          <StatCard
            title="Sales"
            total={revenueData.totalSales}
            label="transactions"
            icon="🧾"
            variant="corner-gradient"
          />
          <StatCard
            title="Eggs Sold"
            total={revenueData.totalEggsSold}
            label={`${revenueData.freeEggs} free`}
            icon="🥚"
            variant="corner-gradient"
          />
          <StatCard
            title="Avg Sale"
            total={`$${revenueData.avgSaleValue.toFixed(2)}`}
            label="per transaction"
            icon="📊"
            variant="corner-gradient"
          />
        </div>
      </motion.section>

      {/* ── Section 2: Customer Analytics ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customer Analytics</h3>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Top customers */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Customers by Revenue</p>
            {customerData.topCustomers.length > 0 ? (
              <div className="space-y-2">
                {customerData.topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 w-5">{i + 1}.</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">${c.revenue.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 ml-2">{c.transactions} sales</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No sales data yet</p>
            )}
          </div>

          {/* Free vs Paid eggs pie chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Paid vs Free Eggs</p>
            {(customerData.totalPaidEggs > 0 || customerData.totalFreeEggs > 0) ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: customerData.totalPaidEggs },
                        { name: 'Free', value: customerData.totalFreeEggs },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {PIE_COLORS.map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartStyles.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Paid: {customerData.totalPaidEggs}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Free: {customerData.totalFreeEggs}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No egg sales data yet</p>
            )}
          </div>

          {/* Purchase frequency */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Purchase Frequency (Top 5)</p>
            {customerData.frequencyData.length > 0 ? (
              <div className="space-y-2">
                {customerData.frequencyData.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      every <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.avgDays}</span> days
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Need 2+ sales per customer</p>
            )}
          </div>

          {/* Inactive customers */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Inactive Customers <span className="text-xs">(30+ days)</span>
            </p>
            {customerData.inactive.length > 0 ? (
              <div className="space-y-2">
                {customerData.inactive.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      needs follow-up
                    </span>
                  </div>
                ))}
                {customerData.inactive.length > 5 && (
                  <p className="text-xs text-gray-400 pt-1">+{customerData.inactive.length - 5} more</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">All customers active!</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Section 3: Production-to-Sales Pipeline ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Production vs Sales</h3>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            title="Produced"
            total={pipelineData.thisMonthProduced}
            label="this month"
            icon="🥚"
            variant="corner-gradient"
          />
          <StatCard
            title="Sold"
            total={pipelineData.thisMonthSold}
            label="this month"
            icon="📦"
            variant="corner-gradient"
          />
          <StatCard
            title="Sell-Through"
            total={`${pipelineData.sellThroughRate.toFixed(1)}%`}
            label="of production"
            icon="📊"
            variant="corner-gradient"
          />
        </div>

        {/* Stacked bar chart */}
        {pipelineData.chart.length > 0 && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Monthly Produced vs Sold</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridStroke} />
                <XAxis dataKey="month" tick={{ fill: chartStyles.axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: chartStyles.axisColor, fontSize: 12 }} />
                <Tooltip contentStyle={chartStyles.tooltip} />
                <Bar dataKey="produced" fill="#6366f1" name="Produced" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sold" fill="#34d399" name="Sold" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Produced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Sold</span>
              </div>
            </div>
          </div>
        )}
      </motion.section>
      {/* ── Section 4: Sales History ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <SalesList
          sales={sales}
          customers={customers}
          onDataChange={onDataChange}
        />
      </motion.section>
      </>}
    </div>
  );
};

