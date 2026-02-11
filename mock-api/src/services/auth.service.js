import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/env.js';
import prisma from '../config/database.js';

const SALT_ROUNDS = 12;

// Password hashing
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// JWT Token generation
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const generateTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);
  return { accessToken, refreshToken };
};

// Token verification
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = async (token) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!refreshToken || refreshToken.expiresAt < new Date()) {
    return null;
  }

  return refreshToken;
};

// Refresh token rotation
export const rotateRefreshToken = async (oldToken) => {
  const tokenRecord = await verifyRefreshToken(oldToken);
  if (!tokenRecord) return null;

  // Delete old token
  await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  });

  // Generate new tokens
  return generateTokenPair(tokenRecord.user);
};

// Revoke tokens
export const revokeRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
    return true;
  } catch {
    return false;
  }
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

// Cookie helpers
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = config.nodeEnv === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
};

// User authentication
export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return null;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return user;
};

// Create user
export const createUser = async (data) => {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
  });
};
