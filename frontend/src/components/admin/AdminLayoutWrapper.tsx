import { AdminSettingsProvider } from '@/contexts/AdminSettingsContext';
import { AdminLayout } from './AdminLayout';

export function AdminLayoutWrapper() {
  return (
    <AdminSettingsProvider>
      <AdminLayout />
    </AdminSettingsProvider>
  );
}
