import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-4xl font-bold">404</h2>
          <p className="text-muted-foreground">
            Page not found. The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
