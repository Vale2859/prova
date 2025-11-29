// script.js

document.addEventListener("DOMContentLoaded", () => {
  aggiornaDataHeader();
  popolaOfferteEventi();
  inizializzaChat();
  inizializzaAgendaDocumenti();
  setupInactivityTimer();
});

// ==========================
// HEADER DATA
// ==========================

function aggiornaDataHeader() {
  const el = document.getElementById("header-date");
  const q4Today = document.getElementById("q4-today-label");
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const shortFormatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  if (el) el.textContent = formatter.format(now);
  if (q4Today) q4Today.textContent = shortFormatter.format(now);
}

// ==========================
// DEMO OFFERTE / EVENTI
// ==========================

const offerteDemo = [
  "Promo CovidBox 2025: test + misuratori saturazione.",
  "Sconto 20% su prodotti stagionali (linea influenza).",
  "Pacchetto 'Cuore sereno': ECG + profilo lipidico.",
];

const eventiDemo = [
  "Lunedì: Giornata misurazione pressione e glicemia.",
  "Mercoledì: Giornata HOLTER pressorio.",
  "Venerdì: Giornata ECG + consulenza cardiologica.",
];

function popolaOfferteEventi() {
  const ulOfferte = document.getElementById("offerte-list");
  const ulEventi = document.getElementById("eventi-list");

  if (ulOfferte) {
    ulOfferte.innerHTML = offerteDemo
      .map((t) => `<li>${t}</li>`)
      .join("");
  }
  if (ulEventi) {
    ulEventi.innerHTML = eventiDemo
      .map((t) => `<li>${t}</li>`)
      .join("");
  }
}

// ==========================
// CHAT COMUNICAZIONI
// ==========================

let chatMessages = [];

function inizializzaChat() {
  // carica da localStorage se presente
  try {
    const stored = localStorage.getItem("fm_chat_messages");
    if (stored) {
      chatMessages = JSON.parse(stored);
    } else {
      // qualche messaggio demo
      chatMessages = [
        {
          id: 1,
          autore: "Valerio",
          badge: "info",
          testo: "Ricordarsi di aggiornare il cartello turni in vetrina.",
          file: "",
          timestamp: Date.now() - 1000 * 60 * 45,
        },
        {
          id: 2,
          autore: "Emanuela",
          badge: "urgente",
          testo: "Mancano copri termometro al banco 2, verificare ordine.",
          file: "",
          timestamp: Date.now() - 1000 * 60 * 10,
        },
      ];
    }
  } catch (e) {
    chatMessages = [];
  }

  renderChat();

  const form = document.getElementById("chat-form");
  const clearBtn = document.getElementById("chat-clear");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      aggiungiMessaggioDaForm();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Svuotare tutte le comunicazioni (solo demo)?")) {
        chatMessages = [];
        salvaChat();
        renderChat();
      }
    });
  }
}

function aggiungiMessaggioDaForm() {
  const autoreEl = document.getElementById("chat-autore");
  const badgeEl = document.getElementById("chat-badge");
  const fileEl = document.getElementById("chat-file");
  const testoEl = document.getElementById("chat-testo");

  if (!autoreEl || !badgeEl || !testoEl) return;

  const testo = testoEl.value.trim();
  if (!testo) return;

  const msg = {
    id: Date.now(),
    autore: autoreEl.value || "Anonimo",
    badge: badgeEl.value || "info",
    testo,
    file: fileEl ? fileEl.value.trim() : "",
    timestamp: Date.now(),
  };

  chatMessages.push(msg);
  salvaChat();
  renderChat();

  testoEl.value = "";
  if (fileEl) fileEl.value = "";
}

function salvaChat() {
  try {
    localStorage.setItem("fm_chat_messages", JSON.stringify(chatMessages));
  } catch (e) {
    // ignoriamo errori quota
  }
}

