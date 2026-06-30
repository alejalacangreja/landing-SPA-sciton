import { qs } from "./utils.js";

// Adds a subtle elevated shadow to the sticky header once the page has
// scrolled past the hero, so it reads as "floating" only when needed.
export function initStickyNav() {
  const header = qs("#site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
