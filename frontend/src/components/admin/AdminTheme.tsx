import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Palette, Type, Square, RotateCcw, Eye } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import { defaultTheme, useTheme, applyThemeToDOM, type ThemeConfig } from '@/contexts/ThemeContext';

type ThemeFormValues = ThemeConfig;

const colorFields = [
  { name: 'primary_900', label: 'Primary 900 (Darkest)', group: 'primary' },
  { name: 'primary_800', label: 'Primary 800', group: 'primary' },
  { name: 'primary_700', label: 'Primary 700 (Main)', group: 'primary' },
  { name: 'primary_600', label: 'Primary 600', group: 'primary' },
  { name: 'primary_500', label: 'Primary 500', group: 'primary' },
  { name: 'primary_400', label: 'Primary 400', group: 'primary' },
  { name: 'primary_100', label: 'Primary 100', group: 'primary' },
  { name: 'primary_50', label: 'Primary 50 (Lightest)', group: 'primary' },
  { name: 'accent_yellow', label: 'Accent Yellow', group: 'accent' },
  { name: 'accent_yellow_light', label: 'Accent Yellow Light', group: 'accent' },
  { name: 'cta_primary_bg', label: 'CTA Background', group: 'cta' },
  { name: 'cta_primary_text', label: 'CTA Text', group: 'cta' },
  { name: 'cta_primary_hover', label: 'CTA Hover', group: 'cta' },
] as const;

