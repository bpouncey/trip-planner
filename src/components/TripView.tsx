import { useState, useEffect } from 'react';
import type { Trip, CreateTripForm, CreateActivityForm, Activity, Flight, CreateFlightForm, Hotel, CreateHotelForm } from '../types';
import { TripTimeline } from './TripTimeline';
import { TripSummary } from './TripSummary';
import { TripActions } from './TripActions';
import { TripCreationModal } from './TripCreationModal';
import { ActivityModal } from './ActivityModal';
import { getActivities, createActivity, updateActivity, deleteActivity, getFlights, createFlight, deleteFlight, getHotels, createHotel, updateHotel, deleteHotel as deleteHotelFn } from '../lib/tripService';
import FlightModal from './FlightModal';
import HotelModal from './HotelModal';

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

  // Flights state and CRUD logic
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [flightsError, setFlightsError] = useState<string | null>(null);

  // Hotels state and CRUD logic
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [hotelsError, setHotelsError] = useState<string | null>(null);

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

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setFlightsLoading(true);
        const tripFlights = await getFlights(trip.id);
        setFlights(tripFlights);
        setFlightsError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load flights';
        setFlightsError(errorMessage);
        setFlights([]);
      } finally {
        setFlightsLoading(false);
      }
    };
    loadFlights();
  }, [trip.id]);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setHotelsLoading(true);
        const tripHotels = await getHotels(trip.id);
        setHotels(tripHotels);
        setHotelsError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hotels';
        setHotelsError(errorMessage);
        setHotels([]);
      } finally {
        setHotelsLoading(false);
      }
    };
    loadHotels();
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

  const handleCreateFlight = async (flightData: CreateFlightForm) => {
    try {
      const newFlight = await createFlight(trip.id, flightData);
      setFlights(prev => [...prev, newFlight]);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;
    try {
      await deleteFlight(trip.id, flightId);
      setFlights(prev => prev.filter(flight => flight.id !== flightId));
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
  const handleActivityModalSubmit = (activityData: CreateActivityForm) => {
    handleCreateActivity(activityData).then(handleCloseActivityModal);
  };

  // Flight modal state
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [flightInitialDate, setFlightInitialDate] = useState<string | undefined>(undefined);

  // Handler to open the flight modal (optionally with a date)
  const handleAddFlight = (date?: string) => {
    setFlightInitialDate(date);
    setIsFlightModalOpen(true);
  };

  // Handler to close the flight modal
  const handleCloseFlightModal = () => {
    setIsFlightModalOpen(false);
    setFlightInitialDate(undefined);
  };

  // Handler for FlightModal submit
  const handleFlightModalSubmit = (flightData: CreateFlightForm) => {
    handleCreateFlight(flightData).then(handleCloseFlightModal);
  };

  // Hotel modal state
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Handler to open the hotel modal (add or edit)
  const handleAddHotel = () => {
    setEditingHotel(null);
    setIsHotelModalOpen(true);
  };
  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setIsHotelModalOpen(true);
  };

  // Handler to close the hotel modal
  const handleCloseHotelModal = () => {
    setIsHotelModalOpen(false);
    setEditingHotel(null);
  };

  // Handler for HotelModal submit (add or edit)
  const handleHotelModalSubmit = async (hotelData: CreateHotelForm) => {
    try {
      if (editingHotel) {
        await updateHotel(trip.id, editingHotel.id, {
          ...hotelData,
          totalCost: typeof hotelData.totalCost === 'number' ? { cash: hotelData.totalCost, points: 0 } : hotelData.totalCost,
        });
        setHotels(prev => prev.map(h => h.id === editingHotel.id ? { ...h, ...hotelData, totalCost: typeof hotelData.totalCost === 'number' ? { cash: hotelData.totalCost, points: 0 } : hotelData.totalCost } : h));
      } else {
        const newHotel = await createHotel(trip.id, hotelData);
        setHotels(prev => [...prev, newHotel]);
      }
      setIsHotelModalOpen(false);
      setEditingHotel(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await deleteHotelFn(trip.id, hotelId);
      setHotels(prev => prev.filter(h => h.id !== hotelId));
    } catch (err) {
      throw err;
    }
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
              flights={flights}
              hotels={hotels}
              loading={loading}
              error={error}
              onAddActivity={handleAddActivity}
              onAddFlight={handleAddFlight}
              onAddHotel={handleAddHotel}
              onEditHotel={handleEditHotel}
              onDeleteHotel={handleDeleteHotel}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onDeleteFlight={handleDeleteFlight}
            />
          )}
          {viewMode === 'summary' && (
            <TripSummary 
              trip={trip} 
              activities={activities}
              flights={flights}
              hotels={hotels}
              onAddFlight={async (flightData) => await handleCreateFlight(flightData)}
              onAddHotel={handleAddHotel}
            />
          )}
          {viewMode === 'actions' && (
            <>
              <TripActions
                trip={trip}
                onDeleteTrip={onDeleteTrip}
                onEditTrip={() => setIsEditModalOpen(true)}
                onAddActivity={handleAddActivity}
                onAddFlight={async (flightData) => await handleCreateFlight(flightData)}
                onAddHotel={handleAddHotel}
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
      <FlightModal
        isOpen={isFlightModalOpen}
        onClose={handleCloseFlightModal}
        onSubmit={handleFlightModalSubmit}
        tripId={trip.id}
        flight={flightInitialDate ? { departure: { dateTime: flightInitialDate } } as any : undefined}
      />
      <HotelModal
        isOpen={isHotelModalOpen}
        onClose={handleCloseHotelModal}
        onSubmit={handleHotelModalSubmit}
        tripId={trip.id}
        hotel={editingHotel || undefined}
      />
    </div>
  );
} 