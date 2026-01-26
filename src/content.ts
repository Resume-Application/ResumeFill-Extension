/**
 * Main file to be converted to a content.js to be run as a script for the extension.
 * -> dist/content.js (after compiling)
 * 
 * @author Archit Bhatt
 */

// ==========================
// Existing code (UNCHANGED)
// ==========================

const jobPostingUrl = window.location.href;
console.log("Job posting url", jobPostingUrl);

console.log("ResumeFill content script running");

function getInputSignals(input: HTMLInputElement): string[] {
  return [
    input.id,
    input.name,
    input.placeholder,
    input.getAttribute("aria-label")!,
    input.closest("label")?.textContent!,
    document.querySelector(`label[for="${input.id}"]`)?.textContent!,
  ].filter(Boolean) as string[];
}

function findInputByType(
  fieldType: "firstName" | "lastName" | "email" | "phone"
): HTMLInputElement | null {
  const keywordsMap: Record<string, string[]> = {
    firstName: ["first name", "given name", "name", "full name"],
    lastName: ["last name", "surname", "family name"],
    email: ["email", "e-mail", "mail"],
    phone: ["phone", "phone number", "mobile", "tel"],
  };

  const keywords = keywordsMap[fieldType];
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("input")
  );

  for (const input of inputs) {
    const textToCheck = [
      input.placeholder?.toLowerCase(),
      input.name?.toLowerCase(),
      input.id?.toLowerCase(),
      input.getAttribute("aria-label")?.toLowerCase(),
    ].filter(Boolean) as string[];

    if (textToCheck.some(text => keywords.some(k => text.includes(k)))) {
      return input;
    }
  }

  const labels = Array.from(document.querySelectorAll("label"));
  for (const label of labels) {
    const labelText = label.textContent?.toLowerCase();
    if (!labelText) continue;

    if (keywords.some(k => labelText.includes(k))) {
      const inputId = label.getAttribute("for");
      if (inputId) {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) return input;
      }
    }
  }

  return null;
}

function findInput(feildNames: string[]): HTMLInputElement | null {
  for (const name of feildNames) {
    const byId = document.getElementById(name) as HTMLInputElement | null;
    if (byId) return byId;

    const byName = document.querySelector<HTMLInputElement>(
      `input[name="${name}"]`
    );
    if (byName) return byName;

    const byPlaceholder = Array.from(
      document.querySelectorAll<HTMLInputElement>("input")
    ).find(input =>
      input.placeholder?.toLowerCase().includes(name.toLowerCase())
    );
    if (byPlaceholder) return byPlaceholder;

    const label = Array.from(document.querySelectorAll("label")).find(l =>
      l.textContent?.toLowerCase().includes(name.toLowerCase())
    );

    if (label) {
      const inputId = label.getAttribute("for");
      if (inputId) {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) return input;
      }
    }
  }

  return null;
}

function isLikelyFirstName(input: HTMLInputElement): boolean {
  const keywords = ["first name", "given name", "name"];
  return keywords.some(
    k =>
      input.placeholder?.toLowerCase().includes(k) ||
      input.getAttribute("aria-label")?.toLowerCase().includes(k) ||
      input.name?.toLowerCase().includes(k)
  );
}

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  if (!setter) throw new Error("Cannot find native input value setter");
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Autofill test
const firstNameInput = findInputByType("firstName");
const lastNameInput = findInputByType("lastName");
const emailInput = findInputByType("email");
const phoneInput = findInputByType("phone");

if (firstNameInput) setReactInputValue(firstNameInput, "Archit");
if (lastNameInput) setReactInputValue(lastNameInput, "Bhatt");
if (emailInput) setReactInputValue(emailInput, "archit@example.com");
if (phoneInput) setReactInputValue(phoneInput, "1234567890");

// ==========================
// NEW CODE (Job extraction)
// ==========================

interface jobPostingDTO {
  title: string;
  location: string | null;
  work_type: string | null;
  url: string;
  created_at: string;
  role_description: string;
  low_pay_range: number | null;
  high_pay_range: number | null;
}

// -------- Helpers --------

function getVisibleText(el: Element | null): string {
  return el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function findFirstBySelectors(selectors: string[]): Element | null {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

// -------- Extractors --------

function extractJobTitle(): string {
  return getVisibleText(
    findFirstBySelectors([
      "h1",
      "h2",
      ".top-card-layout__title",
      "[data-testid='job-title']",
      "[class*='jobTitle']",
    ])
  );
}

function extractLocation(): string | null {
  const text = getVisibleText(
    findFirstBySelectors([
      ".top-card-layout__second-subline span",
      "[data-testid='job-location']",
      "[class*='location']",
    ])
  );
  return text || null;
}

function extractWorkType(): string | null {
  const text = document.body.innerText.toLowerCase();
  if (text.includes("remote")) return "remote";
  if (text.includes("hybrid")) return "hybrid";
  if (text.includes("on-site") || text.includes("onsite")) return "onsite";
  return null;
}

function extractRoleDescription(): string {
  return getVisibleText(
    findFirstBySelectors([
      "main",
      "article",
      ".job-description",
      ".description",
      "[data-testid='job-description']",
    ])
  );
}

function extractPayRange(): { low: number | null; high: number | null } {
  const text = document.body.innerText;
  const match = text.match(
    /\$([\d,]+)\s*(k)?\s*[-–]\s*\$([\d,]+)\s*(k)?/i
  );

  if (!match) return { low: null, high: null };

  const low =
    parseInt(match[1].replace(/,/g, ""), 10) * (match[2] ? 1000 : 1);
  const high =
    parseInt(match[3].replace(/,/g, ""), 10) * (match[4] ? 1000 : 1);

  return { low, high };
}

// -------- Aggregate --------

function extractJobPosting(): jobPostingDTO {
  const pay = extractPayRange();

  return {
    title: extractJobTitle(),
    location: extractLocation(),
    work_type: extractWorkType(),
    url: window.location.href,
    created_at: new Date().toISOString(),
    role_description: extractRoleDescription(),
    low_pay_range: pay.low,
    high_pay_range: pay.high,
  };
}



// -------- Run --------

const jobPosting = extractJobPosting();
console.log("Extracted job posting:", jobPosting);

chrome.runtime.sendMessage({
  type: "CREATE_JOB_POSTING",
  payload: {
    title: jobPosting.title,
    location: jobPosting.location,
    work_type: jobPosting.work_type,
    url: jobPosting.url,
    role_description: jobPosting.role_description,
    low_pay_range: jobPosting.low_pay_range,
    high_pay_range: jobPosting.high_pay_range
  }
});


// Optional: send to background
// chrome.runtime.sendMessage({
//   type: "JOB_POSTING_EXTRACTED",
//   payload: jobPosting,
// });
