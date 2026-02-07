import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, ArrowLeft, Lock, Trash2, Minus, Plus, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Button, Input, Textarea } from '@/components/ui';
import { post } from '@/services/api';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated, openSignIn } = useUserAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: isAuthenticated && user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
    } : {},
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      // Submit order to API - this will create contact and invoice in SuiteDash
      const orderItems = items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price_from,
        pillar: { name: item.pillar_name },
        quantity: item.quantity,
      }));

      const response = await post<{
        id: number;
        orderNumber: string;
        total: number;
        payment_url?: string;
        suitedash_invoice_id?: string;
        suitedash_contact_id?: string;
        is_production?: boolean;
      }>('/orders', {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
        },
        items: orderItems,
        notes: data.notes || null,
        create_invoice: true, // Flag to create SuiteDash invoice
      });

      if (response.success && response.data) {
        setOrderNumber(response.data.orderNumber);

        // If SuiteDash returned a payment URL, show payment option
        if (response.data.payment_url) {
          setPaymentUrl(response.data.payment_url);
          setIsProcessingPayment(true);

          // Use is_production flag from backend to determine mode
          // If not set, fallback to checking IDs for backwards compatibility
          const isDemo = response.data.is_production === false ||
                         (!response.data.is_production && (
                           response.data.suitedash_invoice_id?.startsWith('invoice_') ||
                           response.data.suitedash_invoice_id?.startsWith('sd_invoice_') ||
                           response.data.suitedash_contact_id?.startsWith('contact_') ||
                           response.data.suitedash_contact_id?.startsWith('sd_contact_')
                         ));
          setIsDemoMode(!!isDemo);

          toast.success('Order created successfully!');
        } else {
          // No payment URL - either invoice API not available or SuiteDash not configured
          // Check if contact was created in SuiteDash (production mode without invoice API)
          const contactCreated = response.data.suitedash_contact_id &&
                                 !response.data.suitedash_contact_id.startsWith('contact_') &&
                                 !response.data.suitedash_contact_id.startsWith('sd_contact_');

          if (contactCreated) {
            // Production mode - contact created, but no invoice API
            setIsProcessingPayment(true);
            setIsDemoMode(false); // Not demo, just no invoice API
            setPaymentUrl(null);
            toast.success('Order created! You will receive an invoice shortly.');
          } else {
            // Standard flow - no SuiteDash integration
            setIsComplete(true);
            toast.success('Order submitted successfully!');
            setTimeout(() => {
              clearCart();
            }, 500);
          }
        }
      } else {
        toast.error(response.message || 'Failed to submit order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment redirect
  const handleProceedToPayment = () => {
    if (paymentUrl) {
      // Clear cart before redirecting
      clearCart();
      // Open payment URL in same window
      window.location.href = paymentUrl;
    }
  };

  // Handle skip payment (for quote-based services)
  const handleSkipPayment = () => {
    setIsProcessingPayment(false);
    setIsComplete(true);
    clearCart();
  };

  // Payment Pending State - Show payment button or invoice notice
  if (isProcessingPayment) {
    // No payment URL - Contact created in SuiteDash but Invoice API not available
    if (!paymentUrl) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-h2 text-primary-900 mb-4">Order Created Successfully!</h1>
            {orderNumber && (
              <p className="text-sm text-primary-600 font-medium mb-2">
                Order Number: {orderNumber}
              </p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Your details have been saved</strong>
              </p>
              <p className="text-blue-700 text-xs mt-2">
                Your contact information has been registered. Our team will send you an invoice with payment instructions shortly.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 mb-6 border border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-600">Order Total</span>
                <span className="text-2xl font-bold text-primary-900">
                  £{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-neutral-500 text-left">
                <p className="mb-1">✓ Your contact has been registered</p>
                <p className="mb-1">✓ Invoice will be sent to your email</p>
                <p>✓ Our team will contact you shortly</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSkipPayment}
                size="lg"
                className="w-full bg-accent-yellow text-primary-900 hover:bg-yellow-400 font-semibold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Continue
              </Button>

              <Link
                to="/"
                className="block text-sm text-neutral-500 hover:text-neutral-700 py-2"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Demo mode - payment integration not fully configured
    if (isDemoMode) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-h2 text-primary-900 mb-4">Order Created Successfully!</h1>
            {orderNumber && (
              <p className="text-sm text-primary-600 font-medium mb-2">
                Order Number: {orderNumber}
              </p>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm">
                <strong>Payment Integration in Demo Mode</strong>
              </p>
              <p className="text-amber-700 text-xs mt-2">
                SuiteDash payment integration is not fully configured. Your order has been created and you will receive an invoice by email with payment instructions.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 mb-6 border border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-600">Order Total</span>
                <span className="text-2xl font-bold text-primary-900">
                  £{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-neutral-500 text-left">
                <p className="mb-1">• Invoice will be sent to your email</p>
                <p className="mb-1">• Our team will contact you shortly</p>
                <p>• Payment instructions included in invoice</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSkipPayment}
                size="lg"
                className="w-full bg-accent-yellow text-primary-900 hover:bg-yellow-400 font-semibold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Continue
              </Button>

              <Link
                to="/"
                className="block text-sm text-neutral-500 hover:text-neutral-700 py-2"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Real SuiteDash payment - redirect to payment portal
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-h2 text-primary-900 mb-4">Complete Your Payment</h1>
          {orderNumber && (
            <p className="text-sm text-primary-600 font-medium mb-2">
              Order Number: {orderNumber}
            </p>
          )}
          <p className="text-neutral-600 mb-2">
            Your order has been created successfully!
          </p>
          <p className="text-neutral-600 mb-8">
            Click the button below to proceed to our secure payment portal powered by SuiteDash.
          </p>

          <div className="bg-neutral-50 rounded-xl p-6 mb-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-neutral-600">Order Total</span>
              <span className="text-2xl font-bold text-primary-900">
                £{totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-neutral-500 text-left">
              <p className="mb-1">• Secure payment processing</p>
              <p className="mb-1">• Multiple payment methods accepted</p>
              <p>• Invoice will be sent to your email</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleProceedToPayment}
              size="lg"
              className="w-full bg-accent-yellow text-primary-900 hover:bg-yellow-400 font-semibold"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Proceed to Payment
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>

            <button
              onClick={handleSkipPayment}
              className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
            >
              I'll pay later (receive invoice by email)
            </button>
          </div>

          <p className="text-xs text-neutral-400 mt-6">
            You will be redirected to SuiteDash's secure payment portal
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (isComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-h2 text-primary-900 mb-4">Order Submitted!</h1>
          {orderNumber && (
            <p className="text-sm text-primary-600 font-medium mb-2">
              Order Number: {orderNumber}
            </p>
          )}
          <p className="text-neutral-600 mb-4">
            Thank you for your order. Your invoice has been created in our system.
          </p>
          <p className="text-neutral-600 mb-8">
            You will receive an email with your invoice and payment instructions shortly.
          </p>
          <Button
            as={Link}
            to="/"
            className="bg-accent-yellow text-primary-900 hover:bg-yellow-400"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-neutral-400" />
          </div>
          <h1 className="text-h2 text-primary-900 mb-4">Your cart is empty</h1>
          <p className="text-neutral-600 mb-8">
            Looks like you haven't added any services yet. Browse our offerings and add services to get started.
          </p>
          <Button
            as={Link}
            to="/"
            className="bg-accent-yellow text-primary-900 hover:bg-yellow-400"
          >
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-neutral-50 min-h-screen">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 mb-4 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-h1 text-primary-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Sign In Prompt (if not authenticated) */}
            {!isAuthenticated && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-900">Already have an account?</h3>
                    <p className="text-sm text-neutral-600">Sign in to autofill your details and track your orders</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={openSignIn}
                    size="sm"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-h3 text-primary-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Contact Information
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+44 7700 900000"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Company"
                    placeholder="Your Company Ltd"
                    error={errors.company?.message}
                    {...register('company')}
                  />
                </div>

                <Textarea
                  label="Additional Notes"
                  placeholder="Any specific requirements, questions, or project details..."
                  rows={4}
                  error={errors.notes?.message}
                  {...register('notes')}
                />
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-primary-50 rounded-xl p-5 flex items-start gap-4 border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-primary-700" />
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-1">Your information is secure</h4>
                <p className="text-sm text-primary-700">
                  We'll review your request and contact you to discuss your requirements in detail.
                  No payment is required at this stage - you'll receive a customized quote first.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-primary-900 text-white px-6 py-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </h2>
                <p className="text-sm text-primary-200 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Items */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="bg-neutral-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-medium text-primary-900 truncate">{item.title}</h4>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.pillar_name}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary-900">{item.price_label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 p-4 space-y-3 bg-neutral-50">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">£{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                  <span className="font-semibold text-primary-900">Estimated Total</span>
                  <span className="text-xl font-bold text-primary-900">
                    £{totalPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  Final pricing confirmed after consultation
                </p>
              </div>

              {/* Submit Button */}
              <div className="p-4 pt-0">
                <Button
                  type="submit"
                  form="checkout-form"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full bg-accent-yellow text-primary-900 hover:bg-yellow-400 font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order Request'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
