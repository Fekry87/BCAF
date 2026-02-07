import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Lock, Building, Phone, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Button } from '@/components/ui';

const signInSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  company: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    signIn,
    signUp,
    openSignIn,
    openSignUp
  } = useUserAuth();
  const [isLoading, setIsLoading] = useState(false);

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const handleSignIn = async (data: SignInFormValues) => {
    setIsLoading(true);
    const result = await signIn(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      signInForm.reset();
    } else {
      toast.error(result.error || 'Sign in failed');
    }
  };

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsLoading(true);
    const result = await signUp({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      phone: data.phone,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      signUpForm.reset();
    } else {
      toast.error(result.error || 'Sign up failed');
    }
  };

  const handleClose = () => {
    closeAuthModal();
    signInForm.reset();
    signUpForm.reset();
  };

  if (!isAuthModalOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-h3 text-primary-900">
              {authModalMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {authModalMode === 'signin' ? (
              // Sign In Form
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={clsx(
                      'input pl-10',
                      signInForm.formState.errors.email && 'border-red-500'
                    )}
                    {...signInForm.register('email')}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-red-500 -mt-2">{signInForm.formState.errors.email.message}</p>
                )}

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    className={clsx(
                      'input pl-10',
                      signInForm.formState.errors.password && 'border-red-500'
                    )}
                    {...signInForm.register('password')}
                  />
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-500 -mt-2">{signInForm.formState.errors.password.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <p className="text-center text-sm text-neutral-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={openSignUp}
                    className="text-primary-700 hover:text-primary-800 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              // Sign Up Form
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="First name"
                        className={clsx(
                          'input pl-10',
                          signUpForm.formState.errors.firstName && 'border-red-500'
                        )}
                        {...signUpForm.register('firstName')}
                      />
                    </div>
                    {signUpForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      className={clsx(
                        'input',
                        signUpForm.formState.errors.lastName && 'border-red-500'
                      )}
                      {...signUpForm.register('lastName')}
                    />
                    {signUpForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={clsx(
                      'input pl-10',
                      signUpForm.formState.errors.email && 'border-red-500'
                    )}
                    {...signUpForm.register('email')}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-500 -mt-2">{signUpForm.formState.errors.email.message}</p>
                )}

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    className={clsx(
                      'input pl-10',
                      signUpForm.formState.errors.password && 'border-red-500'
                    )}
                    {...signUpForm.register('password')}
                  />
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500 -mt-2">{signUpForm.formState.errors.password.message}</p>
                )}

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className={clsx(
                      'input pl-10',
                      signUpForm.formState.errors.confirmPassword && 'border-red-500'
                    )}
                    {...signUpForm.register('confirmPassword')}
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 -mt-2">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Company (optional)"
                      className="input pl-10"
                      {...signUpForm.register('company')}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      className="input pl-10"
                      {...signUpForm.register('phone')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-neutral-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={openSignIn}
                    className="text-primary-700 hover:text-primary-800 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
