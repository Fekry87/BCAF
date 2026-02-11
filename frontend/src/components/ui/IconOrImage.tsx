import { memo } from 'react';
import {
  Briefcase,
  GraduationCap,
  Target,
  Users,
  Globe,
  FileText,
  Cog,
  ClipboardCheck,
  PenTool,
  Building,
  Award,
  Lightbulb,
  BarChart3,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'academic-cap': GraduationCap,
  'graduation-cap': GraduationCap,
  'chart-bar': Target,
  'target': Target,
  'users': Users,
  'user-group': Users,
  'globe': Globe,
  'document-text': FileText,
  'file-text': FileText,
  'cog': Cog,
  'settings': Cog,
  'clipboard-check': ClipboardCheck,
  'clipboard': ClipboardCheck,
  'pencil': PenTool,
  'pen-tool': PenTool,
  'building-library': Building,
  'building': Building,
  'presentation-chart-line': Target,
  'award': Award,
  'lightbulb': Lightbulb,
  'bar-chart': BarChart3,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'message-square': MessageSquare,
  'phone': Phone,
  'mail': Mail,
  'map-pin': MapPin,
  'calendar': Calendar,
  'clock': Clock,
  'star': Star,
  'heart': Heart,
  'shield': Shield,
  'zap': Zap,
  // CamelCase versions for API compatibility
  'Target': Target,
  'Users': Users,
  'Lightbulb': Lightbulb,
  'Award': Award,
  'Briefcase': Briefcase,
  'GraduationCap': GraduationCap,
};

interface IconOrImageProps {
  /** Either a lucide icon name OR an image URL */
  icon?: string | null;
  /** Alternative image URL - takes priority over icon if provided */
  imageUrl?: string | null;
  /** Size of the icon/image container */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className for styling */
  className?: string;
  /** Alt text for image */
  alt?: string;
  /** Whether to show a background container */
  withBackground?: boolean;
  /** Background color class */
  bgColor?: string;
  /** Icon color class */
  iconColor?: string;
}

const sizeClasses = {
  sm: { container: 'w-8 h-8', icon: 'h-4 w-4', image: 'w-8 h-8' },
  md: { container: 'w-12 h-12', icon: 'h-6 w-6', image: 'w-12 h-12' },
  lg: { container: 'w-16 h-16', icon: 'h-8 w-8', image: 'w-16 h-16' },
  xl: { container: 'w-20 h-20', icon: 'h-10 w-10', image: 'w-20 h-20' },
};

export const IconOrImage = memo(function IconOrImage({
  icon,
  imageUrl,
  size = 'md',
  className = '',
  alt = 'Icon',
  withBackground = true,
  bgColor = 'bg-primary-50',
  iconColor = 'text-primary-700',
}: IconOrImageProps) {
  const sizes = sizeClasses[size];

  // If an image URL is provided, render the image
  if (imageUrl) {
    if (withBackground) {
      return (
        <div className={`${sizes.container} ${bgColor} rounded-lg flex items-center justify-center overflow-hidden ${className}`}>
          <img
            src={imageUrl}
            alt={alt}
            className={`${sizes.image} object-cover`}
          />
        </div>
      );
    }
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`${sizes.image} object-cover rounded-lg ${className}`}
      />
    );
  }

  // Otherwise, try to render an icon
  const IconComponent = icon ? iconMap[icon] || iconMap[icon.toLowerCase()] || Briefcase : Briefcase;

  if (withBackground) {
    return (
      <div className={`${sizes.container} ${bgColor} rounded-lg flex items-center justify-center ${className}`}>
        <IconComponent className={`${sizes.icon} ${iconColor}`} />
      </div>
    );
  }

  return <IconComponent className={`${sizes.icon} ${iconColor} ${className}`} />;
});

// Export the icon map for use elsewhere
export { iconMap };
