import {
  Phone,
  MessageSquare,
  Video,
  Mail,
  PhoneCall,
  Database,
  FileText,
} from 'lucide-react';
import { SectionHeader, ToggleSwitch } from '../shared';
import type { RingCentralConfig } from '../types';

interface RingCentralFeaturesProps {
  config: RingCentralConfig;
  onConfigChange: (config: RingCentralConfig) => void;
}

const featureItems = [
  {
    key: 'enable_calls',
    label: 'Voice Calls',
    description: 'Make and receive phone calls',
    icon: Phone,
  },
  {
    key: 'enable_sms',
    label: 'SMS Messaging',
    description: 'Send and receive text messages',
    icon: MessageSquare,
  },
  {
    key: 'enable_video',
    label: 'Video Meetings',
    description: 'Host video conferences',
    icon: Video,
  },
  {
    key: 'enable_voicemail',
    label: 'Voicemail',
    description: 'Access voicemail messages',
    icon: Mail,
  },
  {
    key: 'click_to_call',
    label: 'Click-to-Call',
    description: 'Call customers from dashboard',
    icon: PhoneCall,
  },
  {
    key: 'call_recording',
    label: 'Call Recording',
    description: 'Record calls for quality assurance',
    icon: Database,
  },
  {
    key: 'auto_log_calls',
    label: 'Auto-Log Calls',
    description: 'Automatically log call history',
    icon: FileText,
  },
];

export function RingCentralFeatures({
  config,
  onConfigChange,
}: RingCentralFeaturesProps) {
  return (
    <div className="p-6 border-b border-slate-700">
      <SectionHeader
        icon={<PhoneCall className="h-5 w-5 text-green-400" />}
        title="Features"
        description="Enable or disable communication features"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureItems.map((item) => {
          const Icon = item.icon;
          const featureKey = item.key as keyof typeof config.features;
          const isEnabled = config.features[featureKey];
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isEnabled ? 'bg-orange-500/20' : 'bg-slate-700'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isEnabled ? 'text-orange-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-white">{item.label}</h4>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={isEnabled}
                onChange={(enabled) =>
                  onConfigChange({
                    ...config,
                    features: {
                      ...config.features,
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
