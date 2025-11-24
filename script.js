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

// ====== DATI DEMO: NOTIFICHE (per pallino rosso) ======
const notificationData = {
  assenze: [
    {
      id: "ass-1",
      title: "Richiesta permesso approvata",
      message: "La richiesta di permesso del 20/12 è stata approvata dal titolare.",
      read: false
    },
    {
      id: "ass-2",
      title: "Richiesta ferie rifiutata",
      message: "Le ferie richieste per il 10/01 non sono state approvate.",
      read: false
    }
  ],
  turni: [
    {
      id: "tur-1",
      title: "Cambio turno notturno",
      message: "Il turno notturno di oggi è stato modificato. Verifica l'elenco turni.",
      read: false
    }
  ],
  comunicazioni: [
    {
      id: "com-1",
      title: "Nuova comunicazione urgente",
      message: "È stata pubblicata una nuova comunicazione urgente.",
      read: false
    }
  ],
  procedure: [
    {
      id: "proc-1",
      title: "Procedura chiusura cassa aggiornata",
      message: "Consulta la nuova versione della procedura di chiusura cassa.",
      read: false
    }
  ],
  logistica: [
    {
      id: "log-1",
      title: "Arrivo nuovo espositore",
      message: "È previsto l'arrivo di un nuovo espositore in magazzino.",
      read: false
    }
  ],
  magazziniera: [
    {
      id: "mag-1",
      title: "Controllo scadenze",
      message: "Ricorda il controllo scadenze prodotti reparto banco 1.",
      read: false
    }
  ]
};

const NOTIF_SECTION_LABELS = {
  assenze: "Assenze del personale",
  turni: "Farmacie di turno",
  comunicazioni: "Comunicazioni interne",
  procedure: "Procedure",
  logistica: "Logistica",
  magazziniera: "Magazziniera"
};

// ====== STATO ======
let currentRole = "farmacia"; // farmacia | titolare | dipendente
let currentTurniView = "oggi"; // oggi | settimana | mese

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

  // Pulsanti navigazione rapida
  const openAssenzeBtn = document.getElementById("openAssenze");
  const backFromAssenzeBtn = document.getElementById("backFromAssenze");
  const openTurniBtn = document.getElementById("openTurni");
  const backFromTurniBtn = document.getElementById("backFromTurni");
  const openComunicazioniBtn = document.getElementById("openComunicazioni");
  const backFromComunicazioniBtn = document.getElementById("backFromComunicazioni");

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

  // Notifiche (badge + popup)
  const notifModal = document.getElementById("notifModal");
  const notifModalTitle = document.getElementById("notifModalTitle");
  const notifModalList = document.getElementById("notifModalList");
  const notifModalClose = document.getElementById("notifModalClose");

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
    [dashboardSection, assenzePage, turniPage, comunicazioniPage].forEach((sec) => {
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

  // ====== NOTIFICHE: LOGICA ======

  function getUnreadCount(sectionKey) {
    const list = notificationData[sectionKey] || [];
    return list.filter((n) => !n.read).length;
  }

  function updateNotificationBadge(sectionKey) {
    const badge = document.querySelector(
      `.notif-badge[data-section="${sectionKey}"]`
    );
    const label = document.querySelector(
      `.notif-label[data-section="${sectionKey}"]`
    );

    if (!badge || !label) return;

    const unread = getUnreadCount(sectionKey);

    if (unread === 0) {
      badge.classList.add("hidden");
      label.classList.add("hidden");
      return;
    }

    badge.classList.remove("hidden");
    label.classList.remove("hidden");

    badge.textContent = unread;
    label.textContent = unread === 1 ? "nuovo" : "nuovi";
  }

  function renderNotificationList(sectionKey) {
    if (!notifModalList) return;

    notifModalList.innerHTML = "";

    const list = notificationData[sectionKey] || [];
    const unread = list.filter((n) => !n.read);

    if (unread.length === 0) {
      const p = document.createElement("p");
      p.className = "small-text";
      p.textContent = "Nessuna nuova notifica per questa sezione.";
      notifModalList.appendChild(p);
      return;
    }

    unread.forEach((n) => {
      const item = document.createElement("div");
      item.className = "notif-item";

      const title = document.createElement("h3");
      title.className = "notif-item-title";
      title.textContent = n.title;

      const text = document.createElement("p");
      text.className = "notif-item-text";
      text.textContent = n.message;

      const footer = document.createElement("div");
      footer.className = "notif-item-footer";

      const btn = document.createElement("button");
      btn.className = "btn-primary small";
      btn.textContent = "Presa visione";

      btn.addEventListener("click", () => {
        n.read = true;
        updateNotificationBadge(sectionKey);
        renderNotificationList(sectionKey);
      });

      footer.appendChild(btn);
      item.appendChild(title);
      item.appendChild(text);
      item.appendChild(footer);

      notifModalList.appendChild(item);
    });
  }

  function openNotificationModal(sectionKey) {
    if (!notifModal || !notifModalTitle) return;

    const label = NOTIF_SECTION_LABELS[sectionKey] || sectionKey;
    notifModalTitle.textContent = `Notifiche – ${label}`;

    renderNotificationList(sectionKey);
    notifModal.dataset.section = sectionKey;
    notifModal.classList.remove("hidden");
  }

  function closeNotificationModal() {
    if (!notifModal) return;
    notifModal.classList.add("hidden");
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
    if (turnoOggiIndirizzo)
      turnoOggiIndirizzo.textContent = "Via Esempio 12, Matera";
    if (turnoOggiTelefono)
      turnoOggiTelefono.textContent = `Tel: ${oggi.telefono}`;
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
    const farmaciaFilter = turniFarmaciaSelect
      ? turniFarmaciaSelect.value
      : "all";

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
      empty.textContent =
        "Nessuna comunicazione per i filtri selezionati (demo).";
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

  // ====== NOTIFICHE: EVENTI ======
  document.querySelectorAll(".notif-badge, .notif-label").forEach((el) => {
    const section = el.getAttribute("data-section");
    if (!section) return;

    el.addEventListener("click", () => {
      openNotificationModal(section);
    });
  });

  if (notifModalClose) {
    notifModalClose.addEventListener("click", closeNotificationModal);
  }

  if (notifModal) {
    const backdrop = notifModal.querySelector(".notif-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeNotificationModal);
    }
  }

  // ====== INIT ======
  initTurnoOggi();
  renderComunicazioni();

  // inizializza badge notifiche su tutte le sezioni
  Object.keys(notificationData).forEach(updateNotificationBadge);
});
