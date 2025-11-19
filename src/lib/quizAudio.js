/**
 * Quiz Audio Manager
 * Handles background music and sound effects for the quiz
 */

// Audio instances
let bgAudio = null;
let correctAudio = null;
let wrongAudio = null;
let finishAudio = null;

// State
let isAudioInitialized = false;
let isBgMusicPlaying = false;

/**
 * Initialize audio files
 * Call this after first user interaction to avoid autoplay restrictions
 */
function initializeAudio() {
  if (isAudioInitialized) return;

  try {
    // Background music (loop)
    bgAudio = new Audio('/audio/bg-loop.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.3; // Low volume for background music

    // Sound effects
    correctAudio = new Audio('/audio/correct.wav');
    correctAudio.volume = 0.5;

    wrongAudio = new Audio('/audio/wrong.wav');
    wrongAudio.volume = 0.5;

    finishAudio = new Audio('/audio/finish.mp3');
    finishAudio.volume = 0.6;

    isAudioInitialized = true;
  } catch (error) {
    console.warn('Error initializing audio:', error);
  }
}

/**
 * Start background music
 * Should be called on first user interaction (e.g., clicking "Comenzar")
 */
export function startBackgroundMusic() {
  if (!isAudioInitialized) {
    initializeAudio();
  }

  if (!bgAudio || isBgMusicPlaying) return;

  bgAudio.play()
    .then(() => {
      isBgMusicPlaying = true;
      console.log('Background music started');
    })
    .catch((error) => {
      console.warn('Could not start background music (autoplay may be blocked):', error);
      // This is expected on some browsers - user needs to interact first
    });
}

/**
 * Stop background music
 */
export function stopBackgroundMusic() {
  if (!bgAudio || !isBgMusicPlaying) return;

  bgAudio.pause();
  bgAudio.currentTime = 0;
  isBgMusicPlaying = false;
  console.log('Background music stopped');
}

/**
 * Play correct answer sound effect
 */
export function playCorrect() {
  if (!isAudioInitialized) {
    initializeAudio();
  }

  if (!correctAudio) return;

  correctAudio.currentTime = 0;
  correctAudio.play()
    .catch((error) => {
      console.warn('Could not play correct sound:', error);
    });
}

/**
 * Play wrong answer sound effect
 */
export function playWrong() {
  if (!isAudioInitialized) {
    initializeAudio();
  }

  if (!wrongAudio) return;

  wrongAudio.currentTime = 0;
  wrongAudio.play()
    .catch((error) => {
      console.warn('Could not play wrong sound:', error);
    });
}

/**
 * Play quiz finish sound
 */
export function playFinish() {
  if (!isAudioInitialized) {
    initializeAudio();
  }

  if (!finishAudio) return;

  finishAudio.currentTime = 0;
  finishAudio.play()
    .catch((error) => {
      console.warn('Could not play finish sound:', error);
    });
}

/**
 * Set background music volume (0.0 to 1.0)
 */
export function setBgVolume(volume) {
  if (bgAudio) {
    bgAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Set sound effects volume (0.0 to 1.0)
 */
export function setSfxVolume(volume) {
  const vol = Math.max(0, Math.min(1, volume));
  if (correctAudio) correctAudio.volume = vol;
  if (wrongAudio) wrongAudio.volume = vol;
  if (finishAudio) finishAudio.volume = vol;
}

/**
 * Check if audio is supported
 */
export function isAudioSupported() {
  return typeof Audio !== 'undefined';
}
