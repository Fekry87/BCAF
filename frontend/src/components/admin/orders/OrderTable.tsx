import { Loader2, ShoppingCart, CheckSquare, MinusSquare, Square, Eye, Trash2, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Order } from './types';
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from './types';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  selectedIds: Set<number>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
  onUpdateStatus: (params: { id: number; status?: string; paymentStatus?: string }) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onSyncOrder: (id: number) => void;
  isSyncing: boolean;
}

export function OrderTable({
  orders,
  isLoading,
  selectedIds,
  isAllSelected,
  isSomeSelected,
  onToggleSelectAll,
  onToggleSelect,
  onUpdateStatus,
  onViewOrder,
  onDeleteOrder,
  onSyncOrder,
  isSyncing,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No orders found</p>
        <p className="text-sm text-slate-500 mt-1">
          Orders will appear here when customers checkout
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-slate-700">
          <tr>
            <th className="px-4 py-4 text-left">
              <button
                onClick={onToggleSelectAll}
                className="text-slate-400 hover:text-white transition-colors"
                title={isAllSelected ? 'Deselect all' : 'Select all'}
              >
                {isAllSelected ? (
                  <CheckSquare className="h-5 w-5 text-blue-400" />
                ) : isSomeSelected ? (
                  <MinusSquare className="h-5 w-5 text-blue-400" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
            </th>
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
            <OrderRow
              key={order.id}
              order={order}
              isSelected={selectedIds.has(order.id)}
              onToggleSelect={() => onToggleSelect(order.id)}
              onUpdateStatus={onUpdateStatus}
              onView={() => onViewOrder(order)}
              onDelete={() => onDeleteOrder(order)}
              onSync={() => onSyncOrder(order.id)}
              isSyncing={isSyncing}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface OrderRowProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (params: { id: number; status?: string; paymentStatus?: string }) => void;
  onView: () => void;
  onDelete: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

function OrderRow({
  order,
  isSelected,
  onToggleSelect,
  onUpdateStatus,
  onView,
  onDelete,
  onSync,
  isSyncing,
}: OrderRowProps) {
  return (
    <tr className={`hover:bg-slate-700/50 ${isSelected ? 'bg-blue-500/10' : ''}`}>
      <td className="px-4 py-4">
        <button onClick={onToggleSelect} className="text-slate-400 hover:text-white transition-colors">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-400" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-blue-400">{order.orderNumber}</p>
          <p className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })} • {new Date(order.createdAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
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
        <span className="font-semibold text-white">£{order.total.toLocaleString()}</span>
      </td>
      <td className="px-6 py-4">
        <select
          value={order.status}
          onChange={(e) => onUpdateStatus({ id: order.id, status: e.target.value })}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
            ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending
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
          onChange={(e) => onUpdateStatus({ id: order.id, paymentStatus: e.target.value })}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
            PAYMENT_STATUS_COLORS[order.paymentStatus] || PAYMENT_STATUS_COLORS.unpaid
          }`}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <SuiteDashStatus order={order} onSync={onSync} isSyncing={isSyncing} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface SuiteDashStatusProps {
  order: Order;
  onSync: () => void;
  isSyncing: boolean;
}

function SuiteDashStatus({ order, onSync, isSyncing }: SuiteDashStatusProps) {
  if (order.suitedash_synced) {
    // Show different status if contact synced but no invoice
    const hasInvoice = !!order.suitedash_invoice_id;
    return (
      <div className="flex items-center gap-1" title={hasInvoice ? 'Contact & Invoice synced' : 'Contact synced (no invoice API)'}>
        <Cloud className={`h-4 w-4 ${hasInvoice ? 'text-green-400' : 'text-amber-400'}`} />
        <span className={`text-xs ${hasInvoice ? 'text-green-400' : 'text-amber-400'}`}>
          {hasInvoice ? 'Synced' : 'Contact'}
        </span>
      </div>
    );
  }

  if (order.suitedash_sync_error) {
    const isRateLimit = order.suitedash_sync_error.includes('rate limit') || order.suitedash_sync_error.includes('requests');
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={onSync}
          disabled={isSyncing || isRateLimit}
          className={`flex items-center gap-1 ${isRateLimit ? 'text-amber-400 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
          title={order.suitedash_sync_error}
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{isRateLimit ? 'Limit' : 'Error'}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSync}
      disabled={isSyncing}
      className="flex items-center gap-1 text-slate-400 hover:text-blue-400"
    >
      {isSyncing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <CloudOff className="h-4 w-4" />
      )}
      <span className="text-xs">Sync</span>
    </button>
  );
}
