import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  authOperator,
  registerOperator,
  updateUserProfile,
  updateOperatorProfile,
} from '../controllers/authController.js';
import { protectUser, protectOperator } from '../middleware/authMiddleware.js';

router.post('/login', authUser);
router.post('/register', registerUser);
router.route('/profile').put(protectUser, updateUserProfile);

router.post('/operator/login', authOperator);
router.post('/operator/register', registerOperator);
router.route('/operator/profile').put(protectOperator, updateOperatorProfile);

export default router;

