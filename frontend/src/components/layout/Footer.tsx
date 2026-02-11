import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
import { pillarsApi } from '@/services/pillars';
import { get } from '@/services/api';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';

interface SiteSettings {
  site_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  linkedin_url: string;
  twitter_url: string;
}

interface FooterContent {
  brand_description: string;
  quick_links: Array<{ to: string; label: string }>;
  legal_links: Array<{ to: string; label: string }>;
}

const defaultLegalLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isPageVisible } = useWebsiteSettings();

  const { data: pillarsData } = useQuery({
    queryKey: ['pillars'],
    queryFn: pillarsApi.getAll,
  });

  const { data: settingsData } = useQuery({
    queryKey: ['content', 'settings'],
    queryFn: () => get<SiteSettings>('/content/settings'),
  });

  const { data: footerData } = useQuery({
    queryKey: ['content', 'footer'],
    queryFn: () => get<FooterContent>('/content/footer'),
  });

  const pillars = pillarsData?.data?.filter(p => p.is_active) || [];
  const settings = settingsData?.data;
  const footer = footerData?.data;

  // Map routes to page visibility keys
  const routeToPageKey: Record<string, 'home' | 'about' | 'contact'> = {
    '/': 'home',
    '/about': 'about',
    '/contact': 'contact',
  };

  // Build quick links dynamically, filtering out hidden pages
  const quickLinks = [
    { to: '/', label: 'Home' },
    ...pillars.map(p => ({ to: `/${p.slug}`, label: p.name })),
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ].filter(link => {
    const pageKey = routeToPageKey[link.to];
    // If it's a pillar link or page visibility check passes, show it
    if (!pageKey) return true;
    return isPageVisible(pageKey);
  });

  const legalLinks = footer?.legal_links || defaultLegalLinks;
  const brandDescription = footer?.brand_description ||
    'Expert guidance in business strategy and education support, combining academic rigour with practical expertise.';

  return (
    <footer role="contentinfo" aria-label="Site footer" className="bg-primary-900 text-white">
      <div className="container-main py-10 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-serif font-bold text-lg sm:text-xl">C</span>
              </div>
              <span className="font-serif font-semibold text-lg sm:text-xl">
                {settings?.site_name || 'Consultancy'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary-200 leading-relaxed">
              {brandDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 text-white">
              Contact Us
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings?.email || 'info@consultancy.com'}`}
                  className="text-xs sm:text-sm text-primary-200 hover:text-white transition-colors break-all"
                >
                  {settings?.email || 'info@consultancy.com'}
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`tel:${settings?.phone || '+441234567890'}`}
                  className="text-xs sm:text-sm text-primary-200 hover:text-white transition-colors"
                >
                  {settings?.phone || '+44 (0) 123 456 7890'}
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-primary-200 whitespace-pre-line">
                  {settings?.address || '123 Academic Lane\nLondon, EC1A 1BB'}
                </span>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-serif font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 text-white">
              Connect
            </h4>
            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
              {settings?.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              )}
              {!settings?.linkedin_url && !settings?.twitter_url && (
                <>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </>
              )}
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-primary-800">
        <div className="container-main py-4 sm:py-6 px-4 sm:px-6">
          <p className="text-center text-primary-300 text-xs sm:text-sm">
            &copy; {currentYear} {settings?.site_name || 'Consultancy Platform'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
