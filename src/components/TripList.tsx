import { useState } from 'react';
import type { Trip } from '../types';
import { formatDate, getDaysBetween } from '../lib/utils';

interface TripListProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  sidebarOpen: boolean;
  onNewTrip: () => void;
  isLoading: boolean;
  error: string | null;
}

export function TripList({ 
  trips, 
  selectedTrip, 
  onSelectTrip, 
  sidebarOpen, 
  onNewTrip, 
  isLoading, 
  error 
}: TripListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'booked' | 'archived'>('all');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!sidebarOpen) {
    return (
      <div className="flex-1 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onNewTrip}
          className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <div className="text-red-500 text-sm">⚠️</div>
          </div>
        ) : (
          filteredTrips.map(trip => (
            <button
              key={trip.id}
              onClick={() => onSelectTrip(trip)}
              className={`p-3 rounded-lg transition-colors ${
                selectedTrip?.id === trip.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={trip.name}
            >
              <div className="text-2xl">✈️</div>
            </button>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex space-x-1">
          {(['all', 'planning', 'booked', 'archived'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <button
            onClick={onNewTrip}
            className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Trip</span>
            </div>
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-500 text-sm mb-2">Failed to load trips</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-blue-600 text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {filteredTrips.map(trip => {
                  const duration = getDaysBetween(trip.startDate, trip.endDate);
                  return (
                    <button
                      key={trip.id}
                      onClick={() => onSelectTrip(trip)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedTrip?.id === trip.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{trip.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trip.status === 'planning' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : trip.status === 'booked'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{trip.destination}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)} • {duration} days
                      </p>
                    </button>
                  );
                })}
              </div>

              {filteredTrips.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✈️</div>
                  <p className="text-gray-500 text-sm">
                    {searchTerm || statusFilter !== 'all' ? 'No trips found' : 'No trips yet'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 