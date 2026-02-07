import { Settings } from 'lucide-react';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';

export function MaintenancePage() {
  const { maintenanceMessage } = useWebsiteSettings();

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 bg-accent-yellow rounded-full flex items-center justify-center mx-auto mb-8">
          <Settings className="h-10 w-10 text-primary-900 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          Under Maintenance
        </h1>

        <p className="text-lg text-primary-100 mb-8">
          {maintenanceMessage}
        </p>

        <div className="h-1 w-24 bg-accent-yellow mx-auto rounded-full" />
      </div>
    </div>
  );
}
