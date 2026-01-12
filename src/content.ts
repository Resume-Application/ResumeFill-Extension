console.log("ResumeFill content script running");

const firstName = document.getElementById("first_name") as HTMLInputElement | null;
const lastNameInput = document.getElementById("last_name") as HTMLInputElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;;
const phoneInput = document.getElementById("phone") as HTMLInputElement | null;;

function setReactInputValue(
  input: HTMLInputElement,
  value: string
): void {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;

  if (!valueSetter) {
    throw new Error("Unable to find native input value setter");
  }

  valueSetter.call(input, value);

  input.dispatchEvent(
    new Event("input", { bubbles: true })
  );
}


