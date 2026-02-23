'use client'

import { useState, useCallback } from 'react';
import { Paper } from '@/lib/types/paper';

export function useStreamingSearch() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSources, setCompletedSources] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setPapers([]);
    setIsLoading(true);
    setCompletedSources([]);
    setError(null);

    try {
      const response = await fetch(`/api/papers/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'complete') {
              setCompletedSources(prev => [...prev, data.source]);
            } else if (data.type === 'done') {
              setIsLoading(false);
            } else {
              // It's a paper
              setPapers(prev => [...prev, data as Paper]);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPapers([]);
    setIsLoading(false);
    setCompletedSources([]);
    setError(null);
  }, []);

  return { papers, isLoading, completedSources, error, search, reset };
}
