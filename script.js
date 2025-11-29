// script.js

// =======================
// STATO GLOBALE
// =======================

let lastCardInteractionTime = Date.now();
let q2InactivityTimer = null;

let agendaCurrentDate = new Date();
let agendaViewMode = "month"; // "month" | "day"
let agendaSelectedDayISO = null;
let agendaInactivityTimer = null;

let promoOfferte = [
  {
    id: 1,
    tipo: "offerta",
    titolo: "Sconto 20% dermocosmesi",
    data: "2025-11-30",
    descrizione: "Linea viso idratante e anti-age."
  }
];

let promoGiornate = [
  {
    id: 1,
    tipo: "giornata",
    titolo: "Giornata ECG",
    data: "2025-12-02",
    descrizione: "Elettrocardiogramma con referto cardiologo."
  }
];

let nextPromoId = 2;

// appuntamenti agenda
let appuntamenti = [
  {
    id: 1,
    data: "2025-11-29",
    ora: "09:00",
    nome: "Mario Rossi",
    motivo: "ECG controllo",
    servizio: "ECG"
  },
  {
    id: 2,
    data: "2025-11-29",
    ora: "11:00",
    nome: "Lucia Bianchi",
    motivo: "Holter pressorio",
    servizio: "HOLTER"
  },
  {
    id: 3,
    data: "2025-12-01",
    ora: "10:30",
    nome: "Giuseppe Verdi",
    motivo: "ECG pre-operatorio",
    servizio: "ECG"
  }
];
let nextAppId = 4;

// demo assenze
const assenzeDemo = [
  {
    nome: "Mario Rossi",
    dal: "2025-11-29",
    al: "2025-11-30",
    tipo: "Ferie",
    stato: "approvato"
  },
  {
    nome: "Lucia Bianchi",
    dal: "2025-11-28",
    al: "2025-11-28",
    tipo: "Permesso",
    stato: "approvato"
  },
  {
    nome: "Giuseppe Neri",
    dal: "2025-12-03",
    al: "2025-12-05",
    tipo: "Malattia",
    stato: "approvato"
  },
  {
    nome: "Mario Rossi",
    dal: "2025-12-10",
    al: "2025-12-12",
    tipo: "Ferie",
    stato: "approvato"
  }
];

// demo turni
const turniDemo = [
  {
    data: "2025-11-28",
    farmacia: "Farmacia Montesano",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Centrale",
    note: "Turno ordinario diurno."
  },
  {
    data: "2025-11-29",
    farmacia: "Farmacia Centrale",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Montesano",
    note: "Turno di scambio tra farmacie."
  },
  {
    data: "2025-11-30",
    farmacia: "Farmacia Madonna delle Grazie",
    orario: "20:00 – 08:00",
    appoggio: "Farmacia Montesano",
    note: "Turno notturno."
  },
  {
    data: "2025-12-01",
    farmacia: "Farmacia Montesano",
    orario: "00:00 – 24:00",
    appoggio: "Farmacia Centrale",
    note: "Turno festivo."
  }
];

const oggiISO = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

// =======================
// ON DOM READY
// =======================

document.addEventListener("DOMContentLoaded", () => {
  // click sulle card (mobile + desktop)
  setupCardClicks();

  // Q2: default + timer inattività
  resetQ2Inactivity();

  // Q3: offerte / giornate
  renderPromozioni();

  // Q4: agenda
  initAgenda();

  // Chat
  initChat();

  // Modale generica
  initModal();
});

// =======================
// UTIL DATE
// =======================

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
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
    month: "2-digit"
  });
  return formatter.format(date);
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// =======================
// CARD → Q2 AREA CONTENUTI
// =======================

function setupCardClicks() {
  const clickable = document.querySelectorAll("[data-section]");
  clickable.forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.getAttribute("data-section");
      if (!key) return;
      showSectionInQ2(key);
      registerInteraction();
    });
  });
}

function registerInteraction() {
  lastCardInteractionTime = Date.now();
  resetQ2Inactivity();
}

