'use client'

import { useState, useMemo } from 'react';
import { Paper } from '@/lib/types/paper';
import { PaperCard } from './PaperCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchResultsProps {
  papers: Paper[];
  isLoading: boolean;
  completedSources: string[];
}

type SortOption = 'relevance' | 'citations' | 'year';
type FilterOption = 'all' | 'semantic-scholar' | 'openalex' | 'crossref';

export function SearchResults({ papers, isLoading, completedSources }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const filteredAndSorted = useMemo(() => {
    let result = [...papers];

    // Filter by source
    if (filterBy !== 'all') {
      result = result.filter(p => p.source === filterBy);
    }

    // Sort
    if (sortBy === 'citations') {
      result.sort((a, b) => b.citationCount - a.citationCount);
    } else if (sortBy === 'year') {
      result.sort((a, b) => b.year - a.year);
    }
    // 'relevance' keeps original order

    return result;
  }, [papers, sortBy, filterBy]);

  if (!isLoading && papers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No papers found. Try a different query.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {papers.length} papers found
          </span>
          {isLoading && (
            <Badge variant="outline">
              Loading... ({completedSources.length}/3 sources)
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="semantic-scholar">Semantic Scholar</SelectItem>
              <SelectItem value="openalex">OpenAlex</SelectItem>
              <SelectItem value="crossref">CrossRef</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="citations">Citations</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSorted.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}

        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
