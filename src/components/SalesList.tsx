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
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    eggs_count: 0,
    total_amount: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      customer_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      eggs_count: 0,
      total_amount: 0,
      notes: ''
    });
    setEditingSale(null);
    setError(null);
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
    if (!editingSale) return;

    setIsSubmitting(true);
    setError(null);

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

      await apiService.crm.updateSale(editingSale.id, saleData);

      resetForm();
      onDataChange();
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err instanceof Error ? err.message : 'Failed to update sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEggs = (sale: SaleWithCustomer) => (sale.dozen_count * 12) + sale.individual_count;

  // Define table columns for sales
  const salesColumns: TableColumn<SaleWithCustomer>[] = [
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (_value, sale) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{sale.customer_name}</span>
          {sale.total_amount === 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Free
            </span>
          )}
        </div>
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
          onClick={() => handleEdit(sale)}
          className="inline-flex items-center p-2 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          title="Edit sale"
        >
          ✏️
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <FormButton
            onClick={() => setError(null)}
            variant="secondary"
            size="sm"
          >
            Dismiss
          </FormButton>
        </div>
      )}

      {/* Edit Form */}
      {editingSale && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FormCard
            title="Edit Sale"
            subtitle="Update sale information and details"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NeumorphicSelect
                label="Customer"
                value={formData.customer_id}
                onChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                options={[
                  { value: '', label: 'Select customer' },
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

              <NumberInput
                label="Total Amount ($)"
                value={formData.total_amount}
                onChange={(value) => setFormData(prev => ({ ...prev, total_amount: value }))}
                step={0.01}
                min={0}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Eggs"
                value={formData.eggs_count}
                onChange={(value) => setFormData(prev => ({ ...prev, eggs_count: value }))}
                min={0}
              />

              <div /> {/* Empty div for grid spacing */}
            </div>

            <TextareaInput
              label="Notes"
              value={formData.notes}
              onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              placeholder="Any notes about this sale..."
              rows={2}
            />

            <div className="flex gap-3 pt-4">
              <FormButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="flex-1"
              >
                Update Sale
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
          <div className="text-sm text-gray-500">
            Showing {sales.length} of {sales.length} entries
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {sales.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No Sales Yet"
              message="Record your first sale to start tracking revenue and customer purchases."
            />
          ) : (
            <DataTable
              data={sales.slice().reverse()}
              columns={salesColumns}
              sortable
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
