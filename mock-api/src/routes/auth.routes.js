import { Router } from 'express';
import prisma from '../config/database.js';
import { success, error } from '../utils/response.js';
import { validate, rules } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  authenticateUser,
  createUser,
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../services/auth.service.js';
import { sendWelcomeEmail } from '../services/email.service.js';
import logger from '../utils/logger.js';

const router = Router();

// Login
router.post('/login', rules.login, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json(error('Invalid email or password'));
    }

    const tokens = await generateTokenPair(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;

    res.json(success({
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    }, 'Login successful'));
  } catch (err) {
    next(err);
  }
});

// Register
router.post('/register', rules.register, validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json(error('Email already registered'));
    }

    const user = await createUser({ name, email, password });
    const tokens = await generateTokenPair(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Send welcome email (don't await)
    sendWelcomeEmail(user).catch(err => logger.error('Welcome email failed:', err));

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(success({
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    }, 'Registration successful'));
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json(error('Refresh token required'));
    }

    const tokens = await rotateRefreshToken(refreshToken);
    if (!tokens) {
      clearAuthCookies(res);
      return res.status(401).json(error('Invalid or expired refresh token'));
    }

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json(success({
      accessToken: tokens.accessToken,
    }, 'Token refreshed'));
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(res);
    res.json(success(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/user', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    res.json(success(user));
  } catch (err) {
    next(err);
  }
});

// Update profile
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), id: { not: req.user.id } },
      });
      if (existing) {
        return res.status(409).json(error('Email already in use'));
      }
      updates.email = email.toLowerCase();
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(success(user, 'Profile updated'));
  } catch (err) {
    next(err);
  }
});

export default router;
