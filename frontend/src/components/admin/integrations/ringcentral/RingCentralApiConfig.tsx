import { useState } from 'react';
import { Settings, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import { SectionHeader, darkInputClass, darkLabelClass } from '../shared';
import type { RingCentralConfig } from '../types';

interface RingCentralApiConfigProps {
  config: RingCentralConfig;
  onConfigChange: (config: RingCentralConfig) => void;
  onTestConnection: () => void;
  isTesting: boolean;
}

const countryCodes = [
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+20', label: '+20 (Egypt)' },
];

export function RingCentralApiConfig({
  config,
  onConfigChange,
  onTestConnection,
  isTesting,
}: RingCentralApiConfigProps) {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showJwtToken, setShowJwtToken] = useState(false);

  return (
    <div className="p-6 border-b border-slate-700">
      <SectionHeader
        icon={<Settings className="h-5 w-5 text-orange-400" />}
        title="API Configuration"
        description="Enter your RingCentral API credentials"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Client ID</label>
          <input
            type="text"
            value={config.client_id}
            onChange={(e) =>
              onConfigChange({ ...config, client_id: e.target.value })
            }
            className={darkInputClass}
            placeholder="Enter your RingCentral Client ID"
          />
        </div>

        <div>
          <label className={darkLabelClass}>Client Secret</label>
          <div className="relative">
            <input
              type={showClientSecret ? 'text' : 'password'}
              value={config.client_secret}
              onChange={(e) =>
                onConfigChange({ ...config, client_secret: e.target.value })
              }
              className={darkInputClass}
              placeholder="Enter your Client Secret"
            />
            <button
              type="button"
              onClick={() => setShowClientSecret(!showClientSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showClientSecret ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={darkLabelClass}>JWT Token</label>
          <div className="relative">
            <input
              type={showJwtToken ? 'text' : 'password'}
              value={config.jwt_token}
              onChange={(e) =>
                onConfigChange({ ...config, jwt_token: e.target.value })
              }
              className={darkInputClass}
              placeholder="Enter your JWT token for authentication"
            />
            <button
              type="button"
              onClick={() => setShowJwtToken(!showJwtToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showJwtToken ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate a JWT token from the RingCentral Developer Console
          </p>
        </div>

        <div>
          <label className={darkLabelClass}>Caller ID</label>
          <input
            type="text"
            value={config.caller_id}
            onChange={(e) =>
              onConfigChange({ ...config, caller_id: e.target.value })
            }
            className={darkInputClass}
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className={darkLabelClass}>Default Country Code</label>
          <select
            value={config.default_country_code}
            onChange={(e) =>
              onConfigChange({ ...config, default_country_code: e.target.value })
            }
            className={darkInputClass}
          >
            {countryCodes.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={darkLabelClass}>Webhook URL (Auto-generated)</label>
          <input
            type="text"
            value={
              config.webhook_url ||
              `${window.location.origin}/api/webhooks/ringcentral`
            }
            readOnly
            className={`${darkInputClass} bg-slate-800 cursor-not-allowed`}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onTestConnection}
          variant="secondary"
          isLoading={isTesting}
          disabled={
            !config.client_id || !config.client_secret || !config.jwt_token
          }
        >
          <Zap className="h-4 w-4 mr-2" />
          Test Connection
        </Button>
      </div>
    </div>
  );
}
