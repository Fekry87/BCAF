import logger from '../utils/logger.js';
import { error } from '../utils/response.js';
import config from '../config/env.js';

// 404 handler
export const notFound = (req, res, next) => {
  res.status(404).json(error(`Route not found: ${req.originalUrl}`));
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json(error('A record with this value already exists'));
      case 'P2025':
        return res.status(404).json(error('Record not found'));
      case 'P2003':
        return res.status(400).json(error('Invalid reference - related record not found'));
      default:
        if (err.code.startsWith('P')) {
          return res.status(400).json(error('Database error'));
        }
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(error('Invalid token'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(error('Token expired'));
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json(error('Validation failed', err.errors));
  }

  // Stripe errors
  if (err.type === 'StripeError' || err.type?.startsWith('Stripe')) {
    return res.status(402).json(error(err.message));
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = config.nodeEnv === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  res.status(statusCode).json(error(message));
};

export default {
  notFound,
  errorHandler,
};
