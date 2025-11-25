/* ============================================================
   PORTALE FARMACIA MONTESANO
   SCRIPT COMPLETO – PARTE 1/7
   Ruoli: Titolare · Farmacia · Dipendente · Cliente
   ============================================================ */

/* -----------------------------------------------
   VARIABILI GLOBALI
------------------------------------------------ */
let currentRole = "farmacia";

/* Elementi login */
let authContainer, loginForm, loginRoleLabel;

/* Elementi app */
let app, sidebar, hamburger, closeSidebar;
let dashboardSection, assenzePage, turniPage, comunicazioniPage, procedurePage, archivioPage;

/* Dashboard – card */
let cardAssenze, cardTurno, cardComunicazioni, cardProcedure;
let cardLogistica, cardMagazziniera, cardCassa, cardArchivio;

/* Sidebar – voci */
let navAssenze, navTurni, navComunicazioni, navProcedure, navArchivio;

/* Dashboard – elementi specifici */
let assenzeTitle, openComunicazioniBtn, btnApriPopupComunica;
let openAssenzeBtn;
let turnoNome, turnoIndirizzo, turnoAppoggio, turnoOrario;

/* Mini calendario card assenze */
let miniCalButtons, miniCalInfo;

/* Popup notifiche */
let notifOverlay, notifClose, notifCloseBottom, notifTitle, notifIntro, notifList;

/* Popup comunicazione rapida */
let comunicaOverlay, comunicaClose, comunicaPopupForm, comunicaPopupFeedback;

/* Archivio file */
let archivioGrid, archivioPathLabel, archivioUp, archivioNewFolder;
let archivioUpload, archivioBtnUpload;

/* Variabili archivio (demo) */
let archivioPercorso = ["/root"];
let archivioStruttura = {
  "/root": {
    type: "folder",
    children: {
      "Documenti": { type: "folder", children: {} },
      "Promemoria.txt": { type: "txt" },
      "Fornitori.pdf": { type: "pdf" }
    }
  }
};

/* ------------------------------------------------
   DATI DEMO – Comunicazioni, Assenze, Arrivi, Scadenze
--------------------------------------------------- */

/* Comunicazioni DEMO */
let comunicazioni = [
  {
    id: 1,
    titolo: "Nuova procedura notturni",
    categoria: "urgente",
    autore: "Direzione",
    data: "Oggi",
    testo: "Aggiornata gestione turni notturni (demo)",
    letta: false
  },
  {
    id: 2,
    titolo: "Verifica armadietto stupefacenti",
    categoria: "importante",
    autore: "Titolare",
    data: "Ieri",
    testo: "Controllare registro stupefacenti entro fine turno.",
    letta: false
  }
];

/* Assenze DEMO */
let assenzeDemo = {
  oggi: ["Mario Rossi (ferie)"],
  prossimi: {
    "17": ["Patrizia – ferie"],
    "19": ["Cosimo – permesso"],
    "21": ["Annalisa – ferie"]
  }
};

/* Arrivi DEMO */
let arriviDemo = [
  { prodotto: "Aspirina Bayer", ora: "10:40" },
  { prodotto: "Benagol limone", ora: "09:25" },
  { prodotto: "Enterogermina 10 fl", ora: "08:55" }
];

/* Scadenze DEMO */
let scadenzeDemo = [
  { prodotto: "Tachipirina 500mg", data: "05/01/2026", urgente: true },
  { prodotto: "Aspirina 500mg", data: "20/02/2026", urgente: false },
  { prodotto: "Maalox sospensione", data: "28/03/2026", urgente: false }
];

/* Scorte DEMO */
let scorteDemo = [
  { prodotto: "Rotoli POS", urgente: true },
  { prodotto: "Bicchierini", urgente: false },
  { prodotto: "Toner Brother", urgente: true }
];

