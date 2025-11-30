// script.js

document.addEventListener("DOMContentLoaded", () => {
  initTodayLabel();
  initContentArea();
  initPromozioni();
  initAgenda();

  // reset panoramica dopo inattività nell'area contenuti
  setupContentIdleReset();
});

/* ========================
   HEADER DATA OGGI
   ======================== */
function initTodayLabel() {
  const el = document.getElementById("desk-today-label");
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

/* ========================
   AREA CONTENUTI (Q3)
   ======================== */
let contentIdleTimer = null;

function initContentArea() {
  renderPanoramicaRapida();

  const sectionButtons = document.querySelectorAll(".section-pill");
  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      if (!section) return;
      showSectionDetail(section);
      resetContentIdleTimer();
    });
  });
}

function renderPanoramicaRapida() {
  const container = document.getElementById("content-area");
  if (!container) return;

  container.innerHTML = `
    <div class="content-panels">
      <div class="content-panel">
        <div class="content-panel-icon" style="background:#e3f3ff;">📅</div>
        <div class="content-panel-body">
          <h3>Servizi di oggi</h3>
          <p>Controlla subito gli appuntamenti e i servizi programmati.</p>
        </div>
      </div>

      <div class="content-panel">
        <div class="content-panel-icon" style="background:#e9f7ec;">✅</div>
        <div class="content-panel-body">
          <h3>Assenze confermate</h3>
          <p>Vedi chi manca oggi e nei prossimi giorni.</p>
        </div>
      </div>

      <div class="content-panel">
        <div class="content-panel-icon" style="background:#fde7f3;">💬</div>
        <div class="content-panel-body">
          <h3>Comunicazioni</h3>
          <p>Avvisi rapidi per lo staff: turni, note operative, memo.</p>
        </div>
      </div>

      <div class="content-panel">
        <div class="content-panel-icon" style="background:#fff2dd;">🎯</div>
        <div class="content-panel-body">
          <h3>Offerte & giornate</h3>
          <p>Promo attive e giornate dedicate ai servizi.</p>
        </div>
      </div>
    </div>
  `;
}

function showSectionDetail(section) {
  const container = document.getElementById("content-area");
  if (!container) return;

  const MAP = {
    assenti: {
      title: "Assenti / Permessi",
      text: "Panoramica rapida delle assenze approvate, permessi e ferie del personale. In futuro qui potrai filtrare per nome, ruolo e periodo.",
    },
    turno: {
      title: "Farmacia di turno",
      text: "Visualizza la farmacia di turno oggi, gli appoggi e i prossimi turni programmati. Utile per rispondere al volo alle richieste dei clienti.",
    },
    comunicazioni: {
      title: "Comunicazioni interne",
      text: "Spazio dedicato ad avvisi veloci tra titolare e collaboratori: note operative, promemoria, messaggi importanti.",
    },
    procedure: {
      title: "Procedure",
      text: "Archivio delle procedure interne: esecuzione servizi, gestione resi, sicurezza, qualità. Consultabile in pochi tocchi.",
    },
    logistica: {
      title: "Logistica",
      text: "Gestione dei corrieri, consegne, ritiri e merce in arrivo. Qui troverai sempre l’ultima situazione aggiornata.",
    },
    magazziniera: {
      title: "Magazziniera",
      text: "Controlli scorte, inventari, lotti critici e prodotti da verificare. Pensato per chi segue il magazzino ogni giorno.",
    },
    scadenze: {
      title: "Prodotti in scadenza",
      text: "Elenco ragionato delle scadenze a breve, con priorità e suggerimenti di gestione espositiva o reso.",
    },
    consumabili: {
      title: "Consumabili",
      text: "Monitoraggio rapido di sacchetti, carta, modulistica, materiale di consumo. Per evitare le classiche urgenze dell’ultimo minuto.",
    },
    archivio: {
      title: "Archivio file",
      text: "In futuro qui vedrai le cartelle con tutti i documenti operativi, scannerizzati e ordinati per categoria.",
    },
  };

  const data = MAP[section];
  if (!data) {
    renderPanoramicaRapida();
    return;
  }

  container.innerHTML = `
    <h3 class="section-detail-title">${data.title}</h3>
    <p class="section-detail-text">
      ${data.text}
    </p>
  `;
}

