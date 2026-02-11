import { Settings, Palette, FileText, HelpCircle, Globe } from 'lucide-react';

export type SettingsTab = 'website' | 'content' | 'theme' | 'faqs';

export interface PageVisibility {
  home: boolean;
  about: boolean;
  contact: boolean;
  checkout: boolean;
}

export interface WebsiteSettings {
  page_visibility: PageVisibility;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
];

export const darkLabelClass =
  "block text-sm font-semibold text-slate-300 mb-2";

export const darkTextareaClass =
  "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y";

export const pageInfo = [
  { key: 'home', label: 'Home Page', path: '/', description: 'Main landing page of the website' },
  { key: 'about', label: 'About Page', path: '/about', description: 'Information about your company' },
  { key: 'contact', label: 'Contact Page', path: '/contact', description: 'Contact form and information' },
  { key: 'checkout', label: 'Checkout Page', path: '/checkout', description: 'Shopping cart and checkout process' },
];

export const defaultWebsiteSettings: WebsiteSettings = {
  page_visibility: {
    home: true,
    about: true,
    contact: true,
    checkout: true,
  },
  maintenance_mode: false,
  maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
};
