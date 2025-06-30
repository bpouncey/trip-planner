import React, { useState, useEffect } from 'react';
import type { Flight, CreateFlightForm, CabinClass, PaymentMethod, FlightStatus, FlightSegment } from '../types';
import { getAirlineInfo, getAirportInfo } from '../lib/lookupUtils';
import airports from '../data/airports.json';

interface FlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (flightData: CreateFlightForm) => void;
  flight?: Flight; // For editing mode
  tripId: string;
}

// Utility: Format Amadeus datetime string for <input type="datetime-local">
function toDatetimeLocal(value: string) {
  if (!value) return '';
  // Remove timezone and seconds if present (e.g., 2025-07-08T17:30-04:00 -> 2025-07-08T17:30)
  // Handles both with and without seconds
  const match = value.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2})/);
  return match ? match[1] : value.slice(0, 16);
}

function toDateOnly(value: string) {
  if (!value) return '';
  // Extract only the date part (e.g., 2025-07-08T17:30-04:00 -> 2025-07-08)
  const match = value.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  return match ? match[1] : value.split('T')[0];
}

// Flight Selection Modal Component
function FlightSelectionModal({ 
  isOpen, 
  flights, 
  onSelect, 
  onClose 
}: { 
  isOpen: boolean; 
  flights: any[]; 
  onSelect: (flight: any) => void; 
  onClose: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Multiple Flights Found</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Flight List */}
        <div className="space-y-3">
          <p className="text-gray-600 mb-4">
            Multiple flights found for this flight number on the selected date. Please choose the correct one:
          </p>
          
          {flights.map((flight, index) => {
            const flightDesignator = flight.flightDesignator;
            const flightPoints = flight.flightPoints;
            const legs = flight.legs;
            
            if (!flightPoints || flightPoints.length < 2 || !legs || legs.length === 0) {
              return null;
            }

            const departurePoint = flightPoints[0];
            const arrivalPoint = flightPoints[flightPoints.length - 1];
            const firstLeg = legs[0];

            // Extract departure/arrival times
            let departureTime = '';
            let arrivalTime = '';
            if (departurePoint.departure?.timings) {
              const depTiming = departurePoint.departure.timings.find((t: any) => 
                t.qualifier === 'STD' || t.qualifier === 'ETD' || t.qualifier === 'SCH'
              );
              departureTime = depTiming?.value || departurePoint.departure.timings[0]?.value || '';
            }
            if (arrivalPoint.arrival?.timings) {
              const arrTiming = arrivalPoint.arrival.timings.find((t: any) => 
                t.qualifier === 'STA' || t.qualifier === 'ETA' || t.qualifier === 'SCH'
              );
              arrivalTime = arrTiming?.value || arrivalPoint.arrival.timings[0]?.value || '';
            }

            // Format times
            const formatTime = (timeStr: string) => {
              if (!timeStr) return '';
              const match = timeStr.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2})/);
              if (match) {
                const date = new Date(match[1]);
                return date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                });
              }
              return timeStr;
            };

            const departureAirport = departurePoint.iataCode || '';
            const arrivalAirport = arrivalPoint.iataCode || '';
            const airline = flightDesignator?.carrierCode || '';

            return (
              <div
                key={index}
                onClick={() => onSelect(flight)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-lg font-semibold text-gray-900">
                        {airline} {flightDesignator?.number || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {firstLeg.aircraft?.iataCode || ''}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-900">
                          {formatTime(departureTime)}
                        </div>
                        <div className="text-sm text-gray-600">{departureAirport}</div>
                      </div>
                      
                      <div className="flex-1 flex items-center">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <div className="mx-2 text-xs text-gray-400">→</div>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-900">
                          {formatTime(arrivalTime)}
                        </div>
                        <div className="text-sm text-gray-600">{arrivalAirport}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlightModal({ isOpen, onClose, onSubmit, flight, tripId }: FlightModalProps) {
  const [formData, setFormData] = useState<Omit<CreateFlightForm, 'pricePerPerson'> & { pricePerPersonCash: number; pricePerPersonPoints: number; taxes: number; }>(
    {
      airline: '',
      flightNumber: '',
      cabinClass: 'economy',
      departureAirport: '',
      departureCity: '',
      departureDateTime: '',
      arrivalAirport: '',
      arrivalCity: '',
      arrivalDateTime: '',
      paymentMethod: 'cash',
      points: 0,
      confirmationNumber: '',
      airlineLogo: '',
      pricePerPersonCash: 0,
      pricePerPersonPoints: 0,
      taxes: 0,
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [flightOptions, setFlightOptions] = useState<any[]>([]);
  const [showFlightSelect, setShowFlightSelect] = useState(false);
  const [segments, setSegments] = useState<FlightSegment[]>([]);

  // Reset form when modal opens/closes or flight prop changes
  useEffect(() => {
    if (isOpen) {
      if (flight) {
        // Edit mode - populate with existing flight data
        setFormData({
          airline: flight.airline || '',
          flightNumber: flight.flightNumber || '',
          cabinClass: flight.cabinClass || 'economy',
          departureAirport: flight.departure?.airport || '',
          departureCity: flight.departure?.city || '',
          departureDateTime: toDateOnly(flight.departure?.dateTime || ''),
          arrivalAirport: flight.arrival?.airport || '',
          arrivalCity: flight.arrival?.city || '',
          arrivalDateTime: toDateOnly(flight.arrival?.dateTime || ''),
          paymentMethod: flight.paymentMethod || 'cash',
          points: 0,
          confirmationNumber: flight.confirmationNumber || '',
          airlineLogo: '', // Don't try to get airlineLogo from Flight type
          pricePerPersonCash: flight.pricePerPerson?.cash || 0,
          pricePerPersonPoints: flight.pricePerPerson?.points || 0,
          taxes: flight.pricePerPerson?.taxes || 0,
        });
        setIsEditMode(true);
        if (flight.segments && flight.segments.length > 0) {
          // Convert segment dates to date-only format
          const formattedSegments = flight.segments.map(segment => ({
            ...segment,
            departure: {
              ...segment.departure,
              dateTime: toDateOnly(segment.departure.dateTime)
            },
            arrival: {
              ...segment.arrival,
              dateTime: toDateOnly(segment.arrival.dateTime)
            }
          }));
          setSegments(formattedSegments);
        } else {
          setSegments([]);
        }
      } else {
        // Add mode - reset form
        setFormData({
          airline: '',
          flightNumber: '',
          cabinClass: 'economy',
          departureAirport: '',
          departureCity: '',
          departureDateTime: '',
          arrivalAirport: '',
          arrivalCity: '',
          arrivalDateTime: '',
          paymentMethod: 'cash',
          points: 0,
          confirmationNumber: '',
          airlineLogo: '',
          pricePerPersonCash: 0,
          pricePerPersonPoints: 0,
          taxes: 0,
        });
        setIsEditMode(false);
        setSegments([]);
      }
      setLookupError('');
    }
  }, [isOpen, flight]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value),
    }));
  };

  const handleFlightLookup = async () => {
    if (!formData.flightNumber || !formData.departureDateTime) {
      setLookupError('Please enter both flight number and date');
      return;
    }

    setIsLoading(true);
    setLookupError('');

    try {
      const response = await fetch('/api/flight-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightNumber: formData.flightNumber,
          date: formData.departureDateTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Log the full Amadeus response for debugging
      console.log('Amadeus API response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      console.log('Response keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');

      // Handle different possible response formats from Amadeus API
      let flights: any[] = [];
      
      if (Array.isArray(data)) {
        // Direct array response
        flights = data;
        console.log('Using direct array response, flights count:', flights.length);
      } else if (data.data && Array.isArray(data.data)) {
        // Response wrapped in data property
        flights = data.data;
        console.log('Using data.data response, flights count:', flights.length);
      } else if (data.flights && Array.isArray(data.flights)) {
        // Response wrapped in flights property
        flights = data.flights;
        console.log('Using data.flights response, flights count:', flights.length);
      } else {
        console.error('Unexpected response structure:', data);
        console.error('Response structure details:', {
          hasData: !!data.data,
          dataIsArray: data.data && Array.isArray(data.data),
          hasFlights: !!data.flights,
          flightsIsArray: data.flights && Array.isArray(data.flights),
          dataType: typeof data,
          isArray: Array.isArray(data)
        });
        setLookupError('Unexpected response format from flight lookup API');
        return;
      }

      console.log('Extracted flights:', flights);
      console.log('Number of flights found:', flights.length);

      // Check if we have multiple flights
      if (flights.length > 1) {
        // Multiple flights found, let user select
        console.log('Multiple flights found:', flights.length);
        setFlightOptions(flights);
        setShowFlightSelect(true);
        setIsLoading(false);
        return;
      }

      if (flights.length === 1) {
        // Single flight found, auto-select it
        console.log('Single flight found, auto-selecting');
        handleFlightSelect(flights[0]);
      } else if (flights.length === 0) {
        setLookupError('No flights found for this flight number on the selected date');
      }
    } catch (error) {
      console.error('Flight lookup error:', error);
      setLookupError(error instanceof Error ? error.message : 'Failed to fetch flight data');
    } finally {
      setIsLoading(false);
    }
  };

  function handleFlightSelect(flightData: any) {
    // Log the selected flight data
    console.log('Selected flight data:', flightData);
    const flightDesignator = flightData.flightDesignator;
    const flightPoints = flightData.flightPoints;
    const legs = flightData.legs;

    if (flightPoints && flightPoints.length >= 2 && legs && legs.length > 0) {
      const departurePoint = flightPoints[0];
      const arrivalPoint = flightPoints[flightPoints.length - 1];
      // Extract departure/arrival times robustly
      let departureTime = '';
      let arrivalTime = '';
      if (departurePoint.departure?.timings) {
        const depTiming = departurePoint.departure.timings.find((t: any) => t.qualifier === 'STD' || t.qualifier === 'ETD' || t.qualifier === 'SCH');
        departureTime = depTiming?.value || departurePoint.departure.timings[0]?.value || '';
      }
      if (arrivalPoint.arrival?.timings) {
        const arrTiming = arrivalPoint.arrival.timings.find((t: any) => t.qualifier === 'STA' || t.qualifier === 'ETA' || t.qualifier === 'SCH');
        arrivalTime = arrTiming?.value || arrivalPoint.arrival.timings[0]?.value || '';
      }
      // Lookup airline info
      const airlineInfo = getAirlineInfo(flightDesignator?.carrierCode || '');
      // Lookup airport/city info
      const depAirportInfo = getAirportInfo(departurePoint.iataCode || '');
      const arrAirportInfo = getAirportInfo(arrivalPoint.iataCode || '');
      setFormData(prev => ({
        ...prev,
        airline:
          airlineInfo?.name ||
          flightDesignator?.carrierCode || '',
        airlineLogo: airlineInfo?.logoUrl || '',
        departureAirport: departurePoint.iataCode || '',
        departureCity:
          depAirportInfo?.city ||
          departurePoint.iataCode || '',
        departureDateTime: toDateOnly(departureTime) || prev.departureDateTime,
        arrivalAirport: arrivalPoint.iataCode || '',
        arrivalCity:
          arrAirportInfo?.city ||
          arrivalPoint.iataCode || '',
        arrivalDateTime: toDateOnly(arrivalTime) || prev.arrivalDateTime,
      }));
      setShowFlightSelect(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.airline || !formData.flightNumber) {
      setLookupError('Please enter airline and flight number');
      return;
    }
    if (!formData.departureAirport || !formData.arrivalAirport) {
      setLookupError('Please enter departure and arrival airports');
      return;
    }
    if (!formData.departureDateTime || !formData.arrivalDateTime) {
      setLookupError('Please enter departure and arrival times');
      return;
    }
    const mainDeparture = segments[0]?.departure || formData.departureAirport ? { airport: formData.departureAirport, city: formData.departureCity, dateTime: formData.departureDateTime } : undefined;
    const mainArrival = segments.length > 0 ? segments[segments.length - 1].arrival : formData.arrivalAirport ? { airport: formData.arrivalAirport, city: formData.arrivalCity, dateTime: formData.arrivalDateTime } : undefined;
    const flightData: CreateFlightForm = {
      ...formData,
      departureAirport: mainDeparture?.airport || '',
      departureCity: mainDeparture?.city || '',
      departureDateTime: mainDeparture?.dateTime || '',
      arrivalAirport: mainArrival?.airport || '',
      arrivalCity: mainArrival?.city || '',
      arrivalDateTime: mainArrival?.dateTime || '',
      segments: segments.length > 0 ? segments : undefined,
      pricePerPerson: {
        cash: formData.pricePerPersonCash,
        points: formData.pricePerPersonPoints,
        taxes: formData.taxes,
      },
    };
    onSubmit(flightData);
    onClose();
  };

  // Add segment handlers
  const handleAddSegment = () => {
    setSegments(prev => [
      ...prev,
      {
        airline: '',
        flightNumber: '',
        departure: { airport: '', city: '', dateTime: '' },
        arrival: { airport: '', city: '', dateTime: '' },
      },
    ]);
  };
  const handleSegmentChange = (idx: number, field: string, value: string, subfield?: string) => {
    setSegments(prev => {
      const newSegments = prev.map((seg, i) => {
        if (i !== idx) return seg;
        if ((field === 'departure' || field === 'arrival') && subfield) {
          return { ...seg, [field]: { ...seg[field as 'departure' | 'arrival'], [subfield]: value } };
        }
        return { ...seg, [field]: value };
      });
      // After updating segments, update main flight fields to match first/last segment
      if (newSegments.length > 0) {
        const firstSeg = newSegments[0];
        const lastSeg = newSegments[newSegments.length - 1];
        setFormData(prevForm => ({
          ...prevForm,
          departureAirport: firstSeg.departure.airport,
          departureCity: firstSeg.departure.city,
          departureDateTime: firstSeg.departure.dateTime,
          arrivalAirport: lastSeg.arrival.airport,
          arrivalCity: lastSeg.arrival.city,
          arrivalDateTime: lastSeg.arrival.dateTime,
        }));
      }
      return newSegments;
    });
  };
  const handleRemoveSegment = (idx: number) => {
    setSegments(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-0 relative max-h-[90vh] flex flex-col justify-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{isEditMode ? 'Edit Flight' : 'Add Flight'}</h2>
          <button className="text-2xl text-gray-400 hover:text-gray-700 focus:outline-none" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flight Lookup Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Flight Lookup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    name="flightNumber"
                    value={formData.flightNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., AA123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="departureDateTime"
                    value={formData.departureDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleFlightLookup}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Looking up...' : 'Lookup Flight'}
                  </button>
                </div>
              </div>
              {lookupError && (
                <p className="text-red-600 text-sm mt-2">{lookupError}</p>
              )}
            </div>

            {/* Flight Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Flight Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airline
                  </label>
                  <div className="flex items-center space-x-2">
                    {formData.airlineLogo && (
                      <img src={formData.airlineLogo} alt={formData.airline} className="h-6 w-auto" />
                    )}
                    <input
                      type="text"
                      name="airline"
                      value={formData.airline}
                      onChange={handleInputChange}
                      placeholder="e.g., American Airlines"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabin Class
                  </label>
                  <select
                    name="cabinClass"
                    value={formData.cabinClass}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              {/* Departure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Airport
                  </label>
                  <input
                    type="text"
                    name="departureAirport"
                    value={formData.departureAirport}
                    onChange={handleInputChange}
                    placeholder="e.g., JFK"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure City
                  </label>
                  <input
                    type="text"
                    name="departureCity"
                    value={formData.departureCity}
                    onChange={handleInputChange}
                    placeholder="e.g., New York"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Arrival */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Airport
                  </label>
                  <input
                    type="text"
                    name="arrivalAirport"
                    value={formData.arrivalAirport}
                    onChange={handleInputChange}
                    placeholder="e.g., LAX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival City
                  </label>
                  <input
                    type="text"
                    name="arrivalCity"
                    value={formData.arrivalCity}
                    onChange={handleInputChange}
                    placeholder="e.g., Los Angeles"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="date"
                    name="departureDateTime"
                    value={formData.departureDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="date"
                    name="arrivalDateTime"
                    value={formData.arrivalDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cost Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Cost & Payment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Payment Method Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="points">Points</option>
                    <option value="hybrid" disabled>Hybrid (Coming Soon)</option>
                  </select>
                </div>
                {/* Conditionally render cost fields */}
                {formData.paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Person ($)
                    </label>
                    <input
                      type="number"
                      name="pricePerPersonCash"
                      value={formData.pricePerPersonCash}
                      onChange={handleNumberChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {formData.paymentMethod === 'points' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points per Person
                      </label>
                      <input
                        type="number"
                        name="pricePerPersonPoints"
                        value={formData.pricePerPersonPoints}
                        onChange={handleNumberChange}
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxes & Fees ($)
                      </label>
                      <input
                        type="number"
                        name="taxes"
                        value={formData.taxes}
                        onChange={handleNumberChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmation Number
                  </label>
                  <input
                    type="text"
                    name="confirmationNumber"
                    value={formData.confirmationNumber}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Segments Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-semibold">Segments</h3>
                <button type="button" className="text-blue-600 hover:underline" onClick={handleAddSegment}>+ Add Segment</button>
              </div>
              {segments.length === 0 && <div className="text-sm text-gray-500">No segments added.</div>}
              {segments.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">Segments</h4>
                  {segments.map((segment, idx) => (
                    <div key={idx} className="border rounded-lg p-3 mb-2 bg-gray-50 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Segment {idx + 1}</span>
                        <button type="button" onClick={() => handleRemoveSegment(idx)} className="text-red-500 text-xs ml-2">Remove</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Flight Number</label>
                          <input
                            type="text"
                            value={segment.flightNumber}
                            onChange={e => handleSegmentChange(idx, 'flightNumber', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="e.g., AA123"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date/Time</label>
                          <input
                            type="date"
                            value={segment.departure.dateTime}
                            onChange={e => handleSegmentChange(idx, 'departure', e.target.value, 'dateTime')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="YYYY-MM-DD"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            className="w-full bg-blue-600 text-white py-1 px-2 rounded-md hover:bg-blue-700 text-xs"
                            disabled={!segment.flightNumber || !segment.departure.dateTime}
                            onClick={async () => {
                              const flightNumber = segment.flightNumber;
                              const date = segment.departure.dateTime;
                              if (!flightNumber || !date) {
                                alert('Enter flight number and date for this segment');
                                return;
                              }
                              try {
                                const response = await fetch('/api/flight-lookup', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ flightNumber, date }),
                                });
                                if (!response.ok) throw new Error('Failed to fetch flight data');
                                const data = await response.json();
                                let flights = [];
                                if (Array.isArray(data)) flights = data;
                                else if (data.data && Array.isArray(data.data)) flights = data.data;
                                else if (data.flights && Array.isArray(data.flights)) flights = data.flights;
                                if (flights.length === 0) throw new Error('No flights found');
                                // Use the first flight found for this segment
                                const flightData = flights[0];
                                const flightPoints = flightData.flightPoints;
                                const legs = flightData.legs;
                                if (!flightPoints || flightPoints.length < 2) throw new Error('Invalid flight data');
                                let found = false;
                                for (let i = 0; i < legs.length; i++) {
                                  const leg = legs[i];
                                  const point = flightPoints[i];
                                  console.log('LEG:', JSON.stringify(leg, null, 2));
                                  console.log('POINT:', JSON.stringify(point, null, 2));

                                  // Try to get the date from the first timing
                                  const depTiming = point?.departure?.timings?.[0];
                                  const amadeusDate = depTiming?.value;
                                  const amadeusDatePart = amadeusDate ? amadeusDate.split('T')[0] : '';

                                  // Try to get flight number, fallback to main flight number if missing
                                  const legFlightNumber = leg?.flightDesignator?.number || leg?.flightDesignator?.flightNumber || segment.flightNumber;
                                  const segFlightNumber = segment.flightNumber;

                                  // Compare by flight number, or fallback to board/off point and date
                                  const matchesFlightNumber =
                                    legFlightNumber &&
                                    segFlightNumber &&
                                    legFlightNumber.toString().toLowerCase() === segFlightNumber.toString().toLowerCase();

                                  const matchesBoardOffAndDate =
                                    leg.boardPointIataCode === segment.departure.airport &&
                                    leg.offPointIataCode === segment.arrival.airport &&
                                    amadeusDatePart === segment.departure.dateTime;

                                  // Aircraft info
                                  const aircraftType = leg?.aircraftEquipment?.aircraftType || '';
                                  const aircraftManufacturer = leg?.aircraftEquipment?.manufacturer || '';

                                  console.log('Comparing:', {
                                    legFlightNumber,
                                    segFlightNumber,
                                    amadeusDate,
                                    amadeusDatePart,
                                    segmentDate: segment.departure.dateTime,
                                    boardPointIataCode: leg.boardPointIataCode,
                                    offPointIataCode: leg.offPointIataCode,
                                    segDepAirport: segment.departure.airport,
                                    segArrAirport: segment.arrival.airport,
                                    matchesFlightNumber,
                                    matchesBoardOffAndDate,
                                    aircraftType,
                                    aircraftManufacturer
                                  });

                                  if (matchesFlightNumber || matchesBoardOffAndDate) {
                                    // Calculate depDate and arrDate for this segment
                                    let depDate = '';
                                    if (point?.departure?.timings?.[0]?.value) {
                                      depDate = point.departure.timings[0].value.split('T')[0];
                                    }
                                    let arrDate = '';
                                    if (i + 1 < flightPoints.length && flightPoints[i + 1]?.departure?.timings?.[0]?.value) {
                                      arrDate = flightPoints[i + 1].departure.timings[0].value.split('T')[0];
                                    } else if (depDate && leg.scheduledLegDuration) {
                                      // Calculate arrival date from duration
                                      const depDateObj = new Date(depDate + 'T00:00:00');
                                      const durationStr = leg.scheduledLegDuration;
                                      const hours = durationStr.match(/(\d+)H/)?.[1] || '0';
                                      const minutes = durationStr.match(/(\d+)M/)?.[1] || '0';
                                      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
                                      const arrDateObj = new Date(depDateObj.getTime() + totalMinutes * 60000);
                                      arrDate = arrDateObj.toISOString().split('T')[0];
                                    } else {
                                      arrDate = depDate;
                                    }
                                    // Build the updated segment from the Amadeus response
                                    const updatedSegment = {
                                      airline: flightData.flightDesignator?.carrierCode || '',
                                      flightNumber: leg.flightDesignator?.number || '',
                                      departure: {
                                        airport: leg.boardPointIataCode || '',
                                        city: (airports.find(a => a.iata === leg.boardPointIataCode)?.city || ''),
                                        dateTime: depDate,
                                      },
                                      arrival: {
                                        airport: leg.offPointIataCode || '',
                                        city: (airports.find(a => a.iata === leg.offPointIataCode)?.city || ''),
                                        dateTime: arrDate,
                                      },
                                      aircraftType: leg?.aircraftEquipment?.aircraftType || '',
                                      aircraftManufacturer: leg?.aircraftEquipment?.manufacturer || '',
                                    };
                                    setSegments(prevSegments => {
                                      const newSegments = prevSegments.map((seg, sidx) => sidx === idx ? updatedSegment : seg);
                                      // If this is the first or last segment, update main flight fields
                                      if (idx === 0 || idx === newSegments.length - 1) {
                                        const firstSeg = newSegments[0];
                                        const lastSeg = newSegments[newSegments.length - 1];
                                        setFormData(prevForm => ({
                                          ...prevForm,
                                          departureAirport: firstSeg.departure.airport,
                                          departureCity: firstSeg.departure.city,
                                          departureDateTime: firstSeg.departure.dateTime,
                                          arrivalAirport: lastSeg.arrival.airport,
                                          arrivalCity: lastSeg.arrival.city,
                                          arrivalDateTime: lastSeg.arrival.dateTime,
                                        }));
                                      }
                                      return newSegments;
                                    });
                                    found = true;
                                    break;
                                  }
                                }
                                if (!found) {
                                  alert('Could not find matching segment in flight data.');
                                }
                              } catch (err: any) {
                                alert(err.message || 'Failed to look up segment');
                              }
                            }}
                          >
                            Lookup
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Departure Airport</label>
                          <input
                            type="text"
                            value={segment.departure.airport}
                            onChange={e => handleSegmentChange(idx, 'departure', e.target.value, 'airport')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Departure City</label>
                          <input
                            type="text"
                            value={segment.departure.city}
                            onChange={e => handleSegmentChange(idx, 'departure', e.target.value, 'city')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Airport</label>
                          <input
                            type="text"
                            value={segment.arrival.airport}
                            onChange={e => handleSegmentChange(idx, 'arrival', e.target.value, 'airport')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Arrival City</label>
                          <input
                            type="text"
                            value={segment.arrival.city}
                            onChange={e => handleSegmentChange(idx, 'arrival', e.target.value, 'city')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Aircraft Type</label>
                          <input
                            type="text"
                            value={segment.aircraftType || ''}
                            onChange={e => handleSegmentChange(idx, 'aircraftType', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="e.g., 77W"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Aircraft Manufacturer</label>
                          <input
                            type="text"
                            value={segment.aircraftManufacturer || ''}
                            onChange={e => handleSegmentChange(idx, 'aircraftManufacturer', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="e.g., Boeing"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Flight
              </button>
            </div>
          </form>
        </div>
      </div>

      {showFlightSelect && (
        <FlightSelectionModal
          isOpen={showFlightSelect}
          flights={flightOptions}
          onSelect={handleFlightSelect}
          onClose={() => setShowFlightSelect(false)}
        />
      )}
    </div>
  );
} 