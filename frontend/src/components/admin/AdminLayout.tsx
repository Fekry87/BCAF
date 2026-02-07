import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Layers,
  Settings,
  Users,
  ShoppingCart,
  Plug,
  Cog,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/pillars', icon: Layers, label: 'Pillars' },
  { to: '/admin/services', icon: FileText, label: 'Services' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/settings', icon: Settings, label: 'Web Settings' },
  { to: '/admin/system', icon: Cog, label: 'System Settings' },
  { to: '/admin/integrations', icon: Plug, label: 'Integrations' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useAdminSettings();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Determine sidebar width based on settings
  const getSidebarWidth = () => {
    switch (settings?.sidebar_style) {
      case 'compact':
        return 'w-20';
      case 'expanded':
        return 'w-72';
      default:
        return 'w-64';
    }
  };

  const getMainMargin = () => {
    switch (settings?.sidebar_style) {
      case 'compact':
        return 'lg:ml-20';
      case 'expanded':
        return 'lg:ml-72';
      default:
        return 'lg:ml-64';
    }
  };

  const isCompact = settings?.sidebar_style === 'compact';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 h-16 px-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="font-serif font-semibold text-white">{settings?.dashboard_name || 'Admin'}</span>
        <div className="w-10" />
      </header>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-40 bg-slate-800 border-r border-slate-700',
          'transition-all duration-300 lg:translate-x-0',
          getSidebarWidth(),
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b border-slate-700 flex items-center justify-center px-4">
          <div className="flex items-center gap-2">
            {(settings?.show_logo !== false) && (
              settings?.dashboard_logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-700">
                  <img
                    src={settings.dashboard_logo}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: settings?.accent_color || '#3b82f6' }}
                >
                  <span className="text-white font-serif font-bold">
                    {(settings?.dashboard_name || 'Admin').charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            )}
            {!isCompact && (
              <span className="font-serif font-semibold text-white">
                {settings?.dashboard_name || 'Admin'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={clsx('p-2 space-y-1', isCompact ? 'px-2' : 'px-4')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-lg font-medium transition-colors',
                    isCompact ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  )
                }
                style={({ isActive }) => isActive ? { backgroundColor: settings?.accent_color || '#3b82f6' } : {}}
                title={isCompact ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCompact && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'flex items-center gap-2 py-2 text-slate-400 hover:text-white text-sm',
              isCompact ? 'justify-center px-2' : 'px-4'
            )}
            title={isCompact ? 'View Website' : undefined}
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            {!isCompact && <span>View Website</span>}
          </a>

          <div className={clsx(
            'flex items-center mt-2',
            isCompact ? 'justify-center px-2 py-2' : 'justify-between px-4 py-2'
          )}>
            {!isCompact && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={clsx('min-h-screen pt-16 lg:pt-0 bg-slate-900 transition-all duration-300', getMainMargin())}>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
