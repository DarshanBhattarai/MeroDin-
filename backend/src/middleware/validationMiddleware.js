import { body, validationResult } from 'express-validator';

export const validateDiaryEntry = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .escape(),
  
  body('contentRaw')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required')
    .escape(),
  
  body('mood')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Mood must be less than 50 characters')
    .escape(),
  
  body('moodIntensity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood intensity must be between 1 and 10'),
  
  body('diaryType')
    .isIn(['NORMAL', 'SECRET', 'MEMORY', 'QUICK_NOTE'])
    .withMessage('Invalid diary type'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
    .escape(),
  
  body('isLocked')
    .optional()
    .isBoolean()
    .withMessage('isLocked must be a boolean'),
  
  body('passwordHint')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Password hint must be less than 100 characters')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];