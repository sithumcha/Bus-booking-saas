import express from 'express';
const router = express.Router();
import {
  createTrip,
  getOperatorTrips,
  searchTrips,
  getTripById,
  cancelTrip,
  updateTripLocation,
  getTripLocation,
  updateTrip
} from '../controllers/tripController.js';
import { protectOperator } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protectOperator, createTrip)
  .get(searchTrips);

router.route('/operator').get(protectOperator, getOperatorTrips);

router.route('/:id/cancel').put(protectOperator, cancelTrip);
router.route('/:id/location')
  .put(protectOperator, updateTripLocation)
  .get(getTripLocation);

router.route('/:id')
  .get(getTripById)
  .put(protectOperator, updateTrip);

export default router;
