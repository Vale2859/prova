// script.js

document.addEventListener("DOMContentLoaded", () => {
  aggiornaDataHeader();
  setupNavigazioneSezioni();
  setupChat();
  setupOfferteEventi();
  setupAgenda();
  setupCentralButton();
});

/* ==========================
   DATA HEADER
   ========================== */

function aggiornaDataHeader() {
  const el = document.getElementById("header-date-desktop");
  if (!el) return;
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  el.textContent = formatter.format(new Date());
}

/* ==========================
   NAVIGAZIONE SEZIONI (ASSENTI / TURNO)
   ========================== */

function setupNavigazioneSezioni() {
  const dashboards = document.querySelectorAll(
    ".mobile-dashboard, .desktop-dashboard"
  );
  const sezioni = document.querySelectorAll(".sezione-dettaglio");

  dashboards.forEach((d) => {
    const computed = window.getComputedStyle(d);
    d.dataset.displayOriginal = computed.display || "block";
  });

  function mostraDashboard() {
    sezioni.forEach((sec) => (sec.style.display = "none"));
    dashboards.forEach((d) => {
      d.style.display = d.dataset.displayOriginal || "block";
    });
    window.scrollTo(0, 0);
  }

  function mostraSezione(id) {
    dashboards.forEach((d) => (d.style.display = "none"));
    sezioni.forEach((sec) => {
      sec.style.display = sec.id === "sezione-" + id ? "block" : "none";
    });

    if (id === "assenti") {
      renderAssenti();
    } else if (id === "turno") {
      renderTurno();
    }
    window.scrollTo(0, 0);
  }

  document.querySelectorAll("[data-section]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-section");
      if (!id) return;
      mostraSezione(id);
    });
  });

  document.querySelectorAll("[data-close='sezione']").forEach((btn) => {
    btn.addEventListener("click", mostraDashboard);
  });

  const ruoloAssSelect = document.getElementById("ruolo-assenti");
  if (ruoloAssSelect) {
    ruoloAssSelect.addEventListener("change", renderAssenti);
  }
}

/* ==========================
   DATI DEMO – ASSENZE E TURNI
   ========================== */

const assenzeDemo = [
  {
    nome: "Mario Rossi",
    dal: "2025-11-29",
    al: "2025-11-30",
    tipo: "Ferie",
    stato: "approvato",
  },
  {
    nome: "Lucia Bianchi",
    dal: "2025-11-28",
    al: "2025-11-28",
    tipo: "Permesso",
    stato: "approvato",
  },
  {
    nome: "Giuseppe Neri",
    dal: "2025-12-03",
    al: "2025-12-05",
    tipo: "Malattia",
    stato: "approvato",
  },
  {
    nome: "Mario Rossi",
    dal: "2025-12-10",
    al: "2025-12-12",
    tipo: "Ferie",
    stato: "approvato",
  },
];

const turniDemo = [
  {
    data: "2025-11-28",
    farmacia: "Farmacia Montesano",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Centrale",
    note: "Turno ordinario diurno.",
  },
  {
    data: "2025-11-29",
    farmacia: "Farmacia Centrale",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Montesano",
    note: "Turno di scambio tra farmacie.",
  },
  {
    data: "2025-11-30",
    farmacia: "Farmacia Madonna delle Grazie",
    orario: "20:00 – 08:00",
    appoggio: "Farmacia Montesano",
    note: "Turno notturno.",
  },
  {
    data: "2025-12-01",
    farmacia: "Farmacia Montesano",
    orario: "00:00 – 24:00",
    appoggio: "Farmacia Centrale",
    note: "Turno festivo.",
  },
];

const oggiISO = (() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
})();

/* ===== ASSENTI ===== */

