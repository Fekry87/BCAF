import { validationResult, body, param, query } from 'express-validator';
import { error } from '../utils/response.js';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, err) => {
      if (!acc[err.path]) acc[err.path] = [];
      acc[err.path].push(err.msg);
      return acc;
    }, {});

    return res.status(422).json(error('Validation failed', formattedErrors));
  }
  next();
};

// Common validation rules
export const rules = {
  // Auth
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  register: [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
  ],

  // Contact
  contact: [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required')
      .isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters'),
    body('pillarId').optional().isInt().toInt(),
  ],

  // Order
  createOrder: [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('customerPhone').optional().trim(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.serviceId').isInt().withMessage('Valid service ID required'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],

  // Pillar
  pillar: [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('slug').trim().notEmpty().withMessage('Slug is required')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('tagline').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim(),
    body('sortOrder').optional().isInt().toInt(),
    body('isActive').optional().isBoolean().toBoolean(),
  ],

  // Service
  service: [
    body('pillarId').isInt().withMessage('Pillar ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title too long'),
    body('slug').trim().notEmpty().withMessage('Slug is required')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('type').optional().isIn(['ONE_OFF', 'SUBSCRIPTION']),
    body('summary').optional().trim().isLength({ max: 500 }),
    body('priceFrom').optional().isFloat({ min: 0 }).toFloat(),
    body('sortOrder').optional().isInt().toInt(),
    body('isFeatured').optional().isBoolean().toBoolean(),
    body('isActive').optional().isBoolean().toBoolean(),
  ],

  // FAQ
  faq: [
    body('question').trim().notEmpty().withMessage('Question is required')
      .isLength({ max: 500 }).withMessage('Question too long'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('pillarId').optional().isInt().toInt(),
    body('sortOrder').optional().isInt().toInt(),
    body('isActive').optional().isBoolean().toBoolean(),
  ],

  // Common params
  id: [
    param('id').isInt().withMessage('Invalid ID'),
  ],

  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim(),
    query('status').optional().trim(),
  ],
};

export default {
  validate,
  rules,
};
