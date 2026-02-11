import { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { post, put } from '@/services/api';
import { Button } from '@/components/ui';
import {
  serviceSchema,
  type ServiceFormValues,
  type ServiceModalProps,
  type Service,
} from './types';
import {
  darkInputClass,
  darkLabelClass,
  darkTextareaClass,
  darkSelectClass,
  generateSlug,
} from './shared';

export function ServiceModal({ isOpen, onClose, service, pillars }: ServiceModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!service;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      pillar_id: '',
      title: '',
      slug: '',
      summary: '',
      details: '',
      type: 'one_off',
      price_from: '',
      price_label: '',
      icon: '',
      is_featured: false,
      is_active: true,
    },
  });

  // Reset form when service changes (for editing)
  useEffect(() => {
    if (service) {
      reset({
        pillar_id: String(service.pillar_id),
        title: service.title,
        slug: service.slug,
        summary: service.summary,
        details: service.details || '',
        type: service.type,
        price_from: service.price_from ? String(service.price_from) : '',
        price_label: service.price_label || '',
        icon: service.icon || '',
        is_featured: service.is_featured,
        is_active: service.is_active,
      });
    } else {
      reset({
        pillar_id: '',
        title: '',
        slug: '',
        summary: '',
        details: '',
        type: 'one_off',
        price_from: '',
        price_label: '',
        icon: '',
        is_featured: false,
        is_active: true,
      });
    }
  }, [service, reset]);

  const createMutation = useMutation({
    mutationFn: (data: ServiceFormValues) =>
      post<Service>('/admin/services', {
        ...data,
        pillar_id: parseInt(data.pillar_id),
        price_from: data.price_from ? parseFloat(data.price_from) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create service');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ServiceFormValues) =>
      put<Service>(`/admin/services/${service?.id}`, {
        ...data,
        pillar_id: parseInt(data.pillar_id),
        price_from: data.price_from ? parseFloat(data.price_from) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to update service');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ServiceFormValues) => {
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
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label className={darkLabelClass}>Pillar</label>
              <select className={darkSelectClass} {...register('pillar_id')}>
                <option value="">Select a pillar</option>
                {pillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
              {errors.pillar_id?.message && (
                <p className="text-sm text-red-400 mt-1">{errors.pillar_id.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className={darkLabelClass}>Service Type</label>
              <select className={darkSelectClass} {...register('type')}>
                <option value="one_off">One-off Service</option>
                <option value="subscription">Subscription</option>
              </select>
              {errors.type?.message && (
                <p className="text-sm text-red-400 mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Title</label>
            <input
              className={darkInputClass}
              placeholder="Enter service title"
              {...register('title')}
              onBlur={(e) => {
                if (!service) {
                  setValue('slug', generateSlug(e.target.value));
                }
              }}
            />
            {errors.title?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>URL Slug</label>
            <input
              className={darkInputClass}
              placeholder="service-url-slug"
              {...register('slug')}
            />
            {errors.slug?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Summary</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Brief description of the service"
              rows={3}
              {...register('summary')}
            />
            {errors.summary?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.summary.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Details (Optional)</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Detailed description of the service"
              rows={5}
              {...register('details')}
            />
            {errors.details?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.details.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label className={darkLabelClass}>Price From (Optional)</label>
              <input
                type="number"
                className={darkInputClass}
                placeholder="0.00"
                {...register('price_from')}
              />
              {errors.price_from?.message && (
                <p className="text-sm text-red-400 mt-1">{errors.price_from.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className={darkLabelClass}>Price Label (Optional)</label>
              <input
                className={darkInputClass}
                placeholder="e.g., per hour, per month"
                {...register('price_label')}
              />
              {errors.price_label?.message && (
                <p className="text-sm text-red-400 mt-1">{errors.price_label.message}</p>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Icon (Optional)</label>
            <input
              className={darkInputClass}
              placeholder="Icon name or class"
              {...register('icon')}
            />
            {errors.icon?.message && (
              <p className="text-sm text-red-400 mt-1">{errors.icon.message}</p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                {...register('is_featured')}
              />
              <span className="text-sm text-slate-300">Featured service</span>
            </label>

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
              {isEditing ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
