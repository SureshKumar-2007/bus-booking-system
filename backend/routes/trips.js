import express from 'express';
import { Trip } from '../data/db.js';

const router = express.Router();

const buildSearchResult = (trip) => ({
  id: trip._id,
  operator: trip.operator,
  type: trip.type,
  departure: trip.departure,
  arrival: trip.arrival,
  duration: trip.duration,
  rating: trip.rating,
  price: `₹${trip.price}`,
  seatsLeft: trip.seatMap.filter((seat) => seat.status === 'available').length,
  busNumber: trip.busNumber,
  route: trip.route,
});

router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;
    const normalizedFrom = String(from || '').trim().toLowerCase();
    const normalizedTo = String(to || '').trim().toLowerCase();

    const filter = {};
    if (normalizedFrom) {
      filter.from = { $regex: normalizedFrom, $options: 'i' };
    }
    if (normalizedTo) {
      filter.to = { $regex: normalizedTo, $options: 'i' };
    }

    const trips = await Trip.find(filter);
    const results = trips.map(buildSearchResult);

    return res.json({ filters: { from: from || '', to: to || '' }, results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    return res.json({
      ...trip.toObject(),
      id: trip._id,
      price: `₹${trip.price}`,
      rawPrice: trip.price,
      seatsLeft: trip.seatMap.filter((seat) => seat.status === 'available').length,
    });
  } catch (error) {
    console.error('Trip details error:', error);
    return res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

router.get('/seats/:tripId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    return res.json({
      id: trip._id,
      operator: trip.operator,
      route: trip.route,
      departure: trip.departure,
      arrival: trip.arrival,
      price: trip.price,
      currency: trip.currency,
      seatMap: trip.seatMap,
      seatsLeft: trip.seatMap.filter((seat) => seat.status === 'available').length,
    });
  } catch (error) {
    console.error('Seats error:', error);
    return res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

export default router;
