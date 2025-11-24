// ELEMENTI BASE
const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");
const loginForm = document.getElementById("loginForm");
const currentRoleLabel = document.getElementById("currentRoleLabel");

const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const closeSidebar = document.getElementById("closeSidebar");
const logoutBtn = document.getElementById("logoutBtn");

const dashboardSection = document.getElementById("dashboard");
const assenzePage = document.getElementById("assenzePage");
const farmaciePage = document.getElementById("farmaciePage");
const comunicazioniPage = document.getElementById("comunicazioniPage");
const procedurePage = document.getElementById("procedurePage");
const logisticaPage = document.getElementById("logisticaPage");

// BOTTONI DASHBOARD
const openAssenzeBtn = document.getElementById("openAssenze");
const openFarmacieBtn = document.getElementById("openFarmacie");
const openComunicazioniBtn = document.getElementById("openComunicazioni");
const openProcedureBtn = document.getElementById("openProcedure");
const openLogisticaBtn = document.getElementById("openLogistica");

// FORM ASSENZE
const assenzeForm = document.getElementById("assenzeForm");
const assenzeFeedback = document.getElementById("assenzeFeedback");

// FORM COMUNICAZIONI
const comForm = document.getElementById("comForm");
const comFeedback = document.getElementById("comFeedback");

// FORM LOGISTICA
const logisticaForm = document.getElementById("logisticaForm");
const logisticaFeedback = document.getElementById("logisticaFeedback");

// PROCEDURE ELEMENTI
const repartoButtons = document.querySelectorAll(".reparto-btn");
const procedureListEl = document.getElementById("procedureList");
const selectedRepartoLabel = document.getElementById("selectedRepartoLabel");
const procedureSearchInput = document.getElementById("procedureSearch");
const tornaRepartiBtn = document.getElementById("tornaRepartiBtn");

// COUNTER PER REPARTO (procedure)
const countCassaEl = document.getElementById("countCassa");
const countBancoEl = document.getElementById("countBanco");
const countMagazzinoEl = document.getElementById("countMagazzino");
const countServiziEl = document.getElementById("countServizi");

// DATI PROCEDURE (DEMO)
const PROCEDURE_DATA = [
  // CASSA
  {
    reparto: "cassa",
    titolo: "Doppio scontrino / errore importo",
    codice: "C1",
    descrizione:
      "Cosa fare se viene emesso uno scontrino con importo errato o in doppia copia.",
  },
  {
    reparto: "cassa",
    titolo: "Scontrino contanti ma pagamento con POS",
    codice: "C2",
    descrizione:
      "Procedura in caso lo scontrino sia stato chiuso in contanti ma il cliente paga con POS.",
  },
  {
    reparto: "cassa",
    titolo: "Annullamento scontrino",
    codice: "C3",
    descrizione:
      "Passaggi da seguire per l’annullamento di uno scontrino già emesso.",
  },
  {
    reparto: "cassa",
    titolo: "Reso con rimborso in contanti",
    codice: "C4",
    descrizione:
      "Come registrare un reso con rimborso economico al cliente, mantenendo la tracciabilità.",
  },
  {
    reparto: "cassa",
    titolo: "Reso con buono o cambio prodotto",
    codice: "C5",
    descrizione:
      "Gestione dei resi con emissione di buono o sostituzione diretta del prodotto.",
  },
  {
    reparto: "cassa",
    titolo: "Scontrino su ricetta SSN",
    codice: "C6",
    descrizione:
      "Passaggi per chiudere correttamente vendita con ricetta SSN dal banco alla cassa.",
  },

  // BANCO
  {
    reparto: "banco",
    titolo: "Gestione ricetta anticipata",
    codice: "B1",
    descrizione:
      "Cosa fare quando il cliente paga prima e porta la ricetta in un secondo momento.",
  },
  {
    reparto: "banco",
    titolo: "Vendita SOP/OTC",
    codice: "B2",
    descrizione:
      "Linee guida rapide per la vendita di SOP e OTC nel rispetto delle normative.",
  },
  {
    reparto: "banco",
    titolo: "Consiglio dermocosmetico base",
    codice: "B3",
    descrizione: "Schema di domande rapide per un consiglio cosmetico sicuro.",
  },

  // MAGAZZINO
  {
    reparto: "magazzino",
    titolo: "Prodotto danneggiato in arrivo",
    codice: "M1",
    descrizione:
      "Segnalazione di prodotto rotto in consegna e gestione con il fornitore.",
  },
  {
    reparto: "magazzino",
    titolo: "Controllo scadenze mensili",
    codice: "M2",
    descrizione:
      "Come controllare le scadenze per reparto e segnalare le rimanenze critiche.",
  },
  {
    reparto: "magazzino",
    titolo: "Gestione merce in eccesso",
    codice: "M3",
    descrizione:
      "Cosa fare se arriva più merce del dovuto o carico non atteso.",
  },

  // SERVIZI
  {
    reparto: "servizi",
    titolo: "Prenotazione ECG / Holter",
    codice: "S1",
    descrizione:
      "Passaggi rapidi per prenotare esami (ECG, Holter, etc.) e consegna referti.",
  },
  {
    reparto: "servizi",
    titolo: "Gestione appuntamenti CUP / ticket",
    codice: "S2",
    descrizione:
      "Flusso operativo per gestire appuntamenti CUP e stampe ticket.",
  },

  // SICUREZZA
  {
    reparto: "sicurezza",
    titolo: "Infortunio cliente all’interno",
    codice: "SEC1",
    descrizione:
      "Azioni immediate da fare in caso di infortunio di un cliente in farmacia.",
  },
  {
    reparto: "sicurezza",
    titolo: "Gestione rapina o minaccia",
    codice: "SEC2",
    descrizione:
      "Linee guida comportamentali in caso di rapina o minacce al personale.",
  },
];