function resetQ2Inactivity() {
  if (q2InactivityTimer) clearTimeout(q2InactivityTimer);
  q2InactivityTimer = setTimeout(() => {
    showQ2Default();
  }, 20000); // 20 secondi
}

function showQ2Default() {
  const q2 = document.getElementById("q2-content");
  if (!q2) return;
  q2.classList.add("fade");
  q2.innerHTML = `
    <div class="q2-placeholder">
      <p class="q2-placeholder-main">Seleziona una funzione dalle card</p>
      <p class="q2-placeholder-sub">
        Qui vedrai in grande solo quello che ti interessa davvero:
        assenze già approvate, turno di oggi, comunicazioni, offerte,
        scadenze, consegne, giornate in farmacia, ecc.
      </p>
    </div>
  `;
  setTimeout(() => q2.classList.remove("fade"), 650);
}

function showSectionInQ2(key) {
  const q2 = document.getElementById("q2-content");
  if (!q2) return;

  q2.classList.add("fade");

  let html = "";

  if (key === "assenti") {
    html = renderAssentiHTML();
  } else if (key === "turno") {
    html = renderTurnoHTML();
  } else if (key === "prodotti") {
    html = `
      <h3 class="q2-section-title">Prodotti in scadenza (demo)</h3>
      <p class="q2-section-sub">Lista rapida dei prossimi articoli da controllare.</p>
      <ul class="q2-list">
        <li><strong>Integratore X</strong> – scade il 10/12</li>
        <li><strong>Crema viso Y</strong> – scade il 15/12</li>
        <li><strong>Collirio Z</strong> – scade il 20/12</li>
      </ul>
    `;
  } else if (key === "consegne") {
    html = `
      <h3 class="q2-section-title">Consegne / ritiri di oggi (demo)</h3>
      <p class="q2-section-sub">Rapido promemoria di ciò che deve entrare / uscire.</p>
      <ul class="q2-list">
        <li>Ore 10:00 – <strong>Corriere ABC</strong> · Ordine grossista</li>
        <li>Ore 12:30 – <strong>Ritiro cliente</strong> · N. prenotazione 12345</li>
        <li>Ore 17:00 – <strong>Corriere resi</strong> · scatolone dermocosmesi</li>
      </ul>
    `;
  } else if (key === "cambiocassa") {
    html = `
      <h3 class="q2-section-title">Cambio cassa (demo)</h3>
      <p class="q2-section-sub">Ultimo cambio registrato e note veloci.</p>
      <ul class="q2-list">
        <li><strong>Ultimo cambio</strong>: oggi ore 14:22</li>
        <li>Fondo cassa confermato: 250,00 €</li>
        <li>Segnalazioni: nessuna anomalia registrata.</li>
      </ul>
    `;
  } else if (key === "comunicazioni") {
    html = `
      <h3 class="q2-section-title">Comunicazioni interne (demo)</h3>
      <p class="q2-section-sub">Messaggi importanti compariranno qui in evidenza.</p>
      <ul class="q2-list">
        <li><strong>Oggi</strong> – Aggiornata procedura chiusura cassa.</li>
        <li><strong>Ieri</strong> – Nuova promo dermocosmesi in vetrina 1.</li>
      </ul>
    `;
  } else if (key === "procedure") {
    html = `
      <h3 class="q2-section-title">Procedure rapide (demo)</h3>
      <p class="q2-section-sub">Le procedure più usate appariranno in questa area.</p>
      <ul class="q2-list">
        <li><strong>Chiusura serale</strong> – 3 step principali.</li>
        <li><strong>Gestione resi</strong> – modulo + foto prodotto.</li>
      </ul>
    `;
  } else if (key === "logistica" || key === "magazziniera") {
    html = `
      <h3 class="q2-section-title">Logistica / magazzino (demo)</h3>
      <p class="q2-section-sub">
        Controlli veloci su arrivi, resi, inventari e scaffali critici.
      </p>
      <ul class="q2-list">
        <li>Scaffale A3 – prodotti quasi esauriti.</li>
        <li>Resi da completare: 2 pratiche aperte.</li>
        <li>Inventario rapido banco automedicazione lunedì mattina.</li>
      </ul>
    `;
  } else if (key === "consumabili") {
    html = `
      <h3 class="q2-section-title">Consumabili (demo)</h3>
      <p class="q2-section-sub">Materiale di uso quotidiano.</p>
      <ul class="q2-list">
        <li>Guanti lattice – OK per 2 settimane.</li>
        <li>Garze sterili – da riordinare entro venerdì.</li>
        <li>Rotoli scontrini – disponibile per ~15 giorni.</li>
      </ul>
    `;
  } else if (key === "archivio") {
    html = `
      <h3 class="q2-section-title">Archivio file (demo)</h3>
      <p class="q2-section-sub">
        Qui troverai procedure PDF, contratti, promozioni e documenti interni.
      </p>
      <ul class="q2-list">
        <li>Manuale procedure 2025.pdf</li>
        <li>Listino servizi aggiornato.xlsx</li>
      </ul>
    `;
  } else {
    html = `
      <h3 class="q2-section-title">Sezione in lavorazione</h3>
      <p class="q2-section-sub">
        Questa sezione sarà collegata a funzioni più avanzate del portale.
      </p>
    `;
  }

  q2.innerHTML = html;

  setTimeout(() => q2.classList.remove("fade"), 650);
}

