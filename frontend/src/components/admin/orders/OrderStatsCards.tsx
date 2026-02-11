import { ShoppingCart, Clock, DollarSign, CheckCircle } from 'lucide-react';
import type { OrderStats } from './types';

interface OrderStatsCardsProps {
  stats: OrderStats;
}

export function OrderStatsCards({ stats }: OrderStatsCardsProps) {
  const cards = [
    {
      icon: ShoppingCart,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      label: 'Total Orders',
      value: stats.total,
      subtext: `${stats.this_week} this week`,
    },
    {
      icon: Clock,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      label: 'Pending',
      value: stats.pending,
      subtext: `${stats.in_progress} in progress`,
    },
    {
      icon: DollarSign,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      label: 'Revenue',
      value: `£${stats.total_revenue.toLocaleString()}`,
      subtext: `£${stats.pending_revenue.toLocaleString()} pending`,
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      label: 'Completed',
      value: stats.completed,
      subtext: `${stats.paid} paid`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
