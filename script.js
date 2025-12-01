// script.js
// =======================
// UTILITA' GENERALI
// =======================
const STORAGE_KEYS = {
  offerte: "fm_offerte",
  giornate: "fm_giornate",
  appuntamenti: "fm_appuntamenti",
  scadenze: "fm_scadenze"
};

function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// Date helper
function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function parseISODate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatIT(str) {
  const d = parseISODate(str);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function todayISO() {
  return toISODate(new Date());
}

// =======================
// STATO IN MEMORIA
// =======================
let offerte = loadList(STORAGE_KEYS.offerte);
let giornate = loadList(STORAGE_KEYS.giornate);
let appuntamenti = loadList(STORAGE_KEYS.appuntamenti);
let scadenze = loadList(STORAGE_KEYS.scadenze);

let currentMonthDate = new Date(); // calendario agenda
let panoramicaTimeoutId = null;    // per auto-ritorno panoramica
let filterGiornateMode = "attive"; // "attive" | "concluse"
let selectedGiornataId = null;
let selectedSlot = null;

// =======================
// INIZIALIZZAZIONE
// =======================
document.addEventListener("DOMContentLoaded", () => {
  initSezioni();
  initPanoramica();
  initPromozioniGiornate();
  initAgenda();
  initModals();
  document.getElementById("btn-esci").addEventListener("click", () => {
    // demo: semplicemente ricarico
    location.reload();
  });
});
// =======================
// SEZIONI FARMACIA + AREA CONTENUTI
// =======================
function initSezioni() {
  const secButtons = document.querySelectorAll(".sec-card");
  secButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.section;
      openSezioneDettaglio(id);
    });
  });

  const backBtn = document.getElementById("btn-back-panorama");
  backBtn.addEventListener("click", () => showPanoramica());

  // reset panoramica all'avvio
  showPanoramica();
}

function openSezioneDettaglio(id) {
  const map = {
    assenti: {
      title: "Assenti / Permessi",
      sub: "Vista delle assenze approvate, permessi e ferie."
    },
    turno: {
      title: "Farmacia di turno",
      sub: "Riepilogo turni e farmacie di appoggio."
    },
    comunicazioni: {
      title: "Comunicazioni",
      sub: "Messaggi rapidi interni, note e promemoria."
    },
    procedure: {
      title: "Procedure",
      sub: "Procedure operative standard, protocolli e istruzioni."
    },
    logistica: {
      title: "Logistica",
      sub: "Consegne, corrieri, rifornimenti e gestione pacchi."
    },
    magazzino: {
      title: "Magazziniera",
      sub: "Inventari, scorte minime, resi e controlli."
    },
    scadenze: {
      title: "Prodotti in scadenza",
      sub: "Elenco prodotti in scadenza, con filtro entro 60 giorni."
    },
    consumabili: {
      title: "Consumabili",
      sub: "Materiale di consumo e ordini ricorrenti."
    },
    consegne: {
      title: "Consegne / Archivio file",
      sub: "Consegne giornaliere, documenti e file operativi."
    }
  };

  const cfg = map[id] || { title: "Sezione", sub: "" };
  document.getElementById("detail-title").textContent = cfg.title;
  document.getElementById("detail-subtitle").textContent = cfg.sub;

  const box = document.getElementById("detail-content");
  box.innerHTML = `
    <p><strong>${cfg.title}</strong> – area demo.</p>
    <p>
      Qui potrai in futuro avere tabelle, pulsanti e funzioni dedicate a questa sezione.
      Per ora è solo una vista dimostrativa, ma la struttura è già pronta.
    </p>
    <ul>
      <li>Gestione dati specifici della sezione.</li>
      <li>Azioni rapide dedicate.</li>
      <li>Statistiche e riepiloghi.</li>
    </ul>
  `;

  document.getElementById("panoramica-box").style.display = "none";
  document.getElementById("dettaglio-box").classList.remove("hidden");

  restartPanoramicaTimer();
}

function showPanoramica() {
  document.getElementById("panoramica-box").style.display = "block";
  document.getElementById("dettaglio-box").classList.add("hidden");
  clearPanoramicaTimer();
}

