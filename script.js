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

// ====== DATI DEMO: NOTIFICHE ======
let notifiche = [
  {
    id: 1,
    sezione: "assenze",
    titolo: "Permesso approvato",
    testo: "La tua richiesta di permesso del 10/01 è stata approvata.",
    data: "Oggi",
    letto: false
  },
  {
    id: 2,
    sezione: "assenze",
    titolo: "Ferie rifiutate",
    testo: "Le ferie dal 03/02 al 05/02 sono state rifiutate.",
    data: "Ieri",
    letto: false
  },
  {
    id: 3,
    sezione: "assenze",
    titolo: "Promemoria",
    testo: "Ricorda di consegnare il certificato per la malattia del 05/11.",
    data: "2 giorni fa",
    letto: false
  }
];
// ====== DATI DEMO: PROCEDURE ======
const procedureData = [
  {
    id: 1,
    titolo: "Chiusura cassa - procedura standard",
    reparto: "cassa",
    repartoLabel: "Cassa / Banco",
    ultimoAggiornamento: "12/11/2025",
    testoBreve: "Passaggi per chiudere la cassa a fine giornata senza differenze.",
    testoCompleto:
      "1. Verificare che non ci siano scontrini sospesi o non chiusi.\n" +
      "2. Stampare il rapporto di cassa dal gestionale.\n" +
      "3. Contare fisicamente il contante presente in cassa.\n" +
      "4. Confrontare il totale contante con quanto indicato dal gestionale.\n" +
      "5. Registrare eventuali differenze sul registro cassa indicando data, ora e nome operatore.\n" +
      "6. Riporre il denaro nella cassaforte secondo la procedura interna.\n" +
      "7. Riporre le chiavi della cassa nel posto dedicato.",
    tags: ["cassa", "chiusura", "incassi", "fine giornata"]
  },
  {
    id: 2,
    titolo: "Errore pagamento POS con scontrino contanti",
    reparto: "cassa",
    repartoLabel: "Cassa / Banco",
    ultimoAggiornamento: "10/11/2025",
    testoBreve: "Gestione errore quando lo scontrino è contanti ma il cliente paga con POS.",
    testoCompleto:
      "1. Se è stato emesso scontrino come CONTANTI ma il cliente ha pagato con POS:\n" +
      "   - NON annullare l'operazione POS se è già andata a buon fine.\n" +
      "2. Registrare sul quaderno errori di cassa:\n" +
      "   - Data, ora, numero scontrino, importo e descrizione.\n" +
      "3. A fine giornata verificare la differenza tra corrispettivi e incassi POS:\n" +
      "   - La differenza dovrà essere spiegata tramite il registro errori.\n" +
      "4. Informare il titolare se la situazione si ripete spesso.",
    tags: ["pos", "errore", "cassa", "corrispettivi"]
  },
  {
    id: 3,
    titolo: "Gestione reso cliente con scontrino",
    reparto: "cassa",
    repartoLabel: "Cassa / Banco",
    ultimoAggiornamento: "05/11/2025",
    testoBreve: "Come gestire un reso con scontrino fiscale presente.",
    testoCompleto:
      "1. Verificare che il prodotto sia integro, non aperto e rivendibile.\n" +
      "2. Controllare lo scontrino fiscale (data, importo, prodotto).\n" +
      "3. Procedere con il reso sul gestionale seguendo la funzione dedicata.\n" +
      "4. Emettere documento di reso o buono secondo procedura interna.\n" +
      "5. Riporre il prodotto nella zona dedicata ai resi in attesa di gestione magazzino.",
    tags: ["reso", "cliente", "scontrino"]
  },
  {
    id: 4,
    titolo: "Ricezione merce da corriere",
    reparto: "logistica",
    repartoLabel: "Logistica",
    ultimoAggiornamento: "08/11/2025",
    testoBreve: "Controlli da effettuare quando arriva merce in farmacia.",
    testoCompleto:
      "1. Controllare che il numero di colli consegnati corrisponda al DDT.\n" +
      "2. Verificare integrità dei colli (nessun danneggiamento evidente).\n" +
      "3. Firmare il DDT solo dopo verifica visiva.\n" +
      "4. Consegnare il DDT alla magazziniera per il carico in magazzino.\n" +
      "5. Segnalare subito eventuali anomalie al titolare (prodotti mancanti o rotti).",
    tags: ["corriere", "merce", "logistica", "ddt"]
  },
  {
    id: 5,
    titolo: "Carico merce in magazzino",
    reparto: "magazzino",
    repartoLabel: "Magazzino",
    ultimoAggiornamento: "09/11/2025",
    testoBreve: "Come caricare correttamente la merce nel gestionale.",
    testoCompleto:
      "1. Recuperare il DDT o fattura di acquisto.\n" +
      "2. Dal gestionale aprire la funzione di carico magazzino.\n" +
      "3. Inserire o controllare il fornitore e la data documento.\n" +
      "4. Verificare codici, quantità e scadenze dei prodotti.\n" +
      "5. Salvare il carico solo dopo aver controllato tutti i dati.\n" +
      "6. Sistemare fisicamente i prodotti negli scaffali dedicati, rispettando FEFO/ FIFO.",
    tags: ["magazzino", "carico", "fornitori", "ddt"]
  },
  {
    id: 6,
    titolo: "Gestione servizi CUP / prenotazioni",
    reparto: "servizi",
    repartoLabel: "Servizi",
    ultimoAggiornamento: "07/11/2025",
    testoBreve: "Linee guida per prenotazioni e gestione appuntamenti.",
    testoCompleto:
      "1. Verificare sempre i dati anagrafici del paziente prima di confermare la prenotazione.\n" +
      "2. Illustrare eventuali ticket o costi aggiuntivi.\n" +
      "3. Stampare o comunicare chiaramente data, ora e luogo della prestazione.\n" +
      "4. In caso di modifica o annullo, seguire la procedura ufficiale del portale.\n" +
      "5. Annotare eventuali note importanti (es. arrivo anticipato, documenti da portare).",
    tags: ["servizi", "cup", "prenotazioni"]
  }
];

