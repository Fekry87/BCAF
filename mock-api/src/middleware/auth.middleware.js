import { verifyAccessToken } from '../services/auth.service.js';
import { error } from '../utils/response.js';

// Authenticate JWT token
export const authenticate = async (req, res, next) => {
  // Get token from cookie or header
  const token = req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json(error('Authentication required'));
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json(error('Invalid or expired token'));
  }

  req.user = decoded;
  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(error('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(error('Insufficient permissions'));
    }

    next();
  };
};

// Require specific permissions
export const requirePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(error('Authentication required'));
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.every(p => userPermissions.includes(p));

    if (!hasPermission && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json(error('Missing required permissions'));
    }

    next();
  };
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requirePermissions,
};
