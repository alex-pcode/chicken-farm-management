import { motion } from 'framer-motion';
import { memo } from 'react';
import type { FlockEvent } from '../../../types';
import { apiService } from '../../../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../../../types/api';
import { SectionContainer, EmptyState } from '../../ui';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

const EVENT_TYPES = {
  acquisition: '🐣 New Birds Acquired',
  laying_start: '🥚 Started Laying',
  broody: '🐔 Went Broody',
  hatching: '🐣 Eggs Hatched',
  other: '📝 Other Event'
};

interface EventTimelineProps extends BaseUIComponentProps {
  events: FlockEvent[];
  onEditEvent: (event: FlockEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isLoading: boolean;
}

export const EventTimeline = memo(({
  events,
  onEditEvent,
  onDeleteEvent,
  isLoading,
  className = '',
  testId
}: EventTimelineProps) => {
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiService.flock.deleteFlockEvent(eventId);
      onDeleteEvent(eventId);
    } catch (error) {
      console.error('Error removing event:', error);
      
      let errorMessage = 'Failed to remove event. Please try again.';
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      // TODO: Pass error state up to parent for user feedback
      // For now, at least provide console feedback with user-friendly message
      console.warn('User-friendly error:', errorMessage);
    }
  };

  if (events.length === 0) {
    return (
      <SectionContainer
        title="📅 Events Timeline"
        variant="glass"
        className={className}
        testId={testId}
      >
        <EmptyState
          icon="📅"
          title="No events recorded yet"
          message="Add your first event above to start tracking your flock's timeline!"
          testId="events-empty-state"
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer
      title="📅 Events Timeline"
      variant="glass"
      className={className}
      testId={testId}
    >
      <div className="relative">
        {/* Main timeline line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
        
        {/* Events */}
        <div className="space-y-12">
          {[...events].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ).map((event, index) => {
            const eventIcon = event.type === 'acquisition' ? '🐣' :
                             event.type === 'laying_start' ? '🥚' :
                             event.type === 'broody' ? '🐔' :
                             event.type === 'hatching' ? '🐣' : '📝';
            
            const eventColor = event.type === 'acquisition' ? 'bg-green-500' :
                              event.type === 'laying_start' ? 'bg-yellow-500' :
                              event.type === 'broody' ? 'bg-orange-500' :
                              event.type === 'hatching' ? 'bg-blue-500' : 'bg-purple-500';
            
            const isEven = index % 2 === 0;
            
            return (
              <div key={event.id} className="relative">
                {/* Desktop layout */}
                <div className={`hidden md:flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Content side */}
                  <div className={`w-[calc(50%-2rem)] ${isEven ? 'text-right' : 'text-left'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-lg shadow-md p-6 relative"
                    >
                      {/* Date badge */}
                      <div className={`flex gap-2 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                          {EVENT_TYPES[event.type].replace(/^[^a-zA-Z]*/, '')}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {event.description}
                      </h4>

                      {event.affectedBirds && (
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full ${isEven ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-base">🐔</span>
                            <span className="font-medium text-gray-600">{event.affectedBirds} birds affected</span>
                          </span>
                        </div>
                      )}

                      {event.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                          <p className="text-sm text-gray-600 italic">{event.notes}</p>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteEvent(event.id)}
                        className={`absolute ${isEven ? '-left-2 translate-x-full' : '-right-2 -translate-x-full'} top-0 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-sm`}
                        disabled={isLoading}
                        title="Remove event"
                      >
                        ×
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditEvent(event)}
                        className={`absolute ${isEven ? '-left-2 translate-x-full' : '-right-2 -translate-x-full'} top-8 w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-sm`}
                        disabled={isLoading}
                        title="Edit event"
                      >
                        ✎
                      </motion.button>

                      <div className={`absolute top-1/2 ${isEven ? '-right-8' : '-left-8'} transform -translate-y-1/2 w-8 h-0.5 ${eventColor}`}></div>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full bg-white border-4 ${eventColor.replace('bg-', 'border-')} relative z-10`}>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
                        {eventIcon}
                      </span>
                    </div>
                  </div>

                  {/* Empty side */}
                  <div className="w-[calc(50%-2rem)]"></div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden bg-white rounded-lg shadow-sm p-4 relative">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-8 h-8 ${eventColor} rounded-full flex items-center justify-center`}>
                      <span className="text-sm text-white">{eventIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {EVENT_TYPES[event.type].replace(/^[^a-zA-Z]*/, '')}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-2">{event.description}</h4>
                      {event.affectedBirds && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full">
                            <span>🐔</span>
                            <span className="font-medium text-gray-600">{event.affectedBirds} birds</span>
                          </span>
                        </div>
                      )}
                      {event.notes && (
                        <p className="text-xs text-gray-600 italic">{event.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditEvent(event)}
                        className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-sm"
                        disabled={isLoading}
                        title="Edit event"
                      >
                        ✎
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteEvent(event.id)}
                        className="shrink-0 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-sm"
                        disabled={isLoading}
                        title="Remove event"
                      >
                        ×
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
});