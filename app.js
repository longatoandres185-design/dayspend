/**
 * DaySpend ✨ - iPhone Native Application Logic
 * Supports:
 * - 2-Screen Flow for adding expenses with dot date formatting (GG.MM.AAAA)
 * - Automatic live updates of remaining days
 * - Themed conclusion celebration notifications (Web Notifications & In-App celebration)
 * - Multi-device synchronization & SQLite Cloud Auth
 * - CSV / Excel export
 * - Dynamic QR Code generation for instant iPhone pairing
 */

// -------------------------------------------------------------
// Helper Date Utilities (Strictly using DOTS: GG.MM.AAAA)
// -------------------------------------------------------------
function getTodayIsoString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDateDots(dateStr) {
  if (!dateStr) return '';
  // If already in DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  
  // If in YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function addDaysToIsoDate(isoDateStr, days) {
  const date = new Date(isoDateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getPastDateIsoString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getFutureDateIsoString(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function formatNumberItalian(num) {
  if (isNaN(num)) return "0,00";
  return num.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------
// Themed Celebration Phrases on Completion
// -------------------------------------------------------------
const THEMED_COMPLETION_PHRASES = {
  shopping: {
    emoji: "👗",
    title: "Completata con Stile!",
    message: "La tua spesa in moda per «{title}» è ora 100% ammortizzata! Da oggi la indossi con leggerezza assoluta e zero sensi di colpa. Splendi! ✨"
  },
  beauty: {
    emoji: "💄",
    title: "Splendore Raggiunto!",
    message: "Il tuo investimento in bellezza e cura per «{title}» è ufficialmente concluso! Una coccola quotidiana che ha ripagato ogni singolo momento. 🌷"
  },
  travel: {
    emoji: "✈️",
    title: "Viaggio Ripagato!",
    message: "Il tuo viaggio «{title}» è ora completamente ammortizzato! I ricordi restano per sempre preziosi e il tuo conto è sereno e leggero. 🌸"
  },
  wellness: {
    emoji: "🧘‍♀️",
    title: "Traguardo di Benessere!",
    message: "Un traguardo meraviglioso per «{title}»! La cura per il tuo corpo e la tua mente è stato il miglior investimento possibile. Complimenti! 💖"
  },
  home: {
    emoji: "🛋️",
    title: "Armonia in Casa!",
    message: "La tua casa accoglie «{title}» con armonia: la spesa è conclusa e il piacere di viverla resta per te ogni giorno! 🛋️✨"
  },
  lifestyle: {
    emoji: "☕",
    title: "Momenti Dolci!",
    message: "«{title}» è stata ammortizzata con successo nel quotidiano. Piccole gioie che rendono la vita più bella! ☕🌸"
  },
  tech: {
    emoji: "📱",
    title: "Tutto Ripagato!",
    message: "«{title}» ha fatto il suo lavoro e l'investimento è ora 100% riassorbito dal tuo budget. Equilibrio perfetto! 📱✨"
  },
  other: {
    emoji: "👑",
    title: "Grande Consapevolezza!",
    message: "Festeggiamo! L'ammortamento di «{title}» è terminato. Hai gestito questa spesa con grandissima consapevolezza e serenità! 🌸🎉"
  }
};

// Default Sample Data (stored with ISO dates, displayed with dots)
const DEFAULT_EXPENSES = [
  {
    id: "sample-bag",
    title: "Borsa a tracolla cipria",
    amount: 180,
    days: 180,
    periodName: "6 Mesi",
    dailyCost: 1.00,
    category: "shopping",
    categoryIcon: "👗",
    note: "Acquisto per la nuova stagione primaverile 🌸",
    startDate: getPastDateIsoString(30),
    endDate: getFutureDateIsoString(150),
    createdAt: Date.now() - 30 * 86400000,
    isCompleted: false
  },
  {
    id: "sample-pilates",
    title: "Abbonamento Pilates Reformer",
    amount: 120,
    days: 30,
    periodName: "1 Mese",
    dailyCost: 4.00,
    category: "wellness",
    categoryIcon: "🧘‍♀️",
    note: "Benessere ed energia per il corpo ✨",
    startDate: getPastDateIsoString(14),
    endDate: getFutureDateIsoString(16),
    createdAt: Date.now() - 14 * 86400000,
    isCompleted: false
  },
  {
    id: "sample-perfume",
    title: "Profumo floreale d'autore",
    amount: 145,
    days: 365,
    periodName: "1 Anno",
    dailyCost: 0.40,
    category: "beauty",
    categoryIcon: "💄",
    note: "La mia fragranza preferita ogni mattina 🌷",
    startDate: getPastDateIsoString(90),
    endDate: getFutureDateIsoString(275),
    createdAt: Date.now() - 90 * 86400000,
    isCompleted: false
  }
];

// -------------------------------------------------------------
// App State
// -------------------------------------------------------------
const state = {
  // Calculator Form
  amount: 120,
  days: 365,
  periodName: "1 Anno",
  periodType: "year",
  customDays: 15,
  
  // Screen 2 Details Form
  selectedCategory: "shopping",
  selectedCategoryIcon: "👗",
  startDateIso: getTodayIsoString(),

  // Expenses & Filters
  expenses: [],
  currentTab: "tabCalculate",
  diaryFilter: "all",
  searchQuery: "",
  categoryFilter: "all",
  itemToDeleteId: null,

  // Auth & Cloud Sync
  user: null,
  token: null,
  iphoneUrl: "http://192.168.1.22:3333",
  notifiedExpenses: new Set()
};

// -------------------------------------------------------------
// DOM Elements
// -------------------------------------------------------------
// Tabs
const tabItems = document.querySelectorAll(".tab-item");
const tabPanes = document.querySelectorAll(".tab-pane");
const tabDiaryBadge = document.getElementById("tabDiaryBadge");
const syncStatusText = document.getElementById("syncStatusText");
const bellBtn = document.getElementById("bellBtn");

// Subscreens
const subScreenCalc = document.getElementById("subScreenCalc");
const subScreenDetails = document.getElementById("subScreenDetails");
const goToSaveScreenBtn = document.getElementById("goToSaveScreenBtn");
const backToCalcBtn = document.getElementById("backToCalcBtn");

// Calculator inputs
const amountInput = document.getElementById("amountInput");
const quickChips = document.querySelectorAll(".quick-chip");
const periodBtns = document.querySelectorAll(".period-btn");
const customDaysDrawer = document.getElementById("customDaysDrawer");
const customDaysField = document.getElementById("customDaysField");
const decDaysBtn = document.getElementById("decDaysBtn");
const incDaysBtn = document.getElementById("incDaysBtn");
const customEndDateField = document.getElementById("customEndDateField");
const customPeriodPreview = document.getElementById("customPeriodPreview");

// Result outputs
const resultDaily = document.getElementById("resultDaily");
const resultWeekly = document.getElementById("resultWeekly");
const resultMonthly = document.getElementById("resultMonthly");
const resultHourly = document.getElementById("resultHourly");
const quoteEmoji = document.getElementById("quoteEmoji");
const quoteText = document.getElementById("quoteText");

// Screen 2 Details
const summaryTotal = document.getElementById("summaryTotal");
const summaryDays = document.getElementById("summaryDays");
const summaryDaily = document.getElementById("summaryDaily");
const detailTitleInput = document.getElementById("detailTitleInput");
const categoryPills = document.querySelectorAll(".cat-pill");
const detailStartDateInput = document.getElementById("detailStartDateInput");
const formattedStartDateBadge = document.getElementById("formattedStartDateBadge");
const computedEndDateDots = document.getElementById("computedEndDateDots");
const computedDaysSub = document.getElementById("computedDaysSub");
const detailNoteInput = document.getElementById("detailNoteInput");
const confirmSaveExpenseBtn = document.getElementById("confirmSaveExpenseBtn");

// Diary Elements
const totalDailyImpact = document.getElementById("totalDailyImpact");
const activeCount = document.getElementById("activeCount");
const activeTotalAmount = document.getElementById("activeTotalAmount");
const impactSubtext = document.getElementById("impactSubtext");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const segBtns = document.querySelectorAll(".seg-btn");
const countAll = document.getElementById("countAll");
const countActive = document.getElementById("countActive");
const countCompleted = document.getElementById("countCompleted");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const expensesContainer = document.getElementById("expensesContainer");
const emptyState = document.getElementById("emptyState");

// Account & Auth Elements
const authLoggedOutView = document.getElementById("authLoggedOutView");
const authLoggedInView = document.getElementById("authLoggedInView");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const userDisplayName = document.getElementById("userDisplayName");
const userDisplayEmail = document.getElementById("userDisplayEmail");
const manualSyncBtn = document.getElementById("manualSyncBtn");
const logoutBtn = document.getElementById("logoutBtn");
const iphoneUrlText = document.getElementById("iphoneUrlText");
const copyUrlBtn = document.getElementById("copyUrlBtn");
const qrContainer = document.getElementById("qrContainer");
const requestNotifBtn = document.getElementById("requestNotifBtn");
const resetSampleDataBtn = document.getElementById("resetSampleDataBtn");
const clearAllDataBtn = document.getElementById("clearAllDataBtn");

// Modals
const celebrationModal = document.getElementById("celebrationModal");
const celebrationTitle = document.getElementById("celebrationTitle");
const celebrationMessage = document.getElementById("celebrationMessage");
const celebrationDetailsPill = document.getElementById("celebrationDetailsPill");
const closeCelebrationBtn = document.getElementById("closeCelebrationBtn");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteModalText = document.getElementById("deleteModalText");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const toast = document.getElementById("toast");

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  loadNotifiedHistory();
  loadLocalExpenses();
  initFormInputs();
  setupEventListeners();
  calculateInstant();
  
  // Check auth & network info
  await checkServerInfo();
  await checkAuthSession();

  // Initial render & live check
  renderExpenses();
  updateImpactBanner();
  checkCompletedExpensesAndNotify();

  // Setup periodic live update every 60 seconds and on tab visibility change
  setInterval(() => {
    renderExpenses();
    updateImpactBanner();
    checkCompletedExpensesAndNotify();
  }, 60000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      renderExpenses();
      updateImpactBanner();
      checkCompletedExpensesAndNotify();
      if (state.token) syncWithServer();
    }
  });
});

