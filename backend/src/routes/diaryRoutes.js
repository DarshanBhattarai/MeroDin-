import { Router } from 'express';
import { diaryController } from '../controllers/diaryController.js';
import { 
  authenticate, 
  authorize, 
  diaryOwnership 
} from '../middleware/authMiddleware.js';
import { 
  validateDiaryEntry 
} from '../middleware/validationMiddleware.js';
import { 
  diaryRateLimit,
  sensitiveOperationRateLimit 
} from '../middleware/securityMiddleware.js';

const router = Router();

// Apply rate limiting and authentication to all routes
router.use(diaryRateLimit);
router.use(authenticate);

// Diary entry routes
router.post('/entries', validateDiaryEntry, diaryController.createDiaryEntry);
router.get('/entries', diaryController.getAllDiaryEntries);
router.get('/entries/my', diaryController.getMyDiaryEntries);
router.get('/entries/search', diaryController.searchDiaryEntries);
router.get('/entries/analytics', diaryController.getDiaryAnalytics);

// Single entry routes with ownership check
router.get('/entries/:id', diaryOwnership, diaryController.getDiaryEntry);
router.put('/entries/:id', diaryOwnership, validateDiaryEntry, diaryController.updateDiaryEntry);
router.delete('/entries/:id', sensitiveOperationRateLimit, diaryOwnership, diaryController.deleteDiaryEntry);

export default router;