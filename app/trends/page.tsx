'use client'

import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function TrendsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Research Trends & Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize publication trends, top authors, and hot topics
          </p>
        </div>

        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Analytics dashboard coming soon. This will show:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>📈 Publication volume over time</li>
            <li>👥 Top authors and institutions</li>
            <li>🔥 Hot topics and trending keywords</li>
            <li>🔬 Methodology evolution</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
