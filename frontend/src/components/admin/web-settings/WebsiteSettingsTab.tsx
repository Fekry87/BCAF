import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Settings, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import {
  type WebsiteSettings,
  type PageVisibility,
  darkLabelClass,
  darkTextareaClass,
  pageInfo,
  defaultWebsiteSettings,
} from './types';

export function WebsiteSettingsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'website-settings'],
    queryFn: () => get<WebsiteSettings>('/admin/website-settings'),
  });

  const [settings, setSettings] = useState<WebsiteSettings>(defaultWebsiteSettings);

  const mutation = useMutation({
    mutationFn: (data: WebsiteSettings) =>
      put<WebsiteSettings>('/admin/website-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'website-settings'] });
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
      toast.success('Website settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update website settings');
    },
  });

  // Initialize settings from API data when it loads
  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const togglePageVisibility = (pageKey: keyof PageVisibility) => {
    if (pageKey === 'home') {
      toast.error('Home page cannot be hidden');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      page_visibility: {
        ...prev.page_visibility,
        [pageKey]: !prev.page_visibility[pageKey],
      },
    }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Visibility Section */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Page Visibility</h2>
            <p className="text-sm text-slate-400">
              Control which pages are visible on your website
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {pageInfo.map((page) => {
            const isVisible =
              settings.page_visibility[page.key as keyof PageVisibility];
            const isHome = page.key === 'home';

            return (
              <div
                key={page.key}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isVisible
                    ? 'bg-slate-700/30 border-slate-600'
                    : 'bg-slate-900/30 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isVisible ? 'bg-green-500/20' : 'bg-slate-700'
                    }`}
                  >
                    {isVisible ? (
                      <Eye
                        className={`h-5 w-5 ${
                          isVisible ? 'text-green-400' : 'text-slate-500'
                        }`}
                      />
                    ) : (
                      <EyeOff className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{page.label}</h3>
                    <p className="text-sm text-slate-400">{page.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{page.path}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isVisible
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isVisible ? 'Visible' : 'Hidden'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      togglePageVisibility(page.key as keyof PageVisibility)
                    }
                    disabled={isHome}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isVisible ? 'bg-green-500' : 'bg-slate-600'
                    } ${isHome ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isHome ? 'Home page cannot be hidden' : undefined}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-slate-500 mt-4">
          Note: Hidden pages will show a 404 error to visitors. Pillar pages are
          controlled individually in the Pillars section.
        </p>
      </div>

      {/* Maintenance Mode Section */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              settings.maintenance_mode ? 'bg-yellow-500/20' : 'bg-slate-700'
            }`}
          >
            <Settings
              className={`h-5 w-5 ${
                settings.maintenance_mode ? 'text-yellow-400' : 'text-slate-400'
              }`}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Maintenance Mode</h2>
            <p className="text-sm text-slate-400">
              Temporarily disable the website for maintenance
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-600 bg-slate-700/30">
            <div>
              <h3 className="font-medium text-white">Enable Maintenance Mode</h3>
              <p className="text-sm text-slate-400">
                When enabled, visitors will see a maintenance message
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  maintenance_mode: !prev.maintenance_mode,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenance_mode ? 'bg-yellow-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.maintenance_mode && (
            <div>
              <label className={darkLabelClass}>Maintenance Message</label>
              <textarea
                className={darkTextareaClass}
                value={settings.maintenance_message}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maintenance_message: e.target.value,
                  }))
                }
                placeholder="Enter the message visitors will see during maintenance..."
                rows={3}
              />
            </div>
          )}
        </div>

        {settings.maintenance_mode && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400 font-medium">Warning</p>
            <p className="text-sm text-yellow-400/80 mt-1">
              When maintenance mode is enabled, all visitors will be redirected to
              a maintenance page. Only admin users will be able to access the
              website.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={mutation.isPending} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Website Settings
        </Button>
      </div>
    </div>
  );
}
