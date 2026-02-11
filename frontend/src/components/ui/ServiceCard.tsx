import { useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  ChevronDown,
  ShoppingCart,
  MessageSquare,
  Check,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { IconOrImage } from './IconOrImage';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  pillarName?: string;
  pillarSlug?: string;
}

export const ServiceCard = memo(function ServiceCard({ service, pillarName, pillarSlug }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem, isInCart } = useCart();

  const inCart = isInCart(service.id);

  const handleAddToCart = useCallback(() => {
    addItem({
      id: service.id,
      title: service.title,
      slug: service.slug || service.title.toLowerCase().replace(/\s+/g, '-'),
      price_from: service.price_from || 0,
      price_label: service.price_label || 'Quote on request',
      pillar_name: pillarName || service.pillar?.name || 'Service',
      pillar_slug: pillarSlug || service.pillar?.slug || 'services',
    });
  }, [service, pillarName, pillarSlug, addItem]);

  return (
    <div className={clsx(
      'card group flex flex-col h-full',
      isExpanded && 'ring-2 ring-primary-400'
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <IconOrImage
          icon={service.icon}
          imageUrl={service.icon_image}
          size="md"
          alt={service.title}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <h3 className="text-sm sm:text-base md:text-lg font-serif font-semibold text-primary-900 line-clamp-1">
              {service.title}
            </h3>
            <span className={clsx(
              'text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap',
              service.type === 'one_off'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            )}>
              {service.type_label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2">{service.summary}</p>
          {service.price_label && (
            <p className="text-xs sm:text-sm font-medium text-primary-700 mt-1.5 sm:mt-2">
              {service.price_label}
            </p>
          )}
        </div>
      </div>

      {/* Details Toggle */}
      <div className="mt-3 sm:mt-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary-700 font-medium hover:text-primary-800 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          <ChevronDown className={clsx(
            'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300',
            isExpanded && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Expandable Content */}
      <div className={clsx(
        'overflow-hidden transition-all duration-300 ease-accordion',
        isExpanded ? 'max-h-[500px] mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200' : 'max-h-0'
      )}>
        {service.details && (
          <div
            className="prose prose-sm max-w-none text-neutral-700 text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: service.details }}
          />
        )}
      </div>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-1" />

      {/* CTA Button - Full Width at Bottom */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200">
        {service.type === 'one_off' ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={inCart}
            className={clsx(
              'w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all',
              inCart
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-accent-yellow text-primary-900 hover:bg-yellow-400'
            )}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add to Cart
              </>
            )}
          </button>
        ) : (
          <Link
            to="/contact"
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium bg-primary-700 text-white hover:bg-primary-800 transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Contact Us
          </Link>
        )}
      </div>
    </div>
  );
});
