import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, SaleWithCustomer } from '../types/crm';
import { apiService } from '../services/api';
import { DataTable, TableColumn } from './ui/tables/DataTable';
import { EmptyState } from './ui/tables/EmptyState';
import { FormCard } from './ui/forms/FormCard';
// import { TextInput } from './forms/TextInput'; // Unused import
import { NumberInput } from './forms/NumberInput';
import { DateInput } from './forms/DateInput';
import { NeumorphicSelect } from './forms/NeumorphicSelect';
import { TextareaInput } from './forms/TextareaInput';
import { FormButton } from './ui/forms/FormButton';

interface SalesListProps {
  sales: SaleWithCustomer[];
  customers: Customer[];
  onDataChange: () => void;
}

export const SalesList = ({ sales, customers, onDataChange }: SalesListProps) => {
  const [editingSale, setEditingSale] = useState<SaleWithCustomer | null>(null);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    eggs_count: 0,
    total_amount: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Price per egg for quick calculation
  const [pricePerEgg, setPricePerEgg] = useState(0.30);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<keyof SaleWithCustomer>('sale_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const resetForm = () => {
    setFormData({
      customer_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      eggs_count: 0,
      total_amount: 0,
      notes: ''
    });
    setEditingSale(null);
    setIsAddingSale(false);
    setError(null);
    setSuccess(null);
  };

  const updateTotalAmount = (eggCount: number) => {
    const newTotal = eggCount * pricePerEgg;
    setFormData(prev => ({ ...prev, total_amount: newTotal }));
  };

  const handleEggCountChange = (value: number) => {
    const eggCount = Math.max(0, value);
    setFormData(prev => ({ ...prev, eggs_count: eggCount }));
    updateTotalAmount(eggCount);
  };

  const handleDelete = async (sale: SaleWithCustomer) => {
    const customerName = sale.customer_name || 'Unknown Customer';
    if (!confirm(`Are you sure you want to delete the sale for ${customerName}?`)) {
      return;
    }

    try {
      await apiService.crm.deleteSale(sale.id);
      setSuccess(`Sale for ${customerName} has been deleted`);
      onDataChange();
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sale');
    }
  };

  const handleEdit = (sale: SaleWithCustomer) => {
    setEditingSale(sale);
    const totalEggs = (sale.dozen_count * 12) + sale.individual_count;
    setFormData({
      customer_id: sale.customer_id,
      sale_date: sale.sale_date,
      eggs_count: totalEggs,
      total_amount: sale.total_amount,
      notes: sale.notes || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation for new sale
    if (!editingSale) {
      if (!formData.customer_id) {
        setError('Please select a customer');
        setIsSubmitting(false);
        return;
      }

      if (formData.eggs_count === 0) {
        setError('Please enter at least some eggs');
        setIsSubmitting(false);
        return;
      }

      if (formData.total_amount < 0) {
        setError('Total amount cannot be negative');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Convert eggs back to dozens and individual
      const saleData = {
        customer_id: formData.customer_id,
        sale_date: formData.sale_date,
        dozen_count: Math.floor(formData.eggs_count / 12),
        individual_count: formData.eggs_count % 12,
        total_amount: formData.total_amount,
        notes: formData.notes
      };

      if (editingSale) {
        // Update existing sale
        await apiService.crm.updateSale(editingSale.id, saleData);
        resetForm();
      } else {
        // Create new sale
        await apiService.crm.saveSale(saleData);
        
        const customerName = customers.find(c => c.id === formData.customer_id)?.name || 'Customer';
        
        // Store success message before reset
        const successMessage = formData.total_amount === 0 
          ? `Free eggs recorded for ${customerName}! 🥚`
          : `Sale recorded for ${customerName}! $${formData.total_amount.toFixed(2)}`;
        
        resetForm();
        
        // Set success after reset so it shows when form is closed
        setSuccess(successMessage);
      }

      onDataChange();
    } catch (err) {
      console.error('Error saving sale:', err);
      setError(err instanceof Error ? err.message : (editingSale ? 'Failed to update sale' : 'Failed to record sale'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEggs = (sale: SaleWithCustomer) => (sale.dozen_count * 12) + sale.individual_count;

  // Sorting handler
  const handleSort = (column: keyof SaleWithCustomer, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Sort and slice the data
  const sortedAndSlicedSales = [...sales]
    .sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle special cases for sorting
      if (sortColumn === 'customer_name') {
        aValue = a.customer_name || '';
        bValue = b.customer_name || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    })
    .slice(0, 10);

  // Define table columns for sales
  const salesColumns: TableColumn<SaleWithCustomer>[] = [
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (_value, sale) => (
        <span className="font-medium text-gray-900">{sale.customer_name}</span>
      )
    },
    {
      key: 'sale_date',
      label: 'Date',
      sortable: true,
      render: (_value, sale) => (
        <span className="text-gray-600">
          {new Date(sale.sale_date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'dozen_count',
      label: 'Eggs',
      sortable: true,
      render: (_, sale) => (
        <div className="text-gray-600">
          <span className="font-medium">{totalEggs(sale)}</span>
          <span className="text-gray-400 text-xs ml-1">
            ({sale.dozen_count}d + {sale.individual_count})
          </span>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (_value, sale) => (
        <span className={sale.total_amount === 0 ? 'text-green-600 font-semibold' : 'text-gray-900 font-medium'}>
          {sale.total_amount === 0 ? 'FREE' : `$${sale.total_amount.toFixed(2)}`}
        </span>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      sortable: false,
      render: (_value, sale) => (
        <div className="max-w-xs">
          <span className="text-gray-600 text-sm truncate block">
            {sale.notes || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_, sale) => (
        <button
          onClick={() => handleDelete(sale)}
          className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          title="Delete sale"
        >
          🗑️
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Record Sale Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
        <FormButton
          onClick={() => setIsAddingSale(true)}
          variant="primary"
          disabled={isAddingSale || !!editingSale}
        >
          <span className="mr-2">+</span>
          Record Sale
        </FormButton>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <span className="text-green-600 text-xl mr-3">✅</span>
            <div className="flex-1">
              <p className="text-green-700 font-medium">{success}</p>
              <FormButton
                onClick={() => setSuccess(null)}
                variant="secondary"
                size="sm"
                className="mt-2"
              >
                Dismiss
              </FormButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-600 text-xl mr-3">❌</span>
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
              <FormButton
                onClick={() => setError(null)}
                variant="secondary"
                size="sm"
                className="mt-2"
              >
                Dismiss
              </FormButton>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Sale Form */}
      {(isAddingSale || editingSale) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FormCard
            title={editingSale ? 'Edit Sale' : 'Record New Sale'}
            subtitle={editingSale ? 'Update sale information and details' : 'Enter sale details and pricing below'}
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {!editingSale && (
                <NumberInput
                  label="Price per Egg ($)"
                  value={pricePerEgg}
                  onChange={(value) => {
                    setPricePerEgg(value);
                    updateTotalAmount(formData.eggs_count);
                  }}
                  step={0.01}
                  min={0}
                  placeholder="0.30"
                />
              )}
              
              <NeumorphicSelect
                label="Customer"
                value={formData.customer_id}
                onChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                options={[
                  { value: '', label: editingSale ? 'Select customer' : 'Select a customer' },
                  ...customers.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  }))
                ]}
                required
              />

              <DateInput
                label="Sale Date"
                value={formData.sale_date}
                onChange={(value) => setFormData(prev => ({ ...prev, sale_date: value }))}
                max={new Date().toISOString().split('T')[0]}
                required
              />

              {editingSale && (
                <NumberInput
                  label="Total Amount ($)"
                  value={formData.total_amount}
                  onChange={(value) => setFormData(prev => ({ ...prev, total_amount: value }))}
                  step={0.01}
                  min={0}
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label={editingSale ? 'Eggs' : 'Number of Eggs'}
                value={formData.eggs_count}
                onChange={editingSale ? (value) => setFormData(prev => ({ ...prev, eggs_count: value })) : handleEggCountChange}
                min={0}
                placeholder={editingSale ? undefined : 'Enter egg count'}
                required={!editingSale}
              />

              {!editingSale && (
                <NumberInput
                  label="Total Amount ($)"
                  value={formData.total_amount}
                  onChange={(value) => setFormData(prev => ({ ...prev, total_amount: value }))}
                  step={0.01}
                  min={0}
                  required
                />
              )}
            </div>

            {formData.eggs_count >= 12 && (
              <div className="text-sm text-gray-500">
                <p>
                  {Math.floor(formData.eggs_count / 12)} dozen + {formData.eggs_count % 12} individual
                </p>
              </div>
            )}

            <TextareaInput
              label={editingSale ? 'Notes' : 'Notes (optional)'}
              value={formData.notes}
              onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              placeholder="Any notes about this sale..."
              rows={2}
            />

            <div className="flex gap-3 pt-4">
              <FormButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || (!editingSale && (!formData.customer_id || formData.eggs_count === 0))}
                loading={isSubmitting}
                className="flex-1"
              >
                {editingSale 
                  ? 'Update Sale' 
                  : formData.total_amount === 0 
                    ? 'Record Free Eggs 🥚' 
                    : `Record Sale - $${formData.total_amount.toFixed(2)}`
                }
              </FormButton>
              <FormButton
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Cancel
              </FormButton>
            </div>
          </FormCard>
        </motion.div>
      )}

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {sales.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No Sales Yet"
              message="Record your first sale to start tracking revenue and customer purchases."
            />
          ) : (
            <DataTable
              data={sortedAndSlicedSales}
              columns={salesColumns}
              sortable
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
