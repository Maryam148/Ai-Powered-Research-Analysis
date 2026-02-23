---
globs: ["lib/services/ai/**", "app/api/ai/**"]
---

# AI Integration Rules

- ALWAYS use model: "gemini-1.5-flash" — fast and cost-effective
- Keep prompts concise to minimize token cost
- For summaries: maxOutputTokens=500, temperature=0.3
- For literature reviews: maxOutputTokens=2000, temperature=0.4
- For gap analysis: maxOutputTokens=1500, temperature=0.5
- Stream AI responses to frontend when needed
- Use clear, detailed prompts for academic writing style
