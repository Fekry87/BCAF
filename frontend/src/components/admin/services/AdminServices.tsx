import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { get, post, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Service, Pillar } from './types';
import { ServiceModal } from './ServiceModal';
import { ServicesTable } from './ServicesTable';

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
        <ServicesTable
          services={services}
          isLoading={isLoading}
          onToggleActive={(service) => toggleActiveMutation.mutate(service)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
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
