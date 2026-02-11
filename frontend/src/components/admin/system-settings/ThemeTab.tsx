import { Monitor, Sun, Moon, Palette, Check } from 'lucide-react';
import type { AdminThemeConfig } from './types';
import { accentColors, darkInputClass, darkLabelClass } from './types';

interface ThemeTabProps {
  config: AdminThemeConfig;
  onConfigChange: (updates: Partial<AdminThemeConfig>) => void;
}

export function ThemeTab({ config, onConfigChange }: ThemeTabProps) {
  return (
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
              <p className="text-sm text-slate-400">
                Choose the appearance of the admin dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                value: 'dark',
                label: 'Dark',
                icon: Moon,
                description: 'Dark background with light text',
              },
              {
                value: 'light',
                label: 'Light',
                icon: Sun,
                description: 'Light background with dark text',
              },
              {
                value: 'system',
                label: 'System',
                icon: Monitor,
                description: 'Follow system preference',
              },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = config.theme_mode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() =>
                    onConfigChange({
                      theme_mode: mode.value as AdminThemeConfig['theme_mode'],
                    })
                  }
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
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-blue-500/20' : 'bg-slate-700'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}
                    />
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
              <p className="text-sm text-slate-400">
                Choose the primary accent color for the dashboard
              </p>
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
                  onClick={() =>
                    onConfigChange({
                      accent_color: color.value,
                      primary_color: color.value,
                    })
                  }
                  className="relative group"
                  title={color.name}
                >
                  <div
                    className={`w-12 h-12 rounded-xl transition-transform ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                        : 'hover:scale-105'
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
                onChange={(e) =>
                  onConfigChange({
                    accent_color: e.target.value,
                    primary_color: e.target.value,
                  })
                }
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-slate-600"
              />
              <input
                type="text"
                value={config.accent_color}
                onChange={(e) =>
                  onConfigChange({
                    accent_color: e.target.value,
                    primary_color: e.target.value,
                  })
                }
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
              <p className="text-sm text-slate-400">
                Choose how the sidebar navigation appears
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                value: 'default',
                label: 'Default',
                description: 'Standard sidebar with icons and labels',
              },
              {
                value: 'compact',
                label: 'Compact',
                description: 'Icons only, labels on hover',
              },
              {
                value: 'expanded',
                label: 'Expanded',
                description: 'Wider sidebar with more details',
              },
            ].map((style) => {
              const isSelected = config.sidebar_style === style.value;
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() =>
                    onConfigChange({
                      sidebar_style: style.value as AdminThemeConfig['sidebar_style'],
                    })
                  }
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
                    <div
                      className={`bg-slate-700 rounded ${
                        style.value === 'compact'
                          ? 'w-3 h-10'
                          : style.value === 'expanded'
                            ? 'w-10 h-10'
                            : 'w-6 h-10'
                      }`}
                    />
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
      <ThemePreview config={config} />
    </div>
  );
}

function ThemePreview({ config }: { config: AdminThemeConfig }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Preview</h2>
        <p className="text-sm text-slate-400">See how your changes will look</p>
      </div>

      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex gap-4">
            {/* Mini Sidebar */}
            <div
              className={`bg-slate-800 rounded-lg p-2 ${
                config.sidebar_style === 'compact'
                  ? 'w-12'
                  : config.sidebar_style === 'expanded'
                    ? 'w-48'
                    : 'w-32'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg mb-4 mx-auto"
                style={{ backgroundColor: config.accent_color }}
              />
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
  );
}
