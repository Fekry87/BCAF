import { z } from 'zod';
import type { Pillar } from '@/types';

export const pillarSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  hero_image: z.string().optional(),
  card_image: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  sort_order: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type PillarFormValues = z.infer<typeof pillarSchema>;

export interface PillarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar?: Pillar | null;
}

// Re-export types from main types file for convenience
export type { Pillar };
