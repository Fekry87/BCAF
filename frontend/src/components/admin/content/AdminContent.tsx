import { useState } from 'react';
import { tabs } from './shared';
import { SiteSettingsForm } from './SiteSettingsForm';
import { HeaderContentForm } from './HeaderContentForm';
import { FooterContentForm } from './FooterContentForm';
import { HomePageForm } from './HomePageForm';
import { AboutPageForm } from './AboutPageForm';
import { ContactPageForm } from './ContactPageForm';
import type { ContentTab } from './types';

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentTab>('settings');

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SiteSettingsForm />;
      case 'header':
        return <HeaderContentForm />;
      case 'footer':
        return <FooterContentForm />;
      case 'home':
        return <HomePageForm />;
      case 'about':
        return <AboutPageForm />;
      case 'contact':
        return <ContactPageForm />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 text-white">Content Management</h1>
        <p className="text-slate-400 mt-1">
          Customize your website content, header, footer, and page settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
        <div className="border-b border-slate-700">
          <nav className="flex flex-wrap -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
