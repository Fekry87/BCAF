/**
 * API Integration Tests
 * Tests for all backend API endpoints
 */

import request from 'supertest';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';

describe('API Integration Tests', () => {
  // ============================================
  // HEALTH CHECK
  // ============================================
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(API_URL).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  // ============================================
  // PILLARS API
  // ============================================
  describe('Pillars API', () => {
    it('GET /api/pillars - should return all active pillars', async () => {
      const response = await request(API_URL).get('/api/pillars');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/pillars/:slug - should return a specific pillar', async () => {
      const response = await request(API_URL).get('/api/pillars/business-consultancy');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('slug', 'business-consultancy');
    });

    it('GET /api/pillars/:slug - should return 404 for non-existent pillar', async () => {
      const response = await request(API_URL).get('/api/pillars/non-existent-pillar');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // SERVICES API
  // ============================================
  describe('Services API', () => {
    it('GET /api/services - should return all active services', async () => {
      const response = await request(API_URL).get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/services - services should have required fields', async () => {
      const response = await request(API_URL).get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);

      const service = response.body.data[0];
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('title');
      expect(service).toHaveProperty('slug');
    });
  });

  // ============================================
  // FAQS API
  // ============================================
  describe('FAQs API', () => {
    it('GET /api/faqs - should return all active FAQs', async () => {
      const response = await request(API_URL).get('/api/faqs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // CONTACT API
  // ============================================
  describe('Contact API', () => {
    it('POST /api/contact - should submit contact form successfully', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message from the API tests.',
      };

      const response = await request(API_URL)
        .post('/api/contact')
        .send(contactData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('POST /api/contact - should fail with invalid email', async () => {
      const contactData = {
        name: 'Test User',
        email: 'invalid-email',
        message: 'This is a test message.',
      };

      const response = await request(API_URL)
        .post('/api/contact')
        .send(contactData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('POST /api/contact - should fail with short message', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Short',
      };

      const response = await request(API_URL)
        .post('/api/contact')
        .send(contactData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // ORDERS API
  // ============================================
  describe('Orders API', () => {
    it('POST /api/orders - should create order successfully', async () => {
      const orderData = {
        customer: {
          name: 'Test Customer',
          email: 'customer@example.com',
        },
        items: [
          { id: 1, quantity: 1 },
        ],
      };

      const response = await request(API_URL)
        .post('/api/orders')
        .send(orderData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data.orderNumber).toMatch(/^ORD-/);
    });

    it('POST /api/orders - order number should be unique', async () => {
      const orderData = {
        customer: {
          name: 'Test Customer',
          email: 'customer@example.com',
        },
        items: [
          { id: 1, quantity: 1 },
        ],
      };

      const response1 = await request(API_URL)
        .post('/api/orders')
        .send(orderData)
        .set('Content-Type', 'application/json');

      const response2 = await request(API_URL)
        .post('/api/orders')
        .send(orderData)
        .set('Content-Type', 'application/json');

      expect(response1.body.data.orderNumber).not.toBe(response2.body.data.orderNumber);
    });
  });

  // ============================================
  // AUTHENTICATION API
  // ============================================
  describe('Authentication API', () => {
    it('POST /api/auth/login - should login successfully with valid credentials', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'admin@consultancy.test',
          password: 'password',
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('admin@consultancy.test');
    });

    it('POST /api/auth/login - should fail with invalid credentials', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'admin@consultancy.test',
          password: 'wrongpassword',
        })
        .set('Content-Type', 'application/json');

      // API returns 422 for invalid credentials
      expect([401, 422]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/auth/user - should fail when not authenticated', async () => {
      const response = await request(API_URL).get('/api/auth/user');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // CONTENT API
  // ============================================
  describe('Content API', () => {
    it('GET /api/content/header - should return header content', async () => {
      const response = await request(API_URL).get('/api/content/header');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nav_links');
    });

    it('GET /api/content/footer - should return footer content', async () => {
      const response = await request(API_URL).get('/api/content/footer');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ============================================
  // SECURITY TESTS
  // ============================================
  describe('Security', () => {
    it('should have security headers', async () => {
      const response = await request(API_URL).get('/api/health');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should sanitize XSS in contact form', async () => {
      const contactData = {
        name: '<script>alert("xss")</script>Test',
        email: 'test@example.com',
        message: 'Normal message with <script>bad code</script> embedded.',
      };

      const response = await request(API_URL)
        .post('/api/contact')
        .send(contactData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      // Scripts should be stripped/escaped
      expect(response.body.data.name).not.toContain('<script>');
    });

    it('Admin routes should require authentication', async () => {
      const response = await request(API_URL).get('/api/admin/dashboard/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
