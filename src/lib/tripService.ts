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
import type { Trip, CreateTripForm } from '../types';

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