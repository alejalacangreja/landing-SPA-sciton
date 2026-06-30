import { initScrollReveal } from "./scroll-reveal.js";
import { initAccordion } from "./accordion.js";
import { initCarousel } from "./carousel.js";
import { initStickyNav } from "./nav-sticky.js";
import { initAnnouncementBar } from "./announcement-bar.js";
import { initConsultForm } from "./form-validation.js";

initScrollReveal();
initAccordion("#faq-accordion");
initCarousel({
  root: "#ba-carousel",
  track: "#ba-carousel-track",
  prevBtn: "#ba-prev",
  nextBtn: "#ba-next",
  dotsContainer: "#ba-dots",
});
initStickyNav();
initAnnouncementBar();
initConsultForm();
