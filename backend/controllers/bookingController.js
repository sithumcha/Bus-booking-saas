import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/User
export const createBooking = async (req, res) => {
  try {
    const {
      tripId,
      passengers,
      totalAmount,
      boardingPoint,
      droppingPoint,
      paymentMethod // To be implemented with Stripe/etc later
    } = req.body;

    if (passengers && passengers.length === 0) {
      res.status(400);
      throw new Error('No passengers provided');
    }

    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    // Check if seats are already booked
    const requestedSeats = passengers.map(p => p.seatNumber);
    const alreadyBooked = requestedSeats.some(seat => trip.bookedSeats.includes(seat));

    if (alreadyBooked) {
      res.status(400);
      throw new Error('One or more selected seats are already booked');
    }

    const booking = new Booking({
      user: req.user._id,
      trip: tripId,
      passengers,
      totalAmount,
      boardingPoint,
      droppingPoint,
      paymentStatus: 'Completed', // Simulating successful payment for now
      bookingStatus: 'Confirmed'
    });

    const createdBooking = await booking.save();

    // Update trip with booked seats
    trip.bookedSeats.push(...requestedSeats);
    await trip.save();

    // Optionally send email
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmation - Bus Booking SaaS',
        message: `Your booking for ${trip.route.from} to ${trip.route.to} is confirmed. Booking ID: ${createdBooking._id}`
      });
    } catch (error) {
      console.error('Email could not be sent', error);
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private/User
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate({
      path: 'trip',
      populate: {
        path: 'bus'
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private/User
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'trip',
        populate: {
          path: 'bus'
        }
      });

    if (booking) {
      // Check if the user owns the booking
      if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         res.status(401);
         throw new Error('Not authorized to view this booking');
      }
      res.json(booking);
    } else {
      res.status(404);
      throw new Error('Booking not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get bookings for operator's trips (manifest)
// @route   GET /api/bookings/operator
// @access  Private/Operator
export const getOperatorBookings = async (req, res) => {
  try {
    let bookings;
    if (req.operator.isAdmin) {
      bookings = await Booking.find({})
        .populate('user', 'name email phone')
        .populate({
          path: 'trip',
          populate: {
            path: 'bus',
            model: 'Bus'
          }
        });
    } else {
      const buses = await Bus.find({ operator: req.operator._id }).select('_id');
      const busIds = buses.map(bus => bus._id);

      const trips = await Trip.find({ bus: { $in: busIds } }).select('_id');
      const tripIds = trips.map(trip => trip._id);

      bookings = await Booking.find({ trip: { $in: tripIds } })
        .populate('user', 'name email phone')
        .populate({
          path: 'trip',
          populate: {
            path: 'bus',
            model: 'Bus'
          }
        });
    }
    res.json(bookings);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

