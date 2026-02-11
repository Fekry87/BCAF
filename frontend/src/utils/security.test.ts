import { describe, it, expect, beforeEach } from 'vitest';
import {
  escapeHtml,
  sanitizeUrl,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  containsXssPatterns,
  validatePasswordStrength,
  RateLimiter,
} from './security';

describe('Security Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHtml("it's a \"test\"")).toBe(
        "it&#039;s a &quot;test&quot;"
      );
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe(
        'mailto:test@example.com'
      );
    });

    it('should allow tel URLs', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/about')).toBe('/about');
      expect(sanitizeUrl('about/us')).toBe('about/us');
    });

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert("xss")')).toBe('');
    });

    it('should block data: URLs with HTML', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeUrl('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should escape HTML', () => {
      expect(sanitizeInput('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
    });

    it('should remove null bytes', () => {
      expect(sanitizeInput('hello\0world')).toBe('helloworld');
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('containsXssPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXssPatterns('<script>alert(1)</script>')).toBe(true);
      expect(containsXssPatterns('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsXssPatterns('javascript:alert(1)')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXssPatterns('onclick=alert(1)')).toBe(true);
      expect(containsXssPatterns('onerror = alert(1)')).toBe(true);
      expect(containsXssPatterns('onload=evil()')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsXssPatterns('<iframe src="evil.com">')).toBe(true);
    });

    it('should detect data: URLs with HTML', () => {
      expect(containsXssPatterns('data: text/html, <script>')).toBe(true);
    });

    it('should allow safe content', () => {
      expect(containsXssPatterns('Hello World')).toBe(false);
      expect(containsXssPatterns('user@example.com')).toBe(false);
      expect(containsXssPatterns('This is a test message')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should reject short passwords', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require uppercase letters', () => {
      const result = validatePasswordStrength('lowercase123!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Add an uppercase letter');
    });

    it('should require lowercase letters', () => {
      const result = validatePasswordStrength('UPPERCASE123!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Add a lowercase letter');
    });

    it('should require numbers', () => {
      const result = validatePasswordStrength('NoNumbers!@#abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Add a number');
    });

    it('should require special characters', () => {
      const result = validatePasswordStrength('NoSpecial123ABC');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Add a special character');
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123!@#');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });

    it('should penalize common patterns', () => {
      const result = validatePasswordStrength('Password123!');
      // Password123! contains common pattern "password", should be penalized
      expect(result.score).toBeLessThanOrEqual(5);
    });

    it('should have score capped at 7', () => {
      const result = validatePasswordStrength(
        'SuperSecureP@ssw0rd!Very!Long!'
      );
      expect(result.score).toBeLessThanOrEqual(7);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000); // 3 attempts per second
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(false);
    });

    it('should track different keys separately', () => {
      rateLimiter.isAllowed('key-1');
      rateLimiter.isAllowed('key-1');
      rateLimiter.isAllowed('key-1');
      expect(rateLimiter.isAllowed('key-1')).toBe(false);
      expect(rateLimiter.isAllowed('key-2')).toBe(true);
    });

    it('should reset a specific key', () => {
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(false);

      rateLimiter.reset('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
    });

    it('should return remaining time when rate limited', () => {
      rateLimiter.isAllowed('test-key');
      const remaining = rateLimiter.getRemainingTime('test-key');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(1000);
    });

    it('should return 0 remaining time for unknown key', () => {
      expect(rateLimiter.getRemainingTime('unknown')).toBe(0);
    });
  });
});
