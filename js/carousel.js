import { qsa } from "./utils.js";

// Lightweight scroll-snap carousel controller (dots + arrows + keyboard).
// The track itself is plain CSS scroll-snap (see components.css), so the
// carousel stays fully usable by scroll/swipe/keyboard even if this script
// fails to load — this only adds the dot/arrow affordances on top.
export function initCarousel({ root, track, prevBtn, nextBtn, dotsContainer }) {
  const rootEl = document.querySelector(root);
  const trackEl = document.querySelector(track);
  const dotsEl = document.querySelector(dotsContainer);
  if (!rootEl || !trackEl || !dotsEl) return;

  const slides = qsa(":scope > *", trackEl);
  let activeIndex = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "ba-carousel__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to result ${i + 1} of ${slides.length}`);
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const dots = qsa(".ba-carousel__dot", dotsEl);

  function setActive(index) {
    activeIndex = index;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    slides[clamped].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  document.querySelector(prevBtn)?.addEventListener("click", () => goTo(activeIndex - 1));
  document.querySelector(nextBtn)?.addEventListener("click", () => goTo(activeIndex + 1));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          setActive(slides.indexOf(entry.target));
        }
      });
    },
    { root: trackEl, threshold: [0.6] }
  );
  slides.forEach((slide) => observer.observe(slide));

  setActive(0);

  rootEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });
}
