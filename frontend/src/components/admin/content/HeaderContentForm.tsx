import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Upload, X, Image as ImageIcon, Loader2, Copy } from 'lucide-react';
import { get, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import { darkInputClass, darkLabelClass, FormLoading } from './shared';
import type { HeaderContent } from './types';

interface SystemSettings {
  dashboard_logo?: string;
  dashboard_name?: string;
}

export function HeaderContentForm() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'header'],
    queryFn: () => get<HeaderContent>('/admin/content/header'),
  });

  // Fetch system settings to get the dashboard logo
  const { data: systemSettingsData } = useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: () => get<SystemSettings>('/admin/system-settings'),
  });

  const { register, handleSubmit, setValue, watch } = useForm<HeaderContent>();
  const logoImage = watch('logo_image');

  const mutation = useMutation({
    mutationFn: (data: HeaderContent) => put<HeaderContent>('/admin/content/header', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
      void queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
      toast.success('Header updated successfully');
    },
    onError: () => {
      toast.error('Failed to update header');
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, SVG, or WebP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/content/header/logo`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const result = (await response.json()) as { data?: { url?: string }; message?: string };

      if (response.ok && result.data?.url) {
        setValue('logo_image', result.data.url);
        void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
        void queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(result.message || 'Failed to upload logo');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await del('/admin/content/header/logo');
      setValue('logo_image', '');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
      void queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
      toast.success('Logo removed');
    } catch {
      toast.error('Failed to remove logo');
    }
  };

  if (isLoading) {
    return <FormLoading />;
  }

  const header = data?.data;
  const currentLogo = logoImage ?? header?.logo_image;
  const dashboardLogo = systemSettingsData?.data?.dashboard_logo;

  const handleUseDashboardLogo = () => {
    if (dashboardLogo) {
      setValue('logo_image', dashboardLogo);
      toast.success('Dashboard logo applied to website header');
    } else {
      toast.error('No dashboard logo found. Please upload one in System Settings > Branding first.');
    }
  };

  return (
    <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))} className="space-y-6">
      <div>
        <label className={darkLabelClass}>Logo Text</label>
        <input
          className={darkInputClass}
          defaultValue={header?.logo_text}
          {...register('logo_text')}
          placeholder="Your company name"
        />
      </div>

      {/* Logo Upload Section */}
      <div>
        <label className={darkLabelClass}>Logo Image</label>

        {currentLogo ? (
          <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-slate-600">
            <div className="flex items-center gap-4">
              <img
                src={currentLogo}
                alt="Logo preview"
                className="h-16 w-auto object-contain bg-slate-800 rounded border border-slate-600 p-2"
              />
              <div>
                <p className="text-sm font-medium text-white">Current Logo</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">{currentLogo}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoveLogo}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-4">
              No logo uploaded. Upload an image or enter a URL below.
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={uploading}
              onClick={() =>
                document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
              }
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </label>
        </div>

        {/* Use Dashboard Logo Button */}
        {dashboardLogo && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={dashboardLogo}
                  alt="Dashboard logo"
                  className="h-10 w-10 object-contain bg-slate-800 rounded border border-slate-600 p-1"
                />
                <div>
                  <p className="text-sm font-medium text-blue-400">Dashboard Logo Available</p>
                  <p className="text-xs text-slate-400">Use the same logo from System Settings</p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleUseDashboardLogo}
                className="text-blue-400 hover:text-blue-300"
              >
                <Copy className="h-4 w-4 mr-1" />
                Use This Logo
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-2">
          Supported formats: JPEG, PNG, GIF, SVG, WebP. Max size: 2MB.
        </p>

        <div className="mt-4">
          <label className={darkLabelClass}>Or enter logo URL manually</label>
          <input
            className={darkInputClass}
            placeholder="https://example.com/logo.png"
            defaultValue={header?.logo_image || ''}
            {...register('logo_image')}
          />
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-white mb-4">Navigation Links</h3>
        <p className="text-sm text-slate-400 mb-4">
          Navigation links are automatically generated from your pillars. To modify them, update
          your pillars in the Pillars section.
        </p>
        {header?.nav_links && header.nav_links.length > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <ul className="space-y-2">
              {header.nav_links.map((link, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-300">{link.label}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">{link.to}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Header
        </Button>
      </div>
    </form>
  );
}
