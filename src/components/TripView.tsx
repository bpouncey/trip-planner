import { useState, useEffect } from 'react';
import type { Trip, CreateTripForm, CreateActivityForm, Activity } from '../types';
import { TripTimeline } from './TripTimeline';
import { TripSummary } from './TripSummary';
import { TripActions } from './TripActions';
import { TripCreationModal } from './TripCreationModal';
import { ActivityModal } from './ActivityModal';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../lib/tripService';

interface TripViewProps {
  trip: Trip;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip: (tripId: string, updates: CreateTripForm) => Promise<void>;
}

export function TripView({ trip, onDeleteTrip, onUpdateTrip }: TripViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'summary' | 'actions'>('timeline');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Activities state and CRUD logic
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const tripActivities = await getActivities(trip.id);
        setActivities(tripActivities);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
        setError(errorMessage);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [trip.id]);

  const handleCreateActivity = async (activityData: CreateActivityForm) => {
    try {
      const newActivity = await createActivity(trip.id, activityData);
      setActivities(prev => [...prev, newActivity]);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateActivity = async (activityId: string, activityData: CreateActivityForm) => {
    try {
      await updateActivity(trip.id, activityId, activityData);
      setActivities(prev => prev.map(activity =>
        activity.id === activityId ? { ...activity, ...activityData } : activity
      ));
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(trip.id, activityId);
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (err) {
      throw err;
    }
  };

  // Activity modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityInitialData, setActivityInitialData] = useState<CreateActivityForm | undefined>(undefined);
  const [activityMode, setActivityMode] = useState<'create' | 'edit'>('create');

  // Handler to open the activity modal (optionally with a date)
  const handleAddActivity = (date?: string) => {
    setActivityInitialData({
      title: '',
      bookingUrl: '',
      description: '',
      category: 'explore',
      costPerPerson: 0,
      groupSize: undefined,
      date: date || '',
      time: '',
      duration: undefined,
      location: '',
      notes: ''
    });
    setActivityMode('create');
    setIsActivityModalOpen(true);
  };

  // Handler to close the activity modal
  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    setActivityInitialData(undefined);
    setActivityMode('create');
  };

  // Handler for ActivityModal submit
  const handleActivityModalSubmit = async (activityData: CreateActivityForm) => {
    await handleCreateActivity(activityData);
    handleCloseActivityModal();
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* View Mode Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex space-x-1">
              {[
                { id: 'timeline', label: 'Timeline', icon: '📅' },
                { id: 'summary', label: 'Summary', icon: '📊' },
                { id: 'actions', label: 'Actions', icon: '⚡' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as typeof viewMode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'timeline' && (
            <TripTimeline
              trip={trip}
              activities={activities}
              loading={loading}
              error={error}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          )}
          {viewMode === 'summary' && <TripSummary trip={trip} />}
          {viewMode === 'actions' && (
            <>
              <TripActions
                trip={trip}
                onDeleteTrip={onDeleteTrip}
                onEditTrip={() => setIsEditModalOpen(true)}
                onAddActivity={handleAddActivity}
              />
              <TripCreationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={async (updates) => {
                  await onUpdateTrip(trip.id, updates);
                  setIsEditModalOpen(false);
                }}
                initialData={{
                  name: trip.name,
                  destination: trip.destination,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  travelers: trip.travelers,
                  notes: trip.notes,
                }}
                mode="edit"
              />
            </>
          )}
        </div>
      </div>
      {/* Activity Modal (global for this trip) */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        onSubmit={handleActivityModalSubmit}
        initialData={activityInitialData}
        mode={activityMode}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />
    </div>
  );
} 