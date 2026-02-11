import { Trash2, Loader2, Cloud } from 'lucide-react';
import { Button } from '@/components/ui';

interface OrderActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onSyncAll: () => void;
  isBulkDeleting: boolean;
  isSyncingAll: boolean;
}

export function OrderActions({
  selectedCount,
  onBulkDelete,
  onSyncAll,
  isBulkDeleting,
  isSyncingAll,
}: OrderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkDelete}
          disabled={isBulkDeleting}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
        >
          {isBulkDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete Selected ({selectedCount})
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={onSyncAll} disabled={isSyncingAll}>
        {isSyncingAll ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Cloud className="h-4 w-4 mr-2" />
        )}
        Sync All to SuiteDash
      </Button>
    </div>
  );
}
