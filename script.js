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

// ====== DATI DEMO: PROCEDURE PER REPARTO ======
const procedureData = {
  cassa: {
    label: "Cassa",
    color: "#f1c40f", // giallo
    items: [
      {
        codice: "C1",
        titolo: "Doppio scontrino / errore importo",
        testo:
          "In caso di doppio scontrino o importo errato: annulla lo scontrino, compila il registro interno errori, avvisa il titolare se l’importo è elevato."
      },
      {
        codice: "C2",
        titolo: "Pagamento misto contanti/POS",
        testo:
          "Registra prima la parte in contanti, poi la parte elettronica. Verifica che il totale coincida con l’importo della vendita."
      },
      {
        codice: "C3",
        titolo: "Chiusura cassa serale",
        testo:
          "Conta contanti, confronta con gestionale, compila modulo chiusura e segnala eventuali differenze."
      }
    ]
  },
  banco: {
    label: "Banco",
    color: "#e74c3c", // rosso
    items: [
      {
        codice: "B1",
        titolo: "Gestione cliente senza ricetta",
        testo:
          "Verifica se il prodotto è SOP/OTC. In caso di dubbio consulta il farmacista responsabile."
      },
      {
        codice: "B2",
        titolo: "Consiglio integratori stagionali",
        testo:
          "Segui lo schema consigli approvato dal titolare per vitamina C, D, multivitaminici, ecc."
      }
    ]
  },
  magazzino: {
    label: "Magazzino",
    color: "#e67e22", // arancione
    items: [
      {
        codice: "M1",
        titolo: "Controllo scadenze mensili",
        testo:
          "Ogni inizio mese controlla le scadenze dei prossimi 3 mesi a scaffale e in magazzino. Sposta i prodotti in area promozionale se previsto."
      },
      {
        codice: "M2",
        titolo: "Ricezione merce corrieri",
        testo:
          "Verifica DDT, confronta con l’ordine, segnala immediatamente eventuali colli mancanti o rotti."
      },
      {
        codice: "M3",
        titolo: "Gestione merce rotta",
        testo:
          "Fotografa il danno, registra il lotto, avvisa il titolare e prepara richiesta reso al fornitore."
      }
    ]
  },
  servizi: {
    label: "Servizi",
    color: "#3498db", // blu
    items: [
      {
        codice: "S1",
        titolo: "Prenotazione ECG / holter",
        testo:
          "Registra nome, recapito, data e orario. Verifica consenso informato firmato prima dell’esecuzione."
      },
      {
        codice: "S2",
        titolo: "Referti da consegnare",
        testo:
          "Consegna solo al diretto interessato o delegato. Richiedi firma di ritiro sul registro servizi."
      }
    ]
  },
  sicurezza: {
    label: "Sicurezza",
    color: "#9b59b6", // viola
    items: [
      {
        codice: "K1",
        titolo: "Gestione chiavi farmacia",
        testo:
          "Le chiavi sono personali e non cedibili. In caso di smarrimento avvisa subito il titolare."
      },
      {
        codice: "K2",
        titolo: "Allarme e chiusura serale",
        testo:
          "Verifica porta retro, saracinesca, allarme inserito. Firma sul registro chiusura."
      }
    ]
  }
};

