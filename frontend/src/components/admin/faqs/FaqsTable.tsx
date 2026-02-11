import { Loader2, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import type { Faq } from './types';

interface FaqsTableProps {
  faqs: Faq[];
  isLoading: boolean;
  onToggleActive: (faq: Faq) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

export function FaqsTable({
  faqs,
  isLoading,
  onToggleActive,
  onEdit,
  onDelete,
}: FaqsTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400">No FAQs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-slate-700">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Question
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Pillar
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
          {faqs.map((faq) => (
            <tr key={faq.id} className="hover:bg-slate-700/50">
              <td className="px-6 py-4">
                <div className="max-w-lg">
                  <p className="font-medium text-white line-clamp-1">
                    {faq.question}
                  </p>
                  <p className="text-sm text-slate-400 line-clamp-1 mt-1">
                    {faq.answer.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    faq.is_global
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {faq.is_global ? 'Global' : faq.pillar?.name || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    faq.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {faq.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleActive(faq)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title={faq.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {faq.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(faq)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(faq)}
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
  );
}
