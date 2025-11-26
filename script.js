// ============================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO (NUOVA VERSIONE)
// ============================================================

// ------------------- STATO GENERALE -------------------------
let currentRole = "farmacia"; // "farmacia" | "titolare" | "dipendente"
let currentSection = "dashboard";

let calMonth; // 0-11
let calYear;  // es. 2025

// Arrivi / scadenze / consumabili (demo + localStorage)
let arriviData = [];
let scadenzeData = [];
let consumabiliData = [];

// Notifiche per card e ruolo
// cardKey: "assenze" | "arrivi" | "scadenze" | "consumabili" | "cambio"
let notifications = {
  assenze: { titolare: [], farmacia: [], dipendente: [] },
  arrivi: { titolare: [], farmacia: [], dipendente: [] },
  scadenze: { titolare: [], farmacia: [], dipendente: [] },
  consumabili: { titolare: [], farmacia: [], dipendente: [] },
  cambio: { titolare: [], farmacia: [], dipendente: [] }
};

// Assenze demo (dal / al compresi)
const assenzeDemo = [
  {
    nome: "Mario Rossi",
    dal: "2025-11-26",
    al: "2025-11-26",
    ruolo: "farmacia"
  },
  {
    nome: "Giulia Bianchi",
    dal: "2025-11-26",
    al: "2025-11-28",
    ruolo: "dipendente"
  },
  {
    nome: "Cosimo Verdi",
    dal: "2025-11-28",
    al: "2025-11-30",
    ruolo: "dipendente"
  },
  {
    nome: "Annalisa Neri",
    dal: "2025-12-02",
    al: "2025-12-05",
    ruolo: "dipendente"
  },
  {
    nome: "Daniela Blu",
    dal: "2025-12-05",
    al: "2025-12-07",
    ruolo: "dipendente"
  }
];

// Farmacia di turno (demo)
const turniFarmacie = [
  {
    data: "2025-11-26",
    principale: "Farmacia Montesano",
    indirizzo: "Via Esempio 12, Matera",
    telefono: "0835 000000",
    appoggio: "Farmacia Centrale",
    appoggioIndirizzo: "Via Dante 8, Matera",
    appoggioTelefono: "0835 111111"
  }
];

