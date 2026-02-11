import { ChevronDown, ChevronUp } from 'lucide-react';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description: string;
}

export function ColorInput({ value, onChange, label, description }: ColorInputProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-500 hover:border-blue-400 transition-colors overflow-hidden flex-shrink-0"
        style={{ padding: 0 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          <input
            type="text"
            value={value.toUpperCase()}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 text-xs font-mono text-slate-300 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  iconBg,
  children,
  isOpen,
  onToggle,
}: CollapsibleSectionProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 border-t border-slate-700/50">{children}</div>}
    </div>
  );
}
