import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';

const CITIES = {
  'Colombo': [6.9271, 79.8612],
  'Kandy': [7.2906, 80.6337],
  'Jaffna': [9.6615, 80.0255],
  'Galle': [6.0535, 80.2210],
  'Trincomalee': [8.5874, 81.2152]
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private/Operator
export const createTrip = async (req, res) => {
  try {
    const {
      busId,
      route,
      date,
      departureTime,
      arrivalTime,
      fare,
      boardingPoints,
      droppingPoints
    } = req.body;

    // Verify bus exists and belongs to operator
    const bus = await Bus.findById(busId);
    if (!bus || (!req.operator.isAdmin && bus.operator.toString() !== req.operator._id.toString())) {
      res.status(404);
      throw new Error('Bus not found or unauthorized');
    }

    const startCity = route?.from || 'Colombo';
    const startCoords = CITIES[startCity] || [6.9271, 79.8612];

    const trip = await Trip.create({
      bus: busId,
      route,
      date,
      departureTime,
      arrivalTime,
      fare,
      boardingPoints,
      droppingPoints,
      currentLocation: {
        lat: startCoords[0],
        lng: startCoords[1],
        speed: 0,
        lastUpdated: new Date()
      }
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get all trips for logged in operator
// @route   GET /api/trips/operator
// @access  Private/Operator
export const getOperatorTrips = async (req, res) => {
  try {
    let trips;
    if (req.operator.isAdmin) {
      trips = await Trip.find({}).populate('bus');
    } else {
      // Find all buses owned by operator
      const buses = await Bus.find({ operator: req.operator._id }).select('_id');
      const busIds = buses.map(bus => bus._id);

      // Find trips for these buses
      trips = await Trip.find({ bus: { $in: busIds } }).populate('bus');
    }
    const validTrips = trips.filter(trip => trip.bus !== null);
    res.json(validTrips);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Search trips (Public)
// @route   GET /api/trips
// @access  Public
export const searchTrips = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    let query = {};
    if (from) query['route.from'] = new RegExp(from, 'i');
    if (to) query['route.to'] = new RegExp(to, 'i');
    
    if (date) {
      const searchDate = new Date(date);
      // set to beginning and end of day
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    // Only fetch scheduled trips
    query.status = 'Scheduled';

    const trips = await Trip.find(query).populate('bus');
    const validTrips = trips.filter(trip => trip.bus !== null);
    res.json(validTrips);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('bus');
    if (trip) {
      res.json(trip);
    } else {
      res.status(404);
      throw new Error('Trip not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Cancel a scheduled trip
// @route   PUT /api/trips/:id/cancel
// @access  Private/Operator
export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('bus');
    
    if (trip) {
      // Ensure the operator owns the bus for this trip
      if (!req.operator.isAdmin && trip.bus.operator.toString() !== req.operator._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to cancel this trip');
      }

      trip.status = 'Cancelled';
      const updatedTrip = await trip.save();
      res.json(updatedTrip);
    } else {
      res.status(404);
      throw new Error('Trip not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update trip live location (Driver/Operator)
// @route   PUT /api/trips/:id/location
// @access  Private/Operator
export const updateTripLocation = async (req, res) => {
  try {
    const { lat, lng, speed } = req.body;
    const trip = await Trip.findById(req.params.id).populate('bus');

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    if (!req.operator.isAdmin && trip.bus.operator.toString() !== req.operator._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this trip location');
    }

    trip.currentLocation = {
      lat,
      lng,
      speed: speed || 0,
      lastUpdated: new Date()
    };

    await trip.save();
    res.json({ message: 'Location updated', currentLocation: trip.currentLocation });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get trip live location (Passenger)
// @route   GET /api/trips/:id/location
// @access  Public (or Private Passenger)
export const getTripLocation = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).select('currentLocation status');

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    res.json({ 
      currentLocation: trip.currentLocation,
      status: trip.status
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update a trip details
// @route   PUT /api/trips/:id
// @access  Private/Operator
export const updateTrip = async (req, res) => {
  try {
    const {
      busId,
      route,
      date,
      departureTime,
      arrivalTime,
      fare,
      boardingPoints,
      droppingPoints
    } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    // Verify bus exists and belongs to operator (or admin bypass)
    const bus = await Bus.findById(busId || trip.bus);
    if (!bus || (!req.operator.isAdmin && bus.operator.toString() !== req.operator._id.toString())) {
      res.status(404);
      throw new Error('Bus not found or unauthorized');
    }

    trip.bus = busId || trip.bus;
    trip.route = route || trip.route;
    trip.date = date || trip.date;
    trip.departureTime = departureTime || trip.departureTime;
    trip.arrivalTime = arrivalTime || trip.arrivalTime;
    trip.fare = fare || trip.fare;
    if (boardingPoints) trip.boardingPoints = boardingPoints;
    if (droppingPoints) trip.droppingPoints = droppingPoints;

    // If route starting city changes, update currentLocation coordinate defaults
    if (route && route.from) {
      const startCity = route.from;
      const startCoords = CITIES[startCity];
      if (startCoords) {
        trip.currentLocation = {
          lat: startCoords[0],
          lng: startCoords[1],
          speed: 0,
          lastUpdated: new Date()
        };
      }
    }

    const updatedTrip = await trip.save();
    const populatedTrip = await Trip.findById(updatedTrip._id).populate('bus');
    res.json(populatedTrip);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};