// ------------------- UTILS DATA / DATE ----------------------
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function diffInDays(fromISO, toISO) {
  const t1 = parseISO(fromISO).getTime();
  const t2 = parseISO(toISO).getTime();
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

// Una data è compresa nel range [dal, al] ?
function isDateInRange(dateISO, dalISO, alISO) {
  const d = parseISO(dateISO).getTime();
  const d1 = parseISO(dalISO).getTime();
  const d2 = parseISO(alISO).getTime();
  return d >= d1 && d <= d2;
}

// ------------------- UTILS LOCALSTORAGE ---------------------
function loadLocalData() {
  try {
    const a = localStorage.getItem("fm_arrivi");
    const s = localStorage.getItem("fm_scadenze");
    const c = localStorage.getItem("fm_consumabili");
    if (a) arriviData = JSON.parse(a);
    if (s) scadenzeData = JSON.parse(s);
    if (c) consumabiliData = JSON.parse(c);
  } catch (e) {
    console.warn("Errore lettura localStorage", e);
  }
}

function saveLocalData() {
  try {
    localStorage.setItem("fm_arrivi", JSON.stringify(arriviData));
    localStorage.setItem("fm_scadenze", JSON.stringify(scadenzeData));
    localStorage.setItem("fm_consumabili", JSON.stringify(consumabiliData));
  } catch (e) {
    console.warn("Errore salvataggio localStorage", e);
  }
}

// ------------------- UTILS SEZIONI --------------------------
function showSection(id) {
  currentSection = id;

  const dash = document.getElementById("dashboard");
  const pageArrivi = document.getElementById("pageArrivi");
  const pageScadenze = document.getElementById("pageScadenze");
  const pageConsumabili = document.getElementById("pageConsumabili");

  [dash, pageArrivi, pageScadenze, pageConsumabili].forEach(sec => {
    if (!sec) return;
    sec.classList.add("hidden");
  });

  const target =
    id === "dashboard"
      ? dash
      : id === "arrivi"
      ? pageArrivi
      : id === "scadenze"
      ? pageScadenze
      : id === "consumabili"
      ? pageConsumabili
      : null;

  if (target) target.classList.remove("hidden");
  window.scrollTo(0, 0);
}
// ------------------- UTILS NOTIFICHE ------------------------

function createNotification(cardKey, ruoli, title, text) {
  ruoli.forEach(role => {
    const arr = notifications[cardKey]?.[role];
    if (!arr) return;
    arr.push({
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      title,
      text,
      read: false
    });
  });
  updateAllBadges();
}

function getUnreadCount(cardKey, role) {
  const arr = notifications[cardKey]?.[role];
  if (!arr) return 0;
  return arr.filter(n => !n.read).length;
}

function updateBadge(cardKey) {
  const badge = document.querySelector(`.card-notif-badge[data-card="${cardKey}"]`);
  if (!badge) return;

  const count = getUnreadCount(cardKey, currentRole);
  const dot = badge.querySelector(".badge-dot");
  const label = badge.querySelector(".badge-label");
  const countEl = badge.querySelector(".badge-count");

  if (count > 0) {
    badge.style.display = "inline-flex";
    if (dot) dot.style.display = "inline-block";
    if (label) label.textContent = "NUOVI";
    if (countEl) countEl.textContent = String(count);
  } else {
    if (dot) dot.style.display = "none";
    if (label) label.textContent = "";
    if (countEl) countEl.textContent = "";
  }
}

function updateAllBadges() {
  ["assenze", "arrivi", "scadenze", "consumabili", "cambio"].forEach(updateBadge);
}

// Overlay notifiche
let notifOverlay,
  notifList,
  notifTitle,
  notifIntro,
  notifClose,
  notifCloseBottom;
let openNotifCardKey = null;

function openNotificationOverlay(cardKey) {
  if (!notifOverlay || !notifList || !notifTitle || !notifIntro) return;
  openNotifCardKey = cardKey;

  const arrAll = notifications[cardKey]?.[currentRole] || [];
  const unread = arrAll.filter(n => !n.read);

  notifTitle.textContent =
    cardKey === "assenze"
      ? "Notifiche assenze"
      : cardKey === "arrivi"
      ? "Notifiche arrivi"
      : cardKey === "scadenze"
      ? "Notifiche scadenze"
      : cardKey === "consumabili"
      ? "Notifiche consumabili"
      : "Notifiche cambio cassa";

  if (unread.length === 0) {
    notifIntro.textContent = "Non hai nuove notifiche per questa sezione.";
  } else if (unread.length === 1) {
    notifIntro.textContent = "Hai 1 nuova notifica non letta.";
  } else {
    notifIntro.textContent = `Hai ${unread.length} nuove notifiche non lette.`;
  }

  notifList.innerHTML = "";
  if (arrAll.length === 0) {
    const div = document.createElement("div");
    div.className = "notif-item-text";
    div.textContent = "Nessuna notifica presente (demo).";
    notifList.appendChild(div);
  } else {
    arrAll.forEach(n => {
      const item = document.createElement("div");
      item.className = "notif-item";

      const t = document.createElement("div");
      t.className = "notif-item-title";
      t.textContent = n.title;

      const p = document.createElement("div");
      p.className = "notif-item-text";
      p.textContent = n.text;

      item.appendChild(t);
      item.appendChild(p);
      notifList.appendChild(item);
    });
  }

  notifOverlay.classList.remove("hidden");
}

function closeNotificationOverlay(markAsRead = true) {
  if (!notifOverlay) return;
  if (markAsRead && openNotifCardKey) {
    const arr = notifications[openNotifCardKey]?.[currentRole] || [];
    arr.forEach(n => {
      n.read = true;
    });
    updateAllBadges();
  }
  openNotifCardKey = null;
  notifOverlay.classList.add("hidden");
}
// ------------------- ASSENTI OGGI + CALENDARIO ---------------

function renderAssentiCard() {
  const today = todayISO();

  const assentiOggi = assenzeDemo.filter(a =>
    isDateInRange(today, a.dal, a.al)
  );

  const prossime = assenzeDemo
    .filter(a => diffInDays(today, a.dal) > 0)
    .sort((a, b) => (a.dal < b.dal ? -1 : 1));

  // Testo data in alto
  const dataLabel = document.getElementById("assentiDataLabel");
  if (dataLabel) {
    const d = parseISO(today);
    const giorni = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const mesi = [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic"
    ];
    const txt = `${giorni[d.getDay()]} ${d.getDate()} ${
      mesi[d.getMonth()]
    }`;
    dataLabel.textContent = txt;
  }

  // Lista assenti oggi
  const ulOggi = document.getElementById("assentiOggiList");
  if (ulOggi) {
    ulOggi.innerHTML = "";
    if (assentiOggi.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessun assente segnato oggi (demo).";
      ulOggi.appendChild(li);
    } else {
      assentiOggi.forEach(a => {
        const li = document.createElement("li");
        const range =
          a.dal === a.al
            ? ""
            : ` (fino al ${a.al.split("-").reverse().join("/")})`;
        li.textContent = `${a.nome}${range}`;
        ulOggi.appendChild(li);
      });
    }
  }

  // Lista prossime assenze (prime 3)
  const ulProssime = document.getElementById("assentiProssimiList");
  if (ulProssime) {
    ulProssime.innerHTML = "";
    if (prossime.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna assenza programmata (demo).";
      ulProssime.appendChild(li);
    } else {
      prossime.slice(0, 3).forEach(a => {
        const dal = a.dal.split("-").reverse().join("/");
        const al = a.al.split("-").reverse().join("/");
        const li = document.createElement("li");
        li.innerHTML = `<strong>${a.nome}</strong> · dal ${dal} al ${al}`;
        ulProssime.appendChild(li);
      });
    }
  }
}

// Mini calendario
function initCalendarState() {
  const d = new Date();
  calMonth = d.getMonth();
  calYear = d.getFullYear();
}

function renderCalendar() {
  const monthLabel = document.getElementById("calMonthLabel");
  const grid = document.getElementById("calMiniGrid");
  const weekdaysRow = document.getElementById("calMiniWeekdays");
  if (!grid || !monthLabel || !weekdaysRow) return;

  const mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
  ];
  monthLabel.textContent = `${mesi[calMonth]} ${calYear}`;

  // intestazione giorni (L M M G V S D)
  weekdaysRow.innerHTML = "";
  const labels = ["L", "M", "M", "G", "V", "S", "D"];
  labels.forEach(l => {
    const span = document.createElement("span");
    span.textContent = l;
    weekdaysRow.appendChild(span);
  });

  grid.innerHTML = "";

  const firstDay = new Date(calYear, calMonth, 1);
  const startWeekDay = (firstDay.getDay() + 6) % 7; // lun=0 ... dom=6
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = todayISO();

  const hasAssenzeSet = new Set();
  assenzeDemo.forEach(a => {
    let d = parseISO(a.dal);
    const end = parseISO(a.al);
    while (d <= end) {
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
        hasAssenzeSet.add(d.getDate());
      }
      d.setDate(d.getDate() + 1);
    }
  });

  // celle vuote prima
  for (let i = 0; i < startWeekDay; i++) {
    const div = document.createElement("div");
    div.className = "cal-day cal-day--empty";
    grid.appendChild(div);
  }

  // giorni
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "cal-day";
    div.textContent = day;

    const iso = `${calYear}-${String(calMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (iso === todayStr) {
      div.classList.add("cal-day--today");
    }
    if (hasAssenzeSet.has(day)) {
      div.classList.add("cal-day--has-assenze");
      // click: mostra nomi assenti in quel giorno
      div.addEventListener("click", () => {
        const nomi = assenzeDemo
          .filter(a => isDateInRange(iso, a.dal, a.al))
          .map(a => a.nome);
        if (nomi.length === 0) return;
        alert(
          `Assenti il ${iso.split("-").reverse().join("/")}:\n- ${nomi.join(
            "\n- "
          )}`
        );
      });
    }

    grid.appendChild(div);
  }
}
function initCalendarNav() {
  const btnPrev = document.getElementById("calPrev");
  const btnNext = document.getElementById("calNext");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      calMonth--;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      renderCalendar();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      calMonth++;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCalendar();
    });
  }
}

// ------------------- FARMACIA DI TURNO BANNER ----------------

function renderTurnoBanner() {
  if (!turniFarmacie || turniFarmacie.length === 0) return;
  const today = todayISO();
  const turno =
    turniFarmacie.find(t => t.data === today) || turniFarmacie[0];

  const nome = document.getElementById("turnoFarmaciaNome");
  const indirizzo = document.getElementById("turnoFarmaciaIndirizzo");
  const telefono = document.getElementById("turnoFarmaciaTelefono");
  const appNome = document.getElementById("turnoAppoggioNome");
  const appInd = document.getElementById("turnoAppoggioIndirizzo");
  const appTel = document.getElementById("turnoAppoggioTelefono");

  if (nome) nome.textContent = turno.principale;
  if (indirizzo) indirizzo.textContent = turno.indirizzo;
  if (telefono) telefono.textContent = `Tel: ${turno.telefono}`;
  if (appNome) appNome.textContent = turno.appoggio;
  if (appInd) appInd.textContent = turno.appoggioIndirizzo;
  if (appTel) appTel.textContent = `Tel: ${turno.appoggioTelefono}`;
}
// ------------------- RENDER ARRIVI / SCADENZE / CONSUMABILI ---

function renderArriviList() {
  const wrapper = document.getElementById("arriviElenco");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (arriviData.length === 0) {
    wrapper.textContent = "Nessun arrivo registrato (demo).";
    return;
  }

  arriviData
    .slice()
    .sort((a, b) => (a.data > b.data ? -1 : 1))
    .forEach(item => {
      const row = document.createElement("div");
      row.className = "row";

      const span1 = document.createElement("span");
      span1.textContent = item.data.split("-").reverse().join("/");

      const span2 = document.createElement("span");
      span2.textContent = item.descrizione;

      const span3 = document.createElement("span");
      span3.textContent = item.note || "-";

      const actions = document.createElement("span");
      actions.className = "actions";

      const btnDel = document.createElement("button");
      btnDel.className = "btn-secondary";
      btnDel.style.fontSize = "0.75rem";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        arriviData = arriviData.filter(a => a.id !== item.id);
        saveLocalData();
        renderArriviList();
      });

      actions.appendChild(btnDel);

      row.appendChild(span1);
      row.appendChild(span2);
      row.appendChild(span3);
      row.appendChild(actions);
      wrapper.appendChild(row);
    });
}

function renderScadenzeList() {
  const wrapper = document.getElementById("scadenzeElenco");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (scadenzeData.length === 0) {
    wrapper.textContent = "Nessuna scadenza registrata (demo).";
    return;
  }

  scadenzeData
    .slice()
    .sort((a, b) => (a.dataScadenza > b.dataScadenza ? 1 : -1))
    .forEach(item => {
      const row = document.createElement("div");
      row.className = "row";

      const span1 = document.createElement("span");
      span1.textContent = item.nome;

      const span2 = document.createElement("span");
      span2.textContent = item.pezzi ? `${item.pezzi} pz` : "-";

      const span3 = document.createElement("span");
      span3.textContent = item.dataScadenza.split("-").reverse().join("/");

      const actions = document.createElement("span");
      actions.className = "actions";

      const btnDel = document.createElement("button");
      btnDel.className = "btn-secondary";
      btnDel.style.fontSize = "0.75rem";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        scadenzeData = scadenzeData.filter(a => a.id !== item.id);
        saveLocalData();
        renderScadenzeList();
      });

      actions.appendChild(btnDel);

      row.appendChild(span1);
      row.appendChild(span2);
      row.appendChild(span3);
      row.appendChild(actions);
      wrapper.appendChild(row);
    });
}

function renderConsumabiliList() {
  const wrapper = document.getElementById("consumabiliElenco");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (consumabiliData.length === 0) {
    wrapper.textContent = "Nessuna segnalazione consumabili (demo).";
    return;
  }

  consumabiliData
    .slice()
    .sort((a, b) => (a.data > b.data ? -1 : 1))
    .forEach(item => {
      const row = document.createElement("div");
      row.className = "row";

      const span1 = document.createElement("span");
      span1.textContent = item.nome;

      const span2 = document.createElement("span");
      span2.textContent = item.nota || "-";

      const span3 = document.createElement("span");
      span3.textContent = item.data.split("-").reverse().join("/");

      const actions = document.createElement("span");
      actions.className = "actions";

      const btnDel = document.createElement("button");
      btnDel.className = "btn-secondary";
      btnDel.style.fontSize = "0.75rem";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        consumabiliData = consumabiliData.filter(a => a.id !== item.id);
        saveLocalData();
        renderConsumabiliList();
      });

      actions.appendChild(btnDel);

      row.appendChild(span1);
      row.appendChild(span2);
      row.appendChild(span3);
      row.appendChild(actions);
      wrapper.appendChild(row);
    });
}
// ------------------- FORM SUBMIT HANDLERS -------------------

function initArriviForm() {
  const form = document.getElementById("formArrivi");
  const feedback = document.getElementById("arriviFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const dataEl = document.getElementById("arrivoData");
    const descEl = document.getElementById("arrivoDescrizione");
    const noteEl = document.getElementById("arrivoNote");

    const data = dataEl?.value || todayISO();
    const descrizione = (descEl?.value || "").trim();
    const note = (noteEl?.value || "").trim();

    if (!descrizione) {
      if (feedback) {
        feedback.textContent = "Inserisci almeno una descrizione.";
        feedback.style.color = "#ffb3b3";
      }
      return;
    }

    arriviData.unshift({
      id: Date.now().toString(),
      data,
      descrizione,
      note
    });
    saveLocalData();
    renderArriviList();

    createNotification(
      "arrivi",
      ["farmacia", "titolare"],
      "Nuovo arrivo registrato",
      descrizione
    );

    form.reset();
    if (feedback) {
      feedback.textContent = "Arrivo registrato (demo).";
      feedback.style.color = "#3cf26c";
    }
  });
}

function initScadenzeForm() {
  const form = document.getElementById("formScadenze");
  const feedback = document.getElementById("scadenzeFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nomeEl = document.getElementById("scadNome");
    const pezziEl = document.getElementById("scadPezzi");
    const dataEl = document.getElementById("scadData");

    const nome = (nomeEl?.value || "").trim();
    const pezzi = (pezziEl?.value || "").trim();
    const dataScadenza = dataEl?.value || "";

    if (!nome || !dataScadenza) {
      if (feedback) {
        feedback.textContent = "Inserisci nome prodotto e data di scadenza.";
        feedback.style.color = "#ffb3b3";
      }
      return;
    }

    scadenzeData.push({
      id: Date.now().toString(),
      nome,
      pezzi,
      dataScadenza
    });
    saveLocalData();
    renderScadenzeList();

    // notifica se mancano <= 45 giorni
    const oggi = todayISO();
    const diff = diffInDays(oggi, dataScadenza);
    if (diff <= 45) {
      createNotification(
        "scadenze",
        ["farmacia", "titolare"],
        "Prodotto in scadenza",
        `${nome} scade il ${dataScadenza.split("-").reverse().join("/")}`
      );
    }

    form.reset();
    if (feedback) {
      feedback.textContent = "Scadenza registrata (demo).";
      feedback.style.color = "#3cf26c";
    }
  });
}

function initConsumabiliForm() {
  const form = document.getElementById("formConsumabili");
  const feedback = document.getElementById("consumabiliFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nomeEl = document.getElementById("consNome");
    const notaEl = document.getElementById("consNota");

    const nome = (nomeEl?.value || "").trim();
    const nota = (notaEl?.value || "").trim();

    if (!nome) {
      if (feedback) {
        feedback.textContent = "Inserisci il nome del consumabile.";
        feedback.style.color = "#ffb3b3";
      }
      return;
    }

    consumabiliData.unshift({
      id: Date.now().toString(),
      nome,
      nota,
      data: todayISO()
    });
    saveLocalData();
    renderConsumabiliList();

    createNotification(
      "consumabili",
      ["titolare"],
      "Segnalazione consumabili",
      nome
    );

    form.reset();
    if (feedback) {
      feedback.textContent = "Segnalazione registrata (demo).";
      feedback.style.color = "#3cf26c";
    }
  });
}

function initCambioCassaForm() {
  const form = document.getElementById("formCambioCassa");
  const feedback = document.getElementById("cambioFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const notaEl = document.getElementById("cambioNota");
    const nota = (notaEl?.value || "").trim();

    createNotification(
      "cambio",
      ["titolare"],
      "Richiesta cambio cassa",
      nota || "Necessità di tagli specifici in cassa."
    );

    form.reset();
    if (feedback) {
      feedback.textContent =
        "Richiesta cambio cassa inviata (demo – notifica al titolare).";
      feedback.style.color = "#3cf26c";
    }
  });
}
// ------------------- LOGIN / RUOLI ---------------------------

let authContainer,
  app,
  loginForm,
  authTabs,
  loginRoleLabel,
  rolePill;

function setRole(role) {
  currentRole = role;

  if (rolePill) {
    rolePill.textContent =
      role === "titolare"
        ? "Titolare"
        : role === "dipendente"
        ? "Dipendente"
        : "Farmacia (accesso generico)";
  }

  // le notifiche cambiano in base al ruolo
  updateAllBadges();
}

function initLogin() {
  authContainer = document.getElementById("authContainer");
  app = document.getElementById("app");
  loginForm = document.getElementById("loginForm");
  authTabs = document.querySelectorAll(".auth-tab");
  loginRoleLabel = document.getElementById("loginRoleLabel");
  rolePill = document.getElementById("currentRolePill");

  if (authTabs && authTabs.length > 0) {
    authTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        authTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const role = tab.dataset.role || "farmacia";
        if (loginRoleLabel) {
          loginRoleLabel.textContent =
            role === "titolare"
              ? "Titolare"
              : role === "dipendente"
              ? "Dipendente"
              : "Farmacia";
        }
      });
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const activeTab = document.querySelector(".auth-tab.active");
      const role = activeTab?.dataset.role || "farmacia";

      setRole(role);

      if (authContainer) authContainer.classList.add("hidden");
      if (app) app.classList.remove("hidden");

      showSection("dashboard");
      renderAll();
    });
  }
}
// ------------------- NAVIGAZIONE BOTTONI ---------------------

function initDashboardButtons() {
  const btnAssenti = document.getElementById("btnVaiTuttiAssenti");
  if (btnAssenti) {
    btnAssenti.addEventListener("click", () => {
      // per ora porta semplicemente alla stessa dashboard – in futuro
      // potresti aggiungere una pagina "tutti gli assenti"
      alert(
        "Qui in futuro apriremo la pagina completa con TUTTI gli assenti (demo)."
      );
    });
  }

  const btnArrivi = document.getElementById("btnVaiArrivi");
  const btnScadenze = document.getElementById("btnVaiScadenze");
  const btnConsumabili = document.getElementById("btnVaiConsumabili");

  if (btnArrivi) btnArrivi.addEventListener("click", () => showSection("arrivi"));
  if (btnScadenze)
    btnScadenze.addEventListener("click", () => showSection("scadenze"));
  if (btnConsumabili)
    btnConsumabili.addEventListener("click", () => showSection("consumabili"));

  const backFromArrivi = document.getElementById("backFromArrivi");
  const backFromScadenze = document.getElementById("backFromScadenze");
  const backFromConsumabili = document.getElementById("backFromConsumabili");

  if (backFromArrivi)
    backFromArrivi.addEventListener("click", () => showSection("dashboard"));
  if (backFromScadenze)
    backFromScadenze.addEventListener("click", () => showSection("dashboard"));
  if (backFromConsumabili)
    backFromConsumabili.addEventListener("click", () => showSection("dashboard"));
}

// ------------------- CLICK PALLINO NOTIFICHE -----------------

function initNotificationButtons() {
  document
    .querySelectorAll(".card-notif-badge[data-card]")
    .forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const cardKey = btn.getAttribute("data-card");
        if (!cardKey) return;
        openNotificationOverlay(cardKey);
      });
    });

  notifOverlay = document.getElementById("notificationOverlay");
  notifList = document.getElementById("notifList");
  notifTitle = document.getElementById("notifTitle");
  notifIntro = document.getElementById("notifIntro");
  notifClose = document.getElementById("notifClose");
  notifCloseBottom = document.getElementById("notifCloseBottom");

  if (notifClose) {
    notifClose.addEventListener("click", () => closeNotificationOverlay(true));
  }
  if (notifCloseBottom) {
    notifCloseBottom.addEventListener("click", () =>
      closeNotificationOverlay(true)
    );
  }
  if (notifOverlay) {
    notifOverlay.addEventListener("click", e => {
      if (e.target === notifOverlay || e.target.classList.contains("notif-backdrop")) {
        closeNotificationOverlay(true);
      }
    });
  }
}
// ------------------- RENDER COMPLETO DASHBOARD ---------------

function renderAll() {
  loadLocalData();

  renderAssentiCard();
  renderTurnoBanner();

  renderArriviList();
  renderScadenzeList();
  renderConsumabiliList();

  updateAllBadges();

  // calendario
  if (calMonth == null || calYear == null) {
    initCalendarState();
  }
  renderCalendar();
}

// ------------------- NOTIFICHE DEMO INIZIALI -----------------

function initDemoNotifications() {
  // qualche notifica demo per assenze
  createNotification(
    "assenze",
    ["farmacia", "titolare"],
    "Nuova assenza approvata",
    "Mario Rossi assente il 26/11 (demo)."
  );

  // non segniamo come lette, rimangono come esempio
}

// ------------------- DOM READY -------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Login / ruoli
  initLogin();

  // pulsanti nav dashboard
  initDashboardButtons();

  // form
  initArriviForm();
  initScadenzeForm();
  initConsumabiliForm();
  initCambioCassaForm();

  // notifiche (pallini + overlay)
  initNotificationButtons();

  // calendario nav
  initCalendarNav();

  // se per qualche motivo partiamo già loggati (es. debug)
  const app = document.getElementById("app");
  const authContainer = document.getElementById("authContainer");
  if (app && !app.classList.contains("hidden") && authContainer) {
    setRole(currentRole);
    renderAll();
  }

  initDemoNotifications();
});
// ============================================================
// FINE SCRIPT – PORTALE FARMACIA MONTESANO
// ============================================================