function restartPanoramicaTimer() {
  clearPanoramicaTimer();
  panoramicaTimeoutId = setTimeout(() => {
    showPanoramica();
  }, 20000); // 20 secondi
}

function clearPanoramicaTimer() {
  if (panoramicaTimeoutId) {
    clearTimeout(panoramicaTimeoutId);
    panoramicaTimeoutId = null;
  }
}

// =======================
// PANORAMICA RAPIDA
// =======================
function initPanoramica() {
  updatePanoramica();
}

function updatePanoramica() {
  const oggi = todayISO();

  // Servizi di oggi = appuntamenti nella data
  const serviziOggi = appuntamenti.filter(a => a.data === oggi).length;
  document.getElementById("val-servizi-oggi").textContent = serviziOggi;

  // Assenze demo: lasciamo 0
  document.getElementById("val-assenze-oggi").textContent = 0;

  // Prodotti in scadenza entro 60 gg
  const now = parseISODate(oggi);
  const entro60 = scadenze.filter(s => {
    const d = parseISODate(s.data_scadenza);
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  });

  document.getElementById("val-scadenze-60").textContent = entro60.length;
  const sub = document.getElementById("sub-scadenze-60");
  if (entro60.length === 0) {
    sub.textContent = "Nessun prodotto in scadenza nei prossimi 60 giorni.";
  } else {
    const preview = entro60.slice(0, 3)
      .map(s => `${s.nome} (${formatIT(s.data_scadenza)})`)
      .join(" · ");
    sub.textContent = preview + " – vedi elenco completo nella sezione 'Prodotti in scadenza'.";
  }

  // Comunicazioni non lette demo
  document.getElementById("val-comunicazioni").textContent = 0;
}
// =======================
// PROMOZIONI & GIORNATE
// =======================
function initPromozioniGiornate() {
  document.getElementById("btn-add-offerta").addEventListener("click", () => {
    openOffertaGiornataModal("offerta");
  });
  document.getElementById("btn-add-giornata").addEventListener("click", () => {
    openOffertaGiornataModal("giornata");
  });

  document.getElementById("btn-vedi-offerte").addEventListener("click", () => {
    showAllOfferteGiornate();
  });

  document.getElementById("btn-giornate-attive").addEventListener("click", () => {
    filterGiornateMode = "attive";
    renderGiornate();
  });
  document.getElementById("btn-giornate-concluse").addEventListener("click", () => {
    filterGiornateMode = "concluse";
    renderGiornate();
  });

  renderOfferte();
  renderGiornate();
}

function openOffertaGiornataModal(type) {
  const dialog = document.getElementById("modal-offerta-giornata");
  document.getElementById("mg-type").value = type;
  document.getElementById("mg-title").textContent =
    type === "offerta" ? "Nuova offerta in corso" : "Nuova giornata in farmacia";

  const form = document.getElementById("mg-form");
  form.reset();

  dialog.classList.remove("hidden");
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
}

function initModals() {
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // submit offerta/giornata
  document.getElementById("mg-form").addEventListener("submit", e => {
    e.preventDefault();
    const type = document.getElementById("mg-type").value;
    const titolo = document.getElementById("mg-titolo").value.trim();
    const dal = document.getElementById("mg-dal").value;
    const al = document.getElementById("mg-al").value;
    const note = document.getElementById("mg-note").value.trim();
    if (!titolo || !dal || !al) return;

    const record = {
      id: Date.now().toString(),
      titolo,
      dal,
      al,
      note
    };

    if (type === "offerta") {
      offerte.push(record);
      saveList(STORAGE_KEYS.offerte, offerte);
      renderOfferte();
    } else {
      giornate.push(record);
      saveList(STORAGE_KEYS.giornate, giornate);
      renderGiornate();
      renderAgendaCalendar(); // giornate visibili nel calendario
    }

    closeAllModals();
  });

  // fab demo (per ora nulla)
  document.getElementById("fab-azioni").addEventListener("click", () => {
    alert("In futuro qui metteremo le azioni rapide (nuova scadenza, nuovo promemoria, ecc.).");
  });
}

