/* =========================
   GSAP + ScrollTrigger Setup
   ========================= */

const hasGSAP = typeof window.gsap !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

if (hasGSAP && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // (Optional) turn on markers while building, then set to false
  const DEBUG_MARKERS = false;

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    ScrollTrigger.defaults({ markers: false });
  } else {
    ScrollTrigger.defaults({ markers: DEBUG_MARKERS });
  }
}

/* =========================
   Theme Toggle (localStorage)
   ========================= */

const root = document.documentElement;
const btn = document.getElementById("themeToggle");

const saved = localStorage.getItem("theme");
if (saved) root.setAttribute("data-theme", saved);

btn?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* =========================
   Chapter 4: Tap Card Interaction
   ========================= */

const cardBtn = document.getElementById("tapCard");
const stateEl = document.getElementById("tapState");

if (cardBtn) {
  cardBtn.addEventListener("click", () => {
    const isTapped = cardBtn.classList.toggle("is-tapped");
    cardBtn.setAttribute("aria-pressed", String(isTapped));

    if (stateEl) {
      stateEl.textContent = isTapped ? "tapped" : "untapped";
    }
  });
}

/* =========================
   Chapter 6: Archive Remembers (localStorage)
   ========================= */

const STORAGE_KEY = "archiveScrolls";

const memoryList = document.getElementById("memoryList");
const clearBtn = document.getElementById("clearMemory");
const deckButtons = document.querySelectorAll(".scroll-card");

function loadMemory() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return Array.isArray(saved) ? saved : [];
}

function saveMemory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderMemory() {
  if (!memoryList) return;

  const items = loadMemory();
  memoryList.innerHTML = "";

  if (items.length === 0) {
    memoryList.innerHTML = `<p class="micro" style="color: var(--text-muted);">Nothing saved yet.</p>`;
    return;
  }

  items.forEach((name) => {
    const el = document.createElement("div");
    el.className = "memory-item";
    el.innerHTML = `
      <div class="memory-item__name">${name}</div>
      <div class="memory-item__meta">Saved in archive</div>
    `;
    memoryList.appendChild(el);
  });
}

deckButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-scroll");
    if (!name) return;

    const items = loadMemory();
    if (!items.includes(name)) items.push(name);
    saveMemory(items);
    renderMemory();
  });
});

clearBtn?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderMemory();
});

renderMemory();

/* =========================
   Global Page Animations
   ========================= */

if (hasGSAP) {
  gsap.from(".hero__content", {
    opacity: 0,
    y: 16,
    duration: 1.0,
    ease: "power2.out"
  });
}

if (hasGSAP) {
  const titles = [
    ".headline",
    ".chapter-title",
    ".grimoire__title",
    ".fork__title",
    ".energy__title",
    ".schools__title",
    ".archive__title",
    ".closing__title"
  ].join(",");

  gsap.utils.toArray(titles).forEach((el) => {
    if (hasScrollTrigger) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: "power2.out"
      });
    } else {
      gsap.from(el, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: "power2.out"
      });
    }
  });
}

