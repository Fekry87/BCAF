import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { get, patch, del, post } from '@/services/api';
import type { Order, OrderStats, OrdersQueryParams } from './types';

export function useOrders(params: OrdersQueryParams = {}) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () =>
      get<Order[]>('/admin/orders', {
        search: params.search || undefined,
        status: params.status || undefined,
        paymentStatus: params.paymentStatus || undefined,
        page: params.page,
      }),
  });

  const statsQuery = useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => get<OrderStats>('/admin/orders/stats'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      paymentStatus,
    }: {
      id: number;
      status?: string;
      paymentStatus?: string;
    }) => patch<Order>(`/admin/orders/${id}/status`, { status, paymentStatus }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order updated');
    },
    onError: () => {
      toast.error('Failed to update order');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/orders/${id}?sync_suitedash=true`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order deleted');
    },
    onError: () => {
      toast.error('Failed to delete order');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      post<{ deleted: number; failed: number }>('/admin/orders/bulk-delete', {
        ids,
        sync_suitedash: true,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      if (data.success && data.data) {
        toast.success(`Deleted ${data.data.deleted} orders`);
      }
    },
    onError: () => {
      toast.error('Failed to delete orders');
    },
  });

  const syncToSuiteDashMutation = useMutation({
    mutationFn: (id: number) => post<{ synced: boolean }>(`/admin/orders/${id}/sync-suitedash`),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      if (data.success) {
        toast.success('Order synced to SuiteDash');
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  const syncAllToSuiteDashMutation = useMutation({
    mutationFn: () =>
      post<{ synced: number; failed: number; total: number }>('/admin/orders/sync-all-suitedash'),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      if (data.success && data.data) {
        toast.success(`Synced ${data.data.synced} of ${data.data.total} orders`);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  return {
    // Queries
    orders: ordersQuery.data?.data || [],
    stats: statsQuery.data?.data,
    pagination: ordersQuery.data?.meta?.pagination,
    isLoading: ordersQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,

    // Mutations
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,

    deleteOrder: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    bulkDelete: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,

    syncOrder: syncToSuiteDashMutation.mutate,
    isSyncing: syncToSuiteDashMutation.isPending,

    syncAllOrders: syncAllToSuiteDashMutation.mutate,
    isSyncingAll: syncAllToSuiteDashMutation.isPending,
  };
}

export function useOrderSelection(orders: Order[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = orders.length > 0 && selectedIds.size === orders.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  };
}
