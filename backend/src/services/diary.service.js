// services/diary.service.js
import prisma from "../lib/prisma.js";
import { securityUtils } from "../utils/securityUtils.js";

export const diaryService = {
  // -------------------
  // CREATE
  // -------------------
  async createDiaryEntry(userId, diaryData) {
    try {
      const {
        title,
        contentRaw,
        mood,
        moodIntensity,
        diaryType,
        tags = [],
        mediaUrls = [],
        location,
        isLocked = false,
        passwordHint,
      } = diaryData;

      const entryDate = new Date();
      entryDate.setHours(0, 0, 0, 0);

      const processedContent =
        diaryType === "SECRET" ? securityUtils.encrypt(contentRaw) : contentRaw;

      const diaryEntry = await prisma.diaryEntry.create({
        data: {
          userId,
          entryDate,
          title: securityUtils.sanitizeInput(title),
          contentRaw: processedContent,
          mood: mood ? securityUtils.sanitizeInput(mood) : null,
          moodIntensity,
          diaryType,
          tags: tags.map((tag) => securityUtils.sanitizeInput(tag)),
          mediaUrls: mediaUrls.map((url) => securityUtils.sanitizeInput(url)),
          location: location ? securityUtils.sanitizeInput(location) : null,
          isLocked,
          passwordHint: passwordHint
            ? securityUtils.sanitizeInput(passwordHint)
            : null,
          aiKeywords: this.generateAIKeywords(contentRaw),
        },
      });

      return this.formatDiaryResponse(diaryEntry, diaryType === "SECRET");
    } catch (error) {
      if (error.code === "P2002") {
        const duplicateError = new Error(
          "You already created a diary for today."
        );
        duplicateError.statusCode = 409;
        throw duplicateError;
      }
      console.error("Diary creation error:", error);
      throw new Error(`Failed to create diary entry: ${error.message}`);
    }
  },

  // -------------------
  // READ
  // -------------------
  async getUserDiaryEntries(userId, userRole, filters = {}) {
    try {
      const {
        diaryType,
        mood,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 20,
      } = filters;
      const whereClause = {};

      if (userRole !== "ADMIN") {
        whereClause.userId = userId;
      } else {
        whereClause.diaryType = { not: "SECRET" };
      }

      if (diaryType) whereClause.diaryType = diaryType;
      if (mood) whereClause.mood = { contains: mood, mode: "insensitive" };
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
        if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { contentRaw: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ];
      }

      const skip = (page - 1) * limit;
      const [entries, total] = await Promise.all([
        prisma.diaryEntry.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: this.getDiarySelectFields(userRole === "ADMIN"),
        }),
        prisma.diaryEntry.count({ where: whereClause }),
      ]);

      const formattedEntries = entries.map((entry) =>
        this.formatDiaryResponse(entry, entry.diaryType === "SECRET")
      );

      return {
        entries: formattedEntries,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Get diary entries error:", error);
      throw new Error(`Failed to fetch diary entries: ${error.message}`);
    }
  },

  async getDiaryEntryById(entryId, userId, userRole) {
    try {
      if (isNaN(entryId)) throw new Error("Invalid diary entry ID");

      const diaryEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      });

      if (!diaryEntry) {
        const error = new Error("Diary entry not found");
        error.statusCode = 404;
        throw error;
      }

      // Access control
      if (diaryEntry.diaryType === "SECRET" && userRole === "ADMIN") {
        const error = new Error(
          "Access denied: Admins cannot view SECRET diaries"
        );
        error.statusCode = 403;
        throw error;
      }
      if (userRole !== "ADMIN" && diaryEntry.userId !== userId) {
        const error = new Error(
          "Access denied: You do not own this diary entry"
        );
        error.statusCode = 403;
        throw error;
      }

      return this.formatDiaryResponse(
        diaryEntry,
        diaryEntry.diaryType === "SECRET"
      );
    } catch (error) {
      console.error("Get diary entry error:", error);
      if (!error.statusCode) error.statusCode = 500;
      throw new Error(error.message);
    }
  },

  // -------------------
  // UPDATE
  // -------------------
  async updateDiaryEntry(entryId, userId, userRole, updateData) {
    try {
      if (isNaN(entryId)) throw new Error("Invalid diary entry ID");

      const existingEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId },
      });
      if (!existingEntry) throw new Error("Diary entry not found");

      if (userRole !== "ADMIN" && existingEntry.userId !== userId) {
        const error = new Error(
          "Access denied: You do not own this diary entry"
        );
        error.statusCode = 403;
        throw error;
      }
      if (userRole === "ADMIN" && existingEntry.diaryType === "SECRET") {
        const error = new Error("Admins cannot modify SECRET diaries");
        error.statusCode = 403;
        throw error;
      }

      const allowedFields = [
        "title",
        "contentRaw",
        "mood",
        "moodIntensity",
        "diaryType",
        "tags",
        "mediaUrls",
        "location",
        "isLocked",
        "passwordHint",
      ];

      const sanitizedData = {};
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          sanitizedData[field] =
            field === "contentRaw" && existingEntry.diaryType === "SECRET"
              ? securityUtils.encrypt(updateData[field])
              : Array.isArray(updateData[field])
                ? updateData[field].map((item) =>
                    securityUtils.sanitizeInput(item)
                  )
                : typeof updateData[field] === "string"
                  ? securityUtils.sanitizeInput(updateData[field])
                  : updateData[field];
        }
      });

      const updatedEntry = await prisma.diaryEntry.update({
        where: { id: entryId },
        data: sanitizedData,
      });

      return this.formatDiaryResponse(
        updatedEntry,
        updatedEntry.diaryType === "SECRET"
      );
    } catch (error) {
      console.error("Update diary entry error:", error);
      if (!error.statusCode) error.statusCode = 500;
      throw new Error(error.message);
    }
  },

  // -------------------
  // DELETE
  // -------------------
  async deleteDiaryEntry(entryId, userId, userRole) {
    try {
      if (isNaN(entryId)) throw new Error("Invalid diary entry ID");

      const existingEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId },
      });
      if (!existingEntry) throw new Error("Diary entry not found");

      if (userRole !== "ADMIN" && existingEntry.userId !== userId) {
        const error = new Error("Access denied: cannot delete this entry");
        error.statusCode = 403;
        throw error;
      }
      if (userRole === "ADMIN" && existingEntry.diaryType === "SECRET") {
        const error = new Error("Admins cannot delete SECRET diaries");
        error.statusCode = 403;
        throw error;
      }

      await prisma.diaryEntry.delete({ where: { id: entryId } });
      return {
        message: "Diary entry deleted successfully",
        deletedEntryId: entryId,
      };
    } catch (error) {
      console.error("Delete diary entry error:", error);
      if (!error.statusCode) error.statusCode = 500;
      throw new Error(error.message);
    }
  },

  // -------------------
  // ANALYTICS
  // -------------------
  async getMonthlyStats(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const entries = await prisma.diaryEntry.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyCounts = {};
    entries.forEach((entry) => {
      const month = entry.createdAt.toISOString().substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    return monthlyCounts;
  }, // -------------------
  // Get entries by exact date
  // -------------------
  async getEntriesByDate(userId, userRole, entryDate) {
    const dateStart = new Date(entryDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(entryDate);
    dateEnd.setHours(23, 59, 59, 999);

    return this.getUserDiaryEntries(userId, userRole, {
      dateFrom: dateStart,
      dateTo: dateEnd,
      page: 1,
      limit: 100,
    });
  },

  // -------------------
  // Get entries by month
  // -------------------
  async getEntriesByMonth(userId, userRole, month) {
    const [year, monthStr] = month.split("-");
    const monthNum = parseInt(monthStr) - 1;

    const start = new Date(year, monthNum, 1);
    const end = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);

    return this.getUserDiaryEntries(userId, userRole, {
      dateFrom: start,
      dateTo: end,
      page: 1,
      limit: 100,
    });
  },

  // -------------------
  // Get entries by date range
  // -------------------
  async getEntriesByDateRange(userId, userRole, startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.getUserDiaryEntries(userId, userRole, {
      dateFrom: start,
      dateTo: end,
      page: 1,
      limit: 200,
    });
  },

  // -------------------
  // Delete entries by exact date
  // -------------------
  async deleteEntriesByDate(userId, userRole, entryDate) {
    const dateStart = new Date(entryDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(entryDate);
    dateEnd.setHours(23, 59, 59, 999);

    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId: userRole !== "ADMIN" ? userId : undefined,
        diaryType: userRole === "ADMIN" ? { not: "SECRET" } : undefined,
        createdAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
    });

    const deletedIds = [];
    for (const entry of entries) {
      await prisma.diaryEntry.delete({ where: { id: entry.id } });
      deletedIds.push(entry.id);
    }

    return { message: "Entries deleted successfully", deletedIds };
  },

  async getAverageMoodIntensity(userId) {
    const result = await prisma.diaryEntry.aggregate({
      where: { userId, moodIntensity: { not: null } },
      _avg: { moodIntensity: true },
    });
    return result._avg.moodIntensity;
  },
  async getEntriesByDate(userId, date) {
    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(date), lt: new Date(date + "T23:59:59") },
      },
      orderBy: { createdAt: "desc" },
    });
    return entries.map(this.formatDiaryResponse);
  },

  async getEntriesByMonth(userId, month) {
    const start = new Date(`${month}-01`);
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const entries = await prisma.diaryEntry.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
    });
    return entries.map(this.formatDiaryResponse);
  },

  async getEntriesByDateRange(userId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate + "T23:59:59");
    const entries = await prisma.diaryEntry.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
    });
    return entries.map(this.formatDiaryResponse);
  },

  async deleteEntryByDate(userId, entryDate) {
    const start = new Date(entryDate);
    const end = new Date(entryDate + "T23:59:59");
    const entries = await prisma.diaryEntry.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
    });
    const deletedIds = entries.map((e) => e.id);
    await prisma.diaryEntry.deleteMany({
      where: { id: { in: deletedIds } },
    });
    return { message: "Entries deleted successfully", deletedIds };
  },

  // -------------------
  // HELPERS
  // -------------------
  formatDiaryResponse(diaryEntry, isSecret = false) {
    const entry = { ...diaryEntry };
    if (entry.user) delete entry.user;
    if (isSecret) {
      entry.contentRaw = securityUtils.decrypt(entry.contentRaw);
    }
    return entry;
  },

  generateAIKeywords(content) {
    if (!content) return [];
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);
    return [...new Set(words)].slice(0, 10);
  },

  getDiarySelectFields(isAdmin = false) {
    const baseFields = {
      id: true,
      title: true,
      contentRaw: true,
      contentAI: true,
      mood: true,
      moodIntensity: true,
      diaryType: true,
      tags: true,
      mediaUrls: true,
      location: true,
      isLocked: true,
      passwordHint: true,
      aiSummary: true,
      aiKeywords: true,
      createdAt: true,
      updatedAt: true,
    };
    if (isAdmin) {
      const { passwordHint, ...adminFields } = baseFields;
      return adminFields;
    }
    return baseFields;
  },
};
