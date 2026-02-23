---
globs: ["lib/services/ai/**", "app/api/ai/**"]
---

# AI Integration Rules

- ALWAYS use model: "gpt-4o-mini" — never gpt-4
- Keep prompts concise to minimize token cost
- For summaries: max_tokens=500, temperature=0.3
- For literature reviews: max_tokens=2000, temperature=0.4
- For gap analysis: max_tokens=1500, temperature=0.5
- Stream AI responses to frontend using SSE
- Include system prompts that enforce academic writing style
