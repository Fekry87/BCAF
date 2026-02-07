import { forwardRef, ButtonHTMLAttributes, ElementType, ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button';
  };

type ButtonAsLink<C extends ElementType> = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<C>, keyof ButtonBaseProps> & {
    as: C;
  };

export type ButtonProps<C extends ElementType = 'button'> = C extends 'button'
  ? ButtonAsButton
  : ButtonAsLink<C>;

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary disabled:bg-neutral-200 disabled:text-neutral-400',
  secondary: 'bg-white text-primary-700 border border-primary-700 hover:bg-primary-50 active:bg-primary-100 disabled:border-neutral-300 disabled:text-neutral-400',
  text: 'bg-transparent text-primary-700 hover:text-primary-800 hover:underline disabled:text-neutral-400',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Button = forwardRef<HTMLButtonElement, ButtonProps<any>>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, as, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2';

    const Component = as || 'button';

    const buttonProps = Component === 'button' ? { disabled: disabled || isLoading } : {};

    return (
      <Component
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant as ButtonVariant],
          sizes[size as ButtonSize],
          isLoading && 'cursor-wait',
          className
        )}
        {...buttonProps}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';
