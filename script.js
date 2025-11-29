// script.js

// ---------- UTILITÀ DATA ----------
function formatDateIT(date) {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ---------- STATO ----------
let promos = [];
let giornate = [];
let agendaEvents = []; // {date, start, end, name, reason, tag}
let agendaCurrentMonth = new Date();
agendaCurrentMonth.setDate(1);

let idleContentTimer = null;
let idleAgendaTimer = null;

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  initTopbarDate();
  seedDemoData();
  renderPromos();
  renderGiornate();
  initAgenda();
  initContentIdleMonitoring();
});

// ---------- TOPBAR ----------
function initTopbarDate() {
  const el = document.getElementById("topbar-date");
  const now = new Date();
  el.textContent = formatDateIT(now);
}

// ---------- DEMO DATA ----------
function seedDemoData() {
  const todayISO = toISODate(new Date());

  promos = [
    {
      id: crypto.randomUUID(),
      tipo: "promo",
      titolo: "Promo colesterolo",
      descrizione: "Test + misurazione saturazione. Sconto 20%.",
      data: todayISO,
    },
  ];

  giornate = [
    {
      id: crypto.randomUUID(),
      tipo: "giornata",
      titolo: "Giornata ECO",
      descrizione: "Elettrocardiogramma con referto cardiologo.",
      data: todayISO,
    },
  ];

  agendaEvents = [
    {
      id: crypto.randomUUID(),
      date: todayISO,
      start: "09:00",
      end: "09:30",
      name: "Rossi Maria",
      reason: "ECG",
      tag: "ecg",
    },
    {
      id: crypto.randomUUID(),
      date: todayISO,
      start: "10:30",
      end: "11:00",
      name: "Bianchi Luca",
      reason: "Holter pressione",
      tag: "holter",
    },
  ];
}

// =============== PROMO & GIORNATE ===============
function renderPromos() {
  const list = document.getElementById("promoList");
  list.innerHTML = "";

  const sorted = [...promos].sort((a, b) => a.data.localeCompare(b.data));

  if (!sorted.length) {
    const li = document.createElement("li");
    li.className = "empty-text";
    li.textContent = "Nessuna offerta inserita.";
    list.appendChild(li);
    return;
  }

  sorted.forEach((p) => {
    const li = document.createElement("li");
    li.className = "promo-item promo";
    li.dataset.id = p.id;

    const title = document.createElement("div");
    title.className = "promo-title";
    title.textContent = `🔥 ${p.titolo}`;

    const date = document.createElement("div");
    date.className = "promo-date";
    date.textContent = new Date(p.data).toLocaleDateString("it-IT");

    const desc = document.createElement("div");
    desc.className = "promo-desc";
    desc.textContent = p.descrizione;

    const tag = document.createElement("div");
    tag.className = "promo-tag promo";
    tag.textContent = "Offerta";

    const del = document.createElement("button");
    del.className = "promo-delete";
    del.textContent = "🗑";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      promos = promos.filter((x) => x.id !== p.id);
      renderPromos();
      updateIdleSummary();
    });

    li.append(title, date, desc, tag, del);
    list.appendChild(li);
  });

  updateIdleSummary();
}

function renderGiornate() {
  const list = document.getElementById("giornateList");
  list.innerHTML = "";

  const sorted = [...giornate].sort((a, b) => a.data.localeCompare(b.data));

  if (!sorted.length) {
    const li = document.createElement("li");
    li.className = "empty-text";
    li.textContent = "Nessuna giornata programmata.";
    list.appendChild(li);
    return;
  }

  sorted.forEach((g) => {
    const li = document.createElement("li");
    li.className = "promo-item giornata";
    li.dataset.id = g.id;

    const title = document.createElement("div");
    title.className = "promo-title";
    title.textContent = `📆 ${g.titolo}`;

    const date = document.createElement("div");
    date.className = "promo-date";
    date.textContent = new Date(g.data).toLocaleDateString("it-IT");

    const desc = document.createElement("div");
    desc.className = "promo-desc";
    desc.textContent = g.descrizione;

    const tag = document.createElement("div");
    tag.className = "promo-tag giornata";
    tag.textContent = "Giornata";

    const del = document.createElement("button");
    del.className = "promo-delete";
    del.textContent = "🗑";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      giornate = giornate.filter((x) => x.id !== g.id);
      renderGiornate();
      updateIdleSummary();
      renderAgendaMonth(); // aggiorna pallini
    });

    li.append(title, date, desc, tag, del);
    list.appendChild(li);
  });

  updateIdleSummary();
  renderAgendaMonth(); // aggiornare i punti sotto i giorni
}

