import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';
import { ThemeTab } from './ThemeTab';
import { BrandingTab } from './BrandingTab';
import type { AdminThemeConfig, TabType } from './types';
import { defaultConfig, tabs } from './types';

export function AdminSystemSettings() {
  const queryClient = useQueryClient();
  const { refetch: refetchAdminSettings } = useAdminSettings();
  const [config, setConfig] = useState<AdminThemeConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<TabType>('theme');

  const { data: configData, isLoading } = useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: () => get<AdminThemeConfig>('/admin/system-settings'),
  });

  useEffect(() => {
    if (configData?.data) {
      setConfig({ ...defaultConfig, ...configData.data });
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminThemeConfig) =>
      put<AdminThemeConfig>('/admin/system-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings'] });
      refetchAdminSettings();
      toast.success('System settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save system settings');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast.success('Settings reset to defaults');
  };

  const handleConfigChange = (updates: Partial<AdminThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig((prev) => ({ ...prev, dashboard_logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfig((prev) => ({ ...prev, dashboard_logo: '' }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">Customize the admin dashboard appearance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} isLoading={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'text-white border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'theme' && (
        <ThemeTab config={config} onConfigChange={handleConfigChange} />
      )}

      {activeTab === 'branding' && (
        <BrandingTab
          config={config}
          onConfigChange={handleConfigChange}
          onLogoUpload={handleLogoUpload}
          onRemoveLogo={handleRemoveLogo}
        />
      )}
    </div>
  );
}
