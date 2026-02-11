import { type ReactNode } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

// Shared CSS classes
export const darkInputClass =
  'w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
export const darkLabelClass = 'block text-sm font-semibold text-slate-300 mb-2';

// Connection status types
type ConnectionStatus = 'connected' | 'disconnected' | 'error';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const statusConfig = {
    connected: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      icon: CheckCircle2,
      label: 'Connected',
    },
    disconnected: {
      bg: 'bg-slate-700',
      text: 'text-slate-400',
      icon: Clock,
      label: 'Disconnected',
    },
    error: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Error',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

interface IntegrationHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  status: ConnectionStatus;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function IntegrationHeader({
  icon,
  title,
  description,
  status,
  enabled,
  onToggle,
}: IntegrationHeaderProps) {
  return (
    <div className="p-6 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge status={status} />
          <ToggleSwitch enabled={enabled} onChange={onToggle} />
        </div>
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  children: ReactNode;
}

export function IntegrationCard({ children }: IntegrationCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = 'h-32' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  pending?: number;
}

export function StatCard({ icon, label, value, pending }: StatCardProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {pending !== undefined && pending > 0 && (
        <p className="text-xs text-yellow-400 mt-1">{pending} pending</p>
      )}
    </div>
  );
}
