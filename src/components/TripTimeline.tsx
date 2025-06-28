import { useState } from 'react';
import type { Trip, Activity, Flight, Hotel } from '../types';
import { formatDate, getDaysBetween, getActivityIcon } from '../lib/utils';

interface TripTimelineProps {
  trip: Trip;
}

// Mock data - will be replaced with Firebase data
const mockActivities: Activity[] = [
  {
    id: '1',
    tripId: '1',
    title: 'Senso-ji Temple Visit',
    category: 'tour',
    costPerPerson: 0,
    date: '2024-04-15',
    time: '09:00',
    duration: 120,
    location: 'Asakusa, Tokyo',
    status: 'booked',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    tripId: '1',
    title: 'Sushi Dinner',
    category: 'food',
    costPerPerson: 80,
    date: '2024-04-15',
    time: '19:00',
    duration: 90,
    location: 'Ginza, Tokyo',
    status: 'booked',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

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

export function TripTimeline({ trip }: TripTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

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
    return mockActivities.filter(activity => activity.date === date);
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
                              {dayActivities.length} activity{dayActivities.length > 1 ? 'ies' : 'y'}
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
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
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
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                activity.status === 'booked' 
                                  ? 'bg-green-100 text-green-700'
                                  : activity.status === 'completed'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </span>
                            </div>
                            {activity.time && (
                              <div className="text-sm text-blue-700 mb-1">
                                {activity.time} • {activity.duration} min
                              </div>
                            )}
                            {activity.location && (
                              <div className="text-sm text-blue-600">{activity.location}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 