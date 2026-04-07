export type inputType = HTMLInputElement | HTMLTextAreaElement;

export const showError = (input: inputType, message: string) => {
    const error = input.parentElement?.querySelector(".error-message");
    error.textContent = message;
    error.classList.remove("hidden")

    // add the border
    input.classList.remove("input-valid");
    input.classList.add("input-error");
}

export const clearError = (input: inputType) => {
    const error = input.parentElement?.querySelector(".error-message") as Element;
    error.textContent = "";
    error.classList.add("hidden")

    // add the border
    input.classList.remove("input-error");
}

export const showValid = (input: inputType) => {
        input.classList.add("input-valid");
}

export const removeClasses = (input: inputType) => {
    input.classList.remove("input-valid", "input-error");
}