function renderAssenti() {
  const containerOggi = document.getElementById("assenti-oggi");
  const containerNext = document.getElementById("assenti-prossimi");
  if (!containerOggi || !containerNext) return;

  const ruoloSelect = document.getElementById("ruolo-assenti");
  const ruolo = ruoloSelect ? ruoloSelect.value : "farmacia";

  let lista = assenzeDemo.filter((a) => a.stato === "approvato");

  if (ruolo === "dipendente") {
    const mioNome = "Mario Rossi";
    lista = lista.filter((a) => a.nome === mioNome);
  }

  const oggiDate = parseISO(oggiISO);
  const oggiList = [];
  const nextList = [];

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

  let htmlOggi = '<h3 style="margin:0 0 6px;">Assenti oggi</h3>';
  if (oggiList.length === 0) {
    htmlOggi +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Nessuno assente oggi.</p>';
  } else {
    htmlOggi += '<ul style="list-style:none; padding:0; margin:0;">';
    oggiList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlOggi += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${a.nome}</strong> – ${a.tipo} (${range})
      </li>`;
    });
    htmlOggi += "</ul>";
  }

  let htmlNext = '<h3 style="margin:12px 0 6px;">Assenze prossimi giorni</h3>';
  if (nextList.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altre assenze approvate nei prossimi giorni.</p>';
  } else {
    htmlNext += '<ul style="list-style:none; padding:0; margin:0;">';
    nextList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlNext += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${a.nome}</strong> – ${a.tipo} (${range})
      </li>`;
    });
    htmlNext += "</ul>";
  }

  containerOggi.innerHTML = htmlOggi;
  containerNext.innerHTML = htmlNext;
}

/* ===== TURNO ===== */

