import { useState } from 'react';
import type { Trip, CreateTripForm } from '../types';
import { TripTimeline } from './TripTimeline';
import { TripSummary } from './TripSummary';
import { TripActions } from './TripActions';
import { TripCreationModal } from './TripCreationModal';

interface TripViewProps {
  trip: Trip;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip: (tripId: string, updates: CreateTripForm) => Promise<void>;
}

export function TripView({ trip, onDeleteTrip, onUpdateTrip }: TripViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'summary' | 'actions'>('timeline');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          {viewMode === 'timeline' && <TripTimeline trip={trip} />}
          {viewMode === 'summary' && <TripSummary trip={trip} />}
          {viewMode === 'actions' && (
            <>
              <TripActions
                trip={trip}
                onDeleteTrip={onDeleteTrip}
                onEditTrip={() => setIsEditModalOpen(true)}
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
    </div>
  );
} 