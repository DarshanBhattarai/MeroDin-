// src/routes/admin.routes.js
import express from 'express';
import {
  adminLogin,
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getSystemLogs,
  getAdmins,
  updateAdminPermissions
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/stats', authenticate, adminOnly, getAdminStats);
router.get('/users', authenticate, adminOnly, getAllUsers);
router.get('/users/:userId', authenticate, adminOnly, getUserDetails);
router.patch('/users/:userId/role', authenticate, adminOnly, updateUserRole);
router.delete('/users/:userId', authenticate, adminOnly, deleteUser);
router.get('/logs', authenticate, adminOnly, getSystemLogs);
router.get('/admins', authenticate, adminOnly, getAdmins);
router.patch('/admins/:userId/permissions', authenticate, adminOnly, updateAdminPermissions);

export default router;