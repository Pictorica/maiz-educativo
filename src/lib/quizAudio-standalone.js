/**
 * Quiz Audio Manager for Maiz Educativo (Plain JavaScript Version)
 * Handles background music and sound effects for the quiz
 * 
 * Audio files should be placed in: public/audio/
 * Required files:
 * - bg-loop.mp3: Background music (looping)
 * - correct.wav: Sound effect for correct answers
 * - wrong.wav: Sound effect for wrong answers
 * - finish.mp3: Sound effect for quiz completion
 */

(function(window) {
  'use strict';

  // Audio file paths (relative to root)
  const AUDIO_PATHS = {
    background: '/audio/bg-loop.mp3',
    correct: '/audio/correct.wav',
    wrong: '/audio/wrong.wav',
    finish: '/audio/finish.mp3'
  };

  // Audio instances
  const audioInstances = {
    background: null,
    correct: null,
    wrong: null,
    finish: null
  };

  // State
  let isBackgroundMusicPlaying = false;
  let audioInitialized = false;

  /**
   * Initialize audio instances
   * Called automatically on first use
   */
  function initializeAudio() {
    if (audioInitialized) return;

    try {
      // Create background music instance
      audioInstances.background = new Audio(AUDIO_PATHS.background);
      audioInstances.background.loop = true;
      audioInstances.background.volume = 0.3; // Low volume for background music

      // Create sound effect instances
      audioInstances.correct = new Audio(AUDIO_PATHS.correct);
      audioInstances.correct.volume = 0.5;

      audioInstances.wrong = new Audio(AUDIO_PATHS.wrong);
      audioInstances.wrong.volume = 0.5;

      audioInstances.finish = new Audio(AUDIO_PATHS.finish);
      audioInstances.finish.volume = 0.6;

      audioInitialized = true;
      console.log('✅ Quiz audio initialized successfully');
    } catch (error) {
      console.warn('⚠️ Error initializing audio:', error);
      console.warn('Audio files may be missing. Check public/audio/ directory.');
    }
  }

  /**
   * Start playing background music
   * Must be called after user interaction due to browser autoplay policies
   * @returns {Promise<boolean>} - Returns true if music started successfully
   */
  async function startBackgroundMusic() {
    initializeAudio();

    if (!audioInstances.background) {
      console.warn('Background music not available');
      return false;
    }

    if (isBackgroundMusicPlaying) {
      console.log('Background music already playing');
      return true;
    }

    try {
      // Try to play the background music
      await audioInstances.background.play();
      isBackgroundMusicPlaying = true;
      console.log('🎵 Background music started');
      return true;
    } catch (error) {
      // Handle autoplay rejection
      console.warn('⚠️ Autoplay was prevented. Background music will start after user interaction.');
      
      // Try again on next user interaction
      const playOnInteraction = async () => {
        try {
          await audioInstances.background.play();
          isBackgroundMusicPlaying = true;
          console.log('🎵 Background music started after user interaction');
          // Remove listener after successful play
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        } catch (err) {
          console.warn('Still unable to play background music:', err);
        }
      };

      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      
      return false;
    }
  }

  /**
   * Stop background music
   */
  function stopBackgroundMusic() {
    if (!audioInstances.background) return;

    try {
      audioInstances.background.pause();
      audioInstances.background.currentTime = 0;
      isBackgroundMusicPlaying = false;
      console.log('⏹️ Background music stopped');
    } catch (error) {
      console.warn('Error stopping background music:', error);
    }
  }

  /**
   * Play correct answer sound effect
   */
  function playCorrect() {
    initializeAudio();

    if (!audioInstances.correct) {
      console.warn('Correct sound effect not available');
      return;
    }

    try {
      // Reset to start and play
      audioInstances.correct.currentTime = 0;
      audioInstances.correct.play().catch(err => {
        console.warn('Unable to play correct sound:', err);
      });
    } catch (error) {
      console.warn('Error playing correct sound:', error);
    }
  }

  /**
   * Play wrong answer sound effect
   */
  function playWrong() {
    initializeAudio();

    if (!audioInstances.wrong) {
      console.warn('Wrong sound effect not available');
      return;
    }

    try {
      // Reset to start and play
      audioInstances.wrong.currentTime = 0;
      audioInstances.wrong.play().catch(err => {
        console.warn('Unable to play wrong sound:', err);
      });
    } catch (error) {
      console.warn('Error playing wrong sound:', error);
    }
  }

  /**
   * Play quiz finish sound effect
   */
  function playFinish() {
    initializeAudio();

    if (!audioInstances.finish) {
      console.warn('Finish sound effect not available');
      return;
    }

    try {
      // Reset to start and play
      audioInstances.finish.currentTime = 0;
      audioInstances.finish.play().catch(err => {
        console.warn('Unable to play finish sound:', err);
      });
    } catch (error) {
      console.warn('Error playing finish sound:', error);
    }
  }

  /**
   * Check if background music is currently playing
   * @returns {boolean}
   */
  function isBackgroundPlaying() {
    return isBackgroundMusicPlaying;
  }

  /**
   * Set background music volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  function setBackgroundVolume(volume) {
    if (!audioInstances.background) return;
    
    try {
      audioInstances.background.volume = Math.max(0, Math.min(1, volume));
    } catch (error) {
      console.warn('Error setting volume:', error);
    }
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  function setSoundEffectsVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    try {
      if (audioInstances.correct) audioInstances.correct.volume = clampedVolume;
      if (audioInstances.wrong) audioInstances.wrong.volume = clampedVolume;
      if (audioInstances.finish) audioInstances.finish.volume = clampedVolume;
    } catch (error) {
      console.warn('Error setting sound effects volume:', error);
    }
  }

  // Export functions to window object for use in other scripts
  window.MaizAudio = {
    startBackgroundMusic,
    stopBackgroundMusic,
    playCorrect,
    playWrong,
    playFinish,
    isBackgroundPlaying,
    setBackgroundVolume,
    setSoundEffectsVolume
  };

})(window);
