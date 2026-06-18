import express from 'express';
const router = express.Router();
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getOperatorBookings
} from '../controllers/bookingController.js';
import { protectUser, protectOperator } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protectUser, createBooking);

router.route('/mybookings')
  .get(protectUser, getMyBookings);

router.route('/operator')
  .get(protectOperator, getOperatorBookings);

router.route('/:id')
  .get(protectUser, getBookingById);

export default router;

