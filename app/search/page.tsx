'use client'

import { useStreamingSearch } from '@/lib/hooks/useStreamingSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { Sparkles } from 'lucide-react';

export default function SearchPage() {
  const { papers, isLoading, completedSources, search } = useStreamingSearch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Source Search</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Search Academic Papers
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search across Semantic Scholar, OpenAlex, and CrossRef with real-time streaming results
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
    </div>
  );
}
