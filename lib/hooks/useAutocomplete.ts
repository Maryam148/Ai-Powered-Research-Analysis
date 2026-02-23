'use client'

import { useState, useEffect, useCallback } from 'react';
import { AutocompleteSuggestion } from '@/lib/types/paper';

export function useAutocomplete(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/papers/autocomplete?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { suggestions, isLoading };
}
