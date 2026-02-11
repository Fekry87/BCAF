import { Check, PaintBucket, FileText, Circle, MousePointer, Type, Square } from 'lucide-react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ThemeConfig } from '@/contexts/ThemeContext';
import { CollapsibleSection, ColorInput } from './shared';
import { fontOptions, bodyFontOptions, radiusOptions } from './types';

interface SectionProps {
  isOpen: boolean;
  onToggle: () => void;
  watch: UseFormWatch<ThemeConfig>;
  setValue: UseFormSetValue<ThemeConfig>;
  register: UseFormRegister<ThemeConfig>;
}

export function BackgroundsSection({ isOpen, onToggle, watch, setValue }: Omit<SectionProps, 'register'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Backgrounds"
      subtitle="Page, cards, sections, headers"
      icon={<PaintBucket className="h-4 w-4 text-blue-400" />}
      iconBg="bg-blue-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Visual Preview */}
      <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-slate-600/50">
        <div className="p-3 text-xs text-slate-400 bg-slate-700/30 border-b border-slate-600/50">
          Preview
        </div>
        <div className="p-4" style={{ backgroundColor: values.primary_900 }}>
          <div className="text-xs text-white/70 mb-2">Header / Dark Section</div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: values.primary_50 }}>
            <div className="text-xs mb-2" style={{ color: values.primary_700 }}>
              Page Background
            </div>
            <div
              className="p-3 rounded-lg shadow-sm"
              style={{ backgroundColor: values.primary_100 }}
            >
              <div className="text-xs" style={{ color: values.primary_700 }}>
                Card
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <ColorInput
          label="Page Background"
          description="Main page background"
          value={values.primary_50}
          onChange={(v) => setValue('primary_50', v)}
        />
        <ColorInput
          label="Card Background"
          description="Cards, panels, modals"
          value={values.primary_100}
          onChange={(v) => setValue('primary_100', v)}
        />
        <ColorInput
          label="Border Color"
          description="Dividers, outlines"
          value={values.primary_500}
          onChange={(v) => setValue('primary_500', v)}
        />
        <ColorInput
          label="Primary Fill"
          description="Headers, navigation, footers"
          value={values.primary_700}
          onChange={(v) => setValue('primary_700', v)}
        />
        <ColorInput
          label="Dark Fill"
          description="Hero sections, dark areas"
          value={values.primary_900}
          onChange={(v) => setValue('primary_900', v)}
        />
      </div>
    </CollapsibleSection>
  );
}

export function TextsSection({ isOpen, onToggle, watch, setValue }: Omit<SectionProps, 'register'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Texts"
      subtitle="Headings, body, captions"
      icon={<FileText className="h-4 w-4 text-green-400" />}
      iconBg="bg-green-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Text Preview */}
      <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-slate-600/50">
        <div className="p-3 text-xs text-slate-400 bg-slate-700/30 border-b border-slate-600/50">
          Preview
        </div>
        <div className="p-4" style={{ backgroundColor: values.primary_50 }}>
          <h1
            className="text-lg font-bold mb-1"
            style={{ color: values.text_heading, fontFamily: values.font_heading }}
          >
            Heading Text
          </h1>
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: values.text_subheading, fontFamily: values.font_heading }}
          >
            Subheading Text
          </h2>
          <p
            className="text-sm mb-2"
            style={{ color: values.text_body, fontFamily: values.font_body }}
          >
            Body text for paragraphs and content.
          </p>
          <p className="text-xs" style={{ color: values.text_muted }}>
            Muted text for captions and hints
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <ColorInput
          label="Heading Text"
          description="Main titles, H1"
          value={values.text_heading}
          onChange={(v) => setValue('text_heading', v)}
        />
        <ColorInput
          label="Subheading Text"
          description="Section titles, H2-H3"
          value={values.text_subheading}
          onChange={(v) => setValue('text_subheading', v)}
        />
        <ColorInput
          label="Body Text"
          description="Paragraphs, content"
          value={values.text_body}
          onChange={(v) => setValue('text_body', v)}
        />
        <ColorInput
          label="Link Hover"
          description="Interactive text hover"
          value={values.text_link_hover}
          onChange={(v) => setValue('text_link_hover', v)}
        />
        <ColorInput
          label="Muted Text"
          description="Captions, placeholders"
          value={values.text_muted}
          onChange={(v) => setValue('text_muted', v)}
        />
      </div>
    </CollapsibleSection>
  );
}

