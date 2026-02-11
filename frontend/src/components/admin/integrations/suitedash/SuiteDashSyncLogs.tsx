import { CheckCircle2, XCircle } from 'lucide-react';
import type { SyncLog } from '../types';

interface SuiteDashSyncLogsProps {
  logs: SyncLog[];
}

export function SuiteDashSyncLogs({ logs }: SuiteDashSyncLogsProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="p-6 border-b border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {logs.slice(0, 3).map((log) => (
          <div key={log.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {log.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-slate-300 capitalize">{log.type}</span>
            </div>
            <span className="text-slate-500">{log.items_synced} items</span>
          </div>
        ))}
      </div>
    </div>
  );
}
