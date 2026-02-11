import { Search } from 'lucide-react';

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  paymentFilter: string;
  onPaymentChange: (value: string) => void;
}

export function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
}: OrderFiltersProps) {
  const selectClass =
    'h-10 px-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select value={paymentFilter} onChange={(e) => onPaymentChange(e.target.value)} className={selectClass}>
        <option value="">All Payments</option>
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>
  );
}
