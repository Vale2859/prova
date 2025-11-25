// ======================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO (RUOLI)
// ======================================================

// ====== DATI DEMO: TURNI FARMACIE ======
const turniFarmacie = [
  {
    data: "2025-12-17",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 335921",
    note: "Turno completo",
    tipoRange: "oggi",
    mese: 12
  },
  {
    data: "2025-12-18",
    orario: "08:00 – 20:00",
    principale: "Farmacia Centrale",
    appoggio: "Farmacia Montesano",
    telefono: "0835 111111",
    note: "Diurno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-19",
    orario: "20:00 – 08:00",
    principale: "Farmacia Madonna delle Grazie",
    appoggio: "Farmacia Montesano",
    telefono: "0835 222222",
    note: "Notturno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-24",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 000000",
    note: "Vigilia di Natale",
    tipoRange: "mese",
    mese: 12
  }
];

// ====== DATI DEMO: COMUNICAZIONI ======
let comunicazioni = [
  {
    id: 1,
    titolo: "Nuova procedura notturni",
    categoria: "urgente",
    autore: "Titolare",
    data: "Oggi",
    testo: "Dal prossimo turno seguire la nuova check-list di chiusura farmacia.",
    letta: false
  },
  {
    id: 2,
    titolo: "Verifica armadietto stupefacenti",
    categoria: "importante",
    autore: "Titolare",
    data: "Ieri",
    testo: "Controllare giacenze e scadenze entro fine settimana.",
    letta: false
  },
  {
    id: 3,
    titolo: "Aggiornamento promo vetrina",
    categoria: "informativa",
    autore: "Admin",
    data: "2 giorni fa",
    testo: "Nuova esposizione prodotti stagionali in vetrina principale.",
    letta: true
  }
];

// ====== DATI DEMO: PROCEDURE ======
const procedureData = [
  {
    id: "proc1",
    titolo: "Chiusura cassa serale",
    reparto: "cassa",
    aggiornamento: "12/11/2025",
    testo: "1) Verifica giacenza contanti.\n2) Stampa chiusura fiscale.\n3) Conta fondo cassa e registra su modulo chiusura."
  },
  {
    id: "proc2",
    titolo: "Gestione buoni SSN",
    reparto: "cassa",
    aggiornamento: "05/10/2025",
    testo: "Controllare ricetta, inserire correttamente i dati del paziente, allegare copia scontrino al buono."
  },
  {
    id: "proc3",
    titolo: "Ricezione merce da grossista",
    reparto: "magazzino",
    aggiornamento: "22/09/2025",
    testo: "Controllo colli, stampa DDT, verifica scadenze, etichettatura e carico in magazzino."
  },
  {
    id: "proc4",
    titolo: "Reso prodotti danneggiati",
    reparto: "logistica",
    aggiornamento: "18/09/2025",
    testo: "Compilare modulo reso, fotografare prodotto, contattare referente commerciale e attendere autorizzazione."
  },
  {
    id: "proc5",
    titolo: "Prenotazione servizi CUP / ECG",
    reparto: "servizi",
    aggiornamento: "01/10/2025",
    testo: "Verificare dati anagrafici, orari disponibili, confermare prenotazione e consegnare promemoria al cliente."
  }
];

// ====== DATI DEMO: ASSENZE PER CARD / CALENDARIO ======
const assenzeDemo = [
  { data: "2025-12-17", nome: "Mario Rossi", tipo: "ferie" },
  { data: "2025-12-18", nome: "Giulia Bianchi", tipo: "permesso" },
  { data: "2025-12-18", nome: "Alessandro Neri", tipo: "malattia" },
  { data: "2025-12-19", nome: "Sara Verdi", tipo: "ferie" },
  { data: "2025-12-20", nome: "Paolo Blu", tipo: "permesso" }
];

// ====== DATI DEMO: ARRIVI (LOGISTICA) ======
let arriviLogistica = [
  {
    id: 1,
    data: "2025-12-18",
    fornitore: "Unico",
    descrizione: "Espositore dermocosmesi + ricarico scaffali banco 1",
    urgente: true
  },
  {
    id: 2,
    data: "2025-12-19",
    fornitore: "Alliance",
    descrizione: "Ordine giornaliero + tamponi rapidi",
    urgente: false
  }
];

// ====== DATI DEMO: SCADENZE, SCORTE, CAMBIO CASSA ======
let scadenzeProdotti = [
  { id: 1, nome: "Ibuprofene 400mg 12 cpr", dataScadenza: "2026-01-15" },
  { id: 2, nome: "Omeprazolo 20mg 28 cps", dataScadenza: "2025-12-30" },
  { id: 3, nome: "Fermenti lattici bambini", dataScadenza: "2025-12-22" }
];

let scorteProdotti = [
  { id: 1, nome: "Termometri digitali", note: "Scorta quasi esaurita", urgente: true },
  { id: 2, nome: "Mascherine FFP2 bianche", note: "Sotto minimo", urgente: true },
  { id: 3, nome: "Cerotti elastici", note: "Da reintegrare", urgente: false }
];

let richiesteCambioCassa = [
  {
    id: 1,
    richiedente: "Banco 1",
    note: "Richiesti 50€ in monete da 1€ e 2€",
    dettagli: "🪙 20×1€ · 15×2€",
    data: "2025-12-17 09:15"
  },
  {
    id: 2,
    richiedente: "Banco 2",
    note: "Serve fondo cassa per turno serale",
    dettagli: "💵 2×20€ · 2×10€ · monete miste",
    data: "2025-12-17 15:40"
  }
];

// ====== DATI DEMO: NOTIFICHE PER CARD DASHBOARD ======
const notificationConfig = {
  assenze: {
    titolo: "Notifiche assenze personale",
    descrizioneVuota: "Non hai nuove notifiche sulle assenze.",
    notifiche: [
      {
        id: "ass-1",
        titolo: "Permesso approvato",
        testo: "Il permesso del 20/12 è stato approvato dal titolare.",
        letto: false
      },
      {
        id: "ass-2",
        titolo: "Permesso rifiutato",
        testo: "Il permesso del 10/01 è stato rifiutato. Controlla i dettagli con il titolare.",
        letto: false
      }
    ]
  },
  turni: {
    titolo: "Notifiche farmacie di turno",
    descrizioneVuota: "Nessuna variazione sui turni al momento.",
    notifiche: [
      {
        id: "turni-1",
        titolo: "Cambio turno notturno",
        testo: "Il turno notturno del 19/12 è stato scambiato con Farmacia Centrale.",
        letto: false
      }
    ]
  },
  comunicazioni: {
    titolo: "Nuove comunicazioni interne",
    descrizioneVuota: "Hai già letto tutte le comunicazioni.",
    notifiche: [
      {
        id: "com-1",
        titolo: "Nuova comunicazione urgente",
        testo: "È stata pubblicata una nuova comunicazione urgente dall'area titolare.",
        letto: false
      },
      {
        id: "com-2",
        titolo: "Messaggio informativo",
        testo: "Aggiornato il regolamento per l’utilizzo del retro-banco.",
        letto: false
      }
    ]
  },
  procedure: {
    titolo: "Aggiornamenti procedure",
    descrizioneVuota: "Nessuna procedura nuova da leggere.",
    notifiche: [
      {
        id: "proc-1",
        titolo: "Procedura chiusura cassa aggiornata",
        testo: "È stata aggiornata la procedura 'Chiusura cassa serale'.",
        letto: false
      }
    ]
  },
  logistica: {
    titolo: "Notifiche logistica",
    descrizioneVuota: "Al momento non ci sono avvisi di logistica.",
    notifiche: [
      {
        id: "log-1",
        titolo: "Nuovo espositore in arrivo",
        testo: "Venerdì arriverà il nuovo espositore dermocosmesi, da montare in vetrina 2.",
        letto: false
      }
    ]
  },
  magazzino: {
    titolo: "Notifiche magazzino",
    descrizioneVuota: "Non ci sono nuovi avvisi dal magazzino.",
    notifiche: [
      {
        id: "mag-1",
        titolo: "Scadenze in avvicinamento",
        testo: "Sono presenti 5 articoli con scadenza inferiore a 3 mesi.",
        letto: false
      },
      {
        id: "mag-2",
        titolo: "Inventario programmato",
        testo: "Lunedì mattina inventario rapido banco automedicazione.",
        letto: false
      }
    ]
  }
};

