// script.js

document.addEventListener("DOMContentLoaded", () => {
  impostaDataOggi();
  setupNavigazioneSezioni();
  inizializzaPanoramica();
  inizializzaPromozioni();
  inizializzaAgenda();
  setupModali();
  setupFabChat();
});

/* =======================
   DATA OGGI HEADER
   ======================= */
function impostaDataOggi() {
  const el = document.getElementById("today-label");
  if (!el) return;
  const oggi = new Date();
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  el.textContent = formatter.format(oggi);
}

/* =======================
   NAVIGAZIONE SEZIONI
   ======================= */

// dati demo per assenze e turni (come prima)
const assenzeDemo = [
  { nome: "Mario Rossi", dal: "2025-11-29", al: "2025-11-30", tipo: "Ferie", stato: "approvato" },
  { nome: "Lucia Bianchi", dal: "2025-11-28", al: "2025-11-28", tipo: "Permesso", stato: "approvato" },
  { nome: "Giuseppe Neri", dal: "2025-12-03", al: "2025-12-05", tipo: "Malattia", stato: "approvato" },
  { nome: "Mario Rossi", dal: "2025-12-10", al: "2025-12-12", tipo: "Ferie", stato: "approvato" },
  { nome: "Test in attesa", dal: "2025-12-01", al: "2025-12-01", tipo: "Permesso", stato: "in attesa" },
];

const turniDemo = [
  { data: "2025-11-30", farmacia: "Farmacia Montesano", orario: "08:00 – 20:00", appoggio: "Farmacia Centrale", note: "Turno ordinario diurno." },
  { data: "2025-12-01", farmacia: "Farmacia Centrale", orario: "08:00 – 20:00", appoggio: "Farmacia Montesano", note: "Turno di scambio tra farmacie." },
];

const oggiISO = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

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
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatRangeIT(dalISO, alISO) {
  const d1 = formatShortDateIT(dalISO);
  const d2 = formatShortDateIT(alISO);
  return d1 === d2 ? d1 : `${d1} → ${d2}`;
}

