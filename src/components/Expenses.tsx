import { useState, useMemo, useCallback } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import type { Expense } from '../types';
import { AnimatedCoinPNG } from './AnimatedCoinPNG';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  FormCard 
} from './forms';
import { NeumorphicSelect } from './forms/NeumorphicSelect';
import { useExpenseData } from '../hooks/data/useExpenseData';
import { useExpenseForm } from '../hooks/forms/useExpenseForm';
import { useTimeoutToggle } from '../hooks/utils';
import { 
  GridContainer 
} from './ui';
import { PaginatedDataTable } from './ui/tables/PaginatedDataTable';
import type { TableColumn } from './ui/tables/DataTable';
// Import showcase components
import { MetricDisplay } from './ui/cards/MetricDisplay';
import { ComparisonCard } from './ui/cards/ComparisonCard';
import { ChartCard } from './ui/charts/ChartCard';
import { FormButton } from './ui/forms/FormButton';

const CATEGORIES = [
  'Birds',
  'Feed',
  'Equipment',
  'Veterinary',
  'Maintenance',
  'Supplies',
  'Start-up',
  'Other'
];


export const Expenses = () => {
  // Use custom hooks for data management
  const { 
    expenses, 
    isLoading, 
    deleteExpense, 
    thisMonthTotal, 
    expensesByCategory 
  } = useExpenseData();

  // UI state hooks
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteExpense(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }, [deleteConfirm, deleteExpense]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Table columns configuration
  const tableColumns: TableColumn<Expense>[] = useMemo(() => [
    {
      key: 'date',
      label: 'Date',
      render: (_, expense) => expense.date,
    },
    {
      key: 'category',
      label: 'Category',
      render: (_, expense) => expense.category,
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, expense) => expense.description,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (_, expense) => formatCurrency(expense.amount),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, expense) => expense.id ? (
        <button
          onClick={() => handleDelete(expense.id!)}
          className={`inline-flex items-center p-2 rounded-full
            ${deleteConfirm === expense.id
              ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            } transition-colors`}
          title={deleteConfirm === expense.id ? "Click again to confirm deletion" : "Delete expense"}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      ) : null,
    },
  ], [deleteConfirm, handleDelete]);
  
  // Use form management hook
  const successState = useTimeoutToggle(false, 3000);
  
  const expenseForm = useExpenseForm({
    categories: CATEGORIES,
    onSuccess: () => {
      successState.setTrue();
    }
  });
  
  // Removed pagination hook - now handled by PaginatedDataTable
  
  // Form submission is now handled by useExpenseForm hook
  const handleSubmit = expenseForm.handleSubmit;
  
  // Summary calculations are now provided by useExpenseData hook
  const calculateYearlyTotal = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };
  
  const calculateLastMonthTotal = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === lastMonth.getFullYear() && 
               expenseDate.getMonth() === lastMonth.getMonth();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };
  
  const categoryData = useMemo(() => {
    return CATEGORIES.map(category => ({
      name: category,
      total: expensesByCategory[category] || 0,
      color: {
        Birds: '#8B5CF6',
        Feed: '#06B6D4', 
        Equipment: '#10B981',
        Veterinary: '#F59E0B',
        Maintenance: '#EF4444',
        Supplies: '#EC4899',
        'Start-up': '#8B5A2B',
        Other: '#6B7280'
      }[category] || '#6B7280'
    }));
  }, [expensesByCategory]);

  const yearlyTotal = calculateYearlyTotal();
  const lastMonthTotal = calculateLastMonthTotal();

  // Early return if form values are not initialized (after all hooks)
  if (!expenseForm.values) {
    return <LoadingSpinner />;
  }
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto pt-20"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {/* Animated Piggy Bank Section - Testing (will be for new users) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mb-0"
      >
        <AnimatedCoinPNG />
      </motion.div>

      <FormCard
        title="Add New Expense"
        description="Track your farm expenses to maintain accurate financial records"
      >
        {/* Success/Error Messages */}
        {successState.value && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-medium">Expense added successfully!</div>
          </motion.div>
        )}
        
        {expenseForm.errors.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Please fix the following errors:</div>
              <div className="mt-1 text-sm">{expenseForm.errors.map(e => e.message).join(', ')}</div>
            </div>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Date"
              value={expenseForm.values.date || new Date().toISOString().split('T')[0]}
              onChange={expenseForm.handleChange('date')}
              required
            />
            
            <NeumorphicSelect
              label="Category"
              value={expenseForm.values.category || CATEGORIES[0]}
              onChange={expenseForm.handleChange('category')}
              options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              required
            />
          </div>
          
          {/* Description */}
          <TextInput
            label="Description"
            value={expenseForm.values.description || ''}
            onChange={expenseForm.handleChange('description')}
            placeholder="e.g., Feed purchase from farm store"
            required
          />
          
          {/* Amount */}
          <NumberInput
            label="Amount (USD)"
            value={parseFloat(expenseForm.values.amount || '0') || 0}
            onChange={(value: number) => expenseForm.handleChange('amount')(String(value))}
            min={0}
            step={0.01}
            placeholder="0.00"
            required
            className="w-full md:w-48"
          />
          
          {/* Submit Button */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <FormButton
              type="submit"
              variant="primary"
              size="md"
              loading={expenseForm.isSubmitting}
              disabled={expenseForm.isSubmitting}
            >
              {expenseForm.isSubmitting ? 'Adding Expense...' : 'Add Expense'}
            </FormButton>
          </div>
        </form>
      </FormCard>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Expense Summary</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Enhanced Summary Cards */}
            <GridContainer columns={4} gap="lg">
              <MetricDisplay
                label="This Month"
                value={thisMonthTotal}
                format="currency"
                variant="default"
              />
              <ComparisonCard
                title="Month Comparison"
                before={{ value: lastMonthTotal, label: "Last Month" }}
                after={{ value: thisMonthTotal, label: "This Month" }}
                format="currency"
              />
              <MetricDisplay
                label="This Year"
                value={yearlyTotal}
                format="currency"
                variant="large"
              />
              <MetricDisplay
                label="Daily Average"
                value={thisMonthTotal / new Date().getDate()}
                format="currency"
                precision={2}
                variant="compact"
              />
            </GridContainer>
            
          </>
        )}
      </motion.div>      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Pie Chart */}
        <ChartCard
          title="Expense Breakdown"
          subtitle="Monthly expenses by category"
          loading={isLoading}
        >
          {!isLoading && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.filter(item => item.total > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category Summary */}
        <div className="glass-card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Summary</h3>
            <p className="text-sm text-gray-600">Detailed breakdown of expenses by category</p>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {categoryData
                .filter(item => item.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((category) => {
                  const percentage = ((category.total / categoryData.reduce((sum, cat) => sum + cat.total, 0)) * 100);
                  return (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}% of total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(category.total)}</div>
                        <div className="text-sm text-gray-500">
                          {expenses.filter(exp => exp.category === category.name).length} transactions
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {categoryData.filter(item => item.total > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No expenses recorded yet</p>
                  <p className="text-sm mt-1">Add your first expense above to see the breakdown</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Expense Records</h2>
        </div>
        
        <PaginatedDataTable
          data={expenses}
          columns={tableColumns}
          loading={isLoading}
          emptyMessage="No expenses found"
          itemsPerPage={5}
          sortable={true}
        />
      </motion.div>
    </motion.div>
  );
};