import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecureForm } from './useSecureForm';

describe('useSecureForm', () => {
  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSecureForm());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isRateLimited).toBe(false);
      expect(result.current.rateLimitRemainingMs).toBe(0);
      expect(result.current.securityErrors).toEqual([]);
    });
  });

  describe('sanitizeField', () => {
    it('should sanitize HTML in field values', () => {
      const { result } = renderHook(() => useSecureForm());

      const sanitized = result.current.sanitizeField('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should trim whitespace', () => {
      const { result } = renderHook(() => useSecureForm());

      expect(result.current.sanitizeField('  hello  ')).toBe('hello');
    });

    it('should not sanitize when disabled', () => {
      const { result } = renderHook(() =>
        useSecureForm({ sanitizeOnChange: false })
      );

      const input = '<b>bold</b>';
      expect(result.current.sanitizeField(input)).toBe(input);
    });
  });

  describe('validateSecurity', () => {
    it('should detect XSS patterns in data', () => {
      const { result } = renderHook(() => useSecureForm());

      const errors = result.current.validateSecurity({
        name: '<script>alert(1)</script>',
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass for safe data', () => {
      const { result } = renderHook(() => useSecureForm());

      const errors = result.current.validateSecurity({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(errors).toHaveLength(0);
    });

    it('should check nested objects', () => {
      const { result } = renderHook(() => useSecureForm());

      const errors = result.current.validateSecurity({
        user: {
          name: 'Safe',
          bio: '<script>evil()</script>',
        },
      });

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const { result } = renderHook(() =>
        useSecureForm({ maxSubmitsPerMinute: 5 })
      );

      expect(result.current.checkRateLimit('form-1')).toBe(true);
      expect(result.current.checkRateLimit('form-1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const { result } = renderHook(() =>
        useSecureForm({ maxSubmitsPerMinute: 2 })
      );

      // Use up the limit
      act(() => {
        result.current.checkRateLimit('form-1');
        result.current.checkRateLimit('form-1');
      });

      // Third request should be blocked
      let isBlocked: boolean;
      act(() => {
        isBlocked = !result.current.checkRateLimit('form-1');
      });

      expect(isBlocked!).toBe(true);
    });

    it('should track different forms separately', () => {
      const { result } = renderHook(() =>
        useSecureForm({ maxSubmitsPerMinute: 1 })
      );

      result.current.checkRateLimit('form-1');
      expect(result.current.checkRateLimit('form-1')).toBe(false);
      expect(result.current.checkRateLimit('form-2')).toBe(true);
    });
  });

  describe('secureSubmit', () => {
    it('should call submit function with sanitized data', async () => {
      const { result } = renderHook(() => useSecureForm());

      const submitFn = vi.fn().mockResolvedValue({ success: true });

      await act(async () => {
        await result.current.secureSubmit(
          'test-form',
          { name: '  John Doe  ' },
          submitFn
        );
      });

      expect(submitFn).toHaveBeenCalledWith({ name: 'John Doe' });
    });

    it('should set isSubmitting to false after submission', async () => {
      const { result } = renderHook(() => useSecureForm());

      const submitFn = vi.fn().mockResolvedValue({ success: true });

      await act(async () => {
        await result.current.secureSubmit('test-form', { name: 'Test' }, submitFn);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(submitFn).toHaveBeenCalled();
    });

    it('should throw on XSS content', async () => {
      const { result } = renderHook(() => useSecureForm());

      const submitFn = vi.fn();

      await expect(
        act(async () => {
          await result.current.secureSubmit(
            'test-form',
            { name: '<script>alert(1)</script>' },
            submitFn
          );
        })
      ).rejects.toThrow();

      expect(submitFn).not.toHaveBeenCalled();
    });

    it('should throw when rate limited', async () => {
      const { result } = renderHook(() =>
        useSecureForm({ maxSubmitsPerMinute: 1 })
      );

      const submitFn = vi.fn().mockResolvedValue({ success: true });

      // First submission should work
      await act(async () => {
        await result.current.secureSubmit('form', { name: 'Test' }, submitFn);
      });

      // Second should be rate limited
      await expect(
        act(async () => {
          await result.current.secureSubmit('form', { name: 'Test' }, submitFn);
        })
      ).rejects.toThrow('Too many submissions');
    });

    it('should reset isSubmitting on error', async () => {
      const { result } = renderHook(() => useSecureForm());

      const submitFn = vi.fn().mockRejectedValue(new Error('API Error'));

      await expect(
        act(async () => {
          await result.current.secureSubmit('form', { name: 'Test' }, submitFn);
        })
      ).rejects.toThrow('API Error');

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a form', () => {
      const { result } = renderHook(() =>
        useSecureForm({ maxSubmitsPerMinute: 1 })
      );

      // Exhaust rate limit
      result.current.checkRateLimit('form-1');
      expect(result.current.checkRateLimit('form-1')).toBe(false);

      // Reset and try again
      act(() => {
        result.current.resetRateLimit('form-1');
      });

      expect(result.current.isRateLimited).toBe(false);
      expect(result.current.checkRateLimit('form-1')).toBe(true);
    });
  });
});
