import type { Trip, TripSummary, Activity, Flight, Hotel } from '../types';

// Date utilities
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string'
    ? new Date(date + 'T00:00:00')
    : new Date(date);
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateTime: string): string => {
  const d = new Date(dateTime);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const isWeekend = (date: string): boolean => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

// US Federal Holidays (simplified list for 2024-2025)
const federalHolidays = [
  '2024-01-01', // New Year's Day
  '2024-01-15', // Martin Luther King Jr. Day
  '2024-02-19', // Presidents' Day
  '2024-05-27', // Memorial Day
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-10-14', // Columbus Day
  '2024-11-11', // Veterans Day
  '2024-11-28', // Thanksgiving Day
  '2024-12-25', // Christmas Day
  '2025-01-01', // New Year's Day
  '2025-01-20', // Martin Luther King Jr. Day
  '2025-02-17', // Presidents' Day
  '2025-05-26', // Memorial Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving Day
  '2025-12-25', // Christmas Day
];

export const isFederalHoliday = (date: string): boolean => {
  const dateStr = date.split('T')[0]; // Get just the date part
  return federalHolidays.includes(dateStr);
};

export const calculatePTODays = (
  startDate: string, 
  endDate: string, 
  excludeWeekends: boolean = true, 
  includeFederalHolidays: boolean = true
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let ptoDays = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Skip weekends if excludeWeekends is true
    if (excludeWeekends && isWeekend(dateStr)) {
      continue;
    }
    
    // Skip federal holidays if includeFederalHolidays is true
    if (includeFederalHolidays && isFederalHoliday(dateStr)) {
      continue;
    }
    
    ptoDays++;
  }
  
  return ptoDays;
};

// Cost calculations
export const calculateTripSummary = (
  trip: Trip,
  activities: Activity[],
  flights: Flight[],
  hotels: Hotel[],
  pointsToCashRatio: number = 1.4
): TripSummary => {
  const tripActivities = activities.filter(a => a.tripId === trip.id);
  const tripFlights = flights.filter(f => f.tripId === trip.id);
  const tripHotels = hotels.filter(h => h.tripId === trip.id);
  
  // Calculate costs
  const activitiesCost = tripActivities.reduce((sum, activity) => sum + activity.costPerPerson, 0) * trip.travelers;
  
  const flightsCost = tripFlights.reduce((sum, flight) => {
    if (flight.paymentMethod === 'points') {
      // Only add taxes (cash out of pocket) for points flights
      return sum + (flight.pricePerPerson.taxes || 0) * trip.travelers;
    } else if (flight.paymentMethod === 'hybrid') {
      // Add both cash and points (cash for cash portion, points counted separately)
      return sum + (flight.pricePerPerson.cash || 0) * trip.travelers + (flight.pricePerPerson.taxes || 0) * trip.travelers;
    } else {
      // Cash flights: add cash and taxes
      return sum + (flight.pricePerPerson.cash || 0) * trip.travelers + (flight.pricePerPerson.taxes || 0) * trip.travelers;
    }
  }, 0);
  
  const hotelsCost = tripHotels.reduce((sum, hotel) => {
    const cashCost = hotel.totalCost.cash;
    const pointsCost = 0; // Don't add points as cash equivalent
    return sum + cashCost + pointsCost;
  }, 0);
  
  const totalCashCost = activitiesCost + flightsCost + hotelsCost;
  
  // Updated points used logic: multiply by travelers
  const totalPointsUsed = tripFlights.reduce((sum, flight) =>
    sum + ((flight.pricePerPerson.points || 0) * trip.travelers)
  , 0) + tripHotels.reduce((sum, hotel) =>
    sum + ((hotel.totalCost.points || 0))
  , 0);
  
  // Calculate duration and PTO
  const duration = getDaysBetween(trip.startDate, trip.endDate);
  const ptoDaysRequired = calculatePTODays(trip.startDate, trip.endDate);
  
  return {
    trip,
    totalCashCost,
    totalPointsUsed,
    costBreakdown: {
      flights: flightsCost,
      hotels: hotelsCost,
      activities: activitiesCost
    },
    duration,
    ptoDaysRequired
  };
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Points formatting
export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat('en-US').format(points);
};

// URL parsing utilities
export const extractDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return '';
  }
};

export const getSiteIcon = (url: string): string => {
  const domain = extractDomainFromUrl(url);
  
  // Map common travel sites to their icons
  const siteIcons: Record<string, string> = {
    'viator.com': '🎫',
    'airbnb.com': '🏠',
    'booking.com': '🏨',
    'expedia.com': '✈️',
    'kayak.com': '🔍',
    'google.com': '🗺️',
    'tripadvisor.com': '🍽️',
  };
  
  return siteIcons[domain] || '🔗';
};

// Activity category icons
export const getActivityIcon = (category: string): string => {
  const icons: Record<string, string> = {
    tour: '🎫',
    food: '🍽️',
    museum: '🏛️',
    rest: '😴',
    explore: '🗺️',
    shopping: '🛍️',
    transport: '🚗',
    other: '📍'
  };
  
  return icons[category] || '📍';
};

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Local storage utilities
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}; 