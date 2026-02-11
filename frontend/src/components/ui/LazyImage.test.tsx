import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LazyImage } from './LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => {
    return {
      observe: mockObserve.mockImplementation((element) => {
        // Simulate immediate intersection for testing
        callback([{ isIntersecting: true, target: element }]);
      }),
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    };
  });

  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LazyImage', () => {
  describe('rendering', () => {
    it('should render img element', () => {
      render(<LazyImage src="/test.jpg" alt="Test image" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should have correct alt text', () => {
      render(<LazyImage src="/test.jpg" alt="Test description" />);
      expect(screen.getByAltText('Test description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <LazyImage src="/test.jpg" alt="Test" className="custom-image" />
      );
      expect(screen.getByRole('img')).toHaveClass('custom-image');
    });

    it('should have loading="lazy" attribute', () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
    });

    it('should have decoding="async" attribute', () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(screen.getByRole('img')).toHaveAttribute('decoding', 'async');
    });
  });

  describe('lazy loading behavior', () => {
    it('should use IntersectionObserver', () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should observe the image element', () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should disconnect observer on unmount', () => {
      const { unmount } = render(<LazyImage src="/test.jpg" alt="Test" />);
      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should load actual src when in view', async () => {
      render(<LazyImage src="/actual-image.jpg" alt="Test" />);

      await waitFor(() => {
        expect(screen.getByRole('img')).toHaveAttribute(
          'src',
          '/actual-image.jpg'
        );
      });
    });
  });

  describe('placeholder behavior', () => {
    it('should use placeholder before in view', () => {
      // Override to not trigger intersection
      mockIntersectionObserver.mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));

      render(
        <LazyImage
          src="/actual.jpg"
          alt="Test"
          placeholderSrc="/placeholder.jpg"
        />
      );

      // Should show placeholder when not intersecting
      const img = screen.getByRole('img');
      expect(img.getAttribute('src')).toContain('placeholder');
    });
  });

  describe('error handling', () => {
    it('should handle image load error', async () => {
      render(<LazyImage src="/broken.jpg" alt="Broken" />);

      const img = screen.getByRole('img');

      // Simulate error
      img.dispatchEvent(new Event('error'));

      // Should still be in the DOM
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('transition styles', () => {
    it('should have transition class', () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(screen.getByRole('img')).toHaveClass('transition-opacity');
    });
  });
});

