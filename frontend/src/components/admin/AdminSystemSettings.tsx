import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Palette,
  Monitor,
  Sun,
  Moon,
  Loader2,
  Save,
  RotateCcw,
  Check,
  Image,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

interface AdminThemeConfig {
  theme_mode: 'dark' | 'light' | 'system';
  accent_color: string;
  sidebar_style: 'default' | 'compact' | 'expanded';
  primary_color: string;
  secondary_color: string;
  dashboard_name: string;
  dashboard_logo: string;
  show_logo: boolean;
}

const defaultConfig: AdminThemeConfig = {
  theme_mode: 'dark',
  accent_color: '#3b82f6', // blue-500
  sidebar_style: 'default',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6',
  dashboard_name: 'Admin',
  dashboard_logo: '',
  show_logo: true,
};

type TabType = 'theme' | 'branding';

const tabs: { id: TabType; label: string; icon: typeof Palette }[] = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'branding', label: 'Branding', icon: Image },
];

const accentColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
];

const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors";
const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";

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
      // Merge with defaults to ensure all fields exist
      setConfig({ ...defaultConfig, ...configData.data });
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminThemeConfig) => put<AdminThemeConfig>('/admin/system-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings'] });
      // Also refetch the admin settings context to apply changes immediately
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, dashboard_logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfig(prev => ({ ...prev, dashboard_logo: '' }));
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

      {/* Theme Tab */}
      {activeTab === 'theme' && (
      <div className="space-y-8">
        {/* Theme Mode */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Theme Mode</h2>
                <p className="text-sm text-slate-400">Choose the appearance of the admin dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark background with light text' },
                { value: 'light', label: 'Light', icon: Sun, description: 'Light background with dark text' },
                { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = config.theme_mode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, theme_mode: mode.value as AdminThemeConfig['theme_mode'] }))}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-blue-500/20' : 'bg-slate-700'
                    }`}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="font-semibold text-white">{mode.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{mode.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Accent Color</h2>
                <p className="text-sm text-slate-400">Choose the primary accent color for the dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {accentColors.map((color) => {
                const isSelected = config.accent_color === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, accent_color: color.value, primary_color: color.value }))}
                    className={`relative group`}
                    title={color.name}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl transition-transform ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-2">{color.name}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Color */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <label className={darkLabelClass}>Custom Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value, primary_color: e.target.value }))}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-slate-600"
                />
                <input
                  type="text"
                  value={config.accent_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value, primary_color: e.target.value }))}
                  className={`${darkInputClass} max-w-xs`}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Style */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Sidebar Style</h2>
                <p className="text-sm text-slate-400">Choose how the sidebar navigation appears</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'default', label: 'Default', description: 'Standard sidebar with icons and labels' },
                { value: 'compact', label: 'Compact', description: 'Icons only, labels on hover' },
                { value: 'expanded', label: 'Expanded', description: 'Wider sidebar with more details' },
              ].map((style) => {
                const isSelected = config.sidebar_style === style.value;
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, sidebar_style: style.value as AdminThemeConfig['sidebar_style'] }))}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Mini Sidebar Preview */}
                    <div className="flex gap-1 mb-3">
                      <div className={`bg-slate-700 rounded ${
                        style.value === 'compact' ? 'w-3 h-10' : style.value === 'expanded' ? 'w-10 h-10' : 'w-6 h-10'
                      }`} />
                      <div className="flex-1 bg-slate-900/50 rounded h-10" />
                    </div>

                    <h3 className="font-semibold text-white">{style.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <p className="text-sm text-slate-400">See how your changes will look</p>
          </div>

          <div className="p-6">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <div className="flex gap-4">
                {/* Mini Sidebar */}
                <div className={`bg-slate-800 rounded-lg p-2 ${
                  config.sidebar_style === 'compact' ? 'w-12' : config.sidebar_style === 'expanded' ? 'w-48' : 'w-32'
                }`}>
                  <div className="w-8 h-8 rounded-lg mb-4 mx-auto" style={{ backgroundColor: config.accent_color }} />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${i === 1 ? '' : 'bg-slate-700'}`}
                        style={i === 1 ? { backgroundColor: config.accent_color, opacity: 0.2 } : {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Mini Content */}
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-slate-800 rounded-lg w-48" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-slate-800 rounded-lg p-3">
                        <div
                          className="w-8 h-8 rounded-lg mb-2"
                          style={{ backgroundColor: config.accent_color, opacity: 0.2 }}
                        />
                        <div className="h-2 bg-slate-700 rounded w-12" />
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
      <div className="space-y-8">
        {/* Dashboard Name */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Type className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Dashboard Name</h2>
                <p className="text-sm text-slate-400">Set the name displayed in the sidebar header</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className={darkLabelClass}>Name</label>
            <input
              type="text"
              value={config.dashboard_name || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, dashboard_name: e.target.value }))}
              className={`${darkInputClass} max-w-md`}
              placeholder="Admin"
            />
            <p className="text-xs text-slate-500 mt-2">This name will appear in the sidebar next to the logo</p>
          </div>
        </div>

        {/* Dashboard Logo */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Dashboard Logo</h2>
                <p className="text-sm text-slate-400">Upload a custom logo for the admin dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Show Logo Toggle */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700">
              <div>
                <label className="text-sm font-semibold text-slate-300">Show Logo</label>
                <p className="text-xs text-slate-500 mt-1">Toggle logo visibility in the sidebar</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, show_logo: !prev.show_logo }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.show_logo ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    config.show_logo ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <label className={darkLabelClass}>Logo Image</label>

              {config.dashboard_logo ? (
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-xl bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                    <img
                      src={config.dashboard_logo}
                      alt="Dashboard Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/30 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-colors">
                  <Upload className="h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-500">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}

              <p className="text-xs text-slate-500">
                Recommended size: 64x64px. Supports PNG, JPG, SVG.
              </p>
            </div>
          </div>
        </div>

        {/* Branding Preview */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <p className="text-sm text-slate-400">See how your branding will appear</p>
          </div>

          <div className="p-6">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              {/* Mini Header Preview */}
              <div className="h-16 bg-slate-800 rounded-lg flex items-center px-4 gap-3 border-b border-slate-700">
                {config.show_logo && (
                  config.dashboard_logo ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-700">
                      <img
                        src={config.dashboard_logo}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: config.accent_color }}
                    >
                      <span className="text-white font-serif font-bold text-sm">
                        {(config.dashboard_name || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )
                )}
                <span className="font-serif font-semibold text-white">
                  {config.dashboard_name || 'Admin'}
                </span>
              </div>

              {/* Mini Sidebar Items */}
              <div className="mt-4 space-y-2">
                {['Dashboard', 'Orders', 'Settings'].map((item, i) => (
                  <div
                    key={item}
                    className={`h-10 rounded-lg px-3 flex items-center gap-2 ${
                      i === 0 ? '' : 'bg-slate-700/50'
                    }`}
                    style={i === 0 ? { backgroundColor: config.accent_color } : {}}
                  >
                    <div className={`w-5 h-5 rounded ${i === 0 ? 'bg-white/20' : 'bg-slate-600'}`} />
                    <span className={`text-sm ${i === 0 ? 'text-white' : 'text-slate-400'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