// ====== STATO GENERALE ======
let currentRole = "farmacia";
let currentTurniView = "oggi";
let currentProcedureFilter = "tutti";
let currentProcedureSearch = "";
let openNotificationCardKey = null;

// ====== ARCHIVIO FILE: STATO ======
let fsRoot = null;
let currentFolder = null;
let selectedItem = null;
let clipboardItem = null;
let lastSelectedEl = null;

// ====== RIFERIMENTI DOM ======
let authContainer, app, loginForm, loginRoleLabel, authTabs;
let dashboardSection, assenzePage, turniPage, comunicazioniPage, procedurePage, archivioPage;
let sidebar, hamburger, closeSidebar, logoutBtn, rolePill, assenzeTitle;
let openAssenzeBtn, backFromAssenzeBtn, openTurniBtn, backFromTurniBtn;
let openComunicazioniBtn, backFromComunicazioniBtn, openProcedureBtn, backFromProcedureBtn;
let openArchivioBtn, backFromArchivioBtn;
let turnoOrarioChip, turnoNome, turnoIndirizzo, turnoAppoggio;
let turnoOggiNome, turnoOggiIndirizzo, turnoOggiTelefono, turnoOggiOrario, turnoOggiAppoggioNome, turnoOggiAppoggioDettagli;
let turniTabs, turniRowsContainer, turniMeseSelect, turniFarmaciaSelect;
let comunicazioniList, filtroCategoria, filtroSoloNonLette, comunicazioneForm, comunicazioneFeedback;
let badgeTotComunicazioni, badgeNonLette, badgeUrgenti;
let assenzeForm, assenzeFeedback;
let procedureSearchInput, procedureFilterButtons, procedureListContainer, procedureDetail;
let archivioGrid, archivioPath, archivioUpload, archivioBtnUpload, archivioUpBtn, archivioNewFolderBtn;
let archivioContextMenu, menuNuova, menuRinomina, menuElimina, menuCopia, menuIncolla, menuDownload;
let notifOverlay, notifTitle, notifIntro, notifList, notifClose, notifCloseBottom;

// Nuovi riferimenti dashboard per funzioni avanzate
let cardAssenzeBody, cardTurnoBody, cardComunicazioniButton, cardLogisticaButton;
let cardMagazzinoBody;

