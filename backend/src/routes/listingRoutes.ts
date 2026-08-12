import express from 'express';
import {
  checkDuplicates,
  createDraft,
  getAgentStats,
  getDraftById,
  getMyDrafts,
  getMyListings,
  submitForReview,
  updateDraft,
} from '../controllers/listingController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../utils/cloudinary.js';

const router = express.Router();

router.get('/stats', requireAuth, getAgentStats);
router.get('/mine', requireAuth, getMyListings);
router.get('/drafts', requireAuth, getMyDrafts);
router.post('/drafts', requireAuth, upload.array('images', 12), createDraft);
router.get('/drafts/:id', requireAuth, getDraftById);
router.patch('/drafts/:id', requireAuth, upload.array('images', 12), updateDraft);
router.get('/drafts/:id/duplicates', requireAuth, checkDuplicates);
router.post('/drafts/:id/submit', requireAuth, submitForReview);

export default router;
