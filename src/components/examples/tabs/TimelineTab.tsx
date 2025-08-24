import React, { useState } from 'react';
import { Timeline, TimelineItem } from '../../ui/timeline/Timeline';
import { Pagination } from '../../ui/navigation/Pagination';

const TimelineTab: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [compactPage, setCompactPage] = useState(1);
  const itemsPerPage = 3;

  // Sample timeline data
  const sampleTimelineItems: TimelineItem[] = [
    {
      id: '1',
      title: 'Morning Egg Collection',
      description: 'Collected 47 fresh eggs from the main coop',
      date: new Date('2024-08-17T08:30:00'),
      icon: '🥚',
      color: 'green',
      content: (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>🐔</span>
            <span>45 hens</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📈</span>
            <span>104% rate</span>
          </span>
        </div>
      ),
      actions: [
        {
          label: 'Edit',
          onClick: () => alert('Edit collection'),
          variant: 'secondary',
          icon: '✏️'
        },
        {
          label: 'View Details',
          onClick: () => alert('View details'),
          variant: 'primary'
        }
      ]
    },
    {
      id: '2',
      title: 'Feed Delivery',
      description: 'Received 50 lbs of organic layer feed',
      date: new Date('2024-08-16T14:15:00'),
      icon: '🌾',
      color: 'yellow',
      content: (
        <div className="text-sm text-gray-600">
          <p>Supplier: Farm Supply Co.</p>
          <p>Cost: $47.50</p>
        </div>
      ),
      actions: [
        {
          label: 'Receipt',
          onClick: () => alert('View receipt'),
          variant: 'secondary'
        }
      ]
    },
    {
      id: '3',
      title: 'Veterinary Visit',
      description: 'Dr. Smith conducted routine health check',
      date: new Date('2024-08-15T10:00:00'),
      icon: '🩺',
      color: 'blue',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Findings:</strong> All hens healthy</p>
          <p><strong>Vaccinations:</strong> Up to date</p>
          <p><strong>Next visit:</strong> November 2024</p>
        </div>
      ),
      actions: [
        {
          label: 'View Report',
          onClick: () => alert('View medical report'),
          variant: 'primary'
        }
      ]
    },
    {
      id: '4',
      title: 'Coop Maintenance',
      description: 'Cleaned and sanitized nesting boxes',
      date: new Date('2024-08-14T16:30:00'),
      icon: '🧹',
      color: 'gray',
      content: (
        <div className="text-sm text-gray-600">
          <p>Tasks completed:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Deep cleaned 12 nesting boxes</li>
            <li>Replaced bedding material</li>
            <li>Sanitized water containers</li>
          </ul>
        </div>
      )
    },
    {
      id: '5',
      title: 'New Hen Arrival',
      description: 'Added 5 new Rhode Island Red pullets',
      date: new Date('2024-08-13T09:00:00'),
      icon: '🐣',
      color: 'green',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Breed:</strong> Rhode Island Red</p>
          <p><strong>Age:</strong> 18 weeks</p>
          <p><strong>Expected laying:</strong> 2-4 weeks</p>
          <p><strong>Health status:</strong> Excellent</p>
        </div>
      ),
      actions: [
        {
          label: 'Update Records',
          onClick: () => alert('Update flock records'),
          variant: 'primary'
        }
      ]
    }
  ];

  // Status updates for pagination demo
  const statusUpdates = [
    {
      id: 'status-1',
      title: 'Daily Collection Complete',
      description: 'All eggs collected and sorted',
      date: new Date('2024-08-17T18:00:00'),
      icon: '✅',
      color: 'green' as const
    },
    {
      id: 'status-2',
      title: 'Feed Level Warning',
      description: 'Feed supply running low - order needed',
      date: new Date('2024-08-17T16:00:00'),
      icon: '⚠️',
      color: 'yellow' as const
    },
    {
      id: 'status-3',
      title: 'Temperature Alert',
      description: 'Coop temperature slightly elevated',
      date: new Date('2024-08-17T14:30:00'),
      icon: '🌡️',
      color: 'red' as const
    },
    {
      id: 'status-4',
      title: 'Customer Order',
      description: 'New order received from Sarah Johnson',
      date: new Date('2024-08-17T12:15:00'),
      icon: '📦',
      color: 'blue' as const
    },
    {
      id: 'status-5',
      title: 'Equipment Check',
      description: 'All systems functioning normally',
      date: new Date('2024-08-17T10:00:00'),
      icon: '🔧',
      color: 'gray' as const
    },
    {
      id: 'status-6',
      title: 'Morning Feeding',
      description: 'Fed all birds - 25 lbs distributed',
      date: new Date('2024-08-17T07:30:00'),
      icon: '🥄',
      color: 'green' as const
    },
    {
      id: 'status-7',
      title: 'Night Security Check',
      description: 'Coop secured for the night',
      date: new Date('2024-08-16T21:00:00'),
      icon: '🔒',
      color: 'gray' as const
    },
    {
      id: 'status-8',
      title: 'Egg Sales',
      description: 'Sold 2 dozen eggs to local market',
      date: new Date('2024-08-16T15:30:00'),
      icon: '💰',
      color: 'green' as const
    },
    {
      id: 'status-9',
      title: 'Weather Update',
      description: 'Storm warning - extra precautions taken',
      date: new Date('2024-08-16T13:00:00'),
      icon: '⛈️',
      color: 'yellow' as const
    },
    {
      id: 'status-10',
      title: 'Inventory Update',
      description: 'Updated feed and supply inventory',
      date: new Date('2024-08-16T11:45:00'),
      icon: '📊',
      color: 'blue' as const
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(statusUpdates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUpdates = statusUpdates.slice(startIndex, startIndex + itemsPerPage);

  const compactTotalPages = Math.ceil(statusUpdates.length / itemsPerPage);
  const compactStartIndex = (compactPage - 1) * itemsPerPage;
  const compactPaginatedUpdates = statusUpdates.slice(compactStartIndex, compactStartIndex + itemsPerPage);

  return (
    <div className="space-y-12 max-w-none px-8 pb-8">
      {/* Basic Timeline */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Timeline</h2>
          <p className="text-gray-600">Standard timeline with detailed entries</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Vertical Timeline</h3>
            <Timeline items={sampleTimelineItems} />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Compact Timeline</h3>
            <Timeline 
              items={sampleTimelineItems} 
              variant="compact"
            />
          </div>
        </div>
      </section>

      {/* Alternating Layout Timeline */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alternating Layout Timeline</h2>
          <p className="text-gray-600">Timeline with alternating left/right positioning</p>
        </div>
        
        <Timeline 
          items={sampleTimelineItems} 
          layout="alternating"
        />
      </section>

      {/* Timeline States */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline States</h2>
          <p className="text-gray-600">Loading and empty state examples</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Loading Timeline</h3>
            <Timeline items={[]} loading />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Empty Timeline</h3>
            <Timeline 
              items={[]} 
              emptyMessage="No activities yet - Farm activities will appear here once you start logging events."
              emptyIcon="📋"
            />
          </div>
        </div>
      </section>

      {/* Timeline with Pagination */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline with Pagination</h2>
          <p className="text-gray-600">Paginated timelines for large datasets</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Default Pagination</h3>
            <div className="space-y-6">
              <Timeline 
                items={paginatedUpdates.map(item => ({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  date: item.date,
                  icon: item.icon,
                  color: item.color
                }))}
                variant="compact"
              />
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={statusUpdates.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                onPreviousPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Compact Pagination</h3>
            <div className="space-y-6">
              <Timeline 
                items={compactPaginatedUpdates.map(item => ({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  date: item.date,
                  icon: item.icon,
                  color: item.color
                }))}
                variant="compact"
              />
              
              <Pagination
                currentPage={compactPage}
                totalPages={compactTotalPages}
                totalItems={statusUpdates.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCompactPage}
                onNextPage={() => setCompactPage(prev => Math.min(prev + 1, compactTotalPages))}
                onPreviousPage={() => setCompactPage(prev => Math.max(prev - 1, 1))}
                variant="simple"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Custom Timeline Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Custom Timeline Examples</h2>
          <p className="text-gray-600">Specialized timeline layouts for different use cases</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Simple Events</h3>
            <Timeline 
              items={[
                {
                  id: 'simple-1',
                  title: 'Eggs Collected',
                  description: '47 eggs collected this morning',
                  date: new Date(),
                  icon: '🥚',
                  color: 'green'
                },
                {
                  id: 'simple-2',
                  title: 'Feed Distributed',
                  description: '25 lbs of feed given to birds',
                  date: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  icon: '🌾',
                  color: 'yellow'
                },
                {
                  id: 'simple-3',
                  title: 'Water Refreshed',
                  description: 'All water containers cleaned and refilled',
                  date: new Date(Date.now() - 4 * 60 * 60 * 1000),
                  icon: '💧',
                  color: 'blue'
                }
              ]}
              variant="compact"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Status Updates</h3>
            <Timeline 
              items={statusUpdates.slice(0, 4).map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                date: item.date,
                icon: item.icon,
                color: item.color
              }))}
              variant="compact"
            />
          </div>
        </div>
      </section>

      {/* Full-Width Farm Activity Timeline */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Full-Width Farm Activity Timeline</h2>
          <p className="text-gray-600">Comprehensive timeline showing all farm activities</p>
        </div>
        
        <Timeline 
          items={[
            {
              id: 'full-1',
              title: 'Daily Operations Summary',
              description: 'Complete overview of today\'s farm activities and achievements',
              date: new Date('2024-08-17T18:00:00'),
              icon: '📋',
              color: 'blue',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Production</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Eggs collected: 47</li>
                      <li>• Laying rate: 104.4%</li>
                      <li>• Quality grade A: 95%</li>
                      <li>• Revenue: $23.50</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Flock Health</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Active hens: 45/50</li>
                      <li>• Health status: Excellent</li>
                      <li>• No medical issues</li>
                      <li>• Vaccinations: Current</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Resources</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Feed remaining: 87 lbs</li>
                      <li>• Water: Adequate</li>
                      <li>• Bedding: Fresh</li>
                      <li>• Equipment: All functional</li>
                    </ul>
                  </div>
                </div>
              ),
              actions: [
                {
                  label: 'Download Report',
                  onClick: () => alert('Download daily report'),
                  variant: 'primary',
                  icon: '📄'
                },
                {
                  label: 'Email Summary',
                  onClick: () => alert('Email summary'),
                  variant: 'secondary',
                  icon: '📧'
                }
              ]
            },
            {
              id: 'full-2',
              title: 'Weekly Performance Review',
              description: 'Analysis of this week\'s farm performance and key metrics',
              date: new Date('2024-08-15T17:00:00'),
              icon: '📊',
              color: 'green',
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-900">324</div>
                      <div className="text-sm text-green-700">Total Eggs</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-900">96.3%</div>
                      <div className="text-sm text-blue-700">Avg Rate</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-purple-900">$162</div>
                      <div className="text-sm text-purple-700">Revenue</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-900">$89</div>
                      <div className="text-sm text-yellow-700">Profit</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Key Achievements:</strong> Exceeded weekly target by 24 eggs, maintained 96%+ efficiency, introduced 3 new customers.</p>
                    <p><strong>Areas for Improvement:</strong> Optimize feed distribution timing, schedule equipment maintenance.</p>
                  </div>
                </div>
              ),
              actions: [
                {
                  label: 'View Analytics',
                  onClick: () => alert('View detailed analytics'),
                  variant: 'primary'
                },
                {
                  label: 'Share Report',
                  onClick: () => alert('Share weekly report'),
                  variant: 'secondary'
                }
              ]
            },
            {
              id: 'full-3',
              title: 'Monthly Planning Session',
              description: 'Strategic planning and goal setting for the upcoming month',
              date: new Date('2024-08-01T10:00:00'),
              icon: '🎯',
              color: 'purple',
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">August Goals</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Increase production by 8%</li>
                        <li>• Reduce feed costs by 5%</li>
                        <li>• Add 5 new customers</li>
                        <li>• Implement preventive maintenance</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Planned Improvements</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Install automated watering system</li>
                        <li>• Upgrade nest box lighting</li>
                        <li>• Expand marketing efforts</li>
                        <li>• Implement digital tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ),
              actions: [
                {
                  label: 'Track Progress',
                  onClick: () => alert('Track monthly progress'),
                  variant: 'primary'
                }
              ]
            }
          ]}
          variant="detailed"
        />
      </section>
    </div>
  );
};

export default TimelineTab;