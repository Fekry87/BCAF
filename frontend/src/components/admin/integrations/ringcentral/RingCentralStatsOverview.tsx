import { PhoneOutgoing, PhoneIncoming, MessageSquare, Video } from 'lucide-react';
import { StatCard } from '../shared';
import type { RingCentralStats } from '../types';

interface RingCentralStatsOverviewProps {
  stats: RingCentralStats;
}

export function RingCentralStatsOverview({ stats }: RingCentralStatsOverviewProps) {
  return (
    <div className="p-6 border-b border-slate-700 bg-slate-800/50">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Communication Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<PhoneOutgoing className="h-4 w-4" />}
          label="Outbound Calls"
          value={stats.total_calls_made}
        />
        <StatCard
          icon={<PhoneIncoming className="h-4 w-4" />}
          label="Inbound Calls"
          value={stats.total_calls_received}
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="SMS Sent"
          value={stats.total_sms_sent}
        />
        <StatCard
          icon={<Video className="h-4 w-4" />}
          label="Video Meetings"
          value={stats.total_meetings}
        />
      </div>
    </div>
  );
}
