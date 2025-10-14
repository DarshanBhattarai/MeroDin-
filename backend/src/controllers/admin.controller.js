// src/controllers/admin.controller.js
import adminService from "../services/admin.service.js";
import { generateAccessToken, generateRefreshToken } from "../utils/auth.js";
import { ValidationError } from "../utils/errors.js";

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Authenticate admin using service
    const user = await adminService.authenticateAdmin(email, password);

    // Generate tokens
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      role: user.role 
    });

    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Admin login successful",
      user
    });

  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await adminService.getUsers({ page, limit, search, role });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user.userId;

    const updatedUser = await adminService.updateUserRole(userId, role, currentAdminId);
    
    res.json({
      message: "User role updated successfully",
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentAdminId = req.user.userId;

    const result = await adminService.deleteUser(userId, currentAdminId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSystemLogs = async (req, res, next) => {
  try {
    const { page, limit, type, userId } = req.query;
    const result = await adminService.getSystemLogs({ page, limit, type, userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAdmins();
    res.json({ admins });
  } catch (err) {
    next(err);
  }
};

export const updateAdminPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const updatedAdmin = await adminService.updateAdminPermissions(userId, permissions);
    
    res.json({
      message: "Admin permissions updated successfully",
      admin: updatedAdmin
    });
  } catch (err) {
    next(err);
  }
};