/* ------------------------------------------------
   FUNZIONE DI SELEZIONE RUOLI
--------------------------------------------------- */
function setRole(role) {
  currentRole = role;

  // pill in alto nella dashboard
  if (rolePill) {
    if (role === "farmacia") {
      rolePill.textContent = "Farmacia (accesso generico)";
    } else if (role === "titolare") {
      rolePill.textContent = "Titolare";
    } else if (role === "dipendente") {
      rolePill.textContent = "Dipendente";
    } else if (role === "cliente") {
      rolePill.textContent = "Cliente / Utente esterno";
    } else {
      rolePill.textContent = role;
    }
  }

  // salvo il ruolo sul body (utile per CSS se serve)
  if (document.body) {
    document.body.dataset.role = role;
  }

  // titolo pagina assenze
  if (assenzeTitle) {
    if (role === "dipendente") {
      assenzeTitle.textContent = "Le mie assenze";
    } else if (role === "titolare") {
      assenzeTitle.textContent = "Assenti di oggi e prossimi giorni";
    } else {
      assenzeTitle.textContent = "Assenze del personale";
    }
  }

  // --- TESTI CARD ASSENZE (dashboard) ---
  const assenzeCard = document.querySelector(".card-assenze");
  if (assenzeCard) {
    const caption = assenzeCard.querySelector(".caption");
    const small = assenzeCard.querySelector(".small-text");

    if (role === "titolare") {
      if (caption) {
        caption.textContent = "Vedi subito chi è assente oggi e nei prossimi giorni.";
      }
      if (small) {
        small.textContent = "Apri il calendario, tocca un giorno e controlla tutti gli assenti.";
      }
      const btnAssenze = document.getElementById("openAssenze");
      if (btnAssenze) btnAssenze.textContent = "Vedi tutti gli assenti";
    } else if (role === "dipendente") {
      if (caption) {
        caption.textContent = "Le tue ferie, permessi e assenze.";
      }
      if (small) {
        small.textContent = "Richiedi ferie/permessi e guarda lo stato delle tue richieste.";
      }
      const btnAssenze = document.getElementById("openAssenze");
      if (btnAssenze) btnAssenze.textContent = "Le mie assenze";
    } else {
      // farmacia / altri
      if (caption) {
        caption.textContent = "Panoramica sulle assenze del personale.";
      }
      if (small) {
        small.textContent = "Consulta calendario, richieste e stato assenze.";
      }
      const btnAssenze = document.getElementById("openAssenze");
      if (btnAssenze) btnAssenze.textContent = "Vai a Assenze";
    }
  }

  // --- TESTI CARD TURNI (dashboard) ---
  const turnoCard = document.querySelector(".card-turno");
  if (turnoCard) {
    const title = turnoCard.querySelector("h2");
    const smalls = turnoCard.querySelectorAll(".small-text");
    if (role === "titolare") {
      if (title) title.textContent = "Farmacie di turno (oggi)";
      // il primo small-text è già gestito dai dati demo, lasciamo
    } else if (role === "cliente") {
      if (title) title.textContent = "Farmacia di turno per i clienti";
    } else {
      if (title) title.textContent = "Farmacia di turno";
    }
  }

  // --- CARD LOGISTICA -> ARRIVI / CORRIERI ---
  const logisticaCard = document.querySelector(".card-logistica");
  if (logisticaCard) {
    const title = logisticaCard.querySelector("h2");
    const bodyText = logisticaCard.querySelector(".small-text");
    const footerBtn = logisticaCard.querySelector(".card-footer button");

    if (role === "titolare" || role === "farmacia") {
      if (title) title.textContent = "Arrivi / Corrieri";
      if (bodyText) {
        bodyText.textContent =
          "Segna gli arrivi di corrieri, espositori e materiale. Tieni traccia di cosa è previsto oggi.";
      }
      if (footerBtn) {
        footerBtn.textContent = "Visualizza e segnala arrivo";
      }
    } else {
      // dipendente / cliente: testo più semplice
      if (title) title.textContent = "Logistica (arrivi)";
      if (bodyText) {
        bodyText.textContent = "Consulta gli arrivi previsti (demo).";
      }
      if (footerBtn) {
        footerBtn.textContent = "In arrivo";
      }
    }
  }

  // --- CARD MAGAZZINIERE -> SCADENZE / SCORTE ---
  const magazzinoCard = document.querySelector(".card-magazziniera");
  if (magazzinoCard) {
    const title = magazzinoCard.querySelector("h2");
    const bodyText = magazzinoCard.querySelector(".small-text");
    const footerBtn = magazzinoCard.querySelector(".card-footer button");

    if (role === "titolare" || role === "farmacia") {
      if (title) title.textContent = "Scadenze & Scorte";
      if (bodyText) {
        bodyText.textContent =
          "Visualizza prodotti in scadenza e segnala le scorte critiche (URGENTE).";
      }
      if (footerBtn) {
        footerBtn.textContent = "Visualizza scadenze e scorte";
      }
    } else if (role === "dipendente") {
      if (title) title.textContent = "Magazzino (scorte)";
      if (bodyText) {
        bodyText.textContent =
          "Segnala scorte basse e controlla prodotti in scadenza.";
      }
      if (footerBtn) {
        footerBtn.textContent = "Segna una scorta";
      }
    } else {
      // cliente o altro: card meno dettagliata
      if (title) title.textContent = "Magazzino";
      if (bodyText) {
        bodyText.textContent = "Scorte, scadenze e inventari veloci (demo).";
      }
      if (footerBtn) {
        footerBtn.textContent = "In arrivo";
      }
    }
  }

  // --- CARD COMUNICAZIONI: bottone "Comunica" solo per titolare ---
  const comunicaExtraBtn = document.getElementById("dashboardComunicaBtn");
  if (comunicaExtraBtn) {
    if (role === "titolare") {
      comunicaExtraBtn.style.display = "inline-flex";
    } else {
      comunicaExtraBtn.style.display = "none";
    }
  }

  // --- GESTIONE CLASSI DI RUOLO (per futuro) ---
  document.querySelectorAll(".role-titolare-only").forEach(el => {
    el.style.display = role === "titolare" ? "" : "none";
  });
  document.querySelectorAll(".role-farmacia-only").forEach(el => {
    el.style.display = role === "farmacia" ? "" : "none";
  });
  document.querySelectorAll(".role-dipendente-only").forEach(el => {
    el.style.display = role === "dipendente" ? "" : "none";
  });
  document.querySelectorAll(".role-cliente-only").forEach(el => {
    el.style.display = role === "cliente" ? "" : "none";
  });
}/* ------------------------------------------------
   FUNZIONE MOSTRA SEZIONE
--------------------------------------------------- */
function showSection(section) {
  dashboardSection.classList.add("hidden");
  assenzePage.classList.add("hidden");
  turniPage.classList.add("hidden");
  comunicazioniPage.classList.add("hidden");
  procedurePage.classList.add("hidden");
  archivioPage.classList.add("hidden");

  section.classList.remove("hidden");
}
/* ============================================================
   SCRIPT – PARTE 2/7
   Inizializzazione DOM, login, sidebar, caricamento dashboard
   ============================================================ */

