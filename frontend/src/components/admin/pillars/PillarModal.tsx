import { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { post, put } from '@/services/api';
import { Button } from '@/components/ui';
import {
  pillarSchema,
  type PillarFormValues,
  type PillarModalProps,
  type Pillar,
} from './types';
import { darkInputClass, darkLabelClass, darkTextareaClass, generateSlug } from './shared';

export function PillarModal({ isOpen, onClose, pillar }: PillarModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!pillar;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PillarFormValues>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      name: '',
      slug: '',
      tagline: '',
      description: '',
      hero_image: '',
      card_image: '',
      meta_title: '',
      meta_description: '',
      sort_order: '0',
      is_active: true,
    },
  });

  // Reset form when pillar changes
  useEffect(() => {
    if (pillar) {
      reset({
        name: pillar.name,
        slug: pillar.slug,
        tagline: pillar.tagline || '',
        description: pillar.description || '',
        hero_image: pillar.hero_image || '',
        card_image: pillar.card_image || '',
        meta_title: pillar.meta_title || '',
        meta_description: pillar.meta_description || '',
        sort_order: String(pillar.sort_order || 0),
        is_active: pillar.is_active,
      });
    } else {
      reset({
        name: '',
        slug: '',
        tagline: '',
        description: '',
        hero_image: '',
        card_image: '',
        meta_title: '',
        meta_description: '',
        sort_order: '0',
        is_active: true,
      });
    }
  }, [pillar, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PillarFormValues) =>
      post<Pillar>('/admin/pillars', {
        ...data,
        sort_order: data.sort_order ? parseInt(data.sort_order) : 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pillars'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar created successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create pillar');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PillarFormValues) =>
      put<Pillar>(`/admin/pillars/${pillar?.id}`, {
        ...data,
        sort_order: data.sort_order ? parseInt(data.sort_order) : 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pillars'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar updated successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to update pillar');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: PillarFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-slate-700">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Pillar' : 'Add New Pillar'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="w-full">
            <label className={darkLabelClass}>Name</label>
            <input
              className={darkInputClass}
              placeholder="e.g., Business Consultancy"
              {...register('name')}
              onBlur={(e) => {
                if (!pillar) {
                  setValue('slug', generateSlug(e.target.value));
                }
              }}
            />
            {errors.name?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>URL Slug</label>
            <input
              className={darkInputClass}
              placeholder="business-consultancy"
              {...register('slug')}
            />
            {errors.slug?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Tagline</label>
            <input
              className={darkInputClass}
              placeholder="Short description for the pillar"
              {...register('tagline')}
            />
            {errors.tagline?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.tagline.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Description</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Detailed description of the pillar"
              rows={4}
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Hero Image URL (for pillar page)</label>
            <input
              className={darkInputClass}
              placeholder="https://example.com/hero-image.jpg"
              {...register('hero_image')}
            />
            {errors.hero_image?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.hero_image.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Card Image URL (for home page cards)</label>
            <input
              className={darkInputClass}
              placeholder="https://example.com/card-image.jpg"
              {...register('card_image')}
            />
            {errors.card_image?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.card_image.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Sort Order</label>
            <input
              type="number"
              className={darkInputClass}
              placeholder="0"
              {...register('sort_order')}
            />
            {errors.sort_order?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.sort_order.message}</p>
            )}
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="w-full">
                <label className={darkLabelClass}>Meta Title</label>
                <input
                  className={darkInputClass}
                  placeholder="SEO title for the pillar page"
                  {...register('meta_title')}
                />
                {errors.meta_title?.message && (
                  <p className="text-sm text-red-400 mt-1">{errors.meta_title.message}</p>
                )}
              </div>

              <div className="w-full">
                <label className={darkLabelClass}>Meta Description</label>
                <textarea
                  className={darkTextareaClass}
                  placeholder="SEO description for the pillar page"
                  rows={2}
                  {...register('meta_description')}
                />
                {errors.meta_description?.message && (
                  <p className="text-sm text-red-400 mt-1">{errors.meta_description.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                {...register('is_active')}
              />
              <span className="text-sm text-slate-300">Active (visible on website)</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update Pillar' : 'Create Pillar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
