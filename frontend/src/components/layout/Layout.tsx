import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';
import { MaintenancePage } from '@/components/pages/MaintenancePage';
import { NotFoundPage } from '@/components/pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

// Map routes to page visibility keys
const routeToPageKey: Record<string, 'home' | 'about' | 'contact' | 'checkout'> = {
  '/': 'home',
  '/about': 'about',
  '/contact': 'contact',
  '/checkout': 'checkout',
};

export function Layout() {
  const location = useLocation();
  const { isMaintenanceMode, isPageVisible, isLoading } = useWebsiteSettings();

  // Show loading state briefly while fetching settings
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 pt-16 lg:pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }

  // Check if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  // Check page visibility for specific routes
  const pageKey = routeToPageKey[location.pathname];
  if (pageKey && !isPageVisible(pageKey)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 pt-16 lg:pt-20">
          <NotFoundPage />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
