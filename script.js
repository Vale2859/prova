// ====== DATI DI BASE (TURNI FARMACIE - DEMO) ======
const turniFarmacie = [
  {
    data: "2025-12-17",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 000000",
    note: "Turno completo",
    tipoRange: "oggi",
    mese: 12
  },
  {
    data: "2025-12-18",
    orario: "08:00 – 20:00",
    principale: "Farmacia Centrale",
    appoggio: "Farmacia Montesano",
    telefono: "0835 111111",
    note: "Diurno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-19",
    orario: "20:00 – 08:00",
    principale: "Farmacia Madonna delle Grazie",
    appoggio: "Farmacia Montesano",
    telefono: "0835 222222",
    note: "Notturno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-24",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 000000",
    note: "Vigilia di Natale",
    tipoRange: "mese",
    mese: 12
  },
  {
    data: "2026-01-02",
    orario: "08:00 – 20:00",
    principale: "Farmacia Centrale",
    appoggio: "Farmacia Madonna delle Grazie",
    telefono: "0835 111111",
    note: "Inizio anno",
    tipoRange: "mese",
    mese: 1
  }
];

// ====== STATO ======
let currentRole = "farmacia"; // farmacia | titolare | dipendente
let currentTurniView = "oggi"; // oggi | settimana | mese