if (hasGSAP) {
  const panel = document.querySelector(".energy__panel");
  if (panel) {
    if (hasScrollTrigger) {
      gsap.from(panel, {
        scrollTrigger: {
          trigger: panel,
          start: "top 75%"
        },
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power2.out"
      });
    } else {
      gsap.from(panel, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }
}

if (hasGSAP && hasScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.to(".hero", {
    backgroundPosition: "50% 65%",
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
}

/* =========================
   Chapter 5: Five Schools Animations
   ========================= */

if (hasGSAP && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const schools = hasGSAP ? gsap.utils.toArray(".schools .school") : [];

function makeSchoolAnimations() {
  if (!hasGSAP) return;

  // A) Scroll-in entrance (all icons)
  if (!reduceMotion) {
    if (hasScrollTrigger) {
      gsap.from(".schools .school__glyph", {
        opacity: 0,
        y: 18,
        scale: 0.9,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.10,
        scrollTrigger: {
          trigger: ".schools",
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    } else {
      gsap.from(".schools .school__glyph", {
        opacity: 0,
        y: 18,
        scale: 0.9,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.10
      });
    }
  } else {
    gsap.set(".schools .school__glyph", { opacity: 1 });
  }

  // B) Per-icon idle + hover animations
  schools.forEach((card) => {
    const icon = card.querySelector(".school__glyph");
    if (!icon) return;

    card.tabIndex = 0;
    gsap.set(icon, { transformOrigin: "50% 50%" });

    let idleTL;

    const pauseIdle = () => idleTL && idleTL.pause();
    const resumeIdle = () => idleTL && idleTL.resume();

    // WHITE (Sun)
    if (card.classList.contains("school--white") && !reduceMotion) {
      idleTL = gsap.timeline({ repeat: -1, yoyo: true });
      idleTL.to(icon, { scale: 1.05, duration: 1.6, ease: "sine.inOut" });
    }

    // GREEN (Tree)
    if (card.classList.contains("school--green") && !reduceMotion) {
      idleTL = gsap.timeline({ repeat: -1, yoyo: true });
      idleTL.to(icon, { y: -7, scale: 1.03, duration: 2.1, ease: "sine.inOut" });
    }

    // BLUE (Drop)
    if (card.classList.contains("school--blue") && !reduceMotion) {
      idleTL = gsap.timeline({ repeat: -1, yoyo: true });
      idleTL.to(icon, { rotation: 8, duration: 2.2, ease: "sine.inOut" });
    }

    // RED (Fire)
    if (card.classList.contains("school--red") && !reduceMotion) {
      idleTL = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
      idleTL
        .to(icon, { scale: 1.08, duration: 0.18, ease: "power2.out" })
        .to(icon, { scale: 0.98, duration: 0.12, ease: "power2.out" })
        .to(icon, { scale: 1.02, duration: 0.18, ease: "power1.out" })
        .to(icon, { scale: 1.0, duration: 0.25, ease: "power2.out" });
    }

    // BLACK (Skull)
    if (card.classList.contains("school--black") && !reduceMotion) {
      idleTL = gsap.timeline({ repeat: -1, yoyo: true });
      idleTL.to(icon, { y: 4, scale: 1.03, duration: 2.4, ease: "sine.inOut" });
    }

    // Hover / Focus
    const onEnter = () => {
      pauseIdle();

      gsap.to(icon, {
        scale: reduceMotion ? 1.06 : 1.14,
        y: reduceMotion ? -2 : -6,
        duration: reduceMotion ? 0.18 : 0.25,
        ease: "power2.out",
        overwrite: "auto"
      });

      if (card.classList.contains("school--white") && !reduceMotion) {
        gsap.to(icon, { rotation: 12, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--green") && !reduceMotion) {
        gsap.to(icon, { rotation: -6, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--blue") && !reduceMotion) {
        gsap.to(icon, { rotation: 10, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--red") && !reduceMotion) {
        gsap.fromTo(
          icon,
          { rotation: -6 },
          { rotation: 6, duration: 0.06, repeat: 7, yoyo: true, ease: "power1.inOut", overwrite: "auto" }
        );
      }

      if (card.classList.contains("school--black") && !reduceMotion) {
        gsap.to(icon, { rotation: -10, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }
    };

    const onLeave = () => {
      gsap.to(icon, {
        scale: 1,
        y: 0,
        rotation: 0,
        duration: reduceMotion ? 0.2 : 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });

      resumeIdle();
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    card.addEventListener("focus", onEnter);
    card.addEventListener("blur", onLeave);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", makeSchoolAnimations);
} else {
  makeSchoolAnimations();
}
// ==============================
// Forked Path — Choose + Highlight
// ==============================
const chooseBtn = document.getElementById("choosePathBtn");
const wizardCard = document.querySelector(".fork-card--wizard");
const sorcererCard = document.querySelector(".fork-card--sorcerer");

function setSelected(card) {
  if (!wizardCard || !sorcererCard) return;

  wizardCard.classList.remove("is-selected");
  sorcererCard.classList.remove("is-selected");

  card.classList.add("is-selected");

  // Optional: update button label
  if (chooseBtn) {
    chooseBtn.textContent =
      card.classList.contains("fork-card--wizard") ? "Chosen: Wizard" : "Chosen: Sorcerer";
  }
}

// Make cards keyboard focusable too
[wizardCard, sorcererCard].forEach((card) => {
  if (!card) return;
  card.tabIndex = 0;

  card.addEventListener("click", () => setSelected(card));

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(card);
    }
  });
});

// Choose Path button: if nothing selected, select Wizard.
// If something selected, toggle to the other.
if (chooseBtn) {
  chooseBtn.addEventListener("click", () => {
    if (!wizardCard || !sorcererCard) return;

    const wizardSelected = wizardCard.classList.contains("is-selected");
    const sorcSelected = sorcererCard.classList.contains("is-selected");

    if (!wizardSelected && !sorcSelected) {
      setSelected(wizardCard);
    } else if (wizardSelected) {
      setSelected(sorcererCard);
    } else {
      setSelected(wizardCard);
    }
  });
}