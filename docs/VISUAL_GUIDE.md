# Visual Guide: New Features

## 🎨 Footer Preview

The new educational footer appears at the bottom of the quiz page with the following design:

```
┌─────────────────────────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Yellow border (#f9c74f)
│                                                               │
│  Proyecto realizado por Josefina Castillo, Andrea Castro     │ ← Yellow text, bold
│  y Ada Palmeíro – CEIP RÍA DE VIGO.                          │   (#f9c74f)
│                                                               │
│  Tutoría tecnológica: Pictorica.es – para aprender sobre     │ ← Light green text
│  el maíz y sobre el uso de herramientas actuales como IA,    │   (#e8f5e9)
│  HTML5, JavaScript, CSS, GitHub y Vercel en trabajos         │
│  escolares.                                                   │
│                                                               │
│  Este minisitio fue creado como ejercicio educativo para     │ ← Lighter green,
│  combinar ciencia, tecnología y creatividad.                 │   italic (#c8e6c9)
│                                                               │
└─────────────────────────────────────────────────────────────┘
          Green gradient background (#2d5016 → #4a7c2c)
```

**Colors:**
- Background: Green gradient (dark to medium green)
- Border: Golden yellow (#f9c74f)
- Main credits: Yellow (#f9c74f) - Bold
- Tutoring text: Light green (#e8f5e9)
- Description: Lighter green (#c8e6c9) - Italic

## 🎵 Audio Flow

### User Journey with Audio

```
1. User opens quiz.html
   ├─ Page loads
   ├─ Audio NOT started (autoplay blocked)
   └─ Waiting for first interaction...

2. User clicks "Comenzar Quiz" ← FIRST INTERACTION
   ├─ Background music starts (bg-loop.mp3)
   │  └─ Loops continuously at 30% volume
   ├─ Quiz screen appears
   └─ Timer starts

3. User selects answer
   ├─ If correct → playCorrect() → correct.wav plays
   ├─ If wrong → playWrong() → wrong.wav plays
   └─ Feedback shown

4. User completes quiz
   ├─ playFinish() → finish.mp3 plays
   ├─ Background music continues
   └─ Results screen shown

5. Optional: User clicks "Intentar de nuevo"
   ├─ Background music still playing
   └─ Quiz restarts
```

### Audio File Requirements

```
public/audio/
├── bg-loop.mp3       ← 30-60s seamless loop, ~128kbps, -3dB to -6dB
├── correct.wav       ← 0.5-2s, normalized to 0dB
├── wrong.wav         ← 0.5-2s, normalized to 0dB
└── finish.mp3        ← 2-5s, celebration sound
```

## ☁️ Supabase Data Flow

### Without Configuration

```
User completes quiz
  │
  ├─ saveScoreToSupabase() called
  ├─ SupabaseRankings.isReady() returns false
  ├─ Console: "Supabase not available, skipping cloud save"
  │
  └─ saveToRanking() ← Falls back to localStorage
     └─ Saved to: localStorage['maizQuizRanking']
```

### With Configuration

```
User completes quiz
  │
  ├─ saveScoreToSupabase() called
  ├─ SupabaseRankings.isReady() returns true
  │
  ├─ INSERT INTO rankings (name, score, meta)
  │  VALUES ('Player', 8, {"mode": "Básico", "total": 10, ...})
  │
  ├─ Success: "✅ Score saved to Supabase cloud rankings"
  │
  └─ ALSO saved to localStorage (dual save)
```

### Supabase Table Structure

```sql
rankings table:
┌──────────────────────────────────────┬──────────┬───────┬────────────────────┬─────────────────────┐
│ id (uuid)                            │ name     │ score │ meta (jsonb)       │ created_at          │
├──────────────────────────────────────┼──────────┼───────┼────────────────────┼─────────────────────┤
│ a1b2c3d4-e5f6-7890-abcd-ef1234567890 │ Juan     │ 10    │ {"mode":"Experto"} │ 2025-11-19 12:30:00 │
│ b2c3d4e5-f6a7-8901-bcde-f12345678901 │ María    │ 9     │ {"mode":"Básico"}  │ 2025-11-19 12:35:00 │
│ c3d4e5f6-a7b8-9012-cdef-123456789012 │ Pedro    │ 8     │ {"mode":"Básico"}  │ 2025-11-19 12:40:00 │
└──────────────────────────────────────┴──────────┴───────┴────────────────────┴─────────────────────┘
```

## 🔄 Quiz Integration Points

### quiz.html - Script Loading Order

```html
<!-- 1. Supabase SDK from CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Configuration -->
<script src="config.js"></script>

<!-- 3. Audio Manager -->
<script src="js/quiz-audio.js"></script>

<!-- 4. Supabase Rankings Client -->
<script src="js/supabase-rankings.js"></script>

<!-- 5. Initialize Supabase -->
<script>
  if (window.CONFIG && window.CONFIG.SUPABASE_URL) {
    window.SupabaseRankings.init(
      window.CONFIG.SUPABASE_URL,
      window.CONFIG.SUPABASE_ANON_KEY
    );
  }
</script>

<!-- 6. Main Quiz Logic -->
<script src="js/quiz-typeform.js" defer></script>
```

### quiz-typeform.js - Integration Points

```javascript
// 1. Start Quiz - Audio starts
function startQuiz() {
  window.QuizAudio.startBackgroundMusic(); // ← NEW
  // ... existing code
}

// 2. Select Option - Sound effects
function selectOption(optionValue) {
  // ... existing code
  playSound(isCorrect ? 'correct' : 'wrong'); // ← UPDATED
}

// 3. Play Sound - Uses QuizAudio
function playSound(type) {
  if (typeof window.QuizAudio !== 'undefined') {
    if (type === 'correct') {
      window.QuizAudio.playCorrect(); // ← NEW
    } else {
      window.QuizAudio.playWrong(); // ← NEW
    }
  }
}

// 4. Finish Quiz - Save to Supabase
async function finishQuiz() {
  window.QuizAudio.playFinish(); // ← NEW
  // ... calculate results
  saveToRanking(entry);
  saveScoreToSupabase(entry); // ← NEW
}

// 5. Save to Supabase - NEW FUNCTION
async function saveScoreToSupabase(entry) {
  if (window.SupabaseRankings.isReady()) {
    const result = await window.SupabaseRankings.saveScore({
      name: entry.name,
      score: entry.score,
      meta: { mode: entry.mode, total: entry.total, ... }
    });
  }
}
```

## 📱 Responsive Behavior

### Desktop (1920px+)
```
┌─────────────────────────────────────────────────────────────┐
│                       QUIZ CONTENT                            │
│                                                               │
│  [ Large font sizes, spacious layout ]                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              EDUCATIONAL FOOTER                               │
│  Max-width: 800px, centered                                   │
│  Font: 1rem / 0.95rem / 0.9rem                               │
│  Padding: 2rem                                                │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (375px)
```
┌─────────────────────┐
│   QUIZ CONTENT      │
│                     │
│  [ Smaller fonts,   │
│    compact layout ] │
│                     │
└─────────────────────┘
┌─────────────────────┐
│ EDUCATIONAL FOOTER  │
│  Full width         │
│  Font: 0.95/0.875rem│
│  Padding: 1.5rem    │
│                     │
│  Text wraps nicely  │
└─────────────────────┘
```

## 🛠️ Configuration Files

### Development Setup

```
maiz-educativo/
├── config.example.js       ← Template (committed)
│   const CONFIG = {
│     SUPABASE_URL: '',
│     SUPABASE_ANON_KEY: ''
│   };
│
└── config.js              ← Actual config (gitignored)
    const CONFIG = {
      SUPABASE_URL: 'https://xyz.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGc...'
    };
```

### Production (Vercel)

```
Vercel Dashboard
└── Environment Variables
    ├── SUPABASE_URL: https://xyz.supabase.co
    └── SUPABASE_ANON_KEY: eyJhbGc...

Note: For static sites, you may need a build step
to inject these variables, or use Edge Functions.
```

## 🎯 User Experience Flow

```
User opens quiz.html
  │
  ├─ Sees setup screen with name input and mode selection
  │
  ├─ Clicks "Comenzar Quiz"
  │  ├─ 🎵 Background music starts (seamless loop)
  │  ├─ Timer starts (30 seconds)
  │  └─ First question appears
  │
  ├─ Answers questions
  │  ├─ Correct → ✅ "ding" sound + green feedback
  │  └─ Wrong → ❌ "buzz" sound + red feedback
  │
  ├─ Completes all questions
  │  ├─ 🎉 Finish sound plays
  │  ├─ Background music continues
  │  └─ Results screen shows
  │
  ├─ Sees results
  │  ├─ Score: 8/10 (80%)
  │  ├─ Ranking (local + cloud if configured)
  │  └─ Options to retry or go home
  │
  └─ Scrolls down
     └─ Sees beautiful educational footer with credits
```

## 📊 Console Messages

### Successful Initialization

```
✅ Supabase client initialized successfully
🎵 Background music started
✅ Score saved to Supabase: [{...}]
✅ Fetched 10 rankings from Supabase
```

### Without Configuration

```
ℹ️ Supabase credentials not configured. Cloud rankings disabled. 
   See docs/INTEGRATION_SUPABASE.md
Supabase not available, skipping cloud save
⚠️ Could not start background music (autoplay may be blocked)
```

### Errors (Graceful)

```
⚠️ Could not save to cloud rankings: [error message]
⚠️ Could not play correct sound: [error message]
Supabase not configured, returning empty rankings
```

## 🎨 Color Palette

```
Educational Footer:
  Background Gradient: #2d5016 → #4a7c2c (dark green → medium green)
  Border Top: #f9c74f (golden yellow)
  Credits Text: #f9c74f (golden yellow)
  Tutoring Text: #e8f5e9 (light green)
  Description: #c8e6c9 (lighter green)

Quiz Theme (existing):
  Primary: Corn yellow/green theme
  Correct: Green (#4caf50)
  Wrong: Red (#f44336)
  Timer Warning: Orange/Red
```

## 🔐 Security Visualization

```
Repository (GitHub)
├── ✅ config.example.js (template - safe to commit)
├── ❌ config.js (gitignored - never committed)
├── ❌ .env (gitignored - never committed)
└── ✅ All other files (no secrets)

Supabase Integration
├── Frontend (quiz.html)
│   └── Uses: ANON key (public, safe to expose)
│
└── Backend (Supabase Dashboard)
    ├── RLS Policies: Control who can read/write
    └── SERVICE_ROLE key: Never exposed to frontend
```

## 📈 Performance

```
Page Load:
├── HTML: ~15KB
├── CSS: ~5KB
├── JavaScript: ~15KB
├── Supabase SDK (CDN): ~50KB (cached)
└── Total: ~85KB (gzipped much smaller)

Audio Files (when present):
├── bg-loop.mp3: ~500KB - 2MB (streams, not blocking)
├── correct.wav: ~50KB
├── wrong.wav: ~50KB
└── finish.mp3: ~200KB

Runtime:
├── Memory: <10MB
├── Timer interval: 1000ms (pauses when not needed)
├── Audio instances: 4 total
└── No memory leaks (timers properly cleared)
```

---

This visual guide helps understand the implementation without running the code. For actual testing, see `docs/MANUAL_TESTING_GUIDE.md`.
