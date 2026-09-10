"use strict";

// The three source reviews remain readable without JavaScript or animation.
document.addEventListener("DOMContentLoaded", () => {
  const feed = document.querySelector("[data-review-feed]");
  if (!feed || !Element.prototype.animate || !window.ResizeObserver || !window.IntersectionObserver) return;
  const viewport = feed.querySelector("[data-review-viewport]");
  const track = feed.querySelector("[data-review-track]");
  const group = feed.querySelector("[data-review-group]");
  const toggle = feed.querySelector("[data-review-toggle]");
  const previous = feed.querySelector("[data-review-prev]");
  const next = feed.querySelector("[data-review-next]");
  if (!viewport || !track || !group || !toggle || !previous || !next) return;

  // Extra visual copies cover wide viewports; assistive technology reads only originals.
  for (let i = 0; i < 2; i += 1) {
    const copy = group.cloneNode(true);
    copy.removeAttribute("data-review-group");
    copy.setAttribute("data-review-copy", "");
    copy.setAttribute("aria-hidden", "true");
    copy.inert = true;
    track.append(copy);
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation;
  let duration = 1;
  let paused = false;
  let hovering = false;
  let keyboardFocus = false;
  let inView = false;

  const sync = () => {
    const stopped = paused || keyboardFocus || reduced.matches;
    const running = !stopped && !hovering && inView && !document.hidden;
    if (animation) running ? animation.play() : animation.pause();
    feed.dataset.running = String(running);
    toggle.disabled = reduced.matches;
    toggle.setAttribute("aria-label", reduced.matches ? "Movimento automático desativado" : stopped ? "Iniciar movimento das avaliações" : "Pausar movimento das avaliações");
    toggle.querySelector("span").textContent = stopped ? "▷" : "Ⅱ";
  };
  const setup = () => {
    const phase = animation ? (Number(animation.currentTime) % duration) / duration : 0;
    animation?.cancel();
    animation = null;
    feed.classList.toggle("is-enhanced", !reduced.matches);
    if (!reduced.matches) {
      const distance = group.getBoundingClientRect().width;
      duration = distance / 26 * 1000;
      animation = track.animate([{ transform: "translateX(0)" }, { transform: `translateX(-${distance}px)` }], { duration, iterations: Infinity, easing: "linear" });
      animation.currentTime = phase * duration;
    }
    sync();
  };
  const step = (direction) => {
    paused = true;
    if (animation) {
      const count = group.children.length;
      const current = Number(animation.currentTime) % duration;
      const card = Math.floor(current / (duration / count) + 0.0001);
      // Manual navigation aligns a whole card even when playback stopped mid-card.
      animation.currentTime = ((card + direction + count) % count) * duration / count;
    } else {
      viewport.scrollBy({ left: direction * group.getBoundingClientRect().width / group.children.length, behavior: "auto" });
    }
    sync();
  };
  previous.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  toggle.addEventListener("click", () => {
    paused = !(paused || keyboardFocus);
    hovering = false;
    keyboardFocus = false;
    sync();
  });
  feed.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") { hovering = true; sync(); } });
  feed.addEventListener("pointerleave", () => { hovering = false; sync(); });
  viewport.addEventListener("pointerdown", () => { paused = true; sync(); });
  feed.addEventListener("focusin", (event) => { keyboardFocus = event.target.matches(":focus-visible"); sync(); });
  feed.addEventListener("focusout", (event) => { if (!feed.contains(event.relatedTarget)) { keyboardFocus = false; sync(); } });
  viewport.addEventListener("keydown", (event) => {
    if (reduced.matches || !["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") { paused = true; animation.currentTime = 0; sync(); }
    else step(event.key === "ArrowRight" ? 1 : -1);
  });
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pagehide", () => animation?.pause());
  window.addEventListener("pageshow", sync);
  reduced.addEventListener("change", setup);
  new ResizeObserver(setup).observe(group);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(viewport);
  previous.disabled = false;
  next.disabled = false;
  feed.classList.add("has-controls");
  setup();
});
