import type { Trip } from '../types';
import { calculateTripSummary, formatCurrency, formatPoints, calculatePTODays } from '../lib/utils';

interface TripSummaryProps {
  trip: Trip;
}

// Mock data - will be replaced with Firebase data
const mockActivities = [
  { tripId: '1', costPerPerson: 80 },
  { tripId: '1', costPerPerson: 120 },
  { tripId: '1', costPerPerson: 0 },
];

const mockFlights = [
  {
    tripId: '1',
    pricePerPerson: { cash: 1200, points: 50000, taxes: 50 },
    paymentMethod: 'hybrid' as const,
  },
];

const mockHotels = [
  {
    tripId: '1',
    totalCost: { cash: 2000, points: 25000 },
    paymentMethod: 'hybrid' as const,
  },
];

export function TripSummary({ trip }: TripSummaryProps) {
  // Calculate summary using mock data
  const summary = calculateTripSummary(trip, mockActivities as any, mockFlights as any, mockHotels as any);
  const ptoDays = calculatePTODays(trip.startDate, trip.endDate);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Trip Summary
          </h2>
          <p className="text-gray-600">
            Overview of costs, timeline, and planning details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            
            <div className="space-y-4">
              {/* Total Cost */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Total Trip Cost</span>
                  <span className="text-2xl font-bold text-blue-900">
                    {formatCurrency(summary.totalCashCost)}
                  </span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} • {formatPoints(summary.totalPointsUsed)} points used
                </div>
              </div>

              {/* Cost Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✈️</span>
                    <span className="text-sm font-medium text-gray-700">Flights</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.costBreakdown.flights)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏨</span>
                    <span className="text-sm font-medium text-gray-700">Hotels</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.costBreakdown.hotels)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎫</span>
                    <span className="text-sm font-medium text-gray-700">Activities</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.costBreakdown.activities)}
                  </span>
                </div>
              </div>

              {/* Cost per Person */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cost per Person</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(summary.totalCashCost / trip.travelers)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
            
            <div className="space-y-4">
              {/* Duration */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Duration</span>
                <span className="text-sm font-semibold text-gray-900">
                  {summary.duration} days
                </span>
              </div>

              {/* PTO Required */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">PTO Days Required</span>
                <span className="text-sm font-semibold text-gray-900">
                  {ptoDays} days
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
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

              {/* Destination */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Destination</span>
                <span className="text-sm font-semibold text-gray-900">
                  {trip.destination}
                </span>
              </div>

              {/* Travelers */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Travelers</span>
                <span className="text-sm font-semibold text-gray-900">
                  {trip.travelers} {trip.travelers > 1 ? 'people' : 'person'}
                </span>
              </div>
            </div>
          </div>

          {/* Points Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Points & Rewards</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Total Points Used</span>
                  <span className="text-xl font-bold text-green-900">
                    {formatPoints(summary.totalPointsUsed)}
                  </span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Estimated value: {formatCurrency(summary.totalPointsUsed * 0.014)}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Points value calculated at 1.4 cents per point</p>
                <p>• You can adjust this rate in settings</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Activity
              </button>
              
              <button className="w-full btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Trip
              </button>
              
              <button className="w-full btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 