// Assenti in HTML (per Q2)
function renderAssentiHTML() {
  const oggiDate = parseISO(oggiISO);
  const oggiList = [];
  const nextList = [];

  const lista = assenzeDemo.filter((a) => a.stato === "approvato");

  lista.forEach((a) => {
    const dal = parseISO(a.dal);
    const al = parseISO(a.al);

    if (oggiDate >= dal && oggiDate <= al) {
      oggiList.push(a);
    } else if (oggiDate < dal) {
      nextList.push(a);
    }
  });

  nextList.sort((a, b) => parseISO(a.dal) - parseISO(b.dal));

  let htmlOggi = "<ul class='q2-list'>";
  if (oggiList.length === 0) {
    htmlOggi +=
      "<li>Nessun assente oggi.</li>";
  } else {
    oggiList.forEach((a) => {
      const range = formatShortDateIT(a.dal) === formatShortDateIT(a.al)
        ? formatShortDateIT(a.dal)
        : `${formatShortDateIT(a.dal)} → ${formatShortDateIT(a.al)}`;
      htmlOggi += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
    });
  }
  htmlOggi += "</ul>";

  let htmlNext = "<ul class='q2-list'>";
  if (nextList.length === 0) {
    htmlNext += "<li>Nessuna assenza approvata nei prossimi giorni.</li>";
  } else {
    nextList.forEach((a) => {
      const range = formatShortDateIT(a.dal) === formatShortDateIT(a.al)
        ? formatShortDateIT(a.dal)
        : `${formatShortDateIT(a.dal)} → ${formatShortDateIT(a.al)}`;
      htmlNext += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
    });
  }
  htmlNext += "</ul>";

  return `
    <h3 class="q2-section-title">Assenti / permessi approvati</h3>
    <p class="q2-section-sub">Vista immediata di oggi e dei prossimi giorni (demo).</p>
    <h4 style="margin:4px 0 2px; font-size:0.85rem;">Assenti oggi</h4>
    ${htmlOggi}
    <h4 style="margin:8px 0 2px; font-size:0.85rem;">Prossimi giorni</h4>
    ${htmlNext}
  `;
}

