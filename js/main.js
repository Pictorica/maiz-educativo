// === FEATURE FLAGS ============================================

// Feature flag: Typeform Quiz Mode is now the default
// The quiz.html file now uses the Typeform-style interface (one question at a time)
// This section is kept for backward compatibility but no longer performs redirects
(function initFeatureFlags() {
  // No longer needed - quiz.html is now the Typeform version
  window.USE_TYPEFORM_QUIZ = true; // Always true now
})();

// === NAV & SCROLL SUAVE ======================================

// Mobile menu toggle
const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");

if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen);
    menuBtn.textContent = isOpen ? "✕" : "☰";
  });

  // Close menu when clicking a link
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "☰";
    });
  });
}

// Scroll suave para chips del header (index.html)
document.querySelectorAll(".nav-chip[data-scroll], .nav a[href^='#']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const targetId = btn.dataset.scroll || btn.getAttribute("href")?.substring(1);
    if (!targetId) return;
    
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    const header = document.querySelector(".header");
    const headerOffset = header ? header.offsetHeight : 0;
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset - 8;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  });
});

// Botones que llevan al quiz (en hero, sección curiosidades, etc.)
document.querySelectorAll("[data-go-quiz]").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
});

const quizButton = document.getElementById("quizButton");
if (quizButton) {
  quizButton.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
}

// === VISTA BÁSICA / EXPERTA ===================================

const viewToggle = document.getElementById("viewToggle");
const advancedNodes = document.querySelectorAll(".view-advanced");

function setView(mode) {
  advancedNodes.forEach((el) => {
    el.style.display = mode === "experto" ? "" : "none";
  });

  if (!viewToggle) return;
  viewToggle.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === mode);
  });
}

// Vista inicial: básica
setView("basico");

if (viewToggle) {
  viewToggle.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const mode = e.target.dataset.view;
      if (mode) setView(mode);
    }
  });
}

// === KERNEL EXPLORER (GRANO DE MAÍZ) ==========================

const kernelInfo = document.getElementById("kernelInfo");
const kernelTexts = {
  pericarpio:
    "El pericarpio es la “piel” del grano. Protege al maíz de golpes, hongos y humedad.",
  endospermo:
    "El endospermo es la parte más grande. Contiene almidón y algo de proteína: es la reserva de energía.",
  germen:
    "El germen es el “bebé planta” dentro del grano. Si el grano germina, de ahí sale la nueva planta de maíz.",
};

document.querySelectorAll(".kernel-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".kernel-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const part = btn.dataset.part;
    if (kernelInfo && kernelTexts[part]) {
      kernelInfo.innerHTML = kernelTexts[part];
    }
  });
});

// === ANIMACIONES AL HACER SCROLL ==============================

const animated = document.querySelectorAll(".animate-on-scroll");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animated.forEach((el) => observer.observe(el));
} else {
  // Fallback sencillo
  animated.forEach((el) => el.classList.add("in-view"));
}

// === ACCORDION FUNCTIONALITY ===================================

function setupAccordions() {
  const accordions = document.querySelectorAll(".accordion");
  
  accordions.forEach((section) => {
    const header = section.querySelector(".section-header");
    if (!header) return;

    header.addEventListener("click", () => {
      section.classList.toggle("collapsed");
      
      // Update ARIA attributes
      const isCollapsed = section.classList.contains("collapsed");
      section.setAttribute("aria-expanded", !isCollapsed);
    });

    // Initialize ARIA attributes
    section.setAttribute("role", "button");
    section.setAttribute("aria-expanded", "true");
    section.setAttribute("tabindex", "0");

    // Keyboard support
    section.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });
  });
}

// Initialize accordions when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAccordions);
} else {
  setupAccordions();
}

// === QUIZ DEL MAÍZ ============================================

