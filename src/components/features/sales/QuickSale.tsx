import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '../../../types/crm';
import { apiService } from '../../../services/api';
import { FormCard } from '../../ui/forms/FormCard';
import { NumberInput } from '../../ui/forms/NumberInput';
import { DateInput } from '../../ui/forms/DateInput';
import { NeumorphicSelect } from '../../ui/forms/NeumorphicSelect';
import { TextareaInput } from '../../ui/forms/TextareaInput';
import { FormButton } from '../../ui/forms/FormButton';

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


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quick Sale ⚡</h2>
        <p className="text-gray-600 dark:text-gray-400">Record a sale in seconds with smart calculations</p>
      </div>


      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md"
        >
          {success}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md"
        >
          {error}
        </motion.div>
      )}

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FormCard
          title="Record Sale"
          subtitle="Enter sale details and pricing below"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
            <NeumorphicSelect
              label="Customer"
              value={formData.customer_id}
              onChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
              options={[
                { value: '', label: 'Select a customer' },
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
              label="Number of Eggs"
              value={formData.eggs_count}
              onChange={handleEggCountChange}
              min={0}
              placeholder="Enter egg count"
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

          {formData.eggs_count >= 12 && (
            <div className="text-sm text-gray-500">
              <p>
                {Math.floor(formData.eggs_count / 12)} dozen + {formData.eggs_count % 12} individual
              </p>
            </div>
          )}

          <TextareaInput
            label="Notes (optional)"
            value={formData.notes || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            placeholder="Any notes about this sale..."
            rows={2}
          />

          {/* Submit Button */}
          <div className="pt-4 flex justify-center">
            <FormButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.customer_id || formData.eggs_count === 0}
              loading={isSubmitting}
              className="px-8 py-4 text-lg font-semibold dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-900"
            >
              {formData.total_amount === 0 
                ? 'Record Free Eggs 🥚' 
                : `Record Sale - $${formData.total_amount.toFixed(2)}`
              }
            </FormButton>
          </div>
        </FormCard>
      </motion.div>
    </div>
  );
};
