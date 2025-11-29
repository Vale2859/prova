// script.js

document.addEventListener("DOMContentLoaded", () => {
  setTodayLabel();
  renderChatInitial();
  renderServizi();
  setupAgenda();
  setupTabs();
  setupChatForm();
  setupDocButtons();
  setupInactivityWatcher();
});

// =======================
// Data di oggi in header
// =======================
function setTodayLabel() {
  const el = document.getElementById("desktop-today");
  if (!el) return;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  el.textContent = formatter.format(now);
}

// =======================
// CHAT DEMO
// =======================

let chatMessages = [
  {
    id: 1,
    autore: "Emanuela",
    tipo: "Avviso",
    testo: "Ricordarsi referti ECG e controllare scorte holter.",
    file: "referti_ecg_oggi.pdf",
    timestamp: new Date(),
  },
];

function renderChatInitial() {
  renderChatMessages();
}

function renderChatMessages() {
  const container = document.getElementById("chat-messages");
  const countEl = document.getElementById("chat-count");
  if (!container) return;

  container.innerHTML = "";
  if (chatMessages.length === 0) {
    container.innerHTML =
      '<p style="font-size:0.8rem; color:#c3c8d9; margin:0;">Nessun messaggio. Scrivi la prima comunicazione.</p>';
    if (countEl) countEl.textContent = "0 messaggi";
    return;
  }

  chatMessages.forEach((msg) => {
    const row = document.createElement("div");
    row.className = "chat-message-row";

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.style.background = avatarColorFor(msg.autore);
    avatar.textContent = initialsFor(msg.autore);

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    const header = document.createElement("div");
    header.className = "chat-header-line";

    const nameSpan = document.createElement("span");
    nameSpan.className = "chat-name";
    nameSpan.textContent = msg.autore;

    const metaSpan = document.createElement("span");
    metaSpan.className = "chat-meta";
    const orario = formatTime(msg.timestamp);
    metaSpan.textContent = `${msg.tipo} · ${orario}`;

    header.appendChild(nameSpan);
    header.appendChild(metaSpan);

    const textP = document.createElement("p");
    textP.className = "chat-text";
    textP.textContent = msg.testo;

    bubble.appendChild(header);
    bubble.appendChild(textP);

    if (msg.file && msg.file.trim() !== "") {
      const fileP = document.createElement("p");
      fileP.className = "chat-attachment";
      fileP.textContent = `📎 Allegato: ${msg.file}`;
      bubble.appendChild(fileP);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    container.appendChild(row);
  });

  container.scrollTop = container.scrollHeight;

  if (countEl) {
    countEl.textContent =
      chatMessages.length === 1
        ? "1 messaggio"
        : `${chatMessages.length} messaggi`;
  }
}

function setupChatForm() {
  const form = document.getElementById("chat-form");
  const clearBtn = document.getElementById("chat-clear");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const autore = document.getElementById("chat-autore").value;
    const tipo = document.getElementById("chat-tipo").value;
    const testo = document.getElementById("chat-testo").value.trim();
    const file = document.getElementById("chat-file").value.trim();

    if (!testo) return;

    chatMessages.push({
      id: Date.now(),
      autore,
      tipo,
      testo,
      file,
      timestamp: new Date(),
    });

    document.getElementById("chat-testo").value = "";
    document.getElementById("chat-file").value = "";

    renderChatMessages();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (
        confirm(
          "Svuotare tutta la chat? (Solo demo, non vengono salvati messaggi reali.)"
        )
      ) {
        chatMessages = [];
        renderChatMessages();
      }
    });
  }
}

function initialsFor(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarColorFor(name) {
  const colors = [
    "#42a5f5",
    "#ab47bc",
    "#26a69a",
    "#ffa726",
    "#ef5350",
    "#7e57c2",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i) * 17) % 997;
  }
  return colors[hash % colors.length];
}

function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// =======================
// SERVIZI & CLIENTI (demo)
// =======================

const offerteDemo = [
  "Promo Colestid 2025: test + misurazioni saturazione.",
  "Sconto 20% prodotti stagionali (linea influenze).",
  "Pacchetto \"Cuore sereno\": ECG a prezzo dedicato.",
];