function setupQuiz() {
  const quizContainer = document.querySelector(".quiz-container");
  if (!quizContainer) return; // No estamos en quiz.html

  const questions = Array.from(document.querySelectorAll("[data-question]"));
  const modeButtons = document.querySelectorAll(".mode-btn");
  const playerNameInput = document.getElementById("playerName");
  const questionCounter = document.getElementById("questionCounter");
  const scoreCounter = document.getElementById("scoreCounter");
  const rankingList = document.getElementById("rankingList");

  const musicToggle = document.getElementById("musicToggle");
  const quizMusic = document.getElementById("quizMusic");
  const soundCorrect = document.getElementById("soundCorrect");
  const soundWrong = document.getElementById("soundWrong");

  const STORAGE_KEY = "maizQuizRanking";
  let currentMode = "basico";
  let quizFinished = false;

  // --- Helpers ranking ---------------------------------------

  function loadRanking() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function renderRanking(list) {
    if (!rankingList) return;
    rankingList.innerHTML = "";
    if (!list.length) return;

    list.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${entry.name} – ${entry.score}/${entry.total} (${entry.mode})`;
      rankingList.appendChild(li);
    });
  }

  function saveRankingAndRender(newEntry) {
    const list = loadRanking();
    list.push(newEntry);
    list.sort((a, b) => {
      // Primero mayor puntuación
      if (b.score !== a.score) return b.score - a.score;
      // Luego más preguntas
      if (b.total !== a.total) return b.total - a.total;
      // Luego el más antiguo primero
      return a.timestamp - b.timestamp;
    });
    const top = list.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
    renderRanking(top);
  }

  renderRanking(loadRanking());

  // --- Modo básico / experto ---------------------------------

  function getVisibleQuestions() {
    return questions.filter((q) => q.style.display !== "none");
  }

  function updateNumbersAndStatus() {
    const visible = getVisibleQuestions();
    const answered = visible.filter((q) => q.dataset.answered === "true");
    const correct = visible.filter((q) => q.dataset.correctly === "true");

    if (questionCounter) {
      questionCounter.textContent = `Preguntas respondidas: ${answered.length}/${visible.length}`;
    }
    if (scoreCounter) {
      scoreCounter.textContent = `Puntos: ${correct.length}`;
    }
  }

  function applyMode() {
    questions.forEach((q) => {
      const level = q.dataset.level || "1";
      if (currentMode === "basico" && level === "2") {
        q.style.display = "none";
      } else {
        q.style.display = "";
      }
    });

    // Numerar sólo las visibles
    const visible = getVisibleQuestions();
    visible.forEach((q, index) => {
      const span = q.querySelector(".quiz-number");
      if (span) span.textContent = `${index + 1}.`;
    });

    // Actualizar contadores según lo visible en este modo
    updateNumbersAndStatus();

    // Actualizar aspecto de los botones de modo
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === currentMode);
    });
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (!mode || mode === currentMode) return;
      currentMode = mode;
      applyMode();
    });
  });

  applyMode();

  // --- Sonidos -----------------------------------------------

  function playFx(audioEl) {
    if (!audioEl) return;
    try {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    } catch {
      // ignorar
    }
  }

  // Música de fondo estilo videojuego
  if (musicToggle && quizMusic) {
    let playing = false;
    musicToggle.addEventListener("click", () => {
      if (!playing) {
        quizMusic.loop = true;
        quizMusic.volume = 0.4;
        quizMusic
          .play()
          .then(() => {
            playing = true;
            musicToggle.textContent = "🎵 Música: ON";
            musicToggle.setAttribute("aria-pressed", "true");
          })
          .catch(() => {
            // Si el navegador bloquea el autoplay, no pasa nada
          });
      } else {
        quizMusic.pause();
        playing = false;
        musicToggle.textContent = "🎵 Música: OFF";
        musicToggle.setAttribute("aria-pressed", "false");
      }
    });
  }

  // --- Lógica de preguntas -----------------------------------

  function finishQuiz() {
    if (quizFinished) return;

    const visible = getVisibleQuestions();
    const allAnswered = visible.every((q) => q.dataset.answered === "true");
    if (!allAnswered) return;

    quizFinished = true;

    const correct = visible.filter((q) => q.dataset.correctly === "true");
    const score = correct.length;
    const total = visible.length;

    const rawName = playerNameInput ? playerNameInput.value.trim() : "";
    const name = rawName || "Anónimo";
    const modeLabel = currentMode === "basico" ? "Básico" : "Experto";

    const entry = {
      name,
      score,
      total,
      mode: modeLabel,
      timestamp: Date.now(),
    };

    saveRankingAndRender(entry);

    // Mensaje rápido para cierre de experiencia
    alert(`Has terminado el quiz (${modeLabel}) 🎉\n\nPuntuación: ${score}/${total}`);
  }

  questions.forEach((questionEl) => {
    const correctValue = questionEl.dataset.correct;
    const feedbackEl = questionEl.querySelector(".quiz-feedback");
    const optionButtons = questionEl.querySelectorAll("button[data-option]");

    optionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Si ya se respondió, no permitimos cambiar la respuesta
        if (questionEl.dataset.answered === "true") return;

        const value = btn.dataset.option;
        const correctBtn = questionEl.querySelector(
          `button[data-option="${correctValue}"]`
        );

        // Marcar visualmente
        optionButtons.forEach((b) => b.classList.remove("selected", "correct-option", "wrong-option"));
        btn.classList.add("selected");

        if (correctBtn) {
          correctBtn.classList.add("correct-option");
        }

        questionEl.dataset.answered = "true";

        if (value === correctValue) {
          questionEl.dataset.correctly = "true";
          if (feedbackEl) {
            feedbackEl.textContent = "✅ ¡Correcto! Muy bien.";
            feedbackEl.classList.remove("incorrect");
            feedbackEl.classList.add("correct");
          }
          playFx(soundCorrect);
        } else {
          questionEl.dataset.correctly = "false";
          if (feedbackEl) {
            feedbackEl.textContent =
              "❌ No es la respuesta correcta. Puedes volver al minisitio y revisar la información.";
            feedbackEl.classList.remove("correct");
            feedbackEl.classList.add("incorrect");
          }
          playFx(soundWrong);
        }

        updateNumbersAndStatus();
        finishQuiz();
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", setupQuiz);
