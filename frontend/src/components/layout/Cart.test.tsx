import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartButton, CartDrawer } from './Cart';
import { CartProvider, useCart } from '@/contexts/CartContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {ui}
      </CartProvider>
    </BrowserRouter>
  );
};

// Helper component to add items to cart for testing
function CartTestHelper({ children }: { children: React.ReactNode }) {
  const { addItem, openCart } = useCart();

  const addTestItem = () => {
    addItem({
      id: 1,
      title: 'Test Service',
      slug: 'test-service',
      price_from: 1000,
      price_label: '£1,000',
      pillar_name: 'Test Pillar',
      pillar_slug: 'test-pillar',
    });
  };

  return (
    <>
      <button onClick={addTestItem} data-testid="add-item">Add Item</button>
      <button onClick={openCart} data-testid="open-cart">Open Cart</button>
      {children}
    </>
  );
}

describe('CartButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render cart button', () => {
    renderWithProviders(<CartButton />);
    expect(screen.getByRole('button', { name: /open cart/i })).toBeInTheDocument();
  });

  it('should not show badge when cart is empty', () => {
    renderWithProviders(<CartButton />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show badge with item count', () => {
    renderWithProviders(
      <CartTestHelper>
        <CartButton />
      </CartTestHelper>
    );

    // Add item to cart
    fireEvent.click(screen.getByTestId('add-item'));

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should toggle cart when clicked', () => {
    renderWithProviders(
      <>
        <CartButton />
        <CartDrawer />
      </>
    );

    const button = screen.getByRole('button', { name: /open cart/i });
    fireEvent.click(button);

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
  });
});

describe('CartDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('empty cart', () => {
    it('should show empty cart message', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should show Browse Services button when empty', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByRole('button', { name: /browse services/i })).toBeInTheDocument();
    });
  });

  describe('with items', () => {
    it('should display cart items', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('Test Service')).toBeInTheDocument();
    });

    it('should display item pillar name', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('Test Pillar')).toBeInTheDocument();
    });

    it('should display item price', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      // There are multiple £1,000 elements - one for item price and one for subtotal
      const priceElements = screen.getAllByText('£1,000');
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show quantity controls', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show Proceed to Checkout button', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByRole('link', { name: /proceed to checkout/i })).toBeInTheDocument();
    });

    it('should link to checkout page', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      const checkoutLink = screen.getByRole('link', { name: /proceed to checkout/i });
      expect(checkoutLink).toHaveAttribute('href', '/checkout');
    });

    it('should show Clear Cart button', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByRole('button', { name: /clear cart/i })).toBeInTheDocument();
    });

    it('should clear all items when Clear Cart clicked', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('2')).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: /clear cart/i });
      fireEvent.click(clearButton);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  describe('drawer content', () => {
    it('should render header with Your Cart title', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('open-cart'));
      expect(screen.getByText('Your Cart')).toBeInTheDocument();
    });

    it('should show subtotal label when items in cart', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('Subtotal')).toBeInTheDocument();
    });

    it('should show pricing disclaimer', () => {
      renderWithProviders(
        <CartTestHelper>
          <CartDrawer />
        </CartTestHelper>
      );

      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('open-cart'));

      expect(screen.getByText('Final pricing will be confirmed during consultation')).toBeInTheDocument();
    });
  });
});