function renderOfferte() {
  const container = document.getElementById("lista-offerte");
  container.innerHTML = "";
  if (offerte.length === 0) {
    container.textContent = "Nessuna offerta in corso.";
    return;
  }

  const oggi = todayISO();

  offerte
    .slice()
    .sort((a, b) => a.dal.localeCompare(b.dal))
    .forEach(o => {
      const isScaduta = o.al < oggi;
      const item = document.createElement("div");
      item.className = "promo-item";
      item.innerHTML = `
        <div class="promo-item-header">
          <span>${o.titolo}</span>
          <span class="promo-badge ${isScaduta ? "badge-offerta-scaduta" : "badge-offerta-attiva"}">
            ${isScaduta ? "Offerta scaduta" : "Offerta attiva"}
          </span>
        </div>
        <div class="promo-item-dates">
          Dal ${formatIT(o.dal)} al ${formatIT(o.al)}
        </div>
        ${o.note ? `<div class="promo-item-note">${o.note}</div>` : ""}
      `;
      container.appendChild(item);
    });
}

function renderGiornate() {
  const container = document.getElementById("lista-giornate");
  container.innerHTML = "";
  if (giornate.length === 0) {
    container.textContent = "Nessuna giornata programmata.";
    return;
  }

  const oggi = todayISO();

  giornate
    .slice()
    .sort((a, b) => a.dal.localeCompare(b.dal))
    .forEach(g => {
      const isConclusa = g.al < oggi;
      if (filterGiornateMode === "attive" && isConclusa) return;
      if (filterGiornateMode === "concluse" && !isConclusa) return;

      const item = document.createElement("div");
      item.className = "promo-item";
      item.dataset.id = g.id;

      const badgeClass = isConclusa ? "badge-giornata-conclusa" : "badge-giornata-attiva";
      const badgeLabel = isConclusa ? "Giornata conclusa" : "Giornata attiva";

      item.innerHTML = `
        <div class="promo-item-header">
          <span>${g.titolo}</span>
          <span class="promo-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="promo-item-dates">
          Dal ${formatIT(g.dal)} al ${formatIT(g.al)}
        </div>
        ${g.note ? `<div class="promo-item-note">${g.note}</div>` : ""}
      `;
      item.addEventListener("click", () => openGiornataPlanner(g.id));
      container.appendChild(item);
    });
}

function showAllOfferteGiornate() {
  const container = document.getElementById("mgiorno-elenco");
  const modal = document.getElementById("modal-giorno");
  const oggi = todayISO();

  let html = "<h4>Offerte in corso</h4>";
  if (offerte.length === 0) {
    html += "<p>Nessuna offerta.</p>";
  } else {
    html += "<ul>";
    offerte.forEach(o => {
      const isScaduta = o.al < oggi;
      html += `<li>${o.titolo} (${formatIT(o.dal)} → ${formatIT(o.al)}) - ${
        isScaduta ? "scaduta" : "attiva"
      }</li>`;
    });
    html += "</ul>";
  }

  html += "<h4>Giornate in farmacia</h4>";
  if (giornate.length === 0) {
    html += "<p>Nessuna giornata programmata.</p>";
  } else {
    html += "<ul>";
    giornate.forEach(g => {
      const isConclusa = g.al < oggi;
      html += `<li>${g.titolo} (${formatIT(g.dal)} → ${formatIT(g.al)}) - ${
        isConclusa ? "conclusa" : "attiva"
      }</li>`;
    });
    html += "</ul>";
  }

  document.getElementById("mgiorno-title").textContent = "Offerte e giornate";
  container.innerHTML = html;
  modal.classList.remove("hidden");
}
// =======================
// GIORNATA PLANNER (slot 08:30–20:00 ogni 30 min)
// =======================
function generateSlots() {
  const slots = [];
  let hour = 8;
  let minute = 30;
  while (hour < 20 || (hour === 20 && minute === 0)) {
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }
  return slots;
}

