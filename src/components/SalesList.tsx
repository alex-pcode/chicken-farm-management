import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, SaleWithCustomer } from '../types/crm';
import { getAuthHeaders } from '../utils/authApiUtils';

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
      const headers = await getAuthHeaders();
      
      // Convert eggs back to dozens and individual
      const saleData = {
        id: editingSale.id,
        customer_id: formData.customer_id,
        sale_date: formData.sale_date,
        dozen_count: Math.floor(formData.eggs_count / 12),
        individual_count: formData.eggs_count % 12,
        total_amount: formData.total_amount,
        notes: formData.notes
      };

      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers,
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update sale');
      }

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
        <div className="text-sm text-gray-600">
          {sales.length} total sales
        </div>
      </div>

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
      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="neu-card p-8 text-center">
            <span className="text-6xl mb-4 block">🧾</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sales Yet</h3>
            <p className="text-gray-600">Record your first sale to start tracking</p>
          </div>
        ) : (
          sales.map((sale) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neu-card p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {sale.customer_name}
                    </h3>
                    {sale.total_amount === 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Free Eggs
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Date:</span><br />
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span><br />
                      <span className={`font-semibold ${sale.total_amount === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {sale.total_amount === 0 ? 'FREE' : `$${sale.total_amount.toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Eggs:</span><br />
                      {totalEggs(sale)} ({sale.dozen_count}d + {sale.individual_count})
                    </div>
                    <div>
                      <span className="font-medium">Added:</span><br />
                      {new Date(sale.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {sale.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {sale.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="neu-button-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                    title="Edit sale"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
