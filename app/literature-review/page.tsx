'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

export default function LiteratureReviewPage() {
  const [paperData, setPaperData] = useState('');
  const [review, setReview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReview = async () => {
    if (!paperData.trim()) return;

    setIsLoading(true);

    try {
      // Parse paper data (simplified - in production, this would come from selected papers)
      const papers = paperData.split('\n\n').map(block => {
        const lines = block.split('\n');
        return {
          title: lines[0] || 'Untitled',
          authors: ['Author'],
          year: 2024,
          abstract: lines.slice(1).join(' ') || 'No abstract',
        };
      });

      const response = await fetch('/api/ai/literature-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers }),
      });

      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      console.error('Review generation failed:', error);
      setReview('Failed to generate review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8" />
            Literature Review Generator
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive literature reviews from selected papers
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paste paper data (title and abstract, separated by blank lines)
            </label>
            <Textarea
              value={paperData}
              onChange={(e) => setPaperData(e.target.value)}
              placeholder="Paper 1 Title&#10;Abstract...&#10;&#10;Paper 2 Title&#10;Abstract..."
              className="min-h-[200px]"
            />
          </div>

          <Button onClick={generateReview} disabled={isLoading || !paperData.trim()} className="w-full">
            {isLoading ? 'Generating Review...' : 'Generate Literature Review'}
          </Button>
        </Card>

        {isLoading && <Skeleton className="h-96 w-full" />}

        {review && !isLoading && (
          <Card className="p-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-xl font-semibold mb-4">Generated Literature Review</h3>
              <div className="whitespace-pre-wrap">{review}</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
