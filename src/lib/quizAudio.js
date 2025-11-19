/**
 * Quiz Audio Manager
 * Handles background music and sound effects for the quiz
 * 
 * Audio files should be placed in /public/audio/ or /audio/:
 * - bg-loop.mp3: Background music (looping)
 * - correct.wav: Sound when answer is correct
 * - wrong.wav: Sound when answer is wrong
 * - finish.mp3: Sound when quiz is completed
 */

class QuizAudio {
  constructor() {
    this.audioPath = '/audio/';
    this.sounds = {
      background: null,
      correct: null,
      wrong: null,
      finish: null
    };
    this.isInitialized = false;
    this.isMuted = false;
    
    // Don't load audio until first user interaction (autoplay policy)
    this.loadAudioFiles();
  }

  /**
   * Load all audio files
   */
  loadAudioFiles() {
    try {
      // Background music (looping)
      this.sounds.background = new Audio(`${this.audioPath}bg-loop.mp3`);
      this.sounds.background.loop = true;
      this.sounds.background.volume = 0.3; // Low volume for background
      
      // Sound effects
      this.sounds.correct = new Audio(`${this.audioPath}correct.wav`);
      this.sounds.correct.volume = 0.6;
      
      this.sounds.wrong = new Audio(`${this.audioPath}wrong.wav`);
      this.sounds.wrong.volume = 0.6;
      
      this.sounds.finish = new Audio(`${this.audioPath}finish.mp3`);
      this.sounds.finish.volume = 0.7;
      
      // Add error handlers
      Object.keys(this.sounds).forEach(key => {
        if (this.sounds[key]) {
          this.sounds[key].addEventListener('error', (e) => {
            console.warn(`⚠️ Could not load audio file: ${key}`, e);
          });
        }
      });
      
      console.log('✅ Audio files loaded (ready to play on user interaction)');
    } catch (error) {
      console.error('❌ Error loading audio files:', error);
    }
  }

  /**
   * Start background music
   * Should be called on first user interaction (click, touch, etc.)
   * @returns {Promise<void>}
   */
  async startBackgroundMusic() {
    if (!this.sounds.background || this.isMuted) {
      return;
    }

    try {
      // Reset to beginning if already playing
      this.sounds.background.currentTime = 0;
      
      await this.sounds.background.play();
      this.isInitialized = true;
      console.log('🎵 Background music started');
    } catch (error) {
      // This is expected if user hasn't interacted yet (autoplay policy)
      if (error.name === 'NotAllowedError') {
        console.log('ℹ️ Background music blocked by autoplay policy. Will start on user interaction.');
      } else {
        console.warn('⚠️ Could not start background music:', error.message);
      }
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.sounds.background) {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
      console.log('🔇 Background music stopped');
    }
  }

  /**
   * Play correct answer sound effect
   * @returns {Promise<void>}
   */
  async playCorrect() {
    if (!this.sounds.correct || this.isMuted) {
      return;
    }

    try {
      this.sounds.correct.currentTime = 0;
      await this.sounds.correct.play();
      console.log('✅ Played correct sound');
    } catch (error) {
      console.warn('⚠️ Could not play correct sound:', error.message);
    }
  }

  /**
   * Play wrong answer sound effect
   * @returns {Promise<void>}
   */
  async playWrong() {
    if (!this.sounds.wrong || this.isMuted) {
      return;
    }

    try {
      this.sounds.wrong.currentTime = 0;
      await this.sounds.wrong.play();
      console.log('❌ Played wrong sound');
    } catch (error) {
      console.warn('⚠️ Could not play wrong sound:', error.message);
    }
  }

  /**
   * Play finish sound effect
   * Stops background music and plays completion sound
   * @returns {Promise<void>}
   */
  async playFinish() {
    // Stop background music first
    this.stopBackgroundMusic();
    
    if (!this.sounds.finish || this.isMuted) {
      return;
    }

    try {
      this.sounds.finish.currentTime = 0;
      await this.sounds.finish.play();
      console.log('🎉 Played finish sound');
    } catch (error) {
      console.warn('⚠️ Could not play finish sound:', error.message);
    }
  }

  /**
   * Toggle mute state
   * @param {boolean} mute - Whether to mute (true) or unmute (false)
   */
  setMuted(mute) {
    this.isMuted = mute;
    
    if (mute && this.sounds.background) {
      this.sounds.background.pause();
    }
    
    console.log(mute ? '🔇 Audio muted' : '🔊 Audio unmuted');
  }

  /**
   * Set volume for all sounds
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.sounds.background) {
      this.sounds.background.volume = clampedVolume * 0.3; // Background is quieter
    }
    if (this.sounds.correct) {
      this.sounds.correct.volume = clampedVolume * 0.6;
    }
    if (this.sounds.wrong) {
      this.sounds.wrong.volume = clampedVolume * 0.6;
    }
    if (this.sounds.finish) {
      this.sounds.finish.volume = clampedVolume * 0.7;
    }
    
    console.log(`🔊 Volume set to ${Math.round(clampedVolume * 100)}%`);
  }

  /**
   * Clean up audio resources
   */
  destroy() {
    this.stopBackgroundMusic();
    
    Object.keys(this.sounds).forEach(key => {
      if (this.sounds[key]) {
        this.sounds[key].pause();
        this.sounds[key] = null;
      }
    });
    
    console.log('🗑️ Audio resources cleaned up');
  }
}

// Export singleton instance
export const quizAudio = new QuizAudio();

// Export class for custom instances if needed
export default QuizAudio;
