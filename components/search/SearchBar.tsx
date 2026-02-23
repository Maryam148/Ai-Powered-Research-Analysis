'use client'

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useAutocomplete } from '@/lib/hooks/useAutocomplete';
import type { AutocompleteSuggestion } from '@/lib/types/paper';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useAutocomplete(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion | string) => {
    const searchText = typeof suggestion === 'string' ? suggestion : suggestion.title;
    setQuery(searchText);
    onSearch(searchText);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for papers (e.g., 'deep learning in osteoarthritis')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion: AutocompleteSuggestion, idx: number) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawLabel = (suggestion as any).title || (typeof suggestion === 'string' ? suggestion : suggestion);
            const label = typeof rawLabel === 'string' ? rawLabel : String(rawLabel);

            return (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
              >
                <div className="font-medium text-sm line-clamp-1">
                  {label}
                </div>
                {suggestion.authors && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {suggestion.authors.slice(0, 3).join(', ')} {suggestion.year && `(${suggestion.year})`}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
