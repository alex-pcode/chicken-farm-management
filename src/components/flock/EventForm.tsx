import { useState } from 'react';
import type { FlockEvent } from '../../types';
import { apiService } from '../../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../../types/api';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput, 
  TextareaInput,
  FormCard, 
  SubmitButton 
} from '../forms';
import { useFormState } from '../../hooks/useFormState';
import { useTimeoutToggle } from '../../hooks/utils';

const EVENT_TYPES = {
  acquisition: '🐣 New Birds Acquired',
  laying_start: '🥚 Started Laying',
  broody: '🐔 Went Broody',
  hatching: '🐣 Eggs Hatched',
  other: '📝 Other Event'
};

interface EventFormProps {
  profileId: string | undefined;
  onEventAdded: (event: FlockEvent) => void;
  onEventUpdated: (event: FlockEvent) => void;
  editingEvent?: FlockEvent | null;
  onCancelEdit?: () => void;
}

export const EventForm = ({
  profileId,
  onEventAdded,
  onEventUpdated,
  editingEvent,
  onCancelEdit
}: EventFormProps) => {
  const success = useTimeoutToggle(false, 3000);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Event form state management with custom hook
  const eventForm = useFormState({
    initialValues: {
      type: (editingEvent?.type || 'acquisition') as FlockEvent['type'],
      date: editingEvent?.date || new Date().toISOString().split('T')[0],
      description: editingEvent?.description || '',
      affectedBirds: editingEvent?.affectedBirds,
      notes: editingEvent?.notes || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.values.description?.trim()) {
      setError('Please provide an event description');
      return;
    }

    if (!profileId) {
      setError('Profile not loaded yet. Please wait and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const eventData = {
      date: eventForm.values.date || new Date().toISOString().split('T')[0],
      type: eventForm.values.type,
      description: eventForm.values.description.trim(),
      affectedBirds: eventForm.values.affectedBirds,
      notes: eventForm.values.notes?.trim()
    };

    try {
      if (editingEvent) {
        // Update existing event
        const result = await apiService.flock.saveFlockEvent(
          profileId, 
          { ...eventData, id: editingEvent.id }, 
          editingEvent.id
        );
        
        if (result && result.data && (result.data as any).event) {
          const dbEvent = (result.data as any).event;
          const eventForState: FlockEvent = {
            id: dbEvent.id.toString(),
            date: dbEvent.date,
            type: dbEvent.type,
            description: dbEvent.description,
            affectedBirds: dbEvent.affected_birds,
            notes: dbEvent.notes
          };
          
          onEventUpdated(eventForState);
          eventForm.resetValues();
          success.setTrue();
          onCancelEdit?.();
        } else {
          throw new Error('Failed to update event');
        }
      } else {
        // Add new event
        const event: FlockEvent = {
          id: Date.now().toString(), // Temporary ID, will be replaced by database ID
          ...eventData
        };

        const response = await apiService.flock.saveFlockEvent(profileId, event);
        
        if (response && response.data && (response.data as any).event) {
          const dbEvent = (response.data as any).event;
          const eventForState: FlockEvent = {
            id: dbEvent.id.toString(),
            date: dbEvent.date,
            type: dbEvent.type,
            description: dbEvent.description,
            affectedBirds: dbEvent.affected_birds,
            notes: dbEvent.notes
          };
          
          onEventAdded(eventForState);
          eventForm.resetValues();
          success.setTrue();
        } else {
          throw new Error('Failed to save event');
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      
      let errorMessage = `Failed to ${editingEvent ? 'update' : 'add'} event. Please try again.`;
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard
      title={editingEvent ? 'Edit Event 📝' : 'Add Event 📝'}
      success={success.value ? (editingEvent ? "Event updated successfully!" : "Event added successfully!") : undefined}
      error={error || undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SelectInput
            label="Event Type"
            value={eventForm.values.type || 'acquisition'}
            onChange={(value) => eventForm.setValue('type', value as FlockEvent['type'])}
            options={Object.entries(EVENT_TYPES).map(([value, label]) => ({ value, label }))}
            required
          />
          <DateInput
            label="Date"
            value={eventForm.values.date || ''}
            onChange={(value) => eventForm.setValue('date', value)}
            required
          />
          <NumberInput
            label="Number of Birds (optional)"
            value={eventForm.values.affectedBirds || 0}
            onChange={(value) => eventForm.setValue('affectedBirds', value || undefined)}
            min={0}
            placeholder="Enter number of birds"
          />
        </div>
        <TextInput
          label="Description"
          value={eventForm.values.description || ''}
          onChange={(value) => eventForm.setValue('description', value)}
          placeholder="Describe the event..."
          required
        />
        <TextareaInput
          label="Additional Notes"
          value={eventForm.values.notes || ''}
          onChange={(value) => eventForm.setValue('notes', value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
        <div className="flex gap-4">
          <SubmitButton
            isLoading={isLoading}
            loadingText={editingEvent ? 'Updating...' : 'Adding...'}
            text={editingEvent ? 'Update Event' : 'Add Event'}
            className="md:w-auto md:min-w-[200px]"
          />
          {editingEvent && onCancelEdit && (
            <button 
              type="button" 
              onClick={onCancelEdit}
              className="neu-button-secondary full-width md:w-auto md:min-w-[200px]"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </FormCard>
  );
};