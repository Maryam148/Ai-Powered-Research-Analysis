# ReSearch Flow

AI-powered academic research assistant for discovering papers, generating summaries, and literature reviews.

## Features

- 🔍 Multi-source paper search (Semantic Scholar, OpenAlex, CrossRef)
- ⚡ Real-time streaming results with deduplication
- 🤖 AI-powered summaries, literature reviews, and gap analysis
- 📊 Paper comparison and trend analytics
- 🔐 Supabase authentication (email + Google OAuth)
- 📚 Personal dashboard with search history

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o-mini
- **APIs**: Semantic Scholar, OpenAlex, CrossRef (all free)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Research-Flow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your keys:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Run the migration script in your Supabase SQL editor:
```bash
cat supabase/migrations/001_initial_schema.sql
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── search/            # Search page
│   ├── literature-review/ # Lit review generator
│   ├── compare/           # Paper comparison
│   └── trends/            # Analytics dashboard
├── components/            # React components
├── lib/                   # Utilities and services
│   ├── services/         # API service modules
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── .claude/              # Claude Code configuration
    ├── rules/            # Scoped rules
    ├── skills/           # Custom skills
    └── agents/           # Specialized agents
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/research-flow.git
git push -u origin main
```

2. Import project to Vercel:
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Framework Preset: Next.js (auto-detected)

3. Add environment variables in Vercel dashboard:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy! Vercel will automatically deploy on every push to main.

### Supabase Setup

1. Create a new Supabase project
2. Run the migration script from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication > Providers
4. Add your Vercel deployment URL to Authentication > URL Configuration > Redirect URLs

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret!) |
| `SEMANTIC_SCHOLAR_API_KEY` | No | Optional - for higher rate limits |

## Mobile Responsive

The app is fully responsive and tested at:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1024px+

All components use Tailwind's responsive utilities (sm:, md:, lg:, xl:)

## License

MIT

## Acknowledgments

- Built with Claude Code
- Powered by Next.js and Supabase
- Paper data from Semantic Scholar, OpenAlex, and CrossRef
