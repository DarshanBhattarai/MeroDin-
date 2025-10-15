import { PrismaClient } from '@prisma/client';
import { securityUtils } from '../utils/securityUtils.js';

const prisma = new PrismaClient();

export const diaryService = {
  // Create new diary entry with enhanced security
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
        passwordHint
      } = diaryData;

      // For secret diaries, we can add additional encryption here
      let processedContent = contentRaw;
      
      if (diaryType === 'SECRET') {
        // In a real implementation, you might want to encrypt the content
        // processedContent = securityUtils.encryptData(contentRaw, userEncryptionKey);
        console.log('SECRET diary created with enhanced privacy');
      }

      const diaryEntry = await prisma.diaryEntry.create({
        data: {
          userId,
          title: securityUtils.sanitizeInput(title),
          contentRaw: securityUtils.sanitizeInput(processedContent),
          mood: mood ? securityUtils.sanitizeInput(mood) : null,
          moodIntensity,
          diaryType,
          tags: tags.map(tag => securityUtils.sanitizeInput(tag)),
          mediaUrls: mediaUrls.map(url => securityUtils.sanitizeInput(url)),
          location: location ? securityUtils.sanitizeInput(location) : null,
          isLocked,
          passwordHint: passwordHint ? securityUtils.sanitizeInput(passwordHint) : null,
          aiKeywords: this.generateAIKeywords(contentRaw)
        },
      });

      return this.formatDiaryResponse(diaryEntry);
    } catch (error) {
      console.error('Diary creation error:', error);
      throw new Error(`Failed to create diary entry: ${error.message}`);
    }
  },

  // Get all diary entries for user with privacy protection
  async getUserDiaryEntries(userId, userRole, filters = {}) {
    try {
      const {
        diaryType,
        mood,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 20
      } = filters;

      const whereClause = {
        userId: userRole === 'ADMIN' ? undefined : userId
      };

      // Privacy: Admin cannot view SECRET diaries
      if (userRole === 'ADMIN') {
        whereClause.diaryType = {
          not: 'SECRET'
        };
      }

      // Apply filters
      if (diaryType) {
        whereClause.diaryType = diaryType;
      }

      if (mood) {
        whereClause.mood = {
          contains: mood,
          mode: 'insensitive'
        };
      }

      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
        if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { contentRaw: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ];
      }

      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        prisma.diaryEntry.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: this.getDiarySelectFields(userRole === 'ADMIN')
        }),
        prisma.diaryEntry.count({ where: whereClause })
      ]);

      return {
        entries: entries.map(entry => this.formatDiaryResponse(entry)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get diary entries error:', error);
      throw new Error(`Failed to fetch diary entries: ${error.message}`);
    }
  },

  // Get single diary entry with advanced privacy protection
  async getDiaryEntryById(entryId, userId, userRole) {
    try {
      const diaryEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        }
      });

      if (!diaryEntry) {
        throw new Error('Diary entry not found');
      }

      // Enhanced privacy protection
      if (diaryEntry.diaryType === 'SECRET' && userRole === 'ADMIN') {
        throw new Error('Access denied: Cannot view secret diaries');
      }

      if (userRole !== 'ADMIN' && diaryEntry.userId !== userId) {
        throw new Error('Access denied to this diary entry');
      }

      return this.formatDiaryResponse(diaryEntry);
    } catch (error) {
      console.error('Get diary entry error:', error);
      throw new Error(`Failed to fetch diary entry: ${error.message}`);
    }
  },

  // Update diary entry with ownership validation
  async updateDiaryEntry(entryId, userId, userRole, updateData) {
    try {
      // Verify entry exists and user has permission
      const existingEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId }
      });

      if (!existingEntry) {
        throw new Error('Diary entry not found');
      }

      // Enhanced security checks
      if (userRole !== 'ADMIN' && existingEntry.userId !== userId) {
        throw new Error('Access denied');
      }

      if (userRole === 'ADMIN' && existingEntry.diaryType === 'SECRET') {
        throw new Error('Cannot modify secret diaries');
      }

      // Prepare update data with sanitization
      const sanitizedData = {};
      const fieldsToUpdate = [
        'title', 'contentRaw', 'mood', 'moodIntensity', 'diaryType', 
        'tags', 'mediaUrls', 'location', 'isLocked', 'passwordHint'
      ];

      fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
          if (Array.isArray(updateData[field])) {
            sanitizedData[field] = updateData[field].map(item => 
              securityUtils.sanitizeInput(item)
            );
          } else if (typeof updateData[field] === 'string') {
            sanitizedData[field] = securityUtils.sanitizeInput(updateData[field]);
          } else {
            sanitizedData[field] = updateData[field];
          }
        }
      });

      const updatedEntry = await prisma.diaryEntry.update({
        where: { id: entryId },
        data: sanitizedData
      });

      return this.formatDiaryResponse(updatedEntry);
    } catch (error) {
      console.error('Update diary entry error:', error);
      throw new Error(`Failed to update diary entry: ${error.message}`);
    }
  },

  // Delete diary entry with confirmation
  async deleteDiaryEntry(entryId, userId, userRole) {
    try {
      const existingEntry = await prisma.diaryEntry.findUnique({
        where: { id: entryId }
      });

      if (!existingEntry) {
        throw new Error('Diary entry not found');
      }

      if (userRole !== 'ADMIN' && existingEntry.userId !== userId) {
        throw new Error('Access denied');
      }

      if (userRole === 'ADMIN' && existingEntry.diaryType === 'SECRET') {
        throw new Error('Cannot delete secret diaries');
      }

      await prisma.diaryEntry.delete({
        where: { id: entryId }
      });

      return { 
        message: 'Diary entry deleted successfully',
        deletedEntryId: entryId
      };
    } catch (error) {
      console.error('Delete diary entry error:', error);
      throw new Error(`Failed to delete diary entry: ${error.message}`);
    }
  },

  // Get user's personal diary entries only
  async getMyDiaryEntries(userId, filters = {}) {
    try {
      const whereClause = { userId };

      // Apply personal filters
      if (filters.diaryType) {
        whereClause.diaryType = filters.diaryType;
      }

      if (filters.mood) {
        whereClause.mood = filters.mood;
      }

      const entries = await prisma.diaryEntry.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: this.getDiarySelectFields(false)
      });

      return entries.map(entry => this.formatDiaryResponse(entry));
    } catch (error) {
      console.error('Get my diary entries error:', error);
      throw new Error(`Failed to fetch your diary entries: ${error.message}`);
    }
  },

  // Advanced analytics and statistics
  async getDiaryAnalytics(userId) {
    try {
      const [
        totalEntries,
        entriesByType,
        entriesByMood,
        recentActivity,
        monthlyStats
      ] = await Promise.all([
        // Total entries count
        prisma.diaryEntry.count({ where: { userId } }),

        // Entries by type
        prisma.diaryEntry.groupBy({
          by: ['diaryType'],
          where: { userId },
          _count: { id: true }
        }),

        // Top moods
        prisma.diaryEntry.groupBy({
          by: ['mood'],
          where: { 
            userId,
            mood: { not: null }
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // Recent activity (last 30 days)
        prisma.diaryEntry.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Monthly entries for the past 6 months
        this.getMonthlyStats(userId)
      ]);

      return {
        totalEntries,
        entriesByType,
        entriesByMood,
        recentActivity,
        monthlyStats,
        averageMoodIntensity: await this.getAverageMoodIntensity(userId)
      };
    } catch (error) {
      console.error('Get diary analytics error:', error);
      throw new Error(`Failed to fetch diary analytics: ${error.message}`);
    }
  },

  // Helper methods
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
      updatedAt: true
    };

    // Admins don't get certain sensitive fields
    if (isAdmin) {
      const { passwordHint, ...adminFields } = baseFields;
      return adminFields;
    }

    return baseFields;
  },

  formatDiaryResponse(diaryEntry) {
    const entry = { ...diaryEntry };
    
    // Remove user relation if present
    if (entry.user) {
      delete entry.user;
    }
    
    return entry;
  },

  generateAIKeywords(content) {
    // Simple keyword extraction - in real app, integrate with AI service
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  },

  async getMonthlyStats(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by month
    const monthlyCounts = {};
    entries.forEach(entry => {
      const month = entry.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    return monthlyCounts;
  },

  async getAverageMoodIntensity(userId) {
    const result = await prisma.diaryEntry.aggregate({
      where: {
        userId,
        moodIntensity: { not: null }
      },
      _avg: {
        moodIntensity: true
      }
    });

    return result._avg.moodIntensity;
  }
};