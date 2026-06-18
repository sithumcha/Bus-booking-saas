import User from '../models/User.js';
import Operator from '../models/Operator.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  console.log("REGISTER USER REQ.BODY:", req.body);
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: req.body.role || 'passenger',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Auth operator & get token
// @route   POST /api/auth/operator/login
// @access  Public
export const authOperator = async (req, res) => {
  const { email, password } = req.body;

  const operator = await Operator.findOne({ email });

  if (operator && (await operator.matchPassword(password))) {
    res.json({
      _id: operator._id,
      companyName: operator.companyName,
      email: operator.email,
      contactNumber: operator.contactNumber,
      role: operator.role,
      isApproved: operator.isApproved,
      token: generateToken(operator._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new operator
// @route   POST /api/auth/operator/register
// @access  Public
export const registerOperator = async (req, res) => {
  const { companyName, email, password, contactNumber } = req.body;

  const operatorExists = await Operator.findOne({ email });

  if (operatorExists) {
    res.status(400);
    throw new Error('Operator already exists');
  }

  const operator = await Operator.create({
    companyName,
    email,
    password,
    contactNumber,
  });

  if (operator) {
    res.status(201).json({
      _id: operator._id,
      companyName: operator.companyName,
      email: operator.email,
      contactNumber: operator.contactNumber,
      role: operator.role,
      isApproved: operator.isApproved,
      token: generateToken(operator._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid operator data');
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private/User
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update operator profile
// @route   PUT /api/auth/operator/profile
// @access  Private/Operator
export const updateOperatorProfile = async (req, res) => {
  try {
    const operator = await Operator.findById(req.operator._id);

    if (operator) {
      operator.companyName = req.body.companyName || operator.companyName;
      operator.contactNumber = req.body.contactNumber || operator.contactNumber;

      if (req.body.password) {
        operator.password = req.body.password;
      }

      const updatedOperator = await operator.save();

      res.json({
        _id: updatedOperator._id,
        companyName: updatedOperator.companyName,
        email: updatedOperator.email,
        contactNumber: updatedOperator.contactNumber,
        role: updatedOperator.role,
        isApproved: updatedOperator.isApproved,
        token: generateToken(updatedOperator._id),
      });
    } else {
      res.status(404);
      throw new Error('Operator not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

