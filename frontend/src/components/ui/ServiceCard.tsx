import { useState } from 'react';
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

export function ServiceCard({ service, pillarName, pillarSlug }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem, isInCart } = useCart();

  const inCart = isInCart(service.id);

  const handleAddToCart = () => {
    addItem({
      id: service.id,
      title: service.title,
      slug: service.slug || service.title.toLowerCase().replace(/\s+/g, '-'),
      price_from: service.price_from || 0,
      price_label: service.price_label || 'Quote on request',
      pillar_name: pillarName || service.pillar?.name || 'Service',
      pillar_slug: pillarSlug || service.pillar?.slug || 'services',
    });
  };

  return (
    <div className={clsx(
      'card group',
      isExpanded && 'ring-2 ring-primary-400'
    )}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <IconOrImage
          icon={service.icon}
          imageUrl={service.icon_image}
          size="md"
          alt={service.title}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-h4 text-primary-900 truncate">{service.title}</h3>
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              service.type === 'one_off'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            )}>
              {service.type_label}
            </span>
          </div>
          <p className="text-neutral-600 line-clamp-2">{service.summary}</p>
          {service.price_label && (
            <p className="text-sm font-medium text-primary-700 mt-2">
              {service.price_label}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between">
        {/* Expand/Collapse Button - Left side */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-primary-700 font-medium hover:text-primary-800 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          <ChevronDown className={clsx(
            'h-4 w-4 transition-transform duration-300',
            isExpanded && 'rotate-180'
          )} />
        </button>

        {/* Add to Cart / Contact Us - Right side */}
        {service.type === 'one_off' ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={inCart}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              inCart
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-accent-yellow text-primary-900 hover:bg-yellow-400'
            )}
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>
        ) : (
          <Link
            to="/contact"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary-700 text-white hover:bg-primary-800 transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Us
          </Link>
        )}
      </div>

      {/* Expandable Content */}
      <div className={clsx(
        'overflow-hidden transition-all duration-300 ease-accordion',
        isExpanded ? 'max-h-[500px] mt-4 pt-4 border-t border-neutral-200' : 'max-h-0'
      )}>
        {service.details && (
          <div
            className="prose prose-sm max-w-none text-neutral-700"
            dangerouslySetInnerHTML={{ __html: service.details }}
          />
        )}
      </div>
    </div>
  );
}
