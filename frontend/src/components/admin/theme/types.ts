export type SectionId = 'backgrounds' | 'texts' | 'icons' | 'buttons' | 'typography' | 'radius';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface FontOption {
  value: string;
  label: string;
  preview: string;
}

export interface RadiusOption {
  value: string;
  label: string;
}

export const fontOptions: FontOption[] = [
  { value: '"Source Serif 4", Georgia, serif', label: 'Source Serif 4', preview: 'Elegant & Modern' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia', preview: 'Classic Serif' },
  { value: '"Playfair Display", Georgia, serif', label: 'Playfair Display', preview: 'Luxurious' },
  { value: '"Merriweather", Georgia, serif', label: 'Merriweather', preview: 'Highly Readable' },
  { value: '"Lora", Georgia, serif', label: 'Lora', preview: 'Contemporary' },
];

export const bodyFontOptions: FontOption[] = [
  { value: 'Inter, -apple-system, sans-serif', label: 'Inter', preview: 'Clean & Modern' },
  { value: '"Open Sans", -apple-system, sans-serif', label: 'Open Sans', preview: 'Friendly' },
  { value: '"Roboto", -apple-system, sans-serif', label: 'Roboto', preview: 'Professional' },
  { value: '"Lato", -apple-system, sans-serif', label: 'Lato', preview: 'Warm & Stable' },
  { value: '"Poppins", -apple-system, sans-serif', label: 'Poppins', preview: 'Geometric' },
];

export const radiusOptions: RadiusOption[] = [
  { value: '0px', label: 'None' },
  { value: '4px', label: 'Small' },
  { value: '8px', label: 'Medium' },
  { value: '12px', label: 'Large' },
  { value: '16px', label: 'X-Large' },
  { value: '9999px', label: 'Full' },
];
