import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, CustomerForm } from '../types/crm';
import { getAuthHeaders } from '../utils/authApiUtils';

interface CustomerListProps {
  customers: Customer[];
  onDataChange: () => void;
}

export const CustomerList = ({ customers, onDataChange }: CustomerListProps) => {
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: '', phone: '', notes: '' });
    setIsAddingCustomer(false);
    setEditingCustomer(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      if (editingCustomer) {
        // Update existing customer
        const response = await fetch('/api/customers', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            id: editingCustomer.id,
            ...formData
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update customer');
        }
      } else {
        // Create new customer
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create customer');
        }
      }

      resetForm();
      onDataChange();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      notes: customer.notes || ''
    });
    setIsAddingCustomer(true);
  };

  const handleDeactivate = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to deactivate ${customer.name}?`)) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          notes: customer.notes,
          is_active: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate customer');
      }

      onDataChange();
    } catch (err) {
      console.error('Error deactivating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button
          onClick={() => setIsAddingCustomer(true)}
          className="neu-button bg-green-100 text-green-700 hover:bg-green-200"
          disabled={isAddingCustomer}
        >
          <span className="mr-2">+</span>
          Add Customer
        </button>
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

      {/* Add/Edit Customer Form */}
      {isAddingCustomer && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="neu-card p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="form-input resize-none"
              rows={3}
              placeholder="Any notes about this customer..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="neu-button bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Add Customer')}
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

      {/* Customer List */}
      <div className="grid gap-4">
        {customers.length === 0 ? (
          <div className="neu-card p-8 text-center">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Customers Yet</h3>
            <p className="text-gray-600 mb-4">Add your first customer to start tracking sales</p>
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="neu-button bg-green-100 text-green-700 hover:bg-green-200"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          customers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neu-card p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {customer.name}
                  </h3>
                  {customer.phone && (
                    <p className="text-gray-600 mb-1">
                      📞 {customer.phone}
                    </p>
                  )}
                  {customer.notes && (
                    <p className="text-gray-600 text-sm mb-2">
                      📝 {customer.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Added: {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="neu-button-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                    title="Edit customer"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeactivate(customer)}
                    className="neu-button-sm bg-red-100 text-red-700 hover:bg-red-200"
                    title="Deactivate customer"
                  >
                    🗑️
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
