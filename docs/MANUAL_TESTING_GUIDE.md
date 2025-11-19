# Manual Testing Guide

This document provides step-by-step instructions for manually testing the new features added to the maiz-educativo quiz.

## Prerequisites

1. Local web server running (see README.md for options)
2. Modern web browser (Chrome, Firefox, Safari, or Edge)
3. Browser console open (F12) to monitor messages

## Test 1: Basic Quiz Functionality (Without Configuration)

### Purpose
Verify the quiz works normally without Supabase or audio files configured.

### Steps
1. Open http://localhost:8000/quiz.html
2. Open browser console (F12)
3. Verify you see message: "ℹ️ Supabase credentials not configured. Cloud rankings disabled."
4. Enter your name in the input field
5. Select "Básico" mode
6. Click "Comenzar Quiz"
7. Verify quiz starts and shows first question
8. Answer a few questions
9. Navigate back and forth using navigation buttons
10. Complete the quiz

### Expected Results
- ✅ Quiz loads without errors
- ✅ Console shows Supabase not configured (normal)
- ✅ Quiz functions normally
- ✅ Local ranking saves to localStorage
- ✅ Audio warnings in console are expected (files not present)

## Test 2: Audio Integration (With Audio Files)

### Purpose
Test audio playback functionality.

### Preparation
1. Download free audio files from resources in `public/audio/README.md`
2. Place files in `public/audio/`:
   - `bg-loop.mp3`
   - `correct.wav`
   - `wrong.wav`
   - `finish.mp3`

### Steps
1. Open http://localhost:8000/quiz.html
2. Enter name and select mode
3. Click "Comenzar Quiz" - **FIRST USER INTERACTION**
4. Verify background music starts playing (loop)
5. Answer a question correctly
6. Verify "correct" sound effect plays
7. Answer a question incorrectly
8. Verify "wrong" sound effect plays
9. Complete the quiz
10. Verify "finish" sound plays

### Expected Results
- ✅ Background music starts on "Comenzar Quiz" click
- ✅ Background music loops continuously
- ✅ Correct/wrong sound effects play appropriately
- ✅ Finish sound plays when quiz completes
- ✅ Console shows: "🎵 Background music started"

### Troubleshooting
- If no audio plays: Check browser console for errors
- Autoplay blocked: Expected - audio requires user interaction
- Files not found: Verify files exist in `public/audio/`

## Test 3: Supabase Integration (With Configuration)

### Purpose
Test cloud rankings save and retrieval.

### Preparation
1. Create Supabase project (https://supabase.com)
2. Run SQL from `db/supabase_rankings.sql` in Supabase SQL editor
3. Copy `config.example.js` to `config.js`
4. Add your credentials:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: 'https://your-project-id.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-key-here'
   };
   ```

### Steps
1. Open http://localhost:8000/quiz.html
2. Check console for: "✅ Supabase client initialized successfully"
3. Enter name: "Test Player 1"
4. Select "Básico" mode
5. Complete quiz (answer all questions)
6. Check console for: "✅ Score saved to Supabase: [...]"
7. Open Supabase dashboard → Table Editor → `rankings` table
8. Verify your score appears in the table with:
   - `name`: "Test Player 1"
   - `score`: (your score)
   - `meta`: JSON with mode, total, percentage, timestamp

### Expected Results
- ✅ Console shows Supabase initialized
- ✅ After quiz completion, console shows "✅ Score saved to Supabase"
- ✅ Score appears in Supabase dashboard
- ✅ Score also saved to localStorage (fallback)

### Troubleshooting
- "Supabase not configured": Check `config.js` exists and has correct values
- CORS errors: Verify Supabase URL is correct
- Insert fails: Check RLS policies in Supabase (see `docs/INTEGRATION_SUPABASE.md`)

## Test 4: Footer Display

### Purpose
Verify the new educational footer displays correctly.

### Steps
1. Open http://localhost:8000/quiz.html
2. Scroll to bottom of page
3. Verify footer displays with:
   - Green background gradient
   - Yellow border on top
   - Three paragraphs with proper formatting

### Expected Text (Exact)
```
Proyecto realizado por Josefina Castillo, Andrea Castro y Ada Palmeíro – CEIP RÍA DE VIGO.

Tutoría tecnológica: Pictorica.es – para aprender sobre el maíz y sobre el uso de herramientas actuales como IA, HTML5, JavaScript, CSS, GitHub y Vercel en trabajos escolares.

