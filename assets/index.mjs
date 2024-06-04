// Utils
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const isNumber = (value) =>
  value !== "" &&
  typeof value !== "object" &&
  typeof value !== "boolean" &&
  !Number.isNaN(Number(value));

// Notification vars
const notification = $(".notification");

// Dialogs vars
const greetings = $("#greetings");
const pin = $("#pin");

// Pinpad vars
const display = $(".panel__display input");
const clear = $(".panel__c");
const save = $(".panel__save");
const digits = $$(".panel__digit");
const hidden = $(".panel__hidden");
const show = $(".panel__show");
const message = $(".panel__message");
const form = $(".panel__container");

// Local storage logic
const PIN_LOCAL_STORAGE = "pin";
const hasPin = () => Boolean(localStorage.getItem(PIN_LOCAL_STORAGE));
const getPin = () => localStorage.getItem(PIN_LOCAL_STORAGE);
const setPin = (pin) => localStorage.setItem(PIN_LOCAL_STORAGE, pin);
const removePin = () => localStorage.removeItem(PIN_LOCAL_STORAGE);

const TRIES_LOCAL_STORAGE = "tries";
const NUM_TRIES = 3;
const getTries = () => localStorage.getItem(TRIES_LOCAL_STORAGE);
const removeTries = () => localStorage.removeItem(TRIES_LOCAL_STORAGE);
const hasTries = () => Number(getTries()) > 0;
const setTries = () => {
  const tries = getTries() || NUM_TRIES;
  localStorage.setItem(TRIES_LOCAL_STORAGE, tries);
  notification.setAttribute(TRIES_LOCAL_STORAGE, tries);
};
const substractTries = () => {
  const tries = getTries();
  localStorage.setItem(TRIES_LOCAL_STORAGE, tries - 1);
  notification.setAttribute(TRIES_LOCAL_STORAGE, tries - 1);
};

// Dialog logic
window.addEventListener("load", () => {
  if (!hasPin()) greetings.showModal();
  else pin.showModal();

  setTries();
});

const close = $$("dialog svg");

close.forEach((button) => {
  button.addEventListener("click", () => {
    greetings?.close();
    pin?.close();
    display.focus();
  });
});

// Pinpad logic
const showMessage = (text, type) => {
  message.textContent = text;
  message.dataset.show = true;
  message.dataset.theme = type;
};

const hideMessage = () => {
  message.textContent = "";
  message.dataset.show = false;
  message.dataset.theme = "";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  display.disabled = true;

  const value = display.value;

  if (value.length < 6) {
    showMessage("Incomplete", "error");
    setTimeout(hideMessage, 1000);
    return;
  }

  if (!isNumber(value)) {
    showMessage("Not number", "error");
    setTimeout(hideMessage, 1000);
    return;
  }

  if (!hasPin()) {
    showMessage("Saved", "success");
    setTimeout(() => {
      hideMessage();
      pin.showModal();
      display.disabled = false;
    }, 1000);
    setPin(value);
  } else {
    if (value === getPin()) {
      removePin();
      removeTries();
      showMessage("Correct", "success");
      setTimeout(
        () =>
          window.location.replace(
            "https://www.codebay-innovation.com/es/inicio/"
          ),
        1000
      );
      return;
    }

    substractTries();

    notification.style.setProperty("--translateY", 0);
    showMessage("WRONG", "error");

    setTimeout(() => {
      hideMessage();
      notification.style.setProperty("--translateY", "-100%");

      if (!hasTries()) {
        removePin();
        removeTries();
        window.location.replace("https://policia.es/_es/index.php");
      }


      display.disabled = false;
    }, 2000);
  }

  display.value = "";
});
hidden.addEventListener("click", () => (display.type = "text"));
show.addEventListener("click", () => (display.type = "password"));
clear.addEventListener("click", () => (display.value = ""));

digits.forEach((button) => {
  button.addEventListener("click", () => {
    if (!isNumber(display.value + button.textContent)) {
      showMessage("Not number", "error");
      setTimeout(hideMessage, 1000);
      return;
    }
    if (display.value.length >= 6) return;

    display.value += button.textContent;
  });
});

display.addEventListener("keydown", (event) => {
  event.preventDefault();

  const value = event.target.value;

  if (!isNumber(value) && value !== "") {
    showMessage("Not number", "error");
    setTimeout(hideMessage, 1000);
    return;
  }
  if (value >= 6) return;

  display.value = value;
});

document.addEventListener("keydown", (event) => {
  if (isNumber(event.key)) {
    const digit = [...digits].find(
      (button) => button.textContent === event.key
    );

    digit?.click();
  }

  if (event.key === "Backspace") {
    display.value = display.value.slice(0, -1);
  }

  if (event.key === "Escape") clear.click();
  if (event.key === "Enter") save.click();
});
