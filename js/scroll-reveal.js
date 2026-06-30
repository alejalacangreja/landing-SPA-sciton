import { qsa, prefersReducedMotion } from "./utils.js";

// One shared IntersectionObserver for every [data-reveal] element on the
// page, instead of one observer per node — keeps the scroll-reveal system
// cheap even with 12 sections worth of cards.
export function initScrollReveal() {
  const targets = qsa("[data-reveal]");
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}
