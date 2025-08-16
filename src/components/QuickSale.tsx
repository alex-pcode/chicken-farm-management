import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '../types/crm';
import { apiService } from '../services/api';

interface QuickSaleProps {
  customers: Customer[];
  onDataChange: () => void;
}

export const QuickSale = ({ customers, onDataChange }: QuickSaleProps) => {
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

  const updateTotalAmount = (eggCount: number) => {
    const newTotal = eggCount * pricePerEgg;
    setFormData(prev => ({ ...prev, total_amount: newTotal }));
  };

  const handleEggCountChange = (value: number) => {
    const eggCount = Math.max(0, value);
    setFormData(prev => ({ ...prev, eggs_count: eggCount }));
    updateTotalAmount(eggCount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
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

    try {
      // Convert to API format
      const saleData = {
        customer_id: formData.customer_id,
        sale_date: formData.sale_date,
        dozen_count: Math.floor(formData.eggs_count / 12),
        individual_count: formData.eggs_count % 12,
        total_amount: formData.total_amount,
        notes: formData.notes
      };

      await apiService.crm.saveSale(saleData);

      const customerName = customers.find(c => c.id === formData.customer_id)?.name || 'Customer';
      
      if (formData.total_amount === 0) {
        setSuccess(`Free eggs recorded for ${customerName}! 🥚`);
      } else {
        setSuccess(`Sale recorded for ${customerName}! $${formData.total_amount.toFixed(2)}`);
      }
      
      // Reset form
      setFormData({
        customer_id: '',
        sale_date: new Date().toISOString().split('T')[0],
        eggs_count: 0,
        total_amount: 0,
        notes: ''
      });

      onDataChange();
    } catch (err) {
      console.error('Error recording sale:', err);
      setError(err instanceof Error ? err.message : 'Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAddEggs = (amount: number) => {
    handleEggCountChange(formData.eggs_count + amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quick Sale</h2>
        <p className="text-gray-600">Record a sale in seconds</p>
      </div>

      {/* Pricing Setup */}
      <div className="neu-card p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing</h3>
        <div>
          <label className="block text-gray-600 text-sm mb-2">Price per Egg ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={pricePerEgg}
            onChange={(e) => {
              const newPrice = parseFloat(e.target.value) || 0;
              setPricePerEgg(newPrice);
              updateTotalAmount(formData.eggs_count);
            }}
            className="neu-input"
          />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="success-toast"
        >
          ✅ {success}
          <button
            onClick={() => setSuccess(null)}
            className="text-green-500 underline text-sm mt-2 block"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-toast">
          {error}
          <button
            onClick={() => setError(null)}
            className="text-red-500 underline text-sm mt-2 block"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-form"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="customer">
                Customer *
              </label>
              <select
                id="customer"
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                className="neu-input"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="saleDate">
                Sale Date
              </label>
              <input
                id="saleDate"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="neu-input"
                required
              />
            </div>
          </div>

          {/* Egg Count */}
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="eggCount">
              Number of Eggs
            </label>
            <div className="flex items-center gap-2">
              <input
                id="eggCount"
                type="number"
                min="0"
                value={formData.eggs_count}
                onChange={(e) => handleEggCountChange(parseInt(e.target.value) || 0)}
                className="neu-input flex-1"
                placeholder="Enter egg count"
                required
              />
              <div className="flex gap-1">
                {[1, 6, 12, 24].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => quickAddEggs(amount)}
                    className="neu-button bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 text-sm"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="totalAmount">
              Total Amount ($)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                className="neu-input flex-1"
                required
              />
              <button
                type="button"
                onClick={() => updateTotalAmount(formData.eggs_count)}
                className="neu-button bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 text-sm"
                title="Auto-calculate based on pricing"
              >
                🧮
              </button>
            </div>
            {formData.eggs_count > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Suggested: ${(formData.eggs_count * pricePerEgg).toFixed(2)} 
                {formData.total_amount === 0 && ' (Set to $0 for free eggs)'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="neu-input resize-none"
              rows={2}
              placeholder="Any notes about this sale..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.customer_id || formData.eggs_count === 0}
            className="neu-button full-width bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 py-4 text-lg font-semibold"
          >
            {isSubmitting 
              ? 'Recording...' 
              : formData.total_amount === 0 
                ? 'Record Free Eggs 🥚' 
                : `Record Sale - $${formData.total_amount.toFixed(2)}`
            }
          </button>
        </form>
      </motion.div>
    </div>
  );
};
