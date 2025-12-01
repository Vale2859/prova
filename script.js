// script.js

document.addEventListener("DOMContentLoaded", () => {
  initSezioni();
  initAreaContenuti();
  initPromoEGiornate();
  initAgenda();
  initModal();
  bindMobileCards();
});

/* =======================
   DATI DEMO
   ======================= */

// Sezioni per Q1 (collegate a contenuti Q2)
const SEZIONI = [
  { id: "assenti", titolo: "Assenti / Permessi", icon: "📅" },
  { id: "turno", titolo: "Farmacia di turno", icon: "⏰" },
  { id: "comunicazioni", titolo: "Comunicazioni", icon: "📢" },
  { id: "procedure", titolo: "Procedure", icon: "📚" },
  { id: "logistica", titolo: "Logistica", icon: "📦" },
  { id: "magazzino", titolo: "Magazziniera", icon: "📋" },
  { id: "scadenze", titolo: "Prodotti in scadenza", icon: "⏳" },
  { id: "consumabili", titolo: "Consumabili", icon: "🧪" },
  { id: "consegne", titolo: "Consegne / Ritiri", icon: "🚚" },
  // se vuoi altre sezioni, aggiungile qui
];

// Offerte demo
let offerte = [
  {
    id: 1,
    titolo: "Sconto 20% dermocosmesi",
    dal: "2025-11-25",
    al: "2025-12-10",
    nota: "Linea viso selezionata",
  },
  {
    id: 2,
    titolo: "Promo integratori inverno",
    dal: "2025-10-15",
    al: "2025-11-15",
    nota: "Offerta scaduta di esempio",
  },
];

let nextOffertaId = 3;

// Giornate in farmacia demo
let giornate = [
  {
    id: 1,
    titolo: "Giornata HOLTER",
    dal: "2025-12-03",
    al: "2025-12-03",
    nota: "Solo su prenotazione",
  },
  {
    id: 2,
    titolo: "Giornata ECO",
    dal: "2025-12-10",
    al: "2025-12-10",
    nota: "Visita con cardiologo",
  },
  {
    id: 3,
    titolo: "Giornata glicemia",
    dal: "2025-11-15",
    al: "2025-11-15",
    nota: "Esempio già conclusa",
  },
];

let nextGiornataId = 4;

// Appuntamenti agenda
let appuntamenti = [
  {
    id: 1,
    data: "2025-12-03",
    ora: "09:00",
    nome: "Mario Rossi",
    motivo: "HOLTER",
    telefono: "3331234567",
  },
  {
    id: 2,
    data: "2025-12-03",
    ora: "10:30",
    nome: "Lucia Bianchi",
    motivo: "HOLTER",
    telefono: "3339876543",
  },
  {
    id: 3,
    data: "2025-12-10",
    ora: "11:00",
    nome: "Giuseppe Neri",
    motivo: "ECO",
    telefono: "3201112233",
  },
];

let nextAppId = 4;

// Stato Area Contenuti
let currentContentId = "panoramica"; // oppure id sezione
let contenutiInactivityTimer = null;
const CONTENUTI_TIMEOUT_MS = 20000; // 20 secondi

// Stato Agenda
let agendaYear;
let agendaMonth; // 0-11

/* =======================
   UTILS DATE
   ======================= */

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatShortIT(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function dateDiffInDays(from, to) {
  const ms = parseISO(to) - parseISO(from);
  return ms / (1000 * 60 * 60 * 24);
}

/* =======================
   MODAL GENERICO
   ======================= */

let modalBackdrop, modalTitle, modalBody, modalFooter, modalCloseBtn;

function initModal() {
  modalBackdrop = document.getElementById("modal-backdrop");
  modalTitle = document.getElementById("modal-title");
  modalBody = document.getElementById("modal-body");
  modalFooter = document.getElementById("modal-footer");
  modalCloseBtn = document.getElementById("modal-close");

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", hideModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) hideModal();
    });
  }
}