/* ------------------------------------------------
   INIT – prende riferimenti DOM dopo load
--------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  /* LOGIN */
  authContainer = document.getElementById("authContainer");
  loginForm = document.getElementById("loginForm");
  loginRoleLabel = document.getElementById("loginRoleLabel");

  /* APP */
  app = document.getElementById("app");
  sidebar = document.getElementById("sidebar");
  hamburger = document.getElementById("hamburger");
  closeSidebar = document.getElementById("closeSidebar");

  /* SEZIONI */
  dashboardSection = document.getElementById("dashboardSection");
  assenzePage = document.getElementById("assenzePage");
  turniPage = document.getElementById("turniPage");
  comunicazioniPage = document.getElementById("comunicazioniPage");
  procedurePage = document.getElementById("procedurePage");
  archivioPage = document.getElementById("archivioPage");

  /* CARD DASHBOARD */
  cardAssenze = document.getElementById("cardAssenze");
  cardTurno = document.getElementById("cardTurno");
  cardComunicazioni = document.getElementById("cardComunicazioni");
  cardProcedure = document.getElementById("cardProcedure");
  cardLogistica = document.getElementById("cardLogistica");
  cardMagazziniera = document.getElementById("cardMagazziniera");
  cardCassa = document.getElementById("cardCassa");
  cardArchivio = document.getElementById("cardArchivio");

  /* MINI CALENDAR */
  miniCalInfo = document.getElementById("miniCalInfo");
  miniCalButtons = document.querySelectorAll(".mini-cal-day");

  /* NOTIFICHE */
  notifOverlay = document.getElementById("notifOverlay");
  notifClose = document.getElementById("notifClose");
  notifCloseBottom = document.getElementById("notifCloseBottom");
  notifList = document.getElementById("notifList");
  notifTitle = document.getElementById("notifTitle");
  notifIntro = document.getElementById("notifIntro");

  /* POPUP COMUNICA */
  comunicaOverlay = document.getElementById("comunicaOverlay");
  comunicaClose = document.getElementById("comunicaClose");
  comunicaPopupForm = document.getElementById("comunicaForm");
  comunicaPopupFeedback = document.getElementById("comunicaFeedback");

  /* ARCHIVIO */
  archivioGrid = document.getElementById("archivioGrid");
  archivioPathLabel = document.getElementById("archivioPathLabel");
  archivioUp = document.getElementById("archivioUp");
  archivioNewFolder = document.getElementById("archivioNewFolder");
  archivioUpload = document.getElementById("archivioUpload");
  archivioBtnUpload = document.getElementById("archivioBtnUpload");

  /* SIDEBAR NAV */
  navAssenze = document.getElementById("navAssenze");
  navTurni = document.getElementById("navTurni");
  navComunicazioni = document.getElementById("navComunicazioni");
  navProcedure = document.getElementById("navProcedure");
  navArchivio = document.getElementById("navArchivio");

  /* EVENTI SIDEBAR */
  hamburger.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  /* EVENTI NAVIGAZIONE LATERALE */
  navAssenze.addEventListener("click", () => {
    sidebar.classList.remove("open");
    loadAssenzePage();
  });

  navTurni.addEventListener("click", () => {
    sidebar.classList.remove("open");
    loadTurniPage();
  });

  navComunicazioni.addEventListener("click", () => {
    sidebar.classList.remove("open");
    loadComunicazioniPage();
  });

  navProcedure.addEventListener("click", () => {
    sidebar.classList.remove("open");
    loadProcedurePage();
  });

  navArchivio.addEventListener("click", () => {
    sidebar.classList.remove("open");
    loadArchivioPage();
  });

  /* LOGIN SUBMIT */
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });

  /* PULSANTI POPUP NOTIFICHE */
  notifClose.addEventListener("click", closeNotifiche);
  notifCloseBottom.addEventListener("click", closeNotifiche);

  /* PULSANTI POPUP COMUNICA */
  comunicaClose.addEventListener("click", closeComunicaPopup);

  comunicaPopupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitComunicazione();
  });

});

/* ------------------------------------------------
   LOGIN – Switch tra ruoli demo
--------------------------------------------------- */
function handleLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  // RUOLI DEMO
  if (user === "titolare" && pass === "1234") {
    currentRole = "titolare";
  }
  else if (user === "farmacia" && pass === "1234") {
    currentRole = "farmacia";
  }
  else if (user === "dipendente" && pass === "1234") {
    currentRole = "dipendente";
  }
  else if (user === "cliente" && pass === "1234") {
    currentRole = "cliente";
  }
  else {
    alert("Credenziali non valide");
    return;
  }

  authContainer.classList.add("hidden");
  app.classList.remove("hidden");

  applyRoleUI();
  loadDashboard();
}

/* ------------------------------------------------
   RUOLI – Mostra/Nasconde card e pulsanti
--------------------------------------------------- */
function applyRoleUI() {
  document.querySelectorAll(".role-internal-only").forEach(el => {
    el.classList.toggle("hidden", currentRole === "cliente");
  });

  document.querySelectorAll(".role-titolare-only").forEach(el => {
    el.classList.toggle("hidden", currentRole !== "titolare");
  });

  document.querySelectorAll(".role-cliente-only").forEach(el => {
    el.classList.toggle("hidden", currentRole !== "cliente");
  });
}

