// ==========================================
// Header Management
// ==========================================

import { getMonthNames } from "./utils.js";

/**
 * Update header subtitle with month and user name
 * @param {string} email - User email
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year
 */
export const updateHeaderSubtitle = (email, month, year) => {
  const headerSubtitle = document.getElementById("headerSubtitle");
  
  if (!headerSubtitle) return;

  // Extract name from email (before @)
  const userName = email.split("@")[0];
  
  // Capitalize first letter
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Get month name
  const monthNames = getMonthNames();
  const monthName = month ? monthNames[month - 1] : monthNames[new Date().getMonth()];

  // Update subtitle
  headerSubtitle.textContent = `${capitalizedName} · ${monthName} ${year || new Date().getFullYear()}`;
};