function showModal(title, bodyHtml, footerButtons = []) {
  if (!modalBackdrop) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;

  modalFooter.innerHTML = "";
  footerButtons.forEach((btnCfg) => {
    const btn = document.createElement("button");
    btn.textContent = btnCfg.label;
    btn.className = btnCfg.className || "btn-primary";
    btn.addEventListener("click", btnCfg.onClick);
    modalFooter.appendChild(btn);
  });

  modalBackdrop.classList.remove("hidden");
}

function hideModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add("hidden");
}
/* =======================
   Q1 – SEZIONI
   ======================= */

function initSezioni() {
  const grid = document.getElementById("sezioni-grid");
  if (!grid) return;

  grid.innerHTML = "";
  SEZIONI.slice(0, 9).forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "section-card";
    btn.dataset.sectionId = s.id;

    btn.innerHTML = `
      <div class="section-card-label">Sezione</div>
      <div class="section-card-title">${s.titolo}</div>
      <div class="section-card-icon">${s.icon}</div>
    `;

    btn.addEventListener("click", () => {
      mostraSezioneInContenuti(s.id);
    });

    grid.appendChild(btn);
  });
}

/* =======================
   Q2 – AREA CONTENUTI
   ======================= */

function initAreaContenuti() {
  mostraPanoramicaRapida();
  setupInactivityReset();
}

function setupInactivityReset() {
  const wrapper = document.getElementById("contenuti-wrapper");
  if (!wrapper) return;

  wrapper.addEventListener("click", () => {
    if (currentContentId !== "panoramica") {
      resetContenutiTimer();
    }
  });
}

function resetContenutiTimer() {
  if (contenutiInactivityTimer) {
    clearTimeout(contenutiInactivityTimer);
  }
  contenutiInactivityTimer = setTimeout(() => {
    mostraPanoramicaRapida();
  }, CONTENUTI_TIMEOUT_MS);
}

function mostraPanoramicaRapida() {
  const titleEl = document.getElementById("contenuti-title");
  const bodyEl = document.getElementById("contenuti-body");
  if (!titleEl || !bodyEl) return;

  currentContentId = "panoramica";

  titleEl.textContent = "Panoramica rapida";

  const oggi = todayISO();

  const offerteAttive = offerte.filter((o) => o.al >= oggi);
  const giornateAttive = giornate.filter((g) => g.al >= oggi);

  const appuntamentiOggi = appuntamenti.filter((a) => a.data === oggi);

  const html = `
    <div class="panoramica-grid">
      <div class="panoramica-card">
        <div class="panoramica-label">Offerte attive</div>
        <div class="panoramica-value">${offerteAttive.length}</div>
        <div class="panoramica-extra">Promozioni in corso oggi o prossimi giorni.</div>
      </div>
      <div class="panoramica-card">
        <div class="panoramica-label">Giornate in programma</div>
        <div class="panoramica-value">${giornateAttive.length}</div>
        <div class="panoramica-extra">Servizi speciali pianificati.</div>
      </div>
      <div class="panoramica-card">
        <div class="panoramica-label">Appuntamenti di oggi</div>
        <div class="panoramica-value">${appuntamentiOggi.length}</div>
        <div class="panoramica-extra">Agenda servizi per la data odierna.</div>
      </div>
    </div>
  `;

  bodyEl.innerHTML = html;
}

