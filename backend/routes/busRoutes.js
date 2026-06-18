import express from 'express';
const router = express.Router();
import {
  addBus,
  getOperatorBuses,
  updateBus,
  deleteBus,
  getAllBuses
} from '../controllers/busController.js';
import { protectOperator } from '../middleware/authMiddleware.js';

router.get('/all', getAllBuses);

router.route('/')
  .post(protectOperator, addBus)
  .get(protectOperator, getOperatorBuses);

router.route('/:id')
  .put(protectOperator, updateBus)
  .delete(protectOperator, deleteBus);

export default router;
