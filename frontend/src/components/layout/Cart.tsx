import { Link } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui';

export function CartButton() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-neutral-700 hover:text-primary-700 transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-yellow text-primary-900 text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-300',
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl transition-transform duration-300',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-h3 text-primary-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </h2>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 mb-4">Your cart is empty</p>
                <Button onClick={closeCart} variant="secondary">
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Link
                          to={`/${item.pillar_slug}/${item.slug}`}
                          onClick={closeCart}
                          className="font-semibold text-primary-900 hover:text-primary-700"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-neutral-500">{item.pillar_name}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-semibold text-primary-900">
                        {item.price_label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-xl font-bold text-primary-900">
                  £{totalPrice.toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-neutral-500">
                Final pricing will be confirmed during consultation
              </p>

              <div className="space-y-2">
                <Button
                  as={Link}
                  to="/checkout"
                  onClick={closeCart}
                  size="lg"
                  className="w-full bg-accent-yellow text-primary-900 hover:bg-yellow-400"
                >
                  Proceed to Checkout
                </Button>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-neutral-500 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
