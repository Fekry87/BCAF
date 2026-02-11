import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactApi } from './contact';
import * as api from './api';

// Mock the api module
vi.mock('./api', () => ({
  post: vi.fn(),
}));

describe('contactApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('should call post with contact endpoint and form data', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, message: 'Thank you for your message' },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I have a question',
        subject: 'General Inquiry',
      };

      await contactApi.submit(formData);

      expect(api.post).toHaveBeenCalledWith('/contact', formData);
    });

    it('should return submission response', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello',
          created_at: '2024-01-01',
        },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await contactApi.submit({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      await expect(
        contactApi.submit({
          name: 'Test',
          email: 'test@test.com',
          message: 'Test message',
        })
      ).rejects.toThrow('Network error');
    });
  });
});
