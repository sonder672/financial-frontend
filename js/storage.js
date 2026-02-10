// ==========================================
// Local Storage Management
// ==========================================

/**
 * Save selected month and year to localStorage
 * @param {number} year - Selected year
 * @param {number} month - Selected month
 */
export const saveSelectedDate = (year, month) => {
  localStorage.setItem("selected_year", year);
  localStorage.setItem("selected_month", month);
};

/**
 * Get saved month and year from localStorage
 * @returns {object} Object with year and month, or null if not saved
 */
export const getSavedDate = () => {
  const year = localStorage.getItem("selected_year");
  const month = localStorage.getItem("selected_month");

  if (year && month) {
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    };
  }

  return null;
};

/**
 * Save user email to localStorage
 * @param {string} email - User email
 */
export const saveUserEmail = (email) => {
  localStorage.setItem("user_email", email);
};

/**
 * Get saved user email from localStorage
 * @returns {string|null} User email or null
 */
export const getUserEmail = () => {
  return localStorage.getItem("user_email");
};

/**
 * Clear all saved preferences (except token)
 */
export const clearPreferences = () => {
  localStorage.removeItem("selected_year");
  localStorage.removeItem("selected_month");
  localStorage.removeItem("user_email");
};
