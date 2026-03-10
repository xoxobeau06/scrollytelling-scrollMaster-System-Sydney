/* =========================
   Setup
   ========================= */

const hasGSAP = typeof window.gsap !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hasGSAP && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ markers: false });
}

/* =========================
   Theme Toggle (localStorage)
   ========================= */

const root = document.documentElement;
const themeToggleBtn = document.getElementById("themeToggle");

function syncThemeToggleLabel() {
  if (!themeToggleBtn) return;
  const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  themeToggleBtn.textContent = currentTheme === "dark" ? "Dusk" : "Dawn";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
syncThemeToggleLabel();

themeToggleBtn?.addEventListener("click", () => {
  const currentTheme = root.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  syncThemeToggleLabel();
});

/* =========================
   Hero CTA Smooth Scroll
   ========================= */

const heroCta = document.querySelector('.hero__cta[href^="#"]');

heroCta?.addEventListener("click", (event) => {
  const targetSelector = heroCta.getAttribute("href");
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
});

/* =========================
   Chapter 4: Tap Card Interaction
   ========================= */

const tapCardBtn = document.getElementById("tapCard");
const tapStateEl = document.getElementById("tapState");
const tapNextStateEl = document.getElementById("tapNextState");
const tapAfterBlockEl = document.getElementById("tapAfterBlock");

if (tapCardBtn) {
  tapCardBtn.addEventListener("click", () => {
    const isTapped = tapCardBtn.classList.toggle("is-tapped");
    tapCardBtn.setAttribute("aria-pressed", String(isTapped));

    if (tapStateEl) {
      tapStateEl.textContent = isTapped ? "tapped" : "untapped";
    }

    if (tapNextStateEl) {
      tapNextStateEl.textContent = isTapped ? "untapped" : "tapped";
    }

    if (tapAfterBlockEl) {
      tapAfterBlockEl.hidden = !isTapped;
    }
  });
}

/* =========================
   Chapter 6: Archive Memory
   ========================= */

const STORAGE_KEY = "archiveScrolls";
const memoryList = document.getElementById("memoryList");
const clearMemoryBtn = document.getElementById("clearMemory");
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
  memoryList.classList.remove("is-empty");

  if (items.length === 0) {
    memoryList.classList.add("is-empty");
    memoryList.innerHTML = `<p class="memory__empty">Nothing saved yet.</p>`;
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

function animateScrollTransfer(sourceBtn, scrollName) {
  if (!hasGSAP || prefersReducedMotion || !memoryList) return;

  const sourceRect = sourceBtn.getBoundingClientRect();
  const targetRect = memoryList.getBoundingClientRect();
  if (!sourceRect.width || !targetRect.width) return;

  const ghost = document.createElement("div");
  ghost.textContent = scrollName;
  ghost.style.position = "fixed";
  ghost.style.left = `${sourceRect.left}px`;
  ghost.style.top = `${sourceRect.top}px`;
  ghost.style.width = `${sourceRect.width}px`;
  ghost.style.padding = "0.8rem 1rem";
  ghost.style.borderRadius = "18px";
  ghost.style.border = "2px solid var(--accent-highlight)";
  ghost.style.background = "var(--surface-elevated)";
  ghost.style.color = "var(--text-primary)";
  ghost.style.fontFamily = "var(--font-display)";
  ghost.style.fontSize = "22px";
  ghost.style.lineHeight = "1.05";
  ghost.style.textAlign = "left";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "2000";

  document.body.appendChild(ghost);

  const destinationX = targetRect.left + (targetRect.width - sourceRect.width) / 2;
  const destinationY = targetRect.top + 16;

  gsap.to(ghost, {
    x: destinationX - sourceRect.left,
    y: destinationY - sourceRect.top,
    scale: 0.86,
    opacity: 0.12,
    duration: 0.55,
    ease: "power2.inOut",
    onComplete: () => ghost.remove()
  });
}

function animateMemoryItemIn(scrollName) {
  if (!hasGSAP || prefersReducedMotion || !memoryList) return;

  const item = Array.from(memoryList.querySelectorAll(".memory-item")).find((el) => {
    const name = el.querySelector(".memory-item__name")?.textContent?.trim();
    return name === scrollName;
  });

  if (!item) return;

  gsap.fromTo(
    item,
    { opacity: 0.35, y: 10, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power2.out" }
  );
}

deckButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-scroll");
    if (!name) return;

    const items = loadMemory();
    const isNewItem = !items.includes(name);

    if (isNewItem) items.push(name);
    saveMemory(items);
    renderMemory();

    if (!isNewItem) return;

    animateScrollTransfer(button, name);

    if (hasGSAP && !prefersReducedMotion) {
      gsap.delayedCall(0.18, () => animateMemoryItemIn(name));
    } else {
      animateMemoryItemIn(name);
    }
  });
});

clearMemoryBtn?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderMemory();
});

renderMemory();

/* =========================
   Global Scroll Animations
   ========================= */

