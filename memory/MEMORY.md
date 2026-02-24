# ReSearch Flow — Claude Memory

## Project
Full-stack academic research assistant. Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Supabase, Gemini 2.5 Flash, D3.js, Recharts. Deployed to Vercel.

## Key paths
- Dashboard pages: `app/dashboard/{search,library,literature-review,trends,compare,citation-mesh}/`
- API routes: `app/api/papers/{search,library,citations,trends}/` and `app/api/ai/{summarize,literature-review,gap-analysis,compare,draft,reviews}/`
- Gemini service: `lib/services/ai/gemini-service.ts` (model: `gemini-2.5-flash`)
- Paper sources: `lib/services/paper-sources/{semantic-scholar,openalex,crossref}.ts`
- Types: `lib/types/paper.ts` (includes `aiSummary?: string`), `lib/types/database.ts`
- Citation export utils: `lib/utils/citations.ts` (toBibTeX, toAPA, toMLA, downloadText)
- D3 Citation Graph: `components/citation-mesh/CitationGraph.tsx`

## Features implemented (Feb 2026)
All 7 user stories + extras implemented:
1. **Search** — SSE streaming from 3 APIs, debounced autocomplete wired, filters
2. **Metadata Preview** — PaperCard with title/authors/abstract/citations/source badge
3. **Citation Mesh** — D3 force-directed graph at `/dashboard/citation-mesh?paperId=...`; expandable nodes; SS papers only (or DOI lookup); accessible from search + library
4. **AI Summary** — Per-paper "Generate Insights" in library detail, Gemini 2.5 Flash, cached to DB
5. **Research Trends** — Real data via `/api/papers/trends?query=X` → SS search → Gemini keyword extraction; word cloud + bar charts
6. **Literature Review + Paper Draft + Gap Analysis** — Multi-select papers from library → 3 tabs (Lit Review / Research Gaps / Paper Draft); editable textarea; export PDF/Word/BibTeX/APA/MLA; saved to `generated_reviews` table via `/api/ai/reviews`
7. **Save & Export** — Notes textarea (auto-save on blur), tags chips, export dropdown (PDF/BibTeX/APA/MLA) on each saved paper
8. **Compare Papers** — Select 2-4 library papers → AI comparison via existing `/api/ai/compare`

## DB tables
- `saved_papers`: id, user_id, paper_title, paper_doi, paper_data (JSON), notes, tags[], created_at
- `generated_reviews`: id, user_id, title, content, review_type, paper_ids[], metadata, created_at
- `searches`: id, user_id, query, filters, results_count, created_at
- `profiles`: id, full_name, institution, avatar_url

## Patterns
- Server API routes: always check auth via `supabase.auth.getUser()`, cast client as `SupabaseClient<Database>`
- Client components: use `useNotification` from `@/components/ui/notifications` for toasts
- All AI uses `gemini-2.5-flash` (note: codebase uses `MODEL = 'gemini-2.5-flash'` not 1.5)
- Citation mesh: SS paper IDs used as-is; other sources use `DOI:xxx` lookup via SS API
- `Paper.id` = SS paper ID (not DB UUID). DB row ID is `savedPaper.id`

## User preferences
- Ship fast, no over-engineering
- Tailwind only (no separate CSS files)
- Conventional commits
- Branch: main only
