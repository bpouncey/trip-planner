const fs = require('fs');
const readline = require('readline');

const inputPath = 'src/data/airports.csv';
const outputPath = 'src/data/airports.json';

const headers = [
  'AirportID', 'Name', 'City', 'Country', 'IATA', 'ICAO', 'Latitude', 'Longitude', 'Altitude', 'Timezone', 'DST', 'TzDatabase', 'Type', 'Source'
];

async function convert() {
  const fileStream = fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  const airports = [];

  for await (const line of rl) {
    // Split CSV line, handling quoted commas
    const cols = line.match(/(?:"[^"]*"|[^,])+/g)?.map(s => s.replace(/^"|"$/g, '')) || [];
    if (cols.length < 5) continue;
    const iata = cols[4];
    if (!iata || iata === '\\N') continue;
    airports.push({
      name: cols[1],
      city: cols[2],
      country: cols[3],
      iata,
      icao: cols[5],
      lat: cols[6],
      lon: cols[7],
      tz: cols[11],
    });
  }
  fs.writeFileSync(outputPath, JSON.stringify(airports, null, 2));
  console.log(`Wrote ${airports.length} airports to ${outputPath}`);
}

convert(); 