/* Gestione inattività area contenuti */
function setupContentIdleReset() {
  const events = ["click", "keydown", "touchstart"];
  events.forEach((ev) => {
    document.addEventListener(ev, () => {
      resetContentIdleTimer();
    });
  });
  resetContentIdleTimer();
}

function resetContentIdleTimer() {
  clearTimeout(contentIdleTimer);
  contentIdleTimer = setTimeout(() => {
    renderPanoramicaRapida();
  }, 20000); // 20 secondi
}

/* ========================
   PROMOZIONI & GIORNATE
   ======================== */

const promoOfferte = [
  {
    id: 1,
    titolo: "LDF",
    dettaglio: "30/11 – SCONTO 30%",
    data: "2025-11-30",
  },
];

const promoGiornate = [
  {
    id: 1,
    titolo: "Giornata ECO",
    dettaglio: "Elettrocardiogramma con referto cardiologo.",
    data: "2025-12-02",
  },
];

let promoIdCounter = 2;

function initPromozioni() {
  renderPromoLists();

  const openButtons = document.querySelectorAll("[data-open-promo]");
  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.openPromo;
      openPromoModal(type);
    });
  });

  const promoForm = document.getElementById("promo-form");
  if (promoForm) {
    promoForm.addEventListener("submit", handlePromoSubmit);
  }

  const promoClose = document.querySelector("[data-close-modal='promo']");
  if (promoClose) {
    promoClose.addEventListener("click", () => hideModal("promo-modal"));
  }
}

function renderPromoLists() {
  const offerteEl = document.getElementById("promo-offerte-list");
  const giornateEl = document.getElementById("promo-giornate-list");
  if (!offerteEl || !giornateEl) return;

  // ordina per data
  promoOfferte.sort((a, b) => a.data.localeCompare(b.data));
  promoGiornate.sort((a, b) => a.data.localeCompare(b.data));

  offerteEl.innerHTML = "";
  giornateEl.innerHTML = "";

  promoOfferte.forEach((item) => {
    offerteEl.appendChild(createPromoItemElement(item, "offerta"));
  });
  promoGiornate.forEach((item) => {
    giornateEl.appendChild(createPromoItemElement(item, "giornata"));
  });

  if (!promoOfferte.length) {
    offerteEl.innerHTML =
      '<li class="promo-item"><span class="promo-item-meta">Nessuna offerta inserita.</span></li>';
  }
  if (!promoGiornate.length) {
    giornateEl.innerHTML =
      '<li class="promo-item"><span class="promo-item-meta">Nessuna giornata programmata.</span></li>';
  }
}

function createPromoItemElement(item, type) {
  const li = document.createElement("li");
  li.className = "promo-item";

  const dateIT = formatShortDateIT(item.data);
  const tagLabel = type === "offerta" ? "OFFERTA" : "GIORNATA";

  li.innerHTML = `
    <div class="promo-item-title">
      <span>${item.titolo}</span>
      <span class="promo-tag">${tagLabel}</span>
    </div>
    <div class="promo-item-meta">
      <span>${item.dettaglio}</span>
      <span>${dateIT}</span>
    </div>
    <button class="promo-delete" title="Elimina">×</button>
  `;

  li.querySelector(".promo-delete").addEventListener("click", () => {
    if (type === "offerta") {
      const idx = promoOfferte.findIndex((p) => p.id === item.id);
      if (idx !== -1) promoOfferte.splice(idx, 1);
    } else {
      const idx = promoGiornate.findIndex((p) => p.id === item.id);
      if (idx !== -1) promoGiornate.splice(idx, 1);
    }
    renderPromoLists();
  });

  return li;
}

