import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render a textarea element', () => {
      render(<Textarea />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Textarea label="Description" name="description" />);

      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter your message..." />);

      expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<Textarea error="Message is required" />);

      expect(screen.getByText('Message is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Textarea className="custom-class" />);

      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('should apply error styles when error exists', () => {
      render(<Textarea error="Error" />);

      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });
  });

  describe('accessibility', () => {
    it('should have aria-invalid when error exists', () => {
      render(<Textarea error="Error" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      render(<Textarea />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error', () => {
      render(<Textarea id="message" error="Error" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-error');
    });

    it('should link label to textarea via id', () => {
      render(<Textarea id="my-textarea" label="My Label" />);

      const label = screen.getByText('My Label');
      expect(label).toHaveAttribute('for', 'my-textarea');
    });

    it('should use name as fallback id', () => {
      render(<Textarea name="description" label="Description" />);

      const label = screen.getByText('Description');
      expect(label).toHaveAttribute('for', 'description');
    });
  });

  describe('interactions', () => {
    it('should allow typing text', async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello, World!');

      expect(textarea).toHaveValue('Hello, World!');
    });

    it('should call onChange when text changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Textarea readOnly />);

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('should handle required attribute', () => {
      render(<Textarea required />);

      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('props forwarding', () => {
    it('should forward rows attribute', () => {
      render(<Textarea rows={5} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('should forward maxLength attribute', () => {
      render(<Textarea maxLength={500} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '500');
    });

    it('should forward data attributes', () => {
      render(<Textarea data-testid="my-textarea" />);

      expect(screen.getByTestId('my-textarea')).toBeInTheDocument();
    });

    it('should forward name attribute', () => {
      render(<Textarea name="message" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'message');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to textarea element', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });
  });
});
