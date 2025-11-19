# Supabase Integration Guide for Maiz Educativo

This guide explains how to set up and configure Supabase for storing quiz rankings.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Migration](#database-migration)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)

## Prerequisites

- A Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed (for package installation)
- Access to the project's GitHub repository

## Supabase Project Setup

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details:
   - **Name**: maiz-educativo
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes ~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

**IMPORTANT**: Never commit these values to your repository!

## Database Migration

### Run the SQL Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `db/supabase_rankings.sql` from this repository
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. Verify the table was created:
   ```sql
   SELECT * FROM public.rankings LIMIT 5;
   ```

### What the Migration Creates

- **Extension**: `pgcrypto` for UUID generation
- **Table**: `public.rankings` with columns:
  - `id`: UUID primary key
  - `name`: Player name (text)
  - `score`: Number of correct answers (integer)
  - `meta`: Additional data like mode, total questions (JSONB)
  - `created_at`: Timestamp
- **RLS Policies**: 
  - Allow public read (anyone can view rankings)
  - Allow public insert (anyone can submit scores)
- **Index**: On `score DESC, created_at ASC` for fast queries

## Environment Variables

### For Local Development

Since this is a static site without a build process, you'll need to set environment variables differently depending on your setup:

#### Option 1: Using a .env file (with a build tool like Vite or Parcel)

If you add a bundler in the future:

```bash
# .env (add to .gitignore!)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key-here...
```

#### Option 2: For pure static deployment

The code will read from `window.ENV` if set. You can inject this during deployment.

### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - **Name**: `SUPABASE_URL`
     - **Value**: Your Supabase project URL
   - **Name**: `SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon public key
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Save changes
6. Redeploy your project

### For Netlify Deployment

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click "Edit variables"
3. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon public key
4. Save
5. Trigger a new deploy

## Installation

### Install Supabase JavaScript Client

```bash
npm install @supabase/supabase-js
```

If your project doesn't have a `package.json` yet:

```bash
npm init -y
npm install @supabase/supabase-js
```

### Update .gitignore

Ensure your `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build outputs
dist/
build/
```

## Deployment

### Static Site (Current Setup)

The current project is a static HTML/CSS/JS site. To use ES6 modules with Supabase:

1. Add a bundler like Vite or Parcel
2. Or use a CDN version:

```html
<!-- In quiz.html, before closing </body> -->
<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
  
  const supabase = createClient(
    'YOUR_SUPABASE_URL', 
    'YOUR_SUPABASE_ANON_KEY'
  )
  
  // Make supabase available globally
  window.supabase = supabase
</script>
```

**Note**: For production, it's recommended to use environment variables and a build tool rather than hardcoding credentials.

### Recommended: Add Vite for Build Process

```bash
npm install -D vite
```

Update `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        quiz: 'quiz.html',
      }
    }
  }
})
```

## Testing

### Manual Testing Steps

1. **Set up environment variables** as described above
2. **Run the site locally**:
   ```bash
   # If using Vite:
   npm run dev
   
   # Or use any local server:
   python -m http.server 8000
   # OR
   npx serve .
   ```
3. **Open the quiz page**: Navigate to `http://localhost:8000/quiz.html`
4. **Start the quiz**: Click "Comenzar Quiz"
   - Verify background music starts (if audio files are present)
5. **Answer questions**: 
   - Verify sound effects play for correct/wrong answers
   - Complete all questions
6. **Check score submission**:
   - Verify the score is saved to Supabase
   - Check the Supabase dashboard → Table Editor → rankings
7. **Check rankings display**:
   - Verify top scores are displayed
   - Refresh and check if rankings persist

### Verify Database Directly

In Supabase dashboard → **Table Editor** → **rankings**:

```sql
-- View all rankings
SELECT * FROM public.rankings 
ORDER BY score DESC, created_at ASC;

-- View top 10
SELECT * FROM public.rankings 
ORDER BY score DESC, created_at ASC 
LIMIT 10;

-- Count total entries
SELECT COUNT(*) FROM public.rankings;
```

### Test RLS Policies

Try these in the SQL Editor:

```sql
-- Test that anyone can read
SET ROLE anon;
SELECT * FROM public.rankings LIMIT 5;
RESET ROLE;

-- Test that anyone can insert
SET ROLE anon;
INSERT INTO public.rankings (name, score, meta) 
VALUES ('Test', 8, '{"total": 10, "mode": "Básico"}'::jsonb);
RESET ROLE;
```

## Security Considerations

### Best Practices

1. **Never commit credentials**: Always use environment variables
2. **Use ANON key only**: Never expose the SERVICE_ROLE key in client-side code
3. **Enable RLS**: Row Level Security is enabled by default in the migration
4. **Rate Limiting**: Consider implementing:
   - Rate limiting in your application code
   - Supabase Edge Functions for validation
   - Cloudflare or Vercel rate limiting

### Optional: Add Score Validation

To prevent cheating, consider creating a Supabase Edge Function:

```typescript
// supabase/functions/submit-score/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { name, score, meta } = await req.json()
  
  // Validate score is within reasonable bounds
  const maxScore = meta.mode === 'Básico' ? 10 : 15
  if (score < 0 || score > maxScore) {
    return new Response(
      JSON.stringify({ error: 'Invalid score' }), 
      { status: 400 }
    )
  }
  
  // Save to database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase
    .from('rankings')
    .insert([{ name, score, meta }])
  
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ data }), { status: 200 })
})
```

### Monitoring

1. **Enable Supabase Logs**: Go to Logs section in dashboard
2. **Set up Alerts**: Configure email alerts for unusual activity
3. **Regular Backups**: Supabase Pro includes daily backups

## Troubleshooting

### "Supabase client not initialized"
- Check that environment variables are set correctly
- Verify the variable names match (SUPABASE_URL, SUPABASE_ANON_KEY)
- Check browser console for specific error messages

### "Failed to save score"
- Check RLS policies are enabled
- Verify the table exists: `SELECT * FROM public.rankings LIMIT 1;`
- Check Supabase dashboard logs for errors

### "No scores showing"
- Verify data exists: Check Table Editor
- Check network tab for failed requests
- Verify API key is correct

### CORS Errors
- Supabase handles CORS automatically
- If you see CORS errors, check that the URL is correct
- Verify you're using the anon key, not service role key

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

For issues specific to this integration:
1. Check the browser console for errors
2. Review Supabase dashboard logs
3. Verify environment variables are set
4. Contact the project maintainers at CEIP RÍA DE VIGO or Pictorica.es
