// script.js

// dopo quanti ms torna al riepilogo / calendario
const IDLE_TIMEOUT_MS = 30000;

let idleTimer = null;
let isShowingSummary = true;

// DATI SEZIONI
const CARD_DATA = {
  assenti: {
    title: "Assenti / Permessi",
    summary: "Vista immediata delle assenze approvate.",
    items: [
      "Mostra chi è assente oggi, per tipo di permesso.",
      "Vedi ferie programmate nei prossimi giorni.",
      "In futuro: approvazione digitale delle richieste."
    ]
  },
  turno: {
    title: "Farmacia di turno",
    summary: "Farmacia attiva oggi e prossimi turni.",
    items: [
      "Nome farmacia di turno e fascia oraria.",
      "Farmacia di appoggio e contatti rapidi.",
      "In futuro: integrazione con calendario ASL."
    ]
  },
  comunicazioni: {
    title: "Comunicazioni",
    summary: "Note interne e messaggi per il team.",
    items: [
      "Ultime comunicazioni non lette.",
      "Messaggi importanti fissati in alto.",
      "Storico consultabile per data."
    ]
  },
  procedure: {
    title: "Procedure",
    summary: "Procedure operative della farmacia.",
    items: [
      "SOP per servizi e attività quotidiane.",
      "Istruzioni rapide per nuove risorse.",
      "Collegamento diretto alla sezione documenti."
    ]
  },
  logistica: {
    title: "Logistica",
    summary: "Gestione arrivi merce e corrieri.",
    items: [
      "Monitor corrieri e ritiri programmati.",
      "Note su colli mancanti o danneggiati.",
      "In futuro: integrazione con gestionale magazzino."
    ]
  },
  magazzino: {
    title: "Magazziniera",
    summary: "Scorte, inventari e resi.",
    items: [
      "Controlli periodici di scaffale e cassetti.",
      "Resi programmati e da confermare.",
      "Alert su prodotti critici."
    ]
  },
  scadenze: {
    title: "Prodotti in scadenza",
    summary: "Prodotti prossimi alla scadenza.",
    items: [
      "Lista articoli in scadenza entro 30 giorni.",
      "Suggerimenti di scontistica o reso.",
      "Possibilità di esportare un report."
    ]
  },
  consumabili: {
    title: "Consumabili",
    summary: "Materiale di lavoro e presidi.",
    items: [
      "Stato di guanti, aghi, salviette, modulistica.",
      "Soglie minime con alert automatici.",
      "Storico degli ordini di materiale."
    ]
  },
  consegne: {
    title: "Consegne / Ritiri",
    summary: "Corrieri e consegne a domicilio.",
    items: [
      "Riepilogo consegne previste oggi.",
      "Conferma avvenuta consegna.",
      "In futuro: firma digitale del cliente."
    ]
  },
  cassa: {
    title: "Cambio cassa",
    summary: "Cambio cassa e controlli veloci.",
    items: [
      "Ultimo cambio registrato con orario.",
      "Differenze segnalate rispetto al teorico.",
      "Accesso rapido al modulo completo."
    ]
  },
  archivio: {
    title: "Archivio file",
    summary: "Documenti e report della farmacia.",
    items: [
      "Schede operative, contratti, documenti ASL.",
      "Ricerca rapida per parola chiave o data.",
      "Accesso controllato per ruolo."
    ]
  }
};

// DATI DEMO AGENDA
const AGENDA_DEMO = {
  giorno: [
    {
      day: "Oggi – Lunedì",
      slots: [
        { time: "08:30", label: "ECG", type: "ecg" },
        { time: "10:00", label: "Holter pressorio", type: "holter" },
        { time: "12:00", label: "Vaccino influenza", type: "vaccino" },
        { time: "17:30", label: "Consulenza nutrizionale", type: "consulenza" }
      ]
    }
  ],
  settimana: [
    { day: "Lunedì", slots: [
      { time: "Mattina", label: "ECG", type: "ecg" },
      { time: "Pomeriggio", label: "Consulenza nutrizionale", type: "consulenza" }
    ]},
    { day: "Martedì", slots: [
      { time: "Tutto il giorno", label: "Holter pressorio", type: "holter" }
    ]},
    { day: "Mercoledì", slots: [
      { time: "Mattina", label: "Vaccini", type: "vaccino" }
    ]},
    { day: "Giovedì", slots: [
      { time: "Pomeriggio", label: "ECG + Holter", type: "ecg" }
    ]},
    { day: "Venerdì", slots: [
      { time: "Mattina", label: "Consulenze dermocosmesi", type: "consulenza" }
    ]}
  ],
  mese: [
    { day: "Settimana 1", slots: [{ time: "", label: "Focus ECG", type: "ecg" }] },
    { day: "Settimana 2", slots: [{ time: "", label: "Campagna vaccini", type: "vaccino" }] },
    { day: "Settimana 3", slots: [{ time: "", label: "Holter pressorio", type: "holter" }] },
    { day: "Settimana 4", slots: [{ time: "", label: "Consulenze nutrizionali", type: "consulenza" }] }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  setupCardClicks();
  setupMobileDetail();
  setupTabs();
  renderAgenda("giorno");
  startIdleTimer();
});

