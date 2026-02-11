import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { get, post, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Faq, Pillar, FaqFormData } from './types';
import { FaqModal } from './FaqModal';
import { FaqsTable } from './FaqsTable';

const initialFormData: FaqFormData = {
  question: '',
  answer: '',
  pillarId: null,
  category: 'General',
  isActive: true,
};

export function AdminFaqs() {
  const queryClient = useQueryClient();
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState<FaqFormData>(initialFormData);

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['admin', 'faqs', selectedPillar],
    queryFn: () =>
      get<Faq[]>(
        '/admin/faqs',
        selectedPillar ? { pillar_id: selectedPillar } : {}
      ),
  });

  const { data: pillarsData } = useQuery({
    queryKey: ['admin', 'pillars'],
    queryFn: () => get<Pillar[]>('/admin/pillars'),
  });

  const createMutation = useMutation({
    mutationFn: (data: FaqFormData) => post<Faq>('/admin/faqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ created successfully');
      closeModal();
    },
    onError: () => {
      toast.error('Failed to create FAQ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FaqFormData }) =>
      put<Faq>(`/admin/faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ updated successfully');
      closeModal();
    },
    onError: () => {
      toast.error('Failed to update FAQ');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (faq: Faq) => post<Faq>(`/admin/faqs/${faq.id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ updated');
    },
    onError: () => {
      toast.error('Failed to update FAQ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ deleted');
    },
    onError: () => {
      toast.error('Failed to delete FAQ');
    },
  });

  const faqs = faqsData?.data || [];
  const pillars = pillarsData?.data || [];

  const handleDelete = (faq: Faq) => {
    if (confirm(`Delete this FAQ? This action cannot be undone.`)) {
      deleteMutation.mutate(faq.id);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      pillarId: faq.pillar_id || null,
      category: faq.category || 'General',
      isActive: faq.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">FAQs</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">
            Filter by pillar:
          </label>
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="h-10 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-xs"
          >
            <option value="">All FAQs</option>
            <option value="global">Global FAQs</option>
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <FaqsTable
          faqs={faqs}
          isLoading={isLoading}
          onToggleActive={(faq) => toggleActiveMutation.mutate(faq)}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      <FaqModal
        isOpen={isModalOpen}
        isEditing={!!editingFaq}
        formData={formData}
        pillars={pillars}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={closeModal}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