function renderChat() {
  const container = document.getElementById("chat-messages");
  const counter = document.getElementById("chat-counter");
  if (!container) return;

  if (!Array.isArray(chatMessages)) chatMessages = [];
  // ordina per timestamp
  chatMessages.sort((a, b) => a.timestamp - b.timestamp);

  if (counter) {
    counter.textContent =
      chatMessages.length === 1
        ? "1 messaggio"
        : `${chatMessages.length} messaggi`;
  }

  if (chatMessages.length === 0) {
    container.innerHTML =
      '<p style="font-size:0.8rem; color:var(--txt-muted); margin:0;">Nessuna comunicazione. Scrivi il primo messaggio.</p>';
    return;
  }

  const fmt = new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  container.innerHTML = chatMessages
    .map((m) => {
      let badgeClass = "chat-badge-info";
      if (m.badge === "urgente") badgeClass = "chat-badge-urgente";
      else if (m.badge === "tecnico") badgeClass = "chat-badge-tecnico";
      const time = fmt.format(new Date(m.timestamp));
      const fileLine = m.file
        ? `<div class="chat-attachment">📎 ${m.file}</div>`
        : "";
      return `
      <div class="chat-message" data-id="${m.id}">
        <button class="chat-delete" title="Elimina">×</button>
        <div class="chat-header-line">
          <span class="chat-author">${escapeHtml(m.autore)}</span>
          <span class="chat-time">${time}</span>
          <span class="chat-badge ${badgeClass}">${m.badge}</span>
        </div>
        <p class="chat-text">${escapeHtml(m.testo)}</p>
        ${fileLine}
      </div>`;
    })
    .join("");

  // collego i bottoni elimina
  container.querySelectorAll(".chat-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".chat-message");
      if (!parent) return;
      const id = Number(parent.dataset.id);
      chatMessages = chatMessages.filter((m) => m.id !== id);
      salvaChat();
      renderChat();
    });
  });

  // scroll in fondo
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
// ==========================
// AGENDA & DOCUMENTI
// ==========================

const serviziColor = {
  ECG: "slot-ecg",
  HOLTER: "slot-holter",
  PRELIEVO: "slot-prelievo",
  CONSULENZA: "slot-consulenza",
};

let agendaMode = "day"; // day / week / month
let inactivityTimer = null;

// demo appuntamenti di oggi
let appuntamentiOggi = [
  { ora: "08:30", desc: "ECG – Rossi Mario", tipo: "ECG" },
  { ora: "10:00", desc: "Holter pressorio – Bianchi Luca", tipo: "HOLTER" },
  { ora: "16:00", desc: "Prelievo + profilo lipidico", tipo: "PRELIEVO" },
  { ora: "17:30", desc: "Consulenza nutrizionale", tipo: "CONSULENZA" },
];

const cartelleDemo = [
  {
    name: "Procedure farmacia",
    desc: "Standard operativi, protocolli, check-list.",
    cls: "doc-blue",
  },
  {
    name: "Magazzino & resi",
    desc: "Excel rotazione, inventari, resi fornitori.",
    cls: "doc-green",
  },
  {
    name: "Servizi al cittadino",
    desc: "ECG, Holter, autoanalisi, test rapidi.",
    cls: "doc-yellow",
  },
  {
    name: "Formazione interna",
    desc: "Slide corsi, linee guida, note ECM.",
    cls: "doc-purple",
  },
  {
    name: "Comunicazioni ASL",
    desc: "Circolari, note ufficiali, delibere.",
    cls: "doc-pink",
  },
  {
    name: "Archivio generale",
    desc: "Documenti vari, backup PDF importanti.",
    cls: "doc-dark",
  },
];