// ====== STATO ======
let currentRole = "farmacia"; // farmacia | titolare | dipendente
let currentTurniView = "oggi"; // oggi | settimana | mese

let currentProcedureReparto = "tutti";
let currentProcedureSearch = "";

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

  // Sezioni
  const dashboardSection = document.getElementById("dashboard");
  const assenzePage = document.getElementById("assenzePage");
  const turniPage = document.getElementById("turniPage");
  const comunicazioniPage = document.getElementById("comunicazioniPage");
  const procedurePage = document.getElementById("procedurePage");

  // Pulsanti navigazione rapida
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
  const procedureSearchInput = document.getElementById("procedureSearch");
  const procedureListContainer = document.getElementById("procedureList");
  const procedureDetailTitle = document.getElementById("procedureDetailTitle");
  const procedureDetailMeta = document.getElementById("procedureDetailMeta");
  const procedureDetailBody = document.getElementById("procedureDetailBody");
  const procedureFilterButtons = document.querySelectorAll(".proc-filter");
  const badgeProcTotali = document.getElementById("badgeProcTotali");
  const badgeProcCassa = document.getElementById("badgeProcCassa");
  const badgeProcAggiornate = document.getElementById("badgeProcAggiornate");

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
    // Nasconde tutte le sezioni principali
    [dashboardSection, assenzePage, turniPage, comunicazioniPage, procedurePage].forEach(
      (sec) => {
        if (sec) sec.classList.add("hidden");
      }
    );
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

      // reset login
      if (loginForm) loginForm.reset();
      authTabs.forEach((t) => t.classList.remove("active"));
      if (authTabs[0]) authTabs[0].classList.add("active");
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

  function aggiornaBadgeProcedure() {
    if (!badgeProcTotali || !badgeProcCassa || !badgeProcAggiornate) return;

    const tot = procedureData.length;
    const cassaCount = procedureData.filter((p) => p.reparto === "cassa").length;
    const ultimo = procedureData[0] ? procedureData[0].ultimoAggiornamento : "—";

    badgeProcTotali.textContent = `Totali: ${tot}`;
    badgeProcCassa.textContent = `Cassa/Banco: ${cassaCount}`;
    badgeProcAggiornate.textContent = `Ultimo aggiornamento: ${ultimo}`;
  }

  function renderProcedureList() {
    if (!procedureListContainer) return;

    const term = currentProcedureSearch.trim().toLowerCase();

    let filtered = procedureData.filter((p) => {
      const matchReparto =
        currentProcedureReparto === "tutti" || p.reparto === currentProcedureReparto;

      const fullText =
        (p.titolo + " " + p.testoBreve + " " + p.tags.join(" ")).toLowerCase();

      const matchSearch = term === "" || fullText.includes(term);

      return matchReparto && matchSearch;
    });

    procedureListContainer.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "small-text";
      empty.textContent = "Nessuna procedura trovata per i filtri selezionati.";
      procedureListContainer.appendChild(empty);
      return;
    }

    filtered.forEach((p) => {
      const item = document.createElement("div");
      item.className = "procedure-item";
      item.setAttribute("data-id", String(p.id));

      const pillClass = `procedure-reparto-pill ${p.reparto}`;

      item.innerHTML = `
        <div class="procedure-item-title">${p.titolo}</div>
        <div class="procedure-item-meta">
          <span class="${pillClass}">${p.repartoLabel}</span>
          <span>Ult. agg.: ${p.ultimoAggiornamento}</span>
        </div>
      `;

      procedureListContainer.appendChild(item);
    });
  }

  function mostraDettaglioProcedura(proc) {
    if (!procedureDetailTitle || !procedureDetailMeta || !procedureDetailBody) return;

    procedureDetailTitle.textContent = proc.titolo;
    procedureDetailMeta.textContent = `${proc.repartoLabel} · Ultimo aggiornamento: ${proc.ultimoAggiornamento}`;
    procedureDetailBody.textContent = proc.testoCompleto;
  }

  function initProcedurePage() {
    aggiornaBadgeProcedure();

    // Se è la prima volta che entro, resetto filtri e ricerca
    currentProcedureReparto = "tutti";
    currentProcedureSearch = "";
    if (procedureSearchInput) procedureSearchInput.value = "";

    if (procedureFilterButtons.length > 0) {
      procedureFilterButtons.forEach((b) => b.classList.remove("active"));
      // attivo il primo (Tutte)
      procedureFilterButtons[0].classList.add("active");
    }

    renderProcedureList();

    if (procedureData[0]) {
      mostraDettaglioProcedura(procedureData[0]);
    }
  }

  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", (e) => {
      currentProcedureSearch = e.target.value || "";
      renderProcedureList();
    });
  }

  if (procedureFilterButtons.length > 0) {
    procedureFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        procedureFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentProcedureReparto = btn.getAttribute("data-reparto") || "tutti";
        renderProcedureList();
      });
    });
  }

  if (procedureListContainer) {
    procedureListContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".procedure-item");
      if (!item) return;
      const id = Number(item.getAttribute("data-id"));
      const proc = procedureData.find((p) => p.id === id);
      if (!proc) return;
      mostraDettaglioProcedura(proc);
    });
  }

  // ====== INIT ======
  initTurnoOggi();
  renderComunicazioni();
});
