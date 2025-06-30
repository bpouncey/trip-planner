import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

async function testAmadeusAPI() {
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.error('Amadeus API credentials not set');
    return;
  }

  try {
    // Get access token
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
    });
    
    if (!tokenRes.ok) {
      const errorData = await tokenRes.text();
      console.error('Amadeus token error:', errorData);
      return;
    }
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    
    // Test flight lookup for AA1441 on 2026-04-25
    const url = `https://test.api.amadeus.com/v2/schedule/flights?carrierCode=AA&flightNumber=1441&scheduledDepartureDate=2026-04-25`;
    
    console.log('Calling Amadeus API:', url);
    
    const flightRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!flightRes.ok) {
      const errorData = await flightRes.text();
      console.error('Amadeus flight lookup error:', errorData);
      return;
    }
    
    const flightData = await flightRes.json();
    console.log('Amadeus API Response:');
    console.log(JSON.stringify(flightData, null, 2));
    
    // Check if we have multiple flights
    if (Array.isArray(flightData)) {
      console.log(`\nFound ${flightData.length} flights`);
      flightData.forEach((flight, index) => {
        console.log(`\nFlight ${index + 1}:`);
        if (flight.flightPoints && flight.flightPoints.length >= 2) {
          const dep = flight.flightPoints[0];
          const arr = flight.flightPoints[flight.flightPoints.length - 1];
          console.log(`  ${dep.iataCode} → ${arr.iataCode}`);
        }
      });
    } else if (flightData.data && Array.isArray(flightData.data)) {
      console.log(`\nFound ${flightData.data.length} flights in data property`);
      flightData.data.forEach((flight, index) => {
        console.log(`\nFlight ${index + 1}:`);
        if (flight.flightPoints && flight.flightPoints.length >= 2) {
          const dep = flight.flightPoints[0];
          const arr = flight.flightPoints[flight.flightPoints.length - 1];
          console.log(`  ${dep.iataCode} → ${arr.iataCode}`);
        }
      });
    } else {
      console.log('\nUnexpected response format');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAmadeusAPI(); 