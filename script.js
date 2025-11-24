// ======================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO
// ======================================================

// ===== DATI DEMO TURNI =====
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

// ===== DATI DEMO COMUNICAZIONI =====
let comunicazioni = [
  {
    id: 1,
    titolo: "Nuova procedura notturni",
    categoria: "urgente",
    autore: "Titolare",
    data: "Oggi",
    testo: "Dal prossimo turno seguire la nuova check-list di chiusura.",
    letta: false
  },
  {
    id: 2,
    titolo: "Verifica armadietto stupefacenti",
    categoria: "importante",
    autore: "Titolare",
    data: "Ieri",
    testo: "Controllare giacenze e scadenze.",
    letta: false
  },
  {
    id: 3,
    titolo: "Aggiornamento promo vetrina",
    categoria: "informativa",
    autore: "Admin",
    data: "2 giorni fa",
    testo: "Aggiornata esposizione stagionale.",
    letta: true
  }
];

// ===== DATI DEMO PROCEDURE =====
const procedureData = [
  {
    id: "p1",
    titolo: "Chiusura cassa serale",
    reparto: "cassa",
    aggiornamento: "12/11/2025",
    testo: "1) Controllo giacenza.\n2) Stampa chiusura.\n3) Conta fondo cassa."
  },
  {
    id: "p2",
    titolo: "Gestione buoni SSN",
    reparto: "cassa",
    aggiornamento: "05/10/2025",
    testo: "Controllare ricetta, dati paziente e allegare copia scontrino al buono."
  },
  {
    id: "p3",
    titolo: "Ricezione merce da grossista",
    reparto: "magazzino",
    aggiornamento: "22/09/2025",
    testo: "Controllo colli, stampa DDT, verifica scadenze, etichettatura e carico."
  },
  {
    id: "p4",
    titolo: "Reso prodotti danneggiati",
    reparto: "logistica",
    aggiornamento: "18/09/2025",
    testo: "Compilare modulo reso, fotografare prodotto, contattare referente."
  },
  {
    id: "p5",
    titolo: "Prenotazione servizi CUP / ECG",
    reparto: "servizi",
    aggiornamento: "01/10/2025",
    testo: "Verificare dati anagrafici, orari disponibili, confermare e stampare promemoria."
  }
];

let currentRole = "farmacia";
let currentTurniView = "oggi";
let procedureFilter = "tutti";
let procSearchTerm = "";

