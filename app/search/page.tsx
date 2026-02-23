'use client'

import { useStreamingSearch } from '@/lib/hooks/useStreamingSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export default function SearchPage() {
  const { papers, isLoading, completedSources, search } = useStreamingSearch();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Search Academic Papers</h1>
          <p className="text-muted-foreground">
            Search across multiple databases and get results instantly
          </p>
        </div>

        <div className="flex justify-center">
          <SearchBar onSearch={search} isLoading={isLoading} />
        </div>

        <SearchResults
          papers={papers}
          isLoading={isLoading}
          completedSources={completedSources}
        />
      </div>
    </div>
  );
}
