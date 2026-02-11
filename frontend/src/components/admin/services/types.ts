import { z } from 'zod';
import type { Service, Pillar } from '@/types';

export const serviceSchema = z.object({
  pillar_id: z.string().min(1, 'Pillar is required'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  summary: z.string().min(1, 'Summary is required'),
  details: z.string().optional(),
  type: z.enum(['one_off', 'subscription']),
  price_from: z.string().optional(),
  price_label: z.string().optional(),
  icon: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  pillars: Pillar[];
}

// Re-export types from main types file for convenience
export type { Service, Pillar };
