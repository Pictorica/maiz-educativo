# Supabase Integration Guide

This document explains how to integrate Supabase for cloud-based quiz rankings in the maiz-educativo project.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Project created in Supabase dashboard
- Node.js installed (for package management)

## 1. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` as specified in `package.json`.

## 2. Create Database Table

1. Log in to your Supabase dashboard
2. Navigate to your project's SQL Editor
3. Copy and paste the contents of `db/supabase_rankings.sql`
4. Execute the SQL to create the `rankings` table

The migration script will:
- Enable the `pgcrypto` extension for UUID generation
- Create the `public.rankings` table with proper schema
- Add indexes for query performance
- Include commented-out RLS (Row Level Security) policies

## 3. Configure Environment Variables

### For Local Development

Create a `.env` file in the project root (this file is git-ignored):

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Click on "Settings" (gear icon)
3. Go to "API" section
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys** → **anon** **public** key → `SUPABASE_ANON_KEY`

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:
   - Name: `SUPABASE_URL`, Value: `https://your-project-id.supabase.co`
   - Name: `SUPABASE_ANON_KEY`, Value: `your-anon-key`
4. Save and redeploy

### For GitHub Actions / Other CI

Add the environment variables as repository secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as secrets

## 4. Configure Row Level Security (RLS)

**IMPORTANT:** For production, you should enable Row Level Security to protect your data.

### Option A: Basic Public Leaderboard (Recommended for Educational Projects)

In Supabase SQL Editor, run:

```sql
-- Enable RLS
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rankings (public leaderboard)
CREATE POLICY "Allow public read access"
  ON public.rankings
  FOR SELECT
  USING (true);

-- Allow anyone to insert scores (use with caution - see security notes below)
CREATE POLICY "Allow public insert"
  ON public.rankings
  FOR INSERT
  WITH CHECK (true);
```

### Option B: Enhanced Security with Edge Functions (Production Recommended)

For better security, create a Supabase Edge Function to validate and insert scores:

1. Use `service_role` key server-side (never expose this key in frontend)
2. Implement rate limiting
3. Validate score values (check they're within valid ranges)
4. Optional: Add CAPTCHA verification

Example Edge Function structure:
```typescript
// /functions/save-quiz-score/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Validate request
  // Check rate limits
  // Verify score is valid
  // Insert using service_role key
})
```

## 5. Using the Supabase Client

The project includes `src/lib/supabaseClient.js` with two main functions:

### Save a Score

```javascript
import { saveScore } from './src/lib/supabaseClient.js';

const result = await saveScore({
  name: 'Player Name',
  score: 8,
  meta: {
    mode: 'Experto',
    totalQuestions: 15,
    percentage: 53,
    timestamp: Date.now()
  }
});

if (result.success) {
  console.log('Score saved!', result.data);
} else {
  console.error('Error saving score:', result.error);
}
```

### Get Top Scores

```javascript
import { getTopScores } from './src/lib/supabaseClient.js';

const rankings = await getTopScores(10); // Get top 10 scores

rankings.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.name} - ${entry.score} points`);
});
```

## 6. Audio Files Setup

Place your audio files in `public/audio/`:
- `bg-loop.mp3` - Background music (looping)
- `correct.wav` - Correct answer sound effect
- `wrong.wav` - Wrong answer sound effect
- `finish.mp3` - Quiz completion sound

See `public/audio/README.md` for free audio resources and licensing information.

## 7. Testing Locally

### Serve the Project

Since this is a static site using ES modules, you need to serve it with a local server:

```bash
# Using Python (recommended - already in most systems)
npm run dev
# or
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000/quiz.html

### Test the Integration

1. **Configure environment**: Make sure `.env` is set up with your Supabase credentials
2. **Open quiz**: Navigate to http://localhost:8000/quiz.html
3. **Start quiz**: Click "Comenzar Quiz" - background music should start
4. **Answer questions**: You should hear correct/wrong sound effects
5. **Complete quiz**: You should hear the finish sound
6. **Check ranking**: After entering your name, score should be saved to Supabase
7. **Verify in Supabase**: Go to Supabase dashboard → Table Editor → rankings table

### Verify in Supabase Dashboard

1. Go to Supabase dashboard
2. Navigate to "Table Editor"
3. Select the `rankings` table
4. You should see your quiz results with:
   - `id` (UUID)
   - `name` (player name)
   - `score` (number of correct answers)
   - `meta` (JSON with mode, total, percentage, etc.)
   - `created_at` (timestamp)

## 8. Troubleshooting

### Issue: "Supabase not configured" warning

**Cause:** Environment variables not loaded properly

**Solutions:**
- Verify `.env` file exists and has correct values
- For static sites, you may need to use a build tool that injects env vars
- Alternatively, create a `config.js` that exports the values (not recommended for production)

### Issue: Audio not playing

**Cause:** Browser autoplay restrictions

**Solution:** Audio will only play after user interaction (clicking "Comenzar Quiz"). This is expected browser behavior.

### Issue: Scores not saving

**Possible causes:**
1. RLS policies not configured correctly
2. ANON key doesn't have insert permissions
3. Network errors

**Debug steps:**
1. Check browser console for errors
2. Verify RLS policies in Supabase dashboard
3. Test insert manually in Supabase SQL Editor:
   ```sql
   INSERT INTO public.rankings (name, score, meta)
   VALUES ('Test', 10, '{"mode": "test"}'::jsonb);
   ```

### Issue: CORS errors

**Solution:** Supabase automatically handles CORS for same-origin requests. If you get CORS errors:
1. Check your Supabase URL is correct
2. Verify you're using the anon key (not service_role key in frontend)

## 9. Security Best Practices

### ✅ DO:
- Use ANON key in frontend code
- Enable RLS on all tables
- Implement rate limiting
- Validate data server-side
- Monitor usage in Supabase dashboard
- Keep service_role key secret (never commit to git)

### ❌ DON'T:
- Commit API keys to repository
- Use service_role key in frontend
- Allow unlimited inserts without validation
- Store sensitive data in rankings table

## 10. Environment Variables Reference

| Variable | Type | Required | Where to Use | Example |
|----------|------|----------|--------------|---------|
| `SUPABASE_URL` | String | Yes | All environments | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | String | Yes | Frontend/Public | `eyJhbGc...` (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | String | No | Backend only | Never use in frontend! |

## 11. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## Support

For issues specific to this integration, please check:
1. Browser console for JavaScript errors
2. Supabase dashboard logs
3. Network tab for failed API calls

For general Supabase questions, visit the [Supabase Discord](https://discord.supabase.com/).
