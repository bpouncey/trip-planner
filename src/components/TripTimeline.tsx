import type { Trip, Activity, Flight, Hotel, CreateActivityForm } from '../types';
import { useState } from 'react';
import { formatDate, getDaysBetween, getActivityIcon } from '../lib/utils';
import { ActivityModal } from './ActivityModal';

interface TripTimelineProps {
  trip: Trip;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  onAddActivity: (date?: string) => void;
  onUpdateActivity: (activityId: string, activityData: CreateActivityForm) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
}

// Mock data for flights and hotels - will be replaced with Firebase data later
const mockFlights: Flight[] = [
  {
    id: '1',
    tripId: '1',
    airline: 'Japan Airlines',
    flightNumber: 'JL001',
    cabinClass: 'economy',
    departure: {
      airport: 'LAX',
      city: 'Los Angeles',
      dateTime: '2024-04-14T22:00:00Z',
    },
    arrival: {
      airport: 'NRT',
      city: 'Tokyo',
      dateTime: '2024-04-15T16:00:00Z',
    },
    pricePerPerson: {
      cash: 1200,
      taxes: 50,
    },
    paymentMethod: 'cash',
    status: 'booked',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockHotels: Hotel[] = [
  {
    id: '1',
    tripId: '1',
    name: 'Park Hyatt Tokyo',
    address: '3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo',
    bookingSite: 'Hyatt.com',
    checkInDate: '2024-04-15',
    checkOutDate: '2024-04-20',
    roomType: 'Deluxe King',
    pricePerNight: 400,
    totalCost: {
      cash: 2000,
    },
    paymentMethod: 'cash',
    status: 'booked',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export function TripTimeline({ trip, activities, loading, error, onAddActivity, onUpdateActivity, onDeleteActivity }: TripTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const duration = getDaysBetween(trip.startDate, trip.endDate);
  const days = Array.from({ length: duration }, (_, i) => {
    const date = new Date(trip.startDate);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const getDayActivities = (date: string) => {
    return activities.filter(activity => activity.date === date);
  };

  const getDayFlights = (date: string) => {
    return mockFlights.filter(flight => {
      const flightDate = new Date(flight.departure.dateTime).toISOString().split('T')[0];
      return flightDate === date;
    });
  };

  const getDayHotels = (date: string) => {
    return mockHotels.filter(hotel => {
      return hotel.checkInDate === date || hotel.checkOutDate === date;
    });
  };

  // Activity modal handlers for editing
  const openEditActivityModal = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedDate(activity.date);
    setIsActivityModalOpen(true);
  };

  const closeActivityModal = () => {
    setIsActivityModalOpen(false);
    setEditingActivity(null);
    setSelectedDate('');
  };

  const handleActivityModalSubmit = async (activityData: CreateActivityForm) => {
    if (editingActivity) {
      await onUpdateActivity(editingActivity.id, activityData);
    }
    closeActivityModal();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Timeline Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Trip Timeline
          </h2>
          <p className="text-gray-600">
            {duration} days • {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {days.map((date, index) => {
            const dayActivities = getDayActivities(date);
            const dayFlights = getDayFlights(date);
            const dayHotels = getDayHotels(date);
            const hasItems = dayActivities.length > 0 || dayFlights.length > 0 || dayHotels.length > 0;
            const isExpanded = expandedDays.has(date);

            return (
              <div key={date} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(date)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        {index < days.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {formatDate(date)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Day {index + 1} of {duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasItems && (
                        <div className="flex space-x-1">
                          {dayActivities.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                            </span>
                          )}
                          {dayFlights.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {dayFlights.length} flight{dayFlights.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {dayHotels.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              {dayHotels.length} hotel{dayHotels.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Day Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {!hasItems ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-2xl mb-2">📝</div>
                        <p>No activities planned for this day</p>
                        <button 
                          onClick={() => onAddActivity(date)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Add activity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Flights */}
                        {dayFlights.map(flight => (
                          <div key={flight.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">✈️</span>
                              <span className="font-medium text-green-800">Flight</span>
                              <span className="text-sm text-green-600">
                                {flight.airline} {flight.flightNumber}
                              </span>
                            </div>
                            <div className="text-sm text-green-700">
                              {flight.departure.airport} → {flight.arrival.airport}
                            </div>
                          </div>
                        ))}

                        {/* Hotels */}
                        {dayHotels.map(hotel => (
                          <div key={hotel.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">🏨</span>
                              <span className="font-medium text-purple-800">Hotel</span>
                              <span className="text-sm text-purple-600">
                                {hotel.checkInDate === date ? 'Check-in' : 'Check-out'}
                              </span>
                            </div>
                            <div className="text-sm text-purple-700">{hotel.name}</div>
                          </div>
                        ))}

                        {/* Activities */}
                        {dayActivities.map(activity => (
                          <div key={activity.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getActivityIcon(activity.category)}</span>
                                <span className="font-medium text-blue-800">{activity.title}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  activity.status === 'booked' 
                                    ? 'bg-green-100 text-green-700'
                                    : activity.status === 'completed'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </span>
                                <button
                                  onClick={() => openEditActivityModal(activity)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Edit activity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => onDeleteActivity(activity.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete activity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {activity.time && (
                              <div className="text-sm text-blue-700 mb-1">
                                {activity.time} • {activity.duration} min
                              </div>
                            )}
                            {activity.location && (
                              <div className="text-sm text-blue-600">{activity.location}</div>
                            )}
                            {activity.costPerPerson > 0 && (
                              <div className="text-sm text-blue-600 mt-1">
                                ${activity.costPerPerson} per person
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Activity Button */}
                        <button
                          onClick={() => onAddActivity(date)}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Activity</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Modal for editing */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        onSubmit={handleActivityModalSubmit}
        initialData={editingActivity ? {
          title: editingActivity.title,
          bookingUrl: editingActivity.bookingUrl,
          description: editingActivity.description,
          category: editingActivity.category,
          costPerPerson: editingActivity.costPerPerson,
          groupSize: editingActivity.groupSize,
          date: editingActivity.date,
          time: editingActivity.time,
          duration: editingActivity.duration,
          location: editingActivity.location,
          notes: editingActivity.notes,
        } : undefined}
        mode={editingActivity ? 'edit' : 'create'}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />
    </div>
  );
} 