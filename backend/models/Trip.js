import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  time: {
    type: String, // e.g., '10:00 AM'
    required: true
  }
});

const tripSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bus'
  },
  route: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  date: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  boardingPoints: [pointSchema],
  droppingPoints: [pointSchema],
  bookedSeats: {
    type: [String], // Array of seat numbers like ['1A', '1B']
    default: []
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    speed: { type: Number },
    lastUpdated: { type: Date }
  }
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
