// Use OpenFlights JSON data for lookups
import airlines from '../data/airlines.json';
import airports from '../data/airports.json';

// Get airline info by IATA code (OpenFlights JSON structure)
export function getAirlineInfo(iataCode: string) {
  if (!iataCode) return null;
  const code = iataCode.toUpperCase();
  // The IATA code is under the '-' key, name under 'Unknown', country under '\\N'
  const airline = (airlines as any[]).find(a => a["-"] === code);
  if (!airline) return null;
  const name = airline["Unknown"];
  const country = airline["\\N"];
  const iata = airline["-"];
  // AirHex logo CDN
  const logoUrl = iata ? `https://content.airhex.com/content/logos/airlines_${iata}_350_100_r.png` : '';
  return {
    name,
    iata,
    country,
    logoUrl,
  };
}

// Get airport info by IATA code
export function getAirportInfo(iataCode: string) {
  if (!iataCode) return null;
  const airport = (airports as any[]).find(a => a.iata === iataCode.toUpperCase() || a.IATA === iataCode.toUpperCase() || a[4] === iataCode.toUpperCase());
  if (!airport) return null;
  // OpenFlights: [ID, Name, City, Country, IATA, ICAO, ...]
  const name = airport.name || airport.Name || airport[1];
  const city = airport.city || airport.City || airport[2];
  const country = airport.country || airport.Country || airport[3];
  const iata = airport.iata || airport.IATA || airport[4];
  return {
    name,
    city,
    country,
    iata,
  };
} 