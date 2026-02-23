# ReSearch Flow — AI Research Assistant

## Project Overview
Full-stack academic research assistant. Students enter a topic → get papers from multiple APIs (streamed progressively) → AI summaries → citation mesh → literature review generator → research gap finder → trend analytics.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o-mini (NOT gpt-4 — cost/speed critical)
- **Paper APIs**: Semantic Scholar (primary, free), OpenAlex (free), CrossRef (free). NO paid APIs. Remove any failing/paid sources.
- **Visualization**: D3.js for citation mesh, Recharts for analytics
- **Deployment**: Vercel

## Architecture Decisions
- Papers stream progressively: as ANY API returns results, display them immediately while others continue fetching in background
- Deduplication filter by DOI + title similarity before displaying
- Search bar with autocomplete suggestions (debounced, using Semantic Scholar autocomplete API)
- All AI calls use `gpt-4o-mini` model string — NEVER gpt-4 or gpt-4-turbo
- Server-sent events (SSE) for streaming paper results to frontend

## Key Patterns
- Use Server Components where possible, Client Components only when interactive
- API routes in `app/api/` — keep thin, delegate to service layer in `lib/services/`
- Types in `lib/types/` — shared between frontend and backend
- Supabase client in `lib/supabase/` — server and client variants
- Error boundaries on every page

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run type-check` — TypeScript strict check

## Git Conventions
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- One logical change per commit
- Branch: `main` only (speed mode for FYP)

## DO NOT
- Use gpt-4 or gpt-4-turbo anywhere
- Add paid paper APIs (no Elsevier, Springer, IEEE Xplore paid endpoints)
- Install unnecessary dependencies
- Over-engineer — this is an FYP with 1-hour timeline, ship fast
- Create separate CSS files — use Tailwind only
