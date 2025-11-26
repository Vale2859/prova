// ======================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO
// ======================================================

// ------- DATI DEMO ASSENZE -------
const assenzeDemo = [
  { date: "2025-11-26", names: ["Mario Rossi", "Giulia Bianchi"] },
  { date: "2025-11-28", names: ["Cosimo Verdi"] },
  { date: "2025-12-02", names: ["Annalisa Neri"] },
  { date: "2025-12-05", names: ["Daniela Blu"] }
];

// ------- DATI DEMO FARMACIA DI TURNO OGGI -------
const turnoOggi = {
  principaleNome: "Farmacia Montesano",
  principaleIndirizzo: "Via Esempio 12, Matera",
  principaleTel: "0835 000000",
  appoggioNome: "Farmacia Centrale",
  appoggioIndirizzo: "Via Dante 8, Matera",
  appoggioTel: "0835 111111"
};

// ------- NOTIFICHE PER RUOLO (BASE) -------
const notifichePerRuolo = {
  farmacia: [
    {
      id: 1,
      text: "Nuova assenza approvata: Mario Rossi (20/12).",
      read: false,
      area: "assenze"
    },
    {
      id: 2,
      text: "Nuova assenza approvata: Giulia Bianchi (22/12).",
      read: false,
      area: "assenze"
    }
  ],
  titolare: [
    {
      id: 3,
      text: "Nuova richiesta ferie: Cosimo Verdi (28/11).",
      read: false,
      area: "assenze"
    },
    {
      id: 4,
      text: "Nuova richiesta permesso: Daniela Blu (05/12).",
      read: false,
      area: "assenze"
    }
  ],
  dipendente: [
    {
      id: 5,
      text: "La tua richiesta del 2/12 è stata approvata.",
      read: false,
      area: "assenze"
    }
  ]
};

let nextNotifId = 6;

// ------- STATO GENERALE -------
let currentRole = "farmacia";
let currentMonth;
let currentYear;

// Arrivi / Scadenze / Consumabili
let arriviState = [];
let scadenzeState = [];
let consumabiliState = [];

// Archivio file
let archivioState = {
  dipendenti: [],
  titolare: [],
  tutti: []
};

// ------- CHIAVI LOCALSTORAGE -------
const LS_ARRIVI = "montesano_arrivi";
const LS_SCADENZE = "montesano_scadenze";
const LS_CONSUMABILI = "montesano_consumabili";
const LS_ARCHIVIO = "montesano_archivio";

// ------- RIFERIMENTI DOM -------
let authContainer, app, loginForm, loginRoleLabel, authTabs;
let sidebar, hamburger, closeSidebar, logoutBtn, rolePill;
let dashboardSection, arriviPage, archivioPage;

let listaAssentiOggi, listaAssentiProssimi, calOggiLabel;
let calMiniGrid, calMiniMonthLabel, calMiniInfo;
let calPrevMonthBtn, calNextMonthBtn;
let btnFarmaciaAssenze, btnDipRichiedi, btnDipVedi, btnTitSegna, btnTitVedi;
let badgeNotifiche, badgeNotificheCount, notifPopup, notifList, notifClose;

// Turno today box
let turnoTodayMainName, turnoTodayMainAddr, turnoTodayMainTel;
let turnoTodayAppName, turnoTodayAppAddr, turnoTodayAppTel;

// Arrivi / scadenze / consumabili DOM
let arriviForm, arriviList, arriviFeedback;
let cambioCassaForm, cambioCassaFeedback;
let scadenzeForm, scadenzeList;
let consumabiliForm, consumabiliList;

// Archivio DOM
let btnApriArrivi, btnApriArchivio;
let backFromArrivi, backFromArchivio;
let archivioForm, archFileNameInput, archDestSelect;
let archListDip, archListTit, archListTutti;

