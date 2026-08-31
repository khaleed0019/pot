import express from 'express';
import {
  approveProperty,
  deleteProperty,
  deleteUser,
  getAgentAnalytics,
  getAllPropertiesAdmin,
  getPropertyAdminById,
  manageUsers,
  rejectProperty,
  requestChanges,
  updatePropertyDiscount,
  updatePropertyStatus,
  updateUserRole,
  updateUserSuspension,
} from '../controllers/adminController.js';
import {
  createAddress,
  createGuideImage,
  deleteAddress,
  deleteGuideImage,
  listAddresses,
  listGuideImages,
  listPayments,
  removeAddressQr,
  reviewPayment,
  updateAddress,
  uploadAddressQr,
} from '../controllers/adminCryptoController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import upload, { withCloudinaryUpload } from '../utils/cloudinary.js';

const router = express.Router();

router.get('/properties', requireAuth, requireAdmin, getAllPropertiesAdmin);
router.get('/properties/:id', requireAuth, requireAdmin, getPropertyAdminById);
router.post('/properties/:id/approve', requireAuth, requireAdmin, approveProperty);
router.post('/properties/:id/reject', requireAuth, requireAdmin, rejectProperty);
router.post('/properties/:id/request-changes', requireAuth, requireAdmin, requestChanges);
router.patch('/properties/:id', requireAuth, requireAdmin, updatePropertyStatus);
router.patch('/properties/:id/discount', requireAuth, requireAdmin, updatePropertyDiscount);
router.delete('/properties/:id', requireAuth, requireAdmin, deleteProperty);
router.get('/analytics/agents', requireAuth, requireAdmin, getAgentAnalytics);
router.get('/users', requireAuth, requireAdmin, manageUsers);
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole);
router.patch('/users/:id/suspend', requireAuth, requireAdmin, updateUserSuspension);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);

router.get('/crypto/addresses', requireAuth, requireAdmin, listAddresses);
router.post('/crypto/addresses', requireAuth, requireAdmin, createAddress);
router.patch('/crypto/addresses/:id', requireAuth, requireAdmin, updateAddress);
router.delete('/crypto/addresses/:id', requireAuth, requireAdmin, deleteAddress);
router.post('/crypto/addresses/:id/qr', requireAuth, requireAdmin, withCloudinaryUpload(upload.single('qrImage')), uploadAddressQr);
router.delete('/crypto/addresses/:id/qr', requireAuth, requireAdmin, removeAddressQr);
router.get('/crypto/payments', requireAuth, requireAdmin, listPayments);
router.patch('/crypto/payments/:id', requireAuth, requireAdmin, reviewPayment);
router.get('/crypto/guide', requireAuth, requireAdmin, listGuideImages);
router.post('/crypto/guide', requireAuth, requireAdmin, withCloudinaryUpload(upload.single('image')), createGuideImage);
router.delete('/crypto/guide/:id', requireAuth, requireAdmin, deleteGuideImage);

export default router;
