import mongoose from 'mongoose';

const passengerDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  seatNumber: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Trip'
  },
  passengers: [passengerDetailSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  boardingPoint: {
    location: { type: String, required: true },
    time: { type: String, required: true }
  },
  droppingPoint: {
    location: { type: String, required: true },
    time: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed'
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
