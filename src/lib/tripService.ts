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
import type { Trip, CreateTripForm, Activity, CreateActivityForm } from '../types';

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