Este minisitio fue creado como ejercicio educativo para combinar ciencia, tecnología y creatividad.
```

### Expected Results
- ✅ Footer visible at bottom
- ✅ Text matches exactly as specified
- ✅ Styling is consistent with site theme
- ✅ Responsive on mobile (test by resizing window)

## Test 5: Full Integration Test

### Purpose
Test all features working together.

### Requirements
- Audio files in place
- Supabase configured

### Steps
1. Open http://localhost:8000/quiz.html
2. Open browser console
3. Enter name: "Integration Test"
4. Select "Experto" mode (15 questions)
5. Click "Comenzar Quiz"
6. Verify background music starts
7. Answer first question correctly → verify sound effect
8. Answer second question incorrectly → verify sound effect
9. Complete all questions
10. Verify finish sound plays
11. Check console for Supabase save confirmation
12. Scroll to footer and verify credits
13. Click "Intentar de nuevo" and verify everything resets

### Expected Results
- ✅ All audio works correctly
- ✅ Score saved to both localStorage and Supabase
- ✅ Footer displays correctly
- ✅ Quiz can be restarted without page reload
- ✅ No JavaScript errors in console

## Test 6: Responsive Design

### Purpose
Verify features work on different screen sizes.

### Steps
1. Open quiz.html
2. Open DevTools and enable device emulation
3. Test on:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
4. Verify:
   - Footer text is readable
   - Audio controls work
   - Quiz layout is functional

### Expected Results
- ✅ Footer text wraps appropriately
- ✅ Font sizes adjust for readability
- ✅ All features functional on all sizes

## Test 7: Browser Compatibility

### Purpose
Verify cross-browser compatibility.

### Browsers to Test
- Chrome/Chromium
- Firefox
- Safari (if available)
- Edge

### Steps
1. Open quiz.html in each browser
2. Verify basic quiz functionality
3. Test audio (if files present)
4. Test Supabase (if configured)
5. Check console for errors

### Expected Results
- ✅ Works in all modern browsers
- ✅ Graceful degradation if features not supported
- ✅ No browser-specific errors

## Test 8: Error Handling

### Purpose
Verify graceful error handling.

### Scenarios to Test

#### 8.1 Missing Audio Files
- Remove audio files from `public/audio/`
- Open quiz and complete it
- Expected: Warnings in console, quiz functions normally

#### 8.2 Invalid Supabase Credentials
- Set incorrect SUPABASE_URL in config.js
- Open quiz and complete it
- Expected: Error in console, falls back to localStorage only

#### 8.3 Network Offline
- Open DevTools → Network tab → Go offline
- Complete quiz with Supabase configured
- Expected: Supabase save fails, localStorage still works

### Expected Results
- ✅ Quiz never crashes
- ✅ Clear error messages in console
- ✅ Fallbacks work (localStorage)
- ✅ User experience not degraded

## Test 9: Data Validation

### Purpose
Verify data is saved correctly.

### Steps
1. Complete quiz with name "Test & Special <chars>"
2. Score: 7 out of 10
3. Check localStorage: `maizQuizRanking`
4. If Supabase configured, check database
5. Verify:
   - Name stored correctly (escaped if needed)
   - Score is correct number
   - Meta includes mode, total, percentage

### Expected Results
- ✅ Special characters handled correctly
- ✅ Numbers stored as integers
- ✅ JSON/JSONB format valid
- ✅ Timestamps are ISO format

## Test 10: Performance

### Purpose
Verify no performance issues.

### Steps
1. Open DevTools → Performance tab
2. Start recording
3. Complete entire quiz
4. Stop recording
5. Review for:
   - Long tasks (> 50ms)
   - Memory leaks
   - Excessive repaints

### Expected Results
- ✅ No blocking tasks
- ✅ Smooth animations
- ✅ No memory leaks (timer intervals cleared)
- ✅ Page remains responsive

## Checklist Summary

After completing all tests, verify:

- [ ] Quiz loads and runs without errors (Test 1)
- [ ] Audio plays correctly when files present (Test 2)
- [ ] Supabase integration saves scores (Test 3)
- [ ] Footer displays with correct text (Test 4)
- [ ] All features work together (Test 5)
- [ ] Responsive on all devices (Test 6)
- [ ] Compatible with major browsers (Test 7)
- [ ] Error handling is graceful (Test 8)
- [ ] Data validation works (Test 9)
- [ ] Performance is acceptable (Test 10)

## Reporting Issues

If you find issues during testing:

1. Note the browser and version
2. Copy full error message from console
3. Describe steps to reproduce
4. Include screenshots if relevant
5. Report in GitHub Issues

## Additional Notes

### Local Development
For local development without Supabase:
- Quiz works with localStorage only
- Console warnings about Supabase are normal
- No impact on functionality

### Production Deployment (Vercel)
For production:
1. Set environment variables in Vercel dashboard
2. Audio files must be in deployment
3. Test thoroughly in preview deployment first

### Security Testing
- Verify no secrets in git history
- Check `.gitignore` excludes sensitive files
- Confirm API keys not in source code
- Test RLS policies prevent unauthorized access (Supabase)
