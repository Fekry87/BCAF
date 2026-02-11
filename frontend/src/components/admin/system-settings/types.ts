import { Palette, Image } from 'lucide-react';

export interface AdminThemeConfig {
  theme_mode: 'dark' | 'light' | 'system';
  accent_color: string;
  sidebar_style: 'default' | 'compact' | 'expanded';
  primary_color: string;
  secondary_color: string;
  dashboard_name: string;
  dashboard_logo: string;
  show_logo: boolean;
}

export const defaultConfig: AdminThemeConfig = {
  theme_mode: 'dark',
  accent_color: '#3b82f6',
  sidebar_style: 'default',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6',
  dashboard_name: 'Admin',
  dashboard_logo: '',
  show_logo: true,
};

export type TabType = 'theme' | 'branding';

export const tabs: { id: TabType; label: string; icon: typeof Palette }[] = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'branding', label: 'Branding', icon: Image },
];

export const accentColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
];

export const darkInputClass =
  'w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors';

export const darkLabelClass = 'block text-sm font-semibold text-slate-300 mb-2';
