import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('should render skip link', () => {
    render(<SkipLink />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should link to main-content', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should be visually hidden by default', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('sr-only');
  });

  it('should have focus styles', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('focus:not-sr-only');
  });

  it('should be an anchor element', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link.tagName).toBe('A');
  });
});