// ======================================================
// FUNZIONI DI SUPPORTO
// ======================================================
function setRole(role) {
  currentRole = role;

  // Pill in alto
  if (rolePill) {
    if (role === "farmacia") {
      rolePill.textContent = "Farmacia (accesso generico)";
    } else if (role === "titolare") {
      rolePill.textContent = "Titolare";
    } else {
      rolePill.textContent = "Dipendente";
    }
  }

  // Bottoni visibili in base al ruolo
  if (btnFarmaciaAssenze)
    btnFarmaciaAssenze.classList.toggle("hidden", role !== "farmacia");

  if (btnDipRichiedi && btnDipVedi) {
    const isDip = role === "dipendente";
    btnDipRichiedi.classList.toggle("hidden", !isDip);
    btnDipVedi.classList.toggle("hidden", !isDip);
  }

  if (btnTitSegna && btnTitVedi) {
    const isTit = role === "titolare";
    btnTitSegna.classList.toggle("hidden", !isTit);
    btnTitVedi.classList.toggle("hidden", !isTit);
  }

  renderNotifiche();
  renderArchivioLists();
}

function formatDateLabel(dateObj) {
  const giorni = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const gSettimana = giorni[dateObj.getDay()];
  const giorno = String(dateObj.getDate()).padStart(2, "0");
  const mese = mesi[dateObj.getMonth()];
  return `${gSettimana} ${giorno} ${mese}`;
}

function formatMonthYearLabel(year, month) {
  const mesiCompleti = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return `${mesiCompleti[month]} ${year}`;
}

function getAssenzeByDate(isoDate) {
  const item = assenzeDemo.find(a => a.date === isoDate);
  return item ? item.names : [];
}

function getOggiISO() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Mostra / nasconde le sezioni principali
function showSection(sectionEl) {
  if (!sectionEl) return;
  [dashboardSection, arriviPage, archivioPage].forEach(sec => {
    if (sec) sec.classList.add("hidden");
  });
  sectionEl.classList.remove("hidden");
  window.scrollTo(0, 0);
}