// ====== STATO ======
let currentRole = "farmacia"; // farmacia | titolare | dipendente
let currentTurniView = "oggi"; // oggi | settimana | mese
let currentReparto = "cassa";  // per la pagina Procedure

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
  const procedureBadge = document.getElementById("procedureBadge");
  const badgeProcTot = document.getElementById("badgeProcTot");
  const badgeProcCassa = document.getElementById("badgeProcCassa");
  const badgeProcBanco = document.getElementById("badgeProcBanco");
  const countCassa = document.getElementById("countCassa");
  const countBanco = document.getElementById("countBanco");
  const countMagazzino = document.getElementById("countMagazzino");
  const countServizi = document.getElementById("countServizi");
  const countSicurezza = document.getElementById("countSicurezza");
  const procedureListTitle = document.getElementById("procedureListTitle");
  const procedureListSubtitle = document.getElementById("procedureListSubtitle");
  const procedureListEl = document.getElementById("procedureList");
  const procedureSearchInput = document.getElementById("procedureSearch");
  const procedureBackToRepartiBtn = document.getElementById("procedureBackToReparti");
  const procedureDetailCard = document.getElementById("procedureDetailCard");
  const procedureDetailTitle = document.getElementById("procedureDetailTitle");
  const procedureDetailReparto = document.getElementById("procedureDetailReparto");
  const procedureDetailText = document.getElementById("procedureDetailText");
  const repartoButtons = document.querySelectorAll(".proc-reparto-btn");

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
          openProcedurePage();
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
      openProcedurePage();
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

  // ====== PROCEDURE: FUNZIONI ======

  function initProcedureBadges() {
    const tot =
      procedureData.cassa.items.length +
      procedureData.banco.items.length +
      procedureData.magazzino.items.length +
      procedureData.servizi.items.length +
      procedureData.sicurezza.items.length;

    if (procedureBadge) procedureBadge.textContent = tot;
    if (badgeProcTot) badgeProcTot.textContent = `Totali: ${tot}`;
    if (badgeProcCassa)
      badgeProcCassa.textContent = `Cassa: ${procedureData.cassa.items.length}`;
    if (badgeProcBanco)
      badgeProcBanco.textContent = `Banco: ${procedureData.banco.items.length}`;

    if (countCassa)
      countCassa.textContent = `${procedureData.cassa.items.length} procedure`;
    if (countBanco)
      countBanco.textContent = `${procedureData.banco.items.length} procedure`;
    if (countMagazzino)
      countMagazzino.textContent = `${procedureData.magazzino.items.length} procedure`;
    if (countServizi)
      countServizi.textContent = `${procedureData.servizi.items.length} procedure`;
    if (countSicurezza)
      countSicurezza.textContent = `${procedureData.sicurezza.items.length} procedure`;
  }

  function highlightRepartoButton() {
    repartoButtons.forEach((btn) => {
      const rep = btn.getAttribute("data-reparto");
      if (rep === currentReparto) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function renderProcedureList() {
    if (!procedureListEl || !procedureData[currentReparto]) return;

    const repartoInfo = procedureData[currentReparto];
    const color = repartoInfo.color;
    const searchTerm = procedureSearchInput
      ? procedureSearchInput.value.toLowerCase().trim()
      : "";

    if (procedureListTitle)
      procedureListTitle.textContent = `Procedure – ${repartoInfo.label}`;

    const baseSubtitle = "Tocca una procedura per vedere il dettaglio.";
    if (procedureListSubtitle) procedureListSubtitle.textContent = baseSubtitle;

    procedureListEl.innerHTML = "";

    let items = repartoInfo.items;
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.titolo.toLowerCase().includes(searchTerm) ||
          item.codice.toLowerCase().includes(searchTerm)
      );
    }

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "small-text";
      empty.textContent = "Nessuna procedura trovata per questa ricerca (demo).";
      procedureListEl.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "procedure-item-btn";
      btn.style.backgroundColor = color;
      btn.style.color = "#ffffff";
      btn.style.border = "none";

      btn.innerHTML = `<strong>${item.codice}</strong> – ${item.titolo}`;

      btn.addEventListener("click", () => {
        if (!procedureDetailCard) return;
        procedureDetailCard.classList.remove("hidden");
        if (procedureDetailTitle) procedureDetailTitle.textContent = item.titolo;
        if (procedureDetailReparto)
          procedureDetailReparto.textContent = `${repartoInfo.label} · ${item.codice}`;
        if (procedureDetailText) procedureDetailText.textContent = item.testo;
        procedureDetailCard.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      procedureListEl.appendChild(btn);
    });
  }

  function openProcedurePage() {
    currentReparto = "cassa";
    highlightRepartoButton();
    initProcedureBadges();
    if (procedureSearchInput) procedureSearchInput.value = "";
    renderProcedureList();
    showSection(procedurePage);
  }

  if (repartoButtons.length > 0) {
    repartoButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rep = btn.getAttribute("data-reparto");
        currentReparto = rep;
        highlightRepartoButton();
        if (procedureSearchInput) procedureSearchInput.value = "";
        renderProcedureList();
      });
    });
  }

  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", () => {
      renderProcedureList();
    });
  }

  if (procedureBackToRepartiBtn) {
    procedureBackToRepartiBtn.addEventListener("click", () => {
      // Torna in alto nella pagina procedure, con reparti ben visibili
      if (procedurePage) {
        procedurePage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ====== INIT ======
  initTurnoOggi();
  renderComunicazioni();
  initProcedureBadges();
});
