# Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed
git status
git add .
git commit -m "chore: prepare for deployment"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/research-flow.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to initialize (~2 minutes)
3. Go to SQL Editor and run the migration:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run
4. Note down your credentials from Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **.**
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

5. Add environment variables:
   ```
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

6. Click **Deploy**

### Step 4: Configure Supabase Auth

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

3. (Optional) Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google
   - Add your Google OAuth credentials
   - Add Vercel URL to authorized redirect URIs

### Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test search functionality
3. Try creating an account
4. Generate an AI summary

## Troubleshooting

### Build fails with "OPENAI_API_KEY is missing"
- Make sure you added the env variable in Vercel dashboard
- Redeploy after adding variables

### Supabase auth not working
- Check that redirect URLs are configured correctly
- Verify all Supabase env vars are set
- Check Supabase logs in dashboard

### Search returns no results
- Paper APIs are free and don't require keys
- Check browser console for CORS errors
- Verify network tab shows API calls completing

### Dark mode not working
- Should work automatically with system preference
- Toggle in navbar should persist preference

## Monitoring

- View logs in Vercel dashboard > Deployments > [your deployment] > Logs
- Monitor Supabase usage in Supabase dashboard > Database > Usage
- Check OpenAI usage at platform.openai.com

## Cost Estimates (Free Tier)

- **Vercel**: Free for hobby projects (100GB bandwidth/month)
- **Supabase**: Free tier (500MB database, 50K monthly active users)
- **OpenAI**: ~$0.15 per 1M tokens (GPT-4o-mini)
- **Paper APIs**: Free (Semantic Scholar, OpenAlex, CrossRef)

With typical usage (~1000 searches/month, 500 AI summaries), expect:
- **Total cost: $0-5/month** (mostly OpenAI)

## Performance

- **Search latency**: 500ms-2s (streaming results)
- **AI summary**: 2-5s per paper
- **Literature review**: 10-20s for 5-10 papers
- **Build time**: ~2-3 minutes

## Updates

To deploy updates:
```bash
git add .
git commit -m "feat: your update"
git push
```

Vercel automatically redeploys on every push to main.

## Custom Domain (Optional)

1. Buy a domain (e.g., on Vercel Domains, Namecheap)
2. In Vercel dashboard, go to Project Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update Supabase redirect URLs with new domain
