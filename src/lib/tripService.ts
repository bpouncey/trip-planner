import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Trip, CreateTripForm, Activity, CreateActivityForm, Flight, CreateFlightForm, Hotel, CreateHotelForm } from '../types';

const TRIPS_COLLECTION = 'trips';

// Convert Firestore document to Trip object
const docToTrip = (doc: QueryDocumentSnapshot<DocumentData>): Trip => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    travelers: data.travelers,
    notes: data.notes,
    status: data.status || 'planning',
    viewMode: data.viewMode || 'timeline',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
  };
};

// Create a new trip
export const createTrip = async (tripData: CreateTripForm): Promise<Trip> => {
  console.log('createTrip called with:', tripData)
  try {
    // Sanitize notes: Firestore does not allow undefined
    const sanitizedTripData = {
      ...tripData,
      notes: tripData.notes === undefined ? null : tripData.notes,
    }
    const tripToSave = {
      ...sanitizedTripData,
      status: 'planning' as const,
      viewMode: 'timeline' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Saving trip to Firebase:', tripToSave)
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), tripToSave);
    console.log('Document created with ID:', docRef.id)
    
    // Return the created trip with the generated ID
    return {
      id: docRef.id,
      ...tripData,
      status: 'planning',
      viewMode: 'timeline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating trip:', error)
    throw new Error('Failed to create trip')
  }
};

// Get all trips
export const getTrips = async (): Promise<Trip[]> => {
  try {
    const q = query(collection(db, TRIPS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docToTrip);
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw new Error('Failed to fetch trips');
  }
};

// Update a trip
export const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<void> => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw new Error('Failed to update trip');
  }
};

// Delete a trip
export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw new Error('Failed to delete trip');
  }
};

// Get a single trip by ID
export const getTrip = async (tripId: string): Promise<Trip | null> => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (tripDoc.exists()) {
      return docToTrip(tripDoc as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw new Error('Failed to fetch trip');
  }
};

// --- Activity CRUD ---

// Convert Firestore document to Activity object
const docToActivity = (doc: QueryDocumentSnapshot<DocumentData>): Activity => {
  const data = doc.data();
  return {
    id: doc.id,
    tripId: data.tripId,
    title: data.title,
    bookingUrl: data.bookingUrl,
    description: data.description,
    category: data.category,
    costPerPerson: data.costPerPerson,
    groupSize: data.groupSize,
    date: data.date,
    time: data.time,
    duration: data.duration,
    location: data.location,
    sourceSite: data.sourceSite,
    status: data.status || 'idea',
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
  };
};

// Utility to remove undefined fields from an object
function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}

