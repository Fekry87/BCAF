import { X, Cloud, CloudOff, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Order } from './types';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (params: { id: number; status?: string; paymentStatus?: string }) => void;
  onSyncOrder: (id: number) => void;
  isSyncing: boolean;
}

export function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onSyncOrder,
  isSyncing,
}: OrderDetailModalProps) {
  const handleStatusChange = (status: string) => {
    onUpdateStatus({ id: order.id, status });
  };

  const handlePaymentStatusChange = (paymentStatus: string) => {
    onUpdateStatus({ id: order.id, paymentStatus });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Order Details</h2>
            <p className="text-sm text-slate-400">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <CustomerInfo customer={order.customer} />

          {/* Order Items */}
          <OrderItems items={order.items} />

          {/* Notes */}
          {order.notes && <OrderNotes notes={order.notes} />}

          {/* Total */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-blue-400">
                £{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Selectors */}
          <StatusSelectors
            status={order.status}
            paymentStatus={order.paymentStatus}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
          />

          {/* SuiteDash Sync */}
          <SuiteDashSection
            order={order}
            onSync={() => onSyncOrder(order.id)}
            isSyncing={isSyncing}
          />
        </div>
      </div>
    </div>
  );
}

interface CustomerInfoProps {
  customer: Order['customer'];
}

function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-3">Customer</h3>
      <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 border border-slate-600">
        <p className="font-medium text-white">
          {customer.firstName} {customer.lastName}
        </p>
        <p className="text-sm text-slate-300">{customer.email}</p>
        {customer.phone && <p className="text-sm text-slate-400">{customer.phone}</p>}
        {customer.company && <p className="text-sm text-slate-400">{customer.company}</p>}
      </div>
    </div>
  );
}

interface OrderItemsProps {
  items: Order['items'];
}

function OrderItems({ items }: OrderItemsProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-3">Items</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center border border-slate-600"
          >
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
  );
}

interface OrderNotesProps {
  notes: string;
}

function OrderNotes({ notes }: OrderNotesProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-3">Notes</h3>
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{notes}</p>
      </div>
    </div>
  );
}

interface StatusSelectorsProps {
  status: string;
  paymentStatus: string;
  onStatusChange: (status: string) => void;
  onPaymentStatusChange: (paymentStatus: string) => void;
}

function StatusSelectors({
  status,
  paymentStatus,
  onStatusChange,
  onPaymentStatusChange,
}: StatusSelectorsProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-300 mb-2">Order Status</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
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
          value={paymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>
  );
}

interface SuiteDashSectionProps {
  order: Order;
  onSync: () => void;
  isSyncing: boolean;
}

function SuiteDashSection({ order, onSync, isSyncing }: SuiteDashSectionProps) {
  return (
    <div className="border-t border-slate-700 pt-4">
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <Cloud className="h-5 w-5 text-blue-400" />
        SuiteDash Integration
      </h3>
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Sync Status:</span>
          {order.suitedash_synced ? (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              Synced
            </span>
          ) : order.suitedash_sync_error ? (
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
        {order.suitedash_synced_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Synced At:</span>
            <span className="text-sm text-slate-400">
              {new Date(order.suitedash_synced_at).toLocaleString()}
            </span>
          </div>
        )}
        {order.suitedash_contact_id && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Contact ID:</span>
            <span className="text-sm text-slate-400 font-mono">{order.suitedash_contact_id}</span>
          </div>
        )}
        {order.suitedash_invoice_id ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Invoice ID:</span>
            <span className="text-sm text-slate-400 font-mono">{order.suitedash_invoice_id}</span>
          </div>
        ) : order.suitedash_contact_id && order.suitedash_synced && (
          <div className="mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/30">
            <p className="text-xs text-amber-400">
              <strong>Note:</strong> Contact synced successfully. Invoice needs to be created manually in SuiteDash
              (Invoice API not available in your plan).
            </p>
          </div>
        )}
        {order.suitedash_sync_error && (
          <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
            <p className="text-xs text-red-400">{order.suitedash_sync_error}</p>
          </div>
        )}
        {order.payment_url && (
          <div className="mt-2">
            <a
              href={order.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              View Payment Link →
            </a>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-slate-600">
          <Button variant="secondary" size="sm" onClick={onSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {order.suitedash_synced ? 'Re-sync to SuiteDash' : 'Sync to SuiteDash'}
          </Button>
        </div>
      </div>
    </div>
  );
}
