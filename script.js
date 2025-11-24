/* ======================================================
   PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO DA ZERO
   JS1 – LOGIN, NAVIGAZIONE, DASHBOARD
====================================================== */

/* ===== STATO GLOBALE ===== */
let currentRole = "farmacia"; // farmacia | titolare | dipendente
let currentPage = "dashboard";

/* ===== ELEMENTI PRINCIPALI ===== */
document.addEventListener("DOMContentLoaded", () => {

  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  const loginForm = document.getElementById("loginForm");
  const loginRoleLabel = document.getElementById("loginRoleLabel");
  const authTabs = document.querySelectorAll(".auth-tab");

  /* PAGINE */
  const dashboard = document.getElementById("dashboard");
  const assenzePage = document.getElementById("assenzePage");
  const turniPage = document.getElementById("turniPage");
  const comunicazioniPage = document.getElementById("comunicazioniPage");
  const procedurePage = document.getElementById("procedurePage");
  const archivioPage = document.getElementById("archivioPage");

  /* SIDEBAR */
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");

  const rolePill = document.getElementById("currentRolePill");


  /* ======================================================
     FUNZIONI BASE
  ====================================================== */

  function setRole(role) {
    currentRole = role;
    if (!rolePill) return;

    if (role === "farmacia") rolePill.textContent = "Farmacia (Accesso Generico)";
    if (role === "titolare") rolePill.textContent = "Titolare";
    if (role === "dipendente") rolePill.textContent = "Dipendente";
  }

  function showPage(pageName) {
    currentPage = pageName;

    [dashboard, assenzePage, turniPage, comunicazioniPage, procedurePage, archivioPage]
      .forEach(p => p.classList.add("hidden"));

    if (pageName === "dashboard") dashboard.classList.remove("hidden");
    if (pageName === "assenze") assenzePage.classList.remove("hidden");
    if (pageName === "turni") turniPage.classList.remove("hidden");
    if (pageName === "comunicazioni") comunicazioniPage.classList.remove("hidden");
    if (pageName === "procedure") procedurePage.classList.remove("hidden");
    if (pageName === "archivio") archivioPage.classList.remove("hidden");

    window.scrollTo(0,0);
  }

  function openSidebarMenu() {
    sidebar.classList.add("open");
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("open");
  }


  /* ======================================================
     LOGIN
  ====================================================== */

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

    showPage("dashboard");
  });


  /* ======================================================
     SIDEBAR / NAVIGAZIONE
  ====================================================== */

  hamburger.addEventListener("click", openSidebarMenu);
  closeSidebar.addEventListener("click", closeSidebarMenu);

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        e.target !== hamburger) {
      closeSidebarMenu();
    }
  });

  sidebar.querySelectorAll("li[data-nav]").forEach(item => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;

      if (target === "dashboard") showPage("dashboard");
      if (target === "assenzePage") showPage("assenze");
      if (target === "turniPage") showPage("turni");
      if (target === "comunicazioniPage") showPage("comunicazioni");
      if (target === "procedurePage") showPage("procedure");
      if (target === "archivioPage") showPage("archivio");

      closeSidebarMenu();
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

    closeSidebarMenu();
  });


  /* ======================================================
     QUI FINISCE JS1
     Dopo continua JS2 → Turni / Comunicazioni / Procedure
  ====================================================== */

});
/* ======================================================
   JS2 – TURNI / COMUNICAZIONI / PROCEDURE / NOTIFICHE
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================================================
     TURNI FARMACIE – DATI DEMO
  ====================================================== */

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

  /* Elementi Turni */
  const turniTabs = document.querySelectorAll(".turni-tab");
  const turniRows = document.getElementById("turniRows");
  const turniMeseSelect = document.getElementById("turniMeseSelect");
  const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

  let currentTurniView = "oggi";

  function formatDateIT(iso) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
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
      turniRows.innerHTML =
        "<div class='turni-row'><span>Nessun turno con questi filtri.</span></div>";
      return;
    }

    filtered.forEach(t => {
      const li = document.createElement("div");
      li.className = "turni-row";

      let noteClass = "normale";
      const lower = t.note.toLowerCase();
      if (lower.includes("notturno")) noteClass = "notturno";
      if (lower.includes("vigilia") || lower.includes("festivo")) noteClass = "festivo";

      li.innerHTML = `
        <span>${formatDateIT(t.data)}</span>
        <span>${t.orario}</span>
        <span>${t.principale}</span>
        <span>${t.appoggio}</span>
        <span>${t.telefono}</span>
        <span><span class="turno-type-pill ${noteClass}">${t.note}</span></span>
      `;

      turniRows.appendChild(li);
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


  /* ======================================================
     COMUNICAZIONI – DEMO
  ====================================================== */

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

  const comunicazioniList = document.getElementById("comunicazioniList");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");

  function renderComunicazioni() {
    if (!comunicazioniList) return;

    const cat = filtroCategoria.value;
    const soloNL = filtroSoloNonLette.checked;

    let filtered = comunicazioni;

    if (cat !== "tutte") {
      filtered = filtered.filter(c => c.categoria === cat);
    }

    if (soloNL) {
      filtered = filtered.filter(c => !c.letta);
    }

    comunicazioniList.innerHTML = "";

    if (filtered.length === 0) {
      comunicazioniList.innerHTML = "<div class='small-text'>Nessuna comunicazione.</div>";
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


  /* ======================================================
     PROCEDURE – DEMO
  ====================================================== */

  const procedureData = [
    {
      id: "p1",
      titolo: "Chiusura Cassa Serale",
      reparto: "cassa",
      aggiornamento: "12/11/2025",
      testo: "1. Controllo giacenza.\n2. Stampa chiusura.\n3. Conta fondo cassa."
    },
    {
      id: "p2",
      titolo: "Ricezione Merce",
      reparto: "magazzino",
      aggiornamento: "22/09/2025",
      testo: "Controllo colli.\nVerifica scadenze.\nCarico in magazzino."
    }
  ];

  const procedureListEl = document.getElementById("procedureList");
  const procedureDetail = document.getElementById("procedureDetail");
  const procedureSearch = document.getElementById("procedureSearch");
  const procedureButtons = document.querySelectorAll(".proc-filter-btn");

  let procedureFilter = "tutti";
  let procSearchTerm = "";

  function renderProcedureList() {
    if (!procedureListEl) return;

    let filtered = procedureData.filter(p => {
      const matchCat = (procedureFilter === "tutti" || p.reparto === procedureFilter);
      const matchSearch = p.titolo.toLowerCase().includes(procSearchTerm) ||
                          p.testo.toLowerCase().includes(procSearchTerm);
      return matchCat && matchSearch;
    });

    procedureListEl.innerHTML = "";

    if (filtered.length === 0) {
      procedureListEl.innerHTML = "<div class='small-text'>Nessuna procedura trovata.</div>";
      procedureDetail.innerHTML = "<p class='muted small-text'>Seleziona una procedura.</p>";
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
    const p = procedureData.find(x => x.id === procId);
    if (!p) return;

    let paragraphs = p.testo.split("\n").map(r => `<p>${r}</p>`).join("");

    procedureDetail.innerHTML = `
      <h3>${p.titolo}</h3>
      <p class="small-text">Reparto: <strong>${p.reparto}</strong> · Agg.: <strong>${p.aggiornamento}</strong></p>
      <div class="divider"></div>
      ${paragraphs}
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


  /* ======================================================
     BADGE NOTIFICHE CARD DASHBOARD
  ====================================================== */

  const notificationConfig = {
    assenze: 1,
    turni: 1,
    comunicazioni: comunicazioni.filter(c => !c.letta).length,
    procedure: 1,
    logistica: 1,
    magazzino: 1
  };

  function initDashboardBadges() {
    Object.keys(notificationConfig).forEach(key => {
      const badge = document.querySelector(`.card-badge[data-card-key="${key}"]`);
      const label = document.querySelector(`.card-badge-label[data-card-key="${key}"]`);
      if (!badge) return;

      const n = notificationConfig[key];

      if (n > 0) {
        badge.classList.add("has-unread");
        badge.querySelector(".badge-count").textContent = n;
        if (label) {
          label.style.display = "block";
          label.textContent = n === 1 ? "Nuovo" : "Nuovi";
        }
      } else {
        badge.classList.remove("has-unread");
        badge.style.display = "none";
        if (label) label.style.display = "none";
      }
    });
  }

  initDashboardBadges();
  renderComunicazioni();
  renderProcedureList();
  renderTurniTable();

});
/* ======================================================
   JS3 – ARCHIVIO FILE (FILE SYSTEM COMPLETO)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===== ELEMENTI ===== */
  const archivioGrid = document.getElementById("archivioGrid");
  const archivioPath = document.getElementById("archivioPath");
  const archivioUpload = document.getElementById("archivioUpload");
  const archivioBtnUpload = document.getElementById("archivioBtnUpload");

  const contextMenu = document.getElementById("archivioMenu");
  const renameModal = document.getElementById("renameModal");
  const renameInput = document.getElementById("renameInput");
  const renameConfirm = document.getElementById("renameConfirm");
  const renameCancel = document.getElementById("renameCancel");

  /* ===== FILE SYSTEM ===== */

  // Ogni cartella avrà struttura:
  // { type: "folder", name: "Cartella", children: [...] }
  // File:
  // { type: "file", name: "Documento.txt", content: base64 }

  let fileSystem = JSON.parse(localStorage.getItem("fs_montesano")) || {

    name: "root",
    type: "folder",
    children: [
      {
        type: "folder",
        name: "Documenti",
        children: []
      },
      {
        type: "folder",
        name: "Foto",
        children: []
      },
      {
        type: "folder",
        name: "Procedure",
        children: []
      },
      {
        type: "file",
        name: "Benvenuto.txt",
        content: btoa("Benvenuto nell’Archivio File della Farmacia Montesano!")
      }
    ]
  };

  let currentFolder = fileSystem;
  let itemToRename = null;


  /* ======================================================
     SALVATAGGIO
  ====================================================== */

  function saveFS() {
    localStorage.setItem("fs_montesano", JSON.stringify(fileSystem));
  }


  /* ======================================================
     RENDER GRIGLIA
  ====================================================== */

  function renderArchivio() {
    archivioGrid.innerHTML = "";

    archivioPath.textContent = "/" + currentFolder.name;

    currentFolder.children.forEach(item => {
      const el = document.createElement("div");
      el.className = "fs-item";
      el.dataset.name = item.name;

      // Icona cartella o file
      if (item.type === "folder") {
        el.innerHTML = `
          <div class="fs-icon folder"></div>
          <div class="fs-label">${item.name}</div>
        `;
      } else {
        el.innerHTML = `
          <div class="fs-icon file"></div>
          <div class="fs-label">${item.name}</div>
        `;
      }

      archivioGrid.appendChild(el);

      /* ===== DOPPIO CLICK = APRI CARTELLA ===== */
      el.addEventListener("dblclick", () => {
        if (item.type === "folder") {
          currentFolder = item;
          renderArchivio();
        }
      });

      /* ===== TASTO DESTRO ===== */
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openContextMenu(e.pageX, e.pageY, item);
      });

      /* ===== MOBILE – long press ===== */
      let pressTimer;
      el.addEventListener("touchstart", (e) => {
        pressTimer = setTimeout(() => {
          openContextMenu(e.touches[0].pageX, e.touches[0].pageY, item);
        }, 600);
      });

      el.addEventListener("touchend", () => clearTimeout(pressTimer));
    });
  }


  /* ======================================================
     MENU TASTO DESTRO
  ====================================================== */

  let selectedItem = null;

  function openContextMenu(x, y, item) {
    selectedItem = item;

    contextMenu.style.top = y + "px";
    contextMenu.style.left = x + "px";
    contextMenu.classList.add("active");
  }

  function closeContextMenu() {
    contextMenu.classList.remove("active");
  }

  document.addEventListener("click", () => closeContextMenu());


  /* ======================================================
     AZIONI MENU: NUOVA CARTELLA, RINOMINA, ELIMINA
  ====================================================== */

  document.getElementById("menuNuova").addEventListener("click", () => {
    const newFolder = {
      type: "folder",
      name: "Nuova Cartella",
      children: []
    };
    currentFolder.children.push(newFolder);
    saveFS();
    renderArchivio();
  });

  document.getElementById("menuRinomina").addEventListener("click", () => {
    if (!selectedItem) return;

    itemToRename = selectedItem;
    renameInput.value = selectedItem.name;

    renameModal.classList.add("active");
    renameInput.focus();
  });

  renameConfirm.addEventListener("click", () => {
    if (itemToRename) {
      itemToRename.name = renameInput.value.trim() || itemToRename.name;
      saveFS();
      renderArchivio();
    }
    renameModal.classList.remove("active");
  });

  renameCancel.addEventListener("click", () => {
    renameModal.classList.remove("active");
  });


  document.getElementById("menuElimina").addEventListener("click", () => {
    if (!selectedItem) return;

    currentFolder.children = currentFolder.children.filter(i => i !== selectedItem);
    saveFS();
    renderArchivio();
  });


  /* ======================================================
     CARICAMENTO FILE
  ====================================================== */

  archivioBtnUpload.addEventListener("click", () => {
    archivioUpload.click();
  });

  archivioUpload.addEventListener("change", () => {
    const files = Array.from(archivioUpload.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];

        const newFile = {
          type: "file",
          name: file.name,
          content: base64
        };

        currentFolder.children.push(newFile);
        saveFS();
        renderArchivio();
      };

      reader.readAsDataURL(file);
    });
  });

  /* ===== START ===== */
  renderArchivio();

});
/* ======================================================
   JS3B – ARCHIVIO FILE FUNZIONI AVANZATE
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ====== ELEMENTI ====== */
  const archivioBackBtn = document.getElementById("archivioBack");

  /* Queste variabili arrivano da JS3A */
  // fileSystem
  // currentFolder
  // saveFS()
  // renderArchivio()
  // selectedItem
  // contextMenu, openContextMenu()

  /* ======================================================
     NAVIGAZIONE INDIETRO
  ====================================================== */

  archivioBackBtn.addEventListener("click", () => {
    if (currentFolder === fileSystem) return;

    function findParent(root, target) {
      for (let child of root.children) {
        if (child === target) return root;
        if (child.type === "folder") {
          const deep = findParent(child, target);
          if (deep) return deep;
        }
      }
      return null;
    }

    const parent = findParent(fileSystem, currentFolder);
    if (parent) {
      currentFolder = parent;
      renderArchivio();
    }
  });


  /* ======================================================
     COPIA & INCOLLA
  ====================================================== */

  let clipboardItem = null;

  document.getElementById("menuCopia").addEventListener("click", () => {
    if (!selectedItem) return;
    clipboardItem = JSON.parse(JSON.stringify(selectedItem)); // copia profonda
  });

  document.getElementById("menuIncolla").addEventListener("click", () => {
    if (!clipboardItem) return;

    let newName = clipboardItem.name;
    newName = ensureUniqueName(newName, currentFolder.children);

    const clone = JSON.parse(JSON.stringify(clipboardItem));
    clone.name = newName;

    currentFolder.children.push(clone);
    saveFS();
    renderArchivio();
  });


  /* ======================================================
     DOWNLOAD FILE
  ====================================================== */

  document.getElementById("menuDownload").addEventListener("click", () => {
    if (!selectedItem || selectedItem.type !== "file") return;

    const a = document.createElement("a");
    a.href = "data:application/octet-stream;base64," + selectedItem.content;
    a.download = selectedItem.name;
    a.click();
  });


  /* ======================================================
     EVITA NOMI DUPLICATI
  ====================================================== */

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


  /* ======================================================
     ORDINE AUTOMATICO: CARTELLE SOPRA, FILE SOTTO
  ====================================================== */

  const oldRender = renderArchivio;
  renderArchivio = function () {
    currentFolder.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });
    oldRender();
  };


  /* ======================================================
     EFFETTINI EXTRA
  ====================================================== */

  document.querySelectorAll(".fs-item").forEach(el => {
    el.addEventListener("mousedown", () => {
      el.classList.add("active");
    });
    el.addEventListener("mouseup", () => {
      el.classList.remove("active");
    });
  });

  /* FINE JS3B */
});
