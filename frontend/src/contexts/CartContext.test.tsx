import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from './CartContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockItem: Omit<CartItem, 'quantity'> = {
  id: 1,
  title: 'Test Service',
  slug: 'test-service',
  price_from: 100,
  price_label: '£100/month',
  pillar_name: 'Strategy',
  pillar_slug: 'strategy',
};

const mockItem2: Omit<CartItem, 'quantity'> = {
  id: 2,
  title: 'Another Service',
  slug: 'another-service',
  price_from: 200,
  price_label: '£200/month',
  pillar_name: 'Operations',
  pillar_slug: 'operations',
};

describe('useCart', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should throw error when used outside CartProvider', () => {
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');
    });

    it('should start with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should load cart from localStorage', () => {
      const storedItems = [{ ...mockItem, quantity: 2 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toEqual(storedItems);
      expect(result.current.totalItems).toBe(2);
    });

    it('should start with cart closed', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isCartOpen).toBe(false);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({ ...mockItem, quantity: 1 });
    });

    it('should increment quantity if item already in cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should open cart when item is added', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isCartOpen).toBe(false);

      act(() => {
        result.current.addItem(mockItem);
      });

      expect(result.current.isCartOpen).toBe(true);
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(mockItem);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'consultancy_cart',
        expect.stringContaining('"id":1')
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const storedItems = [{ ...mockItem, quantity: 1 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not affect other items', () => {
      const storedItems = [
        { ...mockItem, quantity: 1 },
        { ...mockItem2, quantity: 1 },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const storedItems = [{ ...mockItem, quantity: 1 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      const storedItems = [{ ...mockItem, quantity: 1 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item if quantity is negative', () => {
      const storedItems = [{ ...mockItem, quantity: 1 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.updateQuantity(1, -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const storedItems = [
        { ...mockItem, quantity: 1 },
        { ...mockItem2, quantity: 2 },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('isInCart', () => {
    it('should return true if item is in cart', () => {
      const storedItems = [{ ...mockItem, quantity: 1 }];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isInCart(1)).toBe(true);
    });

    it('should return false if item is not in cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isInCart(999)).toBe(false);
    });
  });

  describe('totalItems', () => {
    it('should calculate total items correctly', () => {
      const storedItems = [
        { ...mockItem, quantity: 2 },
        { ...mockItem2, quantity: 3 },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.totalItems).toBe(5);
    });
  });

  describe('totalPrice', () => {
    it('should calculate total price correctly', () => {
      const storedItems = [
        { ...mockItem, quantity: 2 }, // 100 * 2 = 200
        { ...mockItem2, quantity: 3 }, // 200 * 3 = 600
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.totalPrice).toBe(800);
    });
  });

  describe('cart visibility', () => {
    it('should open cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isCartOpen).toBe(false);

      act(() => {
        result.current.openCart();
      });

      expect(result.current.isCartOpen).toBe(true);
    });

    it('should close cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.openCart();
      });

      expect(result.current.isCartOpen).toBe(true);

      act(() => {
        result.current.closeCart();
      });

      expect(result.current.isCartOpen).toBe(false);
    });

    it('should toggle cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.isCartOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isCartOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isCartOpen).toBe(false);
    });
  });
});