function setupNavigazioneSezioni() {
  const dashboards = document.querySelectorAll(".mobile-dashboard, .desktop-dashboard");
  const sezioni = document.querySelectorAll(".sezione-dettaglio");

  dashboards.forEach((d) => {
    const comp = window.getComputedStyle(d);
    d.dataset.displayOriginal = comp.display || "block";
  });

  function mostraDashboard() {
    sezioni.forEach((sec) => (sec.style.display = "none"));
    dashboards.forEach((d) => (d.style.display = d.dataset.displayOriginal || "block"));
    window.scrollTo(0, 0);
  }

  function mostraSezione(id) {
    dashboards.forEach((d) => (d.style.display = "none"));
    sezioni.forEach((sec) => {
      sec.style.display = sec.id === `sezione-${id}` ? "block" : "none";
    });

    if (id === "assenti") renderAssenti();
    if (id === "turno") renderTurno();
    window.scrollTo(0, 0);
  }

  document.querySelectorAll("[data-section]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-section");
      if (!id) return;
      // per desktop aggiorno area contenuti
      if (window.innerWidth >= 900) {
        mostraContenutoSezione(id);
      } else {
        // su mobile apro sezione dedicata solo per assenti/turno
        if (id === "assenti" || id === "turno") {
          e.preventDefault();
          mostraSezione(id);
        }
      }
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

/* ASSENTI */
function renderAssenti() {
  const containerOggi = document.getElementById("assenti-oggi");
  const containerNext = document.getElementById("assenti-prossimi");
  if (!containerOggi || !containerNext) return;

  const ruoloSelect = document.getElementById("ruolo-assenti");
  const ruolo = ruoloSelect ? ruoloSelect.value : "farmacia";

  let lista = assenzeDemo.filter((a) => a.stato === "approvato");

  if (ruolo === "dipendente") {
    lista = lista.filter((a) => a.nome === "Mario Rossi");
  }

  const oggiDate = parseISO(oggiISO);
  const oggiList = [];
  const nextList = [];

  lista.forEach((a) => {
    const dal = parseISO(a.dal);
    const al = parseISO(a.al);
    if (oggiDate >= dal && oggiDate <= al) oggiList.push(a);
    else if (oggiDate < dal) nextList.push(a);
  });

  nextList.sort((a, b) => parseISO(a.dal) - parseISO(b.dal));

  let htmlOggi = "<h3>Assenti oggi</h3>";
  if (!oggiList.length) {
    htmlOggi += "<p>Nessuno assente oggi.</p>";
  } else {
    htmlOggi += "<ul>";
    oggiList.forEach((a) => {
      htmlOggi += `<li><strong>${a.nome}</strong> – ${a.tipo} (${formatRangeIT(a.dal, a.al)})</li>`;
    });
    htmlOggi += "</ul>";
  }

  let htmlNext = "<h3>Assenze prossimi giorni</h3>";
  if (!nextList.length) {
    htmlNext += "<p>Non ci sono altre assenze approvate.</p>";
  } else {
    htmlNext += "<ul>";
    nextList.forEach((a) => {
      htmlNext += `<li><strong>${a.nome}</strong> – ${a.tipo} (${formatRangeIT(a.dal, a.al)})</li>`;
    });
    htmlNext += "</ul>";
  }

  containerOggi.innerHTML = htmlOggi;
  containerNext.innerHTML = htmlNext;
}

/* TURNO */
function renderTurno() {
  const boxOggi = document.getElementById("turno-oggi");
  const boxNext = document.getElementById("turno-prossimi");
  if (!boxOggi || !boxNext) return;

  let turnoOggi = turniDemo.find((t) => t.data === oggiISO) || turniDemo[0];
  const altri = turniDemo.filter((t) => t !== turnoOggi);

  boxOggi.innerHTML = `
    <h3>Turno di oggi</h3>
    <p><strong>${turnoOggi.farmacia}</strong> – ${formatLongDateIT(turnoOggi.data)}</p>
    <p>Orario: <strong>${turnoOggi.orario}</strong></p>
    <p>Appoggio: <strong>${turnoOggi.appoggio}</strong></p>
    <p>${turnoOggi.note}</p>
  `;

  let htmlNext = "<h3>Prossimi turni</h3>";
  if (!altri.length) {
    htmlNext += "<p>Non ci sono altri turni in elenco.</p>";
  } else {
    htmlNext += "<ul>";
    altri.forEach((t) => {
      htmlNext += `<li><strong>${formatShortDateIT(t.data)}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
    });
    htmlNext += "</ul>";
  }
  boxNext.innerHTML = htmlNext;
}

/* =======================
   AREA CONTENUTI
   ======================= */

let inactivityTimer = null;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(inizializzaPanoramica, 20000); // 20 sec
}

function inizializzaPanoramica() {
  const container = document.getElementById("area-contenuti-inner");
  if (!container) return;

  container.innerHTML = `
    <div class="panorama-grid">
      <div class="panorama-tile">
        <div class="panorama-icon" style="background:#bbf7d0;">🩺</div>
        <div class="panorama-text">
          <h3>Servizi di oggi</h3>
          <p>Controlla subito gli appuntamenti e i servizi programmati.</p>
        </div>
      </div>
      <div class="panorama-tile">
        <div class="panorama-icon" style="background:#dbeafe;">📅</div>
        <div class="panorama-text">
          <h3>Assenze confermate</h3>
          <p>Vedi chi manca oggi e nei prossimi giorni.</p>
        </div>
      </div>
      <div class="panorama-tile">
        <div class="panorama-icon" style="background:#fee2e2;">📢</div>
        <div class="panorama-text">
          <h3>Comunicazioni</h3>
          <p>Avvisi rapidi per lo staff: turni, note operative, memo.</p>
        </div>
      </div>
      <div class="panorama-tile">
        <div class="panorama-icon" style="background:#e0f2fe;">🏷️</div>
        <div class="panorama-text">
          <h3>Offerte & giornate</h3>
          <p>Promo attive e giornate dedicate ai servizi.</p>
        </div>
      </div>
    </div>
    <div class="panorama-small">
      Suggerimento: tocca una card nella sezione in alto a sinistra per vedere i dettagli
      qui a destra. Se non tocchi nulla per 20 secondi torni a questa vista.
    </div>
  `;
}

function mostraContenutoSezione(sectionId) {
  const container = document.getElementById("area-contenuti-inner");
  if (!container) return;

  resetInactivityTimer();

  const sezioniInfo = {
    assenti: {
      titolo: "Assenti / Permessi",
      descrizione: "Qui vedrai un elenco veloce delle assenze approvate con indicazione di chi, quando e che tipo di permesso.",
    },
    turno: {
      titolo: "Farmacia di turno",
      descrizione: "Riepilogo sintetico della farmacia di turno oggi, con orari di servizio e farmacia di appoggio.",
    },
    comunicazioni: {
      titolo: "Comunicazioni interne",
      descrizione: "Spazio dedicato agli avvisi rapidi per il team: note operative, promemoria, indicazioni del titolare.",
    },
    procedure: {
      titolo: "Procedure",
      descrizione: "Accesso alle procedure interne della farmacia: protocolli, check-list e istruzioni aggiornate.",
    },
    logistica: {
      titolo: "Logistica",
      descrizione: "Gestione rapida di consegne, ritiri, corrieri e materiale di consumo.",
    },
    magazzino: {
      titolo: "Magazziniera",
      descrizione: "Controlli periodici di scorte, inventari, resi e sistemazione scaffali.",
    },
    scadenze: {
      titolo: "Prodotti in scadenza",
      descrizione: "Elenco prodotti in scadenza da monitorare e smaltire, con priorità sui più urgenti.",
    },
    consumabili: {
      titolo: "Consumabili",
      descrizione: "Stato di carta, sacchetti, etichette, DPI, materiali per i servizi e altro.",
    },
    archivio: {
      titolo: "Archivio file",
      descrizione: "Spazio dedicato a documenti, report, schede operative e tutto il materiale digitale della farmacia.",
    },
  };

  const info = sezioniInfo[sectionId] || {
    titolo: "Sezione",
    descrizione: "Dettagli sezione non configurata.",
  };

  container.innerHTML = `
    <div class="area-section-pill">SEZIONE ATTIVA</div>
    <h3 class="area-section-title">${info.titolo}</h3>
    <p>${info.descrizione}</p>
    <p style="font-size:0.85rem;color:var(--txt-muted);margin-top:6px;">
      In una versione successiva qui potrai vedere tabelle, elenchi e moduli dedicati
      a questa funzione, con pulsanti grandi e ben leggibili per il touch screen.
    </p>
  `;
}

/* =======================
   PROMOZIONI & GIORNATE
   ======================= */

let promoDati = {
  offerte: [],
  giornate: [
    {
      tipo: "giornata",
      titolo: "Giornata ECO",
      data: oggiISO,
      dettagli: "Ecocardiogramma con referto cardiologo.",
    },
  ],
};

function inizializzaPromozioni() {
  renderListePromo();

  document.querySelectorAll("[data-open='promo-modal']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.getAttribute("data-type");
      apriModalPromo(tipo);
    });
  });

  const salvaBtn = document.getElementById("promo-salva");
  if (salvaBtn) salvaBtn.addEventListener("click", salvaPromo);
}

function renderListePromo() {
  const ulOfferte = document.getElementById("lista-offerte");
  const ulGiornate = document.getElementById("lista-giornate");
  if (!ulOfferte || !ulGiornate) return;

  const offerte = [...promoDati.offerte].sort((a, b) => a.data.localeCompare(b.data));
  const giornate = [...promoDati.giornate].sort((a, b) => a.data.localeCompare(b.data));

  ulOfferte.innerHTML = offerte.length
    ? offerte.map((p, idx) => promoItemHTML(p, "offerta", idx)).join("")
    : '<li class="promo-empty">Nessuna offerta inserita.</li>';

  ulGiornate.innerHTML = giornate.length
    ? giornate.map((p, idx) => promoItemHTML(p, "giornata", idx)).join("")
    : '<li class="promo-empty">Nessuna giornata programmata.</li>';

  // cestini
  document.querySelectorAll(".promo-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.tipo;
      const index = Number(btn.dataset.index);
      if (!tipo) return;
      promoDati[tipo === "offerta" ? "offerte" : "giornate"].splice(index, 1);
      renderListePromo();
    });
  });
}

function promoItemHTML(p, tipo, index) {
  const emoji = tipo === "offerta" ? "🏷️" : "📆";
  const tagClass = tipo === "offerta" ? "offerta" : "giornata";
  const dataLabel = p.data ? formatShortDateIT(p.data) : "";
  return `
    <li class="promo-item">
      <button class="promo-delete" data-tipo="${tipo}" data-index="${index}" title="Elimina">🗑️</button>
      <strong>${emoji} ${p.titolo}</strong>
      <div class="promo-meta">${dataLabel}${p.dettagli ? " · " + p.dettagli : ""}</div>
      <span class="promo-tag ${tagClass}">${tipo === "offerta" ? "OFFERTA" : "GIORNATA"}</span>
    </li>
  `;
}

function apriModalPromo(tipo) {
  const modal = document.getElementById("promo-modal");
  if (!modal) return;
  modal.style.display = "flex";

  const title = document.getElementById("promo-modal-title");
  const typeLabel = document.getElementById("promo-modal-type-label");
  if (tipo === "offerta") {
    title.textContent = "Aggiungi offerta";
    typeLabel.textContent = "Offerta in corso";
  } else {
    title.textContent = "Aggiungi giornata in farmacia";
    typeLabel.textContent = "Giornata in farmacia";
  }
  modal.dataset.tipo = tipo;
  document.getElementById("promo-titolo").value = "";
  document.getElementById("promo-data").value = "";
  document.getElementById("promo-dettagli").value = "";
}

function salvaPromo() {
  const modal = document.getElementById("promo-modal");
  if (!modal) return;
  const tipo = modal.dataset.tipo || "offerta";

  const titolo = document.getElementById("promo-titolo").value.trim();
  const data = document.getElementById("promo-data").value;
  const dettagli = document.getElementById("promo-dettagli").value.trim();

  if (!titolo || !data) {
    alert("Inserisci almeno titolo e data.");
    return;
  }

  const obj = { tipo, titolo, data, dettagli };
  if (tipo === "offerta") promoDati.offerte.push(obj);
  else promoDati.giornate.push(obj);

  modal.style.display = "none";
  renderListePromo();
}

/* =======================
   AGENDA SERVIZI
   ======================= */

let agendaState = {
  currentMonth: (() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-based
  })(),
  selectedDate: oggiISO,
  eventi: [
    { data: oggiISO, orario: "08:00 – 09:00", nome: "Rossi Maria", servizio: "ECG", tipo: "ecg" },
    { data: oggiISO, orario: "09:30 – 10:30", nome: "Bianchi Luca", servizio: "Holter pressorio", tipo: "holter" },
    { data: oggiISO, orario: "11:00 – 11:30", nome: "Verdi Anna", servizio: "Prelievo profilo lipidico", tipo: "prelievo" },
    { data: oggiISO, orario: "17:00 – 17:30", nome: "Gialli Paola", servizio: "Consulenza nutrizionale", tipo: "consulenza" },
  ],
};

function inizializzaAgenda() {
  const prev = document.getElementById("month-prev");
  const next = document.getElementById("month-next");
  if (prev) prev.addEventListener("click", () => cambiaMese(-1));
  if (next) next.addEventListener("click", () => cambiaMese(1));

  const btnNuovo = document.getElementById("btn-nuovo-app");
  if (btnNuovo) {
    btnNuovo.addEventListener("click", () => apriModalAgenda(agendaState.selectedDate));
  }

  renderAgenda();
}

function cambiaMese(delta) {
  let { year, month } = agendaState.currentMonth;
  month += delta;
  if (month < 0) {
    month = 11;
    year--;
  } else if (month > 11) {
    month = 0;
    year++;
  }
  agendaState.currentMonth = { year, month };
  const firstDay = new Date(year, month, 1);
  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`;
  agendaState.selectedDate = iso;
  renderAgenda();
}

function renderAgenda() {
  const { year, month } = agendaState.currentMonth;
  const monthLabelEl = document.getElementById("agenda-month-label");
  const grid = document.getElementById("agenda-month-grid");
  if (!monthLabelEl || !grid) return;

  const monthName = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
  monthLabelEl.textContent = monthName;

  grid.innerHTML = "";

  const dayNames = ["lu", "ma", "me", "gi", "ve", "sa", "do"];
  dayNames.forEach((name) => {
    const el = document.createElement("div");
    el.textContent = name.toUpperCase();
    el.className = "agenda-day-name";
    grid.appendChild(el);
  });

  const first = new Date(year, month, 1);
  let startIdx = first.getDay() - 1;
  if (startIdx < 0) startIdx = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startIdx; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "agenda-day-cell";
    if (iso === oggiISO) cell.classList.add("today");
    if (iso === agendaState.selectedDate) cell.classList.add("selected");

    const numSpan = document.createElement("span");
    numSpan.textContent = d;
    cell.appendChild(numSpan);

    const eventiGiorno = agendaState.eventi.filter((e) => e.data === iso);
    if (eventiGiorno.length) {
      const dotsRow = document.createElement("div");
      dotsRow.className = "dot-row";
      const colors = {
        ecg: "#38bdf8",
        holter: "#fbbf24",
        prelievo: "#4ade80",
        consulenza: "#f472b6",
        generico: "#94a3b8",
      };
      eventiGiorno.slice(0, 4).forEach((e) => {
        const dot = document.createElement("div");
        dot.className = "agenda-dot";
        dot.style.background = colors[e.tipo] || colors.generico;
        dotsRow.appendChild(dot);
      });
      cell.appendChild(dotsRow);
    }

    cell.addEventListener("click", () => {
      agendaState.selectedDate = iso;
      renderAgenda();
    });

    grid.appendChild(cell);
  }

  renderAgendaGiorno();
}

function renderAgendaGiorno() {
  const label = document.getElementById("agenda-day-label");
  const list = document.getElementById("agenda-day-list");
  if (!label || !list) return;

  label.textContent = `Vista giorno – ${formatLongDateIT(agendaState.selectedDate)}`;

  const eventiGiorno = agendaState.eventi
    .filter((e) => e.data === agendaState.selectedDate)
    .sort((a, b) => (a.orario || "").localeCompare(b.orario || ""));

  if (!eventiGiorno.length) {
    list.innerHTML = "<li>Nessun appuntamento inserito per questo giorno.</li>";
    return;
  }

  const colorClass = (tipo) => {
    if (tipo === "ecg") return "event-ecg";
    if (tipo === "holter") return "event-holter";
    if (tipo === "prelievo") return "event-prelievo";
    if (tipo === "consulenza") return "event-consulenza";
    return "event-generico";
  };

  list.innerHTML = eventiGiorno
    .map(
      (e) => `
    <li class="agenda-event ${colorClass(e.tipo)}">
      <span class="agenda-event-time">${e.orario || ""}</span>
      <div class="agenda-event-info">
        <div><strong>${e.servizio}</strong> – ${e.nome}</div>
      </div>
    </li>`
    )
    .join("");
}

function apriModalAgenda(dataIso) {
  const modal = document.getElementById("agenda-modal");
  if (!modal) return;
  modal.style.display = "flex";
  document.getElementById("agenda-data").value = dataIso || oggiISO;
  document.getElementById("agenda-orario").value = "";
  document.getElementById("agenda-nome").value = "";
  document.getElementById("agenda-servizio").value = "";
}

function salvaAgenda() {
  const data = document.getElementById("agenda-data").value;
  const orario = document.getElementById("agenda-orario").value.trim();
  const nome = document.getElementById("agenda-nome").value.trim();
  const servizio = document.getElementById("agenda-servizio").value.trim();

  if (!data || !nome || !servizio) {
    alert("Inserisci almeno data, nome e motivo/servizio.");
    return;
  }

  const tipo = servizio.toLowerCase().includes("ecg")
    ? "ecg"
    : servizio.toLowerCase().includes("holter")
    ? "holter"
    : servizio.toLowerCase().includes("consul")
    ? "consulenza"
    : servizio.toLowerCase().includes("preliev")
    ? "prelievo"
    : "generico";

  agendaState.eventi.push({ data, orario, nome, servizio, tipo });
  agendaState.selectedDate = data;
  const modal = document.getElementById("agenda-modal");
  if (modal) modal.style.display = "none";
  agendaState.currentMonth = {
    year: parseISO(data).getFullYear(),
    month: parseISO(data).getMonth(),
  };
  renderAgenda();
}

/* =======================
   MODALI GENERICI
   ======================= */

function setupModali() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    const id = btn.getAttribute("data-close-modal");
    btn.addEventListener("click", () => {
      const modal = document.getElementById(id);
      if (modal) modal.style.display = "none";
    });
  });

  const agendaSalva = document.getElementById("agenda-salva");
  if (agendaSalva) agendaSalva.addEventListener("click", salvaAgenda);
}

/* =======================
   FLOATING CHAT BTN
   ======================= */

function setupFabChat() {
  const btn = document.getElementById("fab-chat");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // per ora solo messaggio; in futuro potrai sostituire con link a WhatsApp Web
    alert(
      "In futuro qui potrai aprire direttamente la chat WhatsApp della farmacia.\nPer ora è solo un pulsante dimostrativo."
    );
  });
}

/* =======================
   TIMER PANORAMICA
   ======================= */
document.addEventListener("click", (e) => {
  const withinArea = e.target.closest("#area-contenuti-inner");
  const isSectionCard = e.target.closest(".section-card");
  if (withinArea || isSectionCard) {
    resetInactivityTimer();
  }
});
