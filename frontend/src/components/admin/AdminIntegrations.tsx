import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plug,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Zap,
  Database,
  CreditCard,
  Users,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  Video,
  Mail,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
} from 'lucide-react';
import { get, put, post } from '@/services/api';
import { Button } from '@/components/ui';

// ============================================
// SuiteDash Types & Config
// ============================================
interface SuiteDashConfig {
  enabled: boolean;
  public_id: string; // X-Public-ID header
  secret_key: string; // X-Secret-Key header
  api_base_url: string; // SuiteDash API base URL
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
}

interface SyncLog {
  id: string;
  type: 'contacts' | 'companies' | 'projects' | 'invoices';
  status: 'success' | 'failed' | 'pending';
  items_synced: number;
  timestamp: string;
  message: string;
}

interface IntegrationStats {
  total_contacts_synced: number;
  total_companies_synced: number;
  total_projects_synced: number;
  total_invoices_synced: number;
  last_successful_sync: string | null;
  pending_contacts?: number;
  pending_invoices?: number;
}

const defaultSuiteDashConfig: SuiteDashConfig = {
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

// ============================================
// RingCentral Types & Config
// ============================================
interface RingCentralConfig {
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

interface RingCentralStats {
  total_calls_made: number;
  total_calls_received: number;
  total_sms_sent: number;
  total_meetings: number;
  last_activity: string | null;
}

const defaultRingCentralConfig: RingCentralConfig = {
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

const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";

// ============================================
// SuiteDash Integration Component
// ============================================
function SuiteDashIntegration() {
  const queryClient = useQueryClient();
  const [showPublicId, setShowPublicId] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [config, setConfig] = useState<SuiteDashConfig>(defaultSuiteDashConfig);
  const [isTesting, setIsTesting] = useState(false);

  const { data: configData, isLoading } = useQuery({
    queryKey: ['admin', 'integrations', 'suitedash'],
    queryFn: () => get<SuiteDashConfig>('/admin/integrations/suitedash'),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'integrations', 'suitedash', 'stats'],
    queryFn: () => get<IntegrationStats>('/admin/integrations/suitedash/stats'),
    enabled: config.enabled && config.connection_status === 'connected',
  });

  const { data: logsData } = useQuery({
    queryKey: ['admin', 'integrations', 'suitedash', 'logs'],
    queryFn: () => get<SyncLog[]>('/admin/integrations/suitedash/logs'),
    enabled: config.enabled,
  });

  useEffect(() => {
    if (configData?.data) {
      setConfig(configData.data);
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: (data: SuiteDashConfig) => put<SuiteDashConfig>('/admin/integrations/suitedash', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'suitedash'] });
      toast.success('SuiteDash configuration saved');
    },
    onError: () => {
      toast.error('Failed to save configuration');
    },
  });

  const syncMutation = useMutation({
    mutationFn: (type: 'all' | 'contacts' | 'companies' | 'projects' | 'invoices') =>
      post<{ message: string }>(`/admin/integrations/suitedash/sync`, { type }),
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'suitedash'] });
      toast.success(`${type === 'all' ? 'All data' : type.charAt(0).toUpperCase() + type.slice(1)} synced successfully`);
    },
    onError: () => {
      toast.error('Sync failed. Please check your configuration.');
    },
  });

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await post<{ success: boolean; message: string }>('/admin/integrations/suitedash/test', {
        public_id: config.public_id,
        secret_key: config.secret_key,
        api_base_url: config.api_base_url,
      });
      if (response.data?.success) {
        setConfig(prev => ({ ...prev, connection_status: 'connected', connection_message: 'Connected to SuiteDash API' }));
        toast.success('SuiteDash connection successful!');
      } else {
        setConfig(prev => ({ ...prev, connection_status: 'error', connection_message: response.data?.message || 'Connection failed' }));
        toast.error(response.data?.message || 'Connection failed');
      }
    } catch {
      setConfig(prev => ({ ...prev, connection_status: 'error', connection_message: 'Failed to connect to SuiteDash API' }));
      toast.error('Connection failed. Please check your credentials.');
    }
    setIsTesting(false);
  };

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const stats = statsData?.data;
  const logs = logsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plug className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">SuiteDash CRM</h2>
              <p className="text-sm text-slate-400">Manage payments, customers, and sync data</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium ${
              config.connection_status === 'connected'
                ? 'bg-green-500/20 text-green-400'
                : config.connection_status === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {config.connection_status === 'connected' ? (
                <><CheckCircle2 className="h-4 w-4" /> Connected</>
              ) : config.connection_status === 'error' ? (
                <><XCircle className="h-4 w-4" /> Error</>
              ) : (
                <><Clock className="h-4 w-4" /> Disconnected</>
              )}
            </span>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Sync Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Contacts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_contacts_synced}</p>
                  {stats.pending_contacts !== undefined && stats.pending_contacts > 0 && (
                    <p className="text-xs text-yellow-400 mt-1">{stats.pending_contacts} pending</p>
                  )}
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-xs">Companies</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_companies_synced}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Projects</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_projects_synced}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs">Invoices</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_invoices_synced}</p>
                  {stats.pending_invoices !== undefined && stats.pending_invoices > 0 && (
                    <p className="text-xs text-yellow-400 mt-1">{stats.pending_invoices} pending</p>
                  )}
                </div>
              </div>
              {stats.last_successful_sync && (
                <p className="text-xs text-slate-500 mt-4">
                  Last synced: {new Date(stats.last_successful_sync).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* API Configuration */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">API Configuration</h3>
                <p className="text-sm text-slate-400">Enter your SuiteDash Secure API credentials</p>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
              <p className="text-sm text-blue-300">
                <strong>How to get credentials:</strong> Log in to SuiteDash → Integrations → Secure API → Copy your Public ID and create a Secret Key
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={darkLabelClass}>Public ID (X-Public-ID)</label>
                <div className="relative">
                  <input
                    type={showPublicId ? 'text' : 'password'}
                    value={config.public_id}
                    onChange={(e) => setConfig(prev => ({ ...prev, public_id: e.target.value }))}
                    className={darkInputClass}
                    placeholder="00000000-0000-0000-0000-000000000000"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublicId(!showPublicId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPublicId ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Found in Integrations → Secure API</p>
              </div>

              <div>
                <label className={darkLabelClass}>Secret Key (X-Secret-Key)</label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={config.secret_key}
                    onChange={(e) => setConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                    className={darkInputClass}
                    placeholder="Enter your Secret Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSecretKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Click "+ Add Secret Key" in SuiteDash to generate</p>
              </div>

              <div>
                <label className={darkLabelClass}>API Base URL</label>
                <input
                  type="text"
                  value={config.api_base_url}
                  onChange={(e) => setConfig(prev => ({ ...prev, api_base_url: e.target.value }))}
                  className={darkInputClass}
                  placeholder="https://app.suitedash.com/secure-api"
                />
                <p className="text-xs text-slate-500 mt-1">Default: https://app.suitedash.com/secure-api</p>
              </div>

              <div>
                <label className={darkLabelClass}>Webhook URL (Auto-generated)</label>
                <input
                  type="text"
                  value={config.webhook_url || `${window.location.origin}/api/webhooks/suitedash`}
                  readOnly
                  className={`${darkInputClass} bg-slate-800 cursor-not-allowed`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={testConnection}
                variant="secondary"
                isLoading={isTesting}
                disabled={!config.public_id || !config.secret_key}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <a
                href="https://app.suitedash.com/secure-api/swagger"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                View API Docs
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Sync Settings */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sync Settings</h3>
                <p className="text-sm text-slate-400">Configure what data to sync with SuiteDash</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'sync_contacts', label: 'Sync Contacts', description: 'Sync customer contacts', icon: Users },
                { key: 'sync_companies', label: 'Sync Companies', description: 'Sync company records', icon: Database },
                { key: 'sync_projects', label: 'Sync Projects', description: 'Sync project data', icon: FileText },
                { key: 'sync_invoices', label: 'Sync Invoices', description: 'Sync invoice/payment data', icon: CreditCard },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = config.sync_settings[item.key as keyof typeof config.sync_settings] as boolean;
                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isEnabled ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-900/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isEnabled ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="font-medium text-white">{item.label}</span>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        sync_settings: {
                          ...prev.sync_settings,
                          [item.key]: !prev.sync_settings[item.key as keyof typeof prev.sync_settings],
                        },
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-blue-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Sync */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Manual Sync</h3>
              {config.connection_status !== 'connected' && (
                <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">Demo Mode</span>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Sync your contacts, invoices, and other data with SuiteDash.
              {config.connection_status !== 'connected' && ' (Running in demo mode - data will be simulated)'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => syncMutation.mutate('all')}
                isLoading={syncMutation.isPending}
                variant="primary"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All
              </Button>
              <Button onClick={() => syncMutation.mutate('contacts')} variant="secondary" size="sm" disabled={syncMutation.isPending}>
                Contacts
              </Button>
              <Button onClick={() => syncMutation.mutate('companies')} variant="secondary" size="sm" disabled={syncMutation.isPending}>
                Companies
              </Button>
              <Button onClick={() => syncMutation.mutate('projects')} variant="secondary" size="sm" disabled={syncMutation.isPending}>
                Projects
              </Button>
              <Button onClick={() => syncMutation.mutate('invoices')} variant="secondary" size="sm" disabled={syncMutation.isPending}>
                Invoices
              </Button>
            </div>
          </div>

          {/* Sync Logs */}
          {logs.length > 0 && (
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-slate-300 capitalize">{log.type}</span>
                    </div>
                    <span className="text-slate-500">{log.items_synced} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Save Button */}
      <div className="p-6 bg-slate-900/50">
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// RingCentral Integration Component
// ============================================
function RingCentralIntegration() {
  const queryClient = useQueryClient();
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showJwtToken, setShowJwtToken] = useState(false);
  const [config, setConfig] = useState<RingCentralConfig>(defaultRingCentralConfig);
  const [isTesting, setIsTesting] = useState(false);

  const { data: configData, isLoading } = useQuery({
    queryKey: ['admin', 'integrations', 'ringcentral'],
    queryFn: () => get<RingCentralConfig>('/admin/integrations/ringcentral'),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'integrations', 'ringcentral', 'stats'],
    queryFn: () => get<RingCentralStats>('/admin/integrations/ringcentral/stats'),
    enabled: config.enabled && config.connection_status === 'connected',
  });

  useEffect(() => {
    if (configData?.data) {
      setConfig(configData.data);
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: (data: RingCentralConfig) => put<RingCentralConfig>('/admin/integrations/ringcentral', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'ringcentral'] });
      toast.success('RingCentral configuration saved');
    },
    onError: () => {
      toast.error('Failed to save configuration');
    },
  });

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await post<{ success: boolean; message: string }>('/admin/integrations/ringcentral/test', {
        client_id: config.client_id,
        client_secret: config.client_secret,
        jwt_token: config.jwt_token,
      });
      if (response.data?.success) {
        setConfig(prev => ({ ...prev, connection_status: 'connected' }));
        toast.success('RingCentral connected successfully!');
      } else {
        setConfig(prev => ({ ...prev, connection_status: 'error' }));
        toast.error(response.data?.message || 'Connection failed');
      }
    } catch {
      setConfig(prev => ({ ...prev, connection_status: 'error' }));
      toast.error('Connection failed. Please check your credentials.');
    }
    setIsTesting(false);
  };

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const stats = statsData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Phone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">RingCentral</h2>
              <p className="text-sm text-slate-400">Phone, SMS, and video communications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium ${
              config.connection_status === 'connected'
                ? 'bg-green-500/20 text-green-400'
                : config.connection_status === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {config.connection_status === 'connected' ? (
                <><CheckCircle2 className="h-4 w-4" /> Connected</>
              ) : config.connection_status === 'error' ? (
                <><XCircle className="h-4 w-4" /> Error</>
              ) : (
                <><Clock className="h-4 w-4" /> Disconnected</>
              )}
            </span>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-orange-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Stats Overview */}
          {config.connection_status === 'connected' && stats && (
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Communication Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <PhoneOutgoing className="h-4 w-4" />
                    <span className="text-xs">Outbound Calls</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_calls_made}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <PhoneIncoming className="h-4 w-4" />
                    <span className="text-xs">Inbound Calls</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_calls_received}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">SMS Sent</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_sms_sent}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Video className="h-4 w-4" />
                    <span className="text-xs">Video Meetings</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_meetings}</p>
                </div>
              </div>
            </div>
          )}

          {/* API Configuration */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">API Configuration</h3>
                <p className="text-sm text-slate-400">Enter your RingCentral API credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={darkLabelClass}>Client ID</label>
                <input
                  type="text"
                  value={config.client_id}
                  onChange={(e) => setConfig(prev => ({ ...prev, client_id: e.target.value }))}
                  className={darkInputClass}
                  placeholder="Enter your RingCentral Client ID"
                />
              </div>

              <div>
                <label className={darkLabelClass}>Client Secret</label>
                <div className="relative">
                  <input
                    type={showClientSecret ? 'text' : 'password'}
                    value={config.client_secret}
                    onChange={(e) => setConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                    className={darkInputClass}
                    placeholder="Enter your Client Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showClientSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={darkLabelClass}>JWT Token</label>
                <div className="relative">
                  <input
                    type={showJwtToken ? 'text' : 'password'}
                    value={config.jwt_token}
                    onChange={(e) => setConfig(prev => ({ ...prev, jwt_token: e.target.value }))}
                    className={darkInputClass}
                    placeholder="Enter your JWT token for authentication"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJwtToken(!showJwtToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showJwtToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Generate a JWT token from the RingCentral Developer Console</p>
              </div>

              <div>
                <label className={darkLabelClass}>Caller ID</label>
                <input
                  type="text"
                  value={config.caller_id}
                  onChange={(e) => setConfig(prev => ({ ...prev, caller_id: e.target.value }))}
                  className={darkInputClass}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className={darkLabelClass}>Default Country Code</label>
                <select
                  value={config.default_country_code}
                  onChange={(e) => setConfig(prev => ({ ...prev, default_country_code: e.target.value }))}
                  className={darkInputClass}
                >
                  <option value="+1">+1 (USA/Canada)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+49">+49 (Germany)</option>
                  <option value="+33">+33 (France)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+966">+966 (Saudi Arabia)</option>
                  <option value="+20">+20 (Egypt)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={darkLabelClass}>Webhook URL (Auto-generated)</label>
                <input
                  type="text"
                  value={config.webhook_url || `${window.location.origin}/api/webhooks/ringcentral`}
                  readOnly
                  className={`${darkInputClass} bg-slate-800 cursor-not-allowed`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={testConnection}
                variant="secondary"
                isLoading={isTesting}
                disabled={!config.client_id || !config.client_secret || !config.jwt_token}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <PhoneCall className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Features</h3>
                <p className="text-sm text-slate-400">Enable or disable communication features</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'enable_calls', label: 'Voice Calls', description: 'Make and receive phone calls', icon: Phone },
                { key: 'enable_sms', label: 'SMS Messaging', description: 'Send and receive text messages', icon: MessageSquare },
                { key: 'enable_video', label: 'Video Meetings', description: 'Host video conferences', icon: Video },
                { key: 'enable_voicemail', label: 'Voicemail', description: 'Access voicemail messages', icon: Mail },
                { key: 'click_to_call', label: 'Click-to-Call', description: 'Call customers from dashboard', icon: PhoneCall },
                { key: 'call_recording', label: 'Call Recording', description: 'Record calls for quality assurance', icon: Database },
                { key: 'auto_log_calls', label: 'Auto-Log Calls', description: 'Automatically log call history', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = config.features[item.key as keyof typeof config.features];
                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isEnabled ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-900/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isEnabled ? 'bg-orange-500/20' : 'bg-slate-700'
                      }`}>
                        <Icon className={`h-5 w-5 ${isEnabled ? 'text-orange-400' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.label}</h4>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          [item.key]: !prev.features[item.key as keyof typeof prev.features],
                        },
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-orange-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="p-6 bg-slate-900/50">
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Integrations Page
// ============================================
export function AdminIntegrations() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-white">Integrations</h1>
          <p className="text-slate-400 mt-1">Connect your platform with external services</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* SuiteDash Integration */}
        <SuiteDashIntegration />

        {/* RingCentral Integration */}
        <RingCentralIntegration />

        {/* Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">SuiteDash Secure API Setup</h3>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Log in to SuiteDash as Admin</li>
                  <li>Go to Integrations → Secure API</li>
                  <li>Copy your Public ID</li>
                  <li>Click "+ Add Secret Key" to create a key</li>
                  <li>Copy the Secret Key</li>
                </ol>
                <div className="flex flex-wrap gap-3 mt-3">
                  <a
                    href="https://help.suitedash.com/article/550-secure-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Documentation
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://app.suitedash.com/secure-api/swagger"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    API Reference
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">RingCentral Setup</h3>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Create app at developers.ringcentral.com</li>
                  <li>Get Client ID & Secret</li>
                  <li>Generate JWT token</li>
                  <li>Configure webhook URL</li>
                </ol>
                <a
                  href="https://developers.ringcentral.com/guide/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mt-3 text-sm"
                >
                  View Documentation
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
