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
      nav.classList.remove("open");
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

// Vista básica / experta
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
    "El germen es el “bebé planta” dentro del grano. Si el grano germina, de ahí sale la nueva planta de maíz."
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
  const questions = document.querySelectorAll("[data-question]");
  if (!questions.length) return;

  questions.forEach((block) => {
    const correct = block.dataset.correct;
    const feedbackEl = block.querySelector(".quiz-feedback");
    block.querySelectorAll("button[data-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.option;
        if (!feedbackEl) return;
        if (value === correct) {
          feedbackEl.textContent = "✅ ¡Correcto! Muy bien.";
          feedbackEl.classList.remove("incorrect");
          feedbackEl.classList.add("correct");
        } else {
          feedbackEl.textContent = "❌ No es la respuesta correcta. Revisa el texto del minisitio y vuelve a intentarlo.";
          feedbackEl.classList.remove("correct");
          feedbackEl.classList.add("incorrect");
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", setupQuizPage);