/* ------------------------------------------------
   CARICAMENTO DASHBOARD (dinamico)
--------------------------------------------------- */
function loadDashboard() {
  showSection(dashboardSection);

  loadDashboardAssenze();
  loadDashboardTurno();
  loadDashboardComunicazioni();
  loadDashboardArrivi();
  loadDashboardScadenze();
  loadDashboardScorte();
  loadDashboardCambioCassa();
}
/* ============================================================
   SCRIPT – PARTE 3/7
   Assenze, Turni, Arrivi, Scadenze, Scorte, Cambio Cassa
   ============================================================ */

/* ------------------------------------------------
   DASHBOARD – CARD ASSENZE (con mini calendario)
--------------------------------------------------- */
function loadDashboardAssenze() {
  const oggiList = document.getElementById("assenzeOggiList");
  if (oggiList) {
    oggiList.innerHTML = "";

    if (assenzeDemo.oggi.length === 0) {
      oggiList.innerHTML = "<li>Nessun assente oggi</li>";
    } else {
      assenzeDemo.oggi.forEach(a => {
        oggiList.innerHTML += `<li>${a}</li>`;
      });
    }
  }

  // Mini calendario colorazione
  miniCalButtons.forEach(btn => {
    const day = btn.dataset.day;
    if (assenzeDemo.prossimi[day]) {
      btn.classList.add("has-assenze");
    }

    btn.addEventListener("click", () => {
      miniCalButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const elenco = assenzeDemo.prossimi[day];
      if (elenco) {
        miniCalInfo.textContent = elenco.join(", ");
      } else {
        miniCalInfo.textContent = "Nessun assente in questa data";
      }
    });
  });
}

/* ------------------------------------------------
   DASHBOARD – CARD TURNI
--------------------------------------------------- */
function loadDashboardTurno() {
  const turnoPrincipale = document.getElementById("turnoPrincipale");
  const turnoAppoggio = document.getElementById("turnoAppoggio");

  if (turnoPrincipale) {
    turnoPrincipale.innerHTML = `
      <div class="list-title">Farmacia Centrale (oggi)</div>
      <div class="list-meta">Via Roma, 12 – Tel. 0835 123456</div>
    `;
  }

  if (turnoAppoggio) {
    turnoAppoggio.innerHTML = `
      <div class="list-title">Farmacia di Appoggio</div>
      <div class="list-meta">Via Dante, 88 – Tel. 0835 654321</div>
    `;
  }
}

/* ------------------------------------------------
   DASHBOARD – CARD ARRIVI
--------------------------------------------------- */
function loadDashboardArrivi() {
  const arriviList = document.getElementById("arriviList");
  if (!arriviList) return;

  arriviList.innerHTML = "";

  arriviDemo.forEach(a => {
    arriviList.innerHTML += `
      <div class="arrivi-list-card-item">
        <span>${a.prodotto}</span>
        <span>${a.ora}</span>
      </div>
    `;
  });
}

/* ------------------------------------------------
   DASHBOARD – CARD SCADENZE
--------------------------------------------------- */
function loadDashboardScadenze() {
  const scaList = document.getElementById("scadenzeList");
  if (!scaList) return;

  scaList.innerHTML = "";

  scadenzeDemo.forEach(s => {
    scaList.innerHTML += `
      <li class="${s.urgente ? "urgente" : ""}">
        <span>${s.prodotto}</span>
        <span>${s.data}</span>
      </li>
    `;
  });
}

/* ------------------------------------------------
   DASHBOARD – CARD SCORTE
--------------------------------------------------- */
function loadDashboardScorte() {
  const scoList = document.getElementById("scorteList");
  if (!scoList) return;

  scoList.innerHTML = "";

  scorteDemo.forEach(s => {
    scoList.innerHTML += `
      <li>
        <span>${s.prodotto}</span>
        <span class="flag-urgente">${s.urgente ? "URGENTE" : ""}</span>
      </li>
    `;
  });
}

/* ------------------------------------------------
   DASHBOARD – CARD CAMBIO CASSA
--------------------------------------------------- */
function loadDashboardCambioCassa() {
  const cassaList = document.getElementById("cassaList");
  if (!cassaList) return;

  cassaList.innerHTML = `
    <li>Richiesto cambio: 50€ (banconota)</li>
    <li>Richiesto: 2€ (monete) – 1 mazzetta</li>
    <li>Richiesto: 10€ (monete)</li>
  `;
}
/* ============================================================
   SCRIPT – PARTE 4/7
   Comunicazioni interne + popup "Comunica"
   ============================================================ */

/* ------------------------------------------------
   UTILITÀ COMUNICAZIONI
--------------------------------------------------- */

/**
 * Aggiorna i badge in alto nella pagina Comunicazioni
 * (Totali, Non lette, Urgenti)
 */
function aggiornaBadgeComunicazioni() {
  if (!Array.isArray(comunicazioni)) return;

  const tot = comunicazioni.length;
  const nonLette = comunicazioni.filter(c => !c.letta).length;
  const urgenti = comunicazioni.filter(c => c.categoria === "urgente").length;

  if (badgeTotComunicazioni) {
    badgeTotComunicazioni.textContent = `Totali: ${tot}`;
  }
  if (badgeNonLette) {
    badgeNonLette.textContent = `Non lette: ${nonLette}`;
  }
  if (badgeUrgenti) {
    badgeUrgenti.textContent = `Urgenti: ${urgenti}`;
  }
}

