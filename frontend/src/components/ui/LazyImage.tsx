import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blurDataURL?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * LazyImage component that uses Intersection Observer for lazy loading
 * Includes blur-up placeholder effect for better UX
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  placeholderSrc,
  blurDataURL,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Default placeholder - 1x1 transparent pixel
  const defaultPlaceholder =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Show placeholder while not in view
  const currentSrc = isInView
    ? hasError
      ? placeholderSrc || defaultPlaceholder
      : src
    : blurDataURL || placeholderSrc || defaultPlaceholder;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      {...props}
    />
  );
});

/**
 * Background image version for div elements
 */
interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyBackground = memo(function LazyBackground({
  src,
  className = '',
  children,
  threshold = 0.1,
  rootMargin = '100px',
}: LazyBackgroundProps) {
  const [isInView, setIsInView] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={divRef}
      className={`transition-opacity duration-500 ${className}`}
      style={{
        backgroundImage: isInView ? `url(${src})` : undefined,
      }}
    >
      {children}
    </div>
  );
});