function initFormInputs() {
  amountInput.value = state.amount;
  detailStartDateInput.value = state.startDateIso;
  customEndDateField.value = addDaysToIsoDate(getTodayIsoString(), state.customDays);
  updateStartDateFormattedDisplay();
  updateComputedEndDateDisplay();
}

function loadNotifiedHistory() {
  try {
    const raw = localStorage.getItem("dayspend_notified_completions");
    if (raw) {
      state.notifiedExpenses = new Set(JSON.parse(raw));
    }
  } catch (e) {
    state.notifiedExpenses = new Set();
  }
}

function saveNotifiedHistory() {
  try {
    localStorage.setItem("dayspend_notified_completions", JSON.stringify([...state.notifiedExpenses]));
  } catch (e) {}
}

function loadLocalExpenses() {
  try {
    const raw = localStorage.getItem("dayspend_expenses_v2");
    if (raw) {
      state.expenses = JSON.parse(raw);
    } else {
      state.expenses = [...DEFAULT_EXPENSES];
      saveLocalExpenses();
    }
  } catch (e) {
    state.expenses = [...DEFAULT_EXPENSES];
  }
}

function saveLocalExpenses() {
  try {
    localStorage.setItem("dayspend_expenses_v2", JSON.stringify(state.expenses));
  } catch (e) {}
}

