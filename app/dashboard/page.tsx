'use client'

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);

      if (!user) {
        router.push('/auth/login');
      }
    };

    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}!</h2>
          <p className="text-muted-foreground">
            Your personalized research dashboard is being built. Here you'll see:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>📚 Recent searches and results</li>
            <li>⭐ Saved papers and bookmarks</li>
            <li>📝 Generated literature reviews</li>
            <li>📊 Research activity analytics</li>
          </ul>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">No recent activity yet. Start searching!</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/search')}>
                🔍 Search Papers
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/literature-review')}>
                📝 Generate Review
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/compare')}>
                ⚖️ Compare Papers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
