import User from '../models/User.js';
import Operator from '../models/Operator.js';
import Booking from '../models/Booking.js';
import Bus from '../models/Bus.js';
import Trip from '../models/Trip.js';

// @desc    Get Super Admin Platform Stats
// @route   GET /api/superadmin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    // 1. Get all operators
    const operators = await Operator.find().select('-password');
    
    // 2. Calculate Total Revenue & Commission
    // Assuming 5% commission for the platform
    const COMMISSION_RATE = 0.05;
    const bookings = await Booking.find();
    
    let totalGMV = 0;
    let totalCommission = 0;
    
    bookings.forEach(b => {
      totalGMV += b.totalAmount;
      totalCommission += (b.totalAmount * COMMISSION_RATE);
    });

    // 3. Count Entities
    const totalBuses = await Bus.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const totalPassengers = await User.countDocuments();

    // 4. Operator Specific Stats
    const operatorStats = [];
    for (const operator of operators) {
      const operatorBuses = await Bus.countDocuments({ operator: operator._id });
      const operatorTrips = await Trip.countDocuments({ bus: { $in: await Bus.find({operator: operator._id}).select('_id') } });
      const operatorBookings = await Booking.find({ bus: { $in: await Bus.find({operator: operator._id}).select('_id') } });
      
      const opRevenue = operatorBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      
      operatorStats.push({
        _id: operator._id,
        companyName: operator.companyName || operator.name,
        email: operator.email,
        busesCount: operatorBuses,
        tripsCount: operatorTrips,
        totalRevenue: opRevenue,
        commissionGenerated: opRevenue * COMMISSION_RATE
      });
    }

    res.json({
      global: {
        totalOperators: operators.length,
        totalPassengers,
        totalBuses,
        totalTrips,
        totalGMV,
        totalCommission
      },
      operators: operatorStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching platform stats', error: error.message });
  }
};