// ======================================================
// FUNZIONI DI SUPPORTO GENERALI
// ======================================================
function formatDateIT(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getAssentiByDate(isoDate) {
  return assenzeDemo.filter(a => a.data === isoDate);
}

function getProssimeAssenze(limit = 3) {
  const oggi = todayISO();
  const future = assenzeDemo
    .filter(a => a.data >= oggi)
    .sort((a, b) => (a.data > b.data ? 1 : -1));
  return future.slice(0, limit);
}
// ======================================================
// GESTIONE RUOLI E DASHBOARD
// ======================================================
function setRole(role) {
  currentRole = role;
  if (!rolePill) return;

  if (role === "farmacia") {
    rolePill.textContent = "Farmacia (accesso generico)";
  } else if (role === "titolare") {
    rolePill.textContent = "Titolare · vista completa";
  } else {
    rolePill.textContent = "Dipendente";
  }

  if (assenzeTitle) {
    if (role === "dipendente") {
      assenzeTitle.textContent = "Le mie assenze";
    } else {
      assenzeTitle.textContent = "Assenze del personale";
    }
  }

  renderDashboardPerRole();
}

function renderDashboardPerRole() {
  // Card assenze: per titolare mostro oggi + prossimi
  const cardAssenze = document.querySelector(".card-assenze");
  cardAssenzeBody = cardAssenze ? cardAssenze.querySelector(".card-body") : null;
  if (cardAssenzeBody) {
    if (currentRole === "titolare") {
      renderDashboardAssenzeTitolare();
    } else {
      renderDashboardAssenzeBase();
    }
  }

  // Card comunicazioni: bottone "Comunica" per titolare
  const cardCom = document.querySelector(".card-comunicazioni");
  cardComunicazioniButton = cardCom
    ? cardCom.querySelector(".card-footer button")
    : null;
  if (cardComunicazioniButton) {
    if (currentRole === "titolare") {
      cardComunicazioniButton.textContent = "Comunica";
    } else {
      cardComunicazioniButton.textContent = "Vai a Comunicazioni";
    }
  }

  // Card logistica: testo aggiornato per arrivi
  const cardLog = document.querySelector(".card-logistica");
  if (cardLog) {
    const h2 = cardLog.querySelector("h2");
    const body = cardLog.querySelector(".card-body");
    cardLogisticaButton = cardLog.querySelector(".card-footer button");
    if (h2) h2.textContent = "Arrivi corrieri";
    if (body) {
      body.innerHTML =
        '<p class="small-text">Visualizza arrivi programmati e segnala nuovi arrivi di corrieri, espositori e materiali.</p>';
    }
    if (cardLogisticaButton) {
      cardLogisticaButton.textContent = "Visualizza / segnala arrivo";
    }
  }

  // Card magazzino: scadenze, scorte e cambio cassa
  const cardMag = document.querySelector(".card-magazziniera");
  if (cardMag) {
    const h2 = cardMag.querySelector("h2");
    if (h2) h2.textContent = "Scadenze · Scorte · Cambio cassa";

    cardMagazzinoBody = cardMag.querySelector(".card-body");
    if (cardMagazzinoBody) {
      cardMagazzinoBody.innerHTML = `
        <p class="small-text">
          Gestisci scadenze prodotti, scorte critiche e richieste di cambio cassa.
        </p>
        <div class="mag-actions">
          <button class="btn-secondary small" data-mag-action="scadenze">Scadenze</button>
          <button class="btn-secondary small" data-mag-action="scorte">Scorte</button>
          <button class="btn-secondary small" data-mag-action="cambio">Cambio cassa</button>
        </div>
      `;
    }
  }
}

// ====== DASHBOARD – CARD ASSENZE ======
function renderDashboardAssenzeBase() {
  if (!cardAssenzeBody) return;
  cardAssenzeBody.innerHTML = `
    <p class="caption">Demo grafica assenze.</p>
    <p class="small-text">
      Consulta calendario, assenti di oggi e richieste di ferie/permessi dalla pagina dedicata.
    </p>
  `;
}

function renderDashboardAssenzeTitolare() {
  if (!cardAssenzeBody) return;

  const oggi = todayISO();
  const assOggi = getAssentiByDate(oggi);
  const prossime = getProssimeAssenze(3);

  let html = `
    <p class="caption">Assenti di <strong>oggi</strong> e prossimi giorni.</p>
  `;

  if (assOggi.length === 0) {
    html += `<p class="small-text">Oggi nessun assente registrato.</p>`;
  } else {
    html += `<p class="small-text"><strong>Oggi:</strong></p><ul class="small-text">`;
    assOggi.forEach(a => {
      const tipoLabel =
        a.tipo === "ferie" ? "Ferie" :
        a.tipo === "permesso" ? "Permesso" :
        "Malattia";
      html += `<li>${a.nome} – ${tipoLabel}</li>`;
    });
    html += `</ul>`;
  }

  if (prossime.length > 0) {
    html += `<p class="small-text" style="margin-top:6px;"><strong>Prossimi giorni:</strong></p>`;
    html += `<div class="mini-calendario-assenze">`;
    prossime.forEach(a => {
      html += `
        <button class="mini-day" data-date="${a.data}">
          <span class="mini-day-num">${a.data.slice(-2)}</span>
          <span class="mini-day-dot"></span>
        </button>
      `;
    });
    html += `</div>`;
    html += `<p class="small-text muted" style="margin-top:4px;">Tocca un giorno per vedere chi è assente.</p>`;
  }

  html += `
    <div style="margin-top:8px;">
      <button id="btnVediTuttiAssenti" class="btn-secondary small">Vedi tutti gli assenti</button>
    </div>
  `;

  cardAssenzeBody.innerHTML = html;

  // Eventi mini calendario
  cardAssenzeBody.querySelectorAll(".mini-day").forEach(btn => {
    btn.addEventListener("click", () => {
      const date = btn.getAttribute("data-date");
      mostraAssentiPerGiorno(date);
    });
  });

  const btnAll = cardAssenzeBody.querySelector("#btnVediTuttiAssenti");
  if (btnAll) {
    btnAll.addEventListener("click", () => {
      alert("Demo: in futuro qui verrà aperta la lista completa degli assenti, filtrabile per giorno.");
    });
  }
}

function mostraAssentiPerGiorno(isoDate) {
  const lista = getAssentiByDate(isoDate);
  if (lista.length === 0) {
    alert(`Nessun assente per il giorno ${formatDateIT(isoDate)} (demo).`);
    return;
  }
  const righe = lista
    .map(a => {
      const tipoLabel =
        a.tipo === "ferie" ? "Ferie" :
        a.tipo === "permesso" ? "Permesso" :
        "Malattia";
      return `• ${a.nome} – ${tipoLabel}`;
    })
    .join("\n");
  alert(`Assenti il ${formatDateIT(isoDate)}:\n\n${righe}`);
}

// ======================================================
// TURNI
// ======================================================
function initTurnoOggi() {
  if (!turnoOrarioChip) return;
  const oggi = turniFarmacie.find(t => t.tipoRange === "oggi");
  if (!oggi) return;

  turnoOrarioChip.textContent = oggi.orario;
  if (turnoNome) turnoNome.textContent = oggi.principale;
  if (turnoIndirizzo) {
    turnoIndirizzo.innerHTML = `Via Esempio 12, Matera<br />Tel: ${oggi.telefono}`;
  }
  if (turnoAppoggio) turnoAppoggio.textContent = oggi.appoggio;

  if (turnoOggiNome) turnoOggiNome.textContent = oggi.principale;
  if (turnoOggiIndirizzo) turnoOggiIndirizzo.textContent = "Via Esempio 12, Matera";
  if (turnoOggiTelefono) turnoOggiTelefono.textContent = `Tel: ${oggi.telefono}`;
  if (turnoOggiOrario) turnoOggiOrario.textContent = oggi.orario;
  if (turnoOggiAppoggioNome) turnoOggiAppoggioNome.textContent = oggi.appoggio;
  if (turnoOggiAppoggioDettagli) {
    turnoOggiAppoggioDettagli.textContent = "Via Dante 8, Matera – Tel: 0835 111111";
  }
}

function renderTurniTable() {
  if (!turniRowsContainer) return;

  const meseFilter = turniMeseSelect ? turniMeseSelect.value : "all";
  const farmaciaFilter = turniFarmaciaSelect ? turniFarmaciaSelect.value : "all";

  let filtered = turniFarmacie.filter(t => t.tipoRange === currentTurniView);

  if (meseFilter !== "all") {
    filtered = filtered.filter(t => t.mese === Number(meseFilter));
  }
  if (farmaciaFilter !== "all") {
    filtered = filtered.filter(t => t.principale === farmaciaFilter);
  }

  turniRowsContainer.innerHTML = "";

  if (filtered.length === 0) {
    const row = document.createElement("div");
    row.className = "turni-row";
    row.innerHTML = "<span>Nessun turno per i filtri selezionati.</span>";
    turniRowsContainer.appendChild(row);
    return;
  }

  filtered.forEach(t => {
    const row = document.createElement("div");
    row.className = "turni-row";

    let tipoPillClass = "normale";
    const noteLower = t.note.toLowerCase();
    if (noteLower.includes("notturno")) tipoPillClass = "notturno";
    if (noteLower.includes("vigilia") || noteLower.includes("festivo")) tipoPillClass = "festivo";

    row.innerHTML = `
      <span>${formatDateIT(t.data)}</span>
      <span>${t.orario}</span>
      <span>${t.principale}</span>
      <span>${t.appoggio}</span>
      <span>${t.telefono}</span>
      <span><span class="turno-type-pill ${tipoPillClass}">${t.note}</span></span>
    `;
    turniRowsContainer.appendChild(row);
  });
}

// ======================================================
// COMUNICAZIONI
// ======================================================
function aggiornaBadgeComunicazioni() {
  if (!badgeTotComunicazioni || !badgeNonLette || !badgeUrgenti) return;
  const tot = comunicazioni.length;
  const nonLette = comunicazioni.filter(c => !c.letta).length;
  const urgenti = comunicazioni.filter(c => c.categoria === "urgente").length;

  badgeTotComunicazioni.textContent = `Totali: ${tot}`;
  badgeNonLette.textContent = `Non lette: ${nonLette}`;
  badgeUrgenti.textContent = `Urgenti: ${urgenti}`;
}

function renderComunicazioni() {
  if (!comunicazioniList) return;

  const cat = filtroCategoria ? filtroCategoria.value : "tutte";
  const soloNonLette = filtroSoloNonLette ? filtroSoloNonLette.checked : false;

  let filtered = [...comunicazioni];

  if (cat !== "tutte") {
    filtered = filtered.filter(c => c.categoria === cat);
  }
  if (soloNonLette) {
    filtered = filtered.filter(c => !c.letta);
  }

  comunicazioniList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small-text";
    empty.textContent = "Nessuna comunicazione per i filtri selezionati (demo).";
    comunicazioniList.appendChild(empty);
    aggiornaBadgeComunicazioni();
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "com-card";

    const pill = document.createElement("div");
    pill.className = `com-pill ${c.categoria}`;
    pill.textContent =
      c.categoria === "urgente"
        ? "URGENTE"
        : c.categoria === "importante"
        ? "IMPORTANTE"
        : "INFORMATIVA";

    const title = document.createElement("div");
    title.className = "com-title";
    title.textContent = c.titolo;

    const meta = document.createElement("div");
    meta.className = "com-meta";
    const stato = c.letta ? "Letta" : "Non letta";
    meta.textContent = `${c.data} · ${c.autore} · ${stato}`;

    const text = document.createElement("div");
    text.className = "com-text";
    text.textContent = c.testo;

    card.appendChild(pill);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(text);

    comunicazioniList.appendChild(card);
  });

  aggiornaBadgeComunicazioni();
}

