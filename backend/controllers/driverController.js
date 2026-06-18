import Driver from '../models/Driver.js';

// @desc    Get all drivers for operator
// @route   GET /api/drivers
// @access  Private/Operator
export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ operator: req.operator._id }).populate('assignedBus', 'registrationNumber brand');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching drivers', error: error.message });
  }
};

// @desc    Add a new driver
// @route   POST /api/drivers
// @access  Private/Operator
export const addDriver = async (req, res) => {
  try {
    const { name, licenseNumber, phone, assignedBus } = req.body;
    
    const driverExists = await Driver.findOne({ licenseNumber });
    if (driverExists) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driver = await Driver.create({
      operator: req.operator._id,
      name,
      licenseNumber,
      phone,
      assignedBus: assignedBus || null
    });

    const populatedDriver = await Driver.findById(driver._id).populate('assignedBus', 'registrationNumber brand');
    res.status(201).json(populatedDriver);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating driver', error: error.message });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private/Operator
export const updateDriver = async (req, res) => {
  try {
    const { name, licenseNumber, phone, status, assignedBus } = req.body;
    
    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Ensure driver belongs to operator
    if (driver.operator.toString() !== req.operator._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    driver.name = name || driver.name;
    driver.licenseNumber = licenseNumber || driver.licenseNumber;
    driver.phone = phone || driver.phone;
    driver.status = status || driver.status;
    driver.assignedBus = assignedBus !== undefined ? assignedBus : driver.assignedBus;

    const updatedDriver = await driver.save();
    const populatedDriver = await Driver.findById(updatedDriver._id).populate('assignedBus', 'registrationNumber brand');

    res.json(populatedDriver);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating driver', error: error.message });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private/Operator
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.operator.toString() !== req.operator._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await driver.deleteOne();
    res.json({ message: 'Driver removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting driver', error: error.message });
  }
};