// Create a new activity for a trip
export const createActivity = async (tripId: string, activityData: CreateActivityForm): Promise<Activity> => {
  try {
    const sanitizedData = removeUndefinedFields({
      ...activityData,
      notes: activityData.notes === undefined ? null : activityData.notes,
      status: 'idea' as const,
      tripId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const activitiesCol = collection(db, TRIPS_COLLECTION, tripId, 'activities');
    const docRef = await addDoc(activitiesCol, sanitizedData);
    return {
      id: docRef.id,
      ...activityData,
      tripId,
      status: 'idea',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error('Failed to create activity');
  }
};

// Get all activities for a trip, sorted by date and time
export const getActivities = async (tripId: string): Promise<Activity[]> => {
  try {
    console.log('Fetching activities for trip:', tripId);
    const activitiesCol = collection(db, TRIPS_COLLECTION, tripId, 'activities');
    console.log('Activities collection path:', activitiesCol.path);
    
    // Now that we have the composite index, we can order by both date and time
    const q = query(activitiesCol, orderBy('date', 'asc'), orderBy('time', 'asc'));
    console.log('Query created, executing...');
    
    const querySnapshot = await getDocs(q);
    console.log('Query executed, found', querySnapshot.docs.length, 'activities');
    
    const activities = querySnapshot.docs.map(docToActivity);
    console.log('Activities converted:', activities);
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    throw new Error(`Failed to fetch activities: ${(error as any)?.message || 'Unknown error'}`);
  }
};

// Update an activity
export const updateActivity = async (tripId: string, activityId: string, updates: Partial<Activity>): Promise<void> => {
  try {
    const activityRef = doc(db, TRIPS_COLLECTION, tripId, 'activities', activityId);
    await updateDoc(activityRef, removeUndefinedFields({
      ...updates,
      updatedAt: serverTimestamp(),
    }));
  } catch (error) {
    console.error('Error updating activity:', error);
    throw new Error('Failed to update activity');
  }
};

// Delete an activity
export const deleteActivity = async (tripId: string, activityId: string): Promise<void> => {
  try {
    const activityRef = doc(db, TRIPS_COLLECTION, tripId, 'activities', activityId);
    await deleteDoc(activityRef);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw new Error('Failed to delete activity');
  }
};

// --- Flight CRUD ---

// Convert Firestore document to Flight object
const docToFlight = (doc: QueryDocumentSnapshot<DocumentData>): Flight => {
  const data = doc.data();
  return {
    id: doc.id,
    tripId: data.tripId,
    airline: data.airline,
    flightNumber: data.flightNumber,
    cabinClass: data.cabinClass,
    departure: {
      airport: data.departureAirport,
      city: data.departureCity,
      dateTime: data.departureDateTime,
    },
    arrival: {
      airport: data.arrivalAirport,
      city: data.arrivalCity,
      dateTime: data.arrivalDateTime,
    },
    layovers: data.layovers,
    seatNumbers: data.seatNumbers,
    planeType: data.planeType,
    segments: data.segments,
    pricePerPerson: {
      cash: data.pricePerPerson?.cash ?? 0,
      points: data.pricePerPerson?.points ?? 0,
      taxes: data.pricePerPerson?.taxes ?? 0,
    },
    paymentMethod: data.paymentMethod,
    status: data.status || 'planned',
    confirmationNumber: data.confirmationNumber,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
  };
};

// Create a new flight for a trip
export const createFlight = async (tripId: string, flightData: CreateFlightForm): Promise<Flight> => {
  try {
    const sanitizedData = removeUndefinedFields({
      ...flightData,
      confirmationNumber: flightData.confirmationNumber === '' ? null : flightData.confirmationNumber,
      status: 'planned' as const,
      tripId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      segments: flightData.segments,
    });
    
    const flightsCol = collection(db, TRIPS_COLLECTION, tripId, 'flights');
    const docRef = await addDoc(flightsCol, sanitizedData);
    
    return {
      id: docRef.id,
      tripId,
      airline: flightData.airline,
      flightNumber: flightData.flightNumber,
      cabinClass: flightData.cabinClass,
      departure: {
        airport: flightData.departureAirport,
        city: flightData.departureCity,
        dateTime: flightData.departureDateTime,
      },
      arrival: {
        airport: flightData.arrivalAirport,
        city: flightData.arrivalCity,
        dateTime: flightData.arrivalDateTime,
      },
      pricePerPerson: flightData.pricePerPerson,
      paymentMethod: flightData.paymentMethod,
      status: 'planned',
      confirmationNumber: flightData.confirmationNumber || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      segments: flightData.segments,
    };
  } catch (error) {
    console.error('Error creating flight:', error);
    throw new Error('Failed to create flight');
  }
};

// Get all flights for a trip, sorted by departure time
export const getFlights = async (tripId: string): Promise<Flight[]> => {
  try {
    const flightsCol = collection(db, TRIPS_COLLECTION, tripId, 'flights');
    const q = query(flightsCol, orderBy('departureDateTime', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docToFlight);
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw new Error('Failed to fetch flights');
  }
};

// Update a flight
export const updateFlight = async (tripId: string, flightId: string, updates: Partial<Flight>): Promise<void> => {
  try {
    const flightRef = doc(db, TRIPS_COLLECTION, tripId, 'flights', flightId);
    await updateDoc(flightRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating flight:', error);
    throw new Error('Failed to update flight');
  }
};

// Delete a flight
export const deleteFlight = async (tripId: string, flightId: string): Promise<void> => {
  try {
    const flightRef = doc(db, TRIPS_COLLECTION, tripId, 'flights', flightId);
    await deleteDoc(flightRef);
  } catch (error) {
    console.error('Error deleting flight:', error);
    throw new Error('Failed to delete flight');
  }
};

// --- Hotel CRUD ---

// Convert Firestore document to Hotel object
const docToHotel = (doc: QueryDocumentSnapshot<DocumentData>): Hotel => {
  const data = doc.data();
  return {
    id: doc.id,
    tripId: data.tripId,
    name: data.name,
    address: data.address,
    bookingSite: data.bookingSite,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    roomType: data.roomType,
    pricePerNight: data.pricePerNight,
    pointsPerNight: data.pointsPerNight,
    totalCost: {
      cash: data.totalCost?.cash ?? 0,
      points: data.totalCost?.points ?? 0,
    },
    paymentMethod: data.paymentMethod,
    taxes: data.taxes,
    status: data.status || 'planned',
    confirmationNumber: data.confirmationNumber,
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
  };
};

// Create a new hotel for a trip
export const createHotel = async (tripId: string, hotelData: CreateHotelForm): Promise<Hotel> => {
  try {
    const sanitizedData = removeUndefinedFields({
      ...hotelData,
      status: 'planned' as const,
      tripId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const hotelsCol = collection(db, TRIPS_COLLECTION, tripId, 'hotels');
    const docRef = await addDoc(hotelsCol, sanitizedData);
    return {
      id: docRef.id,
      ...hotelData,
      tripId,
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalCost: typeof hotelData.totalCost === 'number' ? { cash: hotelData.totalCost, points: 0 } : hotelData.totalCost,
    } as Hotel;
  } catch (error) {
    console.error('Error creating hotel:', error);
    throw new Error('Failed to create hotel');
  }
};

// Get all hotels for a trip, sorted by check-in date
export const getHotels = async (tripId: string): Promise<Hotel[]> => {
  try {
    const hotelsCol = collection(db, TRIPS_COLLECTION, tripId, 'hotels');
    const q = query(hotelsCol, orderBy('checkInDate', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToHotel);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw new Error('Failed to fetch hotels');
  }
};

// Update a hotel
export const updateHotel = async (tripId: string, hotelId: string, updates: Partial<Hotel>): Promise<void> => {
  try {
    const hotelRef = doc(db, TRIPS_COLLECTION, tripId, 'hotels', hotelId);
    await updateDoc(hotelRef, removeUndefinedFields({
      ...updates,
      updatedAt: serverTimestamp(),
    }));
  } catch (error) {
    console.error('Error updating hotel:', error);
    throw new Error('Failed to update hotel');
  }
};

// Delete a hotel
export const deleteHotel = async (tripId: string, hotelId: string): Promise<void> => {
  try {
    const hotelRef = doc(db, TRIPS_COLLECTION, tripId, 'hotels', hotelId);
    await deleteDoc(hotelRef);
  } catch (error) {
    console.error('Error deleting hotel:', error);
    throw new Error('Failed to delete hotel');
  }
}; 