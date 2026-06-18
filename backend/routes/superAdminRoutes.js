import express from 'express';
import { getPlatformStats } from '../controllers/superAdminController.js';
import { protectUser, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protectUser, admin, getPlatformStats);

export default router;
