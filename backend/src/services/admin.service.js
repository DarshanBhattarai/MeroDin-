// src/services/admin.service.js
import prisma from "../lib/prisma.js";
import { comparePassword } from "../lib/auth.js";
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "../utils/errors.js";

export const adminService = {
  // --- Authentication ---
  async authenticateAdmin(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { adminProfile: true },
    });

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (user.role !== "ADMIN") {
      throw new AuthenticationError(
        "Access denied. Admin privileges required."
      );
    }

    if (!user.isEmailVerified) {
      throw new AuthenticationError(
        "Please verify your email before logging in."
      );
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Update last login
    if (user.adminProfile) {
      await prisma.admin.update({
        where: { userId: user.id },
        data: { lastLogin: new Date() },
      });
    }

    const { password: _, refreshTokenHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // --- Statistics ---
  async getSystemStats() {
    const [
      totalUsers,
      totalAdmins,
      activeUsersToday, // This needs to be fixed
      newRegistrationsToday,
      totalDiaryEntries,
      diaryEntriesToday,
      verifiedUsers,
      oauthUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),

      // FIXED: Count distinct users with diary entries today
      prisma.diaryEntry
        .groupBy({
          by: ["userId"],
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        })
        .then((results) => results.length),

      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.diaryEntry.count(),
      prisma.diaryEntry.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.user.count({
        where: {
          OR: [{ loginType: "GOOGLE" }, { loginType: "GITHUB" }],
        },
      }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      activeUsersToday,
      newRegistrationsToday,
      totalDiaryEntries,
      diaryEntriesToday,
      verifiedUsers,
      oauthUsers,
      emailUsers: totalUsers - oauthUsers,
      systemHealth: "operational",
      database: "connected",
      lastUpdated: new Date(),
    };
  },

  // --- User Management ---
  async getUsers({ page = 1, limit = 20, search = "", role = "" } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isEmailVerified: true,
          loginType: true,
          createdAt: true,
          updatedAt: true,
          adminProfile: {
            select: {
              lastLogin: true,
              permissions: true,
            },
          },
          _count: {
            select: {
              diaryEntries: true,
              otpLogs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isEmailVerified: true,
        loginType: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        adminProfile: {
          select: {
            lastLogin: true,
            permissions: true,
            createdAt: true,
          },
        },
        diaryEntries: {
          select: {
            id: true,
            title: true,
            mood: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        otpLogs: {
          select: {
            id: true,
            otpType: true,
            success: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            diaryEntries: true,
            otpLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },

  async updateUserRole(userId, newRole, currentAdminId) {
    if (!["USER", "ADMIN"].includes(newRole)) {
      throw new ValidationError("Invalid role. Must be USER or ADMIN");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent self-demotion
    if (parseInt(userId) === currentAdminId && newRole === "USER") {
      throw new ValidationError("Cannot demote yourself");
    }

    // Prevent demoting the last admin
    if (newRole === "USER" && user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        throw new ValidationError("Cannot demote the last admin user");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Manage admin profile based on role
    if (newRole === "ADMIN") {
      await prisma.admin.upsert({
        where: { userId: parseInt(userId) },
        update: {},
        create: {
          userId: parseInt(userId),
          permissions: ["BASIC"],
        },
      });
    } else {
      await prisma.admin.deleteMany({
        where: { userId: parseInt(userId) },
      });
    }

    return updatedUser;
  },

  async deleteUser(userId, currentAdminId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent self-deletion
    if (parseInt(userId) === currentAdminId) {
      throw new ValidationError("Cannot delete your own account");
    }

    // Prevent deleting the last admin
    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        throw new ValidationError("Cannot delete the last admin user");
      }
    }

    // Use transaction for atomic operations
    await prisma.$transaction(async (tx) => {
      await tx.otpLog.deleteMany({ where: { userId: parseInt(userId) } });
      await tx.diaryEntry.deleteMany({ where: { userId: parseInt(userId) } });
      await tx.admin.deleteMany({ where: { userId: parseInt(userId) } });
      await tx.user.delete({ where: { id: parseInt(userId) } });
    });

    return { message: "User deleted successfully" };
  },

  // --- System Logs ---
  async getSystemLogs({ page = 1, limit = 50, type = "", userId = "" } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { otpType: type }),
      ...(userId && { userId: parseInt(userId) }),
    };

    const [logs, totalCount] = await Promise.all([
      prisma.otpLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.otpLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  },

  // --- Admin Management ---
  async getAdmins() {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        fullName: true,
        isEmailVerified: true,
        createdAt: true,
        adminProfile: {
          select: {
            lastLogin: true,
            permissions: true,
          },
        },
        _count: {
          select: {
            diaryEntries: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return admins;
  },

  async updateAdminPermissions(userId, permissions) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { adminProfile: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new NotFoundError("Admin user not found");
    }

    if (!user.adminProfile) {
      throw new ValidationError("Admin profile not found");
    }

    const updatedAdmin = await prisma.admin.update({
      where: { userId: parseInt(userId) },
      data: { permissions },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return updatedAdmin;
  },
};

export default adminService;