function mostraSezioneInContenuti(sectionId) {
  const titleEl = document.getElementById("contenuti-title");
  const bodyEl = document.getElementById("contenuti-body");
  if (!titleEl || !bodyEl) return;

  currentContentId = sectionId;
  resetContenutiTimer();

  const sezione = SEZIONI.find((s) => s.id === sectionId);
  titleEl.textContent = sezione ? sezione.titolo : "Dettaglio";

  let html = "";

  switch (sectionId) {
    case "assenti":
      html = `
        <p><strong>Assenti / Permessi</strong></p>
        <p>Qui in futuro vedrai in tempo reale chi è assente oggi e i permessi approvati.</p>
        <ul>
          <li>Vista rapida assenti oggi.</li>
          <li>Calendario ferie per mese.</li>
          <li>Richieste permesso da approvare.</li>
        </ul>
      `;
      break;

    case "turno":
      html = `
        <p><strong>Farmacia di turno</strong></p>
        <p>In questa sezione verranno riportati i turni della farmacia e gli appoggi.</p>
        <p style="font-size:0.85rem; color:#7c8b90;">
          (In futuro si potrà valutare un collegamento automatico con il sito dei turni, se Federfarma fornirà un accesso dati strutturato.)
        </p>
      `;
      break;

    case "comunicazioni":
      html = `
        <p><strong>Comunicazioni interne</strong></p>
        <p>Spazio per messaggi rapidi tra titolare e collaboratori.</p>
        <ul>
          <li>Note di servizio.</li>
          <li>Avvisi urgenti.</li>
          <li>Promemoria giornalieri.</li>
        </ul>
      `;
      break;

    case "procedure":
      html = `
        <p><strong>Procedure</strong></p>
        <p>Elenco strutturato delle procedure operative (cassa, magazzino, servizi...).</p>
        <ul>
          <li>Chiusura cassa serale.</li>
          <li>Gestione resi grossista.</li>
          <li>Procedure CUP / servizi.</li>
        </ul>
      `;
      break;

    case "logistica":
      html = `
        <p><strong>Logistica</strong></p>
        <p>Gestione espositori, materiale marketing, consegne extra e allestimenti.</p>
      `;
      break;

    case "magazzino":
      html = `
        <p><strong>Magazziniera</strong></p>
        <p>Inventari rapidi, controllo scorte e gestione resi.</p>
      `;
      break;

    case "scadenze":
      html = renderScadenzeDettaglio();
      break;

    case "consumabili":
      html = `
        <p><strong>Consumabili</strong></p>
        <p>Monitoraggio stato consumabili (sacchetti, carta scontrino, guanti...).</p>
      `;
      break;

    case "consegne":
      html = `
        <p><strong>Consegne / Ritiri</strong></p>
        <p>Riepilogo delle consegne programmate per oggi e i ritiri da effettuare.</p>
      `;
      break;

    default:
      html = `<p>Contenuto in lavorazione.</p>`;
      break;
  }

  bodyEl.innerHTML = html;
}

/* =======================
   SCADENZE (SEZIONE)
   ======================= */

// demo prodotti con scadenza
let scadenzeProdotti = [
  {
    nome: "Omeprazolo 20mg cps",
    scadenza: "2026-02-10",
    pezzi: 4,
  },
  {
    nome: "Vitamina C 1000mg",
    scadenza: "2026-01-05",
    pezzi: 6,
  },
  {
    nome: "Spray nasale bimbo",
    scadenza: "2025-12-20",
    pezzi: 3,
  },
];

function renderScadenzeDettaglio() {
  const oggi = todayISO();

  const entro60 = scadenzeProdotti.filter((p) => {
    const diff = dateDiffInDays(oggi, p.scadenza);
    return diff >= 0 && diff <= 60;
  });

  let html = `
    <p><strong>Prodotti in scadenza (entro 60 giorni)</strong></p>
  `;

  if (entro60.length === 0) {
    html += `<p style="font-size:0.9rem;">Nessun prodotto in scadenza entro 60 giorni.</p>`;
  } else {
    html += `<ul style="padding-left:16px; font-size:0.9rem;">`;
    entro60.forEach((p) => {
      html += `<li>${p.nome} – ${p.pezzi} pz (scad. ${formatShortIT(p.scadenza)})</li>`;
    });
    html += `</ul>`;
  }

  html += `
    <button class="btn-primary" onclick="apriPopupNuovaScadenza()">
      + Inserisci nuova scadenza
    </button>
  `;
  return html;
}

