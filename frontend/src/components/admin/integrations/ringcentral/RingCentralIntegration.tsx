import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Phone, Save } from 'lucide-react';
import { get, put, post } from '@/services/api';
import { Button } from '@/components/ui';
import { IntegrationCard, IntegrationHeader, LoadingSpinner } from '../shared';
import type { RingCentralConfig, RingCentralStats } from '../types';
import { defaultRingCentralConfig } from '../types';
import { RingCentralStatsOverview } from './RingCentralStatsOverview';
import { RingCentralApiConfig } from './RingCentralApiConfig';
import { RingCentralFeatures } from './RingCentralFeatures';

export function RingCentralIntegration() {
  const queryClient = useQueryClient();
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
    mutationFn: (data: RingCentralConfig) =>
      put<RingCentralConfig>('/admin/integrations/ringcentral', data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'integrations', 'ringcentral'],
      });
      toast.success('RingCentral configuration saved');
    },
    onError: () => {
      toast.error('Failed to save configuration');
    },
  });

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await post<{ success: boolean; message: string }>(
        '/admin/integrations/ringcentral/test',
        {
          client_id: config.client_id,
          client_secret: config.client_secret,
          jwt_token: config.jwt_token,
        }
      );
      if (response.data?.success) {
        setConfig((prev) => ({ ...prev, connection_status: 'connected' }));
        toast.success('RingCentral connected successfully!');
      } else {
        setConfig((prev) => ({ ...prev, connection_status: 'error' }));
        toast.error(response.data?.message || 'Connection failed');
      }
    } catch {
      setConfig((prev) => ({ ...prev, connection_status: 'error' }));
      toast.error('Connection failed. Please check your credentials.');
    }
    setIsTesting(false);
  };

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const stats = statsData?.data;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <IntegrationCard>
      <IntegrationHeader
        icon={<Phone className="h-7 w-7 text-white" />}
        title="RingCentral"
        description="Phone, SMS, and video communications"
        status={config.connection_status}
        enabled={config.enabled}
        onToggle={(enabled) => setConfig((prev) => ({ ...prev, enabled }))}
      />

      {config.enabled && (
        <>
          {/* Stats Overview */}
          {config.connection_status === 'connected' && stats && (
            <RingCentralStatsOverview stats={stats} />
          )}

          {/* API Configuration */}
          <RingCentralApiConfig
            config={config}
            onConfigChange={setConfig}
            onTestConnection={testConnection}
            isTesting={isTesting}
          />

          {/* Features */}
          <RingCentralFeatures config={config} onConfigChange={setConfig} />
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
