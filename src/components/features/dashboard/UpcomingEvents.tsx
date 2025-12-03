import { useMemo, useState } from 'react';
import { DataList } from '../../ui/tables/DataList';
import { AppData } from '../../../types';

interface UpcomingEventsProps {
  data: AppData | null;
  isLoading: boolean;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: string;
  bgColor: string;
  textColor: string;
  priority: number;
  daysUntil: number;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ data, isLoading }) => {
  // Calculate dynamic upcoming events
  const upcomingEvents = useMemo(() => {
    if (isLoading || !data) return [];

    const events: EventItem[] = [];
    const today = new Date();
    const INCUBATION_PERIOD = 21; // days

    // Check for brooding hen events (hatching predictions)
    if (data.flockEvents) {
      const broodingEvents = data.flockEvents.filter(event => event.type === 'broody');
      broodingEvents.forEach((event) => {
        const broodingStartDate = new Date(event.date);
        const expectedHatchDate = new Date(broodingStartDate);
        expectedHatchDate.setDate(broodingStartDate.getDate() + INCUBATION_PERIOD);
        
        const daysUntilHatch = Math.ceil((expectedHatchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only show if hatching is within next 30 days and hasn't passed
        if (daysUntilHatch > -3 && daysUntilHatch <= 30) {
          const broodingCount = event.affectedBirds || 1;
          events.push({
            id: `brooding-${event.id}`,
            title: 'Baby Chickens Expected',
            description: daysUntilHatch > 0 ? `${daysUntilHatch} days remaining` : 
                        daysUntilHatch === 0 ? 'Due today!' : 
                        `${Math.abs(daysUntilHatch)} days overdue`,
            detail: `${broodingCount} brooding hen${broodingCount > 1 ? 's' : ''}`,
            icon: daysUntilHatch <= 3 ? '🐣' : '🥚',
            bgColor: 'rgba(79, 70, 229, 0.2)',
            textColor: '#4F46E5',
            priority: daysUntilHatch <= 3 ? 1 : 2,
            daysUntil: daysUntilHatch
          });
        }
      });
    }

    // Check batch events for brooding
    if (data.flockBatches) {
      // Look for current brooding count in batches
      const totalBroodingHens = data.flockBatches.reduce((sum, batch) => sum + (batch.broodingCount || 0), 0);
      
      // If we have brooding hens but no events, create a generic event
      if (totalBroodingHens > 0 && events.length === 0) {
        events.push({
          id: 'generic-brooding',
          title: 'Baby Chickens Expected',
          description: '~10-15 days remaining',
          detail: `${totalBroodingHens} brooding hen${totalBroodingHens > 1 ? 's' : ''}`,
          icon: '🐣',
          bgColor: 'rgba(79, 70, 229, 0.2)',
          textColor: '#4F46E5',
          priority: 2,
          daysUntil: 12
        });
      }
    }

    // Feed restock reminder (check feed inventory)
    if (data.feedInventory && data.feedInventory.length > 0) {
      const activeFeed = data.feedInventory.filter(feed => !feed.depletedDate);
      if (activeFeed.length === 0) {
        events.push({
          id: 'feed-restock',
          title: 'Feed Restock Needed',
          description: 'No active feed inventory',
          detail: 'All feed depleted',
          icon: '🌾',
          bgColor: 'rgba(107, 92, 230, 0.2)',
          textColor: '#6B5CE6',
          priority: 1,
          daysUntil: 0
        });
      } else {
        // Check for low feed stock (opened more than 30 days ago)
        const oldFeed = activeFeed.filter(feed => {
          const openedDate = new Date(feed.openedDate);
          const daysSinceOpened = Math.ceil((today.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceOpened > 30;
        });
        
        if (oldFeed.length > 0) {
          events.push({
            id: 'feed-check',
            title: 'Check Feed Quality',
            description: 'Feed opened >30 days ago',
            detail: `${oldFeed.length} feed bag${oldFeed.length > 1 ? 's' : ''} to check`,
            icon: '🌾',
            bgColor: 'rgba(107, 92, 230, 0.2)',
            textColor: '#6B5CE6',
            priority: 2,
            daysUntil: 0
          });
        }
      }
    }

    // Vaccination reminder (every 6 months for adult birds)
    if (data.flockBatches) {
      const adultBatches = data.flockBatches.filter(batch => 
        batch.isActive && batch.ageAtAcquisition === 'adult'
      );
      
      adultBatches.forEach(batch => {
        const acquisitionDate = new Date(batch.acquisitionDate);
        const monthsSinceAcquisition = Math.floor((today.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        // Suggest vaccination every 6 months
        const monthsSinceLastVaccination = monthsSinceAcquisition % 6;
        if (monthsSinceLastVaccination === 5) { // Due next month
          events.push({
            id: `vaccination-${batch.id}`,
            title: 'Vaccination Due Soon',
            description: 'Next month',
            detail: `${batch.batchName || batch.breed} batch`,
            icon: '💉',
            bgColor: 'rgba(42, 37, 128, 0.2)',
            textColor: '#2A2580',
            priority: 2,
            daysUntil: 30
          });
        }
      });
    }

    // Coop cleaning reminder (weekly)
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    const daysSinceLastSunday = Math.ceil((today.getTime() - lastSunday.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSunday >= 6) {
      events.push({
        id: 'coop-cleaning',
        title: 'Coop Cleaning',
        description: daysSinceLastSunday === 7 ? 'Due today' : 'Overdue',
        detail: 'Weekly maintenance',
        icon: '🧽',
        bgColor: 'rgba(136, 51, 215, 0.2)',
        textColor: '#8833D7',
        priority: daysSinceLastSunday > 7 ? 1 : 2,
        daysUntil: daysSinceLastSunday - 7
      });
    }

    // If no events, show helpful reminders
    if (events.length === 0) {
      events.push({
        id: 'general-reminder',
        title: 'All Good!',
        description: 'No urgent tasks',
        detail: 'Keep monitoring your flock',
        icon: '✅',
        bgColor: 'rgba(79, 70, 229, 0.1)',
        textColor: '#4F46E5',
        priority: 3,
        daysUntil: 999
      });
    }

    // Sort events by priority (1 = urgent, 2 = normal, 3 = info) and days until
    return events.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.daysUntil - b.daysUntil;
    });
  }, [data, isLoading]);

  // Pagination state for events
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(upcomingEvents.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedEvents = upcomingEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          <p className="text-sm text-gray-500">Important dates and milestones</p>
        </div>
        <div className="p-4">
          <DataList
            data={paginatedEvents}
            variant="compact"
            loading={isLoading}
            renderItem={(event) => (
              <div 
                className="flex items-start gap-3 p-3 rounded-lg border-0"
                style={{ backgroundColor: event.bgColor }}
              >
                <span className="text-xl" role="img" aria-label={event.title}>{event.icon}</span>
                <div>
                  <h4 className="font-medium" style={{ color: event.textColor }}>{event.title}</h4>
                  <p className="text-sm opacity-90" style={{ color: event.textColor }}>{event.description}</p>
                  <p className="text-xs opacity-75 mt-1" style={{ color: event.textColor }}>{event.detail}</p>
                </div>
              </div>
            )}
            emptyMessage="No upcoming events"
            emptyIcon="📅"
            emptyTitle="No Events Scheduled"
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};