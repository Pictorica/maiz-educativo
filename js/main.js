// ==============================
//  MENÚ MÓVIL
// ==============================
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("mainNav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

// Scroll suave
document.querySelectorAll("nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      nav.classList.remove("open");
    }
  });
});

// Botón CTA quiz
const quizButton = document.getElementById("quizButton");
if (quizButton) {
  quizButton.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
}

// ==============================
//  VISTA BÁSICA / EXPERTA
// ==============================
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

setView("basico");

if (viewToggle) {
  viewToggle.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      setView(e.target.dataset.view);
    }
  });
}

// ==============================
//  KERNEL EXPLORER
// ==============================
const kernelInfo = document.getElementById("kernelInfo");
const kernelTexts = {
  pericarpio: "El pericarpio es la piel del grano. Protege al maíz.",
  endospermo: "El endospermo contiene almidón, energía pura.",
  germen: "El germen es la 'bebé planta' del maíz."
};

document.querySelectorAll(".kernel-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".kernel-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const part = btn.dataset.part;
    if (kernelInfo && kernelTexts[part]) {
      kernelInfo.textContent = kernelTexts[part];
    }
  });
});

// ==============================
//  ANIMACIÓN EN SCROLL
// ==============================
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

// ==============================
//  SISTEMA AVANZADO DE QUIZ
// ==============================
function setupQuizPage() {
  const quizSection = document.getElementById("quizQuestions");
  if (!quizSection) return;

  let score = 0;
  let answered = false;

  const playerNameInput = document.getElementById("playerName");
  const startQuizBtn = document.getElementById("startQuizBtn");
  const finishQuizBtn = document.getElementById("finishQuizBtn");
  const resultBox = document.getElementById("quizResult");
  const scoreText = document.getElementById("scoreText");
  const rankingList = document.getElementById("rankingList");

  const questions = document.querySelectorAll(".quiz-question");

  // Iniciar el quiz
  startQuizBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (!name) {
      alert("Por favor escribe tu nombre para el ranking.");
      return;
    }

    document.getElementById("playerNameBox").style.display = "none";
    quizSection.style.display = "block";
  });

  // Logica de respuesta
  questions.forEach((block) => {
    const correct = block.dataset.correct;
    const feedbackEl = block.querySelector(".quiz-feedback");

    block.querySelectorAll("button[data-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const option = btn.dataset.option;

        // Evita responder dos veces
        if (block.classList.contains("answered")) return;
        block.classList.add("answered");

        // Marca visual
        block.querySelectorAll("button").forEach((b) => {
          b.disabled = true;
          if (b.dataset.option === correct) b.style.background = "#c9f7c2";
          if (b.dataset.option === option && option !== correct)
            b.style.background = "#f7c2c2";
        });

        if (option === correct) {
          score++;
          feedbackEl.textContent = "✅ ¡Correcto!";
          feedbackEl.classList.add("correct");
        } else {
          feedbackEl.textContent = "❌ Incorrecto. La correcta era: " + correct.toUpperCase();
          feedbackEl.classList.add("incorrect");
        }
      });
    });
  });

  // Finalizar y mostrar ranking
  finishQuizBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();

    quizSection.style.display = "none";
    resultBox.style.display = "block";

    scoreText.textContent = `Has obtenido ${score} punto(s) de ${questions.length}.`;

    // Guardar puntuación
    const ranking = JSON.parse(localStorage.getItem("quizRanking") || "[]");

    ranking.push({ name, score, date: new Date().toLocaleDateString() });

    ranking.sort((a, b) => b.score - a.score);

    localStorage.setItem("quizRanking", JSON.stringify(ranking));

    // Mostrar ranking
    rankingList.innerHTML = "";
    ranking.slice(0, 10).forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.name} — ${r.score} puntos`;
      rankingList.appendChild(li);
    });
  });
}

// Activar quiz si corresponde
document.addEventListener("DOMContentLoaded", setupQuizPage);
