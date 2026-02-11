import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './auth';
import * as api from './api';

// Mock the api module
vi.mock('./api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call post with login endpoint and credentials', async () => {
      const mockResponse = {
        success: true,
        data: { user: { id: 1, email: 'test@test.com' }, token: 'abc123' },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const credentials = { email: 'test@test.com', password: 'password123' };
      await authApi.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should return login response', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@test.com', firstName: 'Test' },
          token: 'abc123',
        },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authApi.login({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call post with logout endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue({ success: true });

      await authApi.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getUser', () => {
    it('should call get with user endpoint', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User' },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await authApi.getUser();

      expect(api.get).toHaveBeenCalledWith('/auth/user');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should call post with refresh endpoint', async () => {
      const mockResponse = { success: true, data: { token: 'newtoken123' } };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authApi.refresh();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse);
    });
  });
});