// Quick “Comunica” dal titolare (da card dashboard)
function apriPopupComunicaRapida() {
  const titolo = prompt("Titolo comunicazione:");
  if (!titolo) return;

  const testo = prompt("Testo comunicazione:");
  if (!testo) return;

  const nuova = {
    id: comunicazioni.length + 1,
    titolo: titolo.trim(),
    categoria: "importante",
    autore: "Titolare",
    data: "Oggi",
    testo: testo.trim(),
    letta: false
  };

  comunicazioni.unshift(nuova);
  alert("✅ Comunicazione registrata (demo). La trovi nella pagina Comunicazioni.");
  renderComunicazioni();
}
// ======================================================
// PROCEDURE
// ======================================================
function renderProcedureList() {
  if (!procedureListContainer) return;

  const term = (currentProcedureSearch || "").trim().toLowerCase();

  let filtered = procedureData.filter(p => {
    const matchReparto =
      currentProcedureFilter === "tutti" || p.reparto === currentProcedureFilter;
    const testoRicerca = (p.titolo + " " + p.testo).toLowerCase();
    const matchTesto = !term || testoRicerca.includes(term);
    return matchReparto && matchTesto;
  });

  procedureListContainer.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small-text";
    empty.textContent = "Nessuna procedura trovata per i filtri impostati (demo).";
    procedureListContainer.appendChild(empty);
    if (procedureDetail) {
      procedureDetail.innerHTML =
        '<p class="small-text muted">Nessuna procedura selezionata.</p>';
    }
    return;
  }

  filtered.forEach(p => {
    const item = document.createElement("div");
    item.className = "proc-item";
    item.dataset.procId = p.id;

    const main = document.createElement("div");
    main.className = "proc-item-main";

    const title = document.createElement("div");
    title.className = "proc-item-title";
    title.textContent = p.titolo;

    const meta = document.createElement("div");
    meta.className = "proc-item-meta";
    const repLabel =
      p.reparto === "cassa"
        ? "Cassa / Banco"
        : p.reparto === "magazzino"
        ? "Magazzino"
        : p.reparto === "servizi"
        ? "Servizi"
        : "Logistica";
    meta.textContent = `${repLabel} · Agg.: ${p.aggiornamento}`;

    main.appendChild(title);
    main.appendChild(meta);

    const tag = document.createElement("div");
    tag.className = "proc-tag";
    tag.textContent = "Apri";

    item.appendChild(main);
    item.appendChild(tag);

    item.addEventListener("click", () => {
      showProcedureDetail(p.id);
    });

    procedureListContainer.appendChild(item);
  });
}

function showProcedureDetail(procId) {
  if (!procedureDetail) return;
  const proc = procedureData.find(p => p.id === procId);
  if (!proc) return;

  const repLabel =
    proc.reparto === "cassa"
      ? "Cassa / Banco"
      : proc.reparto === "magazzino"
      ? "Magazzino"
      : proc.reparto === "servizi"
      ? "Servizi"
      : "Logistica";

  const paragrafi = proc.testo.split("\n").map(row => `<p>${row}</p>`).join("");

  procedureDetail.innerHTML = `
    <h3>${proc.titolo}</h3>
    <p class="small-text">Reparto: <strong>${repLabel}</strong> · Ultimo aggiornamento: <strong>${proc.aggiornamento}</strong></p>
    <div class="divider"></div>
    <div>${paragrafi}</div>
  `;
}

// ======================================================
// LOGISTICA – ARRIVI
// ======================================================
function mostraArriviLogistica() {
  if (arriviLogistica.length === 0) {
    alert("Nessun arrivo registrato (demo).");
    return;
  }
  const righe = arriviLogistica
    .map(a => {
      const flag = a.urgente ? "URGENTE · " : "";
      return `• ${formatDateIT(a.data)} – ${flag}${a.fornitore}: ${a.descrizione}`;
    })
    .join("\n");
  alert(`Arrivi registrati (demo):\n\n${righe}`);
}

function segnalaNuovoArrivo() {
  const fornitore = prompt("Fornitore / corriere:");
  if (!fornitore) return;
  const descrizione = prompt("Descrizione arrivo (espositori, colli, ecc.):");
  if (!descrizione) return;
  const urgente = confirm("Segnare come URGENTE?");

  const nuovo = {
    id: arriviLogistica.length + 1,
    data: todayISO(),
    fornitore: fornitore.trim(),
    descrizione: descrizione.trim(),
    urgente
  };
  arriviLogistica.push(nuovo);
  alert("✅ Arrivo registrato (demo).");

  // Aggiungo anche una notifica demo
  notificationConfig.logistica.notifiche.push({
    id: "log-" + nuovo.id,
    titolo: "Nuovo arrivo registrato",
    testo: `${nuovo.fornitore}: ${nuovo.descrizione}`,
    letto: false
  });
  updateBadgeForCard("logistica");
}

// ======================================================
// MAGAZZINO – SCADENZE / SCORTE / CAMBIO CASSA
// ======================================================
function mostraScadenze() {
  if (scadenzeProdotti.length === 0) {
    alert("Nessun prodotto in scadenza registrato (demo).");
    return;
  }
  const ordinati = [...scadenzeProdotti].sort((a, b) =>
    a.dataScadenza > b.dataScadenza ? 1 : -1
  );
  const righe = ordinati
    .map(p => `• ${formatDateIT(p.dataScadenza)} – ${p.nome}`)
    .join("\n");
  alert(`Prodotti in scadenza (dal più urgente):\n\n${righe}`);
}

function aggiungiScadenza() {
  const nome = prompt("Nome prodotto in scadenza:");
  if (!nome) return;
  const data = prompt("Data scadenza (formato AAAA-MM-GG):");
  if (!data) return;
  scadenzeProdotti.push({
    id: scadenzeProdotti.length + 1,
    nome: nome.trim(),
    dataScadenza: data.trim()
  });
  alert("✅ Prodotto in scadenza aggiunto (demo).");
}

