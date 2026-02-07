import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Layers } from 'lucide-react';
import { get, post, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Pillar } from '@/types';

const pillarSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  hero_image: z.string().optional(),
  card_image: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  sort_order: z.string().optional(),
  is_active: z.boolean().optional(),
});

type PillarFormValues = z.infer<typeof pillarSchema>;

interface PillarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar?: Pillar | null;
}

function PillarModal({ isOpen, onClose, pillar }: PillarModalProps) {
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

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

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

  const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";
  const darkTextareaClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y";

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
            {errors.name?.message && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>URL Slug</label>
            <input
              className={darkInputClass}
              placeholder="business-consultancy"
              {...register('slug')}
            />
            {errors.slug?.message && <p className="text-sm text-red-400 mt-1">{errors.slug.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Tagline</label>
            <input
              className={darkInputClass}
              placeholder="Short description for the pillar"
              {...register('tagline')}
            />
            {errors.tagline?.message && <p className="text-sm text-red-400 mt-1">{errors.tagline.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Description</label>
            <textarea
              className={darkTextareaClass}
              placeholder="Detailed description of the pillar"
              rows={4}
              {...register('description')}
            />
            {errors.description?.message && <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Hero Image URL (for pillar page)</label>
            <input
              className={darkInputClass}
              placeholder="https://example.com/hero-image.jpg"
              {...register('hero_image')}
            />
            {errors.hero_image?.message && <p className="text-sm text-red-400 mt-1">{errors.hero_image.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Card Image URL (for home page cards)</label>
            <input
              className={darkInputClass}
              placeholder="https://example.com/card-image.jpg"
              {...register('card_image')}
            />
            {errors.card_image?.message && <p className="text-sm text-red-400 mt-1">{errors.card_image.message}</p>}
          </div>

          <div className="w-full">
            <label className={darkLabelClass}>Sort Order</label>
            <input
              type="number"
              className={darkInputClass}
              placeholder="0"
              {...register('sort_order')}
            />
            {errors.sort_order?.message && <p className="text-sm text-red-400 mt-1">{errors.sort_order.message}</p>}
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
                {errors.meta_title?.message && <p className="text-sm text-red-400 mt-1">{errors.meta_title.message}</p>}
              </div>

              <div className="w-full">
                <label className={darkLabelClass}>Meta Description</label>
                <textarea
                  className={darkTextareaClass}
                  placeholder="SEO description for the pillar page"
                  rows={2}
                  {...register('meta_description')}
                />
                {errors.meta_description?.message && <p className="text-sm text-red-400 mt-1">{errors.meta_description.message}</p>}
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

export function AdminPillars() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);

  const { data: pillarsData, isLoading } = useQuery({
    queryKey: ['admin', 'pillars'],
    queryFn: () => get<Pillar[]>('/admin/pillars'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (pillar: Pillar) =>
      post<Pillar>(`/admin/pillars/${pillar.id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pillars'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar updated');
    },
    onError: () => {
      toast.error('Failed to update pillar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/pillars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pillars'] });
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar deleted');
    },
    onError: () => {
      toast.error('Failed to delete pillar');
    },
  });

  const pillars = pillarsData?.data || [];

  const handleDelete = (pillar: Pillar) => {
    if (confirm(`Delete "${pillar.name}"? This will also affect all associated services.`)) {
      deleteMutation.mutate(pillar.id);
    }
  };

  const handleEdit = (pillar: Pillar) => {
    setEditingPillar(pillar);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPillar(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-white">Pillars</h1>
          <p className="text-slate-400 mt-1">
            Manage your service categories and their settings
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pillar
        </Button>
      </div>

      {/* Pillars Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
        </div>
      ) : pillars.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No pillars found</p>
          <Button onClick={handleAddNew} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add your first pillar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Layers className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {pillar.name}
                      </h3>
                      <p className="text-sm text-slate-400">/{pillar.slug}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      pillar.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {pillar.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {pillar.tagline && (
                  <p className="text-slate-300 mb-4">{pillar.tagline}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <span>{pillar.services_count || 0} services</span>
                  <span>•</span>
                  <span>Sort order: {pillar.sort_order}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => toggleActiveMutation.mutate(pillar)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title={pillar.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {pillar.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(pillar)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pillar)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pillar Modal */}
      <PillarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPillar(null);
        }}
        pillar={editingPillar}
      />
    </div>
  );
}
