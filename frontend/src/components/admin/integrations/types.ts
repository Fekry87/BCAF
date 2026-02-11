// ============================================
// SuiteDash Types
// ============================================
export interface SuiteDashConfig {
  enabled: boolean;
  public_id: string;
  secret_key: string;
  api_base_url: string;
  webhook_url: string;
  sync_settings: {
    sync_contacts: boolean;
    sync_companies: boolean;
    sync_projects: boolean;
    sync_invoices: boolean;
    auto_sync: boolean;
    sync_interval: number;
  };
  last_sync: string | null;
  connection_status: 'connected' | 'disconnected' | 'error';
  connection_message: string;
  invoice_api_available?: boolean;
}

export interface SyncLog {
  id: string;
  type: 'contacts' | 'companies' | 'projects' | 'invoices';
  status: 'success' | 'failed' | 'pending';
  items_synced: number;
  timestamp: string;
  message: string;
}

export interface IntegrationStats {
  total_contacts_synced: number;
  total_companies_synced: number;
  total_projects_synced: number;
  total_invoices_synced: number;
  last_successful_sync: string | null;
  pending_contacts?: number;
  pending_invoices?: number;
}

// ============================================
// RingCentral Types
// ============================================
export interface RingCentralConfig {
  enabled: boolean;
  client_id: string;
  client_secret: string;
  jwt_token: string;
  account_id: string;
  extension_id: string;
  webhook_url: string;
  features: {
    enable_calls: boolean;
    enable_sms: boolean;
    enable_video: boolean;
    enable_voicemail: boolean;
    click_to_call: boolean;
    call_recording: boolean;
    auto_log_calls: boolean;
  };
  caller_id: string;
  default_country_code: string;
  connection_status: 'connected' | 'disconnected' | 'error';
}

export interface RingCentralStats {
  total_calls_made: number;
  total_calls_received: number;
  total_sms_sent: number;
  total_meetings: number;
  last_activity: string | null;
}

// ============================================
// Default Configurations
// ============================================
export const defaultSuiteDashConfig: SuiteDashConfig = {
  enabled: false,
  public_id: '',
  secret_key: '',
  api_base_url: 'https://app.suitedash.com/secure-api',
  webhook_url: '',
  sync_settings: {
    sync_contacts: true,
    sync_companies: true,
    sync_projects: true,
    sync_invoices: true,
    auto_sync: false,
    sync_interval: 30,
  },
  last_sync: null,
  connection_status: 'disconnected',
  connection_message: '',
};

export const defaultRingCentralConfig: RingCentralConfig = {
  enabled: false,
  client_id: '',
  client_secret: '',
  jwt_token: '',
  account_id: '',
  extension_id: '',
  webhook_url: '',
  features: {
    enable_calls: true,
    enable_sms: true,
    enable_video: true,
    enable_voicemail: true,
    click_to_call: true,
    call_recording: false,
    auto_log_calls: true,
  },
  caller_id: '',
  default_country_code: '+1',
  connection_status: 'disconnected',
};
