import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg text-center">
        <h1 className="text-8xl font-bold text-primary-200 mb-4">404</h1>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-lg text-neutral-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as={Link} to="/" variant="primary">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button as="button" variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
