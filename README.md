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

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
npx vercel
```

## License

MIT

## Acknowledgments

- Built with Claude Code
- Powered by Next.js and Supabase
- Paper data from Semantic Scholar, OpenAlex, and CrossRef