function mostraScorte() {
  if (scorteProdotti.length === 0) {
    alert("Nessuna scorta segnalata (demo).");
    return;
  }
  const righe = scorteProdotti
    .map(p => {
      const urg = p.urgente ? "URGENTE · " : "";
      return `• ${urg}${p.nome} – ${p.note}`;
    })
    .join("\n");
  alert(`Prodotti a scorta (demo):\n\n${righe}`);
}

function aggiungiScorta() {
  const nome = prompt("Nome prodotto da segnalare a scorta:");
  if (!nome) return;
  const note = prompt("Nota (es. Sotto minimo, finito, ecc.):") || "";
  const urgente = confirm("Segnare come URGENTE?");
  scorteProdotti.push({
    id: scorteProdotti.length + 1,
    nome: nome.trim(),
    note: note.trim(),
    urgente
  });
  alert("✅ Prodotto aggiunto alla lista scorte (demo).");
}

function mostraCambioCassa() {
  if (richiesteCambioCassa.length === 0) {
    alert("Nessuna richiesta di cambio cassa (demo).");
    return;
  }
  const righe = richiesteCambioCassa
    .map(r => `• ${r.data} – ${r.richiedente}: ${r.note} (${r.dettagli})`)
    .join("\n");
  alert(`Richieste cambio cassa (demo):\n\n${righe}`);
}

