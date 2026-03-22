import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import { ChartCard } from './ChartCard';
import type { SaleWithCustomer } from '../../../types/crm';

interface RevenueTrendChartProps {
  sales: SaleWithCustomer[];
  /** Number of weeks to show. Defaults to 12 on desktop, 6 on mobile handled internally. */
  weeks?: number;
}

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ sales, weeks = 12 }) => {
  const { resolvedTheme } = useTheme();

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

  const weeklyRevenueData = useMemo(() => {
    const now = new Date();
    const weeklyMap = new Map<string, number>();

    for (const sale of sales) {
      const saleDate = new Date(sale.sale_date);
      const weekStart = getWeekStart(saleDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + sale.total_amount);
    }

    const data = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekKey = weekStart.toISOString().split('T')[0];
      data.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        revenue: weeklyMap.get(weekKey) || 0,
      });
    }
    return data;
  }, [sales, weeks]);

  const mobileData = weeklyRevenueData.slice(-6);

  const renderChart = (data: typeof weeklyRevenueData, height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: -5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridStroke} />
        <XAxis
          dataKey="week"
          tick={{ fill: chartStyles.axisColor }}
          axisLine={{ stroke: chartStyles.gridStroke }}
          tickLine={{ stroke: chartStyles.gridStroke }}
        />
        <YAxis
          width={35}
          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
          tick={{ fill: chartStyles.axisColor }}
          axisLine={{ stroke: chartStyles.gridStroke }}
          tickLine={{ stroke: chartStyles.gridStroke }}
        />
        <Tooltip
          contentStyle={chartStyles.tooltip}
          formatter={(value) => [`$${value}`, 'Weekly Revenue']}
          labelFormatter={(label) => `Week of ${label}`}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#544CE6"
          fill="#544CE6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      {/* Mobile - 6 weeks */}
      <div className="lg:hidden">
        <ChartCard title="Revenue Trend" subtitle="Weekly revenue over last 6 weeks" height={280}>
          {renderChart(mobileData, 265)}
        </ChartCard>
      </div>
      {/* Desktop - full weeks */}
      <div className="hidden lg:block">
        <ChartCard title="Revenue Trend" subtitle={`Weekly revenue over last ${weeks} weeks`} height={400}>
          {renderChart(weeklyRevenueData, 385)}
        </ChartCard>
      </div>
    </div>
  );
};
