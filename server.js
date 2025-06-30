import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Flight lookup endpoint
app.post('/flight-lookup', async (req, res) => {
  const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
  const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

  console.log('AMADEUS_API_KEY:', AMADEUS_API_KEY ? '***' : 'NOT SET');
  console.log('AMADEUS_API_SECRET:', AMADEUS_API_SECRET ? '***' : 'NOT SET');

  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    return res.status(500).json({ 
      error: 'Amadeus API credentials not configured. Please set AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables.' 
    });
  }

  async function getAmadeusAccessToken() {
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
      throw new Error(`Failed to get Amadeus access token: ${tokenRes.status} ${tokenRes.statusText}`);
    }
    
    const data = await tokenRes.json();
    return data.access_token;
  }

  const { flightNumber, date } = req.body;
  
  if (!flightNumber || !date) {
    return res.status(400).json({ error: 'Missing flightNumber or date' });
  }

  try {
    const accessToken = await getAmadeusAccessToken();
    
    // Split flight number into airline code and number (e.g., AA123 -> AA, 123)
    const match = flightNumber.match(/([A-Za-z]{2})(\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid flight number format. Expected format: AA123' });
    }
    
    const airlineCode = match[1].toUpperCase();
    const flightNum = match[2];
    
    // Call Amadeus Flight Status API
    const url = `https://test.api.amadeus.com/v2/schedule/flights?carrierCode=${airlineCode}&flightNumber=${flightNum}&scheduledDepartureDate=${date}`;
    
    console.log('Calling Amadeus API:', url);
    
    const flightRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!flightRes.ok) {
      const errorData = await flightRes.text();
      console.error('Amadeus flight lookup error:', errorData);
      return res.status(flightRes.status).json({ 
        error: `Amadeus API error: ${flightRes.status} ${flightRes.statusText}`,
        details: errorData
      });
    }
    
    const flightData = await flightRes.json();
    console.log('Amadeus response:', JSON.stringify(flightData, null, 2));
    
    return res.status(200).json(flightData);
  } catch (error) {
    console.error('Flight lookup error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Make sure to set AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables');
}); 