export function IconsSection({ isOpen, onToggle, watch, setValue }: Omit<SectionProps, 'register'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Icons"
      subtitle="Icon colors and backgrounds"
      icon={<Circle className="h-4 w-4 text-yellow-400" />}
      iconBg="bg-yellow-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Icon Preview */}
      <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-slate-600/50">
        <div className="p-3 text-xs text-slate-400 bg-slate-700/30 border-b border-slate-600/50">
          Preview
        </div>
        <div
          className="p-4 flex items-center gap-4"
          style={{ backgroundColor: values.primary_50 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: values.accent_yellow_light }}
          >
            <Circle
              className="h-6 w-6"
              style={{ color: values.accent_yellow }}
              fill={values.accent_yellow}
            />
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
            style={{ borderColor: values.accent_yellow }}
          >
            <Circle className="h-6 w-6" style={{ color: values.accent_yellow }} />
          </div>
          <Circle className="h-8 w-8" style={{ color: values.accent_yellow }} />
        </div>
      </div>

      <div className="space-y-2">
        <ColorInput
          label="Icon Background"
          description="Circle/box behind icons"
          value={values.accent_yellow_light}
          onChange={(v) => setValue('accent_yellow_light', v)}
        />
        <ColorInput
          label="Icon Color"
          description="Icon fill and stroke"
          value={values.accent_yellow}
          onChange={(v) => setValue('accent_yellow', v)}
        />
      </div>
    </CollapsibleSection>
  );
}

export function ButtonsSection({ isOpen, onToggle, watch, setValue }: Omit<SectionProps, 'register'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Buttons"
      subtitle="CTA and action buttons"
      icon={<MousePointer className="h-4 w-4 text-purple-400" />}
      iconBg="bg-purple-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Button Preview */}
      <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-slate-600/50">
        <div className="p-3 text-xs text-slate-400 bg-slate-700/30 border-b border-slate-600/50">
          Preview
        </div>
        <div
          className="p-4 flex flex-wrap gap-3"
          style={{ backgroundColor: values.primary_50 }}
        >
          <button
            type="button"
            className="px-4 py-2 font-medium transition-all"
            style={{
              backgroundColor: values.cta_primary_bg,
              color: values.cta_primary_text,
              borderRadius: values.border_radius,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = values.cta_primary_hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = values.cta_primary_bg)
            }
          >
            Primary Button
          </button>
          <button
            type="button"
            className="px-4 py-2 font-medium border-2"
            style={{
              color: values.primary_700,
              borderColor: values.primary_700,
              borderRadius: values.border_radius,
            }}
          >
            Secondary
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <ColorInput
          label="Button Fill"
          description="Primary button background"
          value={values.cta_primary_bg}
          onChange={(v) => setValue('cta_primary_bg', v)}
        />
        <ColorInput
          label="Button Text"
          description="Text on primary buttons"
          value={values.cta_primary_text}
          onChange={(v) => setValue('cta_primary_text', v)}
        />
        <ColorInput
          label="Button Hover"
          description="Hover state background"
          value={values.cta_primary_hover}
          onChange={(v) => setValue('cta_primary_hover', v)}
        />
      </div>
    </CollapsibleSection>
  );
}

export function TypographySection({ isOpen, onToggle, watch, register }: Omit<SectionProps, 'setValue'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Typography"
      subtitle="Font families"
      icon={<Type className="h-4 w-4 text-pink-400" />}
      iconBg="bg-pink-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heading Font */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Heading Font</label>
          <div className="space-y-1.5">
            {fontOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                  values.font_heading === option.value
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  {...register('font_heading')}
                  value={option.value}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    values.font_heading === option.value
                      ? 'border-blue-400 bg-blue-400'
                      : 'border-slate-500'
                  }`}
                >
                  {values.font_heading === option.value && (
                    <Check className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-white" style={{ fontFamily: option.value }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Body Font */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Body Font</label>
          <div className="space-y-1.5">
            {bodyFontOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                  values.font_body === option.value
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  {...register('font_body')}
                  value={option.value}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    values.font_body === option.value
                      ? 'border-blue-400 bg-blue-400'
                      : 'border-slate-500'
                  }`}
                >
                  {values.font_body === option.value && (
                    <Check className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-white" style={{ fontFamily: option.value }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export function RadiusSection({ isOpen, onToggle, watch, register }: Omit<SectionProps, 'setValue'>) {
  const values = watch();

  return (
    <CollapsibleSection
      title="Corner Radius"
      subtitle="Roundness of elements"
      icon={<Square className="h-4 w-4 text-cyan-400" />}
      iconBg="bg-cyan-500/20"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {radiusOptions.map((option) => (
          <label
            key={option.value}
            className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all border ${
              values.border_radius === option.value
                ? 'bg-blue-500/20 border-blue-500/50'
                : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
            }`}
          >
            <input
              type="radio"
              {...register('border_radius')}
              value={option.value}
              className="sr-only"
            />
            <div
              className="w-8 h-8 bg-slate-500 mb-1.5"
              style={{ borderRadius: option.value }}
            />
            <span className="text-xs font-medium text-white">{option.label}</span>
          </label>
        ))}
      </div>
    </CollapsibleSection>
  );
}
