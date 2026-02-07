import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Save } from 'lucide-react';
import { get, post, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { Faq, Pillar } from '@/types';

interface FaqFormData {
  question: string;
  answer: string;
  pillarId: number | null;
  category: string;
  isActive: boolean;
}

const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";
const darkTextareaClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y";
const darkSelectClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export function AdminFaqs() {
  const queryClient = useQueryClient();
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState<FaqFormData>({
    question: '',
    answer: '',
    pillarId: null,
    category: 'General',
    isActive: true,
  });

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['admin', 'faqs', selectedPillar],
    queryFn: () => get<Faq[]>('/admin/faqs', selectedPillar ? { pillar_id: selectedPillar } : {}),
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
    mutationFn: ({ id, data }: { id: number; data: FaqFormData }) => put<Faq>(`/admin/faqs/${id}`, data),
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
    setFormData({
      question: '',
      answer: '',
      pillarId: null,
      category: 'General',
      isActive: true,
    });
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
    setFormData({
      question: '',
      answer: '',
      pillarId: null,
      category: 'General',
      isActive: true,
    });
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
          <label className="text-sm font-medium text-slate-300">Filter by pillar:</label>
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
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No FAQs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Question</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Pillar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="max-w-lg">
                        <p className="font-medium text-white line-clamp-1">{faq.question}</p>
                        <p className="text-sm text-slate-400 line-clamp-1 mt-1">{faq.answer.replace(/<[^>]*>/g, '')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        faq.is_global
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {faq.is_global ? 'Global' : faq.pillar?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        faq.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActiveMutation.mutate(faq)}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                          title={faq.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70" onClick={closeModal} />
            <div className="relative bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl border border-slate-700">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className={darkLabelClass}>Question *</label>
                  <input
                    type="text"
                    className={darkInputClass}
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter the FAQ question"
                    required
                  />
                </div>

                <div>
                  <label className={darkLabelClass}>Answer *</label>
                  <textarea
                    className={darkTextareaClass}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Enter the FAQ answer"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={darkLabelClass}>Pillar</label>
                    <select
                      className={darkSelectClass}
                      value={formData.pillarId || ''}
                      onChange={(e) => setFormData({ ...formData, pillarId: e.target.value ? parseInt(e.target.value) : null })}
                    >
                      <option value="">Global (All Pillars)</option>
                      {pillars.map((pillar) => (
                        <option key={pillar.id} value={pillar.id}>
                          {pillar.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={darkLabelClass}>Category</label>
                    <input
                      type="text"
                      className={darkInputClass}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., General, Pricing, Support"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
