import Bus from '../models/Bus.js';

// @desc    Add a new bus
// @route   POST /api/buses
// @access  Private/Operator
export const addBus = async (req, res) => {
  try {
    const { 
      registrationNumber, type, totalSeats, seatLayout, amenities, image, brand, description,
      routeFrom, routeTo, date, departureTime, arrivalTime, fare, boardingPointLocation, droppingPointLocation 
    } = req.body;

    const busExists = await Bus.findOne({ registrationNumber });
    if (busExists) {
      return res.status(400).json({ message: 'Bus with this registration already exists' });
    }

    const bus = await Bus.create({
      operator: req.operator._id,
      registrationNumber,
      type,
      totalSeats,
      seatLayout,
      amenities,
      image,
      brand,
      description,
      routeFrom,
      routeTo,
      departureTime,
      arrivalTime,
      ticketPrice: fare
    });

    res.status(201).json(bus);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Get all buses for logged in operator
// @route   GET /api/buses
// @access  Private/Operator
export const getOperatorBuses = async (req, res) => {
  try {
    let buses;
    if (req.operator.isAdmin) {
      buses = await Bus.find({});
    } else {
      buses = await Bus.find({ operator: req.operator._id });
    }
    res.json(buses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all public buses
// @route   GET /api/buses/all
// @access  Public
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({}).populate('operator', 'companyName name');
    res.json(buses);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private/Operator
export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
      // Ensure the operator owns the bus
      if (!req.operator.isAdmin && bus.operator.toString() !== req.operator._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this bus' });
      }

      bus.registrationNumber = req.body.registrationNumber || bus.registrationNumber;
      bus.type = req.body.type || bus.type;
      bus.totalSeats = req.body.totalSeats || bus.totalSeats;
      bus.seatLayout = req.body.seatLayout || bus.seatLayout;
      bus.amenities = req.body.amenities || bus.amenities;
      bus.image = req.body.image !== undefined ? req.body.image : bus.image;
      bus.brand = req.body.brand !== undefined ? req.body.brand : bus.brand;
      bus.description = req.body.description !== undefined ? req.body.description : bus.description;
      bus.routeFrom = req.body.routeFrom !== undefined ? req.body.routeFrom : bus.routeFrom;
      bus.routeTo = req.body.routeTo !== undefined ? req.body.routeTo : bus.routeTo;
      bus.departureTime = req.body.departureTime !== undefined ? req.body.departureTime : bus.departureTime;
      bus.arrivalTime = req.body.arrivalTime !== undefined ? req.body.arrivalTime : bus.arrivalTime;
      bus.ticketPrice = req.body.ticketPrice !== undefined ? req.body.ticketPrice : bus.ticketPrice;

      const updatedBus = await bus.save();
      res.json(updatedBus);
    } else {
      return res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private/Operator
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
      if (!req.operator.isAdmin && bus.operator.toString() !== req.operator._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this bus' });
      }

      await bus.deleteOne();
      res.json({ message: 'Bus removed' });
    } else {
      return res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
