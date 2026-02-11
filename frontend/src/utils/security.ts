/**
 * Security utilities for frontend XSS prevention and input sanitization
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:text/html',
    'vbscript:',
    'file:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const hasProtocol = safeProtocols.some((p) => trimmedUrl.startsWith(p));

  // If no protocol, assume relative URL (safe)
  if (!hasProtocol && !trimmedUrl.includes(':')) {
    return url;
  }

  // If has safe protocol, return original
  if (hasProtocol) {
    return url;
  }

  // Unknown protocol, block it
  return '';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Escape HTML
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Check if a string contains potential XSS patterns
 */
export function containsXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /data:\s*text\/html/i,
    /expression\s*\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
    errors.push('Password should be at least 12 characters');
  } else {
    errors.push('Password must be at least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push('Add an uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    errors.push('Add a lowercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push('Add a number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 2;
  } else {
    errors.push('Add a special character');
  }

  // Check for common patterns
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /letmein/i,
    /welcome/i,
    /admin/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    errors.push('Avoid common patterns');
  }

  return {
    isValid: score >= 5 && errors.length === 0,
    errors,
    score: Math.min(score, 7), // Max score of 7
  };
}

/**
 * Rate limit helper for client-side rate limiting
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const remaining = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remaining);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
