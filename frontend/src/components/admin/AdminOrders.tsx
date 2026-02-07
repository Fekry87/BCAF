import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Loader2, Search, ShoppingCart, Clock, DollarSign, Eye, X, RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { get, patch, del, post } from '@/services/api';
import { Button } from '@/components/ui';
import type { PaginationMeta } from '@/types';

interface OrderItem {
  serviceId: number;
  title: string;
  type: string;
  price: number;
  pillarName?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  items: OrderItem[];
  notes?: string;
  total: number;
  status: string;
  status_label?: string;
  paymentStatus: string;
  payment_status_label?: string;
  createdAt: string;
  updatedAt: string;
  // SuiteDash sync fields
  suitedash_synced?: boolean;
  suitedash_contact_id?: string;
  suitedash_invoice_id?: string;
  suitedash_sync_error?: string;
  suitedash_synced_at?: string;
  payment_url?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  paid: number;
  unpaid: number;
  this_week: number;
  this_month: number;
  total_revenue: number;
  pending_revenue: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-red-500/20 text-red-400',
  paid: 'bg-green-500/20 text-green-400',
  refunded: 'bg-slate-700 text-slate-400',
};

export function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { search, status: statusFilter, paymentStatus: paymentFilter, page }],
    queryFn: () => get<Order[]>('/admin/orders', {
      search: search || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
      page,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => get<OrderStats>('/admin/orders/stats'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, paymentStatus }: { id: number; status?: string; paymentStatus?: string }) =>
      patch<Order>(`/admin/orders/${id}/status`, { status, paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order updated');
    },
    onError: () => {
      toast.error('Failed to update order');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order deleted');
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('Failed to delete order');
    },
  });

  const syncToSuiteDashMutation = useMutation({
    mutationFn: (id: number) => post<{ synced: boolean }>(`/admin/orders/${id}/sync-suitedash`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      if (data.success) {
        toast.success('Order synced to SuiteDash');
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  const syncAllToSuiteDashMutation = useMutation({
    mutationFn: () => post<{ synced: number; failed: number; total: number }>('/admin/orders/sync-all-suitedash'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      if (data.success && data.data) {
        toast.success(`Synced ${data.data.synced} of ${data.data.total} orders`);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  const orders = ordersData?.data || [];
  const stats = statsData?.data;
  const pagination = ordersData?.meta?.pagination as PaginationMeta | undefined;

  const handleDelete = (order: Order) => {
    if (confirm(`Delete order "${order.orderNumber}"? This action cannot be undone.`)) {
      deleteMutation.mutate(order.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Orders</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => syncAllToSuiteDashMutation.mutate()}
          disabled={syncAllToSuiteDashMutation.isPending}
        >
          {syncAllToSuiteDashMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Cloud className="h-4 w-4 mr-2" />
          )}
          Sync All to SuiteDash
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-slate-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  £{stats.total_revenue.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">Revenue (Paid)</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  £{stats.pending_revenue.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">Pending Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order number, name, or email..."
              className="w-full h-10 pl-10 pr-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
          >
            <option value="">All Payment</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No orders found</p>
            <p className="text-sm text-slate-500 mt-1">Orders will appear here when customers checkout</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">SuiteDash</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-blue-400">{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-sm text-slate-400">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">
                          £{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                            statusColors[order.status] || statusColors.pending
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateStatusMutation.mutate({
                            id: order.id,
                            paymentStatus: e.target.value,
                          })}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                            paymentStatusColors[order.paymentStatus] || paymentStatusColors.unpaid
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.suitedash_synced ? (
                            <span className="flex items-center gap-1 text-xs text-green-400" title={`Synced at ${order.suitedash_synced_at ? new Date(order.suitedash_synced_at).toLocaleString() : 'N/A'}`}>
                              <CheckCircle className="h-4 w-4" />
                              Synced
                            </span>
                          ) : order.suitedash_sync_error ? (
                            <span className="flex items-center gap-1 text-xs text-red-400" title={order.suitedash_sync_error}>
                              <AlertCircle className="h-4 w-4" />
                              Error
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <CloudOff className="h-4 w-4" />
                              Not synced
                            </span>
                          )}
                          <button
                            onClick={() => syncToSuiteDashMutation.mutate(order.id)}
                            disabled={syncToSuiteDashMutation.isPending}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                            title="Sync to SuiteDash"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${syncToSuiteDashMutation.isPending ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Order"
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

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="border-t border-slate-700 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.current_page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Order Details</h2>
                <p className="text-sm text-slate-400">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-white mb-3">Customer</h3>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 border border-slate-600">
                  <p className="font-medium text-white">
                    {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                  <p className="text-sm text-slate-300">{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && (
                    <p className="text-sm text-slate-400">{selectedOrder.customer.phone}</p>
                  )}
                  {selectedOrder.customer.company && (
                    <p className="text-sm text-slate-400">{selectedOrder.customer.company}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-white mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center border border-slate-600">
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-sm text-slate-400">
                          {item.pillarName} • {item.type === 'one_off' ? 'One-off' : 'Subscription'}
                        </p>
                      </div>
                      <p className="font-semibold text-white">£{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Notes</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-400">
                    £{selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        id: selectedOrder.id,
                        status: e.target.value,
                      });
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                    className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        id: selectedOrder.id,
                        paymentStatus: e.target.value,
                      });
                      setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value });
                    }}
                    className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* SuiteDash Sync */}
              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-400" />
                  SuiteDash Integration
                </h3>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Sync Status:</span>
                    {selectedOrder.suitedash_synced ? (
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Synced
                      </span>
                    ) : selectedOrder.suitedash_sync_error ? (
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        Error
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <CloudOff className="h-4 w-4" />
                        Not synced
                      </span>
                    )}
                  </div>
                  {selectedOrder.suitedash_synced_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Synced At:</span>
                      <span className="text-sm text-slate-400">
                        {new Date(selectedOrder.suitedash_synced_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.suitedash_contact_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Contact ID:</span>
                      <span className="text-sm text-slate-400 font-mono">{selectedOrder.suitedash_contact_id}</span>
                    </div>
                  )}
                  {selectedOrder.suitedash_invoice_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Invoice ID:</span>
                      <span className="text-sm text-slate-400 font-mono">{selectedOrder.suitedash_invoice_id}</span>
                    </div>
                  )}
                  {selectedOrder.suitedash_sync_error && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                      <p className="text-xs text-red-400">{selectedOrder.suitedash_sync_error}</p>
                    </div>
                  )}
                  {selectedOrder.payment_url && (
                    <div className="mt-2">
                      <a
                        href={selectedOrder.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        View Payment Link →
                      </a>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        syncToSuiteDashMutation.mutate(selectedOrder.id);
                      }}
                      disabled={syncToSuiteDashMutation.isPending}
                    >
                      {syncToSuiteDashMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {selectedOrder.suitedash_synced ? 'Re-sync to SuiteDash' : 'Sync to SuiteDash'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