/**
 * Restituisce l’elenco delle comunicazioni filtrate
 * in base a:
 *  - categoria selezionata
 *  - check "solo non lette"
 *  - eventuale logica per ruolo
 */
function getComunicazioniFiltrate() {
  if (!Array.isArray(comunicazioni)) return [];

  let lista = [...comunicazioni];

  // Filtri UI
  const cat = filtroCategoria ? filtroCategoria.value : "tutte";
  const soloNonLette = filtroSoloNonLette ? filtroSoloNonLette.checked : false;

  if (cat !== "tutte") {
    lista = lista.filter(c => c.categoria === cat);
  }
  if (soloNonLette) {
    lista = lista.filter(c => !c.letta);
  }

  // In futuro puoi differenziare per ruolo:
  // - titolare vede tutto
  // - farmacia generica vede solo alcune categorie
  // - dipendenti vedono solo comunicazioni a loro destinate
  //
  // Per ora, tutti i ruoli vedono la stessa lista.
  return lista;
}

/**
 * Rende una comunicazione "letta" (per id)
 */
function segnaComunicazioneComeLetta(id) {
  const idx = comunicazioni.findIndex(c => c.id === id);
  if (idx === -1) return;

  comunicazioni[idx].letta = true;
  aggiornaBadgeComunicazioni();
  renderComunicazioni(); // rinfresca lista

  // Aggiorna anche le notifiche della card Comunicazioni (badge rosso)
  if (notificationConfig && notificationConfig.comunicazioni) {
    const blocco = notificationConfig.comunicazioni;
    const noti = blocco.notifiche || [];
    // non servono modifiche qui in demo, ma in futuro puoi legarlo
    if (typeof updateBadgeForCard === "function") {
      updateBadgeForCard("comunicazioni");
    }
  }
}

/**
 * Aggiunge una nuova comunicazione all’elenco
 */
function aggiungiComunicazione({ titolo, categoria, testo }) {
  if (!titolo || !testo) return;

  const nuova = {
    id: Date.now(),
    titolo,
    categoria: categoria || "informativa",
    autore: currentRole === "titolare"
      ? "Titolare"
      : currentRole === "farmacia"
      ? "Farmacia"
      : "Dipendente",
    data: "Oggi",
    testo,
    letta: false
  };

  comunicazioni.unshift(nuova);

  // Aggiorna badge pagina
  aggiornaBadgeComunicazioni();
  // Rinfresca lista
  renderComunicazioni();

  // Aggiorna anche la badge rossa della card "Comunicazioni" in dashboard
  try {
    if (notificationConfig && notificationConfig.comunicazioni) {
      const blocco = notificationConfig.comunicazioni;
      if (!Array.isArray(blocco.notifiche)) {
        blocco.notifiche = [];
      }
      blocco.notifiche.unshift({
        id: "com-auto-" + nuova.id,
        titolo: "Nuova comunicazione",
        testo: nuova.titolo,
        letto: false
      });
      if (typeof updateBadgeForCard === "function") {
        updateBadgeForCard("comunicazioni");
      }
    }
  } catch (e) {
    console.warn("Impossibile aggiornare notifica card Comunicazioni", e);
  }
}

/* ------------------------------------------------
   RENDER LISTA COMUNICAZIONI
--------------------------------------------------- */

function renderComunicazioni() {
  if (!comunicazioniList) return;

  const filtered = getComunicazioniFiltrate();
  comunicazioniList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small-text";
    empty.textContent = "Nessuna comunicazione per i filtri selezionati.";
    comunicazioniList.appendChild(empty);
    aggiornaBadgeComunicazioni();
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "com-card";

    // Pill categoria
    const pill = document.createElement("div");
    pill.className = `com-pill ${c.categoria}`;
    pill.textContent =
      c.categoria === "urgente"
        ? "URGENTE"
        : c.categoria === "importante"
        ? "IMPORTANTE"
        : "INFORMATIVA";

    // Titolo
    const title = document.createElement("div");
    title.className = "com-title";
    title.textContent = c.titolo;

    // Meta (data, autore, stato letta)
    const meta = document.createElement("div");
    meta.className = "com-meta";
    const stato = c.letta ? "Letta" : "Non letta";
    meta.textContent = `${c.data} · ${c.autore} · ${stato}`;

    // Testo
    const text = document.createElement("div");
    text.className = "com-text";
    text.textContent = c.testo;

    // Se clicchi la card la segna come letta
    card.addEventListener("click", () => {
      if (!c.letta) {
        segnaComunicazioneComeLetta(c.id);
      }
    });

    card.appendChild(pill);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(text);

    comunicazioniList.appendChild(card);
  });

  aggiornaBadgeComunicazioni();
}

/* ------------------------------------------------
   POPUP "COMUNICA" (solo titolare dalla dashboard)
--------------------------------------------------- */

/**
 * Apre il popup "Comunica" (se esiste nel DOM).
 * Il bottone che lo apre sarà visibile SOLO al titolare.
 */
function openComunicaPopup() {
  const modal = document.getElementById("comunicaModal");
  const backdrop = document.getElementById("comunicaBackdrop");
  if (!modal || !backdrop) return;

  modal.classList.add("visible");
  backdrop.classList.add("visible");
}

