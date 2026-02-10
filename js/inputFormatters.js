// ==========================================
// Input Formatters
// ==========================================

import { formatNumberInput, unformatNumber } from "./utils.js";

/**
 * Apply currency formatting to amount input fields
 * @param {HTMLInputElement} input - The input element to format
 */
export const applyCurrencyFormatting = (input) => {
  if (!input) return;

  // Store the actual numeric value in a data attribute
  let actualValue = "";

  input.addEventListener("input", (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;

    // Get clean numeric value
    const cleanValue = unformatNumber(e.target.value);
    actualValue = cleanValue;

    // Format for display
    const formattedValue = formatNumberInput(cleanValue);
    e.target.value = formattedValue;

    // Adjust cursor position after formatting
    const newLength = formattedValue.length;
    const lengthDiff = newLength - oldLength;
    const newCursorPosition = cursorPosition + lengthDiff;

    // Restore cursor position
    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
  });

  // When the form needs the actual value, provide it
  input.dataset.actualValue = actualValue;

  // Add a method to get the clean numeric value
  input.getNumericValue = () => {
    return unformatNumber(input.value);
  };
};

/**
 * Initialize currency formatting for all amount inputs
 */
export const initializeCurrencyInputs = () => {
  const incomeAmountInput = document.getElementById("income-amount");
  const expenseAmountInput = document.getElementById("expense-amount");

  applyCurrencyFormatting(incomeAmountInput);
  applyCurrencyFormatting(expenseAmountInput);
};

/**
 * Get the numeric value from a formatted input
 * @param {HTMLInputElement} input - The formatted input
 * @returns {string} Clean numeric value
 */
export const getNumericValue = (input) => {
  return input.getNumericValue
    ? input.getNumericValue()
    : unformatNumber(input.value);
};