function inizializzaAgendaDocumenti() {
  const tabs = document.querySelectorAll(".q4-tab");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const btnNuovo = document.getElementById("btn-nuovo-app");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      attivaVistaQ4(btn.dataset.view);
    });
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      agendaMode = btn.dataset.mode || "day";
      modeBtns.forEach((b) => b.classList.remove("mode-btn-active"));
      btn.classList.add("mode-btn-active");
      renderCalendar();
    });
  });

  if (btnNuovo) {
    btnNuovo.addEventListener("click", () => {
      const ora = prompt("Orario (es. 09:30):");
      if (!ora) return;
      const desc = prompt("Descrizione appuntamento:");
      if (!desc) return;
      const tipo = prompt(
        "Tipo servizio (ECG, HOLTER, PRELIEVO, CONSULENZA):",
        "ECG"
      );
      appuntamentiOggi.push({
        ora,
        desc,
        tipo: (tipo || "ECG").toUpperCase(),
      });
      renderCalendar();
    });
  }

  renderCalendar();
  renderDocs();
}

function attivaVistaQ4(view) {
  const calView = document.getElementById("view-calendar");
  const docsView = document.getElementById("view-docs");
  const tabCal = document.getElementById("tab-calendar");
  const tabDocs = document.getElementById("tab-docs");

  if (!calView || !docsView || !tabCal || !tabDocs) return;

  if (view === "docs") {
    calView.style.display = "none";
    docsView.style.display = "block";
    tabCal.classList.remove("q4-tab-active");
    tabDocs.classList.add("q4-tab-active");
  } else {
    calView.style.display = "block";
    docsView.style.display = "none";
    tabCal.classList.add("q4-tab-active");
    tabDocs.classList.remove("q4-tab-active");
  }
}

function renderCalendar() {
  const dayNameEl = document.getElementById("calendar-day-name");
  const serviceLabel = document.getElementById("calendar-service-label");
  const slotsContainer = document.getElementById("calendar-slots");
  if (!dayNameEl || !serviceLabel || !slotsContainer) return;

  const today = new Date();
  const dayFmt = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  dayNameEl.textContent = dayFmt.format(today);

  // servizio principale della giornata (in base al primo appuntamento)
  if (appuntamentiOggi.length > 0) {
    const tipo = appuntamentiOggi[0].tipo.toUpperCase();
    let label = "Servizi vari";
    if (tipo === "ECG") label = "Giornata ECG";
    else if (tipo === "HOLTER") label = "Giornata Holter";
    else if (tipo === "PRELIEVO") label = "Prelievi";
    else if (tipo === "CONSULENZA") label = "Consulenze";
    serviceLabel.textContent = label;
  } else {
    serviceLabel.textContent = "Nessun servizio programmato";
  }

  if (agendaMode !== "day") {
    slotsContainer.innerHTML =
      '<p style="margin:0; font-size:0.8rem; color:var(--txt-muted);">Per ora la vista "' +
      agendaMode +
      '" è solo dimostrativa. Usa la vista Giorno per i dettagli degli orari.</p>';
    return;
  }

  // ordina per ora
  appuntamentiOggi.sort((a, b) => (a.ora > b.ora ? 1 : -1));

  slotsContainer.innerHTML = appuntamentiOggi
    .map((app) => {
      const cls =
        serviziColor[app.tipo?.toUpperCase()] || serviziColor.ECG;
      return `
      <div class="calendar-slot">
        <span class="slot-time">${app.ora}</span>
        <div class="slot-block ${cls}">
          ${escapeHtml(app.desc)}
        </div>
      </div>`;
    })
    .join("");
}

function renderDocs() {
  const grid = document.getElementById("docs-grid");
  if (!grid) return;
  grid.innerHTML = cartelleDemo
    .map(
      (c) => `
    <div class="doc-folder ${c.cls}">
      <div class="doc-name">${c.name}</div>
      <div class="doc-desc">${c.desc}</div>
    </div>`
    )
    .join("");
}

// ==========================
// INACTIVITY TIMER
// dopo 30s torna automaticamente alla vista Calendario
// ==========================

function setupInactivityTimer() {
  const reset = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      attivaVistaQ4("calendar");
    }, 30000); // 30 secondi
  };

  ["click", "keydown", "mousemove", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, reset);
  });

  reset();
}