function apriPopupNuovaScadenza() {
  const body = `
    <div class="form-row">
      <label>
        Nome prodotto
        <input type="text" id="scad-nome" placeholder="Es. Omeprazolo 20mg" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Data scadenza
        <input type="date" id="scad-data" />
      </label>
      <label>
        N. pezzi
        <input type="number" id="scad-pezzi" min="1" value="1" />
      </label>
    </div>
  `;

  showModal("Inserisci nuova scadenza", body, [
    {
      label: "Annulla",
      className: "btn-ghost",
      onClick: hideModal,
    },
    {
      label: "Salva",
      className: "btn-primary",
      onClick: () => {
        const nome = document.getElementById("scad-nome").value.trim();
        const data = document.getElementById("scad-data").value;
        const pezzi = Number(document.getElementById("scad-pezzi").value || "0");

        if (!nome || !data || pezzi <= 0) {
          alert("Compila nome, data e numero pezzi.");
          return;
        }

        scadenzeProdotti.push({ nome, scadenza: data, pezzi });
        hideModal();
        // aggiorna area contenuti se aperta
        if (currentContentId === "scadenze") {
          mostraSezioneInContenuti("scadenze");
        }
      },
    },
  ]);
}
/* =======================
   Q3 – PROMOZIONI & GIORNATE
   ======================= */

function initPromoEGiornate() {
  renderOfferteEGiornate();

  const btnAddOfferta = document.getElementById("btn-add-offerta");
  const btnVediOfferte = document.getElementById("btn-vedi-offerte");
  const btnAddGiornata = document.getElementById("btn-add-giornata");
  const btnGAttive = document.getElementById("btn-giornate-attive");
  const btnGConcluse = document.getElementById("btn-giornate-concluse");

  if (btnAddOfferta) {
    btnAddOfferta.addEventListener("click", () => apriPopupOfferta());
  }

  if (btnVediOfferte) {
    btnVediOfferte.addEventListener("click", () => apriPopupElencoOfferte());
  }

  if (btnAddGiornata) {
    btnAddGiornata.addEventListener("click", () => apriPopupGiornata());
  }

  if (btnGAttive) {
    btnGAttive.addEventListener("click", () =>
      apriPopupElencoGiornate("attive")
    );
  }

  if (btnGConcluse) {
    btnGConcluse.addEventListener("click", () =>
      apriPopupElencoGiornate("concluse")
    );
  }
}

function renderOfferteEGiornate() {
  const oggi = todayISO();
  const contOff = document.getElementById("lista-offerte");
  const contGio = document.getElementById("lista-giornate");
  if (!contOff || !contGio) return;

  contOff.innerHTML = "";
  contGio.innerHTML = "";

  // Offerte (tutte, ma badge diversa se scadute)
  offerte.forEach((o) => {
    const isScaduta = o.al < oggi;
    const item = document.createElement("div");
    item.className = "promo-item";
    item.dataset.offertaId = o.id;

    item.innerHTML = `
      <div class="promo-item-title">${o.titolo}</div>
      <div class="promo-item-meta">
        Dal ${formatShortIT(o.dal)} al ${formatShortIT(o.al)}
      </div>
      <div class="promo-item-meta">${o.nota || ""}</div>
      <div class="promo-item-badge ${isScaduta ? "scaduta" : "attiva"}">
        ${isScaduta ? "Offerta scaduta" : "Offerta attiva"}
      </div>
    `;

    item.addEventListener("click", () => apriPopupOfferta(o));
    contOff.appendChild(item);
  });

  // Giornate
  giornate.forEach((g) => {
    const isScaduta = g.al < oggi;
    const item = document.createElement("div");
    item.className = "promo-item";
    item.dataset.giornataId = g.id;

    item.innerHTML = `
      <div class="promo-item-title">${g.titolo}</div>
      <div class="promo-item-meta">
        ${formatShortIT(g.dal)} – ${formatShortIT(g.al)}
      </div>
      <div class="promo-item-meta">${g.nota || ""}</div>
      <div class="promo-item-badge ${isScaduta ? "scaduta" : "attiva"}">
        ${isScaduta ? "Giornata conclusa" : "Giornata attiva"}
      </div>
    `;

    item.addEventListener("click", () => apriPopupGiornata(g));
    contGio.appendChild(item);
  });

  // aggiorna agenda (giornate evidenziate)
  renderAgendaGrid();
}

