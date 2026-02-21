import { useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, CustomerForm } from '../../../types/crm';
import { apiService } from '../../../services/api';
import { DataTable, TableColumn } from '../../ui/tables/DataTable';
import { EmptyState } from '../../ui/tables/EmptyState';
import { FormCard } from '../../ui/forms/FormCard';
import { TextInput } from '../../ui/forms/TextInput';
import { TextareaInput } from '../../ui/forms/TextareaInput';
import { FormButton } from '../../ui/forms/FormButton';

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
      if (editingCustomer) {
        // Update existing customer
        await apiService.crm.updateCustomer(editingCustomer.id, formData);
      } else {
        // Create new customer
        await apiService.crm.saveCustomer(formData);
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
      await apiService.crm.deleteCustomer(customer.id);
      onDataChange();
    } catch (err) {
      console.error('Error deactivating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate customer');
    }
  };

  // Define table columns for customers
  const customerColumns: TableColumn<Customer>[] = [
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (_value, customer) => (
        <div className="font-medium text-gray-900 dark:text-gray-200">
          {customer.name}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      render: (_value, customer) => customer.phone ? (
        <span className="text-gray-600 dark:text-gray-400">📞 {customer.phone}</span>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">-</span>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      sortable: false,
      render: (_value, customer) => customer.notes ? (
        <div className="max-w-xs">
          <span className="text-gray-600 dark:text-gray-400 text-sm truncate block">📝 {customer.notes}</span>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">-</span>
      )
    },
    {
      key: 'created_at',
      label: 'Added',
      sortable: true,
      render: (_value, customer) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {new Date(customer.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, customer) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(customer)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeactivate(customer)}
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            Deactivate
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <FormButton
          onClick={() => setIsAddingCustomer(true)}
          variant="primary"
          disabled={isAddingCustomer}
        >
          <span className="mr-2">+</span>
          Add Customer
        </FormButton>
      </div>

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

      {/* Add/Edit Customer Form */}
      {isAddingCustomer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FormCard
            title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            subtitle="Manage customer information and contact details"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Customer Name"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                placeholder="Enter customer name"
                required
              />

              <TextInput
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                placeholder="Enter phone number"
              />
            </div>

            <TextareaInput
              label="Notes"
              value={formData.notes || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              placeholder="Any notes about this customer..."
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <FormButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || !formData.name.trim()}
                loading={isSubmitting}
                className="flex-1"
              >
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
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

      {/* Customer Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Customers Yet"
            message="Add your first customer to start tracking sales and building relationships."
            action={{
              text: 'Add First Customer',
              onClick: () => setIsAddingCustomer(true)
            }}
          />
        ) : (
          <DataTable
            data={customers}
            columns={customerColumns}
            sortable
          />
        )}
      </div>
    </div>
  );
};
