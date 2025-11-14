// Smooth scroll
document.querySelectorAll(".nav-chip[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Ir al quiz (otra página)
const quizButton = document.getElementById("quizButton");
document.querySelectorAll("[data-go-quiz]").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
});
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
  viewToggle.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === mode);
  });
}

if (viewToggle) {
  viewToggle.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      setView(e.target.dataset.view);
    }
  });
  // Inicial: básica
  setView("basico");
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
    if (kernelInfo) {
      kernelInfo.innerHTML = kernelTexts[part] || "";
    }
  });
});

// Header móvil: menú plegable
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");

if (siteHeader && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

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
