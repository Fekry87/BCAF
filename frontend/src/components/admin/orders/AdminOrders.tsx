import { useState } from 'react';
import { useOrders } from './useOrders';
import { OrderStatsCards } from './OrderStatsCards';
import { OrderFilters } from './OrderFilters';
import { OrderTable } from './OrderTable';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderActions } from './OrderActions';
import { OrderPagination } from './OrderPagination';
import type { Order, PaginationMeta } from './types';

// Type assertion helper for pagination
function isPagination(obj: unknown): obj is PaginationMeta {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'current_page' in obj &&
    'last_page' in obj
  );
}

export function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const {
    orders,
    stats,
    pagination,
    isLoading,
    updateStatus,
    deleteOrder,
    bulkDelete,
    syncOrder,
    syncAllOrders,
    isBulkDeleting,
    isSyncing,
    isSyncingAll,
  } = useOrders({
    search,
    status: statusFilter,
    paymentStatus: paymentFilter,
    page,
  });

  const handleDelete = (order: Order) => {
    if (confirm(`Delete order "${order.orderNumber}"? This will also remove from SuiteDash. This action cannot be undone.`)) {
      deleteOrder(order.id);
      setSelectedOrder(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} order(s)? This will also remove them from SuiteDash. This action cannot be undone.`)) {
      bulkDelete(Array.from(selectedIds), {
        onSuccess: () => setSelectedIds(new Set()),
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = orders.length > 0 && selectedIds.size === orders.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  const handleFilterChange = (
    type: 'search' | 'status' | 'payment',
    value: string
  ) => {
    setPage(1);
    switch (type) {
      case 'search':
        setSearch(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'payment':
        setPaymentFilter(value);
        break;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-h2 text-white">Orders</h1>
          {selectedIds.size > 0 && (
            <span className="text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
              {selectedIds.size} selected
            </span>
          )}
        </div>
        <OrderActions
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          onSyncAll={syncAllOrders}
          isBulkDeleting={isBulkDeleting}
          isSyncingAll={isSyncingAll}
        />
      </div>

      {/* Stats Cards */}
      {stats && <OrderStatsCards stats={stats} />}

      {/* Filters */}
      <OrderFilters
        search={search}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchChange={(value) => handleFilterChange('search', value)}
        onStatusChange={(value) => handleFilterChange('status', value)}
        onPaymentChange={(value) => handleFilterChange('payment', value)}
      />

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
          onUpdateStatus={updateStatus}
          onViewOrder={setSelectedOrder}
          onDeleteOrder={handleDelete}
          onSyncOrder={syncOrder}
          isSyncing={isSyncing}
        />

        {/* Pagination */}
        {isPagination(pagination) && (
          <OrderPagination pagination={pagination} onPageChange={setPage} />
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(params) => {
            updateStatus(params);
            if (params.status) {
              setSelectedOrder({ ...selectedOrder, status: params.status });
            }
            if (params.paymentStatus) {
              setSelectedOrder({ ...selectedOrder, paymentStatus: params.paymentStatus });
            }
          }}
          onSyncOrder={syncOrder}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
}
