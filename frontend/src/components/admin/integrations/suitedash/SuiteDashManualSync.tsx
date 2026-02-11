import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import type { SuiteDashConfig } from '../types';

type SyncType = 'all' | 'contacts' | 'companies' | 'projects' | 'invoices';

interface SuiteDashManualSyncProps {
  config: SuiteDashConfig;
  onSync: (type: SyncType) => void;
  isSyncing: boolean;
}

export function SuiteDashManualSync({
  config,
  onSync,
  isSyncing,
}: SuiteDashManualSyncProps) {
  return (
    <div className="p-6 border-b border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <RefreshCw className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Manual Sync</h3>
        {config.connection_status !== 'connected' && (
          <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
            Demo Mode
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Sync your contacts, invoices, and other data with SuiteDash.
        {config.connection_status !== 'connected' &&
          ' (Running in demo mode - data will be simulated)'}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => onSync('all')}
          isLoading={isSyncing}
          variant="primary"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync All
        </Button>
        <Button
          onClick={() => onSync('contacts')}
          variant="secondary"
          size="sm"
          disabled={isSyncing}
        >
          Contacts
        </Button>
        <Button
          onClick={() => onSync('companies')}
          variant="secondary"
          size="sm"
          disabled={isSyncing}
        >
          Companies
        </Button>
        <Button
          onClick={() => onSync('projects')}
          variant="secondary"
          size="sm"
          disabled={isSyncing}
        >
          Projects
        </Button>
        <Button
          onClick={() => onSync('invoices')}
          variant="secondary"
          size="sm"
          disabled={isSyncing}
        >
          Invoices
        </Button>
      </div>
    </div>
  );
}
