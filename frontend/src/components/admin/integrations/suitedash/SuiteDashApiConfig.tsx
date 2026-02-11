import { useState } from 'react';
import { Settings, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { SectionHeader, darkInputClass, darkLabelClass } from '../shared';
import type { SuiteDashConfig } from '../types';

interface SuiteDashApiConfigProps {
  config: SuiteDashConfig;
  onConfigChange: (config: SuiteDashConfig) => void;
  onTestConnection: () => void;
  isTesting: boolean;
}

export function SuiteDashApiConfig({
  config,
  onConfigChange,
  onTestConnection,
  isTesting,
}: SuiteDashApiConfigProps) {
  const [showPublicId, setShowPublicId] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  return (
    <div className="p-6 border-b border-slate-700">
      <SectionHeader
        icon={<Settings className="h-5 w-5 text-blue-400" />}
        title="API Configuration"
        description="Enter your SuiteDash Secure API credentials"
      />

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
        <p className="text-sm text-blue-300">
          <strong>How to get credentials:</strong> Log in to SuiteDash → Integrations → Secure
          API → Copy your Public ID and create a Secret Key
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Public ID (X-Public-ID)</label>
          <div className="relative">
            <input
              type={showPublicId ? 'text' : 'password'}
              value={config.public_id}
              onChange={(e) =>
                onConfigChange({ ...config, public_id: e.target.value })
              }
              className={darkInputClass}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
            <button
              type="button"
              onClick={() => setShowPublicId(!showPublicId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPublicId ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Found in Integrations → Secure API
          </p>
        </div>

        <div>
          <label className={darkLabelClass}>Secret Key (X-Secret-Key)</label>
          <div className="relative">
            <input
              type={showSecretKey ? 'text' : 'password'}
              value={config.secret_key}
              onChange={(e) =>
                onConfigChange({ ...config, secret_key: e.target.value })
              }
              className={darkInputClass}
              placeholder="Enter your Secret Key"
            />
            <button
              type="button"
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showSecretKey ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Click "+ Add Secret Key" in SuiteDash to generate
          </p>
        </div>

        <div>
          <label className={darkLabelClass}>API Base URL</label>
          <input
            type="text"
            value={config.api_base_url}
            onChange={(e) =>
              onConfigChange({ ...config, api_base_url: e.target.value })
            }
            className={darkInputClass}
            placeholder="https://app.suitedash.com/secure-api"
          />
          <p className="text-xs text-slate-500 mt-1">
            Default: https://app.suitedash.com/secure-api
          </p>
        </div>

        <div>
          <label className={darkLabelClass}>Webhook URL (Auto-generated)</label>
          <input
            type="text"
            value={
              config.webhook_url || `${window.location.origin}/api/webhooks/suitedash`
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
          disabled={!config.public_id || !config.secret_key}
        >
          <Zap className="h-4 w-4 mr-2" />
          Test Connection
        </Button>
        <a
          href="https://app.suitedash.com/secure-api/swagger"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          View API Docs
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Connection Status Message */}
      {config.connection_status === 'connected' && config.invoice_api_available === false && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            <strong>Invoice API Not Available:</strong> Your SuiteDash plan does not include the Invoice API.
            Contacts will be synced automatically, but invoices must be created manually in SuiteDash.
          </p>
        </div>
      )}

      {/* Rate Limit Error */}
      {config.connection_status === 'error' && config.connection_message?.includes('rate limit') && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">
            <strong>API Rate Limit Exceeded:</strong> {config.connection_message}
          </p>
          <p className="text-xs text-red-300 mt-2">
            Your SuiteDash plan has a limited number of API requests per month. Please upgrade your plan or wait until the next billing cycle.
          </p>
        </div>
      )}

      {/* General Connection Error */}
      {config.connection_status === 'error' && !config.connection_message?.includes('rate limit') && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">
            <strong>Connection Error:</strong> {config.connection_message || 'Unable to connect to SuiteDash API'}
          </p>
        </div>
      )}
    </div>
  );
}
