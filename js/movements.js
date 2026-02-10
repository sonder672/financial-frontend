// ==========================================
// Movement Management with Infinite Scroll
// ==========================================

import { formatCurrency, formatDate, getCategoryIcon } from "./utils.js";
import { showLoader, hideLoader, showToast } from "./ui.js";
import { httpDelete } from "./api.js";

let movements = [];
let currentFilter = "all"; // Estado del filtro actual
let sortOrder = "desc"; // "desc" = más reciente primero, "asc" = más antiguo primero

/**
 * Set movements array
 * @param {Array} movementsData - Array of movements
 */
export const setMovements = (movementsData) => {
  movements = movementsData;
};

/**
 * Get movements array
 * @returns {Array} Current movements
 */
export const getMovements = () => movements;

/**
 * Add movement to array
 * @param {Object} movement - Movement object to add
 */
export const addMovement = (movement) => {
  movements.push(movement);
};

/**
 * Remove movement from array
 * @param {string} movementId - ID of movement to remove
 */
export const removeMovement = (movementId) => {
  movements = movements.filter((m) => (m.Id || m.id) !== movementId);
};

/**
 * Set current filter
 * @param {string} filter - Filter type: 'all', 'income', or 'expense'
 */
export const setFilter = (filter) => {
  currentFilter = filter;
};

/**
 * Get current filter
 * @returns {string} Current filter
 */
export const getCurrentFilter = () => currentFilter;

/**
 * Toggle sort order
 */
export const toggleSortOrder = () => {
  sortOrder = sortOrder === "desc" ? "asc" : "desc";
};

/**
 * Get current sort order
 * @returns {string} Current sort order
 */
export const getSortOrder = () => sortOrder;

/**
 * Render movements in the transaction list with infinite scroll
 * @param {Array} movementsToRender - Movements to display
 */
export const renderMovements = (movementsToRender) => {
  const transactionList = document.querySelector(".transaction-list");

  if (!transactionList) return;

  // Clear existing movements
  transactionList.innerHTML = "";

  // Apply filter
  let filteredMovements = movementsToRender;
  if (currentFilter === "income") {
    filteredMovements = movementsToRender.filter(
      (m) => (m.Type || m.type) === "income",
    );
  } else if (currentFilter === "expense") {
    filteredMovements = movementsToRender.filter(
      (m) => (m.Type || m.type) === "expense",
    );
  }

  if (filteredMovements.length === 0) {
    const emptyMessage =
      currentFilter === "all"
        ? "No hay movimientos registrados"
        : currentFilter === "income"
          ? "No hay ingresos registrados"
          : "No hay gastos registrados";

    transactionList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-text-tertiary);">
        <p>${emptyMessage}</p>
      </div>
    `;

    return;
  }

  // Sort by date based on sortOrder
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    const dateA = new Date(a.Date || a.date);
    const dateB = new Date(b.Date || b.date);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Render all movements (no pagination)
  sortedMovements.forEach((movement) => {
    const transactionDiv = document.createElement("div");
    transactionDiv.className = `transaction ${movement.Type || movement.type}`;
    transactionDiv.dataset.id = movement.Id || movement.id;

    const icon = getCategoryIcon(
      movement.Category || movement.category,
      movement.Type || movement.type,
    );
    const formattedDate = formatDate(movement.Date || movement.date);

    transactionDiv.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
          <h3 class="transaction-name">${movement.Description || movement.description}</h3>
          <span class="transaction-date">${formattedDate}</span>
        </div>
      </div>
      <span class="transaction-amount ${movement.Type || movement.type}">${formatCurrency(movement.Amount || movement.amount)}</span>
      <button class="transaction-delete" onclick="deleteMovement('${movement.Id || movement.id}')">×</button>
    `;

    transactionList.appendChild(transactionDiv);
  });
};

/**
 * Delete movement (global function for onclick)
 * @param {string} movementId - ID of movement to delete
 * @param {Function} logout - Logout callback
 * @param {Function} updateTotalsCallback - Callback to update totals
 */
export const deleteMovement = async (
  movementId,
  logout,
  updateTotalsCallback,
) => {
  // Find the movement to show info in modal
  const movement = movements.find((m) => (m.Id || m.id) === movementId);

  if (!movement) return;

  // Show delete confirmation modal
  const modal = document.getElementById("deleteModalOverlay");
  const movementInfo = document.getElementById("deleteMovementInfo");
  const confirmBtn = document.getElementById("deleteConfirmBtn");
  const cancelBtn = document.getElementById("deleteCancelBtn");

  // Populate movement info
  movementInfo.innerHTML = `
    <div class="movement-info-row">
    <span class="movement-info-label">Descripción:</span>
    <span class="movement-info-value">
      ${
        (movement.Description || movement.description).length > 20
          ? (movement.Description || movement.description).slice(0, 20) + "..."
          : movement.Description || movement.description
      }
    </span>
  </div>
    <div class="movement-info-row">
      <span class="movement-info-label">Monto:</span>
      <span class="movement-info-value">${formatCurrency(movement.Amount || movement.amount)}</span>
    </div>
    <div class="movement-info-row">
      <span class="movement-info-label">Fecha:</span>
      <span class="movement-info-value">${formatDate(movement.Date || movement.date)}</span>
    </div>
  `;

  // Show modal
  modal.classList.add("active");

  // Handle confirmation
  const handleConfirm = async () => {
    try {
      showLoader();
      modal.classList.remove("active");

      // Call API to delete movement
      await httpDelete("DeleteMovement", { id: movementId }, true, logout);

      // Remove from local array
      removeMovement(movementId);

      // Re-render and update totals
      renderMovements(movements);
      await updateTotalsCallback();

      showToast("Movimiento eliminado exitosamente", "success");
    } catch (exception) {
      const message = JSON.parse(exception.message);

      showToast(
        message.response || "No se pudo eliminar el movimiento.",
        "error",
      );
    } finally {
      hideLoader();
      cleanup();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    modal.classList.remove("active");
    cleanup();
  };

  // Cleanup event listeners
  const cleanup = () => {
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    modal.removeEventListener("click", handleOverlayClick);
  };

  // Handle overlay click (close on background click)
  const handleOverlayClick = (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  };

  // Add event listeners
  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", handleCancel);
  modal.addEventListener("click", handleOverlayClick);
};

// Make deleteMovement available globally for onclick handlers
window.deleteMovement = null; // Will be set in main index.js
