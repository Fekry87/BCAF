import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
import { pillarsApi } from '@/services/pillars';
import { get } from '@/services/api';

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

  // Build quick links dynamically
  const quickLinks = [
    { to: '/', label: 'Home' },
    ...pillars.map(p => ({ to: `/${p.slug}`, label: p.name })),
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const legalLinks = footer?.legal_links || defaultLegalLinks;
  const brandDescription = footer?.brand_description ||
    'Expert guidance in business strategy and education support, combining academic rigour with practical expertise.';

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-serif font-bold text-xl">C</span>
              </div>
              <span className="font-serif font-semibold text-xl">
                {settings?.site_name || 'Consultancy'}
              </span>
            </div>
            <p className="text-primary-200 leading-relaxed">
              {brandDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-white">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings?.email || 'info@consultancy.com'}`}
                  className="text-primary-200 hover:text-white transition-colors"
                >
                  {settings?.email || 'info@consultancy.com'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`tel:${settings?.phone || '+441234567890'}`}
                  className="text-primary-200 hover:text-white transition-colors"
                >
                  {settings?.phone || '+44 (0) 123 456 7890'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-primary-200 whitespace-pre-line">
                  {settings?.address || '123 Academic Lane\nLondon, EC1A 1BB'}
                </span>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-white">
              Connect
            </h4>
            <div className="flex gap-4 mb-6">
              {settings?.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {!settings?.linkedin_url && !settings?.twitter_url && (
                <>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </>
              )}
            </div>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-300 hover:text-white transition-colors"
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
        <div className="container-main py-6">
          <p className="text-center text-primary-300 text-sm">
            &copy; {currentYear} {settings?.site_name || 'Consultancy Platform'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
