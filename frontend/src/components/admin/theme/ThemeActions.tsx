import { Loader2, RotateCcw, Eye, Check } from 'lucide-react';

interface ThemeActionsProps {
  showPreview: boolean;
  isPending: boolean;
  onReset: () => void;
  onDiscard: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
}

export function ThemeActions({
  showPreview,
  isPending,
  onReset,
  onDiscard,
  onTogglePreview,
  onSave,
}: ThemeActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 mb-4 flex-shrink-0">
      <button
        type="button"
        onClick={onReset}
        className="h-9 px-4 text-sm font-medium rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
      <button
        type="button"
        onClick={onDiscard}
        className="h-9 px-4 text-sm font-medium rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
      >
        Discard
      </button>
      <button
        type="button"
        onClick={onTogglePreview}
        className={`h-9 px-4 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
          showPreview
            ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
            : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Eye className="h-4 w-4" />
        {showPreview ? 'Hide Preview' : 'Preview'}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="h-9 px-4 text-sm font-medium rounded-lg bg-accent-yellow text-primary-900 hover:bg-yellow-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Save Changes
      </button>
    </div>
  );
}