function openPromoModal(type) {
  const modal = document.getElementById("promo-modal");
  if (!modal) return;

  const titleEl = document.getElementById("promo-modal-title");
  const typeInput = document.getElementById("promo-type");
  const dateInput = document.getElementById("promo-date");
  const nameInput = document.getElementById("promo-title");
  const detailInput = document.getElementById("promo-detail");

  if (type === "offerta") {
    titleEl.textContent = "Nuova offerta";
  } else {
    titleEl.textContent = "Nuova giornata in farmacia";
  }

  typeInput.value = type;
  nameInput.value = "";
  detailInput.value = "";
  dateInput.value = "";

  showModal("promo-modal");
}

function handlePromoSubmit(e) {
  e.preventDefault();
  const type = document.getElementById("promo-type").value;
  const titolo = document.getElementById("promo-title").value.trim();
  const dettaglio = document.getElementById("promo-detail").value.trim();
  const data = document.getElementById("promo-date").value;

  if (!type || !titolo || !data) return;

  const obj = {
    id: promoIdCounter++,
    titolo,
    dettaglio: dettaglio || "—",
    data,
  };

  if (type === "offerta") {
    promoOfferte.push(obj);
  } else {
    promoGiornate.push(obj);
  }

  renderPromoLists();
  hideModal("promo-modal");
}

/* ========================
   AGENDA SERVIZI (Q4)
   ======================== */

let agendaCurrentMonth = new Date(); // oggi
const agendaEvents = [
  {
    id: 1,
    date: "2025-11-30",
    time: "08:00",
    name: "Rossi Maria",
    service: "ECG",
    type: "ecg",
  },
  {
    id: 2,
    date: "2025-11-30",
    time: "09:30",
    name: "Bianchi Luca",
    service: "Holter pressorio",
    type: "holter",
  },
  {
    id: 3,
    date: "2025-11-30",
    time: "11:00",
    name: "Verdi Anna",
    service: "Prelievo profilo lipidico",
    type: "holter",
  },
  {
    id: 4,
    date: "2025-11-30",
    time: "17:00",
    name: "Gialli Paola",
    service: "Consulenza nutrizionale",
    type: "consulenza",
  },
];

let agendaIdCounter = 5;

function initAgenda() {
  renderAgendaMonth();

  const prevBtn = document.getElementById("agenda-prev-month");
  const nextBtn = document.getElementById("agenda-next-month");
  const newBtn = document.getElementById("agenda-new-btn");

  prevBtn?.addEventListener("click", () => changeAgendaMonth(-1));
  nextBtn?.addEventListener("click", () => changeAgendaMonth(1));
  newBtn?.addEventListener("click", () => openAgendaNewModal());

  const closeDayModal = document.querySelector("[data-close-modal='agenda']");
  closeDayModal?.addEventListener("click", () => hideModal("agenda-modal"));

  const closeNewModal = document.querySelector("[data-close-modal='agenda-new']");
  closeNewModal?.addEventListener("click", () => hideModal("agenda-new-modal"));

  const agendaForm = document.getElementById("agenda-form");
  agendaForm?.addEventListener("submit", handleAgendaSubmit);
}

function changeAgendaMonth(delta) {
  agendaCurrentMonth.setMonth(agendaCurrentMonth.getMonth() + delta);
  renderAgendaMonth();
}

