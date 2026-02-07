import { get } from './api';
import type { Pillar, Service, Faq } from '@/types';

export const pillarsApi = {
  getAll: () => get<Pillar[]>('/pillars'),

  getBySlug: (slug: string) => get<Pillar>(`/pillars/${slug}`),

  getServices: (slug: string) => get<{
    pillar: Pillar;
    one_off: Service[];
    subscription: Service[];
  }>(`/pillars/${slug}/services`),

  getFaqs: (slug: string) => get<{
    pillar_faqs: Faq[];
    global_faqs: Faq[];
  }>(`/pillars/${slug}/faqs`),
};

export const servicesApi = {
  getAll: () => get<Service[]>('/services'),
  getFeatured: () => get<Service[]>('/services/featured'),
  getBySlug: (slug: string) => get<Service>(`/services/${slug}`),
};

export const faqsApi = {
  getAll: () => get<Faq[]>('/faqs'),
  getGlobal: () => get<Faq[]>('/faqs/global'),
};
