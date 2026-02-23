'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={reset}>Try again</Button>
        </Card>
      </div>
    </div>
  );
}