const fontOptions = [
  { value: '"Source Serif 4", Georgia, serif', label: 'Source Serif 4 (Default)' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
  { value: '"Playfair Display", Georgia, serif', label: 'Playfair Display' },
  { value: '"Merriweather", Georgia, serif', label: 'Merriweather' },
  { value: '"Lora", Georgia, serif', label: 'Lora' },
];

const bodyFontOptions = [
  { value: 'Inter, -apple-system, sans-serif', label: 'Inter (Default)' },
  { value: '"Open Sans", -apple-system, sans-serif', label: 'Open Sans' },
  { value: '"Roboto", -apple-system, sans-serif', label: 'Roboto' },
  { value: '"Lato", -apple-system, sans-serif', label: 'Lato' },
  { value: '"Poppins", -apple-system, sans-serif', label: 'Poppins' },
];

const radiusOptions = [
  { value: '4px', label: 'Small (4px)' },
  { value: '8px', label: 'Medium (8px) - Default' },
  { value: '12px', label: 'Large (12px)' },
  { value: '16px', label: 'Extra Large (16px)' },
  { value: '9999px', label: 'Full (Pill)' },
];

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600 overflow-hidden"
          style={{ padding: 0 }}
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs text-slate-400 bg-transparent border-none p-0 focus:outline-none uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function AdminTheme() {
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);
  const { updateTheme } = useTheme();

  const { data: themeData, isLoading } = useQuery({
    queryKey: ['admin', 'theme'],
    queryFn: () => get<ThemeConfig>('/admin/theme'),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<ThemeFormValues>({
    defaultValues: defaultTheme,
  });

  const watchedValues = watch();

  useEffect(() => {
    if (themeData?.data) {
      reset({ ...defaultTheme, ...themeData.data });
    }
  }, [themeData, reset]);

  // Apply preview when in preview mode
  useEffect(() => {
    if (previewMode) {
      const root = document.documentElement;
      Object.entries(watchedValues).forEach(([key, value]) => {
        const cssVarName = key.replace(/_/g, '-');
        if (key.startsWith('primary_') || key.startsWith('accent_') || key.startsWith('cta_')) {
          root.style.setProperty(`--color-${cssVarName}`, value as string);
        } else if (key === 'font_heading') {
          root.style.setProperty('--font-heading', value as string);
        } else if (key === 'font_body') {
          root.style.setProperty('--font-body', value as string);
        } else if (key === 'border_radius') {
          root.style.setProperty('--radius-md', value as string);
        }
      });
    }
  }, [watchedValues, previewMode]);

  const updateMutation = useMutation({
    mutationFn: (data: ThemeFormValues) =>
      put<ThemeConfig>('/admin/theme', data),
    onSuccess: (response, variables) => {
      // Use the API response data if available, otherwise use submitted values
      const savedTheme = response?.data || variables;
      // Merge with defaults to ensure all values are present
      const fullTheme = { ...defaultTheme, ...savedTheme };

      // Apply to DOM immediately for instant visual feedback
      applyThemeToDOM(fullTheme);

      // Update theme globally via context
      updateTheme(fullTheme);

      // Update query cache directly with the new values
      queryClient.setQueryData(['theme'], { data: fullTheme, success: true });
      queryClient.setQueryData(['admin', 'theme'], { data: fullTheme, success: true });

      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['theme'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'theme'] });

      toast.success('Theme updated successfully');
    },
    onError: () => {
      toast.error('Failed to update theme');
    },
  });

  const onSubmit = (data: ThemeFormValues) => {
    updateMutation.mutate(data);
  };

  const handleReset = () => {
    reset(defaultTheme);
    // Apply default theme to the app
    updateTheme(defaultTheme);
    applyThemeToDOM(defaultTheme);
    toast.success('Theme reset to defaults');
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
          <h1 className="text-h2 text-white">Theme Settings</h1>
          <p className="text-slate-400 mt-1">Customize your website's colors, fonts, and style</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={previewMode ? 'primary' : 'secondary'}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Preview On' : 'Preview Off'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Primary Colors */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-h4 text-white">Primary Colors</h2>
              <p className="text-sm text-slate-400">Main brand colors used throughout the site</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {colorFields
              .filter(f => f.group === 'primary')
              .map(field => (
                <ColorPicker
                  key={field.name}
                  label={field.label}
                  value={watchedValues[field.name] || defaultTheme[field.name]}
                  onChange={(value) => setValue(field.name, value)}
                />
              ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-yellow-400" style={{ color: watchedValues.accent_yellow }} />
            </div>
            <div>
              <h2 className="text-h4 text-white">Accent Colors</h2>
              <p className="text-sm text-slate-400">Secondary colors for highlights and emphasis</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {colorFields
              .filter(f => f.group === 'accent')
              .map(field => (
                <ColorPicker
                  key={field.name}
                  label={field.label}
                  value={watchedValues[field.name] || defaultTheme[field.name]}
                  onChange={(value) => setValue(field.name, value)}
                />
              ))}
          </div>
        </div>

        {/* CTA Button Colors */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: watchedValues.cta_primary_bg }}
            >
              <Square className="h-5 w-5" style={{ color: watchedValues.cta_primary_text }} />
            </div>
            <div>
              <h2 className="text-h4 text-white">CTA Button Colors</h2>
              <p className="text-sm text-slate-400">Colors for call-to-action buttons</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {colorFields
              .filter(f => f.group === 'cta')
              .map(field => (
                <ColorPicker
                  key={field.name}
                  label={field.label}
                  value={watchedValues[field.name] || defaultTheme[field.name]}
                  onChange={(value) => setValue(field.name, value)}
                />
              ))}
          </div>

          {/* CTA Preview */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-slate-300 mb-3">Preview:</p>
            <button
              type="button"
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: watchedValues.cta_primary_bg,
                color: watchedValues.cta_primary_text,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = watchedValues.cta_primary_hover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = watchedValues.cta_primary_bg)}
            >
              Call to Action Button
            </button>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Type className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-h4 text-white">Typography</h2>
              <p className="text-sm text-slate-400">Font families for headings and body text</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Heading Font</label>
              <select
                {...register('font_heading')}
                className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-400 mt-2" style={{ fontFamily: watchedValues.font_heading }}>
                Preview: The Quick Brown Fox
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Body Font</label>
              <select
                {...register('font_body')}
                className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {bodyFontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-400 mt-2" style={{ fontFamily: watchedValues.font_body }}>
                Preview: The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Square className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-h4 text-white">Border Radius</h2>
              <p className="text-sm text-slate-400">Corner rounding for buttons, cards, and inputs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Default Border Radius</label>
              <select
                {...register('border_radius')}
                className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {radiusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-slate-700 border-2 border-slate-500"
                style={{ borderRadius: watchedValues.border_radius }}
              />
              <div
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium"
                style={{ borderRadius: watchedValues.border_radius }}
              >
                Button
              </div>
              <div
                className="px-4 py-2 border border-slate-500 text-slate-300 text-sm"
                style={{ borderRadius: watchedValues.border_radius }}
              >
                Input
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            isLoading={updateMutation.isPending}
          >
            Save Theme Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
