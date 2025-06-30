import type { Trip, Activity, Flight, Hotel, CreateActivityForm } from '../types';
import { useState } from 'react';
import { formatDate, getDaysBetween, getActivityIcon, formatDateTime } from '../lib/utils';
import { ActivityModal } from './ActivityModal';

interface TripTimelineProps {
  trip: Trip;
  activities: Activity[];
  flights: Flight[];
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  onAddActivity: (date?: string) => void;
  onAddFlight: (date?: string) => void;
  onAddHotel: (date?: string) => void;
  onEditHotel: (hotel: Hotel) => void;
  onDeleteHotel: (hotelId: string) => void;
  onUpdateActivity: (activityId: string, activityData: CreateActivityForm) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
  onDeleteFlight: (flightId: string) => void;
}

export function TripTimeline({ trip, activities, flights, hotels, loading, error, onAddActivity, onAddFlight, onAddHotel, onEditHotel, onDeleteHotel, onUpdateActivity, onDeleteActivity, onDeleteFlight }: TripTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Calculate the actual trip timeline including pre-trip flights
  const calculateTripDates = () => {
    let earliestDate = new Date(trip.startDate);
    let latestDate = new Date(trip.endDate);
    
    // Check if any flights depart before the trip start date
    flights.forEach(flight => {
      const depDate = new Date(flight.departure.dateTime);
      if (depDate < earliestDate) {
        earliestDate = depDate;
      }
    });
    
    return {
      startDate: earliestDate.toISOString().split('T')[0],
      endDate: latestDate.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = calculateTripDates();
  const duration = getDaysBetween(startDate, endDate);
  const days = Array.from({ length: duration }, (_, i) => {
    const date = new Date(startDate);
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
    console.log('getDayFlights called for date:', date);
    console.log('Total flights available:', flights.length);
    console.log('Flights data:', flights);
    
    return flights.filter(flight => {
      console.log('Processing flight:', flight);
      
      if (Array.isArray(flight.segments) && flight.segments.length > 0) {
        console.log('Flight has segments:', flight.segments);
        // If any segment departs or arrives on this day, include the flight
        return flight.segments.some(seg => {
          console.log('Processing segment:', seg);
          try {
            // Handle both date-only strings and full datetime strings
            let depDate: string;
            let arrDate: string;
            
            if (seg.departure.dateTime) {
              if (seg.departure.dateTime.includes('T')) {
                // Full datetime string
                depDate = new Date(seg.departure.dateTime).toISOString().split('T')[0];
              } else {
                // Date-only string, validate it's a proper date
                const dateObj = new Date(seg.departure.dateTime + 'T00:00:00');
                if (isNaN(dateObj.getTime())) {
                  console.warn('Invalid departure date:', seg.departure.dateTime);
                  return false;
                }
                depDate = seg.departure.dateTime;
              }
            } else {
              console.log('No departure dateTime for segment');
              return false;
            }
            
            if (seg.arrival.dateTime) {
              if (seg.arrival.dateTime.includes('T')) {
                // Full datetime string
                arrDate = new Date(seg.arrival.dateTime).toISOString().split('T')[0];
              } else {
                // Date-only string, validate it's a proper date
                const dateObj = new Date(seg.arrival.dateTime + 'T00:00:00');
                if (isNaN(dateObj.getTime())) {
                  console.warn('Invalid arrival date:', seg.arrival.dateTime);
                  return false;
                }
                arrDate = seg.arrival.dateTime;
              }
            } else {
              console.log('No arrival dateTime for segment');
              return false;
            }
            
            console.log('Segment dates - depDate:', depDate, 'arrDate:', arrDate, 'target date:', date);
            const matches = depDate === date || arrDate === date;
            console.log('Segment matches date:', matches);
            return matches;
          } catch (error) {
            console.error('Error processing segment dates:', error, seg);
            return false;
          }
        });
      } else {
        console.log('Flight has no segments, using main flight data');
        // Fallback for single-segment flights
        try {
          let depDate: string;
          let arrDate: string;
          
          if (flight.departure.dateTime) {
            if (flight.departure.dateTime.includes('T')) {
              // Full datetime string
              depDate = new Date(flight.departure.dateTime).toISOString().split('T')[0];
            } else {
              // Date-only string, validate it's a proper date
              const dateObj = new Date(flight.departure.dateTime + 'T00:00:00');
              if (isNaN(dateObj.getTime())) {
                console.warn('Invalid departure date:', flight.departure.dateTime);
                return false;
              }
              depDate = flight.departure.dateTime;
            }
          } else {
            console.log('No departure dateTime for flight');
            return false;
          }
          
          if (flight.arrival.dateTime) {
            if (flight.arrival.dateTime.includes('T')) {
              // Full datetime string
              arrDate = new Date(flight.arrival.dateTime).toISOString().split('T')[0];
            } else {
              // Date-only string, validate it's a proper date
              const dateObj = new Date(flight.arrival.dateTime + 'T00:00:00');
              if (isNaN(dateObj.getTime())) {
                console.warn('Invalid arrival date:', flight.arrival.dateTime);
                return false;
              }
              arrDate = flight.arrival.dateTime;
            }
          } else {
            console.log('No arrival dateTime for flight');
            return false;
          }
          
          console.log('Flight dates - depDate:', depDate, 'arrDate:', arrDate, 'target date:', date);
          const matches = depDate === date || arrDate === date;
          console.log('Flight matches date:', matches);
          return matches;
        } catch (error) {
          console.error('Error processing flight dates:', error, flight);
          return false;
        }
      }
    });
  };

  const getDayHotels = (date: string) => {
    return hotels.filter(hotel => {
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
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            onClick={() => onAddActivity(date)}
                            className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Activity</span>
                          </button>
                          <button
                            onClick={() => onAddFlight(date)}
                            className="flex-1 p-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Flight</span>
                          </button>
                          <button
                            onClick={() => onAddHotel(date)}
                            className="flex-1 p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:text-purple-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Hotel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Flights */}
                        {dayFlights.map(flight => {
                          const points = flight.pricePerPerson?.points;
                          const isPoints = !!points;
                          const totalCash = flight.pricePerPerson?.cash * trip.travelers;
                          const totalPoints = (points || 0) * trip.travelers;
                          const taxes = flight.pricePerPerson?.taxes;
                          const hasSegments = Array.isArray(flight.segments) && flight.segments.length > 0;
                          return (
                            <div key={flight.id} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-lg">✈️</span>
                                  <span className="font-medium text-green-800">Flight</span>
                                  <span className="text-sm text-green-600">
                                    {flight.airline} {flight.flightNumber?.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-green-500 font-semibold uppercase">
                                    {flight.cabinClass?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                  </span>
                                </div>
                                {/* Multi-segment display */}
                                {hasSegments ? (
                                  <div className="mb-1">
                                    {flight.segments!
                                      .filter(seg => {
                                        const depDate = seg.departure.dateTime.split('T')[0];
                                        const arrDate = seg.arrival.dateTime.split('T')[0];
                                        console.log('[Timeline Debug] Segment:', seg, 'Day:', date, 'Dep:', depDate, 'Arr:', arrDate);
                                        return depDate === date || arrDate === date;
                                      })
                                      .map((seg, idx) => (
                                        <div key={idx}>
                                          <div className="flex items-center text-sm text-green-700">
                                            <span className="font-semibold">{seg.departure.airport}</span>
                                            <span className="mx-1">→</span>
                                            <span className="font-semibold">{seg.arrival.airport}</span>
                                            <span className="ml-2 text-xs text-green-500">{seg.departure.city} {formatDateTime(seg.departure.dateTime)} - {seg.arrival.city} {formatDateTime(seg.arrival.dateTime)}</span>
                                            {/* Optionally show aircraft type if available on segment or flight */}
                                            {flight.planeType && (
                                              <span className="ml-2 text-xs text-green-600 bg-green-100 px-1 rounded">✈️ {flight.planeType}</span>
                                            )}
                                          </div>
                                          {/* Show layover info between segments if needed (optional) */}
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-green-700 mb-1">
                                    {flight.departure.airport} → {flight.arrival.airport}
                                    {flight.planeType && (
                                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-1 rounded">✈️ {flight.planeType}</span>
                                    )}
                                  </div>
                                )}
                                {/* Cost display */}
                                <div className="mb-1">
                                  {isPoints ? (
                                    <>
                                      <span className="font-bold text-green-900">
                                        {typeof totalPoints === 'number' && !isNaN(totalPoints) ? `${totalPoints.toLocaleString()} pts` : 'N/A'}
                                        {typeof taxes === 'number' && taxes > 0 && !isNaN(taxes) && (
                                          <span> + ${taxes * trip.travelers} taxes</span>
                                        )}
                                      </span>
                                      <div className="text-xs text-green-700">
                                        {typeof points === 'number' && !isNaN(points) ? `${points.toLocaleString()} pts per person` : 'N/A'}
                                        {typeof taxes === 'number' && taxes > 0 && !isNaN(taxes) && (
                                          <span> + ${taxes} taxes</span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold text-green-900">
                                        {typeof totalCash === 'number' && !isNaN(totalCash) ? `$${totalCash.toLocaleString()}` : 'N/A'}
                                      </span>
                                      <div className="text-xs text-green-700">
                                        {typeof flight.pricePerPerson?.cash === 'number' && !isNaN(flight.pricePerPerson.cash)
                                          ? `$${flight.pricePerPerson.cash.toLocaleString()} per person`
                                          : 'N/A'}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => onDeleteFlight(flight.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors flex items-center"
                                title="Delete flight"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}

                        {/* Hotels */}
                        {dayHotels.map(hotel => (
                          <div key={hotel.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🏨</span>
                                <span className="font-medium text-purple-800">Hotel</span>
                                <span className="text-sm text-purple-600">
                                  {hotel.checkInDate === date ? 'Check-in' : 'Check-out'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onEditHotel(hotel)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Edit hotel"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => onDeleteHotel(hotel.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete hotel"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-purple-700">{hotel.name}</div>
                            {typeof hotel.pricePerNight === 'number' && hotel.pricePerNight > 0 && (
                              <div className="text-xs text-purple-600 mt-1">${hotel.pricePerNight} per night</div>
                            )}
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

                        {/* Add Activity, Flight, Hotel Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            onClick={() => onAddActivity(date)}
                            className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Activity</span>
                          </button>
                          <button
                            onClick={() => onAddFlight(date)}
                            className="flex-1 p-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Flight</span>
                          </button>
                          <button
                            onClick={() => onAddHotel(date)}
                            className="flex-1 p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:text-purple-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Hotel</span>
                          </button>
                        </div>
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