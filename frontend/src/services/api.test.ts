import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { get, post, put, patch, del } from './api';

// Default handlers for unhandled requests
const defaultHandlers = [
  http.all('*', () => {
    return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }),
];

// Create MSW server with default handlers
const server = setupServer(...defaultHandlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

describe('API Service', () => {
  describe('get', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };

      server.use(
        http.get('*/api/test', () => {
          return HttpResponse.json({
            success: true,
            data: mockData,
          });
        })
      );

      const result = await get<typeof mockData>('/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should pass query parameters', async () => {
      server.use(
        http.get('*/api/test', ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page');
          const limit = url.searchParams.get('limit');

          return HttpResponse.json({
            success: true,
            data: { page: Number(page), limit: Number(limit) },
          });
        })
      );

      const result = await get<{ page: number; limit: number }>('/test', {
        page: 1,
        limit: 10,
      });

      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it('should handle error responses', async () => {
      server.use(
        http.get('*/api/test', () => {
          return HttpResponse.json(
            { success: false, message: 'Not found' },
            { status: 404 }
          );
        })
      );

      await expect(get('/test')).rejects.toThrow();
    });
  });

  describe('post', () => {
    it('should make POST request with data', async () => {
      const requestData = { name: 'New Item' };

      server.use(
        http.post('*/api/items', async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return HttpResponse.json({
            success: true,
            data: { id: 1, name: body.name },
          });
        })
      );

      const result = await post<{ id: number; name: string }>('/items', requestData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('New Item');
      expect(result.data?.id).toBe(1);
    });

    it('should handle POST without body', async () => {
      server.use(
        http.post('*/api/action', () => {
          return HttpResponse.json({
            success: true,
            data: { status: 'completed' },
          });
        })
      );

      const result = await post<{ status: string }>('/action');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
    });
  });

  describe('put', () => {
    it('should make PUT request with data', async () => {
      const updateData = { id: 1, name: 'Updated Item' };

      server.use(
        http.put('*/api/items/1', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            success: true,
            data: body,
          });
        })
      );

      const result = await put<typeof updateData>('/items/1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updateData);
    });
  });

  describe('patch', () => {
    it('should make PATCH request with partial data', async () => {
      server.use(
        http.patch('*/api/items/1', async ({ request }) => {
          const body = (await request.json()) as { status: string };
          return HttpResponse.json({
            success: true,
            data: { id: 1, name: 'Item', status: body.status },
          });
        })
      );

      const result = await patch<{ id: number; name: string; status: string }>(
        '/items/1',
        { status: 'active' }
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('active');
    });
  });

  describe('del', () => {
    it('should make DELETE request', async () => {
      server.use(
        http.delete('*/api/items/1', () => {
          return HttpResponse.json({
            success: true,
            data: null,
          });
        })
      );

      const result = await del<null>('/items/1');

      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle 500 server errors', async () => {
      server.use(
        http.get('*/api/error', () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(get('/error')).rejects.toThrow();
    });

    it('should handle validation errors (422)', async () => {
      server.use(
        http.post('*/api/validate', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: { name: ['Name is required'] },
            },
            { status: 422 }
          );
        })
      );

      await expect(post('/validate', {})).rejects.toThrow();
    });
  });

  describe('response parsing', () => {
    it('should parse JSON response with pagination', async () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      server.use(
        http.get('*/api/items', () => {
          return HttpResponse.json({
            success: true,
            data: items,
            meta: {
              pagination: {
                current_page: 1,
                last_page: 5,
                total: 50,
              },
            },
          });
        })
      );

      const result = await get<typeof items>('/items');

      expect(result.data).toHaveLength(2);
      expect(result.meta?.pagination?.current_page).toBe(1);
    });
  });
});