// ======================================================
// ASSENZE – LISTE OGGI / PROSSIME
// ======================================================
function updateAssentiOggiEProssimi() {
  if (!listaAssentiOggi || !listaAssentiProssimi || !calOggiLabel) return;

  const oggi = new Date();
  const oggiISO = getOggiISO();

  calOggiLabel.textContent = formatDateLabel(oggi);

  // Assenti oggi
  const assOggi = getAssenzeByDate(oggiISO);
  listaAssentiOggi.innerHTML = "";
  if (assOggi.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessun assente oggi.";
    listaAssentiOggi.appendChild(li);
  } else {
    assOggi.forEach(nome => {
      const li = document.createElement("li");
      li.textContent = nome;
      listaAssentiOggi.appendChild(li);
    });
  }

  // Assenti prossimamente (dopo oggi, primi 3)
  const oggiTime = oggi.getTime();
  const prossimi = assenzeDemo
    .map(a => ({
      ...a,
      time: new Date(a.date).getTime()
    }))
    .filter(a => a.time > oggiTime)
    .sort((a, b) => a.time - b.time)
    .slice(0, 3);

  listaAssentiProssimi.innerHTML = "";
  if (prossimi.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessuna assenza futura registrata.";
    listaAssentiProssimi.appendChild(li);
  } else {
    prossimi.forEach(a => {
      const dt = new Date(a.date);
      const label = formatDateLabel(dt);
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}</strong> – ${a.names.join(", ")}`;
      listaAssentiProssimi.appendChild(li);
    });
  }
}
// ======================================================
// MINI CALENDARIO
// ======================================================
function buildMiniCalendar(year, month) {
  if (!calMiniGrid || !calMiniMonthLabel) return;

  calMiniGrid.innerHTML = "";
  calMiniMonthLabel.textContent = formatMonthYearLabel(year, month);

  const header = document.createElement("div");
  header.className = "cal-mini-row cal-mini-header-row";
  ["L", "M", "M", "G", "V", "S", "D"].forEach(lettera => {
    const span = document.createElement("span");
    span.textContent = lettera;
    header.appendChild(span);
  });
  calMiniGrid.appendChild(header);

  const first = new Date(year, month, 1);
  let startDay = first.getDay(); // 0=Dom ... 6=Sab
  startDay = (startDay + 6) % 7; // Lunedì come primo

  const numDays = new Date(year, month + 1, 0).getDate();

  let currentRow = document.createElement("div");
  currentRow.className = "cal-mini-row";

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-mini-day empty";
    currentRow.appendChild(empty);
  }

  for (let day = 1; day <= numDays; day++) {
    if (currentRow.children.length === 7) {
      calMiniGrid.appendChild(currentRow);
      currentRow = document.createElement("div");
      currentRow.className = "cal-mini-row";
    }

    const span = document.createElement("span");
    span.className = "cal-mini-day";
    span.textContent = day;

    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateISO = `${year}-${m}-${d}`;
    span.dataset.date = dateISO;

    const assenzeGiorno = getAssenzeByDate(dateISO);
    if (assenzeGiorno.length > 0) {
      span.classList.add("has-assenze");
      const dot = document.createElement("span");
      dot.className = "cal-mini-day-dot";
      dot.textContent = "●";
      span.appendChild(dot);
    }

    span.addEventListener("click", () => {
      mostraAssenzeGiorno(dateISO, span);
    });

    currentRow.appendChild(span);
  }

  while (currentRow.children.length < 7) {
    const empty = document.createElement("span");
    empty.className = "cal-mini-day empty";
    currentRow.appendChild(empty);
  }
  calMiniGrid.appendChild(currentRow);
}

function mostraAssenzeGiorno(dateISO, el) {
  if (!calMiniInfo) return;

  document.querySelectorAll(".cal-mini-day.selected").forEach(d =>
    d.classList.remove("selected")
  );
  if (el) el.classList.add("selected");

  const lista = getAssenzeByDate(dateISO);
  calMiniInfo.innerHTML = "";

  const dt = new Date(dateISO);
  const title = document.createElement("h4");
  title.textContent = formatDateLabel(dt);
  calMiniInfo.appendChild(title);

  if (lista.length === 0) {
    const p = document.createElement("p");
    p.className = "small-text";
    p.textContent = "Nessun assente per questo giorno.";
    calMiniInfo.appendChild(p);
  } else {
    const ul = document.createElement("ul");
    ul.className = "cal-assenze-list";
    lista.forEach(nome => {
      const li = document.createElement("li");
      li.textContent = nome;
      ul.appendChild(li);
    });
    calMiniInfo.appendChild(ul);
  }
}

// ======================================================
// NOTIFICHE
// ======================================================
function getNotificheCorrenti() {
  const arr = notifichePerRuolo[currentRole] || [];
  return arr;
}

function updateCardBadgesForCurrentRole() {
  const list = getNotificheCorrenti();
  const unread = list.filter(n => !n.read);

  document.querySelectorAll(".card-badge.js-card-badge").forEach(badge => {
    const key = badge.getAttribute("data-card-key");
    const countSpan = badge.querySelector(".badge-count");
    const label = document.querySelector(`.card-badge-label[data-card-key="${key}"]`);

    if (!key || !countSpan) return;

    const count = unread.filter(n => n.area === key).length;

    if (count > 0) {
      countSpan.textContent = String(count);
      badge.classList.add("has-unread");
      if (label) {
        label.textContent = count === 1 ? "Nuovo" : "Nuovi";
        label.style.display = "block";
      }
    } else {
      countSpan.textContent = "";
      badge.classList.remove("has-unread");
      if (label) {
        label.textContent = "";
        label.style.display = "none";
      }
    }
  });
}

function renderNotifiche() {
  if (!badgeNotifiche || !badgeNotificheCount) return;

  const lista = getNotificheCorrenti();
  const unread = lista.filter(n => !n.read);
  const count = unread.length;

  if (count === 0) {
    badgeNotifiche.classList.add("hidden");
  } else {
    badgeNotificheCount.textContent = String(count);
    badgeNotifiche.classList.remove("hidden");
  }

  if (!notifList) return;
  notifList.innerHTML = "";
  unread.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n.text;
    notifList.appendChild(li);
  });

  updateCardBadgesForCurrentRole();
}

function openNotifichePopup() {
  if (!notifPopup) return;
  notifPopup.classList.remove("hidden");
}

function closeNotifichePopup() {
  if (!notifPopup) return;
  notifPopup.classList.add("hidden");

  const arr = notifichePerRuolo[currentRole] || [];
  arr.forEach(n => (n.read = true));
  renderNotifiche();
}

function addNotificaForRoles(roles, text, area) {
  roles.forEach(role => {
    if (!notifichePerRuolo[role]) notifichePerRuolo[role] = [];
    notifichePerRuolo[role].push({
      id: nextNotifId++,
      text,
      read: false,
      area
    });
  });
  renderNotifiche();
}

// ======================================================
// FARMACIA DI TURNO in alto
// ======================================================
function renderTurnoToday() {
  if (
    !turnoTodayMainName ||
    !turnoTodayMainAddr ||
    !turnoTodayMainTel ||
    !turnoTodayAppName ||
    !turnoTodayAppAddr ||
    !turnoTodayAppTel
  ) {
    return;
  }

  turnoTodayMainName.textContent = turnoOggi.principaleNome;
  turnoTodayMainAddr.textContent = turnoOggi.principaleIndirizzo;
  turnoTodayMainTel.textContent = `Tel: ${turnoOggi.principaleTel}`;
  turnoTodayAppName.textContent = turnoOggi.appoggioNome;
  turnoTodayAppAddr.textContent = turnoOggi.appoggioIndirizzo;
  turnoTodayAppTel.textContent = `Tel: ${turnoOggi.appoggioTel}`;
}

// ======================================================
// ARRIVI / SCADENZE / CONSUMABILI – STORAGE
// ======================================================
function loadArrivi() {
  try {
    const raw = localStorage.getItem(LS_ARRIVI);
    arriviState = raw ? JSON.parse(raw) : [];
  } catch {
    arriviState = [];
  }
}

function saveArrivi() {
  try {
    localStorage.setItem(LS_ARRIVI, JSON.stringify(arriviState));
  } catch {}
}

function renderArrivi() {
  if (!arriviList) return;
  arriviList.innerHTML = "";
  arriviState.forEach(item => {
    const li = document.createElement("li");
    const data = new Date(item.when);
    li.innerHTML = `<strong>${item.nome}</strong> – ${data.toLocaleString("it-IT")}<br/>${item.nota || ""}`;
    arriviList.appendChild(li);
  });
}

function loadScadenze() {
  try {
    const raw = localStorage.getItem(LS_SCADENZE);
    scadenzeState = raw ? JSON.parse(raw) : [];
  } catch {
    scadenzeState = [];
  }
}

function saveScadenze() {
  try {
    localStorage.setItem(LS_SCADENZE, JSON.stringify(scadenzeState));
  } catch {}
}

function renderScadenze() {
  if (!scadenzeList) return;
  scadenzeList.innerHTML = "";

  if (scadenzeState.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessuna scadenza registrata.";
    scadenzeList.appendChild(li);
    return;
  }

  scadenzeState.forEach(item => {
    const li = document.createElement("li");
    const dt = new Date(item.data);
    const dataStr = dt.toLocaleDateString("it-IT");
    li.innerHTML = `
      <strong>${item.nome}</strong> – ${item.pezzi} pz · scad. ${dataStr}
      <button class="btn-secondary small btn-inline" data-id="${item.id}">Elimina</button>
    `;
    scadenzeList.appendChild(li);
  });

  scadenzeList.querySelectorAll(".btn-inline").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      scadenzeState = scadenzeState.filter(s => String(s.id) !== String(id));
      saveScadenze();
      renderScadenze();
    });
  });
}

function loadConsumabili() {
  try {
    const raw = localStorage.getItem(LS_CONSUMABILI);
    consumabiliState = raw ? JSON.parse(raw) : [];
  } catch {
    consumabiliState = [];
  }
}

function saveConsumabili() {
  try {
    localStorage.setItem(LS_CONSUMABILI, JSON.stringify(consumabiliState));
  } catch {}
}

function renderConsumabili() {
  if (!consumabiliList) return;
  consumabiliList.innerHTML = "";

  if (consumabiliState.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessun consumabile segnalato.";
    consumabiliList.appendChild(li);
    return;
  }

  consumabiliState.forEach(item => {
    const li = document.createElement("li");
    const dataStr = new Date(item.when).toLocaleString("it-IT");
    li.innerHTML = `
      <strong>${item.nome}</strong> – ${dataStr}<br/>
      ${item.nota || ""}<br/>
      <button class="btn-secondary small btn-inline" data-id="${item.id}">Elimina</button>
    `;
    consumabiliList.appendChild(li);
  });

  consumabiliList.querySelectorAll(".btn-inline").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      consumabiliState = consumabiliState.filter(c => String(c.id) !== String(id));
      saveConsumabili();
      renderConsumabili();
    });
  });
}

// ======================================================
// ARCHIVIO – STORAGE
// ======================================================
function loadArchivio() {
  try {
    const raw = localStorage.getItem(LS_ARCHIVIO);
    archivioState = raw
      ? JSON.parse(raw)
      : { dipendenti: [], titolare: [], tutti: [] };
  } catch {
    archivioState = { dipendenti: [], titolare: [], tutti: [] };
  }
}

function saveArchivio() {
  try {
    localStorage.setItem(LS_ARCHIVIO, JSON.stringify(archivioState));
  } catch {}
}

function renderArchivioLists() {
  if (!archListDip || !archListTit || !archListTutti) return;

  const makeList = (ul, arr) => {
    ul.innerHTML = "";
    if (!arr || arr.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessun file.";
      ul.appendChild(li);
      return;
    }
    arr.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.nome}
        <button class="btn-secondary small btn-inline" data-id="${item.id}" data-folder="${item.folder}">
          Elimina
        </button>
      `;
      ul.appendChild(li);
    });
  };

  makeList(archListDip, archivioState.dipendenti || []);
  makeList(archListTit, archivioState.titolare || []);
  makeList(archListTutti, archivioState.tutti || []);

  document.querySelectorAll(".archivio-list .btn-inline").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const folder = btn.getAttribute("data-folder");
      if (!folder || !archivioState[folder]) return;
      archivioState[folder] = archivioState[folder].filter(
        f => String(f.id) !== String(id)
      );
      saveArchivio();
      renderArchivioLists();
    });
  });
}

