import { qs } from "./utils.js";

const STORAGE_KEY = "rms-announcement-dismissed";

export function initAnnouncementBar() {
  const bar = qs("#announcement-bar");
  const dismissBtn = qs("#announcement-dismiss");
  if (!bar || !dismissBtn) return;

  if (sessionStorage.getItem(STORAGE_KEY) === "1") {
    bar.classList.add("is-dismissed");
    return;
  }

  dismissBtn.addEventListener("click", () => {
    bar.classList.add("is-dismissed");
    sessionStorage.setItem(STORAGE_KEY, "1");
  });
}
