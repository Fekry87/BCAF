import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const defaultOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  describe('rendering', () => {
    it('should render with options', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Select label="Choose option" name="choice" options={defaultOptions} />);

      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Select placeholder="Select one..." options={defaultOptions} />);

      expect(screen.getByText('Select one...')).toBeInTheDocument();
    });

    it('should render with children instead of options', () => {
      render(
        <Select>
          <option value="a">Child A</option>
          <option value="b">Child B</option>
        </Select>
      );

      expect(screen.getByText('Child A')).toBeInTheDocument();
      expect(screen.getByText('Child B')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<Select options={defaultOptions} error="Please select an option" />);

      expect(screen.getByText('Please select an option')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Select options={defaultOptions} className="custom-class" />);

      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('should have aria-invalid when error exists', () => {
      render(<Select options={defaultOptions} error="Error" />);

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby pointing to error', () => {
      render(<Select id="test-select" options={defaultOptions} error="Error" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    it('should link label to select via id', () => {
      render(<Select id="my-select" label="My Label" options={defaultOptions} />);

      const label = screen.getByText('My Label');
      expect(label).toHaveAttribute('for', 'my-select');
    });

    it('should use name as fallback id', () => {
      render(<Select name="my-name" label="My Label" options={defaultOptions} />);

      const label = screen.getByText('My Label');
      expect(label).toHaveAttribute('for', 'my-name');
    });
  });

  describe('interactions', () => {
    it('should call onChange when selection changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Select options={defaultOptions} onChange={handleChange} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '2');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Select options={defaultOptions} disabled />);

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should handle required attribute', () => {
      render(<Select options={defaultOptions} required />);

      expect(screen.getByRole('combobox')).toBeRequired();
    });
  });

  describe('props forwarding', () => {
    it('should forward data attributes', () => {
      render(<Select options={defaultOptions} data-testid="my-select" />);

      expect(screen.getByTestId('my-select')).toBeInTheDocument();
    });

    it('should forward name attribute', () => {
      render(<Select options={defaultOptions} name="category" />);

      expect(screen.getByRole('combobox')).toHaveAttribute('name', 'category');
    });
  });
});