// -------------------------------------------------------------
// Navigation & Subscreen Switching
// -------------------------------------------------------------
function switchTab(tabId) {
  state.currentTab = tabId;
  tabItems.forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabId);
  });
  tabPanes.forEach(pane => {
    pane.classList.toggle("active", pane.id === tabId);
  });

  if (tabId === "tabDiary") {
    renderExpenses();
    updateImpactBanner();
  }

  // Trigger gentle haptic if supported
  if ("vibrate" in navigator) {
    navigator.vibrate(10);
  }
}

function openSaveDetailsScreen() {
  const amt = parseFloat(amountInput.value);
  if (isNaN(amt) || amt <= 0) {
    showToast("Inserisci prima un importo valido! 🌸");
    amountInput.focus();
    return;
  }

  // Prepare Screen 2 values
  state.amount = amt;
  const days = state.days > 0 ? state.days : 1;
  const daily = amt / days;

  summaryTotal.textContent = `€ ${formatNumberItalian(amt)}`;
  summaryDays.textContent = `${days} giorni (${state.periodName})`;
  summaryDaily.textContent = `€ ${formatNumberItalian(daily)}/gg`;

  state.startDateIso = detailStartDateInput.value || getTodayIsoString();
  updateStartDateFormattedDisplay();
  updateComputedEndDateDisplay();

  // Slide transition
  subScreenCalc.classList.remove("active");
  subScreenDetails.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (!detailTitleInput.value) {
    setTimeout(() => detailTitleInput.focus(), 250);
  }
}

