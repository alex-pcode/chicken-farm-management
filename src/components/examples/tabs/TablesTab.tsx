import React from 'react';
import { DataTable } from '../../ui/tables/DataTable';
import { DataList } from '../../ui/tables/DataList';
import { EmptyState } from '../../ui/tables/EmptyState';

const TablesTab: React.FC = () => {
  // Sample data for tables
  const eggProductionData = [
    { 
      id: '1', 
      date: '2024-08-17', 
      eggs: 47, 
      hens: 45, 
      rate: 104.4, 
      weather: 'Sunny',
      notes: 'Excellent production day'
    },
    { 
      id: '2', 
      date: '2024-08-16', 
      eggs: 42, 
      hens: 45, 
      rate: 93.3, 
      weather: 'Cloudy',
      notes: 'Normal production'
    },
    { 
      id: '3', 
      date: '2024-08-15', 
      eggs: 45, 
      hens: 45, 
      rate: 100.0, 
      weather: 'Partly Sunny',
      notes: 'Good day'
    },
    { 
      id: '4', 
      date: '2024-08-14', 
      eggs: 39, 
      hens: 45, 
      rate: 86.7, 
      weather: 'Rainy',
      notes: 'Weather affected production'
    },
    { 
      id: '5', 
      date: '2024-08-13', 
      eggs: 48, 
      hens: 45, 
      rate: 106.7, 
      weather: 'Sunny',
      notes: 'Peak production'
    }
  ];

  const customerData = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      totalOrders: 12,
      totalSpent: 156.00,
      status: 'active',
      lastOrder: '2024-08-15'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'm.chen@email.com',
      phone: '(555) 234-5678',
      totalOrders: 8,
      totalSpent: 104.00,
      status: 'active',
      lastOrder: '2024-08-10'
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      email: 'lisa.r@email.com',
      phone: '(555) 345-6789',
      totalOrders: 15,
      totalSpent: 195.00,
      status: 'premium',
      lastOrder: '2024-08-17'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '(555) 456-7890',
      totalOrders: 3,
      totalSpent: 39.00,
      status: 'new',
      lastOrder: '2024-08-05'
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'e.wilson@email.com',
      phone: '(555) 567-8901',
      totalOrders: 0,
      totalSpent: 0.00,
      status: 'inactive',
      lastOrder: null
    }
  ];

  const sampleListData = [
    {
      id: '1',
      title: 'Morning Egg Collection',
      description: 'Collected 47 eggs from main coop',
      metadata: { time: '8:30 AM', collector: 'John' },
      status: 'completed',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Feed Distribution',
      description: 'Distributed 25 lbs of layer feed',
      metadata: { time: '9:15 AM', location: 'Main Coop' },
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Nest Box Cleaning',
      description: 'Clean and refresh nesting materials',
      metadata: { scheduled: '2:00 PM', estimated: '30 min' },
      status: 'pending',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Water System Check',
      description: 'Inspect and refill water containers',
      metadata: { lastCheck: '2 hours ago', level: '75%' },
      status: 'in_progress',
      priority: 'high'
    }
  ];

  return (
    <div className="space-y-5">
      {/* DataTable Component */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DataTable Component</h2>
          <p className="text-gray-600">Sortable table with pagination and actions</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="absolute pointer-events-none transition-opacity duration-300" style={{
            top: '-25%',
            right: '-15%',
            width: '35%',
            height: '30%',
            borderRadius: '70%',
            background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
            filter: 'blur(60px)',
            opacity: 0.6
          }}></div>
          <div className="relative">
            <DataTable
              data={eggProductionData}
              columns={[
                { 
                  key: 'date', 
                  label: 'Date', 
                  sortable: true,
                  render: (value) => new Date(value as string).toLocaleDateString()
                },
                { 
                  key: 'eggs', 
                  label: 'Eggs', 
                  sortable: true,
                  render: (value) => `${value} eggs`
                },
                { 
                  key: 'hens', 
                  label: 'Hens', 
                  sortable: true 
                },
                { 
                  key: 'rate', 
                  label: 'Rate (%)', 
                  sortable: true,
                  render: (value) => `${value}%`
                },
                { 
                  key: 'weather', 
                  label: 'Weather', 
                  sortable: true 
                },
                { 
                  key: 'notes', 
                  label: 'Notes', 
                  sortable: false 
                }
              ]}
              sortable
            />
          </div>
        </div>
      </section>

      {/* Customer Management Table */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Management Table</h2>
          <p className="text-gray-600">Customer database with status indicators</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="absolute pointer-events-none transition-opacity duration-300" style={{
            top: '-25%',
            right: '-15%',
            width: '35%',
            height: '30%',
            borderRadius: '70%',
            background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
            filter: 'blur(60px)',
            opacity: 0.6
          }}></div>
          <div className="relative">
            <DataTable
              data={customerData}
              columns={[
                { 
                  key: 'name', 
                  label: 'Name', 
                  sortable: true 
                },
                { 
                  key: 'email', 
                  label: 'Email', 
                  sortable: true 
                },
                { 
                  key: 'phone', 
                  label: 'Phone', 
                  sortable: false 
                },
                { 
                  key: 'totalOrders', 
                  label: 'Orders', 
                  sortable: true 
                },
                { 
                  key: 'totalSpent', 
                  label: 'Spent', 
                  sortable: true,
                  render: (value) => `$${value && typeof value === 'number' ? value.toFixed(2) : '0.00'}`
                },
                { 
                  key: 'status', 
                  label: 'Status', 
                  sortable: true,
                  render: (value) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      value === 'active' ? 'bg-[#544CE6]' :
                      value === 'premium' ? 'bg-[#2A2580]' :
                      value === 'new' ? 'bg-[#191656]' :
                      'bg-gray-500'
                    }`}>
                      {value as string}
                    </span>
                  )
                },
                { 
                  key: 'lastOrder', 
                  label: 'Last Order', 
                  sortable: true,
                  render: (value) => value ? new Date(value as string).toLocaleDateString() : 'Never'
                }
              ]}
              sortable
            />
          </div>
        </div>
      </section>

      {/* DataList Component */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DataList Component</h2>
          <p className="text-gray-600">List display with different layout variants</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default List</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <DataList
                data={sampleListData}
                renderItem={(item) => (
                  <div className="flex items-start justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <span key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        item.status === 'completed' ? 'bg-[#544CE6]' :
                        item.status === 'in_progress' ? 'bg-[#2A2580]' :
                        'bg-[#191656]'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        item.priority === 'high' ? 'bg-[#191656]' :
                        item.priority === 'medium' ? 'bg-[#2A2580]' :
                        'bg-[#544CE6]'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Grid Layout</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <DataList
                data={sampleListData.slice(0, 3)}
                variant="grid"
                renderItem={(item) => (
                  <div className="text-center p-6 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                      item.status === 'completed' ? 'bg-[#544CE6]' :
                      item.status === 'in_progress' ? 'bg-[#2A2580]' :
                      'bg-[#191656]'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compact Layout</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <DataList
                data={sampleListData}
                variant="compact"
                renderItem={(item) => (
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div>
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <span className="ml-2 text-sm text-gray-500">({item.status.replace('_', ' ')})</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      item.priority === 'high' ? 'bg-[#191656]' :
                      item.priority === 'medium' ? 'bg-[#2A2580]' :
                      'bg-[#544CE6]'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Empty States */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empty States</h2>
          <p className="text-gray-600">Various empty state displays</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Empty State</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                title="No data available"
                message="There's nothing to show here yet."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compact Empty State</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                title="Empty"
                message="No items found."
                variant="compact"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Empty Table</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                icon="📊"
                title="No records found"
                message="Your table data will appear here once you add some records."
                action={{
                  text: 'Add Record',
                  onClick: () => alert('Add new record')
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Empty List</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                icon="📝"
                title="No tasks yet"
                message="Create your first task to get started with managing your farm activities."
                action={{
                  text: 'Create Task',
                  onClick: () => alert('Create new task')
                }}
                variant="compact"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading States</h2>
          <p className="text-gray-600">Loading indicators for tables and lists</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loading Table</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
              <div className="absolute pointer-events-none transition-opacity duration-300" style={{
                top: '-25%',
                right: '-15%',
                width: '35%',
                height: '30%',
                borderRadius: '70%',
                background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
                filter: 'blur(60px)',
                opacity: 0.6
              }}></div>
              <div className="relative">
                <DataTable
                  data={[]}
                  columns={[
                    { key: 'date', label: 'Date', sortable: true },
                    { key: 'eggs', label: 'Eggs', sortable: true },
                    { key: 'rate', label: 'Rate', sortable: true }
                  ]}
                  loading
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loading List</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <DataList
                data={[]}
                loading
                renderItem={() => <div />}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TablesTab;