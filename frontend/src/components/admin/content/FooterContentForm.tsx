import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import { darkLabelClass, darkTextareaClass, FormLoading } from './shared';
import type { FooterContent } from './types';

export function FooterContentForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'footer'],
    queryFn: () => get<FooterContent>('/admin/content/footer'),
  });

  const { register, handleSubmit } = useForm<FooterContent>();

  const mutation = useMutation({
    mutationFn: (data: FooterContent) => put<FooterContent>('/admin/content/footer', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'footer'] });
      void queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Footer updated successfully');
    },
    onError: () => {
      toast.error('Failed to update footer');
    },
  });

  if (isLoading) {
    return <FormLoading />;
  }

  const footer = data?.data;

  return (
    <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))} className="space-y-6">
      <div>
        <label className={darkLabelClass}>Brand Description</label>
        <textarea
          className={darkTextareaClass}
          rows={3}
          defaultValue={footer?.brand_description}
          {...register('brand_description')}
          placeholder="Brief description shown in the footer"
        />
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
        <p className="text-sm text-slate-400 mb-4">
          Quick links are automatically generated from your site structure.
        </p>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <ul className="space-y-2">
            {footer?.quick_links?.map((link, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-300">{link.label}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-400">{link.to}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Footer
        </Button>
      </div>
    </form>
  );
}
