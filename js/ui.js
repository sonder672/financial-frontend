// ==========================================
// UI Management Functions
// ==========================================

const loader = document.getElementById("loader");

/**
 * Show loading spinner
 */
export const showLoader = () => {
  loader?.classList.add("active");
};

/**
 * Hide loading spinner
 */
export const hideLoader = () => {
  loader?.classList.remove("active");
};

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (error, success, info)
 */
export const showToast = (message, type = "error") => {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    className: type,
    style: {
      background:
        type === "error"
          ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
          : type === "success"
            ? "linear-gradient(135deg, #047857 0%, #065f46 100%)"
            : "linear-gradient(135deg, #1a1a18 0%, #2d2d2a 100%)",
    },
  }).showToast();
};

/**
 * Add error state to input field
 * @param {HTMLElement} input - The input element
 */
export const addError = (input) => {
  input?.classList.add("error");
};

/**
 * Remove error state from input field
 * @param {HTMLElement} input - The input element
 */
export const removeError = (input) => {
  input?.classList.remove("error");
};
