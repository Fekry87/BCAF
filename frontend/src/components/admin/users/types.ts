import type { PaginationMeta } from '@/types';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
  // SuiteDash sync fields
  suitedash_synced?: boolean;
  suitedash_contact_id?: string;
  suitedash_sync_error?: string;
  suitedash_synced_at?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  this_week: number;
  this_month: number;
}

export const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-slate-700 text-slate-400',
};

export type { PaginationMeta };
