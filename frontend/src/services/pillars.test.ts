import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pillarsApi, servicesApi, faqsApi } from './pillars';
import * as api from './api';

// Mock the api module
vi.mock('./api', () => ({
  get: vi.fn(),
}));

describe('pillarsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call get with /pillars endpoint', async () => {
      const mockPillars = [{ id: 1, name: 'Business', slug: 'business' }];
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockPillars });

      await pillarsApi.getAll();

      expect(api.get).toHaveBeenCalledWith('/pillars');
    });

    it('should return pillars data', async () => {
      const mockPillars = [
        { id: 1, name: 'Business Consultancy', slug: 'business-consultancy' },
        { id: 2, name: 'Education Support', slug: 'education-support' },
      ];
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockPillars });

      const result = await pillarsApi.getAll();

      expect(result).toEqual({ success: true, data: mockPillars });
    });
  });

  describe('getBySlug', () => {
    it('should call get with pillar slug', async () => {
      const mockPillar = { id: 1, name: 'Business', slug: 'business' };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockPillar });

      await pillarsApi.getBySlug('business');

      expect(api.get).toHaveBeenCalledWith('/pillars/business');
    });

    it('should return pillar data', async () => {
      const mockPillar = { id: 1, name: 'Business Consultancy', slug: 'business-consultancy' };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockPillar });

      const result = await pillarsApi.getBySlug('business-consultancy');

      expect(result.data).toEqual(mockPillar);
    });
  });

  describe('getServices', () => {
    it('should call get with pillar services endpoint', async () => {
      const mockData = {
        pillar: { id: 1, name: 'Business', slug: 'business' },
        one_off: [],
        subscription: [],
      };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockData });

      await pillarsApi.getServices('business');

      expect(api.get).toHaveBeenCalledWith('/pillars/business/services');
    });

    it('should return services data with pillar info', async () => {
      const mockData = {
        pillar: { id: 1, name: 'Business', slug: 'business' },
        one_off: [{ id: 1, title: 'Assessment', type: 'one_off' }],
        subscription: [{ id: 2, title: 'Support', type: 'subscription' }],
      };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockData });

      const result = await pillarsApi.getServices('business');

      expect(result.data).toEqual(mockData);
      expect(result.data?.one_off).toHaveLength(1);
      expect(result.data?.subscription).toHaveLength(1);
    });
  });

  describe('getFaqs', () => {
    it('should call get with pillar faqs endpoint', async () => {
      const mockData = {
        pillar_faqs: [],
        global_faqs: [],
      };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockData });

      await pillarsApi.getFaqs('business');

      expect(api.get).toHaveBeenCalledWith('/pillars/business/faqs');
    });

    it('should return both pillar and global faqs', async () => {
      const mockData = {
        pillar_faqs: [{ id: 1, question: 'Pillar FAQ?', answer: 'Answer' }],
        global_faqs: [{ id: 2, question: 'Global FAQ?', answer: 'Answer' }],
      };
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockData });

      const result = await pillarsApi.getFaqs('business');

      expect(result.data?.pillar_faqs).toHaveLength(1);
      expect(result.data?.global_faqs).toHaveLength(1);
    });
  });
});

describe('servicesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call get with /services endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: true, data: [] });

      await servicesApi.getAll();

      expect(api.get).toHaveBeenCalledWith('/services');
    });
  });

  describe('getFeatured', () => {
    it('should call get with /services/featured endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: true, data: [] });

      await servicesApi.getFeatured();

      expect(api.get).toHaveBeenCalledWith('/services/featured');
    });

    it('should return featured services', async () => {
      const mockServices = [
        { id: 1, title: 'Featured Service', is_featured: true },
      ];
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockServices });

      const result = await servicesApi.getFeatured();

      expect(result.data).toEqual(mockServices);
    });
  });

  describe('getBySlug', () => {
    it('should call get with service slug', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: true, data: {} });

      await servicesApi.getBySlug('strategic-assessment');

      expect(api.get).toHaveBeenCalledWith('/services/strategic-assessment');
    });
  });
});

describe('faqsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call get with /faqs endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: true, data: [] });

      await faqsApi.getAll();

      expect(api.get).toHaveBeenCalledWith('/faqs');
    });
  });

  describe('getGlobal', () => {
    it('should call get with /faqs/global endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: true, data: [] });

      await faqsApi.getGlobal();

      expect(api.get).toHaveBeenCalledWith('/faqs/global');
    });

    it('should return global faqs', async () => {
      const mockFaqs = [
        { id: 1, question: 'What is this?', answer: 'This is a FAQ.', is_global: true },
      ];
      vi.mocked(api.get).mockResolvedValue({ success: true, data: mockFaqs });

      const result = await faqsApi.getGlobal();

      expect(result.data).toEqual(mockFaqs);
    });
  });
});
