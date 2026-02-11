import { AlertTriangle, ExternalLink } from 'lucide-react';
import { SuiteDashIntegration } from './integrations/SuiteDashIntegration';
import { RingCentralIntegration } from './integrations/RingCentralIntegration';

export function AdminIntegrations() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-white">Integrations</h1>
          <p className="text-slate-400 mt-1">Connect your platform with external services</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* SuiteDash Integration */}
        <SuiteDashIntegration />

        {/* RingCentral Integration */}
        <RingCentralIntegration />

        {/* Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HelpCard
            title="SuiteDash Secure API Setup"
            steps={[
              'Log in to SuiteDash as Admin',
              'Go to Integrations → Secure API',
              'Copy your Public ID',
              'Click "+ Add Secret Key" to create a key',
              'Copy the Secret Key',
            ]}
            links={[
              { label: 'API Documentation', url: 'https://app.suitedash.com/secure-api/swagger' },
              { label: 'Integration Guide', url: 'https://support.suitedash.com' },
            ]}
          />

          <HelpCard
            title="RingCentral Setup"
            steps={[
              'Create a RingCentral Developer account',
              'Create a new application (Server/Web)',
              'Enable JWT authentication',
              'Copy your Client ID and Secret',
              'Generate a JWT token',
            ]}
            links={[
              { label: 'Developer Console', url: 'https://developers.ringcentral.com' },
              { label: 'API Documentation', url: 'https://developers.ringcentral.com/api-reference' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

interface HelpCardProps {
  title: string;
  steps: string[];
  links: { label: string; url: string }[];
}

function HelpCard({ title, steps, links }: HelpCardProps) {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 mt-3">
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
