import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { pillarsApi } from '@/services/pillars';
import { get } from '@/services/api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';
import { CartButton, CartDrawer } from './Cart';

interface HeaderContent {
  logo_text: string;
  logo_image: string | null;
  nav_links: Array<{ to: string; label: string }>;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, openSignIn, openSignUp } = useUserAuth();
  const { isPageVisible } = useWebsiteSettings();

  const { data: pillarsData } = useQuery({
    queryKey: ['pillars'],
    queryFn: pillarsApi.getAll,
  });

  const { data: headerData } = useQuery({
    queryKey: ['content', 'header'],
    queryFn: () => get<HeaderContent>('/content/header'),
  });

  const pillars = pillarsData?.data?.filter(p => p.is_active) || [];
  const headerContent = headerData?.data;
  const logoText = headerContent?.logo_text || 'Consultancy';
  const logoImage = headerContent?.logo_image || null;

  // Map routes to page visibility keys
  const routeToPageKey: Record<string, 'home' | 'about' | 'contact'> = {
    '/': 'home',
    '/about': 'about',
    '/contact': 'contact',
  };

  // Build navigation links dynamically from pillars, filtering out hidden pages
  const navLinks = [
    { to: '/', label: 'Home' },
    ...pillars.map(p => ({ to: `/${p.slug}`, label: p.name })),
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ].filter(link => {
    const pageKey = routeToPageKey[link.to];
    // If it's a pillar link or page visibility check passes, show it
    if (!pageKey) return true;
    return isPageVisible(pageKey);
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Skip to content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        role="banner"
        className={clsx(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white shadow-md py-3'
            : 'bg-white/95 backdrop-blur-sm py-4'
        )}
      >
        <div className="container-main">
          <nav aria-label="Main navigation" className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt={logoText}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-xl">C</span>
                </div>
              )}
              <span className="font-serif font-semibold text-xl text-primary-900 hidden sm:block">
                {logoText}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      'text-neutral-700 font-medium transition-colors hover:text-primary-700',
                      isActive && 'text-primary-700'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Auth, Cart & Mobile Menu Button */}
            <div className="flex items-center gap-2">
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-700" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700">
                        {user?.firstName}
                      </span>
                      <ChevronDown className={clsx(
                        'h-4 w-4 text-neutral-500 transition-transform',
                        isUserMenuOpen && 'rotate-180'
                      )} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                          <div className="px-4 py-2 border-b border-neutral-100">
                            <p className="text-sm font-medium text-primary-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              signOut();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={openSignIn}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-700 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={openSignUp}
                      className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              <CartButton />

              <button
                type="button"
                className="lg:hidden p-2 text-neutral-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div
          className={clsx(
            'lg:hidden absolute top-full left-0 right-0 bg-white border-t border-neutral-200 shadow-lg',
            'transition-all duration-300 ease-in-out',
            isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          )}
        >
          <div className="container-main py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-3 rounded-lg text-neutral-700 font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-neutral-50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Mobile Auth Buttons */}
              <div className="border-t border-neutral-200 mt-2 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-primary-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-neutral-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        openSignIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openSignUp();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-800 text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
