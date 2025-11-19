# Supabase Integration Guide

This document explains how to integrate Supabase for storing quiz rankings in the Maiz Educativo project.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Supabase Project Setup](#supabase-project-setup)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Frontend Integration](#frontend-integration)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses Supabase as a backend-as-a-service to store quiz rankings. The integration includes:
- A PostgreSQL database table for storing scores
- Row Level Security (RLS) policies for access control
- A JavaScript client for interacting with the database
- Environment variables for secure configuration

## Prerequisites

Before starting, ensure you have:
- A Supabase account (free tier is sufficient)
- Node.js and npm installed (for package management)
- A code editor
- Access to deploy environment (Vercel, Netlify, etc.)

## Supabase Project Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the details:
   - **Name**: `maiz-educativo`
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

### 2. Get Your API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (a long string)

⚠️ **IMPORTANT**: 
- The **anon public** key is safe to use in frontend code (when RLS is enabled)
- The **service_role** key should NEVER be used in frontend code
- Never commit these keys to your repository

## Database Setup

### 1. Create the Rankings Table

1. In your Supabase project dashboard, click on **SQL Editor** in the sidebar
2. Click **New Query**
3. Open the file `db/supabase_rankings.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will:
- Enable the `pgcrypto` extension for UUID generation
- Create the `rankings` table with proper columns and constraints
- Create indexes for efficient querying
- Add comments and examples for RLS policies

### 2. Enable Row Level Security (RLS)

For production use, you should enable RLS to control access:

1. In the SQL Editor, run the following commented-out section from the migration file:

```sql
-- Enable RLS on the table
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert scores
CREATE POLICY "Anyone can insert rankings" ON public.rankings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anyone to read rankings
CREATE POLICY "Anyone can read rankings" ON public.rankings
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Prevent updates
CREATE POLICY "No one can update rankings" ON public.rankings
  FOR UPDATE
  TO anon
  USING (false);

-- Policy: Prevent deletes
CREATE POLICY "No one can delete rankings" ON public.rankings
  FOR DELETE
  TO anon
  USING (false);
```

### 3. Verify Installation

Run this query to verify the table was created:

```sql
SELECT * FROM public.rankings ORDER BY score DESC LIMIT 10;
```

It should return an empty result (no rows yet), which is correct.

## Environment Variables

### Local Development

For local development, you'll need to set environment variables. The approach depends on your build tool:

#### Option A: Using a .env file (Vite, Create React App, etc.)

Create a `.env` file in the root of your project:

```bash
# .env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
```

⚠️ **IMPORTANT**: Add `.env` to your `.gitignore`:

```
# .gitignore
.env
.env.local
.env.*.local
```

#### Option B: Using window.ENV (for plain HTML/JS)

Create a file `env.js` and load it in your HTML:

```javascript
// env.js - DO NOT COMMIT THIS FILE
window.ENV = {
  SUPABASE_URL: 'https://xxxxxxxxxxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGc...your-anon-key-here'
};
```

```html
<!-- In your HTML -->
<script src="/env.js"></script>
<script type="module" src="/src/lib/supabaseClient.js"></script>
```

Add `env.js` to `.gitignore`:

```
# .gitignore
env.js
```

### Production Deployment (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Environment**: Production, Preview, Development (all three)
   
4. Add second variable:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGc...your-anon-key-here`
   - **Environment**: Production, Preview, Development (all three)

5. Redeploy your application for changes to take effect

### Production Deployment (Netlify)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add:
   - `SUPABASE_URL` = `https://xxxxxxxxxxxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGc...your-anon-key-here`
5. Click **Save**
6. Trigger a new deploy

## Frontend Integration

### 1. Install Dependencies

Install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

### 2. Import and Use the Client

The client is already set up in `src/lib/supabaseClient.js`. To use it in your code:

```javascript
import { saveScore, getTopScores, isSupabaseConfigured } from './src/lib/supabaseClient.js';

// Check if Supabase is configured
if (isSupabaseConfigured()) {
  console.log('Supabase is ready!');
}

// Save a score
async function handleQuizComplete(playerName, score, total, mode) {
  const result = await saveScore({
    name: playerName,
    score: score,
    meta: {
      mode: mode,
      total: total,
      percentage: Math.round((score / total) * 100)
    }
  });
  
  if (result.error) {
    console.error('Failed to save score:', result.error);
    // Show error to user
  } else {
    console.log('Score saved!', result.data);
    // Update UI
  }
}

// Get top scores
async function displayRankings() {
  const result = await getTopScores(10);
  
  if (result.error) {
    console.error('Failed to load rankings:', result.error);
    // Fallback to localStorage rankings
  } else {
    console.log('Top scores:', result.data);
    // Display rankings in UI
  }
}
```

### 3. Integrate with Quiz

The quiz integration should:

1. **On quiz start**: No Supabase action needed
2. **On answer**: No Supabase action (use sound effects)
3. **On quiz complete**: 
   - Save score to Supabase
   - Show user feedback (success or error)
   - Load and display updated rankings

Example integration in quiz completion:

```javascript
async function onQuizComplete() {
  // Play finish sound
  await quizAudio.playFinish();
  
  // Save to Supabase
  const saveResult = await saveScore({
    name: playerName,
    score: correctAnswers,
    meta: {
      mode: currentMode,
      total: totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      completedAt: new Date().toISOString()
    }
  });
  
  if (saveResult.error) {
    // Fallback: save to localStorage
    console.warn('Using localStorage fallback');
    saveToLocalStorage(playerName, correctAnswers);
    showMessage('Score saved locally (online features unavailable)');
  } else {
    showMessage('Score saved to global rankings!');
  }
  
  // Load and display rankings
  const rankingsResult = await getTopScores(10);
  if (!rankingsResult.error) {
    displayRankings(rankingsResult.data);
  }
}
```

## Security Considerations

### ✅ Safe Practices

1. **Use the anon key in frontend**: The `anon` public key is designed for frontend use when RLS is enabled
2. **Enable RLS policies**: Always enable Row Level Security on your tables
3. **Validate on frontend**: Check inputs before sending to Supabase
4. **Use environment variables**: Never hardcode API keys in source code
5. **Add rate limiting**: Consider implementing rate limiting for score submissions

### ❌ Dangerous Practices

1. **Never use service_role key in frontend**: This bypasses RLS and gives full database access
2. **Don't commit .env files**: Always add to `.gitignore`
3. **Don't disable RLS without policies**: This would allow anyone to modify/delete data
4. **Don't trust client-side validation alone**: Database constraints provide additional protection

### Recommended: Server-Side Validation

For production applications with sensitive data, consider:

1. Creating a Supabase Edge Function or serverless function
2. Using the service_role key ONLY in server-side code
3. Implementing additional validation and anti-cheat measures
4. Rate limiting at the server level

Example structure:
```
Client → Serverless Function → Supabase (with service_role key)
```

## Testing

### Manual Testing Steps

1. **Test Configuration**
   ```javascript
   import { isSupabaseConfigured } from './src/lib/supabaseClient.js';
   console.log('Configured:', isSupabaseConfigured());
   ```

2. **Test Score Saving**
   - Complete a quiz
   - Check browser console for success message
   - Verify in Supabase dashboard: **Table Editor** → **rankings**

3. **Test Score Retrieval**
   - View rankings page
   - Verify top scores are displayed
   - Check order (highest score first)

4. **Test Error Handling**
   - Temporarily disable internet connection
   - Try to save a score
   - Verify fallback behavior (localStorage)

5. **Test RLS Policies**
   - Try to update a score (should fail if RLS is properly configured)
   - Try to delete a score (should fail if RLS is properly configured)

### Automated Testing (Optional)

Create a test file to verify Supabase integration:

```javascript
// tests/supabase.test.js
import { saveScore, getTopScores } from '../src/lib/supabaseClient.js';

async function testSupabase() {
  // Test save
  const saveResult = await saveScore({
    name: 'Test User',
    score: 10,
    meta: { mode: 'test' }
  });
  
  console.assert(!saveResult.error, 'Save should succeed');
  
  // Test retrieve
  const getResult = await getTopScores(5);
  console.assert(!getResult.error, 'Get should succeed');
  console.assert(getResult.data.length > 0, 'Should have at least one score');
  
  console.log('✅ All tests passed!');
}

testSupabase();
```

## Troubleshooting

### Issue: "Supabase not configured" warning

**Cause**: Environment variables are not set correctly.

**Solution**:
1. Verify `.env` file exists and has correct values
2. Restart your development server
3. Check that variable names match exactly (including prefixes like `VITE_`)
4. For plain HTML, verify `env.js` is loaded before the client

### Issue: "Failed to save score" error

**Possible causes**:
1. **RLS is blocking the request**: Verify RLS policies are set up correctly
2. **Network error**: Check internet connection
3. **Invalid data**: Check that score is a number, name is not empty
4. **API key is wrong**: Verify you're using the correct anon key

**Debug steps**:
1. Open browser DevTools → Network tab
2. Look for failed requests to Supabase
3. Check the response for error details
4. Verify in Supabase dashboard → API → Logs

### Issue: Scores not appearing in rankings

**Possible causes**:
1. **RLS SELECT policy missing**: Users can't read the data
2. **Incorrect query order**: Check `ORDER BY` clause
3. **Data not saved**: Verify insert was successful

**Solution**:
1. Check Supabase dashboard → Table Editor
2. Verify data exists in the table
3. Run manual SQL query: `SELECT * FROM rankings ORDER BY score DESC LIMIT 10;`
4. Verify RLS policies allow SELECT

### Issue: CORS errors

**Cause**: Supabase project URL is not in allowed origins.

**Solution**:
1. Go to Supabase dashboard → Authentication → URL Configuration
2. Add your deployment URL to "Site URL"
3. Add your deployment URL to "Redirect URLs"

### Issue: Performance problems with large datasets

**Solution**:
1. Verify indexes are created (check migration file)
2. Limit results with `.limit()` in queries
3. Consider pagination for very large datasets
4. Add a cleanup policy for old scores

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase YouTube Channel](https://www.youtube.com/c/Supabase)

## Support

For issues specific to this integration:
1. Check this documentation
2. Review browser console errors
3. Check Supabase dashboard logs
4. Contact the project maintainers

For Supabase-specific issues:
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
