import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Operator'
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['AC Luxury', 'Non-AC', 'Sleeper', 'Semi-Sleeper'],
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seatLayout: {
    // Basic representation: e.g., '2x2', '1x2'
    type: String,
    required: true
  },
  amenities: {
    type: [String] // e.g., ['WiFi', 'Charging Point', 'Water Bottle']
  },
  image: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  routeFrom: {
    type: String,
    default: ''
  },
  routeTo: {
    type: String,
    default: ''
  },
  departureTime: {
    type: String,
    default: ''
  },
  arrivalTime: {
    type: String,
    default: ''
  },
  ticketPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Bus = mongoose.model('Bus', busSchema);

export default Bus;
