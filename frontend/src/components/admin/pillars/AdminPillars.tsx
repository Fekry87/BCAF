import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { get, post, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Pillar } from './types';
import { PillarModal } from './PillarModal';
import { PillarsGrid } from './PillarsGrid';

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
      <PillarsGrid
        pillars={pillars}
        isLoading={isLoading}
        onToggleActive={(pillar) => toggleActiveMutation.mutate(pillar)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />

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
