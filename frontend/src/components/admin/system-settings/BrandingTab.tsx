import { Type, Image, Upload, X } from 'lucide-react';
import type { AdminThemeConfig } from './types';
import { darkInputClass, darkLabelClass } from './types';

interface BrandingTabProps {
  config: AdminThemeConfig;
  onConfigChange: (updates: Partial<AdminThemeConfig>) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

export function BrandingTab({
  config,
  onConfigChange,
  onLogoUpload,
  onRemoveLogo,
}: BrandingTabProps) {
  return (
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
              <p className="text-sm text-slate-400">
                Set the name displayed in the sidebar header
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className={darkLabelClass}>Name</label>
          <input
            type="text"
            value={config.dashboard_name || ''}
            onChange={(e) => onConfigChange({ dashboard_name: e.target.value })}
            className={`${darkInputClass} max-w-md`}
            placeholder="Admin"
          />
          <p className="text-xs text-slate-500 mt-2">
            This name will appear in the sidebar next to the logo
          </p>
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
              <p className="text-sm text-slate-400">
                Upload a custom logo for the admin dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Show Logo Toggle */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700">
            <div>
              <label className="text-sm font-semibold text-slate-300">Show Logo</label>
              <p className="text-xs text-slate-500 mt-1">
                Toggle logo visibility in the sidebar
              </p>
            </div>
            <button
              type="button"
              onClick={() => onConfigChange({ show_logo: !config.show_logo })}
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
                  onClick={onRemoveLogo}
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
                  onChange={onLogoUpload}
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
      <BrandingPreview config={config} />
    </div>
  );
}

function BrandingPreview({ config }: { config: AdminThemeConfig }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Preview</h2>
        <p className="text-sm text-slate-400">See how your branding will appear</p>
      </div>

      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
          {/* Mini Header Preview */}
          <div className="h-16 bg-slate-800 rounded-lg flex items-center px-4 gap-3 border-b border-slate-700">
            {config.show_logo &&
              (config.dashboard_logo ? (
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
              ))}
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
                <div
                  className={`w-5 h-5 rounded ${i === 0 ? 'bg-white/20' : 'bg-slate-600'}`}
                />
                <span className={`text-sm ${i === 0 ? 'text-white' : 'text-slate-400'}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