if (hasGSAP) {
  gsap.from(".hero__content", {
    opacity: 0,
    y: 16,
    duration: 1,
    ease: "power2.out"
  });
}

if (hasGSAP) {
  const titleSelectors = [
    ".headline",
    ".chapter-title",
    ".grimoire__title",
    ".fork__title",
    ".energy__title",
    ".schools__title",
    ".archive__title",
    ".closing__title"
  ].join(",");

  gsap.utils.toArray(titleSelectors).forEach((el) => {
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
  const energyPanel = document.querySelector(".energy__panel");

  if (energyPanel && hasScrollTrigger) {
    gsap.from(energyPanel, {
      scrollTrigger: {
        trigger: energyPanel,
        start: "top 75%"
      },
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: "power2.out"
    });
  } else if (energyPanel) {
    gsap.from(energyPanel, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
  const heroSection = document.querySelector(".section--hero");
  const heroScrollFade = document.querySelector(".hero__scroll-fade");

  if (heroSection && heroScrollFade) {
    gsap.to(heroSection, {
      backgroundPosition: "50% 65%",
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom+=45% top",
        scrub: true
      }
    });

    gsap.to(heroScrollFade, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom+=45% top",
        scrub: true,
        onUpdate: (self) => {
          heroScrollFade.style.transformOrigin =
            self.direction === 1 ? "bottom center" : "top center";
        }
      }
    });
  }
}

/* =========================
   Chapter 5: School Animations
   ========================= */

const schools = hasGSAP ? gsap.utils.toArray(".schools .school") : [];

function makeSchoolAnimations() {
  if (!hasGSAP) return;

  if (!prefersReducedMotion) {
    if (hasScrollTrigger) {
      gsap.from(".schools .school__glyph", {
        opacity: 0,
        y: 18,
        scale: 0.9,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
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
        stagger: 0.1
      });
    }
  } else {
    gsap.set(".schools .school__glyph", { opacity: 1 });
  }

  schools.forEach((card) => {
    const icon = card.querySelector(".school__glyph");
    if (!icon) return;

    card.tabIndex = 0;
    gsap.set(icon, { transformOrigin: "50% 50%" });

    let idleTimeline;

    const pauseIdle = () => idleTimeline && idleTimeline.pause();
    const resumeIdle = () => idleTimeline && idleTimeline.resume();

    if (card.classList.contains("school--white") && !prefersReducedMotion) {
      idleTimeline = gsap.timeline({ repeat: -1, yoyo: true }).to(icon, {
        scale: 1.05,
        duration: 1.6,
        ease: "sine.inOut"
      });
    }

    if (card.classList.contains("school--green") && !prefersReducedMotion) {
      idleTimeline = gsap.timeline({ repeat: -1, yoyo: true }).to(icon, {
        y: -7,
        scale: 1.03,
        duration: 2.1,
        ease: "sine.inOut"
      });
    }

    if (card.classList.contains("school--blue") && !prefersReducedMotion) {
      idleTimeline = gsap.timeline({ repeat: -1, yoyo: true }).to(icon, {
        rotation: 8,
        duration: 2.2,
        ease: "sine.inOut"
      });
    }

    if (card.classList.contains("school--red") && !prefersReducedMotion) {
      idleTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
      idleTimeline
        .to(icon, { scale: 1.08, duration: 0.18, ease: "power2.out" })
        .to(icon, { scale: 0.98, duration: 0.12, ease: "power2.out" })
        .to(icon, { scale: 1.02, duration: 0.18, ease: "power1.out" })
        .to(icon, { scale: 1, duration: 0.25, ease: "power2.out" });
    }

    if (card.classList.contains("school--black") && !prefersReducedMotion) {
      idleTimeline = gsap.timeline({ repeat: -1, yoyo: true }).to(icon, {
        y: 4,
        scale: 1.03,
        duration: 2.4,
        ease: "sine.inOut"
      });
    }

    const onEnter = () => {
      pauseIdle();

      gsap.to(icon, {
        scale: prefersReducedMotion ? 1.06 : 1.14,
        y: prefersReducedMotion ? -2 : -6,
        duration: prefersReducedMotion ? 0.18 : 0.25,
        ease: "power2.out",
        overwrite: "auto"
      });

      if (card.classList.contains("school--white") && !prefersReducedMotion) {
        gsap.to(icon, { rotation: 12, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--green") && !prefersReducedMotion) {
        gsap.to(icon, { rotation: -6, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--blue") && !prefersReducedMotion) {
        gsap.to(icon, { rotation: 10, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }

      if (card.classList.contains("school--red") && !prefersReducedMotion) {
        gsap.fromTo(
          icon,
          { rotation: -6 },
          { rotation: 6, duration: 0.06, repeat: 7, yoyo: true, ease: "power1.inOut", overwrite: "auto" }
        );
      }

      if (card.classList.contains("school--black") && !prefersReducedMotion) {
        gsap.to(icon, { rotation: -10, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }
    };

    const onLeave = () => {
      gsap.to(icon, {
        scale: 1,
        y: 0,
        rotation: 0,
        duration: prefersReducedMotion ? 0.2 : 0.35,
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

/* =========================
   Chapter 3: Forked Path Selection
   ========================= */

const PATH_STORAGE_KEY = "selectedPath";
const choosePathBtn = document.getElementById("choosePathBtn");
const wizardCard = document.querySelector(".fork-card--wizard");
const sorcererCard = document.querySelector(".fork-card--sorcerer");

function setSelectedPath(card, { animate = true } = {}) {
  if (!wizardCard || !sorcererCard) return;

  wizardCard.classList.remove("is-selected");
  sorcererCard.classList.remove("is-selected");
  card.classList.add("is-selected");

  const chosen = card.classList.contains("fork-card--wizard") ? "wizard" : "sorcerer";
  localStorage.setItem(PATH_STORAGE_KEY, chosen);

  if (choosePathBtn) {
    choosePathBtn.textContent = chosen === "wizard" ? "Chosen: Wizard" : "Chosen: Sorcerer";
  }

  if (animate && hasGSAP) {
    gsap.fromTo(card, { scale: 0.98 }, { scale: 1, duration: 0.25, ease: "power2.out" });
  }
}

if (wizardCard && sorcererCard) {
  [wizardCard, sorcererCard].forEach((card) => {
    card.tabIndex = 0;

    card.addEventListener("click", () => setSelectedPath(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelectedPath(card);
      }
    });
  });
}

choosePathBtn?.addEventListener("click", () => {
  if (!wizardCard || !sorcererCard) return;

  const wizardSelected = wizardCard.classList.contains("is-selected");
  const sorcererSelected = sorcererCard.classList.contains("is-selected");

  if (!wizardSelected && !sorcererSelected) {
    setSelectedPath(wizardCard);
  } else if (wizardSelected) {
    setSelectedPath(sorcererCard);
  } else {
    setSelectedPath(wizardCard);
  }
});

const savedPath = localStorage.getItem(PATH_STORAGE_KEY);
if (savedPath === "wizard" && wizardCard) setSelectedPath(wizardCard, { animate: false });
if (savedPath === "sorcerer" && sorcererCard) setSelectedPath(sorcererCard, { animate: false });

/* =========================
   Flow Fade (Scroll-linked)
   ========================= */

if (hasGSAP && hasScrollTrigger) {
  gsap.utils.toArray(".flow").forEach((el) => {
    gsap.set(el, { opacity: 0, y: 18 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 10%",
        scrub: true
      }
    });

    tl.to(el, { opacity: 1, y: 0, ease: "sine.out", duration: 0.45 })
      .to(el, { opacity: 1, y: 0, duration: 0.3 })
      .to(el, { opacity: 0, y: -12, ease: "sine.in", duration: 0.45 });
  });
}

/* =========================
   Reset Button Behavior
   ========================= */

const resetFieldBtn = document.getElementById("resetField");
if (resetFieldBtn) resetFieldBtn.hidden = true;

window.addEventListener("scroll", () => {
  if (!resetFieldBtn) return;
  resetFieldBtn.hidden = window.scrollY < 400;
});

function resetWizard() {
  if (!hasGSAP) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const state = { y: window.scrollY };
  gsap.timeline({ overwrite: true }).to(state, {
    y: 0,
    duration: 1.35,
    ease: "sine.inOut",
    onUpdate: () => window.scrollTo(0, state.y)
  });
}

function resetSorcerer() {
  if (!hasGSAP) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const state = { y: window.scrollY };

  gsap.timeline({ overwrite: true })
    .to(state, {
      y: 120,
      duration: 0.5,
      ease: "power4.out",
      onUpdate: () => window.scrollTo(0, state.y)
    })
    .to(state, {
      y: 0,
      duration: 0.35,
      ease: "back.out(2.4)",
      onUpdate: () => window.scrollTo(0, state.y)
    });
}

resetFieldBtn?.addEventListener("click", () => {
  const chosen = localStorage.getItem(PATH_STORAGE_KEY);
  if (chosen === "sorcerer") resetSorcerer();
  else resetWizard();
});

/* =========================
   Code Typing Animations
   ========================= */

if (hasGSAP) {
  const typingTargets = gsap.utils.toArray("pre code, p code, li code, .inline-link");

  typingTargets.forEach((el) => {
    if (el.children.length > 0) return;

    const originalText = el.textContent;
    if (!originalText || !originalText.trim()) return;

    if (prefersReducedMotion) {
      el.textContent = originalText;
      return;
    }

    el.textContent = "";

    const typingState = { count: 0 };
    const typingDuration = Math.min(2.4, Math.max(0.8, originalText.length * 0.03));

    const playTyping = () => {
      gsap.to(typingState, {
        count: originalText.length,
        duration: typingDuration,
        ease: "none",
        onUpdate: () => {
          el.textContent = originalText.slice(0, Math.floor(typingState.count));
        }
      });
    };

    if (hasScrollTrigger) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: playTyping
      });
    } else {
      playTyping();
    }
  });
}
if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
  gsap.utils.toArray(".section--chapter").forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });
}
