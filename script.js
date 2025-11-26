// ======================================================
// SCRIPT – LOGIN + CARD ASSENZE + RUOLI
// ======================================================

// ------- DATI DEMO ASSENZE -------
const assenzeDemo = [
  { date: "2025-11-26", names: ["Mario Rossi", "Giulia Bianchi"] },
  { date: "2025-11-28", names: ["Cosimo Verdi"] },
  { date: "2025-12-02", names: ["Annalisa Neri"] },
  { date: "2025-12-05", names: ["Daniela Blu"] }
];

// Notifiche diverse per ruolo (demo)
const notifichePerRuolo = {
  farmacia: [
    {
      id: 1,
      text: "Nuova assenza approvata: Mario Rossi (20/12).",
      read: false
    },
    {
      id: 2,
      text: "Nuova assenza approvata: Giulia Bianchi (22/12).",
      read: false
    }
  ],
  titolare: [
    {
      id: 3,
      text: "Nuova richiesta ferie: Cosimo Verdi (28/11).",
      read: false
    },
    {
      id: 4,
      text: "Nuova richiesta permesso: Daniela Blu (05/12).",
      read: false
    }
  ],
  dipendente: [
    {
      id: 5,
      text: "La tua richiesta del 2/12 è stata approvata.",
      read: false
    }
  ]
};

// ------- STATO GENERALE -------
let currentRole = "farmacia";
let currentMonth;
let currentYear;

// ------- RIFERIMENTI DOM -------
let authContainer, app, loginForm, loginRoleLabel, authTabs;
let sidebar, hamburger, closeSidebar, logoutBtn, rolePill;
let listaAssentiOggi, listaAssentiProssimi, calOggiLabel;
let calMiniGrid, calMiniMonthLabel, calMiniInfo;
let calPrevMonthBtn, calNextMonthBtn;
let btnFarmaciaAssenze, btnDipRichiedi, btnDipVedi, btnTitSegna, btnTitVedi;
let badgeNotifiche, badgeNotificheCount, notifPopup, notifList, notifClose;

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

  // Aggiorna badge notifiche per questo ruolo
  renderNotifiche();
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

  // Intestazione giorni
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
  // vogliamo Lunedì come primo: 0=>6, 1=>0, ...
  startDay = (startDay + 6) % 7;

  const numDays = new Date(year, month + 1, 0).getDate();

  let currentRow = document.createElement("div");
  currentRow.className = "cal-mini-row";

  // celle vuote prima del giorno 1
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-mini-day empty";
    currentRow.appendChild(empty);
  }

  // giorni del mese
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

  // celle vuote finali
  while (currentRow.children.length < 7) {
    const empty = document.createElement("span");
    empty.className = "cal-mini-day empty";
    currentRow.appendChild(empty);
  }
  calMiniGrid.appendChild(currentRow);
}

function mostraAssenzeGiorno(dateISO, el) {
  if (!calMiniInfo) return;

  // evidenzia giorno selezionato
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

function renderNotifiche() {
  if (!badgeNotifiche || !badgeNotificheCount) return;

  const lista = getNotificheCorrenti();
  const unread = lista.filter(n => !n.read);
  const count = unread.length;

  if (count === 0) {
    badgeNotifiche.classList.add("hidden");
    return;
  }

  badgeNotificheCount.textContent = String(count);
  badgeNotifiche.classList.remove("hidden");

  // riempi popup
  if (!notifList) return;
  notifList.innerHTML = "";
  unread.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n.text;
    notifList.appendChild(li);
  });
}

function openNotifichePopup() {
  if (!notifPopup) return;
  notifPopup.classList.remove("hidden");
}

function closeNotifichePopup() {
  if (!notifPopup) return;
  notifPopup.classList.add("hidden");

  // segna tutto come letto
  const arr = notifichePerRuolo[currentRole] || [];
  arr.forEach(n => (n.read = true));
  renderNotifiche();
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

      setRole(role);
      updateAssentiOggiEProssimi();
      buildMiniCalendar(currentYear, currentMonth);
      mostraAssenzeGiorno(getOggiISO());

      window.scrollTo(0, 0);
    });
  }

  // --- SIDEBAR ---
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

  // --- BOTTONI CARD (demo: solo alert) ---
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

  // Non facciamo nulla all’avvio: parte tutto dopo il login
});