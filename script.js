// ======================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO
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
let procedureFilter = "tutti";
let procSearchTerm = "";
let openNotificationCardKey = null;

// ====== ARCHIVIO FILE: STATO ======
let fsRoot = null;
let currentFolder = null;
let selectedItem = null;
let clipboardItem = null;
let lastSelectedEl = null;

// ======================================================
// DOM READY
// ======================================================
document.addEventListener("DOMContentLoaded", () => {

  // ----- ELEMENTI BASE -----
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  const loginForm = document.getElementById("loginForm");
  const loginRoleLabel = document.getElementById("loginRoleLabel");
  const authTabs = document.querySelectorAll(".auth-tab");

  // Sezioni
  const dashboardSection = document.getElementById("dashboard");
  const assenzePage = document.getElementById("assenzePage");
  const turniPage = document.getElementById("turniPage");
  const comunicazioniPage = document.getElementById("comunicazioniPage");
  const procedurePage = document.getElementById("procedurePage");
  const archivioPage = document.getElementById("archivioPage");

  // Sidebar
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");

  const rolePill = document.getElementById("currentRolePill");
  const assenzeTitle = document.getElementById("assenzeTitle");

  // Dashboard: turno card
  const turnoOrarioChip = document.getElementById("turnoOrarioChip");
  const turnoNome = document.getElementById("turnoNome");
  const turnoIndirizzo = document.getElementById("turnoIndirizzo");
  const turnoAppoggio = document.getElementById("turnoAppoggio");

  // Turni pagina
  const turnoOggiNome = document.getElementById("turnoOggiNome");
  const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
  const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
  const turnoOggiOrario = document.getElementById("turnoOggiOrario");
  const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
  const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

  const turniTabs = document.querySelectorAll(".turni-tab");
  const turniRows = document.getElementById("turniRows");
  const turniMeseSelect = document.getElementById("turniMeseSelect");
  const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  // Bottoni dashboard -> pagine
  const openAssenzeBtn = document.getElementById("openAssenze");
  const openTurniBtn = document.getElementById("openTurni");
  const openComunicazioniBtn = document.getElementById("openComunicazioni");
  const openProcedureBtn = document.getElementById("openProcedure");
  const openArchivioBtn = document.getElementById("openArchivio");

  // Bottoni back
  const backFromAssenzeBtn = document.getElementById("backFromAssenze");
  const backFromTurniBtn = document.getElementById("backFromTurni");
  const backFromComunicazioniBtn = document.getElementById("backFromComunicazioni");
  const backFromProcedureBtn = document.getElementById("backFromProcedure");
  const backFromArchivioBtn = document.getElementById("backFromArchivio");

  // Comunicazioni
  const comunicazioniList = document.getElementById("comunicazioniList");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
  const comunicazioneForm = document.getElementById("comunicazioneForm");
  const comunicazioneFeedback = document.getElementById("comunicazioneFeedback");
  const badgeTotComunicazioni = document.getElementById("badgeTotComunicazioni");
  const badgeNonLette = document.getElementById("badgeNonLette");
  const badgeUrgenti = document.getElementById("badgeUrgenti");

  // Assenze form
  const assenzeForm = document.querySelector(".assenze-form");
  const assenzeFeedback = document.getElementById("assenzeFeedback");

  // Procedure
  const procedureListEl = document.getElementById("procedureList");
  const procedureDetail = document.getElementById("procedureDetail");
  const procedureSearch = document.getElementById("procedureSearch");
  const procedureButtons = document.querySelectorAll(".proc-filter-btn");

  // Archivio
  const archivioGrid = document.getElementById("archivioGrid");
  const archivioPath = document.getElementById("archivioPath");
  const archivioUpload = document.getElementById("archivioUpload");
  const archivioBtnUpload = document.getElementById("archivioBtnUpload");
  const archivioUpBtn = document.getElementById("archivioUp");
  const archivioNewFolderBtn = document.getElementById("archivioNewFolder");
  const archivioContextMenu = document.getElementById("archivioContextMenu");
  const menuNuova = document.getElementById("menuNuova");
  const menuRinomina = document.getElementById("menuRinomina");
  const menuElimina = document.getElementById("menuElimina");
  const menuCopia = document.getElementById("menuCopia");
  const menuIncolla = document.getElementById("menuIncolla");
  const menuDownload = document.getElementById("menuDownload");

  // Notifiche overlay
  const notifOverlay = document.getElementById("notificationOverlay");
  const notifTitle = document.getElementById("notifTitle");
  const notifIntro = document.getElementById("notifIntro");
  const notifList = document.getElementById("notifList");
  const notifClose = document.getElementById("notifClose");
  const notifCloseBottom = document.getElementById("notifCloseBottom");

  // ======================================================
  // FUNZIONI BASE
  // ======================================================
  function setRole(role) {
    currentRole = role;
    if (rolePill) {
      if (role === "farmacia") rolePill.textContent = "Farmacia (accesso generico)";
      if (role === "titolare") rolePill.textContent = "Titolare";
      if (role === "dipendente") rolePill.textContent = "Dipendente";
    }
    if (assenzeTitle) {
      if (role === "dipendente") assenzeTitle.textContent = "Le mie assenze";
      else assenzeTitle.textContent = "Assenze del personale";
    }
  }

  function showSection(section) {
    [
      dashboardSection,
      assenzePage,
      turniPage,
      comunicazioniPage,
      procedurePage,
      archivioPage
    ].forEach(sec => sec && sec.classList.add("hidden"));
    if (section) section.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  // ======================================================
  // LOGIN
  // ======================================================
  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const role = tab.dataset.role;
      loginRoleLabel.textContent =
        role === "farmacia" ? "Farmacia" :
        role === "titolare" ? "Titolare" :
        "Dipendente";
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const activeTab = document.querySelector(".auth-tab.active");
    const role = activeTab.dataset.role;
    setRole(role);
    authContainer.classList.add("hidden");
    app.classList.remove("hidden");
    showSection(dashboardSection);
  });

  // ======================================================
  // SIDEBAR / NAV
  // ======================================================
  hamburger.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        e.target !== hamburger) {
      sidebar.classList.remove("open");
    }
  });

  sidebar.querySelectorAll("li[data-nav]").forEach(item => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (target === "dashboard") showSection(dashboardSection);
      if (target === "assenzePage") showSection(assenzePage);
      if (target === "turniPage") { showSection(turniPage); renderTurniTable(); }
      if (target === "comunicazioniPage") { showSection(comunicazioniPage); renderComunicazioni(); }
      if (target === "procedurePage") { showSection(procedurePage); renderProcedureList(); }
      if (target === "archivioPage") { showSection(archivioPage); renderArchivio(); }
      sidebar.classList.remove("open");
    });
  });

  logoutBtn.addEventListener("click", () => {
    app.classList.add("hidden");
    authContainer.classList.remove("hidden");
    loginForm.reset();
    authTabs.forEach(t => t.classList.remove("active"));
    authTabs[0].classList.add("active");
    loginRoleLabel.textContent = "Farmacia";
    setRole("farmacia");
  });

  // ======================================================
  // NAVIGAZIONE BOTTONI DASHBOARD
  // ======================================================
  if (openAssenzeBtn) openAssenzeBtn.addEventListener("click", () => showSection(assenzePage));
  if (backFromAssenzeBtn) backFromAssenzeBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openTurniBtn) openTurniBtn.addEventListener("click", () => {
    showSection(turniPage);
    renderTurniTable();
  });
  if (backFromTurniBtn) backFromTurniBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openComunicazioniBtn) openComunicazioniBtn.addEventListener("click", () => {
    showSection(comunicazioniPage);
    renderComunicazioni();
  });
  if (backFromComunicazioniBtn) backFromComunicazioniBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openProcedureBtn) openProcedureBtn.addEventListener("click", () => {
    showSection(procedurePage);
    renderProcedureList();
  });
  if (backFromProcedureBtn) backFromProcedureBtn.addEventListener("click", () => showSection(dashboardSection));

  if (openArchivioBtn) openArchivioBtn.addEventListener("click", () => {
    showSection(archivioPage);
    renderArchivio();
  });
  if (backFromArchivioBtn) backFromArchivioBtn.addEventListener("click", () => showSection(dashboardSection));

  // ======================================================
  // TURNI
  // ======================================================
  function formatDateIT(iso) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function initTurnoOggi() {
    const oggi = turniFarmacie.find(t => t.tipoRange === "oggi");
    if (!oggi) return;

    if (turnoOrarioChip) turnoOrarioChip.textContent = oggi.orario;
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
    if (!turniRows) return;

    const mese = turniMeseSelect.value;
    const farmacia = turniFarmaciaSelect.value;

    let filtered = turniFarmacie.filter(t => t.tipoRange === currentTurniView);

    if (mese !== "all") {
      filtered = filtered.filter(t => t.mese === Number(mese));
    }
    if (farmacia !== "all") {
      filtered = filtered.filter(t => t.principale === farmacia);
    }

    turniRows.innerHTML = "";

    if (filtered.length === 0) {
      const row = document.createElement("div");
      row.className = "turni-row";
      row.innerHTML = "<span>Nessun turno per questi filtri.</span>";
      turniRows.appendChild(row);
      return;
    }

    filtered.forEach(t => {
      const row = document.createElement("div");
      row.className = "turni-row";

      let noteClass = "normale";
      const lower = t.note.toLowerCase();
      if (lower.includes("notturno")) noteClass = "notturno";
      if (lower.includes("vigilia") || lower.includes("festivo")) noteClass = "festivo";

      row.innerHTML = `
        <span>${formatDateIT(t.data)}</span>
        <span>${t.orario}</span>
        <span>${t.principale}</span>
        <span>${t.appoggio}</span>
        <span>${t.telefono}</span>
        <span><span class="turno-type-pill ${noteClass}">${t.note}</span></span>
      `;
      turniRows.appendChild(row);
    });
  }

  turniTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      turniTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTurniView = tab.dataset.view;
      renderTurniTable();
    });
  });

  if (turniMeseSelect) turniMeseSelect.addEventListener("change", renderTurniTable);
  if (turniFarmaciaSelect) turniFarmaciaSelect.addEventListener("change", renderTurniTable);

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
    const soloNL = filtroSoloNonLette ? filtroSoloNonLette.checked : false;

    let filtered = [...comunicazioni];

    if (cat !== "tutte") {
      filtered = filtered.filter(c => c.categoria === cat);
    }
    if (soloNL) {
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

  if (filtroCategoria) filtroCategoria.addEventListener("change", renderComunicazioni);
  if (filtroSoloNonLette) filtroSoloNonLette.addEventListener("change", renderComunicazioni);

  if (comunicazioneForm && comunicazioneFeedback) {
    comunicazioneForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const titoloInput = document.getElementById("comTitolo");
      const categoriaSelect = document.getElementById("comCategoria");
      const testoInput = document.getElementById("comTesto");

      const titolo = titoloInput.value.trim();
      const categoria = categoriaSelect.value;
      const testo = testoInput.value.trim();

      if (!titolo || !testo) {
        comunicazioneFeedback.textContent = "⚠️ Inserisci almeno un titolo e un testo.";
        comunicazioneFeedback.classList.remove("hidden");
        return;
      }

      const nuova = {
        id: comunicazioni.length + 1,
        titolo,
        categoria,
        autore: "Demo utente",
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

  // ======================================================
  // ASSENZE: FORM DEMO
  // ======================================================
  if (assenzeForm && assenzeFeedback) {
    assenzeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      assenzeFeedback.classList.remove("hidden");
      assenzeFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // ======================================================
  // PROCEDURE
  // ======================================================
  function renderProcedureList() {
    if (!procedureListEl) return;

    let filtered = procedureData.filter(p => {
      const matchCat = (procedureFilter === "tutti" || p.reparto === procedureFilter);
      const testoRicerca = (p.titolo + " " + p.testo).toLowerCase();
      const matchSearch = !procSearchTerm || testoRicerca.includes(procSearchTerm);
      return matchCat && matchSearch;
    });

    procedureListEl.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "small-text";
      empty.textContent = "Nessuna procedura trovata per i filtri impostati (demo).";
      procedureListEl.appendChild(empty);
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
        showProcedure(p.id);
      });

      procedureListEl.appendChild(item);
    });
  }

  function showProcedure(procId) {
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

    const paragrafi = proc.testo.split("\n").map((row) => `<p>${row}</p>`).join("");

    procedureDetail.innerHTML = `
      <h3>${proc.titolo}</h3>
      <p class="small-text">Reparto: <strong>${repLabel}</strong> · Ultimo aggiornamento: <strong>${proc.aggiornamento}</strong></p>
      <div class="divider"></div>
      <div>${paragrafi}</div>
    `;
  }

  procedureButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      procedureButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      procedureFilter = btn.getAttribute("data-reparto") || "tutti";
      renderProcedureList();
    });
  });

  if (procedureSearch) {
    procedureSearch.addEventListener("input", (e) => {
      procSearchTerm = e.target.value.trim().toLowerCase();
      renderProcedureList();
    });
  }

  // ======================================================
  // ARCHIVIO FILE
  // ======================================================
  function saveFS() {
    if (!fsRoot) return;
    localStorage.setItem("fs_montesano", JSON.stringify(fsRoot));
  }

  function loadFS() {
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
            content: btoa("Benvenuto nell’Archivio File della Farmacia Montesano!")
          }
        ]
      };
      saveFS();
    }
    currentFolder = fsRoot;
  }

  function getParent(target, node = fsRoot, parent = null) {
    if (!node) return null;
    if (node === target) return parent;
    if (node.type === "folder" && node.children) {
      for (const child of node.children) {
        const res = getParent(target, child, node);
        if (res) return res;
      }
    }
    return null;
  }

  function getPathArray(target) {
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

  function hideContextMenu() {
    if (!archivioContextMenu) return;
    archivioContextMenu.style.display = "none";
  }

  function showContextMenu(x, y) {
    if (!archivioContextMenu) return;
    archivioContextMenu.style.left = `${x}px`;
    archivioContextMenu.style.top = `${y}px`;
    archivioContextMenu.style.display = "block";
  }

  function cloneItem(item) {
    return JSON.parse(JSON.stringify(item));
  }

  function updatePasteState() {
    if (!menuIncolla) return;
    if (clipboardItem) {
      menuIncolla.classList.remove("disabled");
      menuIncolla.style.opacity = "1";
      menuIncolla.style.pointerEvents = "auto";
    } else {
      menuIncolla.classList.add("disabled");
      menuIncolla.style.opacity = "0.4";
      menuIncolla.style.pointerEvents = "none";
    }
  }

  function createNewFolderInCurrent() {
    if (!currentFolder || currentFolder.type !== "folder") return;
    const nameBase = "Nuova cartella";
    const name = ensureUniqueName(nameBase, currentFolder.children);
    currentFolder.children.push({
      type: "folder",
      name,
      children: []
    });
    saveFS();
    renderArchivio();
  }

  function renderArchivio() {
    if (!archivioGrid || !currentFolder) return;

    hideContextMenu();
    clearSelection();

    currentFolder.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });

    const pathArr = getPathArray(currentFolder);
    if (archivioPath) archivioPath.textContent = "/" + pathArr.join("/");

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

      // click selezione
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        hideContextMenu();
        clearSelection();
        el.classList.add("selected");
        lastSelectedEl = el;
        selectedItem = item;
      });

      // doppio click: apri cartella / file
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        hideContextMenu();
        if (item.type === "folder") {
          currentFolder = item;
          clearSelection();
          renderArchivio();
        } else {
          if (item.content) {
            alert(`In futuro qui potrai aprire il file "${item.name}" (demo).`);
          } else {
            alert(`File "${item.name}" archiviato (demo).`);
          }
        }
      });

      // tasto destro: menu contestuale
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        el.classList.add("selected");
        lastSelectedEl = el;
        selectedItem = item;
        showContextMenu(e.pageX, e.pageY);
      });

      // pressione lunga su mobile
      let longPressTimer = null;
      el.addEventListener("touchstart", (e) => {
        longPressTimer = setTimeout(() => {
          const touch = e.touches[0];
          clearSelection();
          el.classList.add("selected");
          lastSelectedEl = el;
          selectedItem = item;
          showContextMenu(touch.pageX, touch.pageY);
        }, 600);
      });
      ["touchend", "touchcancel", "touchmove"].forEach(ev => {
        el.addEventListener(ev, () => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        });
      });
    });
  }

  // click vuoto nello spazio dell’archivio: deseleziona
  if (archivioGrid) {
    archivioGrid.addEventListener("click", () => {
      clearSelection();
      hideContextMenu();
    });

    archivioGrid.addEventListener("contextmenu", (e) => {
      // tasto destro su area vuota
      if (e.target === archivioGrid) {
        e.preventDefault();
        clearSelection();
        selectedItem = null;
        showContextMenu(e.pageX, e.pageY);
      }
    });
  }

  document.addEventListener("scroll", hideContextMenu, true);
  document.addEventListener("click", (e) => {
    if (archivioContextMenu && !archivioContextMenu.contains(e.target)) {
      hideContextMenu();
    }
  });

  // Toolbar archivio
  if (archivioBtnUpload && archivioUpload) {
    archivioBtnUpload.addEventListener("click", () => {
      archivioUpload.click();
    });

    archivioUpload.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length || !currentFolder) return;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          const base64 = typeof dataUrl === "string" && dataUrl.includes(",")
            ? dataUrl.split(",")[1]
            : "";
          const name = ensureUniqueName(file.name, currentFolder.children);
          currentFolder.children.push({
            type: "file",
            name,
            content: base64
          });
          saveFS();
          renderArchivio();
        };
        reader.readAsDataURL(file);
      });

      e.target.value = "";
    });
  }

  if (archivioUpBtn) {
    archivioUpBtn.addEventListener("click", () => {
      if (!currentFolder || currentFolder === fsRoot) return;
      const parent = getParent(currentFolder);
      if (parent) {
        currentFolder = parent;
        renderArchivio();
      }
    });
  }

  if (archivioNewFolderBtn) {
    archivioNewFolderBtn.addEventListener("click", () => {
      hideContextMenu();
      createNewFolderInCurrent();
    });
  }

  // Menu contestuale ARCHIVIO
  if (menuNuova) {
    menuNuova.addEventListener("click", () => {
      hideContextMenu();
      createNewFolderInCurrent();
    });
  }

  if (menuRinomina) {
    menuRinomina.addEventListener("click", () => {
      hideContextMenu();
      if (!selectedItem || !currentFolder) return;
      const nuovo = prompt("Nuovo nome:", selectedItem.name);
      if (!nuovo) return;
      const name = ensureUniqueName(nuovo.trim(), currentFolder.children.filter(i => i !== selectedItem));
      selectedItem.name = name;
      saveFS();
      renderArchivio();
    });
  }

  if (menuElimina) {
    menuElimina.addEventListener("click", () => {
      hideContextMenu();
      if (!selectedItem) return;
      const conferma = confirm(`Eliminare "${selectedItem.name}"?`);
      if (!conferma) return;

      const parent = getParent(selectedItem);
      if (!parent || !parent.children) return;
      parent.children = parent.children.filter(i => i !== selectedItem);
      saveFS();
      selectedItem = null;
      renderArchivio();
    });
  }

  if (menuCopia) {
    menuCopia.addEventListener("click", () => {
      hideContextMenu();
      if (!selectedItem) return;
      clipboardItem = cloneItem(selectedItem);
      updatePasteState();
    });
  }

  if (menuIncolla) {
    menuIncolla.addEventListener("click", () => {
      hideContextMenu();
      if (!clipboardItem || !currentFolder) return;
      const clone = cloneItem(clipboardItem);
      clone.name = ensureUniqueName(clone.name, currentFolder.children);
      currentFolder.children.push(clone);
      saveFS();
      renderArchivio();
    });
  }

  if (menuDownload) {
    menuDownload.addEventListener("click", () => {
      hideContextMenu();
      if (!selectedItem || selectedItem.type !== "file") {
        alert("Seleziona un file per il download (demo).");
        return;
      }
      if (!selectedItem.content) {
        alert("Questo file è solo dimostrativo, nessun contenuto salvato.");
        return;
      }
      try {
        const byteChars = atob(selectedItem.content);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedItem.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("Download non riuscito (demo).");
      }
    });
  }

  updatePasteState();

  // ======================================================
  // NOTIFICHE DASHBOARD (PALLINI + POPUP)
  // ======================================================
  function getUnreadNotifications(cardKey) {
    const cfg = notificationConfig[cardKey];
    if (!cfg) return [];
    return cfg.notifiche.filter((n) => !n.letto);
  }

  function updateBadgeForCard(cardKey) {
    const badge = document.querySelector(
      `.card-badge[data-card-key="${cardKey}"]`
    );
    const label = document.querySelector(
      `.card-badge-label[data-card-key="${cardKey}"]`
    );
    if (!badge) return;

    const unread = getUnreadNotifications(cardKey);
    const count = unread.length;
    const countSpan = badge.querySelector(".badge-count");

    if (count > 0) {
      if (countSpan) countSpan.textContent = String(count);
      badge.classList.add("has-unread");
      // label "Nuovo / Nuovi"
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
    Object.keys(notificationConfig).forEach((key) => updateBadgeForCard(key));
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
      unread.forEach((n) => {
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
    const n = cfg.notifiche.find((x) => x.id === notifId);
    if (!n || n.letto) return;

    n.letto = true;

    // aggiorna lista nel popup (se è ancora aperto)
    if (openNotificationCardKey === cardKey) {
      openNotificationPopup(cardKey);
    }

    // aggiorna il pallino sulla card
    updateBadgeForCard(cardKey);
  }

  // click su pallino di ogni card
  document.querySelectorAll(".js-card-badge").forEach((badge) => {
    const key = badge.getAttribute("data-card-key");
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      openNotificationPopup(key);
    });
  });

  // chiusura popup
  if (notifClose) notifClose.addEventListener("click", closeNotificationPopup);
  if (notifCloseBottom)
    notifCloseBottom.addEventListener("click", closeNotificationPopup);

  // chiusura cliccando sullo sfondo scuro
  if (notifOverlay) {
    notifOverlay.addEventListener("click", (e) => {
      if (e.target === notifOverlay || e.target.classList.contains("notif-backdrop")) {
        closeNotificationPopup();
      }
    });
  }

  // ======================================================
  // INIT GENERALE
  // ======================================================
  initTurnoOggi();
  renderComunicazioni();
  renderProcedureList();
  loadFS();
  renderArchivio();
  initNotificationBadges();
});
