import { qsa } from "./utils.js";

// Generic accordion: toggles aria-expanded plus a .is-open class (the class
// is a fallback for the rare browser without CSS :has() support — see
// css/components.css .accordion__panel.is-open).
export function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const triggers = qsa(".accordion__trigger", container);

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.classList.toggle("is-open", !isOpen);
    });
  });
}