// popup unico
function openPromoPopup(tipoPreselezionato) {
  resetPromoPopup();
  const modal = document.getElementById("promoPopup");
  modal.classList.remove("hidden");
  document.getElementById("promoTypeSelect").value = tipoPreselezionato || "promo";
  document.getElementById("promoPopupTitle").textContent =
    tipoPreselezionato === "giornata" ? "Nuova giornata in farmacia" : "Nuova offerta";
}

function closePromoPopup() {
  document.getElementById("promoPopup").classList.add("hidden");
}

function resetPromoPopup() {
  document.getElementById("promoTitleInput").value = "";
  document.getElementById("promoDescInput").value = "";
  document.getElementById("promoDateInput").value = "";
}

// salva
function savePromo() {
  const tipo = document.getElementById("promoTypeSelect").value;
  const titolo = document.getElementById("promoTitleInput").value.trim();
  const desc = document.getElementById("promoDescInput").value.trim();
  const data = document.getElementById("promoDateInput").value;

  if (!titolo || !data) {
    alert("Inserisci almeno titolo e data.");
    return;
  }

  const item = {
    id: crypto.randomUUID(),
    tipo,
    titolo,
    descrizione: desc,
    data,
  };

  if (tipo === "promo") promos.push(item);
  else giornate.push(item);

  closePromoPopup();
  renderPromos();
  renderGiornate();
}

// ---------- AREA CONTENUTI + IDLE ----------
function initContentIdleMonitoring() {
  const reset = () => {
    hideIdleOverlay();
    if (idleContentTimer) clearTimeout(idleContentTimer);
    idleContentTimer = setTimeout(showIdleOverlay, 20000); // 20 secondi
  };

  document.addEventListener("click", reset);
  reset();

  // click sulle card Q1
  document.querySelectorAll(".q1-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      loadSectionContent(section);
    });
  });
}

function loadSectionContent(section) {
  const area = document.getElementById("contentArea");
  area.innerHTML = "";

  const h = document.createElement("h3");
  h.textContent = sezioneTitolo(section);

  const p = document.createElement("p");
  p.textContent = sezioneDescrizione(section);

  area.append(h, p);
}

function sezioneTitolo(section) {
  switch (section) {
    case "assenti": return "Assenti / Permessi approvati";
    case "turno": return "Farmacia di turno oggi";
    case "comunicazioni": return "Comunicazioni interne";
    case "procedure": return "Procedure operative";
    case "logistica": return "Logistica";
    case "magazzino": return "Magazziniera";
    case "scadenze": return "Prodotti in scadenza";
    case "consumabili": return "Consumabili";
    case "archivio": return "Archivio file";
    default: return "Dettagli sezione";
  }
}

function sezioneDescrizione(section) {
  const base =
    "Qui in futuro vedrai una tabella dedicata con tutti i dati di questa sezione.";
  return base;
}

function showIdleOverlay() {
  const overlay = document.getElementById("contentIdleOverlay");
  overlay.classList.remove("hidden");
  updateIdleSummary();
}

function hideIdleOverlay() {
  const overlay = document.getElementById("contentIdleOverlay");
  overlay.classList.add("hidden");
}

