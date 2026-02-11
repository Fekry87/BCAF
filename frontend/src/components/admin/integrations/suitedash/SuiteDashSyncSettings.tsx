import { Database, Users, FileText, CreditCard } from 'lucide-react';
import { SectionHeader, ToggleSwitch } from '../shared';
import type { SuiteDashConfig } from '../types';

interface SuiteDashSyncSettingsProps {
  config: SuiteDashConfig;
  onConfigChange: (config: SuiteDashConfig) => void;
}

const syncSettingsItems = [
  {
    key: 'sync_contacts',
    label: 'Sync Contacts',
    description: 'Sync customer contacts',
    icon: Users,
  },
  {
    key: 'sync_companies',
    label: 'Sync Companies',
    description: 'Sync company records',
    icon: Database,
  },
  {
    key: 'sync_projects',
    label: 'Sync Projects',
    description: 'Sync project data',
    icon: FileText,
  },
  {
    key: 'sync_invoices',
    label: 'Sync Invoices',
    description: 'Sync invoice/payment data',
    icon: CreditCard,
  },
];

export function SuiteDashSyncSettings({
  config,
  onConfigChange,
}: SuiteDashSyncSettingsProps) {
  return (
    <div className="p-6 border-b border-slate-700">
      <SectionHeader
        icon={<Database className="h-5 w-5 text-purple-400" />}
        title="Sync Settings"
        description="Configure what data to sync with SuiteDash"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {syncSettingsItems.map((item) => {
          const Icon = item.icon;
          const settingKey = item.key as keyof typeof config.sync_settings;
          const isEnabled = config.sync_settings[settingKey] as boolean;
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isEnabled
                  ? 'bg-slate-700/30 border-slate-600'
                  : 'bg-slate-900/30 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${
                    isEnabled ? 'text-blue-400' : 'text-slate-500'
                  }`}
                />
                <div>
                  <span className="font-medium text-white">{item.label}</span>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={isEnabled}
                onChange={(enabled) =>
                  onConfigChange({
                    ...config,
                    sync_settings: {
                      ...config.sync_settings,
                      [item.key]: enabled,
                    },
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