function closeSaveDetailsScreen() {
  subScreenDetails.classList.remove("active");
  subScreenCalc.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------
// Date Formatting & Computed End Date
// -------------------------------------------------------------
function updateStartDateFormattedDisplay() {
  const dotsDate = formatDateDots(detailStartDateInput.value);
  formattedStartDateBadge.textContent = `📅 Inizio: ${dotsDate}`;
}

function updateComputedEndDateDisplay() {
  const startDate = detailStartDateInput.value || getTodayIsoString();
  const endDateIso = addDaysToIsoDate(startDate, state.days);
  const endDots = formatDateDots(endDateIso);

  computedEndDateDots.textContent = endDots;
  computedDaysSub.textContent = `Tra ${state.days} giorni esatti (termina il ${endDots})`;
}

// -------------------------------------------------------------
// Instant Calculation
// -------------------------------------------------------------
function calculateInstant() {
  const rawAmt = parseFloat(amountInput.value);
  const amt = isNaN(rawAmt) || rawAmt <= 0 ? 0 : rawAmt;
  state.amount = amt;

  const days = state.days > 0 ? state.days : 1;
  const daily = amt / days;
  const weekly = daily * 7;
  const monthly = daily * 30.417;
  const hourly = daily / 24;

  resultDaily.textContent = formatNumberItalian(daily);
  resultWeekly.textContent = `€ ${formatNumberItalian(weekly)}`;
  resultMonthly.textContent = `€ ${formatNumberItalian(monthly)}`;
  resultHourly.textContent = `€ ${formatNumberItalian(hourly)}`;

  updateLifestyleQuote(daily, amt);
}

function updateLifestyleQuote(daily, totalAmount) {
  let quote = "";
  let icon = "☕";

  if (totalAmount <= 0) {
    quote = "Inserisci un importo per calcolare la tua spesa quotidiana ✨";
    icon = "🌸";
  } else if (daily < 0.50) {
    quote = "Meno di una caramella o una bustina di tè! Una vera piuma sul tuo budget 🌸";
    icon = "🍬";
  } else if (daily <= 1.50) {
    quote = "Meno di un caffè al bar! Regalati questa gioia senza pensieri ☕";
    icon = "☕";
  } else if (daily <= 3.50) {
    quote = "Quanto un cappuccino con brioche 🥐. Perfettamente sostenibile nel quotidiano!";
    icon = "🥐";
  } else if (daily <= 6.00) {
    quote = "Quanto un matcha latte o una spremuta fresca 🍵. Benissimo ammortizzato!";
    icon = "🍵";
  } else if (daily <= 12.00) {
    quote = "Quanto un calice di vino o un aperitivo serale 🥂. Ti ripaga ogni singolo giorno!";
    icon = "🥂";
  } else if (daily <= 25.00) {
    quote = "Quanto una cena sfiziosa 🥗. Un acquisto che valorizza le tue giornate!";
    icon = "✨";
  } else {
    quote = "Un investimento importante per te stessa 👑. Meriti di realizzare i tuoi desideri!";
    icon = "👑";
  }

  quoteText.textContent = quote;
  quoteEmoji.textContent = icon;
}

// -------------------------------------------------------------
// Expense Actions: Save, Delete, Complete
// -------------------------------------------------------------
async function handleConfirmSaveExpense() {
  const amt = parseFloat(amountInput.value);
  if (isNaN(amt) || amt <= 0) {
    showToast("Importo non valido! 🌸");
    return;
  }

  const startDateIso = detailStartDateInput.value || getTodayIsoString();
  const endDateIso = addDaysToIsoDate(startDateIso, state.days);
  const title = detailTitleInput.value.trim() || `Spesa da € ${formatNumberItalian(amt)}`;
  const dailyCost = amt / state.days;

  const newExpense = {
    id: "exp-" + Date.now(),
    title: title,
    amount: amt,
    days: state.days,
    periodName: state.periodName,
    dailyCost: dailyCost,
    category: state.selectedCategory,
    categoryIcon: state.selectedCategoryIcon,
    note: detailNoteInput.value.trim(),
    startDate: startDateIso,
    endDate: endDateIso,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCompleted: false
  };

  state.expenses.unshift(newExpense);
  saveLocalExpenses();

  // Reset inputs
  detailTitleInput.value = "";
  detailNoteInput.value = "";

  // Return to calc screen and switch to Diary tab
  closeSaveDetailsScreen();
  switchTab("tabDiary");
  showToast(`«${title}» salvata nel tuo diario! 💖`);

  // Sync with cloud if logged in
  if (state.token) {
    await syncWithServer();
  }
}

function promptDeleteExpense(id) {
  const item = state.expenses.find(e => e.id === id);
  if (!item) return;

  state.itemToDeleteId = id;
  deleteModalText.textContent = `Vuoi davvero eliminare «${item.title}» dal diario?`;
  deleteConfirmModal.style.display = "flex";
}

async function confirmDeleteExpense() {
  if (!state.itemToDeleteId) return;
  const id = state.itemToDeleteId;

  state.expenses = state.expenses.filter(e => e.id !== id);
  saveLocalExpenses();
  renderExpenses();
  updateImpactBanner();

  deleteConfirmModal.style.display = "none";
  state.itemToDeleteId = null;
  showToast("Spesa rimossa dal diario 🗑️");

  if (state.token) {
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${state.token}` }
      });
    } catch (e) {}
  }
}

async function toggleCompleteExpense(id) {
  const item = state.expenses.find(e => e.id === id);
  if (!item) return;

  item.isCompleted = !item.isCompleted;
  item.updatedAt = Date.now();
  saveLocalExpenses();
  renderExpenses();
  updateImpactBanner();

  showToast(item.isCompleted ? "Spesa contrassegnata come conclusa ✨" : "Spesa riattivata 🌸");

  if (state.token) {
    await syncWithServer();
  }
}

// -------------------------------------------------------------
// Live Remaining Days & Completion Notification Check
// -------------------------------------------------------------
function checkCompletedExpensesAndNotify() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  state.expenses.forEach(item => {
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);

    const isFinished = today > end || item.isCompleted;

    // Check if this expense has newly finished and hasn't notified yet
    if (isFinished && !state.notifiedExpenses.has(item.id)) {
      state.notifiedExpenses.add(item.id);
      saveNotifiedHistory();

      // Trigger Celebration
      triggerThemedCompletionAlert(item);
    }
  });
}

function triggerThemedCompletionAlert(item) {
  const theme = THEMED_COMPLETION_PHRASES[item.category] || THEMED_COMPLETION_PHRASES.other;
  const message = theme.message.replace("{title}", item.title);

  // 1. In-App Celebration Modal
  celebrationTitle.textContent = `${theme.title} ${theme.emoji}`;
  celebrationMessage.textContent = message;
  celebrationDetailsPill.textContent = `«${item.title}» • € ${formatNumberItalian(item.amount)} ammortizzati`;
  celebrationModal.style.display = "flex";

  // 2. Web Notification (if permission granted)
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`🎉 Ammortamento concluso: ${item.title}`, {
        body: message,
        icon: "icon.svg",
        badge: "icon.svg"
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }

  // Gentle vibration
  if ("vibrate" in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

// -------------------------------------------------------------
// Rendering Expenses & Impact Banner
// -------------------------------------------------------------
function renderExpenses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeList = [];
  let completedList = [];

  state.expenses.forEach(item => {
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);
    const isFinished = item.isCompleted || today > end;

    if (isFinished) {
      completedList.push(item);
    } else {
      activeList.push(item);
    }
  });

  countAll.textContent = state.expenses.length;
  countActive.textContent = activeList.length;
  countCompleted.textContent = completedList.length;

  // Update tab diary badge
  if (activeList.length > 0) {
    tabDiaryBadge.style.display = "inline-block";
    tabDiaryBadge.textContent = activeList.length;
  } else {
    tabDiaryBadge.style.display = "none";
  }

  // Filter items
  let filtered = state.expenses;
  if (state.diaryFilter === "active") filtered = activeList;
  else if (state.diaryFilter === "completed") filtered = completedList;

  if (state.searchQuery) {
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(state.searchQuery) ||
      (item.note && item.note.toLowerCase().includes(state.searchQuery))
    );
  }

  if (state.categoryFilter !== "all") {
    filtered = filtered.filter(item => item.category === state.categoryFilter);
  }

  if (filtered.length === 0) {
    expensesContainer.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  expensesContainer.innerHTML = filtered.map(item => createExpenseCardHTML(item, today)).join("");

  // Attach card event listeners
  expensesContainer.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => promptDeleteExpense(btn.dataset.id));
  });

  expensesContainer.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleCompleteExpense(btn.dataset.id));
  });
}

function createExpenseCardHTML(item, today) {
  const start = new Date(item.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(item.endDate);
  end.setHours(23, 59, 59, 999);

  const totalDays = item.days || 1;
  const daysPassed = Math.max(0, Math.floor((today - start) / 86400000));
  const daysRemaining = Math.max(0, Math.ceil((end - today) / 86400000));

  let progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  const isFinished = item.isCompleted || today > end;

  let remainingText = "";
  if (isFinished) {
    remainingText = "Conclusa ✨";
    progressPercent = 100;
  } else if (daysRemaining === 0) {
    remainingText = "Ultimo giorno! 🌷";
  } else {
    remainingText = `${daysRemaining} gg rimanenti su ${totalDays}`;
  }

  const startDots = formatDateDots(item.startDate);
  const endDots = formatDateDots(item.endDate);

  return `
    <div class="expense-card ${isFinished ? 'completed' : ''}">
      <div class="card-top">
        <div class="card-main-info">
          <div class="card-cat-icon">${item.categoryIcon || '✨'}</div>
          <div class="card-titles">
            <h4>${escapeHTML(item.title)}</h4>
            <div class="card-dates-dots">Dal ${startDots} al ${endDots}</div>
          </div>
        </div>
        <div class="card-pricing">
          <div class="daily-chip">
            <span class="d-sym">€</span>
            <span class="d-num">${formatNumberItalian(item.dailyCost)}</span>
            <span class="d-unit">/gg</span>
          </div>
          <div class="card-total-cost">Tot: € ${formatNumberItalian(item.amount)}</div>
        </div>
      </div>

      <div class="card-progress-wrap">
        <div class="card-progress-bar">
          <div class="card-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="card-progress-labels">
          <span>Giorno ${Math.min(daysPassed, totalDays)} di ${totalDays}</span>
          <span style="font-weight: 700; color: ${isFinished ? '#10B981' : '#EB4874'};">${remainingText}</span>
        </div>
      </div>

      <div class="card-actions-bar">
        <div class="card-note">${item.note ? `“${escapeHTML(item.note)}”` : ''}</div>
        <div class="card-btns-group">
          <button type="button" class="card-btn toggle-btn" data-id="${item.id}">
            ${isFinished ? '↩️ Riattiva' : '✓ Conclusa'}
          </button>
          <button type="button" class="card-btn del-btn" data-id="${item.id}" title="Elimina">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;
}

function updateImpactBanner() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeDailySum = 0;
  let activeTotalSum = 0;
  let activeItemsCount = 0;

  state.expenses.forEach(item => {
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);
    const isPast = today > end;

    if (!item.isCompleted && !isPast) {
      activeDailySum += item.dailyCost;
      activeTotalSum += item.amount;
      activeItemsCount++;
    }
  });

  totalDailyImpact.textContent = formatNumberItalian(activeDailySum);
  activeCount.textContent = activeItemsCount;
  activeTotalAmount.textContent = `€ ${formatNumberItalian(activeTotalSum)}`;

  if (activeItemsCount === 0) {
    impactSubtext.textContent = "Nessuna spesa attiva al momento. Salva il tuo primo calcolo dal menu in basso!";
  } else {
    impactSubtext.textContent = `Oggi le tue ${activeItemsCount} spese in corso corrispondono a soli € ${formatNumberItalian(activeDailySum)} al giorno 🌸`;
  }
}

