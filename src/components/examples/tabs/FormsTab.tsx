import React, { useState } from 'react';
import { FormCard } from '../../ui/forms/FormCard';
import { FormField } from '../../ui/forms/FormField';
import { FormButton } from '../../ui/forms/FormButton';
import { TextInput } from '../../forms/TextInput';
import { NumberInput } from '../../forms/NumberInput';
import { DateInput } from '../../forms/DateInput';
import { NeumorphicSelect } from '../../forms/NeumorphicSelect';
import { TextareaInput } from '../../forms/TextareaInput';

const FormsTab: React.FC = () => {
  const [eggFormData, setEggFormData] = useState({
    date: '',
    eggs: 0,
    hens: 0,
    weather: '',
    notes: ''
  });

  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferredContact: '',
    eggPreference: '',
    deliveryNotes: ''
  });

  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    amount: 0,
    description: ''
  });

  const handleEggFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Egg collection logged successfully!');
    setEggFormData({
      date: '',
      eggs: 0,
      hens: 0,
      weather: '',
      notes: ''
    });
  };

  const handleCustomerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Customer registered successfully!');
    setCustomerFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      preferredContact: '',
      eggPreference: '',
      deliveryNotes: ''
    });
  };

  const handleExpenseFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Expense recorded successfully!');
    setExpenseFormData({
      category: '',
      amount: 0,
      description: ''
    });
  };

  return (
    <div className="space-y-12">
      {/* Basic Form Components */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Form Components</h2>
          <p className="text-gray-600">Complete forms using FormCard and FormField components</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FormCard
            title="Daily Egg Collection"
            subtitle="Record today's egg production data"
            onSubmit={handleEggFormSubmit}
          >
            <DateInput
              label="Date"
              value={eggFormData.date}
              onChange={(value: string) => setEggFormData({...eggFormData, date: value})}
              required
            />
            
            <NumberInput
              label="Eggs Collected"
              value={eggFormData.eggs}
              onChange={(value: number) => setEggFormData({...eggFormData, eggs: value})}
              placeholder="Enter number of eggs"
              required
            />
            
            <NumberInput
              label="Active Hens"
              value={eggFormData.hens}
              onChange={(value: number) => setEggFormData({...eggFormData, hens: value})}
              placeholder="Number of laying hens"
              required
            />
            
            <NeumorphicSelect
              label="Weather Conditions"
              value={eggFormData.weather}
              onChange={(value: string) => setEggFormData({...eggFormData, weather: value})}
              options={[
                { value: '', label: 'Select weather...' },
                { value: 'sunny', label: 'Sunny' },
                { value: 'cloudy', label: 'Cloudy' },
                { value: 'rainy', label: 'Rainy' },
                { value: 'partly-sunny', label: 'Partly Sunny' },
                { value: 'stormy', label: 'Stormy' }
              ]}
              required
            />
            
            <TextareaInput
              label="Notes"
              value={eggFormData.notes}
              onChange={(value: string) => setEggFormData({...eggFormData, notes: value})}
              placeholder="Any observations or notes..."
              rows={3}
            />
            
            <div className="flex gap-6 pt-4 justify-center border-t border-gray-200">
              <FormButton type="submit" variant="primary">
                Log Collection
              </FormButton>
              <FormButton 
                type="button" 
                variant="secondary"
                className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
                onClick={() => setEggFormData({
                  date: '',
                  eggs: 0,
                  hens: 0,
                  weather: '',
                  notes: ''
                })}
              >
                Reset
              </FormButton>
            </div>
          </FormCard>

          <FormCard
            title="Customer Registration"
            subtitle="Add a new customer to your database"
            onSubmit={handleCustomerFormSubmit}
          >
            <TextInput
              label="Full Name"
              value={customerFormData.name}
              onChange={(value: string) => setCustomerFormData({...customerFormData, name: value})}
              placeholder="Enter customer name"
              required
            />
            
            <TextInput
              label="Email Address"
              type="email"
              value={customerFormData.email}
              onChange={(value: string) => setCustomerFormData({...customerFormData, email: value})}
              placeholder="customer@example.com"
              required
            />
            
            <TextInput
              label="Phone Number"
              value={customerFormData.phone}
              onChange={(value: string) => setCustomerFormData({...customerFormData, phone: value})}
              placeholder="(555) 123-4567"
            />
            
            <TextareaInput
              label="Address"
              value={customerFormData.address}
              onChange={(value: string) => setCustomerFormData({...customerFormData, address: value})}
              placeholder="Street address..."
              rows={2}
            />
            
            <FormField label="Preferred Contact Method">
              <div className="space-y-2">
                {[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                  { value: 'text', label: 'Text Message' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      value={option.value}
                      checked={customerFormData.preferredContact === option.value}
                      onChange={(e) => setCustomerFormData({...customerFormData, preferredContact: e.target.value})}
                      className="form-radio"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </FormField>
            
            <FormField label="Egg Preference">
              <div className="space-y-2">
                {[
                  { value: 'brown', label: 'Brown Eggs' },
                  { value: 'white', label: 'White Eggs' },
                  { value: 'mixed', label: 'Mixed Colors' },
                  { value: 'organic', label: 'Organic Only' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={customerFormData.eggPreference.includes(option.value)}
                      onChange={(e) => {
                        const currentPrefs = customerFormData.eggPreference.split(',').filter(p => p.trim());
                        if (e.target.checked) {
                          setCustomerFormData({...customerFormData, eggPreference: [...currentPrefs, option.value].join(',')});
                        } else {
                          setCustomerFormData({...customerFormData, eggPreference: currentPrefs.filter(p => p !== option.value).join(',')});
                        }
                      }}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </FormField>
            
            <TextareaInput
              label="Delivery Notes"
              value={customerFormData.deliveryNotes}
              onChange={(value: string) => setCustomerFormData({...customerFormData, deliveryNotes: value})}
              placeholder="Special delivery instructions..."
              rows={2}
            />
            
            <div className="flex gap-6 pt-4 justify-center border-t border-gray-200">
              <FormButton type="submit" variant="primary">
                Register Customer
              </FormButton>
              <FormButton 
                type="button" 
                variant="secondary"
                className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
                onClick={() => setCustomerFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  preferredContact: '',
                  eggPreference: '',
                  deliveryNotes: ''
                })}
              >
                Clear
              </FormButton>
            </div>
          </FormCard>
        </div>
      </section>

      {/* Form Layout Variations */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Layout Variations</h2>
          <p className="text-gray-600">Different form layouts and orientations</p>
        </div>
        
        <FormCard
          title="Quick Expense Entry"
          subtitle="Record a farm expense inline"
          onSubmit={handleExpenseFormSubmit}
        >
          <div className="flex gap-4 items-end">
            <NeumorphicSelect
              label="Category"
              value={expenseFormData.category}
              onChange={(value: string) => setExpenseFormData({...expenseFormData, category: value})}
              options={[
                { value: '', label: 'Select...' },
                { value: 'feed', label: 'Feed' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'veterinary', label: 'Veterinary' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'utilities', label: 'Utilities' },
                { value: 'other', label: 'Other' }
              ]}
              className="min-w-[150px]"
              required
            />
            
            <NumberInput
              label="Amount"
              value={expenseFormData.amount}
              onChange={(value: number) => setExpenseFormData({...expenseFormData, amount: value})}
              placeholder="0.00"
              step={0.01}
              min={0}
              className="min-w-[120px]"
              required
            />
            
            <TextInput
              label="Description"
              value={expenseFormData.description}
              onChange={(value: string) => setExpenseFormData({...expenseFormData, description: value})}
              placeholder="Brief description..."
              className="flex-1"
            />
            
            <FormButton type="submit" variant="primary">
              Add Expense
            </FormButton>
          </div>
        </FormCard>
      </section>

      {/* Form Button Variations */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Button Variations</h2>
          <p className="text-gray-600">All available button styles and states</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Primary Buttons</h3>
            <div className="space-y-3">
              <FormButton variant="primary" onClick={() => alert('Primary clicked')}>
                Primary Button
              </FormButton>
              <FormButton variant="primary" disabled>
                Disabled Primary
              </FormButton>
              <FormButton variant="primary" loading>
                Loading...
              </FormButton>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Secondary Buttons</h3>
            <div className="space-y-3">
              <FormButton 
                variant="secondary" 
                onClick={() => alert('Secondary clicked')}
                className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
              >
                Secondary Button
              </FormButton>
              <FormButton 
                variant="secondary" 
                disabled
                className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
              >
                Disabled Secondary
              </FormButton>
              <FormButton 
                variant="secondary" 
                loading
                className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
              >
                Processing...
              </FormButton>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Danger Buttons</h3>
            <div className="space-y-3">
              <FormButton 
                variant="danger" 
                onClick={() => alert('Danger clicked')}
                className="!bg-[#2a2580] !border-[#2a2580] hover:!bg-[#1e1b60]"
              >
                Delete Action
              </FormButton>
              <FormButton 
                variant="danger" 
                disabled
                className="!bg-[#2a2580] !border-[#2a2580] !opacity-60"
              >
                Disabled Danger
              </FormButton>
              <FormButton 
                variant="danger" 
                loading
                className="!bg-[#2a2580] !border-[#2a2580] hover:!bg-[#1e1b60]"
              >
                Deleting...
              </FormButton>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Outline Buttons</h3>
            <div className="space-y-3">
              <FormButton variant="secondary" onClick={() => alert('Outline clicked')}>
                Outline Button
              </FormButton>
              <FormButton variant="secondary" disabled>
                Disabled Outline
              </FormButton>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Ghost Buttons</h3>
            <div className="space-y-3">
              <FormButton variant="secondary" onClick={() => alert('Ghost clicked')}>
                Ghost Button
              </FormButton>
              <FormButton variant="secondary" disabled>
                Disabled Ghost
              </FormButton>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Size Variations</h3>
            <div className="space-y-3">
              <FormButton variant="primary" size="sm">
                Small Button
              </FormButton>
              <FormButton variant="primary" size="md">
                Medium Button
              </FormButton>
              <FormButton variant="primary" size="lg">
                Large Button
              </FormButton>
            </div>
          </div>
        </div>
      </section>

      {/* Form Field Types */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Field Types</h2>
          <p className="text-gray-600">Complete showcase of all available form field types</p>
        </div>
        
        <FormCard
          title="All Field Types"
          subtitle="Comprehensive form field showcase"
          onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextInput
                label="Text Input"
                value=""
                onChange={() => {}}
                placeholder="Enter text..."
              />
              
              <TextInput
                label="Email Input"
                type="email"
                value=""
                onChange={() => {}}
                placeholder="user@example.com"
                required
              />
              
              <div>
                <TextInput
                  label="Password Input"
                  type="password"
                  value=""
                  onChange={() => {}}
                  placeholder="••••••••"
                />
                <p className="text-gray-500 text-xs mt-1">Password should be at least 8 characters</p>
              </div>
              
              <NumberInput
                label="Number Input"
                value={0}
                onChange={() => {}}
                placeholder="0"
                min={0}
                max={100}
                step={1}
              />
              
              <DateInput
                label="Date Input"
                value=""
                onChange={() => {}}
                required
              />
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Time Input</label>
                <input
                  type="time"
                  className="neu-input"
                />
              </div>
              
              <TextInput
                label="Phone Input"
                value=""
                onChange={() => {}}
                placeholder="(555) 123-4567"
              />
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">URL Input</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="neu-input"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <NeumorphicSelect
                label="Select Dropdown"
                value=""
                onChange={() => {}}
                options={[
                  { value: '', label: 'Choose option...' },
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' }
                ]}
                required
              />
              
              <div>
                <TextareaInput
                  label="Textarea"
                  value=""
                  onChange={() => {}}
                  placeholder="Enter multiple lines..."
                  rows={4}
                />
                <p className="text-gray-500 text-xs mt-1">Use this for longer text content</p>
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Radio Buttons</label>
                <div className="space-y-2">
                  {[
                    { value: 'small', label: 'Small Farm (1-25 hens)' },
                    { value: 'medium', label: 'Medium Farm (26-100 hens)' },
                    { value: 'large', label: 'Large Farm (100+ hens)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="farmSize"
                        value={option.value}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-1">Select your farm size</p>
              </div>
              
              <FormField label="Checkboxes" help="Select your preferences">
                <div className="space-y-2">
                  {[
                    { value: 'newsletter', label: 'Subscribe to newsletter' },
                    { value: 'updates', label: 'Receive product updates' },
                    { value: 'marketing', label: 'Allow marketing emails' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={option.value}
                        className="form-checkbox"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormField>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  className="neu-input"
                />
                <p className="text-gray-500 text-xs mt-1">Upload an image file</p>
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Hidden Field</label>
                <input
                  type="hidden"
                  value="hidden-value"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Range Slider</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-gray-500 text-xs mt-1">Adjust the value using the slider</p>
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Color Picker</label>
                <input
                  type="color"
                  className="w-12 h-8 border border-gray-300 rounded"
                />
                <p className="text-gray-500 text-xs mt-1">Choose a color</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 pt-6 justify-center border-t border-gray-200">
            <FormButton type="submit" variant="primary">
              Submit All Fields
            </FormButton>
            <FormButton 
              type="reset" 
              variant="secondary"
              className="hover:!bg-[#2a2580] hover:!border-[#2a2580] hover:!text-white"
            >
              Reset Form
            </FormButton>
          </div>
        </FormCard>
      </section>
    </div>
  );
};

export default FormsTab;