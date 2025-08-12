import { useState, useMemo } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import type { Expense } from '../types';
import { apiService } from '../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
import { useExpenses } from '../contexts/DataContext';
import { AnimatedCoinPNG } from './AnimatedCoinPNG';
import { v4 as uuidv4 } from 'uuid';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput,
  FormCard, 
  FormRow, 
  SubmitButton 
} from './forms';
import type { ValidationError } from '../types';
import { useExpenseData } from '../hooks/data/useExpenseData';
import { useExpenseForm } from '../hooks/forms/useExpenseForm';
import { useExpensePagination } from '../hooks/pagination/useExpensePagination';
import { useToggle, useTimeoutToggle } from '../hooks/utils';
import { 
  DataTable, 
  StatCard, 
  ConfirmDialog,
  PaginationControls,
  GridContainer 
} from './ui';
import type { TableColumn } from './ui';

const CATEGORIES = [
  'Feed',
  'Equipment',
  'Veterinary',
  'Maintenance',
  'Supplies',
  'Other'
];


export const Expenses = () => {
  // Use custom hooks for data management
  const { 
    expenses, 
    isLoading, 
    addExpense, 
    deleteExpense, 
    totalAmount, 
    thisMonthTotal, 
    thisWeekTotal, 
    expensesByCategory 
  } = useExpenseData();

  // UI state hooks
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteExpense(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
        // Error handling is done by the hook
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

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
      render: (value, expense) => expense.date,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value, expense) => expense.category,
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, expense) => expense.description,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, expense) => formatCurrency(expense.amount),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, expense) => expense.id ? (
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
  ], [deleteConfirm]);
  
  // Use form management hook
  const continueMode = useToggle(false);
  const successState = useTimeoutToggle(false, 3000);
  
  const expenseForm = useExpenseForm({
    categories: CATEGORIES,
    onSuccess: () => {
      successState.setTrue();
      if (!continueMode.value) {
        // Reset category if not in continue mode
        expenseForm.setValue('category', CATEGORIES[0]);
      }
    }
  });
  
  // Use pagination hook
  const {
    paginatedExpenses,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    isFirstPage,
    isLastPage
  } = useExpensePagination({
    expenses,
    pageSize: 10,
    sortDirection: 'desc'
  });
  
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
  const categoryData = useMemo(() => {
    return CATEGORIES.map(category => ({
      name: category,
      total: expensesByCategory[category] || 0
    }));
  }, [expensesByCategory]);

  const yearlyTotal = calculateYearlyTotal();

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
        className="w-full"
      >
        <AnimatedCoinPNG />
      </motion.div>

      <FormCard
        title="Add New Expense"
        success={successState.value ? "Expense added successfully!" : undefined}
        error={expenseForm.errors.length > 0 ? expenseForm.errors.map(e => e.message).join(', ') : undefined}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormRow>
            <DateInput
              label="Date"
              value={expenseForm.values.date}
              onChange={expenseForm.handleChange('date')}
              required
            />
            <SelectInput
              label="Category"
              value={expenseForm.values.category}
              onChange={expenseForm.handleChange('category')}
              options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            />
          </FormRow>
          <TextInput
            label="Description"
            value={expenseForm.values.description}
            onChange={expenseForm.handleChange('description')}
            placeholder="Enter expense description"
            required
          />
          <NumberInput
            label="Amount ($)"
            value={parseFloat(expenseForm.values.amount) || 0}
            onChange={expenseForm.handleChange('amount')}
            min={0}
            step={0.01}
            placeholder="0.00"
            prefix="$"
            required
          />
          <div className="flex items-center space-x-2">
            <input
              id="continueMode"
              type="checkbox"
              checked={continueMode.value}
              onChange={(e) => continueMode.setValue(e.target.checked)}
              className="neu-checkbox"
            />
            <label htmlFor="continueMode" className="text-sm text-gray-600">
              Keep date and category for next entry
            </label>
          </div>
          <SubmitButton
            isLoading={expenseForm.isSubmitting}
            text="Add Expense"
            className="md:w-auto md:min-w-[200px]"
          />
        </form>
      </FormCard>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Expense Records</h2>
      </div>

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
          <GridContainer columns={3} gap="lg">
            <StatCard
              title="This Month"
              value={formatCurrency(thisMonthTotal)}
              description="total expenses"
              variant="primary"
              animated
            />
            <StatCard
              title="This Year"
              value={formatCurrency(yearlyTotal)}
              description="total expenses"
              variant="primary"
              animated
            />
            <StatCard
              title="Average Monthly"
              value={formatCurrency(yearlyTotal / 12)}
              description="monthly average"
              variant="primary"
              animated
            />
          </GridContainer>
        )}
      </motion.div>      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Expenses by Category</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                />
                <Bar
                  dataKey="total"
                  fill="#6366f1"
                  name="Total"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Recent Expenses</h2>
        </div>
        
        <DataTable
          data={paginatedExpenses}
          columns={tableColumns}
          loading={isLoading}
          emptyMessage="No expenses found"
          className="w-full"
        />
        
        {totalPages > 1 && (
          <PaginationControls
            totalItems={expenses.length}
            pageSize={10}
            showPageSizeSelector={false}
            variant="default"
            className="border-t border-gray-200 pt-4"
            paginationOptions={{
              initialPage: currentPage,
              totalItems: expenses.length
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};