// ===== ARCHIVIO FILE: stato =====
let fsRoot = null;
let currentFolder = null;
let selectedItem = null;
let clipboardItem = null;

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

  // Dashboard turno card
  const turnoOrarioChip = document.getElementById("turnoOrarioChip");
  const turnoNome = document.getElementById("turnoNome");
  const turnoIndirizzo = document.getElementById("turnoIndirizzo");
  const turnoAppoggio = document.getElementById("turnoAppoggio");

  const turnoOggiNome = document.getElementById("turnoOggiNome");
  const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
  const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
  const turnoOggiOrario = document.getElementById("turnoOggiOrario");
  const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
  const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

  // Bottoni rapidi dashboard
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

  // Turni elenco
  const turniTabs = document.querySelectorAll(".turni-tab");
  const turniRows = document.getElementById("turniRows");
  const turniMeseSelect = document.getElementById("turniMeseSelect");
  const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  // Comunicazioni
  const comunicazioniList = document.getElementById("comunicazioniList");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
  const comunicazioneForm = document.getElementById("comunicazioneForm");
  const comunicazioneFeedback = document.getElementById("comunicazioneFeedback");

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

  // ======================================================
  // FUNZIONI BASE
  // ======================================================
  function setRole(role) {
    currentRole = role;
    if (!rolePill) return;
    if (role === "farmacia") rolePill.textContent = "Farmacia (accesso generico)";
    if (role === "titolare") rolePill.textContent = "Titolare";
    if (role === "dipendente") rolePill.textContent = "Dipendente";
  }

  function showSection(section) {
    [dashboardSection, assenzePage, turniPage, comunicazioniPage, procedurePage, archivioPage]
      .forEach(sec => sec && sec.classList.add("hidden"));
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

  // Eventi tab turni
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
  function renderComunicazioni() {
    if (!comunicazioniList) return;

    const cat = filtroCategoria.value;
    const soloNL = filtroSoloNonLette.checked;

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
      empty.textContent = "Nessuna comunicazione.";
      comunicazioniList.appendChild(empty);
      return;
    }

    filtered.forEach(c => {
      const card = document.createElement("div");
      card.className = "com-card";
      card.innerHTML = `
        <div class="com-pill ${c.categoria}">
          ${c.categoria.toUpperCase()}
        </div>
        <div class="com-title">${c.titolo}</div>
        <div class="com-meta">${c.data} · ${c.autore} · ${c.letta ? "Letta" : "Non letta"}</div>
        <div class="com-text">${c.testo}</div>
      `;
      comunicazioniList.appendChild(card);
    });
  }

  if (filtroCategoria) filtroCategoria.addEventListener("change", renderComunicazioni);
  if (filtroSoloNonLette) filtroSoloNonLette.addEventListener("change", renderComunicazioni);

  if (comunicazioneForm && comunicazioneFeedback) {
    comunicazioneForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titolo = document.getElementById("comTitolo").value.trim();
      const categoria = document.getElementById("comCategoria").value;
      const testo = document.getElementById("comTesto").value.trim();

      if (!titolo || !testo) {
        comunicazioneFeedback.textContent = "⚠️ Inserisci almeno titolo e testo.";
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
      comunicazioneFeedback.textContent = "✅ Comunicazione registrata (demo).";
      comunicazioneFeedback.classList.remove("hidden");
      comunicazioneForm.reset();
      renderComunicazioni();
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
      procedureListEl.innerHTML = "<div class='small-text'>Nessuna procedura trovata.</div>";
      if (procedureDetail) {
        procedureDetail.innerHTML = "<p class='small-text muted'>Nessuna procedura selezionata.</p>";
      }
      return;
    }

    filtered.forEach(p => {
      const el = document.createElement("div");
      el.className = "proc-item";
      el.dataset.procId = p.id;

      el.innerHTML = `
        <div class="proc-item-main">
          <div class="proc-item-title">${p.titolo}</div>
          <div class="proc-item-meta">${p.reparto} · Agg.: ${p.aggiornamento}</div>
        </div>
        <div class="proc-tag">Apri</div>
      `;

      el.addEventListener("click", () => showProcedure(p.id));
      procedureListEl.appendChild(el);
    });
  }

  function showProcedure(procId) {
    if (!procedureDetail) return;
    const p = procedureData.find(x => x.id === procId);
    if (!p) return;

    const paragrafi = p.testo
      .split("\n")
      .map(r => `<p>${r}</p>`)
      .join("");

    procedureDetail.innerHTML = `
      <h3>${p.titolo}</h3>
      <p class="small-text">Reparto: <strong>${p.reparto}</strong> · Agg.: <strong>${p.aggiornamento}</strong></p>
      <div class="divider"></div>
      ${paragrafi}
    `;
  }

  procedureButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      procedureButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      procedureFilter = btn.dataset.reparto;
      renderProcedureList();
    });
  });

  if (procedureSearch) {
    procedureSearch.addEventListener("input", e => {
      procSearchTerm = e.target.value.trim().toLowerCase();
      renderProcedureList();
    });
  }

  // ======================================================
  // ARCHIVIO FILE
  // ======================================================

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

  function saveFS() {
    localStorage.setItem("fs_montesano", JSON.stringify(fsRoot));
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

  let lastSelectedEl = null;

  function clearSelection() {
    if (lastSelectedEl) lastSelectedEl.classList.remove("selected");
    lastSelectedEl = null;
    selectedItem = null;
  }

  function renderArchivio() {
    if (!archivioGrid || !currentFolder) return;

    // Ordina: cartelle prima, poi file
    currentFolder.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });

    const pathArr = getPathArray(currentFolder);
    archivioPath.textContent = "/" + pathArr.join("/");

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
        clearSelection();
        el.classList.add("selected");
        lastSelectedEl = el;
        selectedItem = item;
      });

      // doppio click -> apri cartella
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (item.type === "folder") {
          currentFolder = item;
          clearSelection();
          renderArchivio();
        }
      });

      // tasto destro
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        el.classList.add("selected");
        lastSelectedEl = el;
        selectedItem = item;
        openContextMenu(e.pageX, e.pageY);
      });

      // long press mobile
      let pressTimer;
      el.addEventListener("touchstart", (e) => {
        pressTimer = setTimeout(() => {
          const touch = e.touches[0];
          clearSelection();
          el.classList.add("selected");
          lastSelectedEl = el;
          selectedItem = item;
          openContextMenu(touch.pageX, touch.pageY);
        }, 600);
      });
      el.addEventListener("touchend", () => clearTimeout(pressTimer));
    });
  }

  function openContextMenu(x, y) {
    if (!archivioContextMenu) return;
    archivioContextMenu.style.left = x + "px";
    archivioContextMenu.style.top = y + "px";
    archivioContextMenu.classList.remove("hidden");
  }

  function closeContextMenu() {
    if (!archivioContextMenu) return;
    archivioContextMenu.classList.add("hidden");
  }

  document.addEventListener("click", (e) => {
    if (!archivioContextMenu) return;
    if (!archivioContextMenu.contains(e.target)) {
      closeContextMenu();
      clearSelection();
    }
  });

  // Nuova cartella (toolbar + menu)
  function creaNuovaCartella() {
    if (!currentFolder) return;
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

  if (archivioNewFolderBtn) {
    archivioNewFolderBtn.addEventListener("click", () => {
      creaNuovaCartella();
    });
  }

  if (menuNuova) {
    menuNuova.addEventListener("click", () => {
      creaNuovaCartella();
      closeContextMenu();
    });
  }

  // Rinomina
  if (menuRinomina) {
    menuRinomina.addEventListener("click", () => {
      if (!selectedItem || !currentFolder) return;
      const nuovo = prompt("Nuovo nome:", selectedItem.name);
      if (!nuovo) {
        closeContextMenu();
        return;
      }
      const safeName = ensureUniqueName(nuovo.trim(), currentFolder.children.filter(i => i !== selectedItem));
      selectedItem.name = safeName;
      saveFS();
      renderArchivio();
      closeContextMenu();
    });
  }

  // Elimina
  if (menuElimina) {
    menuElimina.addEventListener("click", () => {
      if (!selectedItem || !currentFolder) return;
      const ok = confirm(`Vuoi eliminare "${selectedItem.name}"?`);
      if (!ok) {
        closeContextMenu();
        return;
      }
      currentFolder.children = currentFolder.children.filter(i => i !== selectedItem);
      saveFS();
      renderArchivio();
      closeContextMenu();
      clearSelection();
    });
  }

  // Copia
  if (menuCopia) {
    menuCopia.addEventListener("click", () => {
      if (!selectedItem) return;
      clipboardItem = JSON.parse(JSON.stringify(selectedItem));
      closeContextMenu();
    });
  }

  // Incolla
  if (menuIncolla) {
    menuIncolla.addEventListener("click", () => {
      if (!clipboardItem || !currentFolder) return;
      const clone = JSON.parse(JSON.stringify(clipboardItem));
      clone.name = ensureUniqueName(clone.name, currentFolder.children);
      currentFolder.children.push(clone);
      saveFS();
      renderArchivio();
      closeContextMenu();
    });
  }

  // Download file
  if (menuDownload) {
    menuDownload.addEventListener("click", () => {
      if (!selectedItem || selectedItem.type !== "file") {
        alert("Seleziona un file prima di scaricare.");
        closeContextMenu();
        return;
      }
      const a = document.createElement("a");
      a.href = "data:application/octet-stream;base64," + selectedItem.content;
      a.download = selectedItem.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      closeContextMenu();
    });
  }

  // Upload file
  if (archivioBtnUpload && archivioUpload) {
    archivioBtnUpload.addEventListener("click", () => archivioUpload.click());

    archivioUpload.addEventListener("change", () => {
      const files = Array.from(archivioUpload.files);
      if (!files.length || !currentFolder) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          let name = ensureUniqueName(file.name, currentFolder.children);
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

      archivioUpload.value = "";
    });
  }

  // Cartella su
  if (archivioUpBtn) {
    archivioUpBtn.addEventListener("click", () => {
      if (!currentFolder || currentFolder === fsRoot) return;

      function findParent(node, target) {
        if (!node.children) return null;
        for (const child of node.children) {
          if (child === target) return node;
          if (child.type === "folder") {
            const found = findParent(child, target);
            if (found) return found;
          }
        }
        return null;
      }

      const parent = findParent(fsRoot, currentFolder);
      if (parent) {
        currentFolder = parent;
        clearSelection();
        renderArchivio();
      }
    });
  }

  function initArchivio() {
    loadFS();
    renderArchivio();
  }

  // ======================================================
  // INIT GENERALE
  // ======================================================
  initTurnoOggi();
  renderTurniTable();
  renderComunicazioni();
  renderProcedureList();
  initArchivio();

});
