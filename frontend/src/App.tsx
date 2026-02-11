import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AuthModal } from '@/components/layout/AuthModal';
import { Layout } from '@/components/layout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load public pages
const HomePage = lazy(() => import('@/components/pages/Home').then(m => ({ default: m.HomePage })));
const PillarPage = lazy(() => import('@/components/pages/PillarPage').then(m => ({ default: m.PillarPage })));
const AboutPage = lazy(() => import('@/components/pages/About').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/components/pages/Contact').then(m => ({ default: m.ContactPage })));
const StyleGuidePage = lazy(() => import('@/components/pages/StyleGuide').then(m => ({ default: m.StyleGuidePage })));
const Checkout = lazy(() => import('@/pages/Checkout'));

// Lazy load admin pages (heavy components)
const AdminLogin = lazy(() => import('@/components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayoutWrapper = lazy(() => import('@/components/admin/AdminLayoutWrapper').then(m => ({ default: m.AdminLayoutWrapper })));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminPillars = lazy(() => import('@/components/admin/AdminPillars').then(m => ({ default: m.AdminPillars })));
const AdminServices = lazy(() => import('@/components/admin/AdminServices').then(m => ({ default: m.AdminServices })));
const AdminContacts = lazy(() => import('@/components/admin/AdminContacts').then(m => ({ default: m.AdminContacts })));
const AdminUsers = lazy(() => import('@/components/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminOrders = lazy(() => import('@/components/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminWebSettings = lazy(() => import('@/components/admin/AdminWebSettings').then(m => ({ default: m.AdminWebSettings })));
const AdminIntegrations = lazy(() => import('@/components/admin/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminSystemSettings = lazy(() => import('@/components/admin/AdminSystemSettings').then(m => ({ default: m.AdminSystemSettings })));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time - data considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
        <WebsiteSettingsProvider>
          <AuthProvider>
            <UserAuthProvider>
              <CartProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
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
    </ErrorBoundary>
  );
}

export default App;