/* Offerta singola: crea / modifica */
function apriPopupOfferta(offerta) {
  const isEdit = !!offerta;

  const body = `
    <div class="form-row">
      <label>
        Titolo offerta
        <input type="text" id="off-titolo" value="${offerta ? offerta.titolo.replace(/"/g, "&quot;") : ""}" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Dal
        <input type="date" id="off-dal" value="${offerta ? offerta.dal : ""}" />
      </label>
      <label>
        Al
        <input type="date" id="off-al" value="${offerta ? offerta.al : ""}" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Note
        <textarea id="off-nota" rows="2">${offerta ? (offerta.nota || "") : ""}</textarea>
      </label>
    </div>
  `;

  const buttons = [
    {
      label: "Annulla",
      className: "btn-ghost",
      onClick: hideModal,
    },
    {
      label: isEdit ? "Salva modifiche" : "Crea offerta",
      className: "btn-primary",
      onClick: () => {
        const titolo = document.getElementById("off-titolo").value.trim();
        const dal = document.getElementById("off-dal").value;
        const al = document.getElementById("off-al").value;
        const nota = document.getElementById("off-nota").value.trim();

        if (!titolo || !dal || !al) {
          alert("Compila titolo e intervallo (dal-al).");
          return;
        }

        if (isEdit) {
          offerta.titolo = titolo;
          offerta.dal = dal;
          offerta.al = al;
          offerta.nota = nota;
        } else {
          offerte.push({
            id: nextOffertaId++,
            titolo,
            dal,
            al,
            nota,
          });
        }

        hideModal();
        renderOfferteEGiornate();
      },
    },
  ];

  if (isEdit) {
    buttons.splice(1, 0, {
      label: "Elimina",
      className: "btn-ghost",
      onClick: () => {
        if (confirm("Vuoi eliminare questa offerta?")) {
          offerte = offerte.filter((o) => o !== offerta);
          hideModal();
          renderOfferteEGiornate();
        }
      },
    });
  }

  showModal(isEdit ? "Modifica offerta" : "Nuova offerta", body, buttons);
}

/* Elenco offerte: in corso + scadute */
function apriPopupElencoOfferte() {
  const oggi = todayISO();

  const attive = offerte.filter((o) => o.al >= oggi);
  const scadute = offerte.filter((o) => o.al < oggi);

  let body = `<p><strong>Offerte in corso</strong></p>`;
  if (attive.length === 0) {
    body += `<p style="font-size:0.85rem;">Nessuna offerta attiva.</p>`;
  } else {
    body += `<ul style="font-size:0.85rem;">`;
    attive.forEach((o) => {
      body += `<li>${o.titolo} (${formatShortIT(o.dal)} - ${formatShortIT(o.al)})</li>`;
    });
    body += `</ul>`;
  }

  body += `<hr style="margin:8px 0;" />`;

  body += `<p><strong>Offerte scadute</strong></p>`;
  if (scadute.length === 0) {
    body += `<p style="font-size:0.85rem;">Nessuna offerta scaduta.</p>`;
  } else {
    body += `<ul style="font-size:0.85rem;">`;
    scadute.forEach((o) => {
      body += `<li>${o.titolo} (${formatShortIT(o.dal)} - ${formatShortIT(o.al)})</li>`;
    });
    body += `</ul>`;
  }

  showModal("Riepilogo offerte", body, [
    {
      label: "Chiudi",
      className: "btn-primary",
      onClick: hideModal,
    },
  ]);
}