// -------------------------------------------------------------
// Excel / CSV Export (with BOM, Semicolon separator & Dot dates)
// -------------------------------------------------------------
function handleExportCsv() {
  if (state.expenses.length === 0) {
    showToast("Non ci sono spese da esportare!");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Headers formatted for Excel in Italian
  const headers = [
    "Nome Spesa",
    "Categoria",
    "Importo Totale (€)",
    "Durata (Giorni)",
    "Costo al Giorno (€)",
    "Data Inizio",
    "Data Fine",
    "Giorni Trascorsi",
    "Giorni Rimanenti",
    "Stato",
    "Note"
  ];

  const rows = state.expenses.map(item => {
    const start = new Date(item.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);

    const totalDays = item.days || 1;
    const daysPassed = Math.max(0, Math.floor((today - start) / 86400000));
    const daysRemaining = Math.max(0, Math.ceil((end - today) / 86400000));
    const isFinished = item.isCompleted || today > end;

    const startDots = formatDateDots(item.startDate);
    const endDots = formatDateDots(item.endDate);

    return [
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${item.category || ''}"`,
      formatNumberItalian(item.amount),
      item.days,
      formatNumberItalian(item.dailyCost),
      startDots,
      endDots,
      Math.min(daysPassed, totalDays),
      daysRemaining,
      isFinished ? "Completata" : "In Corso",
      `"${(item.note || '').replace(/"/g, '""')}"`
    ].join(";");
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens with proper accents and currency symbols
  const csvContent = "\uFEFF" + headers.join(";") + "\r\n" + rows.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const todayDots = formatDateDots(getTodayIsoString());

  downloadLink.setAttribute("href", url);
  downloadLink.setAttribute("download", `DaySpend_Spese_${todayDots}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast("File Excel / CSV scaricato con successo! 📊");
}

// -------------------------------------------------------------
// Cloud Sync & Multi-Device Auth
// -------------------------------------------------------------
async function checkServerInfo() {
  try {
    const res = await fetch("/api/info");
    if (res.ok) {
      const data = await res.json();
      state.iphoneUrl = data.iphone_url;
      iphoneUrlText.textContent = data.iphone_url;
      renderQrCode(data.iphone_url);
    }
  } catch (e) {
    iphoneUrlText.textContent = window.location.origin;
    renderQrCode(window.location.origin);
  }
}

async function checkAuthSession() {
  const token = localStorage.getItem("dayspend_auth_token");
  if (!token) {
    showLoggedOutState();
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      state.token = token;
      state.user = data.user;
      showLoggedInState(data.user);
      await syncWithServer();
    } else {
      localStorage.removeItem("dayspend_auth_token");
      showLoggedOutState();
    }
  } catch (e) {
    // Offline mode: keep logged state if token exists
    showLoggedOutState();
  }
}

async function handleLogin() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showToast("Inserisci email e password!");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Errore durante il login");
      return;
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("dayspend_auth_token", data.token);

    showLoggedInState(data.user);
    showToast(data.message || "Login completato! 🌸");
    await syncWithServer();
  } catch (e) {
    showToast("Server non raggiungibile. Verifica la connessione.");
  }
}

async function handleRegister() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || password.length < 4) {
    showToast("Email e password (minimo 4 caratteri) sono obbligatorie!");
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Errore durante la registrazione");
      return;
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("dayspend_auth_token", data.token);

    showLoggedInState(data.user);
    showToast("Account creato con successo! ✨");
    await syncWithServer();
  } catch (e) {
    showToast("Server non raggiungibile. Verifica la connessione.");
  }
}

function handleLogout() {
  if (confirm("Vuoi uscire dall'account? Le spese salvate resteranno anche sul tuo cloud.")) {
    if (state.token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${state.token}` }
      }).catch(() => {});
    }
    state.token = null;
    state.user = null;
    localStorage.removeItem("dayspend_auth_token");
    showLoggedOutState();
    showToast("Disconnesso dall'account.");
  }
}