document.addEventListener("DOMContentLoaded", () => {
  // Elementi principali
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  // Login
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginRoleLabel = document.getElementById("loginRoleLabel");
  const loginForm = document.getElementById("loginForm");

  // Layout / sidebar
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");
  const rolePill = document.getElementById("currentRolePill");
  const assenzeTitle = document.getElementById("assenzeTitle");

  // Sezioni
  const dashboardSection = document.getElementById("dashboard");
  const assenzePage = document.getElementById("assenzePage");
  const turniPage = document.getElementById("turniPage");
  const procedurePage = document.getElementById("procedurePage");

  // Pulsanti navigazione dashboard
  const openAssenzeBtn = document.getElementById("openAssenze");
  const openTurniBtn = document.getElementById("openTurni");
  const openProcedureBtn = document.getElementById("openProcedure");

  // Pulsanti "back"
  const backFromAssenzeBtn = document.getElementById("backFromAssenze");
  const backFromTurniBtn = document.getElementById("backFromTurni");
  const backFromProcedureBtn = document.getElementById("backFromProcedure");

  // Turni elementi (dashboard + pagina)
  const turnoOggiNome = document.getElementById("turnoOggiNome");
  const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
  const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
  const turnoOggiOrario = document.getElementById("turnoOggiOrario");
  const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
  const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

  const turnoOrarioChip = document.getElementById("turnoOrarioChip");
  const turnoNome = document.getElementById("turnoNome");
  const turnoIndirizzo = document.getElementById("turnoIndirizzo");
  const turnoAppoggio = document.getElementById("turnoAppoggio");

  const turniTabs = document.querySelectorAll(".turni-tab");
  const turniRowsContainer = document.getElementById("turniRows");
  const turniMeseSelect = document.getElementById("turniMeseSelect");
  const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  // Procedure elementi
  const procedureSearchInput = document.getElementById("procedureSearchInput");
  const procedureAreaSelect = document.getElementById("procedureAreaSelect");
  const procedureFilterChips = document.querySelectorAll(".chip-filter");
  const procedureItems = document.querySelectorAll(".procedure-item");

  // ====== FUNZIONI BASE ======
  function setRole(role) {
    currentRole = role;

    if (role === "farmacia") {
      rolePill.textContent = "Farmacia (accesso generico)";
      assenzeTitle.textContent = "Assenze del personale";
    } else if (role === "titolare") {
      rolePill.textContent = "Titolare";
      assenzeTitle.textContent = "Assenze del personale";
    } else if (role === "dipendente") {
      rolePill.textContent = "Dipendente";
      assenzeTitle.textContent = "Le mie assenze";
    }
  }

  function showSection(section) {
    dashboardSection.classList.add("hidden");
    assenzePage.classList.add("hidden");
    turniPage.classList.add("hidden");
    procedurePage.classList.add("hidden");

    section.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openSidebarMenu() {
    sidebar.classList.add("open");
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("open");
  }

  // ====== LOGIN ======
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const role = tab.getAttribute("data-role");
      if (role === "farmacia") {
        loginRoleLabel.textContent = "Farmacia";
      } else if (role === "titolare") {
        loginRoleLabel.textContent = "Titolare";
      } else {
        loginRoleLabel.textContent = "Dipendente";
      }
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const activeTab = document.querySelector(".auth-tab.active");
    const role = activeTab.getAttribute("data-role");

    setRole(role);

    authContainer.classList.add("hidden");
    app.classList.remove("hidden");

    showSection(dashboardSection);
  });

  // ====== HAMBURGER / SIDEBAR ======
  hamburger.addEventListener("click", openSidebarMenu);
  closeSidebar.addEventListener("click", closeSidebarMenu);

  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== hamburger
    ) {
      closeSidebarMenu();
    }
  });

  // Navigazione dal menu laterale
  sidebar.querySelectorAll("li[data-nav]").forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-nav");

      if (target === "dashboard") {
        showSection(dashboardSection);
      } else if (target === "assenzePage") {
        showSection(assenzePage);
      } else if (target === "turniPage") {
        showSection(turniPage);
        renderTurniTable();
      } else if (target === "procedurePage") {
        showSection(procedurePage);
        applyProcedureFilters();
      }

      closeSidebarMenu();
    });
  });

  // ====== LOGOUT ======
  logoutBtn.addEventListener("click", () => {
    app.classList.add("hidden");
    authContainer.classList.remove("hidden");

    loginForm.reset();
    authTabs.forEach((t) => t.classList.remove("active"));
    authTabs[0].classList.add("active");
    loginRoleLabel.textContent = "Farmacia";
    setRole("farmacia");

    closeSidebarMenu();
  });

  // ====== NAVIGAZIONE INTERNA (CARD) ======
  if (openAssenzeBtn) {
    openAssenzeBtn.addEventListener("click", () => {
      showSection(assenzePage);
    });
  }

  if (backFromAssenzeBtn) {
    backFromAssenzeBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (openTurniBtn) {
    openTurniBtn.addEventListener("click", () => {
      showSection(turniPage);
      renderTurniTable();
    });
  }

  if (backFromTurniBtn) {
    backFromTurniBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (openProcedureBtn) {
    openProcedureBtn.addEventListener("click", () => {
      showSection(procedurePage);
      applyProcedureFilters();
    });
  }

  if (backFromProcedureBtn) {
    backFromProcedureBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  // ====== TURNI: POPOLAMENTO DATI ======
  function initTurnoOggi() {
    const oggi = turniFarmacie.find((t) => t.tipoRange === "oggi");
    if (!oggi) return;

    // Dashboard
    turnoOrarioChip.textContent = oggi.orario;
    turnoNome.textContent = oggi.principale;
    turnoIndirizzo.innerHTML = `Via Esempio 12, Matera<br />Tel: ${oggi.telefono}`;
    turnoAppoggio.textContent = oggi.appoggio;

    // Pagina turni
    turnoOggiNome.textContent = oggi.principale;
    turnoOggiIndirizzo.textContent = "Via Esempio 12, Matera";
    turnoOggiTelefono.textContent = `Tel: ${oggi.telefono}`;
    turnoOggiOrario.textContent = oggi.orario;
    turnoOggiAppoggioNome.textContent = oggi.appoggio;
    turnoOggiAppoggioDettagli.textContent =
      "Via Dante 8, Matera – Tel: 0835 111111";
  }

  function renderTurniTable() {
    if (!turniRowsContainer) return;

    const meseFilter = turniMeseSelect.value;
    const farmaciaFilter = turniFarmaciaSelect.value;

    let filtered = turniFarmacie.filter((t) => t.tipoRange === currentTurniView);

    if (meseFilter !== "all") {
      const m = Number(meseFilter);
      filtered = filtered.filter((t) => t.mese === m);
    }

    if (farmaciaFilter !== "all") {
      filtered = filtered.filter((t) => t.principale === farmaciaFilter);
    }

    turniRowsContainer.innerHTML = "";

    if (filtered.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "turni-row";
      emptyRow.innerHTML = `<span>Nessun turno trovato per i filtri selezionati.</span>`;
      turniRowsContainer.appendChild(emptyRow);
      return;
    }

    filtered.forEach((t) => {
      const row = document.createElement("div");
      row.className = "turni-row";

      let tipoPillClass = "normale";
      const noteLower = t.note.toLowerCase();
      if (noteLower.includes("vigilia") || noteLower.includes("festivo")) {
        tipoPillClass = "festivo";
      }
      if (noteLower.includes("notturno")) {
        tipoPillClass = "notturno";
      }

      row.innerHTML = `
        <span>${formatDateIT(t.data)}</span>
        <span>${t.orario}</span>
        <span>${t.principale}</span>
        <span>${t.appoggio}</span>
        <span>${t.telefono}</span>
        <span><span class="turno-type-pill ${tipoPillClass}">${t.note}</span></span>
      `;
      turniRowsContainer.appendChild(row);
    });
  }

  function formatDateIT(isoDate) {
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  }

  // Tabs turni
  turniTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      turniTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTurniView = tab.getAttribute("data-view");
      renderTurniTable();
    });
  });

  // Filtri turni
  turniMeseSelect.addEventListener("change", renderTurniTable);
  turniFarmaciaSelect.addEventListener("change", renderTurniTable);

  // ====== FORM ASSENZE (solo feedback demo) ======
  const assenzeForm = document.querySelector(".assenze-form");
  const assenzeFeedback = document.getElementById("assenzeFeedback");

  if (assenzeForm && assenzeFeedback) {
    assenzeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      assenzeFeedback.classList.remove("hidden");
      assenzeFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // ====== FILTRI PROCEDURE (IDEA C) ======
  function applyProcedureFilters() {
    if (!procedureItems.length) return;

    const text = (procedureSearchInput?.value || "").toLowerCase().trim();
    const area = procedureAreaSelect?.value || "all";
    const activeChip = document.querySelector(".chip-filter.active");
    const categoryFilter = activeChip ? activeChip.getAttribute("data-category") : "all";

    procedureItems.forEach((item) => {
      let visible = true;

      const itemArea = item.getAttribute("data-area") || "all";
      const itemTags = (item.getAttribute("data-tags") || "").toLowerCase();
      const itemCats = (item.getAttribute("data-category") || "").toLowerCase();

      if (area !== "all" && itemArea !== area) {
        visible = false;
      }

      if (text && !itemTags.includes(text) && !item.textContent.toLowerCase().includes(text)) {
        visible = false;
      }

      if (categoryFilter !== "all" && !itemCats.includes(categoryFilter)) {
        visible = false;
      }

      item.style.display = visible ? "flex" : "none";
    });
  }

  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", () => {
      applyProcedureFilters();
    });
  }

  if (procedureAreaSelect) {
    procedureAreaSelect.addEventListener("change", () => {
      applyProcedureFilters();
    });
  }

  procedureFilterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      procedureFilterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyProcedureFilters();
    });
  });

  // ====== INIT ======
  initTurnoOggi();
  // Quando entri per la prima volta nella pagina procedure, verrà chiamata applyProcedureFilters()
});
