document.addEventListener("DOMContentLoaded", () => {
  setTodayLabel();
  initChat();
  initServices();
  initAgenda();
  setupInactivityToCalendar();
});

/* ======================
   DATA / UTILITIES
   ====================== */

function formatDateLongIT(date) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTimeHM(date) {
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setTodayLabel() {
  const el = document.getElementById("desktop-today");
  const agendaLabel = document.getElementById("agenda-date-label");
  const now = new Date();
  const text = formatDateLongIT(now);
  if (el) el.textContent = text;
  if (agendaLabel) agendaLabel.textContent = text;
}

/* ======================
   CHAT INTERNA
   ====================== */

let chatMessages = [];

function initChat() {
  // demo: un messaggio iniziale
  chatMessages = [
    {
      autore: "Emanuela",
      tipo: "Promemoria",
      testo: "Ricordarsi di verificare scorte HOLTER per la prossima settimana.",
      fileName: "checklist_holter.pdf",
      timestamp: new Date().toISOString(),
    },
  ];

  renderChat();

  const form = document.getElementById("chat-form");
  const inputFileBtn = document.getElementById("chat-file-btn");
  const inputFile = document.getElementById("chat-file-input");
  const fileDisplay = document.getElementById("chat-file-display");
  const clearBtn = document.getElementById("chat-clear");

  let selectedFileName = "";

  if (inputFileBtn && inputFile && fileDisplay) {
    inputFileBtn.addEventListener("click", () => inputFile.click());
    inputFile.addEventListener("change", () => {
      if (inputFile.files && inputFile.files[0]) {
        selectedFileName = inputFile.files[0].name;
        fileDisplay.textContent = selectedFileName;
      } else {
        selectedFileName = "";
        fileDisplay.textContent = "Nessun file";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const autoreSel = document.getElementById("chat-autore");
      const tipoSel = document.getElementById("chat-tipo");
      const testoArea = document.getElementById("chat-testo");
      if (!autoreSel || !tipoSel || !testoArea) return;

      const testo = testoArea.value.trim();
      if (!testo) return;

      chatMessages.push({
        autore: autoreSel.value,
        tipo: tipoSel.value,
        testo,
        fileName: selectedFileName || "",
        timestamp: new Date().toISOString(),
      });

      testoArea.value = "";
      selectedFileName = "";
      fileDisplay.textContent = "Nessun file";
      inputFile.value = "";

      renderChat();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Svuotare la chat?")) {
        chatMessages = [];
        renderChat();
      }
    });
  }
}

function renderChat() {
  const container = document.getElementById("chat-messages");
  const count = document.getElementById("chat-count");
  if (!container) return;

  container.innerHTML = "";

  chatMessages.forEach((msg) => {
    const row = document.createElement("div");
    const isOwner = msg.autore === "Valerio";
    row.className = "msg-row " + (isOwner ? "right" : "left");

    const wrap = document.createElement("div");
    wrap.className = "msg-bubble-wrap";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = getInitials(msg.autore);

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    const meta = document.createElement("div");
    meta.className = "msg-meta";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = msg.autore;

    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTimeHM(new Date(msg.timestamp));

    const tagSpan = document.createElement("span");
    tagSpan.className = "msg-tag " + msg.tipo;
    tagSpan.textContent = msg.tipo;

    meta.appendChild(nameSpan);
    meta.appendChild(tagSpan);
    meta.appendChild(timeSpan);

    const textP = document.createElement("p");
    textP.className = "msg-text";
    textP.textContent = msg.testo;

    bubble.appendChild(meta);
    bubble.appendChild(textP);

    if (msg.fileName) {
      const fileP = document.createElement("div");
      fileP.className = "msg-file";
      fileP.textContent = "📎 " + msg.fileName;
      bubble.appendChild(fileP);
    }

    if (isOwner) {
      wrap.appendChild(bubble);
      wrap.appendChild(avatar);
    } else {
      wrap.appendChild(avatar);
      wrap.appendChild(bubble);
    }

    row.appendChild(wrap);
    container.appendChild(row);
  });

  container.scrollTop = container.scrollHeight;

  if (count) {
    count.textContent = chatMessages.length
      ? chatMessages.length + " messaggi"
      : "Nessun messaggio";
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ======================
   SERVIZI & CLIENTI
   ====================== */

const offerteDemo = [
  {
    icon: "💊",
    titolo: "Promo colesterolo 2025",
    testo: "- test + misurazioni saturazione.",
    chip: "Check-up",
  },
  {
    icon: "💉",
    titolo: "Vaccini influenza",
    testo: "Sconto 20% prodotti stagionali.",
    chip: "Stagionale",
  },
  {
    icon: "❤️",
    titolo: "Pacchetto ‘Cuore sereno’",
    testo: "ECG + controllo pressione dedicato.",
    chip: "Cardio",
  },
];

const eventiDemo = [
  {
    icon: "🩺",
    titolo: "Lunedì – Giornata misurazione pressione",
    testo: "Mattina e pomeriggio, su prenotazione.",
    chip: "Servizio",
  },
  {
    icon: "📊",
    titolo: "Martedì – Giornata HOLTER pressorio",
    testo: "Installazione e riconsegna dispositivi.",
    chip: "Holter",
  },
  {
    icon: "🥗",
    titolo: "Venerdì – Consulenza nutrizionale",
    testo: "Valutazione piano alimentare.",
    chip: "Nutrizione",
  },
];

function initServices() {
  const offerteUl = document.getElementById("offerte-list");
  const eventiUl = document.getElementById("eventi-list");
  if (offerteUl) {
    offerteDemo.forEach((o) => {
      offerteUl.appendChild(createServiceLi(o, "offerta"));
    });
  }
  if (eventiUl) {
    eventiDemo.forEach((e) => {
      eventiUl.appendChild(createServiceLi(e, "evento"));
    });
  }
}

function createServiceLi(item, tipo) {
  const li = document.createElement("li");

  const iconSpan = document.createElement("span");
  iconSpan.className = "service-icon";
  iconSpan.textContent = item.icon;

  const textWrap = document.createElement("div");

  const main = document.createElement("div");
  main.className = "service-text-main";
  main.textContent = item.titolo;

  const sub = document.createElement("div");
  sub.className = "service-tagline";
  sub.textContent = item.testo;

  const chip = document.createElement("span");
  chip.className = "service-chip " + tipo;
  chip.textContent = item.chip;

  textWrap.appendChild(main);
  textWrap.appendChild(sub);
  textWrap.appendChild(chip);

  li.appendChild(iconSpan);
  li.appendChild(textWrap);
  return li;
}
/* ======================
   AGENDA & DOCUMENTI
   ====================== */

const agendaHoursRange = { start: 8, end: 20 }; // 8–20

const eventiGiornoDemo = [
  {
    oraInizio: "09:00",
    oraFine: "10:30",
    titolo: "ECG – Rossi Maria",
    tipo: "eco",
  },
  {
    oraInizio: "11:00",
    oraFine: "12:30",
    titolo: "Holter pressorio – Bianchi Luca",
    tipo: "holter",
  },
  {
    oraInizio: "15:00",
    oraFine: "16:00",
    titolo: "Prelievo profilo lipidico",
    tipo: "prelievo",
  },
  {
    oraInizio: "17:30",
    oraFine: "18:00",
    titolo: "Consulenza nutrizionale",
    tipo: "consulenza",
  },
];

let docFolders = [
  { name: "Servizi cardio", meta: "3 file · aggiornato ieri" },
  { name: "Documenti dipendenti", meta: "5 file · HR" },
];

function initAgenda() {
  buildHoursColumn();
  renderDayEvents();
  renderDocGrid();
  setupAgendaTabs();
}

function buildHoursColumn() {
  const col = document.getElementById("agenda-hours");
  if (!col) return;
  col.innerHTML = "";
  for (let h = agendaHoursRange.start; h <= agendaHoursRange.end; h++) {
    const row = document.createElement("div");
    row.className = "agenda-hour-row";
    const label = String(h).padStart(2, "0") + ":00";
    row.textContent = label;
    col.appendChild(row);
  }
}

function renderDayEvents() {
  const container = document.getElementById("agenda-events");
  if (!container) return;
  container.innerHTML = "";

  eventiGiornoDemo.forEach((ev) => {
    const block = document.createElement("div");
    block.className = "event-block " + getEventClass(ev.tipo);

    const main = document.createElement("div");
    main.className = "event-main";
    main.textContent = ev.titolo;

    const time = document.createElement("div");
    time.className = "event-time";
    time.textContent = ev.oraInizio + " – " + ev.oraFine;

    block.appendChild(main);
    block.appendChild(time);
    container.appendChild(block);
  });

  const btnNuovo = document.getElementById("btn-nuovo-app");
  if (btnNuovo) {
    btnNuovo.addEventListener("click", () => {
      const titolo = prompt("Titolo appuntamento / servizio:");
      if (!titolo) return;
      const ora = prompt("Orario (es. 16:00 – 16:30):", "16:00 – 16:30");
      if (!ora) return;
      const [start, end] = ora.split("–").map((s) => s.trim());
      eventiGiornoDemo.push({
        oraInizio: start || "09:00",
        oraFine: end || "09:30",
        titolo,
        tipo: "eco",
      });
      renderDayEvents();
    });
  }
}

function getEventClass(tipo) {
  switch (tipo) {
    case "eco":
      return "event-eco";
    case "holter":
      return "event-holter";
    case "prelievo":
      return "event-prelievo";
    case "consulenza":
      return "event-consulenza";
    default:
      return "event-eco";
  }
}

/* DOCUMENTI */
function renderDocGrid() {
  const grid = document.getElementById("doc-grid");
  if (!grid) return;
  grid.innerHTML = "";
  docFolders.forEach((f) => {
    const card = document.createElement("div");
    card.className = "doc-card";

    const icon = document.createElement("div");
    icon.className = "doc-icon";
    icon.textContent = "📁";

    const name = document.createElement("div");
    name.className = "doc-name";
    name.textContent = f.name;

    const meta = document.createElement("div");
    meta.className = "doc-meta";
    meta.textContent = f.meta;

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(meta);
    grid.appendChild(card);
  });

  const btnCartella = document.getElementById("btn-nuova-cartella");
  const btnFile = document.getElementById("btn-carica-file");

  if (btnCartella) {
    btnCartella.onclick = () => {
      const nome = prompt("Nome nuova cartella:");
      if (!nome) return;
      docFolders.push({ name: nome, meta: "Cartella vuota" });
      renderDocGrid();
    };
  }

  if (btnFile) {
    btnFile.onclick = () => {
      const nome = prompt("Nome file da aggiungere (demo):", "documento.pdf");
      if (!nome) return;
      if (!docFolders.length) {
        docFolders.push({ name: "Nuova cartella", meta: nome });
      } else {
        // aggiorno la prima cartella come esempio
        const first = docFolders[0];
        first.meta = "Contiene anche: " + nome;
      }
      renderDocGrid();
    };
  }
}

/* TABS AGENDA (Calendario / Documenti) */
function setupAgendaTabs() {
  const tabs = document.querySelectorAll(".agenda-tab");
  const cal = document.getElementById("agenda-cal");
  const doc = document.getElementById("agenda-doc");
  if (!tabs.length || !cal || !doc) return;

  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");

      const tab = t.dataset.tab;
      if (tab === "cal") {
        cal.style.display = "flex";
        doc.style.display = "none";
      } else {
        cal.style.display = "none";
        doc.style.display = "flex";
      }
    });
  });
}

/* ======================
   INATTIVITÀ → CALENDARIO
   (30 secondi)
   ====================== */

function setupInactivityToCalendar() {
  let timer = null;
  const delay = 30000; // 30s

  function resetTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const calTab = document.querySelector(".agenda-tab[data-tab='cal']");
      if (!calTab) return;
      if (!calTab.classList.contains("active")) {
        calTab.click();
      }
    }, delay);
  }

  ["mousemove", "keydown", "click", "touchstart"].forEach((ev) => {
    document.addEventListener(ev, resetTimer);
  });

  resetTimer();
}