/**
 * Chiude il popup "Comunica"
 */
function closeComunicaPopup() {
  const modal = document.getElementById("comunicaModal");
  const backdrop = document.getElementById("comunicaBackdrop");
  const feedback = document.getElementById("comunicaFeedback");

  if (modal) modal.classList.remove("visible");
  if (backdrop) backdrop.classList.remove("visible");
  if (feedback) {
    feedback.textContent = "";
    feedback.classList.add("hidden");
  }
}

/**
 * Gestione submit del form nel popup "Comunica"
 * (il listener verrà agganciato in DOMContentLoaded nella PARTE 7)
 */
function handleComunicaFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const titoloInput = form.querySelector("#comunicaTitolo");
  const categoriaSelect = form.querySelector("#comunicaCategoria");
  const testoTextarea = form.querySelector("#comunicaTesto");
  const feedback = document.getElementById("comunicaFeedback");

  const titolo = titoloInput ? titoloInput.value.trim() : "";
  const categoria = categoriaSelect ? categoriaSelect.value : "informativa";
  const testo = testoTextarea ? testoTextarea.value.trim() : "";

  if (!titolo || !testo) {
    if (feedback) {
      feedback.textContent = "⚠️ Inserisci almeno un titolo e un testo.";
      feedback.classList.remove("hidden");
    }
    return;
  }

  // Crea la comunicazione
  aggiungiComunicazione({ titolo, categoria, testo });

  // Messaggio di conferma
  if (feedback) {
    feedback.textContent = "✅ Comunicazione inviata al personale (demo).";
    feedback.classList.remove("hidden");
  }

  // Reset form
  form.reset();

  // Dopo un piccolo delay si può chiudere automaticamente (facoltativo)
  setTimeout(() => {
    closeComunicaPopup();
  }, 800);
}
/* ============================================================
   SCRIPT – PARTE 5/7
   Notifiche globali + badge + popup notifiche
   ============================================================ */

/* ------------------------------------------------
   STRUTTURA NOTIFICHE DEMO
--------------------------------------------------- */

let notificationConfig = {
  comunicazioni: {
    id: "comunicazioni",
    cardId: "cardComunicazioni",
    title: "Comunicazioni interne",
    intro: "Avvisi, note e comunicazioni del titolare o della farmacia.",
    notifiche: [
      {
        id: "n1",
        titolo: "Aggiornamento turni",
        testo: "Nuovo orario per la settimana prossima.",
        letto: false
      },
      {
        id: "n2",
        titolo: "Arrivo corriere",
        testo: "È arrivato il corriere UPS (demo).",
        letto: true
      }
    ]
  },

  arrivi: {
    id: "arrivi",
    cardId: "cardLogistica",
    title: "Arrivi e corrieri",
    intro: "Segnalazioni sugli arrivi di prodotti, espositori e materiale.",
    notifiche: [
      {
        id: "a1",
        titolo: "Arrivo Bartolini",
        testo: "Pacco fragile consegnato.",
        letto: false
      }
    ]
  },

  scadenze: {
    id: "scadenze",
    cardId: "cardMagazziniera",
    title: "Scadenze & Scorte",
    intro: "Prodotti prossimi alla scadenza o scorte critiche.",
    notifiche: [
      {
        id: "s1",
        titolo: "Scadenza farmaco",
        testo: "Tachipirina 500mg scade il 05/01/2026",
        letto: false
      }
    ]
  }
};

/* ------------------------------------------------
   AGGIORNA BADGE ROSSO CARD
--------------------------------------------------- */
function updateBadgeForCard(sectionId) {
  const config = notificationConfig[sectionId];
  if (!config) return;

  const unread = config.notifiche.filter(n => !n.letto).length;
  const card = document.getElementById(config.cardId);
  if (!card) return;

  const badge = card.querySelector(".card-badge");
  const badgeLabel = card.querySelector(".card-badge-label");

  if (!badge || !badgeLabel) return;

  if (unread > 0) {
    badge.textContent = unread;
    badge.classList.add("has-unread");

    badgeLabel.textContent =
      unread === 1 ? "1 nuova notifica" : `${unread} notifiche`;
    badgeLabel.style.display = "block";
  } else {
    badge.classList.remove("has-unread");
    badge.textContent = "";
    badgeLabel.style.display = "none";
  }
}

/* ------------------------------------------------
   INIZIALIZZA TUTTE LE BADGE
--------------------------------------------------- */
function initAllBadges() {
  Object.keys(notificationConfig).forEach(key => {
    updateBadgeForCard(key);
  });
}

/* ------------------------------------------------
   MOSTRA POPUP NOTIFICHE DI UNA CARD
--------------------------------------------------- */
function openNotifiche(sectionId) {
  const config = notificationConfig[sectionId];
  if (!config) return;

  notifTitle.textContent = config.title;
  notifIntro.textContent = config.intro;

  notifList.innerHTML = "";
  config.notifiche.forEach(n => {
    const item = document.createElement("div");
    item.className = "notif-item";

    const body = document.createElement("div");
    body.className = "notif-text";

    const h3 = document.createElement("h3");
    h3.textContent = n.titolo;

    const p = document.createElement("p");
    p.textContent = n.testo;

    body.appendChild(h3);
    body.appendChild(p);
    item.appendChild(body);

    item.addEventListener("click", () => {
      n.letto = true;
      updateBadgeForCard(sectionId);
      item.style.opacity = "0.5";
    });

    notifList.appendChild(item);
  });

  notifOverlay.classList.add("active");
}

