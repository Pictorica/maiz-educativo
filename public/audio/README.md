# Audio Files for Quiz

This directory should contain the following audio files:

## Required Files

1. **bg-loop.mp3** - Background music (looping)
   - Format: MP3
   - Recommended: Low-tempo chiptune or soft ambient music
   - Duration: 30-60 seconds (will loop)
   - Volume will be set low automatically (30%)

2. **correct.wav** - Sound effect for correct answers
   - Format: WAV or MP3
   - Recommended: Cheerful ding, bell, or success sound
   - Duration: 0.5-2 seconds

3. **wrong.wav** - Sound effect for wrong answers
   - Format: WAV or MP3
   - Recommended: Gentle buzzer or "oops" sound
   - Duration: 0.5-2 seconds

4. **finish.mp3** - Sound effect for quiz completion
   - Format: MP3
   - Recommended: Victory fanfare or celebration music
   - Duration: 2-5 seconds

## Where to Find Free Audio

All audio files must be free to use for educational projects. Here are recommended sources:

### 1. **OpenGameArt.org**
   - URL: https://opengameart.org/
   - Filter by: Music, Sound Effects
   - License: Look for CC0 (Public Domain) or CC-BY
   - Great for: Chiptune loops, game sound effects

### 2. **FreeSound.org**
   - URL: https://freesound.org/
   - Filter by: License (CC0 or CC-BY)
   - Great for: Sound effects (dings, buzzers, bells)
   - Note: Requires free account

### 3. **Free Music Archive (FMA)**
   - URL: https://freemusicarchive.org/
   - Filter by: License (CC0 or CC-BY)
   - Great for: Background music loops
   - Search terms: "chiptune", "8-bit", "ambient", "loop"

### 4. **Incompetech (by Kevin MacLeod)**
   - URL: https://incompetech.com/music/
   - License: CC-BY (requires attribution)
   - Great for: Professional background music
   - Very popular for educational content

### 5. **Zapsplat**
   - URL: https://www.zapsplat.com/
   - License: Free with attribution
   - Great for: Sound effects
   - Large library of game sound effects

## Recommended Search Terms

For **background music**:
- "chiptune loop"
- "8-bit music loop"
- "ambient loop"
- "educational music"
- "happy background music"

For **sound effects**:
- "correct answer" or "success"
- "wrong answer" or "error"
- "quiz complete" or "victory"
- "bell ding"
- "game over"

## License Compliance

⚠️ **IMPORTANT**: Always check the license of any audio file you download.

For educational projects like this one, the following licenses are generally safe:
- ✅ **CC0 (Public Domain)**: No attribution required
- ✅ **CC-BY**: Attribution required (add to credits)
- ✅ **CC-BY-SA**: Attribution + share-alike
- ❌ **All Rights Reserved**: Do NOT use
- ❌ **Commercial licenses**: Check terms carefully

If using CC-BY licensed audio, add attribution to the footer or credits section.

## File Placement

Place all audio files directly in this directory:
```
public/audio/
  ├── bg-loop.mp3
  ├── correct.wav
  ├── wrong.wav
  └── finish.mp3
```

The quiz will automatically load these files when a user starts the quiz.

## Testing Audio

After adding the files:
1. Open `quiz.html` in a browser
2. Click "Comenzar Quiz" (background music should start)
3. Answer a question correctly (should hear correct.wav)
4. Answer a question incorrectly (should hear wrong.wav)
5. Complete the quiz (should hear finish.mp3)

## Troubleshooting

**Audio not playing?**
- Check browser console for errors
- Verify file names match exactly (case-sensitive)
- Verify files are in the correct directory
- Check file format is supported (MP3, WAV, OGG)
- Try in a different browser
- Ensure autoplay is allowed (may require user interaction first)

**Volume too loud/quiet?**
- Edit `/src/lib/quizAudio.js`
- Adjust volume values in the constructor or setVolume method
