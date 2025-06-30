// Trip Status Types
export type TripStatus = 'planning' | 'booked' | 'archived';
export type ViewMode = 'timeline' | 'calendar' | 'map';

// Activity Types
export type ActivityCategory = 'tour' | 'food' | 'museum' | 'rest' | 'explore' | 'shopping' | 'transport' | 'other';
export type ActivityStatus = 'idea' | 'booked' | 'completed';

// Flight Types
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type FlightStatus = 'planned' | 'booked' | 'cancelled';
export type PaymentMethod = 'cash' | 'points' | 'hybrid';

// Hotel Types
export type HotelStatus = 'planned' | 'booked' | 'cancelled';

// Core Interfaces
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  travelers: number;
  notes?: string;
  status: TripStatus;
  viewMode: ViewMode;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  totalCashCost?: number;
  totalPointsUsed?: number;
  duration?: number;
  ptoDaysRequired?: number;
}

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  bookingUrl?: string;
  description?: string;
  category: ActivityCategory;
  costPerPerson: number;
  groupSize?: number;
  date: string; // ISO date string
  time?: string; // HH:MM format
  duration?: number; // in minutes
  location?: string;
  sourceSite?: string;
  status: ActivityStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    dateTime: string;
  };
  arrival: {
    airport: string;
    city: string;
    dateTime: string;
  };
  aircraftType?: string;
  aircraftManufacturer?: string;
}

export interface Flight {
  id: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  cabinClass: CabinClass;
  departure: {
    airport: string;
    city: string;
    dateTime: string;
  };
  arrival: {
    airport: string;
    city: string;
    dateTime: string;
  };
  layovers?: Array<{
    location: string;
    duration: number;
  }>;
  segments?: FlightSegment[];
  seatNumbers?: string[];
  planeType?: string;
  pricePerPerson: {
    cash: number;
    points?: number;
    pointsProgram?: string;
    taxes: number;
  };
  paymentMethod: PaymentMethod;
  status: FlightStatus;
  confirmationNumber?: string;
  bookingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  tripId: string;
  name: string;
  address: string;
  bookingSite: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  roomType: string;
  pricePerNight: number;
  pointsPerNight?: number;
  totalCost: {
    cash: number;
    points?: number;
  };
  paymentMethod: PaymentMethod;
  taxes?: number;
  status: HotelStatus;
  confirmationNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  trip: Trip;
  totalCashCost: number;
  totalPointsUsed: number;
  costBreakdown: {
    flights: number;
    hotels: number;
    activities: number;
  };
  duration: number;
  ptoDaysRequired: number;
}

export interface UserSettings {
  id: string;
  userId: string;
  pointsToCashRatio: number; // e.g., 1.4 for 1.4 cents per point
  excludeWeekends: boolean;
  includeFederalHolidays: boolean;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface CreateTripForm {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  notes?: string;
}

export interface CreateActivityForm {
  title: string;
  bookingUrl?: string;
  description?: string;
  category: ActivityCategory;
  costPerPerson: number;
  groupSize?: number;
  date: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
}

export interface CreateFlightForm {
  airline: string;
  flightNumber: string;
  cabinClass: CabinClass;
  departureAirport: string;
  departureCity: string;
  departureDateTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalDateTime: string;
  pricePerPerson: {
    cash: number;
    points?: number;
    taxes: number;
  };
  paymentMethod: PaymentMethod;
  points?: number;
  confirmationNumber?: string;
  airlineLogo?: string;
  segments?: FlightSegment[];
}

export interface CreateHotelForm {
  name: string;
  address: string;
  bookingSite: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  pricePerNight: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  confirmationNumber?: string;
  notes?: string;
} 