/* ------------------------------------------------
   CHIUDI POPUP NOTIFICHE
--------------------------------------------------- */
function closeNotifiche() {
  notifOverlay.classList.remove("active");
}
/* ============================================================
   SCRIPT – PARTE 6/7
   Archivio file (stile PC) – logica completa
   ============================================================ */

/* ------------------------------------------------
   SALVATAGGIO E CARICAMENTO FS (localStorage)
--------------------------------------------------- */
function saveFS() {
  try {
    localStorage.setItem("fs_montesano", JSON.stringify(fsRoot));
  } catch (e) {
    console.warn("Impossibile salvare in localStorage", e);
  }
}

function loadFS() {
  try {
    const saved = localStorage.getItem("fs_montesano");
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
    console.error("Errore caricando FS, resetto.", e);
    fsRoot = {
      name: "root",
      type: "folder",
      children: []
    };
    saveFS();
  }
  currentFolder = fsRoot;
}

/* ------------------------------------------------
   FUNZIONI DI SUPPORTO FS
--------------------------------------------------- */
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

  function walk(node, stack) {
    if (node === target) {
      path.push(...stack, node.name);
      return true;
    }
    if (node.type === "folder" && node.children) {
      for (const child of node.children) {
        if (walk(child, [...stack, node.name])) return true;
      }
    }
    return false;
  }

  walk(fsRoot, []);
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

/* ------------------------------------------------
   SELEZIONE & NAVIGAZIONE CARTELLE
--------------------------------------------------- */
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
  currentFolder.children = currentFolder.children || [];
  const base = "Nuova cartella";
  const name = ensureUniqueName(base, currentFolder.children);

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

/* ------------------------------------------------
   UPLOAD (DEMO) FILE
--------------------------------------------------- */
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
      // contenuto non salvato: demo archivio
    });
  });

  saveFS();
  renderArchivio();
}

/* ------------------------------------------------
   MENU CONTESTUALE (tasto destro / long press)
--------------------------------------------------- */
function openContextMenu(x, y, item, el) {
  if (!archivioContextMenu) return;

  clearSelection();
  selectedItem = item;
  lastSelectedEl = el;
  el.classList.add("selected");

  archivioContextMenu.style.left = x + "px";
  archivioContextMenu.style.top = y + "px";
  archivioContextMenu.classList.add("visible");

  if (menuIncolla) {
    menuIncolla.classList.toggle("disabled", !clipboardItem);
  }
}

function closeContextMenu() {
  if (!archivioContextMenu) return;
  archivioContextMenu.classList.remove("visible");
}

/* ------------------------------------------------
   AZIONI MENU: RINOMINA / ELIMINA / COPIA / INCOLLA
--------------------------------------------------- */
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
  clipboardItem = JSON.parse(JSON.stringify(selectedItem)); // deep copy
  if (menuIncolla) menuIncolla.classList.remove("disabled");
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

