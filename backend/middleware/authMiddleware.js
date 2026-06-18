import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Operator from '../models/Operator.js';

export const protectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        const operator = await Operator.findById(decoded.id).select('-password');
        if (operator) {
          return res.status(403).json({ message: 'Operators and agents are not allowed to book seats' });
        }
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const protectOperator = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.operator = await Operator.findById(decoded.id).select('-password');
      
      if (!req.operator) {
        // Check if it's an admin user
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.role === 'admin') {
          // Mock operator for admin so they can see all data
          req.operator = { _id: null, isAdmin: true };
          return next();
        }
        return res.status(401).json({ message: 'Not authorized, operator not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
