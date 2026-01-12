"use strict";
console.log("ResumeFill content script running");
const firstName = document.getElementById("first_name");
const lastNameInput = document.getElementById("last_name");
const emailInput = document.getElementById("email");
;
const phoneInput = document.getElementById("phone");
;
function setReactInputValue(input, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!valueSetter) {
        throw new Error("Unable to find native input value setter");
    }
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
}
