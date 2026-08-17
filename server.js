import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ==========================================
// IN-MEMORY DATABASE
// ==========================================
let stations = [
  {
    id: "st_101",
    name: "City Central Fast Charge",
    address: "100 Main Road, City Center",
    chargeType: "DC Fast",
    availablePorts: 4,
    lat: 12.2958,
    lng: 76.6394
  },
  {
    id: "st_102",
    name: "Downtown EV Hub",
    address: "45 Commercial Street",
    chargeType: "Level 2",
    availablePorts: 12,
    lat: 12.3100,
    lng: 76.6500
  },
  {
    id: "st_103",
    name: "Highway Express Station",
    address: "Toll Plaza, Bypass Road",
    chargeType: "DC Ultra-Fast",
    availablePorts: 2,
    lat: 12.3500,
    lng: 76.6100
  }
];

// Array to hold bookings and the counter for bk_EVB001, 002, etc.
let bookings = [];
let bookingCounter = 1; 

// ==========================================
// DISTANCE MATH FORMULA
// ==========================================
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// ==========================================
// STATIONS API
// ==========================================
app.get('/api/stations', (req, res) => {
  const { chargeType, userLat, userLng } = req.query;
  let results = stations.map(s => ({ ...s }));
  
  if (chargeType) {
    results = results.filter(s => s.chargeType === chargeType);
  }

  // Calculate distance if user location is known
  if (userLat && userLng) {
    results.forEach(station => {
      const distance = getDistanceFromLatLonInKm(
        parseFloat(userLat), parseFloat(userLng), station.lat, station.lng
      );
      station.distanceAway = distance.toFixed(1);
    });
    // Sort closest to furthest
    results.sort((a, b) => parseFloat(a.distanceAway) - parseFloat(b.distanceAway));
  }
  
  res.json(results);
});

// ==========================================
// BOOKINGS API
// ==========================================
app.post('/api/bookings', (req, res) => {
  const { stationId, userName, vehicleModel, date, startTime, endTime } = req.body;

  if (!stationId || !userName || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required booking fields." });
  }

  const stationExists = stations.some(s => s.id === stationId);
  if (!stationExists) {
    return res.status(404).json({ error: "Selected station does not exist." });
  }

  // Generate the consecutive ID: bk_EVB001
  const formattedNumber = String(bookingCounter).padStart(3, '0');
  const newBookingId = `bk_EVB${formattedNumber}`;
  bookingCounter++; // Increment for the next person

  const newBooking = {
    id: newBookingId,
    stationId,
    userName,
    vehicleModel,
    date,
    startTime,
    endTime,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);

  res.status(201).json({ 
    message: "Booking confirmed!", 
    booking: newBooking 
  });
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// DELETE a booking completely
app.delete('/api/bookings/:id', (req, res) => {
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  bookings.splice(bookingIndex, 1); // Permanently delete from array
  
  res.json({ message: "Booking deleted completely" });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});