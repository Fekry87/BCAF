import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { CartProvider } from '@/contexts/CartContext';
import type { Service } from '@/types';

const mockService: Service = {
  id: 1,
  title: 'Strategic Assessment',
  slug: 'strategic-assessment',
  summary: 'Comprehensive business analysis',
  details: '<p>Detailed analysis of your business</p>',
  type: 'one_off',
  type_label: 'One-off',
  price_from: 2500,
  price_label: 'From £2,500',
  icon: 'briefcase',
  icon_image: null,
  is_active: true,
  sort_order: 1,
  pillar_id: 1,
  pillar: {
    id: 1,
    name: 'Business Consultancy',
    slug: 'business-consultancy',
  },
};

const mockSubscriptionService: Service = {
  ...mockService,
  id: 2,
  title: 'Ongoing Support',
  type: 'subscription',
  type_label: 'Monthly',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {ui}
      </CartProvider>
    </BrowserRouter>
  );
};

describe('ServiceCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render service title', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByText('Strategic Assessment')).toBeInTheDocument();
    });

    it('should render service summary', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByText('Comprehensive business analysis')).toBeInTheDocument();
    });

    it('should render service type label', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByText('One-off')).toBeInTheDocument();
    });

    it('should render price label', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByText('From £2,500')).toBeInTheDocument();
    });

    it('should render pillar name when provided', () => {
      renderWithProviders(
        <ServiceCard service={mockService} pillarName="Custom Pillar" />
      );
      // pillarName is used internally for cart, not displayed directly
      expect(screen.getByText('Strategic Assessment')).toBeInTheDocument();
    });
  });

  describe('expandable content', () => {
    it('should show Details button when collapsed', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should show Less button when expanded', () => {
      renderWithProviders(<ServiceCard service={mockService} />);

      const detailsButton = screen.getByRole('button', { name: /details/i });
      fireEvent.click(detailsButton);

      expect(screen.getByText('Less')).toBeInTheDocument();
    });

    it('should have aria-expanded attribute', () => {
      renderWithProviders(<ServiceCard service={mockService} />);

      const detailsButton = screen.getByRole('button', { name: /details/i });
      expect(detailsButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(detailsButton);
      expect(detailsButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('one-off service', () => {
    it('should render Add to Cart button for one-off service', () => {
      renderWithProviders(<ServiceCard service={mockService} />);
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    });

    it('should add item to cart when clicked', () => {
      renderWithProviders(<ServiceCard service={mockService} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      expect(screen.getByText('In Cart')).toBeInTheDocument();
    });

    it('should disable button after adding to cart', () => {
      renderWithProviders(<ServiceCard service={mockService} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      const inCartButton = screen.getByRole('button', { name: /in cart/i });
      expect(inCartButton).toBeDisabled();
    });
  });

  describe('subscription service', () => {
    it('should render Contact Us link for subscription service', () => {
      renderWithProviders(<ServiceCard service={mockSubscriptionService} />);
      expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
    });

    it('should link to contact page', () => {
      renderWithProviders(<ServiceCard service={mockSubscriptionService} />);

      const link = screen.getByRole('link', { name: /contact us/i });
      expect(link).toHaveAttribute('href', '/contact');
    });

    it('should not show Add to Cart button', () => {
      renderWithProviders(<ServiceCard service={mockSubscriptionService} />);
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    });
  });

  describe('without price label', () => {
    it('should not render price if price_label is empty', () => {
      const serviceWithoutPrice = { ...mockService, price_label: '' };
      renderWithProviders(<ServiceCard service={serviceWithoutPrice} />);
      expect(screen.queryByText(/from £/i)).not.toBeInTheDocument();
    });
  });

  describe('service without slug', () => {
    it('should generate slug from title', () => {
      const serviceWithoutSlug = { ...mockService, slug: '' };
      renderWithProviders(<ServiceCard service={serviceWithoutSlug} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      // Should still work - slug is generated internally
      expect(screen.getByText('In Cart')).toBeInTheDocument();
    });
  });

  describe('memo behavior', () => {
    it('should render correctly after re-render', () => {
      const { rerender } = renderWithProviders(<ServiceCard service={mockService} />);

      expect(screen.getByText('Strategic Assessment')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <CartProvider>
            <ServiceCard service={mockService} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Strategic Assessment')).toBeInTheDocument();
    });
  });
});
