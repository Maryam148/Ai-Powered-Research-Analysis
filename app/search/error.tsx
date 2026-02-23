'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Search error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Search Failed</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t complete your search. Please try again.
          </p>
          <Button onClick={reset}>Retry Search</Button>
        </Card>
      </div>
    </div>
  );
}
