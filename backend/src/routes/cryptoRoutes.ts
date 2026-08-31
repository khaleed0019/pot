import express from 'express';
import { getGuide, listMyPayments, requestAddress, submitPayment } from '../controllers/cryptoController.js';
import { requireAuth } from '../middleware/auth.js';
import upload, { withCloudinaryUpload } from '../utils/cloudinary.js';

const router = express.Router();

// Public — a visitor deciding whether to buy shouldn't need an account to see the guide.
router.get('/guide', getGuide);

router.get('/address/:network', requireAuth, requestAddress);
router.post('/payments', requireAuth, withCloudinaryUpload(upload.single('proof')), submitPayment);
router.get('/payments/mine', requireAuth, listMyPayments);

export default router;
