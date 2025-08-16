import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, SaleWithCustomer } from '../types/crm';
import { apiService } from '../services/api';

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

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 underline text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Edit Form */}
      {editingSale && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="neu-card p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800">Edit Sale</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Customer</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                className="neu-input"
                required
              >
                <option value="">Select customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-2">Sale Date</label>
              <input
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="neu-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Total Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Eggs</label>
              <input
                type="number"
                min="0"
                value={formData.eggs_count}
                onChange={(e) => setFormData(prev => ({ ...prev, eggs_count: parseInt(e.target.value) || 0 }))}
                className="neu-input"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-2">Total Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                className="neu-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="neu-input resize-none"
              rows={2}
              placeholder="Any notes about this sale..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="neu-button bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Sale'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="neu-button bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Sales List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
          <div className="text-sm text-gray-500">
            Showing {sales.length} of {sales.length} entries
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🧾</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sales Yet</h3>
            <p className="text-gray-600">Record your first sale to start tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Customer</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Date</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Eggs</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Amount</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Notes</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.slice().reverse().map((sale) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {sale.customer_name}
                        {sale.total_amount === 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {totalEggs(sale)} <span className="text-gray-400">({sale.dozen_count}d + {sale.individual_count})</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <span className={sale.total_amount === 0 ? 'text-green-600 font-semibold' : 'text-gray-900'}>
                        {sale.total_amount === 0 ? 'FREE' : `$${sale.total_amount.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {sale.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="inline-flex items-center p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Edit sale"
                      >
                        ✏️
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
