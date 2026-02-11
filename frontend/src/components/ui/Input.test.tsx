import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input name="test" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input name="email" label="Email Address" />);
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should use name as id when id not provided', () => {
      render(<Input name="username" label="Username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username');
    });

    it('should use provided id over name', () => {
      render(<Input name="email" id="email-input" label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-input');
    });

    it('should apply custom className', () => {
      render(<Input name="test" className="custom-input" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-input');
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      render(<Input name="email" error="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('should have error styling', () => {
      render(<Input name="email" error="Error" />);
      expect(screen.getByRole('textbox')).toHaveClass('input-error');
    });

    it('should set aria-invalid to true', () => {
      render(<Input name="email" error="Error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error', () => {
      render(<Input name="email" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should have role="alert" on error message', () => {
      render(<Input name="email" error="Error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not show error when not provided', () => {
      render(<Input name="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup();
      render(<Input name="test" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      expect(input).toHaveValue('hello');
    });

    it('should call onChange', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input name="test" onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onBlur', () => {
      const handleBlur = vi.fn();
      render(<Input name="test" onBlur={handleBlur} />);

      fireEvent.blur(screen.getByRole('textbox'));
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call onFocus', () => {
      const handleFocus = vi.fn();
      render(<Input name="test" onFocus={handleFocus} />);

      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalled();
    });
  });

  describe('input types', () => {
    it('should support text type', () => {
      render(<Input name="text" type="text" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('should support email type', () => {
      render(<Input name="email" type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input name="password" type="password" label="Password" />);
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should support tel type', () => {
      render(<Input name="phone" type="tel" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });
  });

  describe('accessibility', () => {
    it('should be accessible with label', () => {
      render(<Input name="email" label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should support placeholder', () => {
      render(<Input name="email" placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should support disabled state', () => {
      render(<Input name="test" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should support required attribute', () => {
      render(<Input name="test" required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should support readonly', () => {
      render(<Input name="test" readOnly value="readonly" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });
});