async function syncWithServer() {
  if (!state.token) return;

  try {
    syncStatusText.textContent = "Sincronizzo...";
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ expenses: state.expenses })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.expenses && Array.isArray(data.expenses)) {
        state.expenses = data.expenses;
        saveLocalExpenses();
        renderExpenses();
        updateImpactBanner();
      }
      syncStatusText.textContent = "Sincronizzato";
    } else {
      syncStatusText.textContent = "Cloud attivo";
    }
  } catch (e) {
    syncStatusText.textContent = "Offline";
  }
}

function showLoggedInState(user) {
  authLoggedOutView.style.display = "none";
  authLoggedInView.style.display = "block";
  userDisplayName.textContent = user.name || user.email.split("@")[0];
  userDisplayEmail.textContent = user.email;
  syncStatusText.textContent = "Sincronizzato";
}

function showLoggedOutState() {
  authLoggedOutView.style.display = "block";
  authLoggedInView.style.display = "none";
  syncStatusText.textContent = "Ospite";
}

// -------------------------------------------------------------
// QR Code Generator (Pure SVG Embedded)
// -------------------------------------------------------------
function renderQrCode(url) {
  // Use public QR service or simple SVG matrix representation
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=EB4874&bgcolor=FFFFFF&data=${encodeURIComponent(url)}`;
  qrContainer.innerHTML = `
    <img src="${qrImgUrl}" alt="QR Code per iPhone" width="160" height="160" style="display:block; border-radius: 8px;">
  `;
}

// -------------------------------------------------------------
// Setup Event Listeners
// -------------------------------------------------------------
function setupEventListeners() {
  // Bottom Tab Navigation
  tabItems.forEach(item => {
    item.addEventListener("click", () => switchTab(item.dataset.tab));
  });

  // Screen 1A -> Screen 1B Transition
  goToSaveScreenBtn.addEventListener("click", openSaveDetailsScreen);
  backToCalcBtn.addEventListener("click", closeSaveDetailsScreen);

  // Amount Input changes
  amountInput.addEventListener("input", calculateInstant);

  // Quick Amount chips
  quickChips.forEach(chip => {
    chip.addEventListener("click", () => {
      amountInput.value = chip.dataset.val;
      calculateInstant();
    });
  });

  // Period Selection Buttons
  periodBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      periodBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const pType = btn.dataset.period;
      state.periodType = pType;

      if (pType === "custom") {
        customDaysDrawer.style.display = "block";
        state.days = state.customDays;
        state.periodName = `${state.customDays} Giorni`;
        updateCustomDaysPreview();
      } else {
        customDaysDrawer.style.display = "none";
        state.days = parseInt(btn.dataset.days, 10);
        state.periodName = btn.querySelector(".p-name").textContent;
      }

      calculateInstant();
    });
  });

  // Stepper for custom days
  decDaysBtn.addEventListener("click", () => {
    let val = parseInt(customDaysField.value, 10) || 1;
    if (val > 1) {
      val--;
      customDaysField.value = val;
      state.customDays = val;
      state.days = val;
      state.periodName = `${val} Giorni`;
      customEndDateField.value = addDaysToIsoDate(getTodayIsoString(), val);
      updateCustomDaysPreview();
      calculateInstant();
    }
  });

  incDaysBtn.addEventListener("click", () => {
    let val = parseInt(customDaysField.value, 10) || 1;
    val++;
    customDaysField.value = val;
    state.customDays = val;
    state.days = val;
    state.periodName = `${val} Giorni`;
    customEndDateField.value = addDaysToIsoDate(getTodayIsoString(), val);
    updateCustomDaysPreview();
    calculateInstant();
  });

  customDaysField.addEventListener("input", () => {
    let val = parseInt(customDaysField.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    state.customDays = val;
    state.days = val;
    state.periodName = `${val} Giorni`;
    customEndDateField.value = addDaysToIsoDate(getTodayIsoString(), val);
    updateCustomDaysPreview();
    calculateInstant();
  });

  customEndDateField.addEventListener("change", () => {
    const start = new Date(getTodayIsoString());
    const end = new Date(customEndDateField.value);
    let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) diffDays = 1;

    customDaysField.value = diffDays;
    state.customDays = diffDays;
    state.days = diffDays;
    state.periodName = `${diffDays} Giorni`;
    updateCustomDaysPreview();
    calculateInstant();
  });

  // Screen 2 Details: Category selector
  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      categoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.selectedCategory = pill.dataset.cat;
      state.selectedCategoryIcon = pill.dataset.icon;
    });
  });

  // Screen 2 Details: Start Date changes
  detailStartDateInput.addEventListener("change", () => {
    state.startDateIso = detailStartDateInput.value;
    updateStartDateFormattedDisplay();
    updateComputedEndDateDisplay();
  });

  // Screen 2 Details: Confirm and Save
  confirmSaveExpenseBtn.addEventListener("click", handleConfirmSaveExpense);

  // Diary filters
  segBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      segBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.diaryFilter = btn.dataset.filter;
      renderExpenses();
    });
  });

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderExpenses();
  });

  categoryFilter.addEventListener("change", (e) => {
    state.categoryFilter = e.target.value;
    renderExpenses();
  });

  // Excel / CSV Export
  exportCsvBtn.addEventListener("click", handleExportCsv);

  // Delete modal actions
  cancelDeleteBtn.addEventListener("click", () => {
    deleteConfirmModal.style.display = "none";
    state.itemToDeleteId = null;
  });
  confirmDeleteBtn.addEventListener("click", confirmDeleteExpense);

  // Celebration modal close
  closeCelebrationBtn.addEventListener("click", () => {
    celebrationModal.style.display = "none";
  });

  // Auth actions
  loginBtn.addEventListener("click", handleLogin);
  registerBtn.addEventListener("click", handleRegister);
  logoutBtn.addEventListener("click", handleLogout);
  manualSyncBtn.addEventListener("click", async () => {
    await syncWithServer();
    showToast("Sincronizzazione completata! 🔄");
  });

  // Copy iPhone URL button
  copyUrlBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(state.iphoneUrl).then(() => {
      showToast("Indirizzo copiato! Incollalo in Safari su iPhone 📲");
    });
  });

  // Request notifications
  requestNotifBtn.addEventListener("click", requestNotificationPermission);
  bellBtn.addEventListener("click", requestNotificationPermission);

  // Reset & Clear buttons
  resetSampleDataBtn.addEventListener("click", () => {
    if (confirm("Vuoi ripristinare le spese di esempio?")) {
      state.expenses = [...DEFAULT_EXPENSES];
      saveLocalExpenses();
      renderExpenses();
      updateImpactBanner();
      showToast("Spese di esempio ripristinate 🌸");
      if (state.token) syncWithServer();
    }
  });

  clearAllDataBtn.addEventListener("click", () => {
    if (confirm("Attenzione: vuoi cancellare tutte le spese salvate?")) {
      state.expenses = [];
      saveLocalExpenses();
      renderExpenses();
      updateImpactBanner();
      showToast("Tutte le spese sono state cancellate.");
      if (state.token) syncWithServer();
    }
  });
}

function updateCustomDaysPreview() {
  const endIso = addDaysToIsoDate(getTodayIsoString(), state.days);
  const endDots = formatDateDots(endIso);
  customPeriodPreview.textContent = `Durata: ${state.days} giorni (fino al ${endDots})`;
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Il tuo browser non supporta le notifiche native.");
    return;
  }

  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    showToast("Notifiche attivate! Riceverai una frase a tema alla fine di ogni spesa 🌸");
  } else {
    showToast("Notifiche non attivate. Riceverai comunque l'avviso a schermo nell'app.");
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
