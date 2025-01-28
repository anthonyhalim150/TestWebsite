export const sanitizeInput = (input) => {
    if (typeof input === "string") {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    }
    return input; // Return non-string inputs unchanged
};
