import { Button } from '@/components/ui';
import type { PaginationMeta } from './types';

interface OrderPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function OrderPagination({ pagination, onPageChange }: OrderPaginationProps) {
  if (pagination.last_page <= 1) {
    return null;
  }

  return (
    <div className="border-t border-slate-700 px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-slate-400">
        Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, pagination.current_page - 1))}
          disabled={pagination.current_page === 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
          disabled={pagination.current_page === pagination.last_page}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
