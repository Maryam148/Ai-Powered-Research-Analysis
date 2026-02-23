---
name: search-autocomplete
description: Implement Google-like search suggestions in the search bar using academic API autocomplete
---

# Search Autocomplete

## Implementation
- Use Semantic Scholar autocomplete: `https://api.semanticscholar.org/graph/v1/paper/autocomplete?query=`
- Debounce input by 300ms using useCallback + setTimeout
- Show dropdown with max 8 suggestions
- Each suggestion shows: title snippet + author + year
- Keyboard navigation (arrow keys + Enter)
- Click outside to dismiss
- Cache recent suggestions in sessionStorage