// riepilogo overlay
function updateIdleSummary() {
  const ul = document.getElementById("idleSummaryList");
  if (!ul) return;
  ul.innerHTML = "";

  if (promos.length) {
    const li = document.createElement("li");
    li.textContent = `Promo attive: ${promos.length}`;
    ul.appendChild(li);
  }
  if (giornate.length) {
    const li = document.createElement("li");
    li.textContent = `Giornate in programma: ${giornate.length}`;
    ul.appendChild(li);
  }
  const todayISO = toISODate(new Date());
  const todayEv = agendaEvents.filter((e) => e.date === todayISO);
  if (todayEv.length) {
    const li = document.createElement("li");
    li.textContent = `Appuntamenti oggi: ${todayEv.length}`;
    ul.appendChild(li);
  }
  if (!ul.children.length) {
    const li = document.createElement("li");
    li.textContent = "Nessun dato inserito al momento.";
    ul.appendChild(li);
  }
}

// ---------- AGENDA ----------
function initAgenda() {
  document.getElementById("monthPrevBtn").addEventListener("click", () => {
    agendaCurrentMonth.setMonth(agendaCurrentMonth.getMonth() - 1);
    renderAgendaMonth();
  });
  document.getElementById("monthNextBtn").addEventListener("click", () => {
    agendaCurrentMonth.setMonth(agendaCurrentMonth.getMonth() + 1);
    renderAgendaMonth();
  });
  document.getElementById("backToMonthBtn").addEventListener("click", () => {
    showMonthView();
  });
  document.getElementById("newAppointmentBtn").addEventListener("click", () => {
    openAppointmentPopup();
  });

  renderAgendaMonth();
  initAgendaIdleTimer();
}

function initAgendaIdleTimer() {
  const container = document.querySelector(".panel-q4");
  const reset = () => {
    if (idleAgendaTimer) clearTimeout(idleAgendaTimer);
    idleAgendaTimer = setTimeout(() => {
      showMonthView();
    }, 120000); // 2 minuti
  };

  container.addEventListener("click", reset);
  reset();
}

function renderAgendaMonth() {
  const monthLabel = document.getElementById("agendaMonthLabel");
  const view = document.getElementById("agendaMonthView");
  const dayView = document.getElementById("agendaDayView");

  const monthName = agendaCurrentMonth.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
  monthLabel.textContent = monthName;

  view.innerHTML = "";
  view.classList.remove("hidden");
  dayView.classList.add("hidden");

  const firstDay = new Date(agendaCurrentMonth);
  const startWeekday = (firstDay.getDay() + 6) % 7; // lun=0...dom=6

  const daysInMonth = new Date(
    agendaCurrentMonth.getFullYear(),
    agendaCurrentMonth.getMonth() + 1,
    0
  ).getDate();

  // celle vuote prima
  for (let i = 0; i < startWeekday; i++) {
    const cell = document.createElement("div");
    cell.className = "agenda-day-cell";
    cell.style.visibility = "hidden";
    view.appendChild(cell);
  }

  const todayISO = toISODate(new Date());

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(
      agendaCurrentMonth.getFullYear(),
      agendaCurrentMonth.getMonth(),
      d
    );
    const iso = toISODate(date);

    const cell = document.createElement("div");
    cell.className = "agenda-day-cell";
    if (iso === todayISO) cell.classList.add("today");

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;

    const dotsRow = document.createElement("div");
    dotsRow.className = "day-dot-row";

    // generare pallini dai giorni e giornate
    const eventsInDay = agendaEvents.filter((e) => e.date === iso);
    const hasECG = eventsInDay.some((e) => e.tag === "ecg");
    const hasHolter = eventsInDay.some((e) => e.tag === "holter");
    const hasAltro = eventsInDay.some(
      (e) => e.tag !== "ecg" && e.tag !== "holter"
    );

    if (hasECG) {
      const dot = document.createElement("div");
      dot.className = "day-dot ecg";
      dotsRow.appendChild(dot);
    }
    if (hasHolter) {
      const dot = document.createElement("div");
      dot.className = "day-dot holter";
      dotsRow.appendChild(dot);
    }
    if (hasAltro) {
      const dot = document.createElement("div");
      dot.className = "day-dot altro";
      dotsRow.appendChild(dot);
    }

    const dayGiornate = giornate.filter((g) => g.data === iso);
    if (dayGiornate.length && !hasAltro) {
      const dot = document.createElement("div");
      dot.className = "day-dot altro";
      dotsRow.appendChild(dot);
    }

    cell.append(num, dotsRow);
    cell.addEventListener("click", () => openDayView(iso));
    view.appendChild(cell);
  }
}