/* ------------------------------------------------
   RENDER ARCHIVIO – GRIGLIA FILE/CARTELLE
--------------------------------------------------- */
function renderArchivio() {
  if (!archivioGrid || !currentFolder) return;

  currentFolder.children = currentFolder.children || [];

  // Ordina: cartelle prima, poi file
  currentFolder.children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });

  // Percorso in alto
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

    // Click: seleziona
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      clearSelection();
      selectedItem = item;
      lastSelectedEl = el;
      el.classList.add("selected");
    });

    // Doppio click: apri cartella / file
    el.addEventListener("dblclick", () => {
      if (item.type === "folder") {
        openFolder(item);
      } else {
        alert("File demo: in futuro potrai aprirlo o scaricarlo.");
      }
    });

    // Tasto destro
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openContextMenu(e.pageX, e.pageY, item, el);
    });

    // Mobile: pressione lunga
    let touchTimer = null;
    el.addEventListener("touchstart", (e) => {
      touchTimer = setTimeout(() => {
        const t = e.touches[0];
        openContextMenu(t.clientX, t.clientY, item, el);
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
/* ============================================================
   SCRIPT – PARTE 7/7
   Inizializzazione finale + Ruoli + Eventi dashboard + Archivio
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================
     LOGIN & RUOLI
  ========================== */

  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const role = tab.dataset.role;
      loginRoleLabel.textContent =
        role === "farmacia" ? "Farmacia" :
        role === "titolare" ? "Titolare" :
        role === "dipendente" ? "Dipendente" :
        "Cliente";
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
    });
  }

  /* =======================
     SIDEBAR NAV
  ========================== */

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

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        e.target !== hamburger) {
      sidebar.classList.remove("open");
    }
  });

  sidebar.querySelectorAll("li[data-nav]").forEach(el => {
    el.addEventListener("click", () => {
      const page = el.getAttribute("data-nav");

      showSection(
        page === "dashboard" ? dashboardSection :
        page === "assenzePage" ? assenzePage :
        page === "turniPage" ? turniPage :
        page === "comunicazioniPage" ? comunicazioniPage :
        page === "procedurePage" ? procedurePage :
        page === "archivioPage" ? archivioPage :
        dashboardSection
      );

      if (page === "turniPage") renderTurniTable();
      if (page === "comunicazioniPage") renderComunicazioni();
      if (page === "procedurePage") renderProcedureList();
      if (page === "archivioPage") renderArchivio();

      sidebar.classList.remove("open");
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");
      loginForm.reset();

      authTabs.forEach(t => t.classList.remove("active"));
      authTabs[0].classList.add("active");

      loginRoleLabel.textContent = "Farmacia";
      setRole("farmacia");
    });
  }

  /* =======================
     DASHBOARD → PAGINE
  ========================== */

  if (openAssenzeBtn)
    openAssenzeBtn.addEventListener("click", () => showSection(assenzePage));
  if (backFromAssenzeBtn)
    backFromAssenzeBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openTurniBtn)
    openTurniBtn.addEventListener("click", () => { showSection(turniPage); renderTurniTable(); });
  if (backFromTurniBtn)
    backFromTurniBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openComunicazioniBtn)
    openComunicazioniBtn.addEventListener("click", () => { showSection(comunicazioniPage); renderComunicazioni(); });
  if (backFromComunicazioniBtn)
    backFromComunicazioniBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openProcedureBtn)
    openProcedureBtn.addEventListener("click", () => { showSection(procedurePage); renderProcedureList(); });
  if (backFromProcedureBtn)
    backFromProcedureBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openArchivioBtn)
    openArchivioBtn.addEventListener("click", () => { showSection(archivioPage); renderArchivio(); });
  if (backFromArchivioBtn)
    backFromArchivioBtn.addEventListener("click", () => showSection(dashboardSection));

  /* =======================
     TURNI – EVENTI
  ========================== */

  turniTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      turniTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTurniView = tab.dataset.view;
      renderTurniTable();
    });
  });

  turniMeseSelect.addEventListener("change", renderTurniTable);
  turniFarmaciaSelect.addEventListener("change", renderTurniTable);

  /* =======================
     COMUNICAZIONI
  ========================== */

  filtroCategoria.addEventListener("change", renderComunicazioni);
  filtroSoloNonLette.addEventListener("change", renderComunicazioni);

  if (comunicazioneForm) {
    comunicazioneForm.addEventListener("submit", e => {
      e.preventDefault();

      const t = document.getElementById("comTitolo").value.trim();
      const c = document.getElementById("comCategoria").value;
      const txt = document.getElementById("comTesto").value.trim();

      if (!t || !txt) {
        comunicazioneFeedback.classList.remove("hidden");
        comunicazioneFeedback.textContent = "⚠️ Inserisci titolo e testo.";
        return;
      }

      comunicazioni.unshift({
        id: comunicazioni.length + 1,
        titolo: t,
        categoria: c,
        autore: currentRole,
        data: "Oggi",
        testo: txt,
        letta: false
      });

      comunicazioneFeedback.textContent = "✅ Salvata (demo)";
      comunicazioneFeedback.classList.remove("hidden");

      comunicazioneForm.reset();
      renderComunicazioni();
    });
  }

  /* =======================
     PROCEDURE
  ========================== */

  procedureSearchInput.addEventListener("input", e => {
    currentProcedureSearch = e.target.value;
    renderProcedureList();
  });

  procedureFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      procedureFilterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentProcedureFilter = btn.dataset.reparto;
      renderProcedureList();
    });
  });

  /* =======================
     ARCHIVIO FILE
  ========================== */

  archivioBtnUpload.addEventListener("click", () => archivioUpload.click());
  archivioUpload.addEventListener("change", e => {
    handleUpload(e.target.files);
    archivioUpload.value = "";
  });

  archivioNewFolderBtn.addEventListener("click", createNewFolder);
  archivioUpBtn.addEventListener("click", goUpFolder);

  archivioGrid.addEventListener("click", () => {
    clearSelection();
    closeContextMenu();
  });

  menuNuova.addEventListener("click", () => { createNewFolder(); closeContextMenu(); });
  menuRinomina.addEventListener("click", () => { renameSelected(); closeContextMenu(); });
  menuElimina.addEventListener("click", () => { deleteSelected(); closeContextMenu(); });
  menuCopia.addEventListener("click", () => { copySelected(); closeContextMenu(); });
  menuIncolla.addEventListener("click", () => { pasteClipboard(); closeContextMenu(); });
  menuDownload.addEventListener("click", () => { downloadSelected(); closeContextMenu(); });

  document.addEventListener("click", e => {
    if (archivioContextMenu.classList.contains("visible") &&
        !archivioContextMenu.contains(e.target)) {
      closeContextMenu();
    }
  });

  /* =======================
     NOTIFICHE
  ========================== */

  document.querySelectorAll(".js-card-badge").forEach(badge => {
    badge.addEventListener("click", e => {
      e.stopPropagation();
      openNotificationPopup(badge.dataset.cardKey);
    });
  });

  notifClose.addEventListener("click", closeNotificationPopup);
  notifCloseBottom.addEventListener("click", closeNotificationPopup);

  notifOverlay.addEventListener("click", e => {
    if (e.target.id === "notificationOverlay" || e.target.classList.contains("notif-backdrop")) {
      closeNotificationPopup();
    }
  });

  /* =======================
     INIT COMPLETO
  ========================== */

  initTurnoOggi();
  renderComunicazioni();
  renderProcedureList();
  initNotificationBadges();

  loadFS();
  renderArchivio();

});
