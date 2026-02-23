'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Paper } from '@/lib/types/paper';
import { Sparkles } from 'lucide-react';

interface SummaryPanelProps {
  paper: Paper;
}

export function SummaryPanel({ paper }: SummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors.map(a => a.name),
        }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Summary generation failed:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Summary
          </h3>
          {!summary && (
            <Button onClick={generateSummary} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          )}
        </div>

        {isLoading && <Skeleton className="h-32 w-full" />}

        {summary && !isLoading && (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