function aggiungiRichiestaCambioCassa() {
  const banco = prompt("Chi richiede il cambio cassa? (es. Banco 1)");
  if (!banco) return;
  const note = prompt("Descrizione richiesta (es. servono monete da 1€ e 2€):");
  if (!note) return;
  const dettagli = prompt("Dettagli banconote/monete (facoltativo):") || "";

  const d = new Date();
  const orario = `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;

  richiesteCambioCassa.push({
    id: richiesteCambioCassa.length + 1,
    richiedente: banco.trim(),
    note: note.trim(),
    dettagli: dettagli.trim(),
    data: orario
  });

  alert("✅ Richiesta cambio cassa registrata (demo).");
}

// ======================================================
// ARCHIVIO FILE – FUNZIONI
// ======================================================
function getFSStorageKey() {
  // archivio distinto per ruolo
  return "fs_montesano_" + (currentRole || "farmacia");
}

function saveFS() {
  try {
    localStorage.setItem(getFSStorageKey(), JSON.stringify(fsRoot));
  } catch (e) {
    console.warn("Impossibile salvare in localStorage", e);
  }
}

function loadFS() {
  if (!archivioGrid) return;

  try {
    const saved = localStorage.getItem(getFSStorageKey());
    if (saved) {
      fsRoot = JSON.parse(saved);
    } else {
      fsRoot = {
        name: "root",
        type: "folder",
        children: [
          { type: "folder", name: "Documenti", children: [] },
          { type: "folder", name: "Foto", children: [] },
          { type: "folder", name: "Procedure", children: [] },
          {
            type: "file",
            name: "Benvenuto.txt",
            content: "Benvenuto nell’Archivio File della Farmacia Montesano!"
          }
        ]
      };
      saveFS();
    }
  } catch (e) {
    console.error("Errore caricando l'FS, resetto.", e);
    fsRoot = {
      name: "root",
      type: "folder",
      children: []
    };
    saveFS();
  }
  currentFolder = fsRoot;
}

function getParentOf(target, node = fsRoot, parent = null) {
  if (!node) return null;
  if (node === target) return parent;
  if (node.type === "folder" && node.children) {
    for (const child of node.children) {
      const found = getParentOf(target, child, node);
      if (found) return found;
    }
  }
  return null;
}

function getPathArray(target) {
  if (!target || !fsRoot) return [];
  const path = [];

  function helper(node, stack) {
    if (node === target) {
      path.push(...stack, node.name);
      return true;
    }
    if (node.type === "folder" && node.children) {
      for (const child of node.children) {
        if (helper(child, [...stack, node.name])) return true;
      }
    }
    return false;
  }

  helper(fsRoot, []);
  return path;
}

function ensureUniqueName(base, list) {
  let name = base;
  let counter = 1;

  while (list.some(i => i.name === name)) {
    const parts = base.split(".");
    if (parts.length > 1) {
      const ext = parts.pop();
      name = parts.join(".") + ` (${counter}).` + ext;
    } else {
      name = base + ` (${counter})`;
    }
    counter++;
  }
  return name;
}

function getFileIconClass(item) {
  if (item.type === "folder") return "folder";
  const parts = item.name.split(".");
  if (parts.length < 2) return "";
  const ext = parts.pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) return "image";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["txt", "log"].includes(ext)) return "txt";
  return "";
}

function clearSelection() {
  if (lastSelectedEl) lastSelectedEl.classList.remove("selected");
  lastSelectedEl = null;
  selectedItem = null;
}

function openFolder(item) {
  if (!item || item.type !== "folder") return;
  currentFolder = item;
  clearSelection();
  renderArchivio();
}

function createNewFolder() {
  if (!currentFolder || currentFolder.type !== "folder") return;
  const base = "Nuova cartella";
  const name = ensureUniqueName(base, currentFolder.children || []);
  currentFolder.children.push({
    type: "folder",
    name,
    children: []
  });
  saveFS();
  renderArchivio();
}

function goUpFolder() {
  if (!currentFolder || currentFolder === fsRoot) return;
  const parent = getParentOf(currentFolder);
  if (parent) {
    currentFolder = parent;
    clearSelection();
    renderArchivio();
  }
}

function handleUpload(files) {
  if (!currentFolder || currentFolder.type !== "folder") return;
  const arr = Array.from(files || []);
  if (arr.length === 0) return;

  currentFolder.children = currentFolder.children || [];

  arr.forEach(file => {
    const name = ensureUniqueName(file.name, currentFolder.children);
    currentFolder.children.push({
      type: "file",
      name,
      size: file.size,
      lastModified: file.lastModified
    });
  });

  saveFS();
  renderArchivio();
}

function openContextMenu(x, y, item, el) {
  if (!archivioContextMenu) return;
  clearSelection();
  selectedItem = item;
  lastSelectedEl = el;
  el.classList.add("selected");

  archivioContextMenu.style.left = x + "px";
  archivioContextMenu.style.top = y + "px";
  archivioContextMenu.classList.remove("hidden");

  if (menuIncolla) {
    menuIncolla.classList.toggle("disabled", !clipboardItem);
  }
}

function closeContextMenu() {
  if (!archivioContextMenu) return;
  archivioContextMenu.classList.add("hidden");
}

function renameSelected() {
  if (!selectedItem) return;
  const nuovoNome = prompt("Nuovo nome", selectedItem.name);
  if (!nuovoNome || !nuovoNome.trim()) return;
  const siblings = currentFolder.children || [];
  selectedItem.name = ensureUniqueName(
    nuovoNome.trim(),
    siblings.filter(i => i !== selectedItem)
  );
  saveFS();
  renderArchivio();
}

function deleteSelected() {
  if (!selectedItem || !currentFolder || !currentFolder.children) return;
  if (!confirm(`Eliminare "${selectedItem.name}"?`)) return;
  currentFolder.children = currentFolder.children.filter(i => i !== selectedItem);
  saveFS();
  clearSelection();
  renderArchivio();
}

function copySelected() {
  if (!selectedItem) return;
  clipboardItem = JSON.parse(JSON.stringify(selectedItem));
}

function pasteClipboard() {
  if (!clipboardItem || !currentFolder || currentFolder.type !== "folder") return;
  currentFolder.children = currentFolder.children || [];
  const clone = JSON.parse(JSON.stringify(clipboardItem));
  clone.name = ensureUniqueName(clone.name, currentFolder.children);
  currentFolder.children.push(clone);
  saveFS();
  renderArchivio();
}

function downloadSelected() {
  if (!selectedItem || selectedItem.type !== "file") return;
  alert("Download demo: in futuro potrai scaricare davvero il file.");
}

function renderArchivio() {
  if (!archivioGrid || !currentFolder) return;

  currentFolder.children = currentFolder.children || [];

  currentFolder.children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });

  const pathArr = getPathArray(currentFolder);
  if (archivioPath) {
    archivioPath.textContent = "/" + pathArr.join("/");
  }

  archivioGrid.innerHTML = "";

  if (currentFolder.children.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small-text";
    empty.textContent = "Nessun file in questa cartella.";
    archivioGrid.appendChild(empty);
    return;
  }

  currentFolder.children.forEach(item => {
    const el = document.createElement("div");
    el.className = "file-item";

    const icon = document.createElement("div");
    icon.className = "file-icon " + getFileIconClass(item);
    icon.textContent = item.type === "folder" ? "📁" : "📄";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = item.name;

    el.appendChild(icon);
    el.appendChild(name);
    archivioGrid.appendChild(el);

    el.addEventListener("click", e => {
      e.stopPropagation();
      clearSelection();
      selectedItem = item;
      lastSelectedEl = el;
      el.classList.add("selected");
    });

    el.addEventListener("dblclick", () => {
      if (item.type === "folder") {
        openFolder(item);
      } else {
        alert("File demo: in futuro potrai aprirlo o scaricarlo.");
      }
    });

    el.addEventListener("contextmenu", e => {
      e.preventDefault();
      openContextMenu(e.pageX, e.pageY, item, el);
    });

    let touchTimer = null;
    el.addEventListener("touchstart", e => {
      touchTimer = setTimeout(() => {
        const touch = e.touches[0];
        openContextMenu(touch.clientX, touch.clientY, item, el);
      }, 600);
    });
    el.addEventListener("touchend", () => {
      if (touchTimer) clearTimeout(touchTimer);
    });
    el.addEventListener("touchmove", () => {
      if (touchTimer) clearTimeout(touchTimer);
    });
  });
}
// ======================================================
// NOTIFICHE – BADGE E POPUP
// ======================================================
function getUnreadNotifications(cardKey) {
  const cfg = notificationConfig[cardKey];
  if (!cfg) return [];
  return cfg.notifiche.filter(n => !n.letto);
}

function updateBadgeForCard(cardKey) {
  const badge = document.querySelector(`.card-badge[data-card-key="${cardKey}"]`);
  const label = document.querySelector(`.card-badge-label[data-card-key="${cardKey}"]`);
  if (!badge) return;

  const unread = getUnreadNotifications(cardKey);
  const count = unread.length;
  const countSpan = badge.querySelector(".badge-count");

  if (count > 0) {
    if (countSpan) countSpan.textContent = String(count);
    badge.classList.add("has-unread");
    badge.style.display = "flex";
    if (label) {
      label.textContent = count === 1 ? "Nuovo" : "Nuovi";
      label.style.display = "block";
    }
  } else {
    if (countSpan) countSpan.textContent = "";
    badge.classList.remove("has-unread");
    badge.style.display = "none";
    if (label) {
      label.textContent = "";
      label.style.display = "none";
    }
  }
}

function initNotificationBadges() {
  Object.keys(notificationConfig).forEach(key => updateBadgeForCard(key));
}

function openNotificationPopup(cardKey) {
  const cfg = notificationConfig[cardKey];
  if (!cfg || !notifOverlay || !notifList || !notifTitle || !notifIntro) return;

  openNotificationCardKey = cardKey;

  const unread = getUnreadNotifications(cardKey);
  notifTitle.textContent = cfg.titolo;

  if (unread.length === 0) {
    notifIntro.textContent = cfg.descrizioneVuota;
  } else if (unread.length === 1) {
    notifIntro.textContent = "Hai 1 nuova notifica.";
  } else {
    notifIntro.textContent = `Hai ${unread.length} nuove notifiche.`;
  }

  notifList.innerHTML = "";

  if (unread.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small-text";
    empty.textContent = cfg.descrizioneVuota;
    notifList.appendChild(empty);
  } else {
    unread.forEach(n => {
      const item = document.createElement("div");
      item.className = "notif-item";
      item.dataset.notifId = n.id;

      const textWrap = document.createElement("div");
      textWrap.className = "notif-text";

      const h3 = document.createElement("h3");
      h3.textContent = n.titolo;

      const p = document.createElement("p");
      p.textContent = n.testo;

      textWrap.appendChild(h3);
      textWrap.appendChild(p);

      const btn = document.createElement("button");
      btn.className = "btn-primary small";
      btn.textContent = "Presa visione";
      btn.addEventListener("click", () => {
        markNotificationAsRead(cardKey, n.id);
      });

      item.appendChild(textWrap);
      item.appendChild(btn);

      notifList.appendChild(item);
    });
  }

  notifOverlay.classList.remove("hidden");
  notifOverlay.classList.add("active");
}

function closeNotificationPopup() {
  if (!notifOverlay) return;
  notifOverlay.classList.add("hidden");
  notifOverlay.classList.remove("active");
  openNotificationCardKey = null;
}

function markNotificationAsRead(cardKey, notifId) {
  const cfg = notificationConfig[cardKey];
  if (!cfg) return;
  const n = cfg.notifiche.find(x => x.id === notifId);
  if (!n || n.letto) return;

  n.letto = true;

  if (openNotificationCardKey === cardKey) {
    openNotificationPopup(cardKey);
  }

  updateBadgeForCard(cardKey);
}

// ======================================================
// DOM READY – INIZIALIZZAZIONE
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  // ----- ELEMENTI BASE -----
  authContainer = document.getElementById("authContainer");
  app = document.getElementById("app");

  loginForm = document.getElementById("loginForm");
  loginRoleLabel = document.getElementById("loginRoleLabel");
  authTabs = document.querySelectorAll(".auth-tab");

  // Sezioni
  dashboardSection = document.getElementById("dashboard");
  assenzePage = document.getElementById("assenzePage");
  turniPage = document.getElementById("turniPage");
  comunicazioniPage = document.getElementById("comunicazioniPage");
  procedurePage = document.getElementById("procedurePage");
  archivioPage = document.getElementById("archivioPage");

  // Sidebar
  sidebar = document.getElementById("sidebar");
  hamburger = document.getElementById("hamburger");
  closeSidebar = document.getElementById("closeSidebar");
  logoutBtn = document.getElementById("logoutBtn");

  rolePill = document.getElementById("currentRolePill");
  assenzeTitle = document.getElementById("assenzeTitle");

  // Dashboard: turno card
  turnoOrarioChip = document.getElementById("turnoOrarioChip");
  turnoNome = document.getElementById("turnoNome");
  turnoIndirizzo = document.getElementById("turnoIndirizzo");
  turnoAppoggio = document.getElementById("turnoAppoggio");

  // Turni pagina
  turnoOggiNome = document.getElementById("turnoOggiNome");
  turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
  turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
  turnoOggiOrario = document.getElementById("turnoOggiOrario");
  turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
  turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

  turniTabs = document.querySelectorAll(".turni-tab");
  turniRowsContainer = document.getElementById("turniRows");
  turniMeseSelect = document.getElementById("turniMeseSelect");
  turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  // Bottoni dashboard -> pagine
  openAssenzeBtn = document.getElementById("openAssenze");
  backFromAssenzeBtn = document.getElementById("backFromAssenze");
  openTurniBtn = document.getElementById("openTurni");
  backFromTurniBtn = document.getElementById("backFromTurni");
  openComunicazioniBtn = document.getElementById("openComunicazioni");
  backFromComunicazioniBtn = document.getElementById("backFromComunicazioni");
  openProcedureBtn = document.getElementById("openProcedure");
  backFromProcedureBtn = document.getElementById("backFromProcedure");
  openArchivioBtn = document.getElementById("openArchivio");
  backFromArchivioBtn = document.getElementById("backFromArchivio");

  // Comunicazioni
  comunicazioniList = document.getElementById("comunicazioniList");
  filtroCategoria = document.getElementById("filtroCategoria");
  filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
  comunicazioneForm = document.getElementById("comunicazioneForm");
  comunicazioneFeedback = document.getElementById("comunicazioneFeedback");
  badgeTotComunicazioni = document.getElementById("badgeTotComunicazioni");
  badgeNonLette = document.getElementById("badgeNonLette");
  badgeUrgenti = document.getElementById("badgeUrgenti");

  // Assenze
  assenzeForm = document.querySelector(".assenze-form");
  assenzeFeedback = document.getElementById("assenzeFeedback");

  // Procedure
  procedureSearchInput = document.getElementById("procedureSearch");
  procedureFilterButtons = document.querySelectorAll(".proc-filter-btn");
  procedureListContainer = document.getElementById("procedureList");
  procedureDetail = document.getElementById("procedureDetail");

  // Archivio
  archivioGrid = document.getElementById("archivioGrid");
  archivioPath = document.getElementById("archivioPath");
  archivioUpload = document.getElementById("archivioUpload");
  archivioBtnUpload = document.getElementById("archivioBtnUpload");
  archivioUpBtn = document.getElementById("archivioUp");
  archivioNewFolderBtn = document.getElementById("archivioNewFolder");
  archivioContextMenu = document.getElementById("archivioContextMenu");
  menuNuova = document.getElementById("menuNuova");
  menuRinomina = document.getElementById("menuRinomina");
  menuElimina = document.getElementById("menuElimina");
  menuCopia = document.getElementById("menuCopia");
  menuIncolla = document.getElementById("menuIncolla");
  menuDownload = document.getElementById("menuDownload");

  // Notifiche overlay
  notifOverlay = document.getElementById("notificationOverlay");
  notifTitle = document.getElementById("notifTitle");
  notifIntro = document.getElementById("notifIntro");
  notifList = document.getElementById("notifList");
  notifClose = document.getElementById("notifClose");
  notifCloseBottom = document.getElementById("notifCloseBottom");

  // ====== LOGIN ======
  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const role = tab.dataset.role;
      loginRoleLabel.textContent =
        role === "farmacia"
          ? "Farmacia"
          : role === "titolare"
          ? "Titolare"
          : "Dipendente";
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const activeTab = document.querySelector(".auth-tab.active");
      const role = activeTab ? activeTab.dataset.role : "farmacia";
      setRole(role);
      authContainer.classList.add("hidden");
      app.classList.remove("hidden");
      showSection(dashboardSection);
      initNotificationBadges();
      initTurnoOggi();

      // archivio inizializzato sul ruolo corrente
      loadFS();
      renderArchivio();
    });
  }

  // ====== SIDEBAR / NAV ======
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  document.addEventListener("click", e => {
    if (
      sidebar &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== hamburger
    ) {
      sidebar.classList.remove("open");
    }
  });

  if (sidebar) {
    sidebar.querySelectorAll("li[data-nav]").forEach(item => {
      item.addEventListener("click", () => {
        const target = item.dataset.nav;
        if (target === "dashboard") showSection(dashboardSection);
        if (target === "assenzePage") showSection(assenzePage);
        if (target === "turniPage") {
          showSection(turniPage);
          renderTurniTable();
        }
        if (target === "comunicazioniPage") {
          showSection(comunicazioniPage);
          renderComunicazioni();
        }
        if (target === "procedurePage") {
          showSection(procedurePage);
          renderProcedureList();
        }
        if (target === "archivioPage") {
          showSection(archivioPage);
          renderArchivio();
        }
        sidebar.classList.remove("open");
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");
      loginForm && loginForm.reset();
      authTabs.forEach(t => t.classList.remove("active"));
      if (authTabs[0]) authTabs[0].classList.add("active");
      loginRoleLabel.textContent = "Farmacia";
      setRole("farmacia");
    });
  }

  // ====== NAVIGAZIONE BOTTONI DASHBOARD ======
  function showSection(section) {
    const all = [
      dashboardSection,
      assenzePage,
      turniPage,
      comunicazioniPage,
      procedurePage,
      archivioPage
    ];
    all.forEach(sec => sec && sec.classList.add("hidden"));
    if (section) section.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  if (openAssenzeBtn)
    openAssenzeBtn.addEventListener("click", () => showSection(assenzePage));
  if (backFromAssenzeBtn)
    backFromAssenzeBtn.addEventListener("click", () =>
      showSection(dashboardSection)
    );

  if (openTurniBtn)
    openTurniBtn.addEventListener("click", () => {
      showSection(turniPage);
      renderTurniTable();
    });
  if (backFromTurniBtn)
    backFromTurniBtn.addEventListener("click", () =>
      showSection(dashboardSection)
    );

  if (openComunicazioniBtn)
    openComunicazioniBtn.addEventListener("click", () => {
      if (currentRole === "titolare") {
        // tasto "Comunica" = popup rapida
        apriPopupComunicaRapida();
      } else {
        showSection(comunicazioniPage);
        renderComunicazioni();
      }
    });
  if (backFromComunicazioniBtn)
    backFromComunicazioniBtn.addEventListener("click", () =>
      showSection(dashboardSection)
    );

  if (openProcedureBtn)
    openProcedureBtn.addEventListener("click", () => {
      showSection(procedurePage);
      renderProcedureList();
    });
  if (backFromProcedureBtn)
    backFromProcedureBtn.addEventListener("click", () =>
      showSection(dashboardSection)
    );

  if (openArchivioBtn)
    openArchivioBtn.addEventListener("click", () => {
      showSection(archivioPage);
      renderArchivio();
    });
  if (backFromArchivioBtn)
    backFromArchivioBtn.addEventListener("click", () =>
      showSection(dashboardSection)
    );

  // ====== TURNI EVENTI ======
  if (turniTabs) {
    turniTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        turniTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentTurniView = tab.dataset.view || "oggi";
        renderTurniTable();
      });
    });
  }
  if (turniMeseSelect) turniMeseSelect.addEventListener("change", renderTurniTable);
  if (turniFarmaciaSelect)
    turniFarmaciaSelect.addEventListener("change", renderTurniTable);

  // ====== COMUNICAZIONI EVENTI ======
  if (filtroCategoria)
    filtroCategoria.addEventListener("change", renderComunicazioni);
  if (filtroSoloNonLette)
    filtroSoloNonLette.addEventListener("change", renderComunicazioni);

  if (comunicazioneForm && comunicazioneFeedback) {
    comunicazioneForm.addEventListener("submit", e => {
      e.preventDefault();

      const titoloInput = document.getElementById("comTitolo");
      const categoriaSelect = document.getElementById("comCategoria");
      const testoInput = document.getElementById("comTesto");

      const titolo = titoloInput.value.trim();
      const categoria = categoriaSelect.value;
      const testo = testoInput.value.trim();

      if (!titolo || !testo) {
        comunicazioneFeedback.textContent =
          "⚠️ Inserisci almeno un titolo e un testo.";
        comunicazioneFeedback.classList.remove("hidden");
        return;
      }

      const nuova = {
        id: comunicazioni.length + 1,
        titolo,
        categoria,
        autore: currentRole === "titolare" ? "Titolare" : "Demo utente",
        data: "Oggi",
        testo,
        letta: false
      };

      comunicazioni.unshift(nuova);

      comunicazioneFeedback.textContent =
        "✅ Comunicazione registrata (demo). In futuro sarà salvata su server.";
      comunicazioneFeedback.classList.remove("hidden");

      comunicazioneForm.reset();
      renderComunicazioni();
    });
  }

  // ====== ASSENZE FORM ======
  if (assenzeForm && assenzeFeedback) {
    assenzeForm.addEventListener("submit", e => {
      e.preventDefault();
      assenzeFeedback.classList.remove("hidden");
      assenzeFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // ====== PROCEDURE EVENTI ======
  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", e => {
      currentProcedureSearch = e.target.value || "";
      renderProcedureList();
    });
  }

  if (procedureFilterButtons) {
    procedureFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        procedureFilterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentProcedureFilter = btn.getAttribute("data-reparto") || "tutti";
        renderProcedureList();
      });
    });
  }

  // ====== ARCHIVIO EVENTI ======
  if (archivioBtnUpload && archivioUpload) {
    archivioBtnUpload.addEventListener("click", () => {
      archivioUpload.click();
    });
    archivioUpload.addEventListener("change", e => {
      handleUpload(e.target.files);
      archivioUpload.value = "";
    });
  }

  if (archivioNewFolderBtn) {
    archivioNewFolderBtn.addEventListener("click", () => {
      createNewFolder();
    });
  }

  if (archivioUpBtn) {
    archivioUpBtn.addEventListener("click", () => {
      goUpFolder();
    });
  }

  if (archivioGrid) {
    archivioGrid.addEventListener("click", () => {
      clearSelection();
      closeContextMenu();
    });
  }

  if (menuNuova)
    menuNuova.addEventListener("click", () => {
      createNewFolder();
      closeContextMenu();
    });
  if (menuRinomina)
    menuRinomina.addEventListener("click", () => {
      renameSelected();
      closeContextMenu();
    });
  if (menuElimina)
    menuElimina.addEventListener("click", () => {
      deleteSelected();
      closeContextMenu();
    });
  if (menuCopia)
    menuCopia.addEventListener("click", () => {
      copySelected();
      closeContextMenu();
    });
  if (menuIncolla)
    menuIncolla.addEventListener("click", () => {
      pasteClipboard();
      closeContextMenu();
    });
  if (menuDownload)
    menuDownload.addEventListener("click", () => {
      downloadSelected();
      closeContextMenu();
    });

  document.addEventListener("click", e => {
    if (
      archivioContextMenu &&
      !archivioContextMenu.classList.contains("hidden") &&
      !archivioContextMenu.contains(e.target)
    ) {
      closeContextMenu();
    }
  });

  // ====== NOTIFICHE EVENTI ======
  document.querySelectorAll(".js-card-badge").forEach(badge => {
    const key = badge.getAttribute("data-card-key");
    badge.addEventListener("click", e => {
      e.stopPropagation();
      openNotificationPopup(key);
    });
  });

  if (notifClose) notifClose.addEventListener("click", closeNotificationPopup);
  if (notifCloseBottom)
    notifCloseBottom.addEventListener("click", closeNotificationPopup);
  if (notifOverlay) {
    notifOverlay.addEventListener("click", e => {
      if (
        e.target === notifOverlay ||
        e.target.classList.contains("notif-backdrop")
      ) {
        closeNotificationPopup();
      }
    });
  }

  // ====== LOGISTICA / MAGAZZINO EVENTI ======
  const logisticaBtn = document.querySelector(
    ".card-logistica .card-footer button"
  );
  if (logisticaBtn) {
    logisticaBtn.addEventListener("click", () => {
      const scelta = confirm(
        "OK = Segnala nuovo arrivo\nAnnulla = Visualizza arrivi registrati"
      );
      if (scelta) {
        segnalaNuovoArrivo();
      } else {
        mostraArriviLogistica();
      }
    });
  }

  if (cardMagazzinoBody) {
    cardMagazzinoBody.addEventListener("click", e => {
      const btn = e.target.closest("[data-mag-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-mag-action");
      if (action === "scadenze") {
        const scelta = confirm(
          "OK = Aggiungi nuovo prodotto in scadenza\nAnnulla = Visualizza elenco scadenze"
        );
        if (scelta) aggiungiScadenza();
        else mostraScadenze();
      }
      if (action === "scorte") {
        const scelta = confirm(
          "OK = Aggiungi prodotto a scorta\nAnnulla = Visualizza scorte segnalate"
        );
        if (scelta) aggiungiScorta();
        else mostraScorte();
      }
      if (action === "cambio") {
        const scelta = confirm(
          "OK = Aggiungi richiesta cambio cassa\nAnnulla = Visualizza richieste esistenti"
        );
        if (scelta) aggiungiRichiestaCambioCassa();
        else mostraCambioCassa();
      }
    });
  }

  // ====== INIT DI BASE (senza login) ======
  renderDashboardPerRole();
  renderComunicazioni();
  renderProcedureList();
  initNotificationBadges();
});
