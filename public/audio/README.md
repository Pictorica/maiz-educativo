# Audio Files for Quiz

This directory should contain the following audio files for the quiz:

## Required Files

1. **bg-loop.mp3** - Background music (looping chiptune/ambient music)
2. **correct.wav** - Sound effect for correct answers
3. **wrong.wav** - Sound effect for wrong answers  
4. **finish.mp3** - Sound effect when quiz is completed

## Free Audio Resources

Since we cannot include audio files directly in the repository due to licensing and size constraints, here are recommended sources for **free, legal audio** you can use:

### 1. OpenGameArt
- **URL:** https://opengameart.org/
- **License:** Various (CC0, CC-BY 3.0, CC-BY 4.0, etc.)
- **Recommended for:** Chiptune music, retro sound effects
- **Search terms:** "chiptune loop", "correct sound", "wrong sound", "victory fanfare"

**Example Collections:**
- Chiptune/8-bit music: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&field_art_licenses_tid=All&sort_by=count&sort_order=DESC
- Sound effects: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13

### 2. FreeSound
- **URL:** https://freesound.org/
- **License:** CC0, CC-BY, CC-BY-NC
- **Recommended for:** Sound effects and loops
- **Note:** Requires free account to download

**Search suggestions:**
- "correct answer"
- "wrong buzzer" 
- "game over"
- "background loop music"

### 3. Free Music Archive
- **URL:** https://freemusicarchive.org/
- **License:** Various Creative Commons licenses
- **Recommended for:** Background music
- **Genre:** Chiptune, Electronic, Ambient

### 4. ZapSplat
- **URL:** https://www.zapsplat.com/
- **License:** Free for personal and commercial use (with attribution)
- **Recommended for:** Game sound effects

## How to Add Audio Files

1. Download audio files from the sources above
2. Ensure files are named exactly as listed above:
   - `bg-loop.mp3`
   - `correct.wav`
   - `wrong.wav`
   - `finish.mp3`
3. Place them in the `public/audio/` directory
4. If using CC-BY licensed audio, add attribution in a separate `AUDIO_CREDITS.txt` file

## Audio Specifications

For best performance:

- **Background music (bg-loop.mp3):**
  - Format: MP3
  - Bitrate: 128 kbps or lower
  - Duration: 30-60 seconds (seamlessly looping)
  - Volume: Normalized to -3dB to -6dB

- **Sound effects (.wav files):**
  - Format: WAV or MP3
  - Duration: 0.5-2 seconds
  - Volume: Normalized to 0dB

## Example Attribution

If using CC-BY licensed content, create `AUDIO_CREDITS.txt`:

```
Audio Credits:

- bg-loop.mp3: "Chiptune Loop" by [Artist Name]
  License: CC-BY 4.0
  Source: https://opengameart.org/...

- correct.wav: "Success Sound" by [Artist Name]
  License: CC0 (Public Domain)
  Source: https://freesound.org/...

- wrong.wav: "Error Buzz" by [Artist Name]
  License: CC-BY 3.0
  Source: https://freesound.org/...

- finish.mp3: "Victory Fanfare" by [Artist Name]
  License: CC-BY 4.0
  Source: https://opengameart.org/...
```

## License Compatibility

Ensure audio files are compatible with your project:
- ✅ CC0 (Public Domain) - No attribution required
- ✅ CC-BY - Attribution required
- ✅ CC-BY-SA - Attribution required, share-alike
- ⚠️ CC-BY-NC - Non-commercial use only (check project license)
- ❌ Proprietary/Copyrighted - Do NOT use without permission
