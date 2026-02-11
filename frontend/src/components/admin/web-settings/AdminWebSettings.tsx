import { useState } from 'react';
import { type SettingsTab, tabs } from './types';
import { WebsiteSettingsTab } from './WebsiteSettingsTab';
import { AdminTheme } from '../AdminTheme';
import { AdminContent } from '../AdminContent';
import { AdminFaqs } from '../AdminFaqs';

export function AdminWebSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('website');

  const renderContent = () => {
    switch (activeTab) {
      case 'website':
        return <WebsiteSettingsTab />;
      case 'content':
        // Render AdminContent without wrapping - it has its own structure
        return <AdminContent />;
      case 'theme':
        // Render AdminTheme without wrapping - it has its own structure
        return <AdminTheme />;
      case 'faqs':
        // Render AdminFaqs without wrapping - it has its own structure
        return <AdminFaqs />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header - Always visible */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-h2 text-white">Web Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your website settings, content, theme, and FAQs
        </p>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-slate-700 mb-4 flex-shrink-0">
        <nav className="flex flex-wrap -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
