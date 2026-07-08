import { parsePhoneNumber } from "https://esm.sh/libphonenumber-js@1.13.8/min";
import { RECAPTCHA_SITE_KEY } from "../config.js";
import { qs } from "./utils.js";

// Boulevard rejects contact creation when the phone number is malformed (e.g.
// too many digits), so we validate per-country with libphonenumber-js instead
// of a loose length check. Numbers without a "+" country code are assumed to
// be US, since that's where the spa is located and where most leads are from.
const DEFAULT_PHONE_COUNTRY = "US";

function parseLeadPhoneNumber(value) {
  try {
    return parsePhoneNumber(value, DEFAULT_PHONE_COUNTRY);
  } catch (error) {
    return undefined;
  }
}

const REQUIRED_FIELDS = [
  { id: "first-name", message: "Please enter your first name." },
  { id: "last-name", message: "Please enter your last name." },
  {
    id: "phone",
    message: "Please enter a valid phone number, including area code.",
    validate: (value) => Boolean(parseLeadPhoneNumber(value)?.isValid()),
  },
  { id: "email", message: "Please enter a valid email address." },
];

const REQUIRED_CHECKBOXES = [{ id: "consent", message: "Please agree to be contacted to continue." }];

export function initConsultForm() {
  const form = qs("#consult-form-element");
  if (!form) return;
  const statusEl = qs("#form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(form);

    let firstInvalidField = null;

    REQUIRED_FIELDS.forEach(({ id, message, validate }) => {
      const field = qs(`#${id}`, form);
      const errorEl = qs(`#${id}-error`);
      const value = field.value.trim();
      const isValid = value !== "" && field.checkValidity() && (!validate || validate(value));

      if (!isValid) {
        field.setAttribute("aria-invalid", "true");
        field.classList.add("is-invalid");
        if (errorEl) errorEl.textContent = message;
        firstInvalidField = firstInvalidField || field;
      }
    });

    REQUIRED_CHECKBOXES.forEach(({ id, message }) => {
      const field = qs(`#${id}`, form);
      const errorEl = qs(`#${id}-error`);

      if (!field.checked) {
        field.setAttribute("aria-invalid", "true");
        field.classList.add("is-invalid");
        if (errorEl) errorEl.textContent = message;
        firstInvalidField = firstInvalidField || field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      statusEl.textContent = "";
      return;
    }

    await submitForm(new FormData(form), statusEl, form);
  });
}

function clearErrors(form) {
  [...REQUIRED_FIELDS, ...REQUIRED_CHECKBOXES].forEach(({ id }) => {
    const field = qs(`#${id}`, form);
    const errorEl = qs(`#${id}-error`);
    field.removeAttribute("aria-invalid");
    field.classList.remove("is-invalid");
    if (errorEl) errorEl.textContent = "";
  });
}

// mainConcern/treatmentArea are chip checkboxes that share one name each, so a
// patient can pick several — Object.fromEntries would silently keep only the
// last one checked. getAll() collects every checked value, joined into a
// single comma-separated string since the Zapier/Boulevard integration
// expects a plain string (destined for a notes field), not a JSON array.
const MULTI_VALUE_FIELDS = ["mainConcern", "treatmentArea"];

function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("grecaptcha not loaded"));
      return;
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "submit_consultation" }).then(resolve, reject);
    });
  });
}

// Verifies reCAPTCHA and forwards the lead to Zapier in one server-side call
// (api/submit-lead.js) -- the real webhook URL never reaches the browser.
async function submitLead(payload) {
  try {
    const token = await getRecaptchaToken();
    const response = await fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload }),
    });
    if (!response.ok) return { success: false };
    return await response.json();
  } catch (error) {
    console.error("[consult-form] submission failed:", error);
    return { success: false };
  }
}

function setStatus(statusEl, message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

async function submitForm(formData, statusEl, form) {
  const submitButton = form ? qs('button[type="submit"]', form) : null;
  setStatus(statusEl, "Verifying you're not a robot...", false);
  if (submitButton) submitButton.disabled = true;

  const payload = Object.fromEntries(formData.entries());
  MULTI_VALUE_FIELDS.forEach((name) => {
    payload[name] = formData.getAll(name).join(", ");
  });
  // Validation already confirmed this parses; normalize to E.164 (e.g.
  // "+14075551234") so Boulevard always receives a clean, unambiguous format.
  payload.phone = parseLeadPhoneNumber(payload.phone).number;

  const result = await submitLead(payload);
  if (!result.success) {
    setStatus(statusEl, "We couldn't verify your submission. Please try again.", true);
    if (submitButton) submitButton.disabled = false;
    return;
  }

  goToThankYou(statusEl);
}

function goToThankYou(statusEl) {
  setStatus(statusEl, "Thank you — redirecting...", false);
  window.setTimeout(() => {
    window.location.href = "thank-you.html";
  }, 500);
}
