import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

// ============================================
// RATE LIMITING
// ============================================

const isProduction = process.env.NODE_ENV === 'production';

// General API rate limit
export const apiLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // Limit each IP to 500 requests per window
      message: {
        success: false,
        data: null,
        message: 'Too many requests, please try again later.',
        errors: { rate_limit: ['API rate limit exceeded'] },
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === '/api/health', // Skip health checks
    })
  : (req, res, next) => next(); // Skip rate limiting in development

// Strict rate limit for authentication endpoints
export const authLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // Limit each IP to 20 login attempts per window
      message: {
        success: false,
        data: null,
        message: 'Too many authentication attempts, please try again later.',
        errors: { rate_limit: ['Authentication rate limit exceeded'] },
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true, // Don't count successful logins
    })
  : (req, res, next) => next(); // Skip rate limiting in development

// Contact form rate limit
export const contactLimiter = isProduction
  ? rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit each IP to 10 contact submissions per hour
      message: {
        success: false,
        data: null,
        message: 'Too many contact submissions, please try again later.',
        errors: { rate_limit: ['Contact submission limit exceeded'] },
      },
    })
  : (req, res, next) => next(); // Skip rate limiting in development

// ============================================
// INPUT VALIDATION
// ============================================

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Contact form validation
export const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional({ values: 'falsy' }) // Treat empty strings, null, undefined as "not provided"
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
    .escape(),
  body('subject')
    .optional({ values: 'falsy' }) // Treat empty strings, null, undefined as "not provided"
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters')
    .escape(),
];

// Order validation
export const validateOrder = [
  body('customer.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name is required')
    .escape(),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid customer email is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.id')
    .isInt({ min: 1 })
    .withMessage('Invalid item ID'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

// User registration validation
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      const field = error.path || error.param;
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    });

    return res.status(422).json({
      success: false,
      data: null,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// ============================================
// PASSWORD HASHING
// ============================================

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ============================================
// SECURITY HEADERS
// ============================================

import crypto from 'crypto';

// Generate nonce for CSP
export const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

export const securityHeaders = (req, res, next) => {
  // Generate nonce for this request
  const nonce = generateNonce();
  req.cspNonce = nonce;
  res.locals = res.locals || {};
  res.locals.cspNonce = nonce;

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Strict Transport Security (HSTS) - only in production
  if (isProduction) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy - Production-ready without unsafe-inline/eval
  // Note: In development, we use a more relaxed policy for hot reload
  const cspPolicy = isProduction
    ? [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.suitedash.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join('; ')
    : [
        // Development CSP - allows hot reload
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Vite HMR
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' ws://localhost:* http://localhost:*",
        "frame-ancestors 'none'",
      ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);

  next();
};

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

export const verifyWebhookSignature = (secret) => {
  return (req, res, next) => {
    if (!secret) {
      console.warn('Webhook secret not configured - skipping signature verification');
      return next();
    }

    const signature = req.headers['x-webhook-signature'];

    if (!signature) {
      return res.status(401).json({
        success: false,
        message: 'Missing webhook signature',
      });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    next();
  };
};

// ============================================
// REQUEST SANITIZATION
// ============================================

export const sanitizeRequest = (req, res, next) => {
  // Remove any potentially dangerous characters from query params
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .trim();
      }
    });
  }
  next();
};
