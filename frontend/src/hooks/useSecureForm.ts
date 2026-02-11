import { useCallback, useState } from 'react';
import {
  sanitizeInput,
  containsXssPatterns,
  RateLimiter,
} from '@/utils/security';

interface UseSecureFormOptions {
  maxSubmitsPerMinute?: number;
  sanitizeOnChange?: boolean;
}

interface SecureFormState {
  isSubmitting: boolean;
  isRateLimited: boolean;
  rateLimitRemainingMs: number;
  securityErrors: string[];
}

/**
 * Hook for secure form handling with XSS prevention and rate limiting
 */
export function useSecureForm(options: UseSecureFormOptions = {}) {
  const { maxSubmitsPerMinute = 5, sanitizeOnChange = true } = options;

  const [state, setState] = useState<SecureFormState>({
    isSubmitting: false,
    isRateLimited: false,
    rateLimitRemainingMs: 0,
    securityErrors: [],
  });

  // Create rate limiter instance
  const [rateLimiter] = useState(
    () => new RateLimiter(maxSubmitsPerMinute, 60000)
  );

  /**
   * Sanitize a single field value
   */
  const sanitizeField = useCallback(
    (value: string): string => {
      if (!sanitizeOnChange) return value;
      return sanitizeInput(value);
    },
    [sanitizeOnChange]
  );

  /**
   * Validate all form data for security issues
   */
  const validateSecurity = useCallback(
    (data: Record<string, unknown>): string[] => {
      const errors: string[] = [];

      const checkValue = (value: unknown, path: string) => {
        if (typeof value === 'string' && containsXssPatterns(value)) {
          errors.push(`Potentially unsafe content detected in ${path}`);
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value as Record<string, unknown>).forEach(
            ([key, val]) => {
              checkValue(val, `${path}.${key}`);
            }
          );
        }
      };

      Object.entries(data).forEach(([key, value]) => {
        checkValue(value, key);
      });

      return errors;
    },
    []
  );

  /**
   * Check rate limit before submission
   */
  const checkRateLimit = useCallback(
    (formId: string): boolean => {
      if (!rateLimiter.isAllowed(formId)) {
        const remaining = rateLimiter.getRemainingTime(formId);
        setState((prev) => ({
          ...prev,
          isRateLimited: true,
          rateLimitRemainingMs: remaining,
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        isRateLimited: false,
        rateLimitRemainingMs: 0,
      }));
      return true;
    },
    [rateLimiter]
  );

  /**
   * Secure submit wrapper
   */
  const secureSubmit = useCallback(
    async <T>(
      formId: string,
      data: Record<string, unknown>,
      submitFn: (sanitizedData: Record<string, unknown>) => Promise<T>
    ): Promise<T | null> => {
      // Check rate limit
      if (!checkRateLimit(formId)) {
        throw new Error('Too many submissions. Please wait before trying again.');
      }

      // Validate security
      const securityErrors = validateSecurity(data);
      if (securityErrors.length > 0) {
        setState((prev) => ({ ...prev, securityErrors }));
        throw new Error('Security validation failed');
      }

      setState((prev) => ({
        ...prev,
        isSubmitting: true,
        securityErrors: [],
      }));

      try {
        // Sanitize string values before submission
        const sanitizedData = sanitizeFormData(data);
        const result = await submitFn(sanitizedData);

        setState((prev) => ({ ...prev, isSubmitting: false }));
        return result;
      } catch (error) {
        setState((prev) => ({ ...prev, isSubmitting: false }));
        throw error;
      }
    },
    [checkRateLimit, validateSecurity]
  );

  /**
   * Reset rate limit for a form
   */
  const resetRateLimit = useCallback(
    (formId: string) => {
      rateLimiter.reset(formId);
      setState((prev) => ({
        ...prev,
        isRateLimited: false,
        rateLimitRemainingMs: 0,
      }));
    },
    [rateLimiter]
  );

  return {
    ...state,
    sanitizeField,
    validateSecurity,
    checkRateLimit,
    secureSubmit,
    resetRateLimit,
  };
}

/**
 * Recursively sanitize form data
 */
function sanitizeFormData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInput(item)
          : typeof item === 'object' && item !== null
            ? sanitizeFormData(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeFormData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}
