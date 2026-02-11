import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plug, Save } from 'lucide-react';
import { get, put, post } from '@/services/api';
import { Button } from '@/components/ui';
import { IntegrationCard, IntegrationHeader, LoadingSpinner } from '../shared';
import type { SuiteDashConfig, IntegrationStats, SyncLog } from '../types';
import { defaultSuiteDashConfig } from '../types';
import { SuiteDashStatsOverview } from './SuiteDashStatsOverview';
import { SuiteDashApiConfig } from './SuiteDashApiConfig';
import { SuiteDashSyncSettings } from './SuiteDashSyncSettings';
import { SuiteDashManualSync } from './SuiteDashManualSync';
import { SuiteDashSyncLogs } from './SuiteDashSyncLogs';

type SyncType = 'all' | 'contacts' | 'companies' | 'projects' | 'invoices';

export function SuiteDashIntegration() {
  const queryClient = useQueryClient();
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
    mutationFn: (data: SuiteDashConfig) =>
      put<SuiteDashConfig>('/admin/integrations/suitedash', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'suitedash'] });
      toast.success('SuiteDash configuration saved');
    },
    onError: () => {
      toast.error('Failed to save configuration');
    },
  });

  const syncMutation = useMutation({
    mutationFn: (type: SyncType) =>
      post<{ message: string }>(`/admin/integrations/suitedash/sync`, { type }),
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'suitedash'] });
      toast.success(
        `${type === 'all' ? 'All data' : type.charAt(0).toUpperCase() + type.slice(1)} synced successfully`
      );
    },
    onError: () => {
      toast.error('Sync failed. Please check your configuration.');
    },
  });

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await post<{ success: boolean; message: string; invoice_api_available?: boolean }>(
        '/admin/integrations/suitedash/test',
        {
          public_id: config.public_id,
          secret_key: config.secret_key,
          api_base_url: config.api_base_url,
        }
      );
      if (response.data?.success) {
        setConfig((prev) => ({
          ...prev,
          connection_status: 'connected',
          connection_message: response.data?.message || 'Connected to SuiteDash API',
          invoice_api_available: response.data?.invoice_api_available,
        }));
        toast.success(response.data?.message || 'SuiteDash connection successful!');
      } else {
        setConfig((prev) => ({
          ...prev,
          connection_status: 'error',
          connection_message: response.data?.message || 'Connection failed',
        }));
        toast.error(response.data?.message || 'Connection failed');
      }
    } catch {
      setConfig((prev) => ({
        ...prev,
        connection_status: 'error',
        connection_message: 'Failed to connect to SuiteDash API',
      }));
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
    return <LoadingSpinner />;
  }

  return (
    <IntegrationCard>
      <IntegrationHeader
        icon={<Plug className="h-7 w-7 text-white" />}
        title="SuiteDash CRM"
        description="Manage payments, customers, and sync data"
        status={config.connection_status}
        enabled={config.enabled}
        onToggle={(enabled) => setConfig((prev) => ({ ...prev, enabled }))}
      />

      {config.enabled && (
        <>
          {/* Stats Overview */}
          {stats && <SuiteDashStatsOverview stats={stats} />}

          {/* API Configuration */}
          <SuiteDashApiConfig
            config={config}
            onConfigChange={setConfig}
            onTestConnection={testConnection}
            isTesting={isTesting}
          />

          {/* Sync Settings */}
          <SuiteDashSyncSettings config={config} onConfigChange={setConfig} />

          {/* Manual Sync */}
          <SuiteDashManualSync
            config={config}
            onSync={(type) => syncMutation.mutate(type)}
            isSyncing={syncMutation.isPending}
          />

          {/* Sync Logs */}
          <SuiteDashSyncLogs logs={logs} />
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
    </IntegrationCard>
  );
}
