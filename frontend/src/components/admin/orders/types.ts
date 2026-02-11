import type { PaginationMeta as BasePaginationMeta } from '@/types';

export type PaginationMeta = BasePaginationMeta;

export interface OrderItem {
  serviceId: number;
  title: string;
  type: string;
  price: number;
  pillarName?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  items: OrderItem[];
  notes?: string;
  total: number;
  status: string;
  status_label?: string;
  paymentStatus: string;
  payment_status_label?: string;
  createdAt: string;
  updatedAt: string;
  // SuiteDash sync fields
  suitedash_synced?: boolean;
  suitedash_contact_id?: string;
  suitedash_invoice_id?: string;
  suitedash_sync_error?: string;
  suitedash_synced_at?: string;
  payment_url?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  paid: number;
  unpaid: number;
  this_week: number;
  this_month: number;
  total_revenue: number;
  pending_revenue: number;
}

export interface OrdersQueryParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
}

export interface OrdersResponse {
  data: Order[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-red-500/20 text-red-400',
  paid: 'bg-green-500/20 text-green-400',
  refunded: 'bg-slate-700 text-slate-400',
};
