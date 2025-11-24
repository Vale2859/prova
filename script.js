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
  },
  {
    data: "2026-01-02",
    orario: "08:00 – 20:00",
    principale: "Farmacia Centrale",
    appoggio: "Farmacia Madonna delle Grazie",
    telefono: "0835 111111",
    note: "Inizio anno",
    tipoRange: "mese",
    mese: 1
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
    testo: "Dal prossimo turno seguire la nuova check-list chiusura farmacia.",
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

// ====== DATI DEMO: PROCEDURE OPERATIVE ======
const procedureData = {
  cassa: [
    {
      id: "C1",
      titolo: "Doppio scontrino / errore importo",
      hotkey: "Alt + D",
      descrizioneBreve: "Come gestire uno scontrino emesso due volte o con importo sbagliato.",
      steps: [
        "Avvisa subito il cliente dell’errore.",
        "Segna il numero dello scontrino errato.",
        "Annulla / storna lo scontrino secondo le indicazioni fiscali interne.",
        "Riemetti lo scontrino corretto e archivia l’errore nel registro interno."
      ]
    },
    {
      id: "C2",
      titolo: "Reso merce con rimborso contanti / carta",
      hotkey: "Alt + R",
      descrizioneBreve: "Gestione del reso con restituzione del denaro.",
      steps: [
        "Verifica che il prodotto sia reso secondo le regole interne (scontrino, stato del prodotto).",
        "Registra il reso sul gestionale scegliendo il metodo di rimborso.",
        "Se contanti: dai il resto corretto e annota sul registro cassa.",
        "Se carta: effettua storno / rimborso POS come da manuale.",
        "Archivia lo scontrino di reso con annotazione del motivo."
      ]
    },
    {
      id: "C3",
      titolo: "Mancanza resto in cassa",
      hotkey: "Alt + M",
      descrizioneBreve: "Cosa fare se non hai resto sufficiente.",
      steps: [
        "Controlla nel cassetto resto dedicato.",
        "Se manca il taglio richiesto, verifica con il collega in seconda postazione.",
        "Solo se necessario, chiedi cambio al titolare o dal fondo cassa.",
        "Registra l’operazione nel foglio di cambio cassa (data, ora, importo, chi ha effettuato)."
      ]
    }
  ],
  banco: [
    {
      id: "B1",
      titolo: "Prodotto da banco non disponibile",
      hotkey: "Alt + B",
      descrizioneBreve: "Gestione rapida di un prodotto OTC non presente.",
      steps: [
        "Verifica nel gestionale eventuali giacenze in altri reparti o magazzino.",
        "Se disponibile altrove: accompagna il cliente o fai recuperare al collega.",
        "Se non disponibile: proponi un’alternativa equivalente secondo linee guida interne.",
        "Offri, se opportuno, prenotazione del prodotto con avviso al cliente all’arrivo."
      ]
    },
    {
      id: "B2",
      titolo: "Consiglio prodotto alternativo",
      hotkey: "Alt + A",
      descrizioneBreve: "Suggerire un prodotto alternativo in sicurezza.",
      steps: [
        "Ascolta il bisogno del cliente (sintomo / esigenza).",
        "Verifica farmaci già assunti o eventuali allergie, se rilevante.",
        "Consulta le schede interne / linee guida per il reparto banco.",
        "Proponi 1–2 alternative spiegando differenze di prezzo e beneficio.",
        "Annota eventuali problematiche ricorrenti in un quaderno note di reparto."
      ]
    }
  ],
  magazzino: [
    {
      id: "M1",
      titolo: "Controllo scadenze mensile",
      hotkey: "Alt + S",
      descrizioneBreve: "Giro scadenze rapido per evitare sprechi.",
      steps: [
        "Seleziona lo scaffale / zona da controllare secondo il planning mensile.",
        "Metti in evidenza i prodotti con scadenza entro 3 mesi.",
        "Aggiorna il gestionale con eventuale cambio ubicazione / sconti applicati.",
        "Segnala al titolare i prodotti da smaltire o da mettere in offerta."
      ]
    },
    {
      id: "M2",
      titolo: "Prodotto non trovato a scaffale",
      hotkey: "Alt + F",
      descrizioneBreve: "Quando il gestionale dice che c’è ma fisicamente non lo vedi.",
      steps: [
        "Verifica il codice a barre nel gestionale per confermare l’ubicazione.",
        "Controlla lo scaffale indicato e le zone vicine (eventuale spostamento).",
        "Guarda l’area resi / banco lavoro per possibili prodotti in lavorazione.",
        "Se ancora assente: segnala nel registro differenze inventariali."
      ]
    }
  ],
  servizi: [
    {
      id: "S1",
      titolo: "Prenotazione servizio (ECG, holter, MOC...)",
      hotkey: "Alt + P",
      descrizioneBreve: "Registrare correttamente una prenotazione servizio.",
      steps: [
        "Seleziona il servizio richiesto nel gestionale servizi / agenda.",
        "Concorda data e ora con il cliente verificando i dati anagrafici.",
        "Registra eventuale acconto incassato e rilascia ricevuta.",
        "Consegna al cliente il promemoria scritto (data, ora, preparazione se necessaria)."
      ]
    },
    {
      id: "S2",
      titolo: "Gestione no-show (cliente non si presenta)",
      hotkey: "Alt + N",
      descrizioneBreve: "Cosa fare se il cliente non si presenta all’appuntamento.",
      steps: [
        "Dopo 10–15 minuti verifica se ci sono comunicazioni del cliente (telefono / WhatsApp farmacia).",
        "Segna sull’agenda che il cliente è no-show.",
        "Segui le regole interne su eventuale perdita dell’acconto o riprogrammazione.",
        "Se necessario, ricontatta il cliente per riprogrammare e aggiornare l’agenda."
      ]
    }
  ]
};

// ====== STATO ======
let currentRole = "farmacia";          // farmacia | titolare | dipendente
let currentTurniView = "oggi";         // oggi | settimana | mese
let currentProcedureDept = "cassa";    // cassa | banco | magazzino | servizi

document.addEventListener("DOMContentLoaded", () => {
  // Elementi principali
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  // Login
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginRoleLabel = document.getElementById("loginRoleLabel");
  const loginForm = document.getElementById("loginForm");

  // Layout
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");
  const rolePill = document.getElementById("currentRolePill");
  const assenzeTitle = document.getElementById("assenzeTitle");

  // Sezioni principali
  const dashboardSection = document.getElementById("dashboard");
  const assenzePage = document.getElementById("assenzePage");
  const turniPage = document.getElementById("turniPage");
  const comunicazioniPage = document.getElementById("comunicazioniPage");
  const procedurePage = document.getElementById("procedurePage");

  // Pulsanti navigazione rapida (dashboard)
  const openAssenzeBtn = document.getElementById("openAssenze");
  const backFromAssenzeBtn = document.getElementById("backFromAssenze");
  const openTurniBtn = document.getElementById("openTurni");
  const backFromTurniBtn = document.getElementById("backFromTurni");
  const openComunicazioniBtn = document.getElementById("openComunicazioni");
  const backFromComunicazioniBtn = document.getElementById("backFromComunicazioni");
  const openProcedureBtn = document.getElementById("openProcedure");
  const backFromProcedureBtn = document.getElementById("backFromProcedure");

  // Turni elementi
  const turnoOggiNome = document.getElementById("turnoOggiNome");
  const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
  const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
  const turnoOggiOrario = document.getElementById("turnoOggiOrario");
  const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
  const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

  const turnoOrarioChip = document.getElementById("turnoOrarioChip");
  const turnoNome = document.getElementById("turnoNome");
  const turnoIndirizzo = document.getElementById("turnoIndirizzo");
  const turnoAppoggio = document.getElementById("turnoAppoggio");

  const turniTabs = document.querySelectorAll(".turni-tab");
  const turniRowsContainer = document.getElementById("turniRows");
  const turniMeseSelect = document.getElementById("turniMeseSelect");
  const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  // Comunicazioni elementi
  const comunicazioniList = document.getElementById("comunicazioniList");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
  const comunicazioneForm = document.getElementById("comunicazioneForm");
  const comunicazioneFeedback = document.getElementById("comunicazioneFeedback");
  const badgeTotComunicazioni = document.getElementById("badgeTotComunicazioni");
  const badgeNonLette = document.getElementById("badgeNonLette");
  const badgeUrgenti = document.getElementById("badgeUrgenti");

  // Procedure elementi
  const procedureDepartments = document.getElementById("procedureDepartments");
  const procedureSearchInput = document.getElementById("procedureSearch");
  const procedureButtons = document.getElementById("procedureButtons");
  const procedureCurrentDeptTitle = document.getElementById("procedureCurrentDeptTitle");
  const procedureDetailTitle = document.getElementById("procedureDetailTitle");
  const procedureDetailSubtitle = document.getElementById("procedureDetailSubtitle");
  const procedureStepsList = document.getElementById("procedureSteps");
  const backToDeptsBtn = document.getElementById("backToDepts");

  const badgeProcTotali = document.getElementById("badgeProcTotali");
  const badgeProcCassa = document.getElementById("badgeProcCassa");
  const badgeProcBanco = document.getElementById("badgeProcBanco");
  const badgeProcMagazzino = document.getElementById("badgeProcMagazzino");
  const badgeProcServizi = document.getElementById("badgeProcServizi");

  // ====== FUNZIONI DI SUPPORTO ======

  function setRole(role) {
    currentRole = role;

    if (!rolePill || !assenzeTitle) return;

    if (role === "farmacia") {
      rolePill.textContent = "Farmacia (accesso generico)";
      assenzeTitle.textContent = "Assenze del personale";
    } else if (role === "titolare") {
      rolePill.textContent = "Titolare";
      assenzeTitle.textContent = "Assenze del personale";
    } else if (role === "dipendente") {
      rolePill.textContent = "Dipendente";
      assenzeTitle.textContent = "Le mie assenze";
    }
  }

  function showSection(section) {
    if (!section) return;
    [dashboardSection, assenzePage, turniPage, comunicazioniPage, procedurePage].forEach(sec => {
      if (sec) sec.classList.add("hidden");
    });
    section.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openSidebarMenu() {
    if (!sidebar) return;
    sidebar.classList.add("open");
  }

  function closeSidebarMenu() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
  }

  // ====== LOGIN ======
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const role = tab.getAttribute("data-role");
      if (role === "farmacia") {
        loginRoleLabel.textContent = "Farmacia";
      } else if (role === "titolare") {
        loginRoleLabel.textContent = "Titolare";
      } else {
        loginRoleLabel.textContent = "Dipendente";
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const activeTab = document.querySelector(".auth-tab.active");
      const role = activeTab ? activeTab.getAttribute("data-role") : "farmacia";

      setRole(role);

      authContainer.classList.add("hidden");
      app.classList.remove("hidden");

      showSection(dashboardSection);
    });
  }

  // ====== HAMBURGER / SIDEBAR ======
  if (hamburger) hamburger.addEventListener("click", openSidebarMenu);
  if (closeSidebar) closeSidebar.addEventListener("click", closeSidebarMenu);

  document.addEventListener("click", (e) => {
    if (
      sidebar &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== hamburger
    ) {
      closeSidebarMenu();
    }
  });

  // Navigazione dal menu laterale
  if (sidebar) {
    sidebar.querySelectorAll("li[data-nav]").forEach((item) => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-nav");

        if (target === "dashboard") {
          showSection(dashboardSection);
        } else if (target === "assenzePage") {
          showSection(assenzePage);
        } else if (target === "turniPage") {
          showSection(turniPage);
          renderTurniTable();
        } else if (target === "comunicazioniPage") {
          showSection(comunicazioniPage);
          renderComunicazioni();
        } else if (target === "procedurePage") {
          showSection(procedurePage);
          initProcedurePage();
        }
        closeSidebarMenu();
      });
    });
  }

  // ====== LOGOUT ======
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");

      loginForm && loginForm.reset();
      authTabs.forEach((t) => t.classList.remove("active"));
      authTabs[0].classList.add("active");
      loginRoleLabel.textContent = "Farmacia";
      setRole("farmacia");

      closeSidebarMenu();
    });
  }

  // ====== NAVIGAZIONE INTERNA (BOTTONI CARDS) ======
  if (openAssenzeBtn) {
    openAssenzeBtn.addEventListener("click", () => {
      showSection(assenzePage);
    });
  }

  if (backFromAssenzeBtn) {
    backFromAssenzeBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (openTurniBtn) {
    openTurniBtn.addEventListener("click", () => {
      showSection(turniPage);
      renderTurniTable();
    });
  }

  if (backFromTurniBtn) {
    backFromTurniBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (openComunicazioniBtn) {
    openComunicazioniBtn.addEventListener("click", () => {
      showSection(comunicazioniPage);
      renderComunicazioni();
    });
  }

  if (backFromComunicazioniBtn) {
    backFromComunicazioniBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (openProcedureBtn) {
    openProcedureBtn.addEventListener("click", () => {
      showSection(procedurePage);
      initProcedurePage();
    });
  }

  if (backFromProcedureBtn) {
    backFromProcedureBtn.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  // ====== TURNI: POPOLAMENTO ======
  function initTurnoOggi() {
    const oggi = turniFarmacie.find((t) => t.tipoRange === "oggi");
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
      turnoOggiAppoggioDettagli.textContent =
        "Via Dante 8, Matera – Tel: 0835 111111";
    }
  }

  function renderTurniTable() {
    if (!turniRowsContainer) return;

    const meseFilter = turniMeseSelect ? turniMeseSelect.value : "all";
    const farmaciaFilter = turniFarmaciaSelect ? turniFarmaciaSelect.value : "all";

    let filtered = turniFarmacie.filter((t) => t.tipoRange === currentTurniView);

    if (meseFilter !== "all") {
      const m = Number(meseFilter);
      filtered = filtered.filter((t) => t.mese === m);
    }

    if (farmaciaFilter !== "all") {
      filtered = filtered.filter((t) => t.principale === farmaciaFilter);
    }

    turniRowsContainer.innerHTML = "";

    if (filtered.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "turni-row";
      emptyRow.innerHTML = `<span>Nessun turno per i filtri selezionati.</span>`;
      turniRowsContainer.appendChild(emptyRow);
      return;
    }

    filtered.forEach((t) => {
      const row = document.createElement("div");
      row.className = "turni-row";

      let tipoPillClass = "normale";
      const noteLower = t.note.toLowerCase();
      if (noteLower.includes("festivo") || noteLower.includes("vigilia")) {
        tipoPillClass = "festivo";
      }
      if (noteLower.includes("notturno")) {
        tipoPillClass = "notturno";
      }

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

  function formatDateIT(isoDate) {
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  }

  turniTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      turniTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTurniView = tab.getAttribute("data-view");
      renderTurniTable();
    });
  });

  if (turniMeseSelect) turniMeseSelect.addEventListener("change", renderTurniTable);
  if (turniFarmaciaSelect)
    turniFarmaciaSelect.addEventListener("change", renderTurniTable);

  // ====== COMUNICAZIONI: POPOLAMENTO ======
  function aggiornaBadgeComunicazioni() {
    if (!badgeTotComunicazioni || !badgeNonLette || !badgeUrgenti) return;
    const tot = comunicazioni.length;
    const nonLette = comunicazioni.filter((c) => !c.letta).length;
    const urgenti = comunicazioni.filter((c) => c.categoria === "urgente").length;

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
      filtered = filtered.filter((c) => c.categoria === cat);
    }
    if (soloNonLette) {
      filtered = filtered.filter((c) => !c.letta);
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

    filtered.forEach((c) => {
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
  if (filtroSoloNonLette)
    filtroSoloNonLette.addEventListener("change", renderComunicazioni);

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
        comunicazioneFeedback.textContent =
          "⚠️ Inserisci almeno un titolo e un testo.";
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

  // ====== FORM ASSENZE: SOLO FEEDBACK ======
  const assenzeForm = document.querySelector(".assenze-form");
  const assenzeFeedback = document.getElementById("assenzeFeedback");

  if (assenzeForm && assenzeFeedback) {
    assenzeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      assenzeFeedback.classList.remove("hidden");
      assenzeFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // ====== PROCEDURE: LOGICA ======
  function updateProcedureBadges() {
    if (!badgeProcTotali) return;
    const tot =
      procedureData.cassa.length +
      procedureData.banco.length +
      procedureData.magazzino.length +
      procedureData.servizi.length;

    badgeProcTotali.textContent = tot;
    if (badgeProcCassa) badgeProcCassa.textContent = procedureData.cassa.length;
    if (badgeProcBanco) badgeProcBanco.textContent = procedureData.banco.length;
    if (badgeProcMagazzino)
      badgeProcMagazzino.textContent = procedureData.magazzino.length;
    if (badgeProcServizi)
      badgeProcServizi.textContent = procedureData.servizi.length;
  }

  function renderProcedureButtons() {
    if (!procedureButtons) return;

    const list = procedureData[currentProcedureDept] || [];
    const term = procedureSearchInput
      ? procedureSearchInput.value.trim().toLowerCase()
      : "";

    procedureButtons.innerHTML = "";

    const filtered = list.filter((p) => {
      if (!term) return true;
      return (
        p.titolo.toLowerCase().includes(term) ||
        (p.id && p.id.toLowerCase().includes(term))
      );
    });

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "small-text";
      empty.textContent = "Nessuna procedura trovata per il filtro inserito.";
      procedureButtons.appendChild(empty);
      return;
    }

    filtered.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = `procedure-pill procedure-pill-${currentProcedureDept}`;
      btn.innerHTML = `
        <span class="procedure-code">${p.id}</span>
        <span class="procedure-label">${p.titolo}</span>
        ${
          p.hotkey
            ? `<span class="procedure-hotkey">${p.hotkey}</span>`
            : ""
        }
      `;
      btn.addEventListener("click", () => showProcedureDetail(p));
      procedureButtons.appendChild(btn);
    });
  }

  function showProcedureDetail(proc) {
    if (procedureDetailTitle)
      procedureDetailTitle.textContent = `${proc.id} · ${proc.titolo}`;
    if (procedureDetailSubtitle)
      procedureDetailSubtitle.textContent =
        proc.descrizioneBreve || "Passaggi operativi:";

    if (!procedureStepsList) return;
    procedureStepsList.innerHTML = "";
    proc.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      procedureStepsList.appendChild(li);
    });
  }

  function switchProcedureDept(dept) {
    currentProcedureDept = dept;

    if (procedureCurrentDeptTitle) {
      const label =
        dept === "cassa"
          ? "Cassa"
          : dept === "banco"
          ? "Banco"
          : dept === "magazzino"
          ? "Magazzino"
          : "Servizi & CUP";
      procedureCurrentDeptTitle.textContent = `Procedure – ${label}`;
    }

    if (procedureDepartments) {
      procedureDepartments
        .querySelectorAll("[data-reparto]")
        .forEach((btn) => {
          btn.classList.toggle(
            "active",
            btn.getAttribute("data-reparto") === dept
          );
        });
    }

    if (procedureSearchInput) {
      // non azzero il testo di ricerca per non far perdere il filtro
    }

    renderProcedureButtons();

    // Reset del dettaglio alla prima procedura del reparto
    const first = procedureData[dept][0];
    if (first) showProcedureDetail(first);
  }

  function initProcedurePage() {
    updateProcedureBadges();
    switchProcedureDept(currentProcedureDept || "cassa");
  }

  if (procedureDepartments) {
    procedureDepartments
      .querySelectorAll("[data-reparto]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const dept = btn.getAttribute("data-reparto");
          switchProcedureDept(dept);
        });
      });
  }

  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", () => {
      renderProcedureButtons();
    });
  }

  if (backToDeptsBtn) {
    backToDeptsBtn.addEventListener("click", () => {
      window.scrollTo({
        top: procedurePage ? procedurePage.offsetTop : 0,
        behavior: "smooth"
      });
    });
  }

  // ====== INIT ======
  initTurnoOggi();
  renderComunicazioni();   // per riempire la pagina comunicazioni
  // Le procedure vengono inizializzate quando apri la pagina procedure
});