function openGiornataPlanner(giornataId) {
  selectedGiornataId = giornataId;
  selectedSlot = null;

  const g = giornate.find(x => x.id === giornataId);
  if (!g) return;

  const modal = document.getElementById("modal-giornata-planner");
  document.getElementById("gp-title").textContent = g.titolo;
  document.getElementById("gp-data").textContent = `Data: ${formatIT(g.dal)} – ${formatIT(g.al)}`;
  document.getElementById("gp-note").textContent = g.note || "Nessuna nota aggiuntiva.";

  document.getElementById("gp-nome").value = "";
  document.getElementById("gp-telefono").value = "";
  document.getElementById("gp-motivo").value = "";
  document.getElementById("gp-selected-slot").textContent = "Nessun orario selezionato.";

  renderGiornataSlots(g);

  modal.classList.remove("hidden");
}

function renderGiornataSlots(g) {
  const container = document.getElementById("gp-slots");
  container.innerHTML = "";

  const slots = generateSlots();
  const appuntamentiGiornata = appuntamenti.filter(a => a.giornataId === g.id);

  slots.forEach(slot => {
    const ap = appuntamentiGiornata.find(a => a.ora === slot);
    const row = document.createElement("div");
    row.className = "slot-row";

    const label = document.createElement("div");
    label.className = "slot-label";
    label.textContent = slot;

    const status = document.createElement("div");
    status.className = "slot-status";

    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.type = "button";

    if (ap) {
      status.textContent = `${ap.nome} (${ap.motivo || "prenotato"})`;
      btn.textContent = "Occupato";
      btn.classList.add("occupied");
    } else {
      status.textContent = "Disponibile";
      btn.textContent = "Seleziona";
      btn.addEventListener("click", () => {
        if (btn.classList.contains("occupied")) return;
        selectedSlot = slot;
        document
          .querySelectorAll(".slot-btn")
          .forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        document.getElementById("gp-selected-slot").textContent =
          "Orario selezionato: " + slot;
      });
    }

    row.appendChild(label);
    row.appendChild(status);
    row.appendChild(btn);
    container.appendChild(row);
  });

  // gestore form
  document.getElementById("gp-form").onsubmit = e => {
    e.preventDefault();
    if (!selectedSlot) {
      alert("Seleziona prima uno slot orario.");
      return;
    }
    const nome = document.getElementById("gp-nome").value.trim();
    const telefono = document.getElementById("gp-telefono").value.trim();
    const motivo = document.getElementById("gp-motivo").value.trim();
    if (!nome) {
      alert("Inserisci il nome del cliente.");
      return;
    }

    appuntamenti.push({
      id: Date.now().toString(),
      data: g.dal, // consideriamo la data di inizio
      ora: selectedSlot,
      nome,
      telefono,
      motivo,
      giornataId: g.id
    });
    saveList(STORAGE_KEYS.appuntamenti, appuntamenti);

    updatePanoramica();
    renderAgendaCalendar();
    openGiornataPlanner(g.id); // ricarica slots
  };

  document.getElementById("gp-clear").onclick = () => {
    selectedSlot = null;
    document
      .querySelectorAll(".slot-btn")
      .forEach(b => b.classList.remove("selected"));
    document.getElementById("gp-selected-slot").textContent =
      "Nessun orario selezionato.";
    document.getElementById("gp-nome").value = "";
    document.getElementById("gp-telefono").value = "";
    document.getElementById("gp-motivo").value = "";
  };
}
// =======================
// AGENDA SERVIZI – CALENDARIO MENSILE
// =======================
function initAgenda() {
  document.getElementById("btn-mese-prev").addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    renderAgendaCalendar();
  });
  document.getElementById("btn-mese-next").addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    renderAgendaCalendar();
  });

  document.getElementById("btn-nuovo-app").addEventListener("click", () => {
    nuovoAppuntamentoRapido();
  });

  renderAgendaCalendar();
}

