import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import { darkInputClass, darkLabelClass, darkTextareaClass, FormLoading } from './shared';
import type { SiteSettings } from './types';

export function SiteSettingsForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'settings'],
    queryFn: () => get<SiteSettings>('/admin/content/settings'),
  });

  const { register, handleSubmit } = useForm<SiteSettings>();

  const mutation = useMutation({
    mutationFn: (data: SiteSettings) => put<SiteSettings>('/admin/content/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Site settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  if (isLoading) {
    return <FormLoading />;
  }

  const settings = data?.data;

  return (
    <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Site Name</label>
          <input
            className={darkInputClass}
            defaultValue={settings?.site_name}
            {...register('site_name')}
          />
        </div>
        <div>
          <label className={darkLabelClass}>Tagline</label>
          <input
            className={darkInputClass}
            defaultValue={settings?.tagline}
            {...register('tagline')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Email</label>
          <input
            className={darkInputClass}
            type="email"
            defaultValue={settings?.email}
            {...register('email')}
          />
        </div>
        <div>
          <label className={darkLabelClass}>Phone</label>
          <input
            className={darkInputClass}
            defaultValue={settings?.phone}
            {...register('phone')}
          />
        </div>
      </div>

      <div>
        <label className={darkLabelClass}>Address</label>
        <textarea
          className={darkTextareaClass}
          rows={2}
          defaultValue={settings?.address}
          {...register('address')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>LinkedIn URL</label>
          <input
            className={darkInputClass}
            defaultValue={settings?.linkedin_url}
            {...register('linkedin_url')}
          />
        </div>
        <div>
          <label className={darkLabelClass}>Twitter URL</label>
          <input
            className={darkInputClass}
            defaultValue={settings?.twitter_url}
            {...register('twitter_url')}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}