/* =========================
   FUNZIONI NAVIGAZIONE
   ========================= */

function showSection(sectionId) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach((sec) => {
    if (sec.id === sectionId) {
      sec.classList.add("active");
      sec.classList.remove("hidden");
    } else {
      sec.classList.remove("active");
      sec.classList.add("hidden");
    }
  });

  // Chiudo sidebar su mobile quando cambio pagina
  if (window.innerWidth <= 1024) {
    sidebar.classList.add("hidden");
  }
}

/* =========================
   LOGIN (DEMO)
   ========================= */

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const role = (
      loginForm.querySelector('input[name="role"]:checked') || {}
    ).value;

    let label = "Profilo: Farmacia";
    if (role === "titolare") label = "Profilo: Titolare";
    if (role === "dipendente") label = "Profilo: Dipendente";
    if (currentRoleLabel) currentRoleLabel.textContent = label;

    loginPage.classList.add("hidden");
    app.classList.remove("hidden");

    showSection("dashboard");
  });
}

/* =========================
   SIDEBAR & LOGOUT
   ========================= */

if (hamburger) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });
}

if (closeSidebar) {
  closeSidebar.addEventListener("click", () => {
    sidebar.classList.add("hidden");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    app.classList.add("hidden");
    loginPage.classList.remove("hidden");
  });
}

// Click su voci di menu sidebar
document.querySelectorAll(".sidebar-list li[data-go]").forEach((li) => {
  li.addEventListener("click", () => {
    const target = li.getAttribute("data-go");
    if (target) showSection(target);
  });
});

// Bottoni "Dashboard" nelle pagine
document.querySelectorAll(".btn-dashboard").forEach((btn) => {
  btn.addEventListener("click", () => {
    const go = btn.getAttribute("data-go") || "dashboard";
    showSection(go);
  });
});

/* =========================
   NAVIGAZIONE CARDS DASHBOARD
   ========================= */

if (openAssenzeBtn) {
  openAssenzeBtn.addEventListener("click", () => showSection("assenzePage"));
}
if (openFarmacieBtn) {
  openFarmacieBtn.addEventListener("click", () => showSection("farmaciePage"));
}
if (openComunicazioniBtn) {
  openComunicazioniBtn.addEventListener("click", () =>
    showSection("comunicazioniPage")
  );
}
if (openProcedureBtn) {
  openProcedureBtn.addEventListener("click", () =>
    showSection("procedurePage")
  );
}
if (openLogisticaBtn) {
  openLogisticaBtn.addEventListener("click", () => showSection("logisticaPage"));
}

/* =========================
   FORM ASSENZE (DEMO)
   ========================= */

if (assenzeForm) {
  assenzeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (assenzeFeedback) {
      assenzeFeedback.classList.remove("hidden");
      setTimeout(() => {
        assenzeFeedback.classList.add("hidden");
      }, 2500);
    }
    assenzeForm.reset();
  });
}

/* =========================
   FORM COMUNICAZIONI (DEMO)
   ========================= */

if (comForm) {
  comForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (comFeedback) {
      comFeedback.classList.remove("hidden");
      setTimeout(() => {
        comFeedback.classList.add("hidden");
      }, 2500);
    }
    comForm.reset();
  });
}