// ======================================================
// DOM READY
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  // --- elementi base ---
  authContainer = document.getElementById("authContainer");
  app = document.getElementById("app");
  loginForm = document.getElementById("loginForm");
  loginRoleLabel = document.getElementById("loginRoleLabel");
  authTabs = document.querySelectorAll(".auth-tab");

  sidebar = document.getElementById("sidebar");
  hamburger = document.getElementById("hamburger");
  closeSidebar = document.getElementById("closeSidebar");
  logoutBtn = document.getElementById("logoutBtn");
  rolePill = document.getElementById("currentRolePill");

  dashboardSection = document.getElementById("dashboard");
  arriviPage = document.getElementById("arriviPage");
  archivioPage = document.getElementById("archivioPage");

  listaAssentiOggi = document.getElementById("listaAssentiOggi");
  listaAssentiProssimi = document.getElementById("listaAssentiProssimi");
  calOggiLabel = document.getElementById("calOggiLabel");

  calMiniGrid = document.getElementById("calMiniGrid");
  calMiniMonthLabel = document.getElementById("calMiniMonthLabel");
  calMiniInfo = document.getElementById("calMiniInfo");
  calPrevMonthBtn = document.getElementById("calPrevMonth");
  calNextMonthBtn = document.getElementById("calNextMonth");

  btnFarmaciaAssenze = document.getElementById("btnFarmaciaAssenze");
  btnDipRichiedi = document.getElementById("btnDipRichiedi");
  btnDipVedi = document.getElementById("btnDipVedi");
  btnTitSegna = document.getElementById("btnTitSegna");
  btnTitVedi = document.getElementById("btnTitVedi");

  badgeNotifiche = document.getElementById("assenzeNotifBadge");
  badgeNotificheCount = document.getElementById("assenzeNotifCount");
  notifPopup = document.getElementById("assenzeNotifPopup");
  notifList = document.getElementById("assenzeNotifList");
  notifClose = document.getElementById("assenzeNotifClose");

  // Turno box
  turnoTodayMainName = document.getElementById("turnoTodayMainName");
  turnoTodayMainAddr = document.getElementById("turnoTodayMainAddr");
  turnoTodayMainTel = document.getElementById("turnoTodayMainTel");
  turnoTodayAppName = document.getElementById("turnoTodayAppName");
  turnoTodayAppAddr = document.getElementById("turnoTodayAppAddr");
  turnoTodayAppTel = document.getElementById("turnoTodayAppTel");

  // Arrivi / scadenze / consumabili
  arriviForm = document.getElementById("arriviForm");
  arriviList = document.getElementById("arriviList");
  arriviFeedback = document.getElementById("arriviFeedback");

  cambioCassaForm = document.getElementById("cambioCassaForm");
  cambioCassaFeedback = document.getElementById("cambioCassaFeedback");

  scadenzeForm = document.getElementById("scadenzeForm");
  scadenzeList = document.getElementById("scadenzeList");

  consumabiliForm = document.getElementById("consumabiliForm");
  consumabiliList = document.getElementById("consumabiliList");

  // Archivio
  btnApriArrivi = document.getElementById("btnApriArrivi");
  btnApriArchivio = document.getElementById("btnApriArchivio");
  backFromArrivi = document.getElementById("backFromArrivi");
  backFromArchivio = document.getElementById("backFromArchivio");

  archivioForm = document.getElementById("archivioForm");
  archFileNameInput = document.getElementById("archFileName");
  archDestSelect = document.getElementById("archDest");
  archListDip = document.getElementById("archListDip");
  archListTit = document.getElementById("archListTit");
  archListTutti = document.getElementById("archListTutti");

  // --- ROLE TABS (login) ---
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

  // --- LOGIN ---
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const activeTab = document.querySelector(".auth-tab.active");
      const role = activeTab ? activeTab.dataset.role : "farmacia";

      authContainer.classList.add("hidden");
      app.classList.remove("hidden");

      const today = new Date();
      currentMonth = today.getMonth();
      currentYear = today.getFullYear();

      // Carica dati locali
      loadArrivi();
      loadScadenze();
      loadConsumabili();
      loadArchivio();

      setRole(role);
      renderTurnoToday();
      updateAssentiOggiEProssimi();
      buildMiniCalendar(currentYear, currentMonth);
      mostraAssenzeGiorno(getOggiISO());

      renderArrivi();
      renderScadenze();
      renderConsumabili();
      renderArchivioLists();

      showSection(dashboardSection);
    });
  }

  // --- SIDEBAR / NAV ---
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      sidebar && sidebar.classList.add("open");
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar && sidebar.classList.remove("open");
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
        if (target === "arriviPage") showSection(arriviPage);
        if (target === "archivioPage") showSection(archivioPage);
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
      currentRole = "farmacia";
    });
  }

  // --- BOTTONI DASHBOARD -> PAGINE ---
  if (btnApriArrivi && arriviPage) {
    btnApriArrivi.addEventListener("click", () => {
      showSection(arriviPage);
    });
  }

  if (btnApriArchivio && archivioPage) {
    btnApriArchivio.addEventListener("click", () => {
      showSection(archivioPage);
    });
  }

  if (backFromArrivi) {
    backFromArrivi.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  if (backFromArchivio) {
    backFromArchivio.addEventListener("click", () => {
      showSection(dashboardSection);
    });
  }

  // --- BOTTONI CARD ASSENZE (per ora solo alert demo) ---
  if (btnFarmaciaAssenze) {
    btnFarmaciaAssenze.addEventListener("click", () => {
      alert("Demo: qui in futuro vedrai l’elenco completo di tutti gli assenti.");
    });
  }

  if (btnDipRichiedi) {
    btnDipRichiedi.addEventListener("click", () => {
      alert("Demo: qui potrai inviare una richiesta di assenza.");
    });
  }
  if (btnDipVedi) {
    btnDipVedi.addEventListener("click", () => {
      alert("Demo: qui vedrai tutte le tue assenze.");
    });
  }

  if (btnTitSegna) {
    btnTitSegna.addEventListener("click", () => {
      alert("Demo: qui il titolare potrà segnare una nuova assenza.");
    });
  }
  if (btnTitVedi) {
    btnTitVedi.addEventListener("click", () => {
      alert("Demo: qui il titolare vedrà tutte le assenze del personale.");
    });
  }

  // --- CALENDARIO NAV ---
  if (calPrevMonthBtn) {
    calPrevMonthBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      buildMiniCalendar(currentYear, currentMonth);
    });
  }
  if (calNextMonthBtn) {
    calNextMonthBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      buildMiniCalendar(currentYear, currentMonth);
    });
  }

  // --- NOTIFICHE ---
  if (badgeNotifiche) {
    badgeNotifiche.addEventListener("click", e => {
      e.stopPropagation();
      openNotifichePopup();
    });
  }
  if (notifClose) {
    notifClose.addEventListener("click", () => {
      closeNotifichePopup();
    });
  }
  document.addEventListener("click", e => {
    if (
      notifPopup &&
      !notifPopup.classList.contains("hidden") &&
      !notifPopup.contains(e.target) &&
      e.target !== badgeNotifiche
    ) {
      closeNotifichePopup();
    }
  });

  // --- FORM ARRIVI ---
  if (arriviForm && arriviList) {
    arriviForm.addEventListener("submit", e => {
      e.preventDefault();
      const nome = document.getElementById("arrNome").value.trim();
      const nota = document.getElementById("arrNota").value.trim();
      if (!nome) {
        if (arriviFeedback) arriviFeedback.textContent = "Inserisci almeno il nome/descrizione.";
        return;
      }
      arriviState.push({
        id: Date.now(),
        nome,
        nota,
        when: new Date().toISOString()
      });
      saveArrivi();
      renderArrivi();
      arriviForm.reset();
      if (arriviFeedback) arriviFeedback.textContent = "Arrivo registrato (demo).";
    });
  }

  // --- FORM CAMBIO CASSA (solo feedback e notifica titolare) ---
  if (cambioCassaForm) {
    cambioCassaForm.addEventListener("submit", e => {
      e.preventDefault();
      const tagli = document.getElementById("ccTagli").value.trim();
      const nota = document.getElementById("ccNota").value.trim();
      if (!tagli) {
        if (cambioCassaFeedback) cambioCassaFeedback.textContent = "Inserisci i tagli richiesti.";
        return;
      }
      if (cambioCassaFeedback) cambioCassaFeedback.textContent = "Richiesta di cambio cassa registrata (demo).";

      const testo = `Richiesta cambio cassa: ${tagli}${nota ? " (" + nota + ")" : ""}`;
      addNotificaForRoles(["titolare"], testo, "cambiocassa");
      cambioCassaForm.reset();
    });
  }

  // --- FORM SCADENZE ---
  if (scadenzeForm) {
    scadenzeForm.addEventListener("submit", e => {
      e.preventDefault();
      const nome = document.getElementById("scadNome").value.trim();
      const pezzi = parseInt(document.getElementById("scadPezzi").value || "0", 10);
      const data = document.getElementById("scadData").value;

      if (!nome || !data || !pezzi || pezzi <= 0) {
        alert("Compila nome prodotto, numero pezzi e data di scadenza.");
        return;
      }

      const item = {
        id: Date.now(),
        nome,
        pezzi,
        data
      };
      scadenzeState.push(item);
      saveScadenze();
      renderScadenze();

      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      const scadDate = new Date(data);
      scadDate.setHours(0, 0, 0, 0);

      const diffMs = scadDate - oggi;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 45) {
        const dataStr = scadDate.toLocaleDateString("it-IT");
        const testo = `Scadenza vicina: ${nome} (${pezzi} pz) – ${dataStr}`;
        addNotificaForRoles(["farmacia", "titolare"], testo, "scadenze");
      }

      scadenzeForm.reset();
    });
  }

  // --- FORM CONSUMABILI ---
  if (consumabiliForm) {
    consumabiliForm.addEventListener("submit", e => {
      e.preventDefault();
      const nome = document.getElementById("consNome").value.trim();
      const nota = document.getElementById("consNota").value.trim();

      if (!nome) {
        alert("Inserisci il nome del consumabile.");
        return;
      }

      const item = {
        id: Date.now(),
        nome,
        nota,
        when: new Date().toISOString()
      };
      consumabiliState.push(item);
      saveConsumabili();
      renderConsumabili();

      const testo = `Segnalato consumabile: ${nome}${nota ? " (" + nota + ")" : ""}`;
      addNotificaForRoles(["titolare"], testo, "consumabili");

      consumabiliForm.reset();
    });
  }

  // --- FORM ARCHIVIO ---
  if (archivioForm) {
    archivioForm.addEventListener("submit", e => {
      e.preventDefault();
      const nome = archFileNameInput.value.trim();
      const dest = archDestSelect.value;

      if (!nome) {
        alert("Inserisci il nome del file.");
        return;
      }

      const item = {
        id: Date.now(),
        nome,
        folder: dest
      };

      if (!archivioState[dest]) archivioState[dest] = [];
      archivioState[dest].push(item);
      saveArchivio();
      renderArchivioLists();

      let roles = [];
      if (dest === "dipendenti") roles = ["dipendente"];
      if (dest === "titolare") roles = ["titolare"];
      if (dest === "tutti") roles = ["farmacia", "dipendente", "titolare"];

      const testo = `Nuovo file "${nome}" in cartella ${dest}.`;
      addNotificaForRoles(roles, testo, "archivio");

      archivioForm.reset();
    });
  }

  // Non facciamo altro all’avvio: tutto parte dopo il login
});
