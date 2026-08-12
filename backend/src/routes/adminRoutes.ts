import express from 'express';
import {
  approveProperty,
  deleteProperty,
  getAgentAnalytics,
  getAllPropertiesAdmin,
  getPropertyAdminById,
  manageUsers,
  rejectProperty,
  requestChanges,
  updatePropertyStatus,
  updateUserRole,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/properties', requireAuth, requireAdmin, getAllPropertiesAdmin);
router.get('/properties/:id', requireAuth, requireAdmin, getPropertyAdminById);
router.post('/properties/:id/approve', requireAuth, requireAdmin, approveProperty);
router.post('/properties/:id/reject', requireAuth, requireAdmin, rejectProperty);
router.post('/properties/:id/request-changes', requireAuth, requireAdmin, requestChanges);
router.patch('/properties/:id', requireAuth, requireAdmin, updatePropertyStatus);
router.delete('/properties/:id', requireAuth, requireAdmin, deleteProperty);
router.get('/analytics/agents', requireAuth, requireAdmin, getAgentAnalytics);
router.get('/users', requireAuth, requireAdmin, manageUsers);
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole);

export default router;
