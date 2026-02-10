// ==========================================
// Utility Functions
// ==========================================

/**
 * Format a number as Colombian Peso currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Format a number input in real-time with thousand separators
 * @param {string} value - The input value
 * @returns {string} Formatted number with separators
 */
export const formatNumberInput = (value) => {
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) return "";

  // Format with thousand separators
  return new Intl.NumberFormat("es-CO").format(parseInt(numericValue, 10));
};

/**
 * Remove formatting from a formatted number string
 * @param {string} formattedValue - The formatted string
 * @returns {string} Clean numeric string
 */
export const unformatNumber = (formattedValue) => {
  return formattedValue.replace(/\./g, "").replace(/,/g, "");
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  // Support YYYY-MM-DD y YYYY-MM-DDTHH:mm:ssZ
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return `${day} ${months[month - 1]} ${year}`;
};

/**
 * Get category icon based on category and type
 * @param {string} category - The category name
 * @param {string} type - The movement type (income/expense)
 * @returns {string} Emoji icon
 */
export const getCategoryIcon = (category, type) => {
  const icons = {
    salary: "💰",
    occasional: "✨",
    food: "🛒",
    transport: "🚗",
    entertainment: "🎮",
    services: "💡",
    other: "📌",
  };

  return icons[category] || (type === "income" ? "💰" : "💸");
};

/**
 * Get current date restrictions for date inputs
 * @returns {object} Object with minDate and maxDate
 */
export const getDateRestrictions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  // First day of current month
  const minDate = `${year}-${month}-01`;

  // Last day of current month
  const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
  const maxDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  return { minDate, maxDate };
};

/**
 * Validate if a date is within the current month
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if date is in current month
 */
export const isCurrentMonth = (dateString) => {
  if (!dateString) return false;

  // dateString esperado: YYYY-MM-DD
  const [year, month] = dateString.split("-").map(Number);
  const today = new Date();

  return year === today.getFullYear() && month - 1 === today.getMonth();
};

/**
 * Get month names in Spanish
 * @returns {string[]} Array of month names
 */
export const getMonthNames = () => [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