/* =========================
   FORM LOGISTICA (DEMO)
   ========================= */

if (logisticaForm) {
  logisticaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (logisticaFeedback) {
      logisticaFeedback.classList.remove("hidden");
      setTimeout(() => {
        logisticaFeedback.classList.add("hidden");
      }, 2500);
    }
    logisticaForm.reset();
  });
}

/* =========================
   PROCEDURE: LOGICA
   ========================= */

let selectedReparto = "cassa";

function aggiornaCounters() {
  const counts = {
    cassa: 0,
    banco: 0,
    magazzino: 0,
    servizi: 0,
    sicurezza: 0,
  };

  PROCEDURE_DATA.forEach((p) => {
    if (counts[p.reparto] !== undefined) {
      counts[p.reparto]++;
    }
  });

  if (countCassaEl) countCassaEl.textContent = counts.cassa;
  if (countBancoEl) countBancoEl.textContent = counts.banco;
  if (countMagazzinoEl) countMagazzinoEl.textContent = counts.magazzino;
  if (countServiziEl) countServiziEl.textContent = counts.servizi;
}

function getRepartoLabel(reparto) {
  switch (reparto) {
    case "cassa":
      return "Cassa";
    case "banco":
      return "Banco";
    case "magazzino":
      return "Magazzino";
    case "servizi":
      return "Servizi";
    case "sicurezza":
      return "Sicurezza";
    default:
      return reparto;
  }
}

function renderProcedureList() {
  if (!procedureListEl) return;

  const searchText = (procedureSearchInput?.value || "")
    .toLowerCase()
    .trim();

  const filtrate = PROCEDURE_DATA.filter((p) => {
    if (p.reparto !== selectedReparto) return false;
    if (!searchText) return true;
    return (
      p.titolo.toLowerCase().includes(searchText) ||
      (p.descrizione || "").toLowerCase().includes(searchText) ||
      (p.codice || "").toLowerCase().includes(searchText)
    );
  });

  procedureListEl.innerHTML = "";

  if (filtrate.length === 0) {
    const li = document.createElement("li");
    li.className = "procedure-item reparto-" + selectedReparto;
    li.innerHTML =
      '<div class="procedure-main-row"><strong>Nessuna procedura trovata</strong></div><span class="small-text">Modifica i filtri o il testo di ricerca.</span>';
    procedureListEl.appendChild(li);
    return;
  }

  filtrate.forEach((p) => {
    const li = document.createElement("li");
    li.className = "procedure-item reparto-" + p.reparto;

    const main = document.createElement("div");
    main.className = "procedure-main-row";

    const titleEl = document.createElement("span");
    titleEl.innerHTML = "<strong>" + p.titolo + "</strong>";

    const meta = document.createElement("div");
    meta.className = "procedure-meta";

    const chipReparto = document.createElement("span");
    chipReparto.className = "chip chip-neutral";
    chipReparto.textContent = getRepartoLabel(p.reparto);

    const codeSpan = document.createElement("span");
    codeSpan.className = "small-text";
    codeSpan.textContent = p.codice;

    meta.appendChild(chipReparto);
    meta.appendChild(codeSpan);

    main.appendChild(titleEl);
    main.appendChild(meta);

    const desc = document.createElement("span");
    desc.className = "small-text";
    desc.textContent = p.descrizione;

    li.appendChild(main);
    li.appendChild(desc);

    procedureListEl.appendChild(li);
  });
}

function setSelectedReparto(reparto) {
  selectedReparto = reparto;

  repartoButtons.forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-reparto") === reparto
    );
  });

  if (selectedRepartoLabel) {
    selectedRepartoLabel.textContent = getRepartoLabel(reparto);
  }

  renderProcedureList();
}

// EVENTI REPARTO
repartoButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const reparto = btn.getAttribute("data-reparto");
    setSelectedReparto(reparto);
  });
});

// RICERCA
if (procedureSearchInput) {
  procedureSearchInput.addEventListener("input", () => {
    renderProcedureList();
  });
}

// TORNA AI REPARTI PRINCIPALI (qui mantiene il reparto selezionato, serve solo come "reset visivo")
if (tornaRepartiBtn) {
  tornaRepartiBtn.addEventListener("click", () => {
    procedureSearchInput.value = "";
    setSelectedReparto(selectedReparto);
  });
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  aggiornaCounters();
  setSelectedReparto("cassa");
});
