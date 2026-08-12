import express from 'express';
import { getMe, syncUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/sync', syncUser);
router.get('/me', requireAuth, getMe);

export default router;
