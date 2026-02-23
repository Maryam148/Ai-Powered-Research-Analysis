---
globs: ["app/api/**", "lib/services/**"]
---

# API Design Rules

- All paper-fetching services must implement streaming via SSE
- Each API source runs independently — never wait for all to complete
- Dedup by DOI first, then fuzzy title match (Levenshtein distance < 3)
- Return papers as they arrive with `source` field indicating origin
- Rate limit awareness: add exponential backoff on 429s
- Always return structured PaperResult type
