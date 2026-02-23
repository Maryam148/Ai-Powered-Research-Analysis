---
name: stream-papers
description: Implement streaming paper search from multiple academic APIs with progressive display and deduplication
---

# Streaming Paper Search Architecture

## Pattern
1. Frontend sends search query via fetch to `/api/papers/search`
2. API route creates ReadableStream (SSE)
3. Launch all paper sources concurrently with Promise.allSettled pattern
4. As each source returns results, write to stream immediately
5. Dedup engine filters before writing to stream
6. Frontend reads stream with EventSource, appends papers to state

## Deduplication Logic
```typescript
function isDuplicate(paper: Paper, existing: Paper[]): boolean {
  // Check DOI match first (fastest)
  if (paper.doi && existing.some(p => p.doi === paper.doi)) return true;

  // Fuzzy title match
  const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  return existing.some(p => {
    const existingNorm = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return levenshteinDistance(normalizedTitle, existingNorm) < 3;
  });
}
```

## API Sources (Free Only)
1. **Semantic Scholar** — `https://api.semanticscholar.org/graph/v1/paper/search`
2. **OpenAlex** — `https://api.openalex.org/works?search=`
3. **CrossRef** — `https://api.crossref.org/works?query=`
