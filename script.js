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

  if (loginRoleLabel) {
    loginRoleLabel.textContent =
      role === "farmacia" ? "Farmacia" :
      role === "titolare" ? "Titolare" :
      role === "dipendente" ? "Dipendente" :
      "Cliente";
  }

  applyRoleUI();
}

/* ------------------------------------------------
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