function renderTurnoHTML() {
  const oggiDate = parseISO(oggiISO);
  let turnoOggi = turniDemo.find((t) => t.data === oggiISO);
  if (!turnoOggi) {
    const futuri = turniDemo
      .filter((t) => parseISO(t.data) >= oggiDate)
      .sort((a, b) => parseISO(a.data) - parseISO(b.data));
    turnoOggi = futuri[0] || turniDemo[0];
  }

  const altri = turniDemo
    .filter((t) => t !== turnoOggi)
    .sort((a, b) => parseISO(a.data) - parseISO(b.data));

  let htmlNext = "<ul class='q2-list'>";
  if (altri.length === 0) {
    htmlNext += "<li>Nessun altro turno in elenco.</li>";
  } else {
    altri.forEach((t) => {
      htmlNext += `<li><strong>${formatShortDateIT(t.data)}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
    });
  }
  htmlNext += "</ul>";

  return `
    <h3 class="q2-section-title">Farmacia di turno</h3>
    <p class="q2-section-sub">Turno di oggi in evidenza e prossimi turni (demo).</p>

    <p style="font-size:0.9rem; margin:0 0 2px;">
      <strong>${turnoOggi.farmacia}</strong> – ${formatLongDateIT(turnoOggi.data)}
    </p>
    <p style="font-size:0.85rem; margin:0 0 2px;">Orario: <strong>${turnoOggi.orario}</strong></p>
    <p style="font-size:0.85rem; margin:0 0 4px;">Appoggio: <strong>${turnoOggi.appoggio}</strong></p>
    <p style="font-size:0.8rem; opacity:0.9; margin:0 0 8px;">${turnoOggi.note}</p>

    <h4 style="margin:4px 0 2px; font-size:0.85rem;">Prossimi turni</h4>
    ${htmlNext}
  `;
}

// =======================
// Q3 – PROMOZIONI
// =======================

function renderPromozioni() {
  const offerteList = document.getElementById("offerte-list");
  const giornateList = document.getElementById("giornate-list");
  if (!offerteList || !giornateList) return;

  // ordina per data
  promoOfferte.sort((a, b) => parseISO(a.data) - parseISO(b.data));
  promoGiornate.sort((a, b) => parseISO(a.data) - parseISO(b.data));

  offerteList.innerHTML = "";
  giornateList.innerHTML = "";

  if (promoOfferte.length === 0) {
    offerteList.innerHTML =
      "<li class='promo-item'><span class='promo-desc'>Nessuna offerta inserita.</span></li>";
  } else {
    promoOfferte.forEach((p) => {
      const li = document.createElement("li");
      li.className = "promo-item";
      li.innerHTML = `
        <span class="promo-item-icon">🏷️</span>
        <div class="promo-title-row">
          <span class="promo-title">${p.titolo}</span>
          <span class="promo-date">${formatShortDateIT(p.data)}</span>
        </div>
        <p class="promo-desc">${p.descrizione || ""}</p>
        <span class="promo-delete" data-delete-type="offerta" data-id="${p.id}">🗑️</span>
      `;
      offerteList.appendChild(li);
    });
  }

  if (promoGiornate.length === 0) {
    giornateList.innerHTML =
      "<li class='promo-item'><span class='promo-desc'>Nessuna giornata programmata.</span></li>";
  } else {
    promoGiornate.forEach((p) => {
      const li = document.createElement("li");
      li.className = "promo-item";
      li.innerHTML = `
        <span class="promo-item-icon">📅</span>
        <div class="promo-title-row">
          <span class="promo-title">${p.titolo}</span>
          <span class="promo-date">${formatShortDateIT(p.data)}</span>
        </div>
        <p class="promo-desc">${p.descrizione || ""}</p>
        <span class="promo-delete" data-delete-type="giornata" data-id="${p.id}">🗑️</span>
      `;
      giornateList.appendChild(li);
    });
  }

  // gestione cestini
  document.querySelectorAll(".promo-delete").forEach((del) => {
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      const type = del.getAttribute("data-delete-type");
      const id = Number(del.getAttribute("data-id"));
      if (type === "offerta") {
        promoOfferte = promoOfferte.filter((p) => p.id !== id);
      } else {
        promoGiornate = promoGiornate.filter((p) => p.id !== id);
      }
      renderPromozioni();
    });
  });

  // pulsanti +
  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.onclick = () => {
      const tipo = btn.getAttribute("data-add"); // "offerta" | "giornata"
      openModalForPromo(tipo);
    };
  });
}
// =======================
// MODALE GENERICA
// =======================

let modalType = null; // "offerta" | "giornata" | "appuntamento"
let modalPreselectedDate = null;
let modalPreselectedTime = null;

function initModal() {
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("modal-cancel");
  const form = document.getElementById("modal-form");

  if (!overlay || !closeBtn || !cancelBtn || !form) return;

  function close() {
    overlay.classList.add("hidden");
    modalType = null;
    modalPreselectedDate = null;
    modalPreselectedTime = null;
    form.reset();
    document.getElementById("modal-section-appointment").classList.add("hidden");
  }

  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  document.getElementById("modal-backdrop")?.addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("modal-backdrop")) {
      close();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!modalType) return;

    const titleInput = document.getElementById("modal-title-input");
    const dateInput = document.getElementById("modal-date-input");
    const descInput = document.getElementById("modal-desc-input");

    const title = titleInput.value.trim();
    const date = dateInput.value;
    const desc = descInput.value.trim();

    if (!date) {
      alert("Seleziona una data.");
      return;
    }

    if (modalType === "offerta" || modalType === "giornata") {
      const obj = {
        id: nextPromoId++,
        tipo: modalType,
        titolo: title || (modalType === "offerta" ? "Offerta" : "Giornata"),
        data,
        descrizione: desc
      };
      if (modalType === "offerta") {
        promoOfferte.push(obj);
      } else {
        promoGiornate.push(obj);
      }
      renderPromozioni();
    } else if (modalType === "appuntamento") {
      const timeInput = document.getElementById("modal-time-input");
      const nameInput = document.getElementById("modal-name-input");
      const reasonInput = document.getElementById("modal-reason-input");

      const ora = timeInput.value;
      const nome = nameInput.value.trim();
      const motivo = reasonInput.value.trim() || desc;

      if (!ora || !nome || !motivo) {
        alert("Compila ora, nome e motivo.");
        return;
      }

      appuntamenti.push({
        id: nextAppId++,
        data,
        ora,
        nome,
        motivo,
        servizio: motivo
      });
      renderAgenda(); // aggiorno vista corrente
    }

    close();
  });
}

function openModalForPromo(tipo) {
  const overlay = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const sectionBase = document.getElementById("modal-section-base");
  const sectionApp = document.getElementById("modal-section-appointment");

  if (!overlay || !titleEl || !sectionBase || !sectionApp) return;

  modalType = tipo;
  sectionBase.classList.remove("hidden");
  sectionApp.classList.add("hidden");

  const today = new Date();
  const isoToday = toISODate(today);

  document.getElementById("modal-date-input").value = isoToday;
  document.getElementById("modal-title-input").value = "";
  document.getElementById("modal-desc-input").value = "";

  if (tipo === "offerta") {
    titleEl.textContent = "Nuova offerta in corso";
  } else {
    titleEl.textContent = "Nuova giornata in farmacia";
  }

  overlay.classList.remove("hidden");
}

function openModalForAppuntamento(dateISO, time) {
  const overlay = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const sectionBase = document.getElementById("modal-section-base");
  const sectionApp = document.getElementById("modal-section-appointment");

  if (!overlay || !titleEl || !sectionBase || !sectionApp) return;

  modalType = "appuntamento";
  modalPreselectedDate = dateISO;
  modalPreselectedTime = time;

  sectionBase.classList.remove("hidden");
  sectionApp.classList.remove("hidden");

  document.getElementById("modal-title-input").value = "Nuovo appuntamento";
  document.getElementById("modal-desc-input").value = "";
  document.getElementById("modal-date-input").value = dateISO;
  document.getElementById("modal-time-input").value = time || "09:00";
  document.getElementById("modal-name-input").value = "";
  document.getElementById("modal-reason-input").value = "";

  titleEl.textContent = "Nuovo appuntamento";

  overlay.classList.remove("hidden");
}

// =======================
// Q4 – AGENDA
// =======================

function initAgenda() {
  const prev = document.getElementById("agenda-prev-month");
  const next = document.getElementById("agenda-next-month");
  const backMonth = document.getElementById("agenda-back-month");

  if (prev) {
    prev.addEventListener("click", () => {
      agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() - 1);
      agendaViewMode = "month";
      renderAgenda();
      resetAgendaInactivity();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() + 1);
      agendaViewMode = "month";
      renderAgenda();
      resetAgendaInactivity();
    });
  }

  if (backMonth) {
    backMonth.addEventListener("click", () => {
      agendaViewMode = "month";
      renderAgenda();
    });
  }

  renderAgenda();
  resetAgendaInactivity();
}

function resetAgendaInactivity() {
  if (agendaInactivityTimer) clearTimeout(agendaInactivityTimer);
  agendaInactivityTimer = setTimeout(() => {
    if (agendaViewMode === "day") {
      agendaViewMode = "month";
      renderAgenda();
    }
  }, 120000); // 2 minuti
}

function renderAgenda() {
  const monthLabel = document.getElementById("agenda-month-label");
  const monthView = document.getElementById("agenda-month-view");
  const dayView = document.getElementById("agenda-day-view");
  const backMonthBtn = document.getElementById("agenda-back-month");

  if (!monthLabel || !monthView || !dayView || !backMonthBtn) return;

  const year = agendaCurrentDate.getFullYear();
  const monthIndex = agendaCurrentDate.getMonth();

  const monthFormatter = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric"
  });
  monthLabel.textContent = monthFormatter.format(agendaCurrentDate);

  if (agendaViewMode === "month") {
    backMonthBtn.classList.add("hidden");
    monthView.classList.remove("hidden");
    dayView.classList.add("hidden");
    renderAgendaMonthView(monthView, year, monthIndex);
  } else {
    backMonthBtn.classList.remove("hidden");
    monthView.classList.add("hidden");
    dayView.classList.remove("hidden");
    renderAgendaDayView(dayView);
  }
}

function renderAgendaMonthView(container, year, monthIndex) {
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "agenda-month-grid";

  const dayNames = ["lu", "ma", "me", "gi", "ve", "sa", "do"];
  dayNames.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = "agenda-month-grid-header";
    cell.textContent = d;
    grid.appendChild(cell);
  });

  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // 0=lu ... 6=do
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "agenda-day-cell agenda-day-cell-empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    const iso = toISODate(d);

    const cell = document.createElement("div");
    cell.className = "agenda-day-cell";

    const dayNum = document.createElement("div");
    dayNum.className = "agenda-day-number";
    dayNum.textContent = String(day);
    cell.appendChild(dayNum);

    const apps = appuntamenti.filter((a) => a.data === iso);
    if (apps.length > 0) {
      const tipoServizio = apps[0].servizio?.toUpperCase() || "";
      const badge = document.createElement("div");
      badge.className = "agenda-day-badge";

      if (tipoServizio.includes("ECG")) {
        cell.classList.add("agenda-day-ecg");
        badge.textContent = "ECG";
      } else if (tipoServizio.includes("HOLTER")) {
        cell.classList.add("agenda-day-holter");
        badge.textContent = "HOLTER";
      } else {
        cell.classList.add("agenda-day-altro");
        badge.textContent = "Servizi";
      }
      cell.appendChild(badge);
    }

    if (iso === oggiISO) {
      cell.classList.add("agenda-day-today");
    }

    cell.addEventListener("click", () => {
      agendaSelectedDayISO = iso;
      agendaViewMode = "day";
      renderAgenda();
      resetAgendaInactivity();
    });

    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

function renderAgendaDayView(container) {
  const label = document.getElementById("agenda-day-label");
  const slotsWrap = document.getElementById("agenda-slots");
  if (!label || !slotsWrap) return;

  const iso = agendaSelectedDayISO || toISODate(new Date());
  label.textContent = formatLongDateIT(iso);

  slotsWrap.innerHTML = "";

  const dayApps = appuntamenti
    .filter((a) => a.data === iso)
    .sort((a, b) => a.ora.localeCompare(b.ora));

  const startHour = 8;
  const endHour = 20;

  for (let h = startHour; h <= endHour; h++) {
    const hourStr = String(h).padStart(2, "0") + ":00";
    const row = document.createElement("div");
    row.className = "agenda-slot-row";

    const timeCell = document.createElement("div");
    timeCell.className = "agenda-slot-time";
    timeCell.textContent = hourStr;
    row.appendChild(timeCell);

    const contentCell = document.createElement("div");

    const app = dayApps.find((a) => a.ora === hourStr);
    if (app) {
      row.classList.add("has-app");
      const chip = document.createElement("span");
      chip.className = "agenda-slot-chip";
      const upperServizio = (app.servizio || "").toUpperCase();
      if (upperServizio.includes("ECG")) {
        chip.textContent = "ECG";
      } else if (upperServizio.includes("HOLTER")) {
        chip.textContent = "HOLTER";
      } else {
        chip.textContent = "Servizio";
      }
      contentCell.innerHTML = `<strong>${app.nome}</strong> – ${app.motivo} `;
      contentCell.appendChild(chip);
    } else {
      const span = document.createElement("span");
      span.className = "agenda-slot-content-empty";
      span.textContent = "Slot libero – clicca per nuovo appuntamento";
      contentCell.appendChild(span);

      row.addEventListener("click", () => {
        openModalForAppuntamento(iso, hourStr);
        resetAgendaInactivity();
      });
    }

    row.appendChild(contentCell);
    slotsWrap.appendChild(row);
  }
}

// =======================
// CHAT INTERNA
// =======================

let currentChatAuthor = "titolare";
let chatMessages = [
  {
    id: 1,
    authorKey: "titolare",
    autore: "Titolare",
    testo: "Ricordate di aggiornare la promo dermocosmesi entro oggi.",
    lato: "right"
  },
  {
    id: 2,
    authorKey: "dip1",
    autore: "Farmacista 1",
    testo: "Ok, mi occupo io della vetrina.",
    lato: "left"
  }
];
let nextChatId = 3;

function initChat() {
  const fab = document.getElementById("chat-fab");
  const overlay = document.getElementById("chat-overlay");
  const closeBtn = document.getElementById("chat-close");
  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");
  const attachBtn = document.getElementById("chat-attach-btn");
  const fileInput = document.getElementById("chat-file-input");
  const authorBtns = document.querySelectorAll(".chat-author-btn");

  if (!fab || !overlay || !closeBtn || !sendBtn || !input) return;

  function openChat() {
    overlay.classList.remove("hidden");
    renderChatMessages();
    input.focus();
  }

  function closeChat() {
    overlay.classList.add("hidden");
  }

  fab.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("chat-backdrop")) {
      closeChat();
    }
  });

  authorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      authorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentChatAuthor = btn.getAttribute("data-author") || "titolare";
    });
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    let autoreLabel = "Dipendente";
    let side = "left";
    if (currentChatAuthor === "titolare") {
      autoreLabel = "Titolare";
      side = "right";
    } else if (currentChatAuthor === "dip1") {
      autoreLabel = "Farmacista 1";
    } else if (currentChatAuthor === "dip2") {
      autoreLabel = "Farmacista 2";
    }

    chatMessages.push({
      id: nextChatId++,
      authorKey: currentChatAuthor,
      autore: autoreLabel,
      testo: text,
      lato: side
    });

    input.value = "";
    document.getElementById("chat-attachment-label").classList.add("hidden");
    renderChatMessages();
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const labelWrap = document.getElementById("chat-attachment-label");
      const nameSpan = document.getElementById("chat-attachment-name");
      if (fileInput.files && fileInput.files[0]) {
        nameSpan.textContent = fileInput.files[0].name;
        labelWrap.classList.remove("hidden");
      } else {
        labelWrap.classList.add("hidden");
      }
    });
  }
}

function renderChatMessages() {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  container.innerHTML = "";
  chatMessages.forEach((m) => {
    const row = document.createElement("div");
    row.className = `chat-msg-row ${m.lato === "right" ? "right" : "left"}`;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${m.lato === "right" ? "right" : "left"}`;

    const author = document.createElement("div");
    author.className = "chat-bubble-author";
    author.textContent = m.autore;

    const text = document.createElement("p");
    text.className = "chat-bubble-text";
    text.textContent = m.testo;

    bubble.appendChild(author);
    bubble.appendChild(text);
    row.appendChild(bubble);
    container.appendChild(row);
  });

  container.scrollTop = container.scrollHeight;
}
