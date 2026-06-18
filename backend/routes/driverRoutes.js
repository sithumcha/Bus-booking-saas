import express from 'express';
import { getDrivers, addDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { protectOperator } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protectOperator, getDrivers)
  .post(protectOperator, addDriver);

router.route('/:id')
  .put(protectOperator, updateDriver)
  .delete(protectOperator, deleteDriver);

export default router;
