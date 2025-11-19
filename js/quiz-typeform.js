/**
 * Quiz Typeform - One question at a time with timer
 * Educational project for CEIP RÍA DE VIGO
 */

(function() {
  'use strict';

  // ===== CONSTANTS & CONFIG =====
  const STORAGE_PREFIX = 'maizQuizTypeform:';
  const RANKING_KEY = 'maizQuizRanking'; // Same key as classic quiz
  const DEFAULT_TIMER = 30; // seconds
  
  // ===== STATE =====
  let questions = [];
  let currentQuestionIndex = 0;
  let currentMode = 'basico';
  let playerName = '';
  let answers = {}; // { questionIndex: { selected: 'a', correct: 'b', isCorrect: false } }
  let timerInterval = null;
  let timeRemaining = DEFAULT_TIMER;
  let timerDefault = DEFAULT_TIMER;

  // ===== DOM ELEMENTS =====
  const elements = {
    // Screens
    setupScreen: document.getElementById('setupScreen'),
    questionScreen: document.getElementById('questionScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    
    // Setup
    playerNameInput: document.getElementById('playerNameTypeform'),
    modeButtons: document.querySelectorAll('.mode-btn-typeform'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    
    // Question
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    timerCircle: document.getElementById('timerCircle'),
    timerValue: document.getElementById('timerValue'),
    questionTitle: document.getElementById('questionTitle'),
    optionsContainer: document.getElementById('optionsContainer'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn'),
    
    // Results
    finalScore: document.getElementById('finalScore'),
    finalTotal: document.getElementById('finalTotal'),
    finalPercentage: document.getElementById('finalPercentage'),
    rankingList: document.getElementById('rankingListTypeform'),
    retryBtn: document.getElementById('retryBtn'),
    
    // Data
    questionsData: document.getElementById('questionsData'),
    container: document.querySelector('.quiz-typeform-container')
  };

  // ===== INITIALIZATION =====
  function init() {
    // Get timer default from data attribute
    if (elements.container && elements.container.dataset.timerDefault) {
      timerDefault = parseInt(elements.container.dataset.timerDefault, 10) || DEFAULT_TIMER;
    }
    
    // Load questions from hidden data
    loadQuestions();
    
    // Setup event listeners
    setupEventListeners();
    
    // Try to restore session
    restoreSession();
  }

  // ===== LOAD QUESTIONS =====
  function loadQuestions() {
    const questionElements = elements.questionsData.querySelectorAll('[data-question]');
    questions = Array.from(questionElements).map((el, index) => {
      const h2 = el.querySelector('h2');
      const optionButtons = el.querySelectorAll('[data-option]');
      
      return {
        index,
        text: h2 ? h2.textContent.trim() : '',
        correct: el.dataset.correct,
        level: el.dataset.level || '1',
        options: Array.from(optionButtons).map(btn => ({
          value: btn.dataset.option,
          text: btn.textContent.trim()
        }))
      };
    });
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Mode selection
    elements.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
      });
    });

    // Start quiz
    elements.startQuizBtn.addEventListener('click', startQuiz);

    // Navigation
    elements.backBtn.addEventListener('click', goToPreviousQuestion);
    elements.nextBtn.addEventListener('click', goToNextQuestion);

    // Retry
    if (elements.retryBtn) {
      elements.retryBtn.addEventListener('click', resetQuiz);
    }

    // Save player name on input
    elements.playerNameInput.addEventListener('input', () => {
      playerName = elements.playerNameInput.value.trim();
      saveSession();
    });
  }

  // ===== SCREEN MANAGEMENT =====
  function showScreen(screenId) {
    document.querySelectorAll('.typeform-screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
    }
  }

  // ===== QUIZ FLOW =====
  function startQuiz() {
    playerName = elements.playerNameInput.value.trim();
    
    // Start background music on first interaction
    if (window.MaizAudio) {
      window.MaizAudio.startBackgroundMusic().catch(err => {
        console.warn('Could not start background music:', err);
      });
    }
    
    // Filter questions by mode
    const filteredQuestions = questions.filter(q => {
      if (currentMode === 'basico') {
        return q.level === '1';
      }
      return true; // Expert mode includes all questions
    });

    questions = filteredQuestions;
    currentQuestionIndex = 0;
    answers = {};
    
    saveSession();
    showScreen('questionScreen');
    renderQuestion();
    startTimer();
  }

  function resetQuiz() {
    currentQuestionIndex = 0;
    answers = {};
    clearSession();
    showScreen('setupScreen');
  }

  // ===== QUESTION RENDERING =====
  function renderQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;

    // Update question text
    elements.questionTitle.textContent = question.text;

    // Render options
    elements.optionsContainer.innerHTML = '';
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.dataset.option = option.value;
      button.textContent = option.text;
      
      // If already answered, show the selected option
      const answer = answers[currentQuestionIndex];
      if (answer) {
        if (answer.selected === option.value) {
          button.classList.add('selected');
        }
        if (answer.correct === option.value) {
          button.classList.add('correct-option');
        }
        if (answer.selected === option.value && !answer.isCorrect) {
          button.classList.add('wrong-option');
        }
      }
      
      button.addEventListener('click', () => selectOption(option.value));
      elements.optionsContainer.appendChild(button);
    });

    // Update feedback
    const answer = answers[currentQuestionIndex];
    if (answer) {
      showFeedback(answer.isCorrect);
      elements.nextBtn.disabled = false;
    } else {
      elements.feedbackMessage.textContent = '';
      elements.feedbackMessage.className = 'feedback-message';
      elements.nextBtn.disabled = true;
    }

    // Update back button
    elements.backBtn.disabled = currentQuestionIndex === 0;

    // Reset and start timer if not answered
    if (!answer) {
      resetTimer();
      startTimer();
    } else {
      stopTimer();
    }
  }

  function selectOption(optionValue) {
    const question = questions[currentQuestionIndex];
    
    // Don't allow changing answer
    if (answers[currentQuestionIndex]) return;

    const isCorrect = optionValue === question.correct;
    
    // Save answer
    answers[currentQuestionIndex] = {
      selected: optionValue,
      correct: question.correct,
      isCorrect: isCorrect
    };

    // Update UI
    const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      btn.classList.remove('selected', 'correct-option', 'wrong-option');
      
      if (btn.dataset.option === optionValue) {
        btn.classList.add('selected');
        if (!isCorrect) {
          btn.classList.add('wrong-option');
        }
      }
      
      if (btn.dataset.option === question.correct) {
        btn.classList.add('correct-option');
      }
    });

    // Show feedback
    showFeedback(isCorrect);

    // Enable next button
    elements.nextBtn.disabled = false;

    // Stop timer
    stopTimer();

    // Save to localStorage
    saveSession();

    // Play sound effect using new audio module
    if (window.MaizAudio) {
      if (isCorrect) {
        window.MaizAudio.playCorrect();
      } else {
        window.MaizAudio.playWrong();
      }
    } else {
      // Fallback to old playSound function
      playSound(isCorrect ? 'correct' : 'wrong');
    }
  }

  function showFeedback(isCorrect) {
    elements.feedbackMessage.className = 'feedback-message ' + (isCorrect ? 'correct' : 'incorrect');
    elements.feedbackMessage.textContent = isCorrect 
      ? '✅ ¡Correcto! Muy bien.' 
      : '❌ No es la respuesta correcta. Puedes revisar la información en el sitio web.';
  }

  // ===== NAVIGATION =====
  function goToNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  }

  // ===== TIMER =====
  function startTimer() {
    // Don't start if already answered
    if (answers[currentQuestionIndex]) return;
    
    stopTimer(); // Clear any existing timer
    timeRemaining = timerDefault;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      
      if (timeRemaining <= 0) {
        handleTimeExpired();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    stopTimer();
    timeRemaining = timerDefault;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    elements.timerValue.textContent = timeRemaining;
    
    // Update color based on time remaining
    elements.timerCircle.classList.remove('warning', 'danger');
    
    if (timeRemaining <= 5) {
      elements.timerCircle.classList.add('danger');
    } else if (timeRemaining <= 10) {
      elements.timerCircle.classList.add('warning');
    }
  }

  function handleTimeExpired() {
    stopTimer();
    
    // If not answered, register empty answer and move to next
    if (!answers[currentQuestionIndex]) {
      const question = questions[currentQuestionIndex];
      answers[currentQuestionIndex] = {
        selected: null,
        correct: question.correct,
        isCorrect: false
      };
      
      saveSession();
      
      // Show feedback
      elements.feedbackMessage.className = 'feedback-message incorrect';
      elements.feedbackMessage.textContent = '⏱️ Tiempo agotado. La respuesta correcta era: ' + 
        question.options.find(o => o.value === question.correct).text;
      
      // Highlight correct answer
      const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
      optionButtons.forEach(btn => {
        if (btn.dataset.option === question.correct) {
          btn.classList.add('correct-option');
        }
      });
      
      // Auto-advance after 2 seconds
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          goToNextQuestion();
        } else {
          finishQuiz();
        }
      }, 2000);
    }
  }

  // ===== FINISH QUIZ =====
  async function finishQuiz() {
    stopTimer();
    
    // Play finish sound
    if (window.MaizAudio) {
      window.MaizAudio.playFinish();
    }
    
    // Calculate results
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Update results display
    elements.finalScore.textContent = correctAnswers;
    elements.finalTotal.textContent = totalQuestions;
    elements.finalPercentage.textContent = `${percentage}%`;

    // Save to ranking
    const modeLabel = currentMode === 'basico' ? 'Básico' : 'Experto';
    const entry = {
      name: playerName || 'Anónimo',
      score: correctAnswers,
      total: totalQuestions,
      mode: modeLabel,
      timestamp: Date.now()
    };

    // Save to local storage first (always works)
    saveToRanking(entry);
    
    // Try to save to Supabase
    if (window.MaizSupabase) {
      try {
        const result = await window.MaizSupabase.saveScore({
          name: entry.name,
          score: entry.score,
          meta: {
            total: entry.total,
            mode: entry.mode,
            percentage: percentage,
            timestamp: entry.timestamp
          }
        });
        
        if (result.success) {
          console.log('✅ Score saved to Supabase');
          // Show success message in UI
          showSupabaseMessage('¡Puntuación guardada en la nube! 🌟', 'success');
        } else {
          console.warn('⚠️ Score not saved to Supabase:', result.error);
          showSupabaseMessage(result.error || 'Puntuación guardada solo localmente.', 'warning');
        }
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        showSupabaseMessage('Error al guardar en línea. Guardado localmente.', 'warning');
      }
    }
    
    // Render ranking (combining local and Supabase)
    await renderRanking();

    // Clear session
    clearSession();

    // Show results screen
    showScreen('resultsScreen');
  }

  // ===== RANKING =====
  function loadRanking() {
    try {
      const raw = localStorage.getItem(RANKING_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveToRanking(entry) {
    const ranking = loadRanking();
    ranking.push(entry);
    
    // Sort by score (desc), then total (desc), then timestamp (asc)
    ranking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.total !== a.total) return b.total - a.total;
      return a.timestamp - b.timestamp;
    });
    
    // Keep top 10
    const top10 = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(top10));
  }

  async function renderRanking() {
    let allScores = [];
    
    // Get local scores
    const localRanking = loadRanking();
    
    // Try to get Supabase scores
    if (window.MaizSupabase) {
      try {
        const result = await window.MaizSupabase.getTopScores(20);
        if (result.success && result.data) {
          // Convert Supabase format to our format
          const supabaseScores = result.data.map(item => ({
            name: item.name,
            score: item.score,
            total: item.meta?.total || 10,
            mode: item.meta?.mode || 'Online',
            timestamp: new Date(item.created_at).getTime(),
            source: 'supabase'
          }));
          allScores = [...supabaseScores];
        }
      } catch (error) {
        console.error('Error fetching Supabase scores:', error);
      }
    }
    
    // Add local scores (avoid duplicates by checking recent timestamps)
    localRanking.forEach(localScore => {
      const isDuplicate = allScores.some(s => 
        s.name === localScore.name && 
        s.score === localScore.score && 
        Math.abs(s.timestamp - localScore.timestamp) < 5000 // Within 5 seconds
      );
      
      if (!isDuplicate) {
        allScores.push({ ...localScore, source: 'local' });
      }
    });
    
    // Sort combined scores
    allScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.total !== a.total) return b.total - a.total;
      return a.timestamp - b.timestamp;
    });
    
    // Keep top 10
    const top10 = allScores.slice(0, 10);
    
    // Render
    elements.rankingList.innerHTML = '';
    
    if (top10.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay puntuaciones todavía. ¡Sé el primero!';
      li.style.fontStyle = 'italic';
      elements.rankingList.appendChild(li);
      return;
    }
    
    top10.forEach((entry, index) => {
      const li = document.createElement('li');
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      const sourceIcon = entry.source === 'supabase' ? '☁️ ' : '';
      li.textContent = `${medal} ${index + 1}. ${sourceIcon}${entry.name} – ${entry.score}/${entry.total} (${entry.mode})`;
      elements.rankingList.appendChild(li);
    });
  }
  
  // Show Supabase save message
  function showSupabaseMessage(message, type = 'info') {
    // Create or get message element
    let messageEl = document.getElementById('supabaseMessage');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'supabaseMessage';
      messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(messageEl);
    }
    
    // Set color based on type
    const colors = {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 4000);
  }

  // ===== SESSION MANAGEMENT (autosave) =====
  function saveSession() {
    const session = {
      playerName,
      currentMode,
      currentQuestionIndex,
      answers,
      questions: questions.map(q => q.index) // Save question indices to restore filter
    };
    
    localStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(session));
  }

  function restoreSession() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + 'session');
      if (!raw) return;
      
      const session = JSON.parse(raw);
      
      // Restore state
      playerName = session.playerName || '';
      currentMode = session.currentMode || 'basico';
      currentQuestionIndex = session.currentQuestionIndex || 0;
      answers = session.answers || {};
      
      // Restore UI
      elements.playerNameInput.value = playerName;
      elements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
      });
      
      // If there was progress, ask if user wants to continue
      if (currentQuestionIndex > 0 || Object.keys(answers).length > 0) {
        const continueQuiz = confirm('Tienes un quiz sin terminar. ¿Quieres continuar donde lo dejaste?');
        
        if (continueQuiz) {
          // Restore questions filter
          if (session.questions) {
            questions = questions.filter(q => session.questions.includes(q.index));
          }
          showScreen('questionScreen');
          renderQuestion();
        } else {
          clearSession();
        }
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_PREFIX + 'session');
  }

  // ===== SOUND EFFECTS =====
  function playSound(type) {
    // Try to use sounds from the main quiz if they exist
    const soundId = type === 'correct' ? 'soundCorrect' : 'soundWrong';
    const audio = document.getElementById(soundId);
    
    if (audio) {
      try {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore errors (e.g., user hasn't interacted with page yet)
        });
      } catch (e) {
        // Ignore
      }
    }
  }

  // ===== START APPLICATION =====
  document.addEventListener('DOMContentLoaded', init);
})();