const eventiDemo = [
  "Lunedì: giornata misurazione pressione e glicemia.",
  "Mercoledì: giornata HOLTER pressorio.",
  "Venerdì: consulenza nutrizionale con dietista.",
];

function renderServizi() {
  const off = document.getElementById("offerte-list");
  const ev = document.getElementById("eventi-list");
  if (off) {
    off.innerHTML = offerteDemo.map((t) => `<li>• ${t}</li>`).join("");
  }
  if (ev) {
    ev.innerHTML = eventiDemo.map((t) => `<li>• ${t}</li>`).join("");
  }
}
// =======================
// AGENDA & DOCUMENTI
// =======================

let agendaMode = "giorno"; // giorno | settimana | mese

const agendaEventsDemo = [
  {
    time: "09:00 – 10:00",
    label: "ECG – Rossi Maria",
    type: "ecg",
  },
  {
    time: "10:30 – 12:30",
    label: "Holter pressorio – Bianchi Luca",
    type: "holter",
  },
  {
    time: "15:00 – 16:00",
    label: "Misurazione pressione continua",
    type: "press",
  },
  {
    time: "17:30 – 18:00",
    label: "Consulenza nutrizionale",
    type: "consul",
  },
];

const folderDemo = [
  { name: "Servizi e referti", meta: "ECG, holter, consulenze" },
  { name: "Personale", meta: "Turni, ferie, permessi" },
  { name: "Promozioni", meta: "Volantini e materiali marketing" },
];

function setupAgenda() {
  const viewSwitch = document.getElementById("agenda-view-switch");
  const dayLabel = document.getElementById("agenda-day-label");

  if (dayLabel) {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
      dayLabel.textContent = fmt.format(now);
  }

  if (viewSwitch) {
    viewSwitch.addEventListener("click", (e) => {
      const btn = e.target.closest(".view-pill");
      if (!btn) return;
      const mode = btn.dataset.mode;
      if (!mode) return;
      agendaMode = mode;
      document
        .querySelectorAll(".view-pill")
        .forEach((b) => b.classList.remove("view-pill-active"));
      btn.classList.add("view-pill-active");
      renderAgenda();
    });
  }

  const newAppBtn = document.getElementById("btn-nuovo-app");
  if (newAppBtn) {
    newAppBtn.addEventListener("click", () => {
      alert(
        "Demo: qui in futuro potrai inserire un nuovo appuntamento/servizio."
      );
    });
  }

  renderAgenda();
  renderFolders();
}

function renderAgenda() {
  const planner = document.getElementById("agenda-planner");
  const dayLabel = document.getElementById("agenda-day-label");
  if (!planner) return;

  planner.innerHTML = "";

  if (agendaMode === "giorno") {
    agendaEventsDemo.forEach((ev) => {
      const div = document.createElement("div");
      div.className = `agenda-event ev-${ev.type}`;
      const left = document.createElement("span");
      left.textContent = ev.time;
      const right = document.createElement("span");
      right.textContent = ev.label;
      div.appendChild(left);
      div.appendChild(right);
      planner.appendChild(div);
    });
  } else if (agendaMode === "settimana") {
    // vista super semplice: 7 giorni con etichetta colori del servizio principale
    const weekWrap = document.createElement("div");
    weekWrap.style.display = "grid";
    weekWrap.style.gridTemplateColumns = "repeat(7, 1fr)";
    weekWrap.style.gap = "4px";
    const giorni = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

    giorni.forEach((g, idx) => {
      const box = document.createElement("div");
      box.style.borderRadius = "10px";
      box.style.padding = "4px 6px";
      box.style.fontSize = "0.75rem";
      box.style.background =
        idx === 0 ? "rgba(66,165,245,0.25)" : "rgba(255,255,255,0.04)";
      box.innerHTML = `<strong>${g}</strong><br><span style="opacity:0.9;">${
        idx === 0 ? "Giornata ECG" : "—"
      }</span>`;
      weekWrap.appendChild(box);
    });

    planner.appendChild(weekWrap);

    if (dayLabel) {
      dayLabel.textContent = "Settimana – vista demo rapida";
    }
  } else if (agendaMode === "mese") {
    const p = document.createElement("p");
    p.style.fontSize = "0.8rem";
    p.style.color = "#c3c8d9";
    p.style.margin = "0";
    p.textContent =
      "Vista mensile in lavorazione (qui in futuro potrai vedere il calendario completo del mese).";
    planner.appendChild(p);

    if (dayLabel) {
      dayLabel.textContent = "Mese – panoramica (demo)";
    }
  }
}

