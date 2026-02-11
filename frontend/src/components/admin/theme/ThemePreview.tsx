import { forwardRef } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, X } from 'lucide-react';
import type { DeviceType } from './types';

interface ThemePreviewProps {
  deviceType: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onClose: () => void;
  onIframeLoad: () => void;
}

export const ThemePreview = forwardRef<HTMLIFrameElement, ThemePreviewProps>(
  ({ deviceType, onDeviceChange, onClose, onIframeLoad }, ref) => {
    const getDeviceWidth = () => {
      switch (deviceType) {
        case 'mobile':
          return 'w-[375px]';
        case 'tablet':
          return 'w-[768px]';
        default:
          return 'w-full';
      }
    };

    return (
      <div className="w-1/2 xl:w-3/5 flex flex-col border border-slate-700 bg-slate-950 rounded-lg overflow-hidden min-h-0">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">Preview</span>
            <div className="flex items-center bg-slate-700 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => onDeviceChange('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  deviceType === 'desktop'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeviceChange('tablet')}
                className={`p-1.5 rounded transition-colors ${
                  deviceType === 'tablet'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeviceChange('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  deviceType === 'mobile'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 min-h-0 bg-slate-900/50 flex justify-center p-2">
          <div
            className={`${getDeviceWidth()} h-full ${
              deviceType !== 'desktop'
                ? 'shadow-2xl rounded-lg overflow-hidden border border-slate-600'
                : ''
            }`}
          >
            <iframe
              ref={ref}
              src="/"
              className="w-full h-full bg-white border-0"
              title="Website Preview"
              onLoad={onIframeLoad}
            />
          </div>
        </div>

        {/* Preview Status */}
        <div className="flex items-center justify-center px-4 py-1.5 border-t border-slate-700 bg-slate-800 text-xs text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live preview
          </span>
        </div>
      </div>
    );
  }
);

ThemePreview.displayName = 'ThemePreview';
