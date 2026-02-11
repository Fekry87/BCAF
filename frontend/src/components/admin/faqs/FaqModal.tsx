import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  type FaqFormData,
  type Pillar,
  darkInputClass,
  darkLabelClass,
  darkTextareaClass,
  darkSelectClass,
} from './types';

interface FaqModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FaqFormData;
  pillars: Pillar[];
  isSaving: boolean;
  onClose: () => void;
  onFormChange: (data: FaqFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FaqModal({
  isOpen,
  isEditing,
  formData,
  pillars,
  isSaving,
  onClose,
  onFormChange,
  onSubmit,
}: FaqModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70" onClick={onClose} />
        <div className="relative bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl border border-slate-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div>
              <label className={darkLabelClass}>Question *</label>
              <input
                type="text"
                className={darkInputClass}
                value={formData.question}
                onChange={(e) =>
                  onFormChange({ ...formData, question: e.target.value })
                }
                placeholder="Enter the FAQ question"
                required
              />
            </div>

            <div>
              <label className={darkLabelClass}>Answer *</label>
              <textarea
                className={darkTextareaClass}
                value={formData.answer}
                onChange={(e) =>
                  onFormChange({ ...formData, answer: e.target.value })
                }
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
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      pillarId: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
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
                  onChange={(e) =>
                    onFormChange({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., General, Pricing, Support"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onFormChange({ ...formData, isActive: !formData.isActive })
                }
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
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
