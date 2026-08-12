import express from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  recordPropertyLead,
  recordPropertyView,
} from '../controllers/propertyController.js';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController.js';
import upload from '../utils/cloudinary.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/favorites/me', requireAuth, getMyFavorites);
router.get('/:id', optionalAuth, getPropertyById);
router.post('/:id/view', recordPropertyView);
router.post('/:id/leads', optionalAuth, recordPropertyLead);
router.post('/:id/favorite', requireAuth, toggleFavorite);
router.post('/', requireAuth, upload.array('images', 12), createProperty);

export default router;
