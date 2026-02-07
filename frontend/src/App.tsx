import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { AuthModal } from '@/components/layout/AuthModal';
import { Layout } from '@/components/layout';
import {
  HomePage,
  PillarPage,
  AboutPage,
  ContactPage,
  StyleGuidePage,
} from '@/components/pages';
import Checkout from '@/pages/Checkout';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminPillars } from '@/components/admin/AdminPillars';
import { AdminServices } from '@/components/admin/AdminServices';
import { AdminContacts } from '@/components/admin/AdminContacts';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminWebSettings } from '@/components/admin/AdminWebSettings';
import { AdminIntegrations } from '@/components/admin/AdminIntegrations';
import { AdminSystemSettings } from '@/components/admin/AdminSystemSettings';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WebsiteSettingsProvider>
          <AuthProvider>
            <UserAuthProvider>
              <CartProvider>
                <BrowserRouter>
                  <Routes>
            {/* Public Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/business-consultancy" element={<PillarPage />} />
              <Route path="/education-support" element={<PillarPage />} />
              <Route path="/:pillarSlug" element={<PillarPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/styleguide" element={<StyleGuidePage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="pillars" element={<AdminPillars />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="messages" element={<AdminContacts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminWebSettings />} />
              <Route path="system" element={<AdminSystemSettings />} />
              <Route path="integrations" element={<AdminIntegrations />} />
            </Route>
                  </Routes>
                  <AuthModal />
                </BrowserRouter>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    className: 'font-sans',
                    duration: 4000,
                    style: {
                      background: '#1a1a1a',
                      color: '#fff',
                      borderRadius: '8px',
                    },
                  }}
                />
              </CartProvider>
            </UserAuthProvider>
          </AuthProvider>
        </WebsiteSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
