// ==========================================
// Main Application Entry Point
// ==========================================

import { httpPost, httpGet } from "./api.js";
import {
  showLoader,
  hideLoader,
  showToast,
  addError,
  removeError,
} from "./ui.js";
import { isCurrentMonth } from "./utils.js";
import {
  populateYearSelector,
  populateMonthSelector,
  setDateRestrictions,
} from "./dateSelectors.js";
import {
  initializeCurrencyInputs,
  getNumericValue,
} from "./inputFormatters.js";
import {
  setMovements,
  getMovements,
  addMovement,
  renderMovements,
  deleteMovement as deleteMovementFunction,
  setFilter,
  toggleSortOrder,
  getSortOrder,
} from "./movements.js";
import { updateSummaryWithTotals, updateTotalsFromAPI } from "./summary.js";
import {
  saveSelectedDate,
  getSavedDate,
  saveUserEmail,
  getUserEmail,
  clearPreferences,
} from "./storage.js";
import { updateHeaderSubtitle } from "./header.js";

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // Initialize Application
  // ==========================================
  populateYearSelector();

  // Check if there's a saved date preference
  const savedDate = getSavedDate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (savedDate) {
    // Use saved date
    const yearSelector = document.getElementById("yearSelector");
    if (yearSelector) yearSelector.value = savedDate.year;
    populateMonthSelector(savedDate.year.toString(), savedDate.month);
  } else {
    // Use current date
    const yearSelector = document.getElementById("yearSelector");
    if (yearSelector) yearSelector.value = currentYear;
    populateMonthSelector(currentYear.toString(), currentMonth);
  }

  setDateRestrictions();
  initializeCurrencyInputs();

  // ==========================================
  // Logout Function
  // ==========================================
  const logout = () => {
    localStorage.removeItem("access_token");
    clearPreferences();
    document.getElementById("loginContainer").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    setMovements([]);
  };

  checkExistingLogin();

  // Make deleteMovement available globally for onclick handlers
  window.deleteMovement = (movementId) => {
    deleteMovementFunction(movementId, logout, () =>
      updateTotalsFromAPI(logout),
    );
  };

  // ==========================================
  // Check for Existing Login
  // ==========================================
  async function checkExistingLogin() {
    const token = localStorage.getItem("access_token");

    if (token) {
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("appContainer").style.display = "block";

      try {
        showLoader();

        const responseMovements = await httpGet(
          "GetMovements",
          {},
          true,
          logout,
        );

        setMovements(responseMovements.movements || []);
        renderMovements(getMovements());
        updateSummaryWithTotals(
          responseMovements.income,
          responseMovements.expense,
          responseMovements.balance,
          responseMovements.year,
          responseMovements.month,
        );

        // Update header with user email and current/saved month
        const userEmail = getUserEmail();
        if (userEmail) {
          const yearSelector = document.getElementById("yearSelector");
          const monthSelector = document.getElementById("monthSelector");
          updateHeaderSubtitle(
            userEmail,
            parseInt(monthSelector?.value || new Date().getMonth() + 1),
            parseInt(yearSelector?.value || new Date().getFullYear()),
          );
        }
      } catch (exception) {
        logout();
      } finally {
        hideLoader();
      }
    }
  }

  // ==========================================
  // Login Form Handler
  // ==========================================
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  loginEmail?.addEventListener("input", () => removeError(loginEmail));
  loginPassword?.addEventListener("input", () => removeError(loginPassword));

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    let hasError = false;

    if (!email) {
      addError(loginEmail);
      hasError = true;
    }

    if (!password) {
      addError(loginPassword);
      hasError = true;
    }

    if (hasError) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    try {
      showLoader();

      const responseLogin = await httpPost("validateUser", { email, password });
      localStorage.setItem("access_token", responseLogin.access_token);

      // Save user email
      saveUserEmail(email);

      showToast(`¡Bienvenido ${email}!`, "success");

      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("appContainer").style.display = "block";

      const responseMovements = await httpGet("GetMovements", {}, true, logout);

      setMovements(responseMovements.movements || []);
      renderMovements(getMovements());
      updateSummaryWithTotals(
        responseMovements.income,
        responseMovements.expense,
        responseMovements.balance,
        responseMovements.year,
        responseMovements.month,
      );

      // Update header with user info
      const yearSelector = document.getElementById("yearSelector");
      const monthSelector = document.getElementById("monthSelector");
      updateHeaderSubtitle(
        email,
        parseInt(monthSelector?.value || new Date().getMonth() + 1),
        parseInt(yearSelector?.value || new Date().getFullYear()),
      );
    } catch (exception) {
      const message = JSON.parse(exception.message);

      showToast(
        message.response ||
          "No se pudo iniciar sesión. Verifica tus credenciales.",
        "error",
      );
    } finally {
      hideLoader();
    }
  });

  // ==========================================
  // Year/Month Selector Handlers
  // ==========================================
  const yearSelector = document.getElementById("yearSelector");
  yearSelector?.addEventListener("change", (e) => {
    const monthSelector = document.getElementById("monthSelector");
    const currentMonth = monthSelector?.value;
    populateMonthSelector(e.target.value, currentMonth);

    // Save selection
    if (monthSelector?.value) {
      saveSelectedDate(parseInt(e.target.value), parseInt(monthSelector.value));

      // Update header
      const userEmail = getUserEmail();
      if (userEmail) {
        updateHeaderSubtitle(
          userEmail,
          parseInt(monthSelector.value),
          parseInt(e.target.value),
        );
      }
    }

    filterByDate();
  });

  const monthSelector = document.getElementById("monthSelector");
  monthSelector?.addEventListener("change", (e) => {
    // Save selection
    const year = yearSelector?.value;
    if (year) {
      saveSelectedDate(parseInt(year), parseInt(e.target.value));

      // Update header
      const userEmail = getUserEmail();
      if (userEmail) {
        updateHeaderSubtitle(
          userEmail,
          parseInt(e.target.value),
          parseInt(year),
        );
      }
    }

    filterByDate();
  });

  // ==========================================
  // Date Filter Function
  // ==========================================
  async function filterByDate() {
    const selectedYear = yearSelector?.value;
    const selectedMonth = monthSelector?.value;

    if ((selectedYear && !selectedMonth) || (!selectedYear && selectedMonth)) {
      showToast("Selecciona tanto el año como el mes para filtrar", "info");
      return;
    }

    if (!selectedYear || !selectedMonth) {
      try {
        showLoader();

        const responseMovements = await httpGet(
          "GetMovements",
          {},
          true,
          logout,
        );

        setMovements(responseMovements.movements || []);
        renderMovements(getMovements());
        updateSummaryWithTotals(
          responseMovements.income,
          responseMovements.expense,
          responseMovements.balance,
          responseMovements.year,
          responseMovements.month,
        );

        showToast("Mostrando todos los movimientos", "info");
      } catch (exception) {
        const message = JSON.parse(exception.message);
        showToast(
          message.response || "No se pudieron cargar los movimientos.",
          "error",
        );
      } finally {
        hideLoader();
      }
      return;
    }

    try {
      showLoader();

      const monthNumber = parseInt(selectedMonth, 10);
      const yearNumber = parseInt(selectedYear, 10);

      const monthNames = [
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

      const responseMovements = await httpGet(
        "GetMovements",
        { year: yearNumber, month: monthNumber },
        true,
        logout,
      );

      setMovements(responseMovements.movements || []);
      renderMovements(getMovements());
      updateSummaryWithTotals(
        responseMovements.income,
        responseMovements.expense,
        responseMovements.balance,
        responseMovements.year,
        responseMovements.month,
      );

      showToast(
        `Mostrando ${monthNames[monthNumber - 1]} ${yearNumber}`,
        "info",
      );
    } catch (exception) {
      const message = JSON.parse(exception.message);
      showToast(
        message.response || "No se pudieron cargar los movimientos del mes.",
        "error",
      );
    } finally {
      hideLoader();
    }
  }

  // ==========================================
  // Tab Management
  // ==========================================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const transactionForms = document.querySelectorAll(".transaction-form");

  const switchTab = (targetTab) => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    transactionForms.forEach((form) => form.classList.remove("active"));

    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const activeForm = document.getElementById(targetTab);

    if (activeButton && activeForm) {
      activeButton.classList.add("active");
      activeForm.classList.add("active");
    }
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;
      switchTab(targetTab);
    });
  });

  // ==========================================
  // Filter Buttons
  // ==========================================
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all filter buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Get filter type and apply it
      const filterType = button.dataset.filter;
      setFilter(filterType);

      // Re-render movements with the new filter
      renderMovements(getMovements());

      console.log(`Filtering by: ${filterType}`);
    });
  });

  // ==========================================
  // Sort Button Handler
  // ==========================================
  const sortBtn = document.getElementById("sortBtn");
  const sortIcon = document.querySelector(".sort-icon");

  sortBtn?.addEventListener("click", () => {
    toggleSortOrder();
    const currentSort = getSortOrder();

    // Update button text and icon
    if (currentSort === "desc") {
      sortIcon.textContent = "↓";
      sortBtn.innerHTML = '<span class="sort-icon">↓</span> Más recientes';
    } else {
      sortIcon.textContent = "↑";
      sortBtn.innerHTML = '<span class="sort-icon">↑</span> Más antiguos';
    }

    // Re-render with new sort
    renderMovements(getMovements());
  });

  // ==========================================
  // Date Filter Handler
  // ==========================================
  const dateFilter = document.getElementById("dateFilter");
  const clearDateFilter = document.getElementById("clearDateFilter");
  let originalMovements = [];

  dateFilter?.addEventListener("change", (e) => {
    const selectedDate = e.target.value;

    if (!selectedDate) {
      // If cleared, show all movements
      if (originalMovements.length > 0) {
        setMovements(originalMovements);
        renderMovements(getMovements());
        originalMovements = [];
      }
      clearDateFilter.style.display = "none";
      return;
    }

    // Save original movements before filtering
    if (originalMovements.length === 0) {
      originalMovements = [...getMovements()];
    }

    // Filter movements by exact date (ignoring time and timezone)
    const movements = originalMovements;
    const [year, month, day] = selectedDate.split("-").map(Number);

    const filtered = movements.filter((m) => {
      const movementDate = new Date(m.Date || m.date);

      // Compare year, month, and day separately to avoid timezone issues
      return (
        movementDate.getFullYear() === year &&
        movementDate.getMonth() === month - 1 && // JavaScript months are 0-indexed
        movementDate.getDate() === day
      );
    });

    // Set filtered movements and render
    setMovements(filtered);
    renderMovements(filtered);

    // Show clear button
    clearDateFilter.style.display = "flex";

    // Show message if no results
    if (filtered.length === 0) {
      showToast("No hay movimientos en esta fecha", "info");
    } else {
      showToast(`${filtered.length} movimiento(s) encontrado(s)`, "info");
    }
  });

  // Clear date filter button
  clearDateFilter?.addEventListener("click", () => {
    dateFilter.value = "";
    if (originalMovements.length > 0) {
      setMovements(originalMovements);
      renderMovements(getMovements());
      originalMovements = [];
    }
    clearDateFilter.style.display = "none";
    showToast("Filtro de fecha eliminado", "info");
  });

  // ==========================================
  // Mobile Modal Management
  // ==========================================
  const fabIncome = document.getElementById("fabIncome");
  const fabExpense = document.getElementById("fabExpense");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalBody = document.getElementById("modalBody");
  const modalTitle = document.getElementById("modalTitle");

  const openModal = (type) => {
    const form =
      type === "income"
        ? document.getElementById("income-form").cloneNode(true)
        : document.getElementById("expense-form").cloneNode(true);

    form.classList.add("active");

    modalTitle.textContent =
      type === "income" ? "Agregar Ingreso" : "Agregar Gasto";

    modalBody.innerHTML = "";
    modalBody.appendChild(form);

    modalOverlay.classList.add("active");

    // Re-initialize currency formatting for cloned inputs
    const amountInput = form.querySelector(
      type === "income" ? "#income-amount" : "#expense-amount",
    );

    if (amountInput) {
      // Simple formatting for modal (without full initialization)
      amountInput.addEventListener("input", (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value) {
          e.target.value = new Intl.NumberFormat("es-CO").format(
            parseInt(value, 10),
          );
        }
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (type === "income") {
        const incomeType = form.querySelector("#income-type").value;
        const incomeDescription = form
          .querySelector("#income-description")
          .value.trim();
        const incomeAmount = form.querySelector("#income-amount").value.trim();
        const incomeDate = form.querySelector("#income-date").value;

        if (!incomeDescription || !incomeAmount || !incomeDate) {
          showToast(
            "Por favor completa todos los campos correctamente",
            "error",
          );
          return;
        }

        const typeLabel =
          incomeType === "salary" ? "Salario mensual" : "Ingreso ocasional";
        const fullDescription = `${typeLabel} - ${incomeDescription}`;

        const formData = {
          category: incomeType,
          description: fullDescription,
          amount: incomeAmount.replace(/\./g, ""),
          date: incomeDate,
        };

        const success = await createMovement(formData, "income");
        if (success) closeModal();
      } else {
        const expenseDescription = form
          .querySelector("#expense-description")
          .value.trim();
        const expenseAmount = form
          .querySelector("#expense-amount")
          .value.trim();
        const expenseDate = form.querySelector("#expense-date").value;
        const expenseCategory = form.querySelector("#expense-category").value;

        if (!expenseDescription || !expenseAmount || !expenseDate) {
          showToast(
            "Por favor completa todos los campos correctamente",
            "error",
          );
          return;
        }

        const formData = {
          category: expenseCategory,
          description: expenseDescription,
          amount: expenseAmount.replace(/\./g, ""),
          date: expenseDate,
        };

        const success = await createMovement(formData, "expense");
        if (success) closeModal();
      }
    });
  };

  const closeModal = () => {
    modalOverlay.classList.remove("active");
    modalBody.innerHTML = "";
  };

  fabIncome?.addEventListener("click", () => openModal("income"));
  fabExpense?.addEventListener("click", () => openModal("expense"));
  modalClose?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // ==========================================
  // Create Movement Function
  // ==========================================
  async function createMovement(formData, type) {
    try {
      showLoader();

      const movementData = {
        Category: formData.category,
        Type: type,
        Amount: parseFloat(formData.amount),
        Description: formData.description,
        Date: formData.date,
      };

      const response = await httpPost(
        "CreateMovement",
        movementData,
        true,
        logout,
      );

      const newMovement = {
        id: response.Id || response.id || Date.now(),
        userId: response.UserId || response.userId || null,
        category: movementData.Category,
        type: movementData.Type,
        amount: movementData.Amount,
        description: movementData.Description,
        date: movementData.Date,
      };

      addMovement(newMovement);
      renderMovements(getMovements());

      await updateTotalsFromAPI(logout);

      const successMessage =
        type === "income"
          ? "¡Ingreso agregado exitosamente!"
          : "¡Gasto agregado exitosamente!";
      showToast(successMessage, "success");

      return true;
    } catch (exception) {
      const message = JSON.parse(exception.message);

      showToast(
        message.response ||
          `No se pudo agregar el ${type === "income" ? "ingreso" : "gasto"}. Inténtalo de nuevo.`,
        "error",
      );

      return false;
    } finally {
      hideLoader();
    }
  }

  // ==========================================
  // Income Form Handler
  // ==========================================
  const incomeForm = document.getElementById("income-form");

  incomeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const incomeType = document.getElementById("income-type").value;
    const incomeDescription = document
      .getElementById("income-description")
      .value.trim();
    const incomeAmountInput = document.getElementById("income-amount");
    const incomeAmount = getNumericValue(incomeAmountInput);
    const incomeDate = document.getElementById("income-date").value;

    let hasError = false;
    const incomeDescInput = document.getElementById("income-description");
    const incomeDateInput = document.getElementById("income-date");

    incomeDescInput.classList.remove("error");
    incomeAmountInput.classList.remove("error");
    incomeDateInput.classList.remove("error");

    if (!incomeDescription) {
      incomeDescInput.classList.add("error");
      hasError = true;
    }

    if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
      incomeAmountInput.classList.add("error");
      hasError = true;
    }

    if (!incomeDate) {
      incomeDateInput.classList.add("error");
      hasError = true;
    } else if (!isCurrentMonth(incomeDate)) {
      incomeDateInput.classList.add("error");
      showToast("Solo puedes agregar movimientos del mes actual", "error");
      return;
    }

    if (hasError) {
      showToast("Por favor completa todos los campos correctamente", "error");
      return;
    }

    const typeLabel =
      incomeType === "salary" ? "Salario mensual" : "Ingreso ocasional";
    const fullDescription = `${typeLabel} - ${incomeDescription}`;

    const formData = {
      category: incomeType,
      description: fullDescription,
      amount: incomeAmount,
      date: incomeDate,
    };

    const success = await createMovement(formData, "income");

    if (success) {
      incomeForm.reset();
    }
  });

  // ==========================================
  // Expense Form Handler
  // ==========================================
  const expenseForm = document.getElementById("expense-form");

  expenseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const expenseDescription = document
      .getElementById("expense-description")
      .value.trim();
    const expenseAmountInput = document.getElementById("expense-amount");
    const expenseAmount = getNumericValue(expenseAmountInput);
    const expenseDate = document.getElementById("expense-date").value;
    const expenseCategory = document.getElementById("expense-category").value;

    let hasError = false;
    const expenseDescInput = document.getElementById("expense-description");
    const expenseDateInput = document.getElementById("expense-date");

    expenseDescInput.classList.remove("error");
    expenseAmountInput.classList.remove("error");
    expenseDateInput.classList.remove("error");

    if (!expenseDescription) {
      expenseDescInput.classList.add("error");
      hasError = true;
    }

    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      expenseAmountInput.classList.add("error");
      hasError = true;
    }

    if (!expenseDate) {
      expenseDateInput.classList.add("error");
      hasError = true;
    } else if (!isCurrentMonth(expenseDate)) {
      expenseDateInput.classList.add("error");
      showToast("Solo puedes agregar movimientos del mes actual", "error");
      return;
    }

    if (hasError) {
      showToast("Por favor completa todos los campos correctamente", "error");
      return;
    }

    const formData = {
      category: expenseCategory,
      description: expenseDescription,
      amount: expenseAmount,
      date: expenseDate,
    };

    const success = await createMovement(formData, "expense");

    if (success) {
      expenseForm.reset();
    }
  });

  // ==========================================
  // Clear Errors on Input
  // ==========================================
  const formInputs = document.querySelectorAll(".form-input");
  formInputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
    });
  });
});
