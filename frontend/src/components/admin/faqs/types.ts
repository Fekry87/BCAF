import type { Faq, Pillar } from '@/types';

export interface FaqFormData {
  question: string;
  answer: string;
  pillarId: number | null;
  category: string;
  isActive: boolean;
}

export const darkInputClass =
  "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export const darkLabelClass =
  "block text-sm font-semibold text-slate-300 mb-2";

export const darkTextareaClass =
  "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y";

export const darkSelectClass =
  "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

// Re-export for convenience
export type { Faq, Pillar };
