import { Loader2 } from 'lucide-react';
import type { ContentTab } from './types';
import { Home, FileText, Mail, Settings, Layout, Menu } from 'lucide-react';

// Dark mode input styles for admin forms
export const darkInputClass =
  'w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

export const darkLabelClass = 'block text-sm font-semibold text-slate-300 mb-2';

export const darkTextareaClass =
  'w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y';

export const tabs: { id: ContentTab; label: string; icon: typeof Home }[] = [
  { id: 'settings', label: 'Site Settings', icon: Settings },
  { id: 'header', label: 'Header', icon: Menu },
  { id: 'footer', label: 'Footer', icon: Layout },
  { id: 'home', label: 'Home Page', icon: Home },
  { id: 'about', label: 'About Page', icon: FileText },
  { id: 'contact', label: 'Contact Page', icon: Mail },
];

export function FormLoading() {
  return (
    <div className="p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
    </div>
  );
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className = '' }: FormSectionProps) {
  return (
    <div className={`border-t border-slate-700 pt-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

interface FormCardProps {
  title?: string;
  children: React.ReactNode;
}

export function FormCard({ title, children }: FormCardProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      {title && <h4 className="font-medium text-white mb-3">{title}</h4>}
      {children}
    </div>
  );
}
