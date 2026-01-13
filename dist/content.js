"use strict";
console.log("ResumeFill content script running");
function findInputByType(fieldType) {
    const keywordsMap = {
        firstName: ["first name", "given name", "name", "full name"],
        lastName: ["last name", "surname", "family name"],
        email: ["email", "e-mail", "mail"],
        phone: ["phone", "phone number", "mobile", "tel"]
    };
    const keywords = keywordsMap[fieldType];
    // Search all input elements on the page
    const inputs = Array.from(document.querySelectorAll("input"));
    for (const input of inputs) {
        const textToCheck = [
            input.placeholder?.toLowerCase(),
            input.name?.toLowerCase(),
            input.id?.toLowerCase(),
            input.getAttribute("aria-label")?.toLowerCase()
        ].filter(Boolean);
        // If any keyword matches any of these
        if (textToCheck.some(text => keywords.some(k => text.includes(k)))) {
            return input;
        }
    }
    // Check labels if nothing found yet
    const labels = Array.from(document.querySelectorAll("label"));
    for (const label of labels) {
        const labelText = label.textContent?.toLowerCase();
        if (!labelText)
            continue;
        if (keywords.some(k => labelText.includes(k))) {
            const inputId = label.getAttribute("for");
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input)
                    return input;
            }
        }
    }
    return null; // Nothing found
}
function findInput(feildNames) {
    for (const name of feildNames) {
        // Try by ID
        const byId = document.getElementById(name);
        if (byId)
            return byId;
        // Try by name attribute
        const byName = document.querySelector(`Input[name="${name}"]`);
        if (byName)
            return byName;
        // Try by placeholder containing the name (case-insensitive)
        const byPlaceholder = Array.from(document.querySelectorAll("input"))
            .find(input => input.placeholder?.toLowerCase().includes(name.toLowerCase()));
        if (byPlaceholder)
            return byPlaceholder;
        // Try by label text
        const label = Array.from(document.querySelectorAll("label"))
            .find(l => l.textContent?.toLowerCase().includes(name.toLowerCase()));
        if (label) {
            const inputId = label.getAttribute("for");
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input)
                    return input;
            }
        }
    }
    return null;
}
function isLikelyFirstName(input) {
    const keywords = ["first name", "given name", "name"];
    return keywords.some(k => input.placeholder?.toLowerCase().includes(k) ||
        input.getAttribute("aria-label")?.toLowerCase().includes(k) ||
        input.name?.toLowerCase().includes(k));
}
/*
  Setter function for set value to input elements

  To be used throughout the application

*/
function setReactInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter)
        throw new Error("Cannot find native input value setter");
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
}
// Fill test values
const firstNameInput = findInputByType("firstName");
const lastNameInput = findInputByType("lastName");
const emailInput = findInputByType("email");
const phoneInput = findInputByType("phone");
// Set values safely
if (firstNameInput)
    setReactInputValue(firstNameInput, "Archit");
if (lastNameInput)
    setReactInputValue(lastNameInput, "Bhatt");
if (emailInput)
    setReactInputValue(emailInput, "archit@example.com");
if (phoneInput)
    setReactInputValue(phoneInput, "1234567890");
