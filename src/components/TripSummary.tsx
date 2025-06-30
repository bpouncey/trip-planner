import type { Trip, Activity, Flight, Hotel } from '../types';
import { calculateTripSummary, formatCurrency, formatPoints, calculatePTODays } from '../lib/utils';
import FlightModal from './FlightModal';
import { useState } from 'react';
import { createFlight } from '../lib/tripService';
import type { CreateFlightForm } from '../types';

interface TripSummaryProps {
  trip: Trip;
  activities: Activity[];
  flights: Flight[];
  hotels: Hotel[];
  onAddFlight?: (flightData: CreateFlightForm) => Promise<void>;
  onAddHotel?: () => void;
}

export function TripSummary({ trip, activities, flights, hotels, onAddFlight, onAddHotel }: TripSummaryProps) {
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isAddingFlight, setIsAddingFlight] = useState(false);

  // Calculate summary using real data
  const summary = calculateTripSummary(trip, activities, flights, hotels);
  const ptoDays = calculatePTODays(trip.startDate, trip.endDate);

  const handleAddFlight = () => {
    setIsFlightModalOpen(true);
  };

  const handleFlightSubmit = async (flightData: CreateFlightForm) => {
    setIsAddingFlight(true);
    try {
      await createFlight(trip.id, flightData);
      setIsFlightModalOpen(false);
      // Notify parent component if callback provided
      if (onAddFlight) {
        await onAddFlight(flightData);
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      // You could add a toast notification here
    } finally {
      setIsAddingFlight(false);
    }
  };

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
                  {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} • {formatPoints(summary.totalPointsUsed)} points used (all travelers)
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

              {/* Cost per Person and Points per Person */}
              <div className="pt-3 border-t border-gray-200 space-y-1">
                {summary.totalCashCost / trip.travelers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Cost per Person</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(summary.totalCashCost / trip.travelers)}</span>
                  </div>
                )}
                {summary.totalPointsUsed / trip.travelers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Points per Person</span>
                    <span className="text-lg font-semibold text-green-700">{formatPoints(summary.totalPointsUsed / trip.travelers)} pts</span>
                  </div>
                )}
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
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <span className="text-xl">+</span>
                <span>Add Activity</span>
              </button>
              <button 
                className="w-full btn-secondary flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors" 
                onClick={handleAddFlight}
                disabled={isAddingFlight}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{isAddingFlight ? 'Adding...' : 'Add Flight'}</span>
              </button>
              <button 
                className="w-full btn-secondary flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors" 
                onClick={onAddHotel}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Add Hotel</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center gap-2 cursor-not-allowed opacity-60" disabled>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Modal */}
      <FlightModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        onSubmit={handleFlightSubmit}
        tripId={trip.id}
      />
    </div>
  );
} 