import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { get, post, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Service, Pillar } from '@/types';

const serviceSchema = z.object({
  pillar_id: z.string().min(1, 'Pillar is required'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  summary: z.string().min(1, 'Summary is required'),
  details: z.string().optional(),
  type: z.enum(['one_off', 'subscription']),
  price_from: z.string().optional(),
  price_label: z.string().optional(),
  icon: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  pillars: Pillar[];
}

function ServiceModal({ isOpen, onClose, service, pillars }: ServiceModalProps) {
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

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

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

  const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";
  const darkTextareaClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y";
  const darkSelectClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none";

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
              {errors.pillar_id?.message && <p className="text-sm text-red-400 mt-1">{errors.pillar_id.message}</p>}
            </div>

            <div className="w-full">
              <label className={darkLabelClass}>Service Type</label>
              <select className={darkSelectClass} {...register('type')}>
                <option value="one_off">One-off Service</option>
                <option value="subscription">Subscription</option>
              </select>
              {errors.type?.message && <p className="text-sm text-red-400 mt-1">{errors.type.message}</p>}
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
            {errors.title?.message && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>URL Slug</label>
            <input
              className={darkInputClass}
              placeholder="service-url-slug"
              {...register('slug')}
            />
            {errors.slug?.message && <p className="text-sm text-red-400 mt-1">{errors.slug.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Summary</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Brief description of the service"
              rows={3}
              {...register('summary')}
            />
            {errors.summary?.message && <p className="text-sm text-red-400 mt-1">{errors.summary.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Details (Optional)</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Detailed description of the service"
              rows={5}
              {...register('details')}
            />
            {errors.details?.message && <p className="text-sm text-red-400 mt-1">{errors.details.message}</p>}
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
              {errors.price_from?.message && <p className="text-sm text-red-400 mt-1">{errors.price_from.message}</p>}
            </div>

            <div className="w-full">
              <label className={darkLabelClass}>Price Label (Optional)</label>
              <input
                className={darkInputClass}
                placeholder="e.g., per hour, per month"
                {...register('price_label')}
              />
              {errors.price_label?.message && <p className="text-sm text-red-400 mt-1">{errors.price_label.message}</p>}
            </div>
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Icon (Optional)</label>
            <input
              className={darkInputClass}
              placeholder="Icon name or class"
              {...register('icon')}
            />
            {errors.icon?.message && <p className="text-sm text-red-400 mt-1">{errors.icon.message}</p>}
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

export function AdminServices() {
  const queryClient = useQueryClient();
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['admin', 'services', selectedPillar],
    queryFn: () =>
      get<Service[]>('/admin/services', selectedPillar ? { pillar_id: selectedPillar } : {}),
  });

  const { data: pillarsData } = useQuery({
    queryKey: ['admin', 'pillars'],
    queryFn: () => get<Pillar[]>('/admin/pillars'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (service: Service) =>
      post<Service>(`/admin/services/${service.id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated');
    },
    onError: () => {
      toast.error('Failed to update service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted');
    },
    onError: () => {
      toast.error('Failed to delete service');
    },
  });

  const services = servicesData?.data || [];
  const pillars = pillarsData?.data || [];

  const handleDelete = (service: Service) => {
    if (confirm(`Delete "${service.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(service.id);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Services</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">Filter by pillar:</label>
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="h-10 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-xs"
          >
            <option value="">All Pillars</option>
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No services found</p>
            <Button onClick={handleAddNew} variant="secondary" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add your first service
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Pillar
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{service.title}</p>
                        <p className="text-sm text-slate-400 truncate max-w-xs">
                          {service.summary}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {service.pillar?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          service.type === 'one_off'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {service.type === 'one_off' ? 'One-off' : 'Subscription'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          service.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActiveMutation.mutate(service)}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                          title={service.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {service.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        pillars={pillars}
      />
    </div>
  );
}
