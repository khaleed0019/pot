import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  cancelDeal,
  confirmDeal,
  createDeal,
  getDeal,
  listMyDeals,
  updateDeal,
} from '../controllers/dealController.js';

const router = express.Router();
router.use(requireAuth);

router.post('/', createDeal);
router.get('/mine', listMyDeals);
router.get('/:id', getDeal);
router.patch('/:id', updateDeal);
router.post('/:id/confirm', confirmDeal);
router.post('/:id/cancel', cancelDeal);

export default router;