/* Giornata singola: crea / modifica */
function apriPopupGiornata(giornata) {
  const isEdit = !!giornata;

  const body = `
    <div class="form-row">
      <label>
        Titolo giornata
        <input type="text" id="gio-titolo" value="${giornata ? giornata.titolo.replace(/"/g, "&quot;") : ""}" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Dal
        <input type="date" id="gio-dal" value="${giornata ? giornata.dal : ""}" />
      </label>
      <label>
        Al
        <input type="date" id="gio-al" value="${giornata ? giornata.al : ""}" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Note
        <textarea id="gio-nota" rows="2">${giornata ? (giornata.nota || "") : ""}</textarea>
      </label>
    </div>
  `;

  const buttons = [
    {
      label: "Annulla",
      className: "btn-ghost",
      onClick: hideModal,
    },
    {
      label: isEdit ? "Salva modifiche" : "Crea giornata",
      className: "btn-primary",
      onClick: () => {
        const titolo = document.getElementById("gio-titolo").value.trim();
        const dal = document.getElementById("gio-dal").value;
        const al = document.getElementById("gio-al").value;
        const nota = document.getElementById("gio-nota").value.trim();

        if (!titolo || !dal || !al) {
          alert("Compila titolo e intervallo (dal-al).");
          return;
        }

        if (isEdit) {
          giornata.titolo = titolo;
          giornata.dal = dal;
          giornata.al = al;
          giornata.nota = nota;
        } else {
          giornate.push({
            id: nextGiornataId++,
            titolo,
            dal,
            al,
            nota,
          });
        }

        hideModal();
        renderOfferteEGiornate();
      },
    },
  ];

  if (isEdit) {
    buttons.splice(1, 0, {
      label: "Elimina",
      className: "btn-ghost",
      onClick: () => {
        if (confirm("Vuoi eliminare questa giornata?")) {
          giornate = giornate.filter((g) => g !== giornata);
          hideModal();
          renderOfferteEGiornate();
        }
      },
    });
  }

  showModal(isEdit ? "Modifica giornata" : "Nuova giornata", body, buttons);
}

/* Elenco giornate (attive / concluse) */
function apriPopupElencoGiornate(tipo) {
  const oggi = todayISO();
  let elenco;
  let titolo;

  if (tipo === "attive") {
    titolo = "Giornate attive";
    elenco = giornate.filter((g) => g.al >= oggi);
  } else {
    titolo = "Giornate concluse";
    elenco = giornate.filter((g) => g.al < oggi);
  }

  let body = "";
  if (elenco.length === 0) {
    body = `<p style="font-size:0.9rem;">Nessuna giornata trovata.</p>`;
  } else {
    body = `<ul style="font-size:0.9rem;">`;
    elenco.forEach((g) => {
      body += `<li>${g.titolo} (${formatShortIT(g.dal)} - ${formatShortIT(g.al)})</li>`;
    });
    body += `</ul>`;
  }

  showModal(titolo, body, [
    {
      label: "Chiudi",
      className: "btn-primary",
      onClick: hideModal,
    },
  ]);
}

/* =======================
   Q4 – AGENDA
   ======================= */

function initAgenda() {
  const today = new Date();
  agendaYear = today.getFullYear();
  agendaMonth = today.getMonth();

  const btnPrev = document.getElementById("agenda-prev");
  const btnNext = document.getElementById("agenda-next");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      agendaMonth--;
      if (agendaMonth < 0) {
        agendaMonth = 11;
        agendaYear--;
      }
      renderAgendaGrid();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      agendaMonth++;
      if (agendaMonth > 11) {
        agendaMonth = 0;
        agendaYear++;
      }
      renderAgendaGrid();
    });
  }

  renderAgendaGrid();
}

function renderAgendaGrid() {
  const cont = document.getElementById("agenda-grid");
  const monthLabel = document.getElementById("agenda-month-label");
  if (!cont || !monthLabel) return;

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  monthLabel.textContent = `${monthNames[agendaMonth]} ${agendaYear}`;

  cont.innerHTML = "";

  const weekdaysRow = document.createElement("div");
  weekdaysRow.className = "agenda-weekdays";
  ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"].forEach((d) => {
    const span = document.createElement("div");
    span.textContent = d;
    weekdaysRow.appendChild(span);
  });

  const daysGrid = document.createElement("div");
  daysGrid.className = "agenda-days";

  const firstDay = new Date(agendaYear, agendaMonth, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // lun=0
  const daysInMonth = new Date(agendaYear, agendaMonth + 1, 0).getDate();

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "agenda-day agenda-day-empty";
    daysGrid.appendChild(empty);
  }

  const oggi = todayISO();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(agendaYear, agendaMonth, day);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const iso = `${y}-${m}-${dd}`;

    const cell = document.createElement("div");
    cell.className = "agenda-day";
    cell.dataset.date = iso;

    if (iso === oggi) {
      cell.classList.add("today");
    }

    // giornata in farmacia?
    const hasGiornata = giornate.some((g) => iso >= g.dal && iso <= g.al && g.al >= oggi);
    if (hasGiornata) {
      cell.classList.add("has-giornata");
    }

    const dayNumber = document.createElement("div");
    dayNumber.className = "agenda-day-number";
    dayNumber.textContent = day;

    const meta = document.createElement("div");
    meta.className = "agenda-day-meta";

    const apptCount = appuntamenti.filter((a) => a.data === iso).length;
    if (apptCount > 0) {
      meta.textContent = `${apptCount} appt`;
    } else if (hasGiornata) {
      meta.textContent = "Giornata";
    } else {
      meta.textContent = "";
    }

    cell.appendChild(dayNumber);
    cell.appendChild(meta);

    cell.addEventListener("click", () => apriPopupGiornoAgenda(iso));

    daysGrid.appendChild(cell);
  }

  cont.appendChild(weekdaysRow);
  cont.appendChild(daysGrid);
}

