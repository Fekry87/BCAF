import { Loader2, Layers, Plus, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Pillar } from './types';

interface PillarsGridProps {
  pillars: Pillar[];
  isLoading: boolean;
  onToggleActive: (pillar: Pillar) => void;
  onEdit: (pillar: Pillar) => void;
  onDelete: (pillar: Pillar) => void;
  onAddNew: () => void;
}

export function PillarsGrid({
  pillars,
  isLoading,
  onToggleActive,
  onEdit,
  onDelete,
  onAddNew,
}: PillarsGridProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  if (pillars.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">No pillars found</p>
        <Button onClick={onAddNew} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add your first pillar
        </Button>
      </div>
    );
  }

  return (
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
                  <h3 className="text-lg font-semibold text-white">{pillar.name}</h3>
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
                onClick={() => onToggleActive(pillar)}
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
                onClick={() => onEdit(pillar)}
                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(pillar)}
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
  );
}
