// Menú móvil
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("mainNav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

// Scroll suave para enlaces del header (solo si son internos)
document.querySelectorAll("nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nav) {
        nav.classList.remove("open");
      }
    }
  });
});

// Botón CTA quiz en la sección curiosidades
const quizButton = document.getElementById("quizButton");
if (quizButton) {
  quizButton.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
}

// Vista básica / experta en la página principal
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

// Inicial: básica
setView("basico");

if (viewToggle) {
  viewToggle.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      setView(e.target.dataset.view);
    }
  });
}

// Kernel explorer
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

// Animaciones al hacer scroll
const animated = document.querySelectorAll(".animate-on-scroll");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
animated.forEach((el) => observer.observe(el));

// QUIZ (para quiz.html)
function setupQuizPage() {
  const questions = Array.from(document.querySelectorAll("[data-question]"));
  if (!questions.length) return;

  const modeButtons = document.querySelectorAll(".mode-btn");
  const questionCounterEl = document.getElementById("questionCounter");
  const scoreCounterEl = document.getElementById("scoreCounter");
  const playerNameInput = document.getElementById("playerName");
  const rankingList = document.getElementById("rankingList");
  const musicToggleBtn = document.getElementById("musicToggle");
  const musicEl = document.getElementById("quizMusic");

  const RANKING_KEY = "maizQuizRanking";

  let currentMode = "basico";
  let lastSavedSignature = null;

  function getMaxLevelForMode(mode) {
    return mode === "experto" ? 2 : 1;
  }

  function getVisibleQuestions() {
    const maxLevel = getMaxLevelForMode(currentMode);
    return questions.filter((q) => {
      const level = parseInt(q.dataset.level || "1", 10);
      return level <= maxLevel;
    });
  }

  function renumberVisibleQuestions() {
    const visibles = getVisibleQuestions();
    visibles.forEach((q, idx) => {
      const span = q.querySelector(".quiz-number");
      if (span) span.textContent = (idx + 1) + ".";
    });
  }

  function updateVisibility() {
    const maxLevel = getMaxLevelForMode(currentMode);
    questions.forEach((q) => {
      const level = parseInt(q.dataset.level || "1", 10);
      if (level <= maxLevel) {
        q.style.display = "";
      } else {
        q.style.display = "none";
      }
    });
    renumberVisibleQuestions();
    updateCounters();
  }

  function updateCounters() {
    const visibles = getVisibleQuestions();
    const totalVisible = visibles.length;
    let answeredVisible = 0;
    let scoreVisible = 0;

    visibles.forEach((q) => {
      if (q.dataset.answered === "true") answeredVisible++;
      if (q.dataset.correctly === "true") scoreVisible++;
    });

    if (questionCounterEl) {
      questionCounterEl.textContent = `Preguntas respondidas: ${answeredVisible} / ${totalVisible}`;
    }
    if (scoreCounterEl) {
      scoreCounterEl.textContent = `Puntos: ${scoreVisible}`;
    }

    maybeAutoSave(scoreVisible, totalVisible, answeredVisible);
  }

  function handleOptionClick(questionEl, btn) {
    const correct = questionEl.dataset.correct;
    const value = btn.dataset.option;
    const feedbackEl = questionEl.querySelector(".quiz-feedback");

    // marcar selección visual
    questionEl.querySelectorAll("button[data-option]").forEach((b) => {
      b.classList.remove("selected", "correct-option", "wrong-option");
    });
    btn.classList.add("selected");

    // marcar correcto / incorrecto
    if (value === correct) {
      btn.classList.add("correct-option");
      if (feedbackEl) {
        feedbackEl.textContent = "✅ ¡Correcto! Muy bien.";
        feedbackEl.classList.remove("incorrect");
        feedbackEl.classList.add("correct");
      }
    } else {
      btn.classList.add("wrong-option");
      if (feedbackEl) {
        feedbackEl.textContent =
          "❌ No es la respuesta correcta. Revisa el minisitio y vuelve a intentarlo.";
        feedbackEl.classList.remove("correct");
        feedbackEl.classList.add("incorrect");
      }
    }

    // Lógica de puntuación: sólo cuenta la primera respuesta que se da a esa pregunta
    if (questionEl.dataset.answered !== "true") {
      questionEl.dataset.answered = "true";
      questionEl.dataset.correctly = value === correct ? "true" : "false";
    } else {
      // ya estaba respondida; permitimos cambiar la selección visual,
      // pero no modificamos la puntuación guardada
      if (value === correct && !questionEl.dataset.correctly) {
        questionEl.dataset.correctly = "false";
      }
    }

    updateCounters();
  }

  // Auto-guardar en ranking cuando se haya contestado todo el modo actual
  function maybeAutoSave(score, totalVisible, answeredVisible) {
    if (!playerNameInput || !rankingList) return;
    if (!totalVisible) return;
    if (answeredVisible < totalVisible) return;

    const name = playerNameInput.value.trim();
    if (!name) return;

    const signature = `${name}::${currentMode}::${score}::${totalVisible}`;
    if (signature === lastSavedSignature) return;
    lastSavedSignature = signature;

    const newEntry = {
      name,
      mode: currentMode,
      score,
      total: totalVisible,
      date: new Date().toISOString(),
    };

    let ranking = [];
    try {
      const stored = localStorage.getItem(RANKING_KEY);
      if (stored) ranking = JSON.parse(stored);
    } catch (e) {
      ranking = [];
    }

    ranking.push(newEntry);
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 10);

    try {
      localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    } catch (e) {
      // si el almacenamiento falla, simplemente no persistimos
    }
    renderRanking(ranking);
  }

  function renderRanking(ranking) {
    if (!rankingList) return;
    rankingList.innerHTML = "";
    ranking.forEach((entry) => {
      const li = document.createElement("li");
      const labelMode = entry.mode === "experto" ? "Experto" : "Básico";
      li.innerHTML = `<strong class="rank-name">${escapeHTML(
        entry.name
      )}</strong> – <span class="rank-score">${entry.score} / ${
        entry.total
      }</span> <span class="rank-mode">(${labelMode})</span>`;
      rankingList.appendChild(li);
    });
  }

  function loadRanking() {
    let ranking = [];
    try {
      const stored = localStorage.getItem(RANKING_KEY);
      if (stored) ranking = JSON.parse(stored);
    } catch (e) {
      ranking = [];
    }
    renderRanking(ranking);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Listeners para las opciones
  questions.forEach((q) => {
    if (!q.dataset.answered) q.dataset.answered = "false";
    if (!q.dataset.correctly) q.dataset.correctly = "false";
    q.querySelectorAll("button[data-option]").forEach((btn) => {
      btn.addEventListener("click", () => handleOptionClick(q, btn));
    });
  });

  // Listeners del modo
  if (modeButtons.length) {
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newMode = btn.dataset.mode;
        if (!newMode || newMode === currentMode) return;
        currentMode = newMode;
        modeButtons.forEach((b) =>
          b.classList.toggle("active", b.dataset.mode === currentMode)
        );
        lastSavedSignature = null; // nuevo modo, nuevo intento
        updateVisibility();
      });
    });
  }

  // Música tipo videojuego
  if (musicToggleBtn && musicEl) {
    musicToggleBtn.addEventListener("click", () => {
      if (musicEl.paused) {
        musicEl
          .play()
          .then(() => {
            musicToggleBtn.textContent = "🎵 Música ON";
          })
          .catch(() => {
            // algunos navegadores pueden bloquear el autoplay
            musicToggleBtn.textContent = "🔈 Música OFF";
          });
      } else {
        musicEl.pause();
        musicEl.currentTime = 0;
        musicToggleBtn.textContent = "🔈 Música OFF";
      }
    });
  }

  // Init
  updateVisibility();
  loadRanking();
}

document.addEventListener("DOMContentLoaded", setupQuizPage);
