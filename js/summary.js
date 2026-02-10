// ==========================================
// Summary Management
// ==========================================

import { formatCurrency } from "./utils.js";
import { getMovements } from "./movements.js";

/**
 * Update summary with provided totals from API
 * @param {number} totalIncome - Total income amount
 * @param {number} totalExpenses - Total expenses amount
 * @param {number} balance - Current balance
 * @param {number} year - Year for the totals
 * @param {number} month - Month for the totals
 */
export const updateSummaryWithTotals = (
  totalIncome = 0,
  totalExpenses = 0,
  balance = 0,
  year,
  month,
) => {
  const balanceAmount = document.querySelector(".balance-amount");
  if (balanceAmount) {
    balanceAmount.textContent = formatCurrency(balance);
  }

  const monthlyIncome = document.getElementById("monthlyIncome");
  const monthlyExpense = document.getElementById("monthlyExpense");
  const monthlyBalance = document.getElementById("monthlyBalance");

  if (monthlyIncome) {
    monthlyIncome.textContent = formatCurrency(totalIncome);
  }

  if (monthlyExpense) {
    monthlyExpense.textContent = formatCurrency(totalExpenses);
  }

  if (monthlyBalance) {
    monthlyBalance.textContent = formatCurrency(balance);

    monthlyBalance.classList.remove("income", "expense", "balance");

    if (balance > 0) {
      monthlyBalance.classList.add("income");
    } else if (balance < 0) {
      monthlyBalance.classList.add("expense");
    } else {
      monthlyBalance.classList.add("balance");
    }
  }

  const yearSelector = document.getElementById("yearSelector");
  const monthSelector = document.getElementById("monthSelector");

  if (year && yearSelector) yearSelector.value = year;
  if (month && monthSelector) monthSelector.value = month;
};

/**
 * Update summary by calculating from local movements
 */
export const updateSummary = () => {
  const movements = getMovements();

  const totalIncome = movements
    .filter((m) => (m.Type || m.type) === "income")
    .reduce((sum, m) => sum + Number(m.Amount || m.amount), 0);

  const totalExpense = movements
    .filter((m) => (m.Type || m.type) === "expense")
    .reduce((sum, m) => sum + Number(m.Amount || m.amount), 0);

  const balance = totalIncome - totalExpense;

  updateSummaryWithTotals(totalIncome, totalExpense, balance);
};

/**
 * Fetch and update totals from API
 * @param {Function} logout - Logout callback function
 */
export const updateTotalsFromAPI = async (logout) => {
  //TODO Próxima versión Bckend que entregue totales.
  /* try {
    const yearSelector = document.getElementById("yearSelector");
    const monthSelector = document.getElementById("monthSelector");

    const params = {};

    if (yearSelector?.value && monthSelector?.value) {
      params.year = parseInt(yearSelector.value, 10);
      params.month = parseInt(monthSelector.value, 10);
    }

    const response = await httpGet("GetTotals", params, true, logout);

    updateSummaryWithTotals(
      response.income,
      response.expense,
      response.balance,
      response.year,
      response.month
    );
  } catch (exception) {
    updateSummary();
  } */

  updateSummary();
};
