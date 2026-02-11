import { Users, Database, FileText, CreditCard } from 'lucide-react';
import { StatCard } from '../shared';
import type { IntegrationStats } from '../types';

interface SuiteDashStatsOverviewProps {
  stats: IntegrationStats;
}

export function SuiteDashStatsOverview({ stats }: SuiteDashStatsOverviewProps) {
  return (
    <div className="p-6 border-b border-slate-700 bg-slate-800/50">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Sync Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Contacts"
          value={stats.total_contacts_synced}
          pending={stats.pending_contacts}
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Companies"
          value={stats.total_companies_synced}
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Projects"
          value={stats.total_projects_synced}
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="Invoices"
          value={stats.total_invoices_synced}
          pending={stats.pending_invoices}
        />
      </div>
      {stats.last_successful_sync && (
        <p className="text-xs text-slate-500 mt-4">
          Last synced: {new Date(stats.last_successful_sync).toLocaleString()}
        </p>
      )}
    </div>
  );
}
