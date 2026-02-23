'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { GitCompare } from 'lucide-react';

export default function ComparePage() {
  const [paperData, setPaperData] = useState('');
  const [comparison, setComparison] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const comparePapers = async () => {
    if (!paperData.trim()) return;

    setIsLoading(true);

    try {
      const papers = paperData.split('\n\n').map(block => {
        const lines = block.split('\n');
        return {
          title: lines[0] || 'Untitled',
          authors: ['Author'],
          year: 2024,
          abstract: lines.slice(1).join(' ') || 'No abstract',
        };
      });

      if (papers.length < 2) {
        alert('Please provide at least 2 papers to compare');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers }),
      });

      const data = await response.json();
      setComparison(data.comparison);
    } catch (error) {
      console.error('Comparison failed:', error);
      setComparison('Failed to generate comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <GitCompare className="h-8 w-8" />
            Paper Comparison
          </h1>
          <p className="text-muted-foreground">
            Compare multiple papers side-by-side with AI analysis
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paste paper data (at least 2 papers, separated by blank lines)
            </label>
            <Textarea
              value={paperData}
              onChange={(e) => setPaperData(e.target.value)}
              placeholder="Paper 1 Title&#10;Abstract...&#10;&#10;Paper 2 Title&#10;Abstract..."
              className="min-h-[200px]"
            />
          </div>

          <Button onClick={comparePapers} disabled={isLoading || !paperData.trim()} className="w-full">
            {isLoading ? 'Comparing Papers...' : 'Compare Papers'}
          </Button>
        </Card>

        {isLoading && <Skeleton className="h-96 w-full" />}

        {comparison && !isLoading && (
          <Card className="p-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-xl font-semibold mb-4">Comparison Analysis</h3>
              <div className="whitespace-pre-wrap">{comparison}</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