function renderAgendaCalendar() {
  const label = document.getElementById("label-mese");
  label.textContent = currentMonthDate.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });

  const cal = document.getElementById("agenda-calendar");
  cal.innerHTML = "";

  const headerRow = document.createElement("div");
  headerRow.className = "agenda-header-row";
  ["LU", "MA", "ME", "GI", "VE", "SA", "DO"].forEach(d => {
    const span = document.createElement("div");
    span.textContent = d;
    headerRow.appendChild(span);
  });

  const daysGrid = document.createElement("div");
  daysGrid.className = "agenda-days-grid";

  const firstOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const startWeekDay = (firstOfMonth.getDay() + 6) % 7; // lun=0
  const daysInMonth = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 1,
    0
  ).getDate();

  const totalCells = Math.ceil((startWeekDay + daysInMonth) / 7) * 7;
  const today = todayISO();

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekDay + 1;
    const cell = document.createElement("div");
    cell.className = "agenda-day";

    let thisDate;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cell.classList.add("other-month");
      if (dayNum < 1) {
        const date = new Date(
          currentMonthDate.getFullYear(),
          currentMonthDate.getMonth(),
          dayNum
        );
        thisDate = toISODate(date);
      } else {
        const date = new Date(
          currentMonthDate.getFullYear(),
          currentMonthDate.getMonth(),
          dayNum
        );
        thisDate = toISODate(date);
      }
    } else {
      thisDate = toISODate(
        new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNum)
      );
    }

    const numSpan = document.createElement("div");
    numSpan.className = "agenda-day-number";
    numSpan.textContent = new Date(thisDate).getDate();
    cell.appendChild(numSpan);

    const badgesWrap = document.createElement("div");
    badgesWrap.className = "agenda-day-badges";

    const hasApp = appuntamenti.some(a => a.data === thisDate);
    const hasGiornata = giornate.some(g => thisDate >= g.dal && thisDate <= g.al);

    if (hasApp) {
      const dot = document.createElement("span");
      dot.className = "agenda-dot-app";
      badgesWrap.appendChild(dot);
    }
    if (hasGiornata) {
      const dot = document.createElement("span");
      dot.className = "agenda-dot-giornata";
      badgesWrap.appendChild(dot);
    }

    cell.appendChild(badgesWrap);

    if (thisDate === today) {
      cell.classList.add("today");
    }

    cell.addEventListener("click", () => openGiornoModal(thisDate));
    daysGrid.appendChild(cell);
  }

  cal.appendChild(headerRow);
  cal.appendChild(daysGrid);
}

function openGiornoModal(isoDate) {
  const list = appuntamenti
    .filter(a => a.data === isoDate)
    .sort((a, b) => a.ora.localeCompare(b.ora));

  const modal = document.getElementById("modal-giorno");
  const cont = document.getElementById("mgiorno-elenco");
  const d = parseISODate(isoDate);

  document.getElementById("mgiorno-title").textContent =
    "Appuntamenti – " +
    d.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

  if (list.length === 0) {
    cont.innerHTML = "<p>Nessun appuntamento per questa data.</p>";
  } else {
    cont.innerHTML = "";
    list.forEach(a => {
      const div = document.createElement("div");
      div.className = "mgiorno-item";
      div.innerHTML = `
        <div class="mgiorno-time">${a.ora}</div>
        <div class="mgiorno-name">${a.nome}</div>
        ${
          a.telefono
            ? `<div class="mgiorno-note">Tel: ${a.telefono}${
                a.motivo ? " – " + a.motivo : ""
              }</div>`
            : a.motivo
            ? `<div class="mgiorno-note">${a.motivo}</div>`
            : ""
        }
      `;
      cont.appendChild(div);
    });
  }

  modal.classList.remove("hidden");
}

// =======================
// NUOVO APPUNTAMENTO RAPIDO
// =======================
function nuovoAppuntamentoRapido() {
  const data = prompt("Data appuntamento (aaaa-mm-gg)?", todayISO());
  if (!data) return;
  const ora = prompt("Orario (es. 09:00)?", "09:00");
  if (!ora) return;
  const nome = prompt("Nome e cognome cliente?");
  if (!nome) return;
  const telefono = prompt("Telefono cliente?");
  const motivo = prompt("Motivo / servizio?");

  appuntamenti.push({
    id: Date.now().toString(),
    data,
    ora,
    nome,
    telefono,
    motivo,
    giornataId: null
  });
  saveList(STORAGE_KEYS.appuntamenti, appuntamenti);
  updatePanoramica();
  renderAgendaCalendar();
}
