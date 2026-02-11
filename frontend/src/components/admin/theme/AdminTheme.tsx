import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { get, put } from '@/services/api';
import { defaultTheme, useTheme, applyThemeToDOM, type ThemeConfig } from '@/contexts/ThemeContext';
import { ThemeActions } from './ThemeActions';
import { ThemePreview } from './ThemePreview';
import {
  BackgroundsSection,
  TextsSection,
  IconsSection,
  ButtonsSection,
  TypographySection,
  RadiusSection,
} from './ThemeSections';
import type { SectionId, DeviceType } from './types';

export function AdminTheme() {
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(true);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [openSection, setOpenSection] = useState<SectionId | null>('backgrounds');
  const { updateTheme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleSection = (section: SectionId) => {
    setOpenSection(openSection === section ? null : section);
  };

  const { data: themeData, isLoading } = useQuery({
    queryKey: ['admin', 'theme'],
    queryFn: () => get<ThemeConfig>('/admin/theme'),
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<ThemeConfig>({
    defaultValues: defaultTheme,
  });

  const watchedValues = watch();

  useEffect(() => {
    if (themeData?.data) {
      reset({ ...defaultTheme, ...themeData.data });
    }
  }, [themeData, reset]);

  // Apply theme changes to both main window and iframe preview
  useEffect(() => {
    applyThemeToDOM(watchedValues);

    if (showPreview && iframeRef.current?.contentDocument) {
      try {
        const iframeRoot = iframeRef.current.contentDocument.documentElement;
        Object.entries(watchedValues).forEach(([key, value]) => {
          const cssVarName = key.replace(/_/g, '-');
          if (
            key.startsWith('primary_') ||
            key.startsWith('accent_') ||
            key.startsWith('cta_') ||
            key.startsWith('text_')
          ) {
            iframeRoot.style.setProperty(`--color-${cssVarName}`, value as string);
          } else if (key === 'font_heading') {
            iframeRoot.style.setProperty('--font-heading', value as string);
          } else if (key === 'font_body') {
            iframeRoot.style.setProperty('--font-body', value as string);
          } else if (key === 'border_radius') {
            iframeRoot.style.setProperty('--radius-md', value as string);
          }
        });
      } catch {
        // Iframe not ready
      }
    }
  }, [watchedValues, showPreview]);

  const updateMutation = useMutation({
    mutationFn: (data: ThemeConfig) => put<ThemeConfig>('/admin/theme', data),
    onSuccess: (response, variables) => {
      const savedTheme = response?.data || variables;
      const fullTheme = { ...defaultTheme, ...savedTheme };
      applyThemeToDOM(fullTheme);
      updateTheme(fullTheme);
      queryClient.setQueryData(['theme'], { data: fullTheme, success: true });
      queryClient.setQueryData(['admin', 'theme'], { data: fullTheme, success: true });
      void queryClient.invalidateQueries({ queryKey: ['theme'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'theme'] });
      toast.success('Theme saved! Changes are now live.');

      // Force iframe reload by assigning a new URL with cache-busting param
      if (iframeRef.current) {
        const currentSrc = iframeRef.current.src;
        const url = new URL(currentSrc, window.location.origin);
        url.searchParams.set('_t', Date.now().toString());
        iframeRef.current.src = url.toString();
      }
    },
    onError: () => {
      toast.error('Failed to save theme');
    },
  });

  const onSubmit = (data: ThemeConfig) => {
    updateMutation.mutate(data);
  };

  const handleReset = () => {
    if (confirm('Reset all theme settings to defaults?')) {
      reset(defaultTheme);
      updateTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
      toast.success('Theme reset to defaults');
    }
  };

  const handleDiscard = () => {
    if (themeData?.data) {
      reset({ ...defaultTheme, ...themeData.data });
      toast.success('Changes discarded');
    }
  };

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentDocument) {
      try {
        const iframeRoot = iframeRef.current.contentDocument.documentElement;
        Object.entries(watchedValues).forEach(([key, value]) => {
          const cssVarName = key.replace(/_/g, '-');
          if (
            key.startsWith('primary_') ||
            key.startsWith('accent_') ||
            key.startsWith('cta_') ||
            key.startsWith('text_')
          ) {
            iframeRoot.style.setProperty(`--color-${cssVarName}`, value as string);
          } else if (key === 'font_heading') {
            iframeRoot.style.setProperty('--font-heading', value as string);
          } else if (key === 'font_body') {
            iframeRoot.style.setProperty('--font-body', value as string);
          } else if (key === 'border_radius') {
            iframeRoot.style.setProperty('--radius-md', value as string);
          }
        });
      } catch {
        // Cross-origin issues
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Action Bar */}
      <ThemeActions
        showPreview={showPreview}
        isPending={updateMutation.isPending}
        onReset={handleReset}
        onDiscard={handleDiscard}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onSave={handleSubmit(onSubmit)}
      />

      {/* Main Content Area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Panel - Theme Controls */}
        <div
          className={`${showPreview ? 'w-1/2 xl:w-2/5' : 'w-full max-w-3xl'} transition-all duration-300`}
        >
          <div className="pr-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <BackgroundsSection
                isOpen={openSection === 'backgrounds'}
                onToggle={() => toggleSection('backgrounds')}
                watch={watch}
                setValue={setValue}
              />

              <TextsSection
                isOpen={openSection === 'texts'}
                onToggle={() => toggleSection('texts')}
                watch={watch}
                setValue={setValue}
              />

              <IconsSection
                isOpen={openSection === 'icons'}
                onToggle={() => toggleSection('icons')}
                watch={watch}
                setValue={setValue}
              />

              <ButtonsSection
                isOpen={openSection === 'buttons'}
                onToggle={() => toggleSection('buttons')}
                watch={watch}
                setValue={setValue}
              />

              <TypographySection
                isOpen={openSection === 'typography'}
                onToggle={() => toggleSection('typography')}
                watch={watch}
                register={register}
              />

              <RadiusSection
                isOpen={openSection === 'radius'}
                onToggle={() => toggleSection('radius')}
                watch={watch}
                register={register}
              />
            </form>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        {showPreview && (
          <ThemePreview
            ref={iframeRef}
            deviceType={deviceType}
            onDeviceChange={setDeviceType}
            onClose={() => setShowPreview(false)}
            onIframeLoad={handleIframeLoad}
          />
        )}
      </div>
    </div>
  );
}
