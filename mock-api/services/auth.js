// JWT Authentication Service
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Configuration
const config = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    },
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpiry }
  );
}

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    {
      userId: payload.id,
      tokenId: crypto.randomUUID(),
    },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiry }
  );
}

/**
 * Generate both Access and Refresh tokens
 * @param {Object} user - User object
 * @returns {Object} { accessToken, refreshToken }
 */
export function generateTokenPair(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

/**
 * Verify Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.accessTokenSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.refreshTokenSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * JWT Authentication Middleware
 * Supports both Bearer token and HttpOnly cookie
 */
export function authenticateJWT(req, res, next) {
  // Try Bearer token first
  let token = extractBearerToken(req.headers.authorization);

  // Fall back to cookie
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Authentication required',
      errors: { auth: ['No token provided'] },
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token',
      errors: { auth: ['Token verification failed'] },
    });
  }

  // Attach user info to request
  req.user = decoded;
  next();
}

/**
 * Optional JWT Authentication Middleware
 * Attaches user if token present, continues if not
 */
export function optionalAuthJWT(req, res, next) {
  let token = extractBearerToken(req.headers.authorization);

  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

/**
 * Role-based Authorization Middleware
 * @param {...string} allowedRoles - Roles that can access the route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        errors: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Insufficient permissions',
        errors: { auth: ['You do not have permission to access this resource'] },
      });
    }

    next();
  };
}

/**
 * Permission-based Authorization Middleware
 * @param {...string} requiredPermissions - Permissions needed
 */
export function requirePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        errors: null,
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(
      perm => userPermissions.includes(perm) || userPermissions.includes('*')
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Insufficient permissions',
        errors: { auth: ['Missing required permissions'] },
      });
    }

    next();
  };
}

/**
 * Set auth cookies
 * @param {Object} res - Express response object
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 */
export function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh', // Only sent to refresh endpoint
  });
}

/**
 * Clear auth cookies
 * @param {Object} res - Express response object
 */
export function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
}

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
  authenticateJWT,
  optionalAuthJWT,
  authorize,
  requirePermissions,
  setAuthCookies,
  clearAuthCookies,
};
