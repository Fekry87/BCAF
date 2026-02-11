export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: Record<string, string[]> | null;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Pillar {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  hero_image: string | null;
  card_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  is_active: boolean;
  services?: Service[];
  faqs?: Faq[];
  services_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  pillar_id: number;
  type: 'one_off' | 'subscription';
  type_label: string;
  title: string;
  slug: string;
  summary: string;
  details: string | null;
  icon: string | null;
  icon_image: string | null;
  price_from: number | null;
  price_label: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  pillar?: Pillar;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: number;
  pillar_id: number | null;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  is_global: boolean;
  pillar?: Pillar;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  pillar_id: number | null;
  message: string;
  status: 'new' | 'in_progress' | 'synced' | 'failed' | 'closed';
  status_label: string;
  suitedash_external_id: string | null;
  synced_at: string | null;
  source: string;
  is_synced: boolean;
  pillar?: Pillar;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  pillar_id?: number;
  message: string;
}

// User roles
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

// Permission types
export type Permission =
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'orders:read'
  | 'orders:write'
  | 'orders:delete'
  | 'integrations:read'
  | 'integrations:write'
  | 'settings:read'
  | 'settings:write';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  permissions?: Permission[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CallLog {
  id: number;
  ringcentral_id: string;
  session_id: string | null;
  direction: 'inbound' | 'outbound';
  type: 'voice' | 'fax' | 'sms';
  action: string | null;
  result: string | null;
  start_time: string;
  duration: number | null;
  duration_formatted: string;
  from_number: string | null;
  to_number: string | null;
  from_data: Record<string, unknown> | null;
  to_data: Record<string, unknown> | null;
  recording_url: string | null;
  contact_submission_id: number | null;
  created_at: string;
}

export interface IntegrationLog {
  id: number;
  provider: string;
  action: string;
  request_id: string | null;
  status: 'pending' | 'success' | 'failed';
  error_message: string | null;
  http_status: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ContactStats {
  total: number;
  new: number;
  in_progress: number;
  synced: number;
  failed: number;
  this_week: number;
  this_month: number;
}
