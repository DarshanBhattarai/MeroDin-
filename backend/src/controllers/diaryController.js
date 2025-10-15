import { diaryService } from '../services/diary.service.js';
import { responseHandler } from '../utils/responseHandler.js';

export const diaryController = {
  // Create diary entry
  createDiaryEntry: async (req, res) => {
    try {
      const userId = req.user.id;
      const diaryData = req.body;

      const newEntry = await diaryService.createDiaryEntry(userId, diaryData);

      return responseHandler.success(
        res, 
        newEntry, 
        'Diary entry created successfully', 
        201
      );
    } catch (error) {
      console.error('Create diary error:', error);
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Get all diary entries with advanced filtering
  getAllDiaryEntries: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const filters = {
        diaryType: req.query.diaryType,
        mood: req.query.mood,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await diaryService.getUserDiaryEntries(userId, userRole, filters);

      return responseHandler.success(res, result, 'Diary entries fetched successfully');
    } catch (error) {
      console.error('Get all diaries error:', error);
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Get single diary entry
  getDiaryEntry: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const entryId = parseInt(req.params.id);

      if (isNaN(entryId)) {
        return responseHandler.error(res, 'Invalid diary entry ID', 400);
      }

      const entry = await diaryService.getDiaryEntryById(entryId, userId, userRole);

      return responseHandler.success(res, entry, 'Diary entry fetched successfully');
    } catch (error) {
      console.error('Get diary error:', error);
      
      if (error.message.includes('not found')) {
        return responseHandler.error(res, error.message, 404);
      }
      if (error.message.includes('Access denied')) {
        return responseHandler.error(res, error.message, 403);
      }
      
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Update diary entry
  updateDiaryEntry: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const entryId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(entryId)) {
        return responseHandler.error(res, 'Invalid diary entry ID', 400);
      }

      const updatedEntry = await diaryService.updateDiaryEntry(
        entryId, 
        userId, 
        userRole, 
        updateData
      );

      return responseHandler.success(
        res, 
        updatedEntry, 
        'Diary entry updated successfully'
      );
    } catch (error) {
      console.error('Update diary error:', error);
      
      if (error.message.includes('not found')) {
        return responseHandler.error(res, error.message, 404);
      }
      if (error.message.includes('Access denied')) {
        return responseHandler.error(res, error.message, 403);
      }
      
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Delete diary entry
  deleteDiaryEntry: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const entryId = parseInt(req.params.id);

      if (isNaN(entryId)) {
        return responseHandler.error(res, 'Invalid diary entry ID', 400);
      }

      const result = await diaryService.deleteDiaryEntry(entryId, userId, userRole);

      return responseHandler.success(res, result, 'Diary entry deleted successfully');
    } catch (error) {
      console.error('Delete diary error:', error);
      
      if (error.message.includes('not found')) {
        return responseHandler.error(res, error.message, 404);
      }
      if (error.message.includes('Access denied')) {
        return responseHandler.error(res, error.message, 403);
      }
      
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Get personal diary entries
  getMyDiaryEntries: async (req, res) => {
    try {
      const userId = req.user.id;
      const filters = {
        diaryType: req.query.diaryType,
        mood: req.query.mood
      };

      const entries = await diaryService.getMyDiaryEntries(userId, filters);

      return responseHandler.success(res, entries, 'Your diary entries fetched successfully');
    } catch (error) {
      console.error('Get my diaries error:', error);
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Get diary analytics
  getDiaryAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;

      const analytics = await diaryService.getDiaryAnalytics(userId);

      return responseHandler.success(res, analytics, 'Diary analytics fetched successfully');
    } catch (error) {
      console.error('Get analytics error:', error);
      return responseHandler.error(res, error.message, 500);
    }
  },

  // Search diary entries
  searchDiaryEntries: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { query, diaryType, mood } = req.query;

      if (!query) {
        return responseHandler.error(res, 'Search query is required', 400);
      }

      const filters = {
        search: query,
        diaryType,
        mood,
        page: 1,
        limit: 50
      };

      const result = await diaryService.getUserDiaryEntries(userId, userRole, filters);

      return responseHandler.success(res, result, 'Search completed successfully');
    } catch (error) {
      console.error('Search diaries error:', error);
      return responseHandler.error(res, error.message, 500);
    }
  }
};