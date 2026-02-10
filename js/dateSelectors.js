// ==========================================
// Date Selector Management
// ==========================================

import { getMonthNames } from "./utils.js";

/**
 * Populate year selector with years from 2026 to current year
 */
export const populateYearSelector = () => {
  const yearSelector = document.getElementById("yearSelector");
  const currentYear = new Date().getFullYear();
  const startYear = 2026;

  for (let year = currentYear; year >= startYear; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelector.appendChild(option);
  }
};

/**
 * Populate month selector based on selected year
 * @param {string} selectedYear - The selected year
 * @param {number} defaultMonth - Default month to select (optional)
 */
export const populateMonthSelector = (selectedYear, defaultMonth = null) => {
  const monthSelector = document.getElementById("monthSelector");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const monthNames = getMonthNames();

  // Clear existing options
  monthSelector.innerHTML = "";

  if (!selectedYear) {
    // If no year selected, show all 12 months
    monthNames.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = name;
      monthSelector.appendChild(option);
    });
  } else {
    const year = parseInt(selectedYear, 10);

    if (year === currentYear) {
      // For current year, only show months up to current month
      for (let i = 0; i < currentMonth; i++) {
        const option = document.createElement("option");
        option.value = i + 1;
        option.textContent = monthNames[i];
        monthSelector.appendChild(option);
      }
    } else {
      // For past years, show all 12 months
      monthNames.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = name;
        monthSelector.appendChild(option);
      });
    }
  }

  // Set default month if provided
  if (
    defaultMonth &&
    monthSelector.querySelector(`option[value="${defaultMonth}"]`)
  ) {
    monthSelector.value = defaultMonth;
  }
};

/**
 * Set date input restrictions to current month only
 */
export const setDateRestrictions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  // First day of current month
  const minDate = `${year}-${month}-01`;

  // Last day of current month
  const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
  const maxDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  const incomeDateInput = document.getElementById("income-date");
  const expenseDateInput = document.getElementById("expense-date");

  if (incomeDateInput) {
    incomeDateInput.setAttribute("min", minDate);
    incomeDateInput.setAttribute("max", maxDate);
  }

  if (expenseDateInput) {
    expenseDateInput.setAttribute("min", minDate);
    expenseDateInput.setAttribute("max", maxDate);
  }
};