function apriPopupGiornoAgenda(dateISO) {
  const giorno = parseISO(dateISO);
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const labelData = formatter.format(giorno);

  const giornateInGiorno = giornate.filter(
    (g) => dateISO >= g.dal && dateISO <= g.al
  );

  const appt = appuntamenti
    .filter((a) => a.data === dateISO)
    .sort((a, b) => (a.ora || "").localeCompare(b.ora || ""));

  let body = `<p><strong>${labelData}</strong></p>`;

  if (giornateInGiorno.length > 0) {
    body += `<p><strong>Giornate in farmacia:</strong></p><ul>`;
    giornateInGiorno.forEach((g) => {
      body += `<li>${g.titolo} (${formatShortIT(g.dal)} - ${formatShortIT(g.al)})</li>`;
    });
    body += `</ul>`;
  }

  body += `<p><strong>Appuntamenti</strong></p>`;

  if (appt.length === 0) {
    body += `<p style="font-size:0.9rem;">Nessun appuntamento registrato.</p>`;
  } else {
    body += `<ul style="font-size:0.9rem;">`;
    appt.forEach((a) => {
      body += `<li>${a.ora} – ${a.nome} (${a.motivo}) · ${a.telefono}</li>`;
    });
    body += `</ul>`;
  }

  body += `
    <hr style="margin:8px 0;" />
    <p><strong>Nuovo appuntamento</strong></p>
    <div class="form-row">
      <label>
        Data
        <input type="date" id="app-data" value="${dateISO}" />
      </label>
      <label>
        Ora
        <input type="time" id="app-ora" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Nome e cognome
        <input type="text" id="app-nome" placeholder="Es. Mario Rossi" />
      </label>
    </div>
    <div class="form-row">
      <label>
        Motivo
        <input type="text" id="app-motivo" placeholder="Es. HOLTER, ECO..." />
      </label>
    </div>
    <div class="form-row">
      <label>
        Telefono
        <input type="tel" id="app-tel" placeholder="Es. 3331234567" />
      </label>
    </div>
  `;

  showModal("Agenda – " + labelData, body, [
    {
      label: "Chiudi",
      className: "btn-ghost",
      onClick: hideModal,
    },
    {
      label: "Salva appuntamento",
      className: "btn-primary",
      onClick: () => {
        const data = document.getElementById("app-data").value;
        const ora = document.getElementById("app-ora").value;
        const nome = document.getElementById("app-nome").value.trim();
        const motivo = document.getElementById("app-motivo").value.trim();
        const tel = document.getElementById("app-tel").value.trim();

        if (!data || !ora || !nome || !motivo || !tel) {
          alert("Compila tutti i campi (data, ora, nome, motivo, telefono).");
          return;
        }

        appuntamenti.push({
          id: nextAppId++,
          data,
          ora,
          nome,
          motivo,
          telefono: tel,
        });

        hideModal();
        renderAgendaGrid();
      },
    },
  ]);
}

/* =======================
   MOBILE – TAP CARD → AREA CONTENUTI
   ======================= */

function bindMobileCards() {
  const cards = document.querySelectorAll(".m-card[data-section]");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-section");
      // Per ora, semplicemente mostro la sezione in area contenuti
      // (utile se un giorno vorrai la stessa struttura su mobile)
      mostraSezioneInContenuti(id);
    });
  });
}
