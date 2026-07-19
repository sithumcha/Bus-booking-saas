import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Operator from './models/Operator.js';
import Bus from './models/Bus.js';
import Trip from './models/Trip.js';
import Booking from './models/Booking.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Operator.deleteMany();
    await Bus.deleteMany();
    await Trip.deleteMany();
    await Booking.deleteMany();

    console.log('Existing data cleared.');

    // Create a demo passenger
    await User.create({
      name: 'Demo Passenger',
      email: 'passenger@demo.com',
      password: 'password123',
      phone: '0771234567'
    });

    // Create a demo admin
    await User.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'password123',
      phone: '0777654321',
      role: 'admin'
    });

    // Create a demo operator
    const operator = await Operator.create({
      companyName: 'Superline Travels',
      email: 'operator@demo.com',
      password: 'password123',
      contactNumber: '0112345678',
      isApproved: true
    });

    console.log('Demo Users Created.');

    // Create some example buses
    const buses = await Bus.insertMany([
      {
        operator: operator._id,
        registrationNumber: 'NC-4455',
        type: 'AC Luxury',
        totalSeats: 40,
        seatLayout: '2x2',
        amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket'],
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
        brand: 'Volvo B11R',
        description: 'Premium luxury coach with ample legroom and reclining seats.',
      },
      {
        operator: operator._id,
        registrationNumber: 'WP-8899',
        type: 'Sleeper',
        totalSeats: 30,
        seatLayout: '1x2',
        amenities: ['WiFi', 'Charging Point', 'Pillow', 'Blanket', 'Reading Light'],
        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop',
        brand: 'Scania Metrolink',
        description: 'Night sleeper service designed for maximum comfort on long journeys.',
      },
      {
        operator: operator._id,
        registrationNumber: 'CP-1122',
        type: 'Non-AC',
        totalSeats: 48,
        seatLayout: '2x2',
        amenities: ['Music System'],
        image: 'https://images.unsplash.com/photo-1562620644-66bdc0e97d1b?w=800&auto=format&fit=crop',
        brand: 'Ashok Leyland',
        description: 'Reliable and affordable daily commuter service.',
      }
    ]);

    console.log('Example Buses Inserted.');

    // Create some example trips
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Trip.insertMany([
      {
        bus: buses[0]._id,
        route: { from: 'Colombo', to: 'Kandy' },
        date: tomorrow,
        departureTime: '08:00 AM',
        arrivalTime: '11:30 AM',
        fare: 1500,
        boardingPoints: [
          { location: 'Pettah Bus Stand', time: '08:00 AM' },
          { location: 'Kadawatha Highway Entrance', time: '08:30 AM' }
        ],
        droppingPoints: [
          { location: 'Peradeniya', time: '11:00 AM' },
          { location: 'Kandy Goods Shed', time: '11:30 AM' }
        ],
        bookedSeats: []
      },
      {
        bus: buses[1]._id,
        route: { from: 'Colombo', to: 'Jaffna' },
        date: tomorrow,
        departureTime: '10:00 PM',
        arrivalTime: '06:00 AM',
        fare: 4500,
        boardingPoints: [
          { location: 'Pettah Bus Stand', time: '10:00 PM' },
          { location: 'Negombo', time: '11:00 PM' }
        ],
        droppingPoints: [
          { location: 'Vavuniya', time: '03:00 AM' },
          { location: 'Jaffna Bus Stand', time: '06:00 AM' }
        ],
        bookedSeats: []
      },
      {
        bus: buses[2]._id,
        route: { from: 'Kandy', to: 'Colombo' },
        date: nextWeek,
        departureTime: '06:00 AM',
        arrivalTime: '09:30 AM',
        fare: 800,
        boardingPoints: [
          { location: 'Kandy Goods Shed', time: '06:00 AM' }
        ],
        droppingPoints: [
          { location: 'Kadawatha', time: '09:00 AM' },
          { location: 'Pettah', time: '09:30 AM' }
        ],
        bookedSeats: []
      }
    ]);

    console.log('Example Trips Inserted.');
    console.log('Database successfully seeded!');
    process.exit();

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Can add destroy logic here if needed
  console.log('Destroying data...');
  process.exit();
} else {
  importData();
}
