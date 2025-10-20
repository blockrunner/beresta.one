const { body, validationResult } = require('express-validator');

// Validation rules for queue operations
const queueValidation = {
  save: [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('data')
      .notEmpty()
      .withMessage('Data is required')
      .custom((value) => {
        if (typeof value !== 'object' || value === null) {
          throw new Error('Data must be an object');
        }
        return true;
      })
  ],

  remove: [
    body('id')
      .notEmpty()
      .withMessage('ID is required')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
  ]
};

// Validation rules for log operations
const logValidation = {
  add: [
    body('log-action')
      .notEmpty()
      .withMessage('Log action is required')
      .isString()
      .withMessage('Log action must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('Log action must be between 1 and 255 characters'),
    
    body('log-type')
      .notEmpty()
      .withMessage('Log type is required')
      .isString()
      .withMessage('Log type must be a string')
      .isIn(['text', 'img', 'data'])
      .withMessage('Log type must be one of: text, img, data'),
    
    body('log-msg')
      .notEmpty()
      .withMessage('Log message is required')
  ]
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  queueValidation,
  logValidation,
  handleValidationErrors
};