function renderTurno() {
  const boxOggi = document.getElementById("turno-oggi");
  const boxNext = document.getElementById("turno-prossimi");
  if (!boxOggi || !boxNext) return;

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

  const labelDataOggi = formatLongDateIT(turnoOggi.data);

  boxOggi.innerHTML = `
    <h3 style="margin:0 0 6px;">Turno di oggi</h3>
    <p style="margin:0 0 4px; font-size:0.9rem;">
      <strong>${turnoOggi.farmacia}</strong> – ${labelDataOggi}
    </p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Orario: <strong>${turnoOggi.orario}</strong></p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Appoggio: <strong>${turnoOggi.appoggio}</strong></p>
    <p style="margin:0; font-size:0.9rem; opacity:0.85;">${turnoOggi.note}</p>
  `;

  let htmlNext = '<h3 style="margin:12px 0 6px;">Prossimi turni</h3>';
  if (altri.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altri turni in elenco.</p>';
  } else {
    htmlNext += '<ul style="list-style:none; padding:0; margin:0;">';
    altri.forEach((t) => {
      htmlNext += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${formatShortDateIT(t.data)}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}
      </li>`;
    });
    htmlNext += "</ul>";
  }
  boxNext.innerHTML = htmlNext;
}

/* ==========================
   FUNZIONI DATA
   ========================== */

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatShortDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function formatRangeIT(dalISO, alISO) {
  const dal = formatShortDateIT(dalISO);
  const al = formatShortDateIT(alISO);
  if (dal === al) return dal;
  return `${dal} → ${al}`;
}

function formatLongDateIT(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
  return formatter.format(date);
}

/* ==========================
   CHAT MODERNA
   ========================== */

const chatMessages = [
  {
    sender: "Emanuela (titolare)",
    role: "titolare",
    type: "Promemoria",
    time: "17:17",
    text: "Ricordarsi di verificare scorte HOLTER per la prossima settimana.",
    attachment: "checklist_holter.pdf",
    avatarUrl: null,
  },
  {
    sender: "Daniela (dipendente)",
    role: "dipendente",
    type: "Turni",
    time: "17:22",
    text: "ok, grazie!",
    attachment: "",
    avatarUrl: null,
  },
];

const avatarMap = {}; // { nome: dataURL }

function setupChat() {
  const listEl = document.getElementById("chat-messages");
  const countEl = document.getElementById("chat-count");
  const form = document.getElementById("chat-form");
  const senderSelect = document.getElementById("chat-sender");
  const typeSelect = document.getElementById("chat-type");
  const txtEl = document.getElementById("chat-text");
  const attachmentEl = document.getElementById("chat-attachment");
  const avatarInput = document.getElementById("chat-avatar-file");

  if (!listEl || !form) return;

  function renderChat() {
    let html = "";
    chatMessages.forEach((msg) => {
      const sideClass = msg.role === "titolare" ? "from-owner" : "from-staff";
      const initials = getInitials(msg.sender);
      const avatarUrl = msg.avatarUrl || avatarMap[msg.sender] || null;

      const avatarHtml = avatarUrl
        ? `<div class="chat-avatar"><img src="${avatarUrl}" alt="${initials}"></div>`
        : `<div class="chat-avatar">${initials}</div>`;

      const safeText = escapeHtml(msg.text);
      const safeAttachment = escapeHtml(msg.attachment || "");

      html += `
        <div class="chat-row ${sideClass}">
          ${sideClass === "from-staff" ? avatarHtml : ""}
          <div class="chat-bubble">
            <div class="chat-bubble-header">
              <span class="chat-sender">${escapeHtml(msg.sender)}</span>
              <span class="chat-type-pill">${escapeHtml(msg.type)}</span>
              <span class="chat-time">${escapeHtml(msg.time)}</span>
            </div>
            <div class="chat-text-main">${safeText}</div>
            ${
              safeAttachment
                ? `<div class="chat-attachment">📎 ${safeAttachment}</div>`
                : ""
            }
          </div>
          ${sideClass === "from-owner" ? avatarHtml : ""}
        </div>
      `;
    });
    listEl.innerHTML = html;
    listEl.scrollTop = listEl.scrollHeight;
    if (countEl) countEl.textContent = String(chatMessages.length);
  }

  renderChat();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const sender = senderSelect.value;
    const type = typeSelect.value;
    const text = txtEl.value.trim();
    const attachment = attachmentEl.value.trim();

    if (!text) return;

    const role = sender.toLowerCase().includes("titolare")
      ? "titolare"
      : "dipendente";

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    chatMessages.push({
      sender,
      role,
      type,
      time: timeStr,
      text,
      attachment,
      avatarUrl: avatarMap[sender] || null,
    });

    txtEl.value = "";
    attachmentEl.value = "";
    renderChat();
  });

  if (avatarInput) {
    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      const senderNow = senderSelect.value;
      reader.onload = (e) => {
        avatarMap[senderNow] = e.target.result;
        // aggiorno la chat per mostrare nuovo avatar
        renderChat();
      };
      reader.readAsDataURL(file);
    });
  }
}

function getInitials(name) {
  const parts = name.split(" ");
  let init =
    (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "");
  return init.toUpperCase();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
/* ==========================
   OFFERTE & EVENTI – Q2
   ========================== */

let offerteData = [
  {
    titolo: "Promo Colesterolo 2025",
    descrizione: "Test + misurazione saturazione.",
  },
  {
    titolo: "Vaccini influenza",
    descrizione: "Sconto 20% prodotti stagionali abbinati.",
  },
];

let eventiData = [
  {
    titolo: "Lunedì – Giornata misurazione pressione",
    descrizione: "Mattino e pomeriggio, su prenotazione.",
  },
  {
    titolo: "Martedì – Giornata HOLTER pressorio",
    descrizione: "Pochi slot disponibili, consigliare prenotazione.",
  },
];

function setupOfferteEventi() {
  const offerteList = document.getElementById("offerte-list");
  const eventiList = document.getElementById("eventi-list");
  const btnOff = document.getElementById("btn-add-offerta");
  const btnEv = document.getElementById("btn-add-evento");
  if (!offerteList || !eventiList) return;

  function renderLists() {
    offerteList.innerHTML = offerteData
      .map(
        (item, idx) => `
      <li class="q2-item">
        <span class="q2-item-dot"></span>
        <span class="q2-item-title">${escapeHtml(item.titolo)}</span>
        <span class="q2-item-sub">${escapeHtml(item.descrizione)}</span>
        <button class="q2-item-delete" data-type="offerta" data-index="${idx}">🗑</button>
      </li>
    `
      )
      .join("");

    eventiList.innerHTML = eventiData
      .map(
        (item, idx) => `
      <li class="q2-item">
        <span class="q2-item-dot" style="background:#42a5f5;"></span>
        <span class="q2-item-title">${escapeHtml(item.titolo)}</span>
        <span class="q2-item-sub">${escapeHtml(item.descrizione)}</span>
        <button class="q2-item-delete" data-type="evento" data-index="${idx}">🗑</button>
      </li>
    `
      )
      .join("");
  }

  renderLists();

  if (btnOff) {
    btnOff.addEventListener("click", () => {
      const titolo = prompt("Titolo offerta (es. Promo colesterolo):");
      if (!titolo) return;
      const desc =
        prompt("Dettaglio / note brevi:") || "Dettaglio non specificato.";
      offerteData.push({ titolo, descrizione: desc });
      renderLists();
    });
  }

  if (btnEv) {
    btnEv.addEventListener("click", () => {
      const titolo = prompt("Titolo giornata/evento (es. Lunedì – Giornata ECO):");
      if (!titolo) return;
      const desc =
        prompt("Dettaglio / note brevi:") || "Dettaglio non specificato.";
      eventiData.push({ titolo, descrizione: desc });
      renderLists();
    });
  }

  function onDeleteClick(e) {
    const btn = e.target.closest(".q2-item-delete");
    if (!btn) return;
    const type = btn.dataset.type;
    const index = Number(btn.dataset.index);
    if (!Number.isInteger(index)) return;

    if (type === "offerta") {
      offerteData.splice(index, 1);
    } else if (type === "evento") {
      eventiData.splice(index, 1);
    }
    renderLists();
  }

  offerteList.addEventListener("click", onDeleteClick);
  eventiList.addEventListener("click", onDeleteClick);
}

/* ==========================
   AGENDA – Q4
   ========================== */

const agendaEvents = [
  {
    date: oggiISO,
    start: "09:00",
    end: "10:00",
    servizio: "ECG",
    paziente: "Rossi Maria",
  },
  {
    date: oggiISO,
    start: "10:30",
    end: "11:30",
    servizio: "Holter",
    paziente: "Bianchi Luca",
  },
  {
    date: oggiISO,
    start: "12:00",
    end: "12:30",
    servizio: "Prelievo",
    paziente: "Profilo lipidico",
  },
  {
    date: oggiISO,
    start: "17:00",
    end: "18:00",
    servizio: "Consulenza nutrizionale",
    paziente: "Valutazione piano alimentare",
  },
];

let agendaView = "week"; // default
let selectedDate = parseISO(oggiISO);

function setupAgenda() {
  const container = document.getElementById("agenda-content");
  const info = document.getElementById("agenda-current-info");
  const tabs = document.querySelectorAll(".agenda-tab");
  if (!container || !info) return;

  function setView(newView) {
    agendaView = newView;
    tabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.view === newView)
    );
    renderAgenda();
  }

  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      const view = t.dataset.view;
      if (!view) return;
      if (view === "day") {
        // vista giorno sull'attuale selectedDate
        setView("day");
      } else {
        setView(view);
      }
    });
  });

  const btnNuovo = document.getElementById("btn-nuovo-app");
  if (btnNuovo) {
    btnNuovo.addEventListener("click", () => {
      const dataStr = prompt(
        "Data appuntamento (formato GG/MM, vuoto = oggi):",
        ""
      );
      let dateIso = oggiISO;
      if (dataStr) {
        const [gg, mm] = dataStr.split("/");
        const d = new Date(
          selectedDate.getFullYear(),
          Number(mm) - 1,
          Number(gg)
        );
        if (!isNaN(d)) {
          dateIso = toISODate(d);
          selectedDate = d;
        }
      } else {
        dateIso = toISODate(selectedDate);
      }

      const ora = prompt("Orario (es. 09:00-10:00):", "09:00-10:00");
      if (!ora) return;
      const [start, end] = ora.split("-");
      const servizio = prompt(
        "Servizio (ECG, Holter, Prelievo, Consulenza nutrizionale, Altro):",
        "ECG"
      );
      if (!servizio) return;
      const paziente =
        prompt("Nome paziente / nota:", "Paziente demo") || "Paziente demo";

      agendaEvents.push({
        date: dateIso,
        start: start || "09:00",
        end: end || "09:30",
        servizio,
        paziente,
      });

      agendaView = "day";
      renderAgenda();
    });
  }

  function renderAgenda() {
    const iso = toISODate(selectedDate);
    const giornoLabel = formatLongDateIT(iso);
    if (agendaView === "day") {
      info.textContent = `Vista GIORNO · ${giornoLabel}`;
      renderAgendaDay(container, iso);
    } else if (agendaView === "week") {
      info.textContent = `Vista SETTIMANA · settimana di ${giornoLabel}`;
      renderAgendaWeek(container, selectedDate);
    } else {
      info.textContent = `Vista MESE · ${selectedDate.toLocaleDateString(
        "it-IT",
        { month: "long", year: "numeric" }
      )}`;
      renderAgendaMonth(container, selectedDate);
    }

    document
      .querySelectorAll(".agenda-tab")
      .forEach((t) =>
        t.classList.toggle("active", t.dataset.view === agendaView)
      );
  }

  function goToDay(isoDate) {
    selectedDate = parseISO(isoDate);
    agendaView = "day";
    renderAgenda();
  }

  // RENDER WEEK
  function renderAgendaWeek(containerEl, baseDate) {
    const monday = getMonday(baseDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }

    let html = '<div class="agenda-week-grid">';
    days.forEach((d) => {
      const iso = toISODate(d);
      const dayEvents = agendaEvents
        .filter((e) => e.date === iso)
        .sort((a, b) => a.start.localeCompare(b.start));

      const dayLabel = d.toLocaleDateString("it-IT", {
        weekday: "short",
        day: "2-digit",
      });

      html += `
        <div class="agenda-week-day" data-day="${iso}">
          <div class="agenda-week-day-header">
            <span>${dayLabel}</span>
            <span>${dayEvents.length || ""}</span>
          </div>
          <div class="agenda-week-slot-list">
      `;

      dayEvents.forEach((ev) => {
        const pillClass = getAgendaPillClass(ev.servizio);
        html += `
          <div class="agenda-week-pill ${pillClass}" data-day="${iso}">
            ${ev.start} · ${escapeHtml(ev.servizio)} – ${escapeHtml(
          ev.paziente
        )}
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });
    html += "</div>";
    containerEl.innerHTML = html;

    containerEl.querySelectorAll("[data-day]").forEach((el) => {
      el.addEventListener("click", () => {
        const iso = el.getAttribute("data-day");
        if (iso) goToDay(iso);
      });
    });
  }

  // RENDER DAY
  function renderAgendaDay(containerEl, isoDate) {
    const events = agendaEvents
      .filter((e) => e.date === isoDate)
      .sort((a, b) => a.start.localeCompare(b.start));

    const hours = [];
    for (let h = 8; h <= 19; h++) {
      hours.push(`${String(h).padStart(2, "0")}:00`);
    }

    let html = '<div class="agenda-day-view">';
    html += '<div class="agenda-day-times">';
    hours.forEach((h) => {
      html += `<div>${h}</div>`;
    });
    html += "</div>";

    html += '<div class="agenda-day-slots">';
    hours.forEach(() => {
      html += '<div class="agenda-day-gridline"></div>';
    });

    events.forEach((ev) => {
      const cls = getAgendaPillClass(ev.servizio);
      html += `
        <div class="agenda-day-event ${cls}">
          ${ev.start}–${ev.end} · ${escapeHtml(ev.servizio)} – ${escapeHtml(
        ev.paziente
      )}
        </div>
      `;
    });

    html += "</div></div>";
    containerEl.innerHTML = html;
  }

  // RENDER MONTH
  function renderAgendaMonth(containerEl, baseDate) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekDay = firstDay.getDay() || 7; // 1-7 (lun=1)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '<div class="agenda-month-grid">';
    for (let i = 1; i < startWeekDay; i++) {
      html += '<div class="agenda-month-cell"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const iso = toISODate(d);
      const evts = agendaEvents.filter((e) => e.date === iso);
      html += `<div class="agenda-month-cell" data-day="${iso}">
        <div class="agenda-month-cell-header">${day}</div>
        <div>`;
      if (evts.length) {
        const main = evts[0];
        const cls = getAgendaPillClass(main.servizio);
        html += `<span class="agenda-month-dot ${cls}"></span>`;
      }
      html += `</div></div>`;
    }

    html += "</div>";
    containerEl.innerHTML = html;

    containerEl.querySelectorAll("[data-day]").forEach((el) => {
      el.addEventListener("click", () => {
        const iso = el.getAttribute("data-day");
        if (iso) goToDay(iso);
      });
    });
  }

  renderAgenda();
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setDate(date.getDate() - (day - 1));
  return date;
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getAgendaPillClass(servizio) {
  const s = servizio.toLowerCase();
  if (s.includes("ecg")) return "agenda-pill-ecg";
  if (s.includes("holter")) return "agenda-pill-holter";
  if (s.includes("prelievo")) return "agenda-pill-prelievo";
  if (s.includes("nutriz")) return "agenda-pill-nutrizione";
  return "agenda-pill-altro";
}

/* ==========================
   BOTTONE CENTRALE
   ========================== */

function setupCentralButton() {
  const btn = document.getElementById("central-action-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    alert(
      "Azione rapida: qui in futuro potrai scegliere se creare una nuova comunicazione, appuntamento, offerta o altro."
    );
  });
}
