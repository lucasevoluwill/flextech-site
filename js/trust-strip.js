"use strict";

// One message per slide on every screen. No checkout or tracking integration.
document.addEventListener("DOMContentLoaded", () => {
  const strip = document.querySelector("[data-trust-strip]");
  if (!strip) return;
  const track = strip.querySelector("[data-trust-track]");
  const messages = Array.from(strip.querySelectorAll("[data-trust-message]"));
  const toggle = strip.querySelector("[data-trust-toggle]");
  const previous = strip.querySelector("[data-trust-prev]");
  const next = strip.querySelector("[data-trust-next]");
  const pips = Array.from(strip.querySelectorAll("[data-trust-pip]"));
  const position = strip.querySelector("[data-trust-position]");
  const progress = strip.querySelector("[data-trust-progress]");
  if (!track || !toggle || !previous || !next || messages.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cycle = 3800;
  let index = 0;
  let paused = false;
  let keyboardFocus = false;
  let pointerInteracting = false;
  let inView = true;
  let timer;
  let progressAnimation;

  const schedule = () => {
    window.clearTimeout(timer);
    progressAnimation?.cancel();
    const stopped = paused || keyboardFocus || reducedMotion.matches;
    toggle.setAttribute("aria-label", stopped ? "Iniciar rotação das mensagens" : "Pausar rotação das mensagens");
    toggle.querySelector("[data-trust-toggle-icon]").textContent = stopped ? "▷" : "Ⅱ";
    toggle.disabled = reducedMotion.matches;
    if (reducedMotion.matches) toggle.setAttribute("aria-label", "Rotação automática desativada: movimento reduzido");
    track.setAttribute("aria-live", stopped ? "polite" : "off");
    const running = !stopped && !pointerInteracting && inView && !document.hidden;
    strip.dataset.rotating = String(running);
    if (running) {
      progressAnimation = progress?.animate?.([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: cycle, easing: "linear", fill: "forwards" });
      timer = window.setTimeout(() => { render(index + 1); schedule(); }, cycle);
    }
  };

  const render = (requested) => {
    index = (requested + messages.length) % messages.length;
    messages.forEach((message, itemIndex) => {
      const visible = itemIndex === index;
      message.classList.toggle("is-current", visible);
      message.setAttribute("aria-hidden", String(!visible));
      message.setAttribute("role", "group");
      message.setAttribute("aria-roledescription", "slide");
      message.setAttribute("aria-label", `${itemIndex + 1} de ${messages.length}`);
    });
    pips.forEach((pip, itemIndex) => pip.classList.toggle("is-current", itemIndex === index));
    if (position) position.textContent = `${String(index + 1).padStart(2, "0")} / ${String(messages.length).padStart(2, "0")}`;
  };

  toggle.addEventListener("click", () => {
    // An explicit start must work even while this button retains keyboard focus.
    paused = !(paused || keyboardFocus);
    keyboardFocus = false;
    schedule();
  });
  const advance = (step) => { render(index + step); schedule(); };
  previous.addEventListener("click", () => advance(-1));
  next.addEventListener("click", () => advance(1));
  // Pointer navigation restarts the cycle; it does not silently pause forever.
  strip.addEventListener("pointerdown", (event) => {
    pointerInteracting = true;
    if (!toggle.contains(event.target)) keyboardFocus = false;
    schedule();
  });
  const releasePointer = () => {
    if (!pointerInteracting) return;
    pointerInteracting = false;
    schedule();
  };
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);
  strip.addEventListener("focusin", (event) => {
    if (event.target !== toggle || !pointerInteracting) keyboardFocus = event.target.matches(":focus-visible");
    schedule();
  });
  strip.addEventListener("focusout", (event) => {
    if (!strip.contains(event.relatedTarget)) { keyboardFocus = false; schedule(); }
  });
  track.addEventListener("keydown", (event) => {
    const steps = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: messages.length - 1 - index };
    if (!Object.hasOwn(steps, event.key)) return;
    event.preventDefault();
    keyboardFocus = true;
    advance(steps[event.key]);
  });
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("pagehide", () => { window.clearTimeout(timer); progressAnimation?.cancel(); });
  window.addEventListener("pageshow", schedule);
  reducedMotion.addEventListener("change", schedule);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }).observe(strip);
  }

  render(0);
  previous.disabled = false;
  next.disabled = false;
  strip.classList.add("is-enhanced");
  schedule();
});