function showMonthView() {
  document.getElementById("agendaMonthView").classList.remove("hidden");
  document.getElementById("agendaDayView").classList.add("hidden");
}

function openDayView(isoDate) {
  const monthView = document.getElementById("agendaMonthView");
  const dayView = document.getElementById("agendaDayView");
  monthView.classList.add("hidden");
  dayView.classList.remove("hidden");

  const label = document.getElementById("agendaDayLabel");
  label.textContent = formatDateIT(fromISO(isoDate));

  const slotsContainer = document.getElementById("agendaDaySlots");
  slotsContainer.innerHTML = "";

  const eventsInDay = agendaEvents.filter((e) => e.date === isoDate);

  const hours = [];
  for (let h = 8; h <= 19; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
  }

  hours.forEach((hour) => {
    const slot = document.createElement("div");
    slot.className = "agenda-slot";

    const time = document.createElement("div");
    time.className = "slot-time";
    time.textContent = hour;

    const body = document.createElement("div");
    body.className = "slot-body empty";
    body.textContent = "Tocca per aggiungere";

    const event = eventsInDay.find((e) => e.start === hour);
    if (event) {
      body.classList.remove("empty");
      body.classList.add("has-event", event.tag || "altro");
      body.innerHTML = `
        <div class="slot-title">${event.reason}</div>
        <div class="slot-sub">${event.name} · ${event.start}–${event.end}</div>
      `;
    }

    body.addEventListener("click", () => {
      openAppointmentPopup(isoDate, hour);
    });

    slot.append(time, body);
    slotsContainer.appendChild(slot);
  });
}

// ---------- POPUP APPUNTAMENTO ----------
function openAppointmentPopup(dateISO, startTime) {
  const modal = document.getElementById("appointmentPopup");
  modal.classList.remove("hidden");

  const todayISO = dateISO || toISODate(new Date());
  document.getElementById("apptDateInput").value = todayISO;
  document.getElementById("apptStartInput").value = startTime || "";
  document.getElementById("apptEndInput").value = "";
  document.getElementById("apptNameInput").value = "";
  document.getElementById("apptReasonInput").value = "";
}

function closeAppointmentPopup() {
  document.getElementById("appointmentPopup").classList.add("hidden");
}

function saveAppointment() {
  const date = document.getElementById("apptDateInput").value;
  const start = document.getElementById("apptStartInput").value;
  const end = document.getElementById("apptEndInput").value || start;
  const name = document.getElementById("apptNameInput").value.trim();
  const reason = document.getElementById("apptReasonInput").value.trim();

  if (!date || !start || !name || !reason) {
    alert("Compila data, orario, nome e motivo.");
    return;
  }

  const lower = reason.toLowerCase();
  let tag = "altro";
  if (lower.includes("ecg")) tag = "ecg";
  else if (lower.includes("holter")) tag = "holter";

  agendaEvents.push({
    id: crypto.randomUUID(),
    date,
    start,
    end,
    name,
    reason,
    tag,
  });

  closeAppointmentPopup();
  renderAgendaMonth();
  openDayView(date);
}

// ---------- WHATSAPP ----------
function openWhatsApp() {
  // metti qui il numero reale della farmacia
  const phone = "390000000000"; // es. 39 + numero
  const url = `https://wa.me/${phone}`;
  window.open(url, "_blank");
}