// =======================
// Documenti
// =======================

let folders = [...folderDemo];

function renderFolders() {
  const grid = document.getElementById("folder-grid");
  if (!grid) return;

  grid.innerHTML = "";
  if (folders.length === 0) {
    grid.innerHTML =
      '<p style="font-size:0.8rem; color:#c3c8d9; margin:0;">Nessuna cartella. Usa "Nuova cartella" per crearne una.</p>';
    return;
  }

  folders.forEach((f, index) => {
    const card = document.createElement("div");
    card.className = "folder-card";
    card.style.background = folderColor(index);

    const name = document.createElement("div");
    name.className = "folder-name";
    name.textContent = `📁 ${f.name}`;

    const meta = document.createElement("div");
    meta.className = "folder-meta";
    meta.textContent = f.meta || "Cartella vuota (demo)";

    card.appendChild(name);
    card.appendChild(meta);

    grid.appendChild(card);
  });
}

function folderColor(index) {
  const colors = [
    "#42a5f5",
    "#ab47bc",
    "#26a69a",
    "#ffa726",
    "#ef5350",
    "#7e57c2",
    "#66bb6a",
  ];
  return colors[index % colors.length];
}

function setupDocButtons() {
  const btnCartella = document.getElementById("btn-nuova-cartella");
  const inputFile = document.getElementById("input-upload-file");

  if (btnCartella) {
    btnCartella.addEventListener("click", () => {
      const nome = prompt("Nome nuova cartella:");
      if (!nome) return;
      folders.push({ name: nome, meta: "Cartella creata (demo)" });
      renderFolders();
    });
  }

  if (inputFile) {
    inputFile.addEventListener("change", (e) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const first = e.target.files[0];
      alert(
        `Demo upload: hai selezionato "${first.name}". In produzione qui salveremmo il file nel NAS/server.`
      );
      e.target.value = "";
    });
  }
}

// =======================
// Tab Agenda / Documenti + inattività
// =======================

let inactivityTimer = null;
const INACTIVITY_MS = 30000; // 30 secondi

function setupTabs() {
  const tabs = document.getElementById("agenda-tabs");
  if (!tabs) return;

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".agenda-tab");
    if (!btn) return;
    const view = btn.dataset.view;
    if (!view) return;

    document
      .querySelectorAll(".agenda-tab")
      .forEach((b) => b.classList.remove("agenda-tab-active"));
    btn.classList.add("agenda-tab-active");

    if (view === "giorno") {
      showAgendaCalendario();
    } else if (view === "documenti") {
      showAgendaDocumenti();
    }
  });
}

function showAgendaCalendario() {
  document
    .querySelectorAll(".agenda-content")
    .forEach((c) => c.classList.remove("agenda-content-active"));
  const cal = document.getElementById("agenda-calendario");
  if (cal) cal.classList.add("agenda-content-active");
}

function showAgendaDocumenti() {
  document
    .querySelectorAll(".agenda-content")
    .forEach((c) => c.classList.remove("agenda-content-active"));
  const docs = document.getElementById("agenda-documenti");
  if (docs) docs.classList.add("agenda-content-active");
}

function setupInactivityWatcher() {
  const reset = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      // torna automaticamente alla tab "Calendario"
      const tabCal = document.querySelector(
        ".agenda-tab[data-view='giorno']"
      );
      if (tabCal) {
        document
          .querySelectorAll(".agenda-tab")
          .forEach((b) => b.classList.remove("agenda-tab-active"));
        tabCal.classList.add("agenda-tab-active");
      }
      showAgendaCalendario();
    }, INACTIVITY_MS);
  };

  ["click", "mousemove", "keydown"].forEach((ev) => {
    document.addEventListener(ev, reset);
  });

  reset();
}