// ===== RIEPILOGO / TIMER =====

function startIdleTimer() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    showSummary();
    resetAgendaToCalendar();
  }, IDLE_TIMEOUT_MS);
}

function clearIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
}

function showSummary() {
  const quick = document.getElementById("quick-summary");
  if (!quick) return;
  quick.style.display = "block";
  isShowingSummary = true;
}

function showDetail(cardKey) {
  const data = CARD_DATA[cardKey];
  const quick = document.getElementById("quick-summary");
  const title = document.getElementById("detail-title");
  const summary = document.getElementById("detail-summary");
  const list = document.getElementById("detail-list");

  if (!data || !quick || !title || !summary || !list) return;

  quick.style.display = "none";
  isShowingSummary = false;

  title.textContent = data.title;
  summary.textContent = data.summary;
  list.innerHTML = "";
  data.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  startIdleTimer();
}

function setupCardClicks() {
  const allButtons = document.querySelectorAll("[data-card]");
  allButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-card");
      if (key && CARD_DATA[key]) {
        if (window.innerWidth > 768) {
          showDetail(key);
        } else {
          openMobileDetail(key);
        }
      }
    });
  });

  ["click", "mousemove", "keydown"].forEach((evt) => {
    document.addEventListener(evt, () => {
      startIdleTimer();
    });
  });
}
// ===== MOBILE – DETTAGLIO =====

function setupMobileDetail() {
  const overlay = document.getElementById("m-detail-overlay");
  const closeBtn = document.getElementById("m-detail-close");
  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
    }
  });
}

function openMobileDetail(cardKey) {
  const data = CARD_DATA[cardKey];
  const overlay = document.getElementById("m-detail-overlay");
  const title = document.getElementById("m-detail-title");
  const summary = document.getElementById("m-detail-summary");
  const list = document.getElementById("m-detail-list");
  if (!data || !overlay || !title || !summary || !list) return;

  title.textContent = data.title;
  summary.textContent = data.summary;
  list.innerHTML = "";
  data.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  overlay.style.display = "flex";
}

// ===== TABS Q4 – CALENDARIO / DOCUMENTI =====

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = {
    calendario: document.getElementById("tab-calendario"),
    documenti: document.getElementById("tab-documenti")
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      Object.keys(tabContents).forEach((key) => {
        if (key === tab) {
          tabContents[key].classList.remove("hidden");
        } else {
          tabContents[key].classList.add("hidden");
        }
      });
    });
  });

  // cambio vista (giorno / settimana / mese)
  const viewButtons = document.querySelectorAll(".cal-view-btn");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderAgenda(view);
    });
  });
}

// riportare Q4 in modalità Calendario/Giorno dopo inattività
function resetAgendaToCalendar() {
  const calTabBtn = document.querySelector(".tab-btn[data-tab='calendario']");
  const docTabBtn = document.querySelector(".tab-btn[data-tab='documenti']");
  const tabCal = document.getElementById("tab-calendario");
  const tabDoc = document.getElementById("tab-documenti");

  if (calTabBtn && docTabBtn && tabCal && tabDoc) {
    calTabBtn.classList.add("active");
    docTabBtn.classList.remove("active");
    tabCal.classList.remove("hidden");
    tabDoc.classList.add("hidden");
  }

  const viewButtons = document.querySelectorAll(".cal-view-btn");
  viewButtons.forEach((btn) => {
    const view = btn.getAttribute("data-view");
    if (view === "giorno") {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderAgenda("giorno");
}

// ===== AGENDA =====

function renderAgenda(view) {
  const col = document.getElementById("agenda-column");
  if (!col) return;

  const data = AGENDA_DEMO[view] || [];
  col.innerHTML = "";

  data.forEach((dayBlock) => {
    const dayDiv = document.createElement("div");
    dayDiv.className = "agenda-day";

    const title = document.createElement("div");
    title.className = "agenda-day-title";
    title.textContent = dayBlock.day;
    dayDiv.appendChild(title);

    dayBlock.slots.forEach((s) => {
      const slot = document.createElement("div");
      slot.className = "agenda-slot " + slotClassFromType(s.type);
      const timePart = s.time ? s.time + " – " : "";
      slot.textContent = timePart + s.label;
      dayDiv.appendChild(slot);
    });

    col.appendChild(dayDiv);
  });
}

function slotClassFromType(type) {
  switch (type) {
    case "ecg": return "slot-ecg";
    case "holter": return "slot-holter";
    case "vaccino": return "slot-vaccino";
    case "consulenza": return "slot-consulenza";
    default: return "slot-ecg";
  }
}