function renderAgendaMonth() {
  const monthLabel = document.getElementById("agenda-month-label");
  const grid = document.getElementById("agenda-grid");
  if (!monthLabel || !grid) return;

  const year = agendaCurrentMonth.getFullYear();
  const month = agendaCurrentMonth.getMonth(); // 0-11

  const formatter = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  });
  monthLabel.textContent = formatter.format(agendaCurrentMonth);

  grid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // 0=LU ... 6=DO (conversione)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPrevMonth = new Date(year, month, 0).getDate();

  const totalCells = 42; // 6 righe x 7 giorni
  let dayCounter = 1;
  let nextMonthDay = 1;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "agenda-cell";

    let dayNumber;
    let cellMonth = month;
    let cellYear = year;
    let otherMonth = false;

    if (i < startDay) {
      // giorni mese precedente
      dayNumber = daysPrevMonth - (startDay - 1 - i);
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear = year - 1;
      }
      otherMonth = true;
    } else if (dayCounter <= daysInMonth) {
      dayNumber = dayCounter++;
    } else {
      dayNumber = nextMonthDay++;
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear = year + 1;
      }
      otherMonth = true;
    }

    const isoDate = toISODate(cellYear, cellMonth, dayNumber);
    cell.dataset.date = isoDate;

    if (otherMonth) {
      cell.classList.add("other-month");
    }

    const todayIso = getTodayISO();
    if (isoDate === todayIso) {
      cell.classList.add("today");
    }

    cell.innerHTML = `
      <div class="agenda-cell-day">${dayNumber}</div>
      <div class="agenda-cell-dots"></div>
    `;

    const dotsContainer = cell.querySelector(".agenda-cell-dots");
    const eventsForDay = agendaEvents.filter((e) => e.date === isoDate);

    const typesSeen = new Set();
    eventsForDay.forEach((ev) => {
      if (typesSeen.has(ev.type)) return;
      typesSeen.add(ev.type);
      const dot = document.createElement("span");
      dot.className = "agenda-dot agenda-dot-" + ev.type;
      dotsContainer.appendChild(dot);
    });

    cell.addEventListener("click", () => openAgendaDayModal(isoDate));

    grid.appendChild(cell);
  }
}

function openAgendaDayModal(isoDate) {
  const body = document.getElementById("agenda-modal-body");
  const title = document.getElementById("agenda-modal-title");
  if (!body || !title) return;

  const events = agendaEvents
    .filter((e) => e.date === isoDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const dateLabel = formatLongDateIT(isoDate);
  title.textContent = "Appuntamenti – " + dateLabel;

  if (!events.length) {
    body.innerHTML =
      '<p style="margin:0;font-size:0.8rem;">Nessun appuntamento per questo giorno.</p>';
  } else {
    const ul = document.createElement("ul");
    ul.className = "agenda-day-list";

    events.forEach((ev) => {
      const li = document.createElement("li");
      li.className = "agenda-day-item";

      let colorBorder = "var(--accent-blue)";
      if (ev.type === "ecg") colorBorder = "#4caf50";
      else if (ev.type === "holter") colorBorder = "#ffb300";
      else if (ev.type === "consulenza") colorBorder = "#e91e63";

      li.style.borderLeftColor = colorBorder;

      li.innerHTML = `
        <div class="agenda-day-time">${ev.time}</div>
        <div class="agenda-day-title">${ev.name}</div>
        <div class="agenda-day-service">${ev.service}</div>
      `;

      ul.appendChild(li);
    });

    body.innerHTML = "";
    body.appendChild(ul);
  }

  showModal("agenda-modal");
}

function openAgendaNewModal() {
  const dateInput = document.getElementById("agenda-date");
  const timeInput = document.getElementById("agenda-time");
  const nameInput = document.getElementById("agenda-name");
  const serviceInput = document.getElementById("agenda-service");

  const todayIso = getTodayISO();
  dateInput.value = todayIso;
  timeInput.value = "";
  nameInput.value = "";
  serviceInput.value = "";

  showModal("agenda-new-modal");
}

function handleAgendaSubmit(e) {
  e.preventDefault();

  const date = document.getElementById("agenda-date").value;
  const time = document.getElementById("agenda-time").value;
  const name = document.getElementById("agenda-name").value.trim();
  const service = document.getElementById("agenda-service").value.trim();

  if (!date || !time || !name || !service) return;

  agendaEvents.push({
    id: agendaIdCounter++,
    date,
    time,
    name,
    service,
    type: inferEventType(service),
  });

  renderAgendaMonth();
  hideModal("agenda-new-modal");
}

function inferEventType(service) {
  const s = service.toLowerCase();
  if (s.includes("ecg")) return "ecg";
  if (s.includes("holter")) return "holter";
  if (s.includes("consul")) return "consulenza";
  return "ecg";
}
/* ========================
   UTILS MODALI & DATE
   ======================== */
function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("hidden");
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("hidden");
}

function toISODate(year, month0, day) {
  const y = year;
  const m = String(month0 + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayISO() {
  const d = new Date();
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatShortDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function formatLongDateIT(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return formatter.format(date);
}
