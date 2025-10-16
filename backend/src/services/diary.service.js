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

      let processedContent = contentRaw;
      if (diaryType === "SECRET") {
        console.log("SECRET diary created with enhanced privacy");
      }

      const diaryEntry = await prisma.diaryEntry.create({
        data: {
          userId,
          entryDate,
          title: securityUtils.sanitizeInput(title),
          contentRaw: securityUtils.sanitizeInput(processedContent),
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

      return this.formatDiaryResponse(diaryEntry);
    } catch (error) {
      if (error.code === "P2002") {
        const duplicateError = new Error("You already created a diary for today.");
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
      const { diaryType, mood, dateFrom, dateTo, search, page = 1, limit = 20 } = filters;
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

      return {
        entries: entries.map((entry) => this.formatDiaryResponse(entry)),
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
        include: { user: { select: { id: true, email: true, fullName: true } } },
      });

      if (!diaryEntry) {
        const error = new Error("Diary entry not found");
        error.statusCode = 404;
        throw error;
      }

      // Access control
      if (diaryEntry.diaryType === "SECRET" && userRole === "ADMIN") {
        const error = new Error("Access denied: Admins cannot view SECRET diaries");
        error.statusCode = 403;
        throw error;
      }
      if (userRole !== "ADMIN" && diaryEntry.userId !== userId) {
        const error = new Error("Access denied: You do not own this diary entry");
        error.statusCode = 403;
        throw error;
      }

      return this.formatDiaryResponse(diaryEntry);
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

      const existingEntry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
      if (!existingEntry) throw new Error("Diary entry not found");

      if (userRole !== "ADMIN" && existingEntry.userId !== userId) {
        const error = new Error("Access denied: You do not own this diary entry");
        error.statusCode = 403;
        throw error;
      }
      if (userRole === "ADMIN" && existingEntry.diaryType === "SECRET") {
        const error = new Error("Admins cannot modify SECRET diaries");
        error.statusCode = 403;
        throw error;
      }

      const allowedFields = [
        "title", "contentRaw", "mood", "moodIntensity",
        "diaryType", "tags", "mediaUrls", "location",
        "isLocked", "passwordHint"
      ];
      const sanitizedData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          sanitizedData[field] = Array.isArray(updateData[field])
            ? updateData[field].map(item => securityUtils.sanitizeInput(item))
            : typeof updateData[field] === "string"
            ? securityUtils.sanitizeInput(updateData[field])
            : updateData[field];
        }
      });

      const updatedEntry = await prisma.diaryEntry.update({
        where: { id: entryId },
        data: sanitizedData,
      });

      return this.formatDiaryResponse(updatedEntry);
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

      const existingEntry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
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
      return { message: "Diary entry deleted successfully", deletedEntryId: entryId };
    } catch (error) {
      console.error("Delete diary entry error:", error);
      if (!error.statusCode) error.statusCode = 500;
      throw new Error(error.message);
    }
  },

  // -------------------
  // HELPERS
  // -------------------
  formatDiaryResponse(diaryEntry) {
    const entry = { ...diaryEntry };
    if (entry.user) delete entry.user;
    return entry;
  },

  generateAIKeywords(content) {
    if (!content) return [];
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3);
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

  async getMonthlyStats(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const entries = await prisma.diaryEntry.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyCounts = {};
    entries.forEach(entry => {
      const month = entry.createdAt.toISOString().substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    return monthlyCounts;
  },

  async getAverageMoodIntensity(userId) {
    const result = await prisma.diaryEntry.aggregate({
      where: { userId, moodIntensity: { not: null } },
      _avg: { moodIntensity: true },
    });
    return result._avg.moodIntensity;
  },
};
