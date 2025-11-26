// ============================================================
// PORTALE FARMACIA MONTESANO – SCRIPT COMPLETO
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
let cambioData = [];

let richiesteAssenze = [];

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
  { nome: "Mario Rossi",   dal: "2025-11-26", al: "2025-11-26", ruolo: "farmacia"   },
  { nome: "Giulia Bianchi", dal: "2025-11-26", al: "2025-11-28", ruolo: "dipendente" },
  { nome: "Cosimo Verdi",   dal: "2025-11-28", al: "2025-11-30", ruolo: "dipendente" },
  { nome: "Annalisa Neri",  dal: "2025-12-02", al: "2025-12-05", ruolo: "dipendente" },
  { nome: "Daniela Blu",    dal: "2025-12-05", al: "2025-12-07", ruolo: "dipendente" }
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
    const k = localStorage.getItem("fm_cambio");
    if (a) arriviData = JSON.parse(a);
    if (s) scadenzeData = JSON.parse(s);
    if (c) consumabiliData = JSON.parse(c);
    if (k) cambioData = JSON.parse(k);
  } catch (e) {
    console.warn("Errore lettura localStorage", e);
  }
}

function saveLocalData() {
  try {
    localStorage.setItem("fm_arrivi", JSON.stringify(arriviData));
    localStorage.setItem("fm_scadenze", JSON.stringify(scadenzeData));
    localStorage.setItem("fm_consumabili", JSON.stringify(consumabiliData));
    localStorage.setItem("fm_cambio", JSON.stringify(cambioData));
  } catch (e) {
    console.warn("Errore salvataggio localStorage", e);
  }
}

// ------------------- UTILS SEZIONI --------------------------
function showSection(sectionId) {
  currentSection = sectionId;

  const ids = [
    "dashboard",
    "assenzePage",
    "arriviPage",
    "scadenzePage",
    "consumabiliPage",
    "cambioPage"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  const target = document.getElementById(sectionId);
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
  notifCloseBottom,
  notifSegnaTutte;
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

  const tutteAssenze = assenzeDemo; // demo + eventuali aggiunte

  const assentiOggi = tutteAssenze.filter(a =>
    isDateInRange(today, a.dal, a.al)
  );

  const prossime = tutteAssenze
    .filter(a => diffInDays(today, a.dal) > 0)
    .sort((a, b) => (a.dal < b.dal ? -1 : 1));

  // Testo data in alto (card dashboard)
  const dataLabel = document.getElementById("assenzeOggiDataLabel");
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

  // Lista assenti oggi (card dashboard)
  const ulOggi = document.getElementById("listaAssentiOggi");
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

  // Lista prossime assenze (card dashboard, max 3)
  const ulProssime = document.getElementById("listaAssentiProssimi");
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

  // Pagina interna assenze (elenco completo)
  const pageOggi = document.getElementById("pageAssentiOggi");
  const pageProssimi = document.getElementById("pageAssentiProssimi");

  if (pageOggi) {
    pageOggi.innerHTML = "";
    if (assentiOggi.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessun assente segnato oggi (demo).";
      pageOggi.appendChild(li);
    } else {
      assentiOggi.forEach(a => {
        const dal = a.dal.split("-").reverse().join("/");
        const al = a.al.split("-").reverse().join("/");
        const li = document.createElement("li");
        li.innerHTML = `<strong>${a.nome}</strong> · dal ${dal} al ${al}`;
        pageOggi.appendChild(li);
      });
    }
  }

  if (pageProssimi) {
    pageProssimi.innerHTML = "";
    if (prossime.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna assenza programmata (demo).";
      pageProssimi.appendChild(li);
    } else {
      prossime.forEach(a => {
        const dal = a.dal.split("-").reverse().join("/");
        const al = a.al.split("-").reverse().join("/");
        const li = document.createElement("li");
        li.innerHTML = `<strong>${a.nome}</strong> · dal ${dal} al ${al}`;
        pageProssimi.appendChild(li);
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
  const btnPrev = document.getElementById("calPrevMonth");
  const btnNext = document.getElementById("calNextMonth");

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

  const cont = document.getElementById("turnoTodayInfo");
  if (!cont) return;

  cont.innerHTML = "";

  const p1 = document.createElement("p");
  p1.innerHTML = `<strong>${turno.principale}</strong> · ${turno.indirizzo}`;
  const p2 = document.createElement("p");
  p2.textContent = `Tel: ${turno.telefono}`;
  const p3 = document.createElement("p");
  p3.innerHTML = `<strong>Farmacia di appoggio:</strong> ${turno.appoggio} · ${turno.appoggioIndirizzo}`;
  const p4 = document.createElement("p");
  p4.textContent = `Tel: ${turno.appoggioTelefono}`;

  cont.appendChild(p1);
  cont.appendChild(p2);
  cont.appendChild(p3);
  cont.appendChild(p4);
}

// ------------------- RENDER ARRIVI / SCADENZE / CONSUMABILI ---

function renderArriviList() {
  const wrapper = document.getElementById("listaArrivi");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (arriviData.length === 0) {
    wrapper.textContent = "Nessun arrivo registrato (demo).";
    return;
  }

  const header = document.createElement("div");
  header.className = "row header";
  ["Data", "Descrizione", "Note", "Azioni"].forEach(t => {
    const span = document.createElement("span");
    span.textContent = t;
    header.appendChild(span);
  });
  wrapper.appendChild(header);

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
  const wrapper = document.getElementById("listaScadenze");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (scadenzeData.length === 0) {
    wrapper.textContent = "Nessuna scadenza registrata (demo).";
    return;
  }

  const header = document.createElement("div");
  header.className = "row header";
  ["Prodotto", "Pezzi", "Scadenza", "Azioni"].forEach(t => {
    const span = document.createElement("span");
    span.textContent = t;
    header.appendChild(span);
  });
  wrapper.appendChild(header);

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
  const wrapper = document.getElementById("listaConsumabili");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (consumabiliData.length === 0) {
    wrapper.textContent = "Nessuna segnalazione consumabili (demo).";
    return;
  }

  const header = document.createElement("div");
  header.className = "row header";
  ["Prodotto", "Note", "Data", "Azioni"].forEach(t => {
    const span = document.createElement("span");
    span.textContent = t;
    header.appendChild(span);
  });
  wrapper.appendChild(header);

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

function renderCambioList() {
  const wrapper = document.getElementById("listaCambio");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  if (cambioData.length === 0) {
    wrapper.textContent = "Nessuna segnalazione cambio cassa (demo).";
    return;
  }

  const header = document.createElement("div");
  header.className = "row header";
  ["Dettaglio", "Urgenza", "Data", "Azioni"].forEach(t => {
    const span = document.createElement("span");
    span.textContent = t;
    header.appendChild(span);
  });
  wrapper.appendChild(header);

  cambioData
    .slice()
    .sort((a, b) => (a.data > b.data ? -1 : 1))
    .forEach(item => {
      const row = document.createElement("div");
      row.className = "row";

      const span1 = document.createElement("span");
      span1.textContent = item.dettaglio || "-";

      const span2 = document.createElement("span");
      span2.textContent = item.urgenza || "-";

      const span3 = document.createElement("span");
      span3.textContent = item.data.split("-").reverse().join("/");

      const actions = document.createElement("span");
      actions.className = "actions";

      const btnDel = document.createElement("button");
      btnDel.className = "btn-secondary";
      btnDel.style.fontSize = "0.75rem";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        cambioData = cambioData.filter(a => a.id !== item.id);
        saveLocalData();
        renderCambioList();
      });

      actions.appendChild(btnDel);

      row.appendChild(span1);
      row.appendChild(span2);
      row.appendChild(span3);
      row.appendChild(actions);
      wrapper.appendChild(row);
    });
}

// ------------------- FORM ASSENZE ---------------------------

function updateAssenzeRoleUI() {
  const btnRich = document.getElementById("btnRichiediAssenza");
  const btnSegna = document.getElementById("btnSegnaAssenza");
  const formTitle = document.getElementById("assenzaFormTitle");

  if (btnRich && btnSegna) {
    if (currentRole === "dipendente") {
      btnRich.classList.remove("hidden");
      btnSegna.classList.add("hidden");
      if (formTitle) formTitle.textContent = "Richiedi assenza / ritardo";
    } else if (currentRole === "titolare") {
      btnRich.classList.add("hidden");
      btnSegna.classList.remove("hidden");
      if (formTitle) formTitle.textContent = "Segna assenza / ritardo";
    } else {
      btnRich.classList.add("hidden");
      btnSegna.classList.add("hidden");
      if (formTitle) formTitle.textContent = "Gestione assenze / ritardi";
    }
  }
}

function initAssenzaForm() {
  const form = document.getElementById("formRichiestaAssenza");
  const feedback = document.getElementById("assRichiestaFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nomeEl = document.getElementById("assNome");
    const dalEl = document.getElementById("assDal");
    const alEl = document.getElementById("assAl");
    const motivoEl = document.getElementById("assMotivo");

    const nome = (nomeEl?.value || "").trim();
    const dal = dalEl?.value || "";
    const al = alEl?.value || dal;
    const motivo = (motivoEl?.value || "").trim();

    if (!nome || !dal) {
      if (feedback) {
        feedback.textContent = "Inserisci almeno nome e data di inizio.";
        feedback.classList.remove("hidden");
        feedback.style.color = "#ffb3b3";
      }
      return;
    }

    const dalFmt = dal.split("-").reverse().join("/");
    const alFmt = al.split("-").reverse().join("/");

    if (currentRole === "dipendente") {
      // Richiesta al titolare
      richiesteAssenze.push({
        id: Date.now().toString(),
        nome,
        dal,
        al,
        motivo,
        stato: "in_attesa"
      });

      createNotification(
        "assenze",
        ["titolare"],
        "Nuova richiesta assenza / ritardo",
        `${nome} dal ${dalFmt} al ${alFmt}${motivo ? " – " + motivo : ""}`
      );
    } else if (currentRole === "titolare") {
      // Titolare segna direttamente l'assenza nel calendario
      assenzeDemo.push({
        nome,
        dal,
        al,
        ruolo: "dipendente"
      });

      createNotification(
        "assenze",
        ["farmacia", "dipendente"],
        "Assenza / ritardo registrato",
        `${nome} dal ${dalFmt} al ${alFmt}${motivo ? " – " + motivo : ""}`
      );

      renderAssentiCard();
      renderCalendar();
    }

    form.reset();
    if (feedback) {
      feedback.textContent =
        currentRole === "dipendente"
          ? "Richiesta inviata al titolare (demo)."
          : "Assenza registrata (demo).";
      feedback.classList.remove("hidden");
      feedback.style.color = "#3cf26c";
    }
  });
}

// ------------------- FORM SUBMIT HANDLERS -------------------

function initArriviForm() {
  const form = document.getElementById("formArrivo");
  const feedback = document.getElementById("arrivoFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const dataEl = document.getElementById("arrData");
    const descEl = document.getElementById("arrDescrizione");
    const noteEl = document.getElementById("arrNote");

    const data = dataEl?.value || todayISO();
    const descrizione = (descEl?.value || "").trim();
    const note = (noteEl?.value || "").trim();

    if (!descrizione) {
      if (feedback) {
        feedback.textContent = "Inserisci almeno una descrizione.";
        feedback.classList.remove("hidden");
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
      feedback.classList.remove("hidden");
      feedback.style.color = "#3cf26c";
    }
  });
}

function initScadenzeForm() {
  const form = document.getElementById("formScadenza");
  const feedback = document.getElementById("scadFeedback");
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
        feedback.classList.remove("hidden");
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
      feedback.classList.remove("hidden");
      feedback.style.color = "#3cf26c";
    }
  });
}

function initConsumabiliForm() {
  const form = document.getElementById("formConsumabile");
  const feedback = document.getElementById("consFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nomeEl = document.getElementById("consNome");
    const notaEl = document.getElementById("consNote");

    const nome = (nomeEl?.value || "").trim();
    const nota = (notaEl?.value || "").trim();

    if (!nome) {
      if (feedback) {
        feedback.textContent = "Inserisci il nome del consumabile.";
        feedback.classList.remove("hidden");
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
      feedback.classList.remove("hidden");
      feedback.style.color = "#3cf26c";
    }
  });
}

function initCambioCassaForm() {
  const form = document.getElementById("formCambio");
  const feedback = document.getElementById("cambioFeedback");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const dettaglioEl = document.getElementById("cambioDettaglio");
    const urgenzaEl = document.getElementById("cambioUrgenza");

    const dettaglio = (dettaglioEl?.value || "").trim();
    const urgenza = urgenzaEl?.value || "normale";

    cambioData.unshift({
      id: Date.now().toString(),
      dettaglio,
      urgenza,
      data: todayISO()
    });
    saveLocalData();
    renderCambioList();

    createNotification(
      "cambio",
      ["titolare"],
      "Richiesta cambio cassa",
      dettaglio
        ? `${dettaglio} (urgenza: ${urgenza})`
        : `Necessità cambio cassa (urgenza: ${urgenza}).`
    );

    form.reset();
    if (feedback) {
      feedback.textContent =
        "Richiesta cambio cassa inviata (demo – notifica al titolare).";
      feedback.classList.remove("hidden");
      feedback.style.color = "#3cf26c";
    }
  });
}

// ------------------- LOGIN / RUOLI ---------------------------

let authContainerEl,
  appEl,
  loginFormEl,
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

  updateAssenzeRoleUI();
  updateAllBadges();
}

function initLogin() {
  authContainerEl = document.getElementById("authContainer");
  appEl = document.getElementById("app");
  loginFormEl = document.getElementById("loginForm");
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

  if (loginFormEl) {
    loginFormEl.addEventListener("submit", e => {
      e.preventDefault();
      const activeTab = document.querySelector(".auth-tab.active");
      const role = activeTab?.dataset.role || "farmacia";

      setRole(role);

      if (authContainerEl) authContainerEl.classList.add("hidden");
      if (appEl) appEl.classList.remove("hidden");

      showSection("dashboard");
      renderAll();
    });
  }
}

// ------------------- NAVIGAZIONE BOTTONI ---------------------

function initDashboardButtons() {
  const btnAssenti = document.getElementById("btnVaiTuttiAssenti");
  const btnRich = document.getElementById("btnRichiediAssenza");
  const btnSegna = document.getElementById("btnSegnaAssenza");

  if (btnAssenti) {
    btnAssenti.addEventListener("click", () => {
      showSection("assenzePage");
    });
  }
  if (btnRich) {
    btnRich.addEventListener("click", () => {
      showSection("assenzePage");
    });
  }
  if (btnSegna) {
    btnSegna.addEventListener("click", () => {
      showSection("assenzePage");
    });
  }

  const btnArrivi = document.getElementById("btnVaiArrivi");
  const btnScadenze = document.getElementById("btnVaiScadenze");
  const btnConsumabili = document.getElementById("btnVaiConsumabili");
  const btnCambio = document.getElementById("btnVaiCambio");

  if (btnArrivi) btnArrivi.addEventListener("click", () => showSection("arriviPage"));
  if (btnScadenze)
    btnScadenze.addEventListener("click", () => showSection("scadenzePage"));
  if (btnConsumabili)
    btnConsumabili.addEventListener("click", () => showSection("consumabiliPage"));
  if (btnCambio)
    btnCambio.addEventListener("click", () => showSection("cambioPage"));

  // Bottoni "← Dashboard"
  document.querySelectorAll(".back-button[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-back") || "dashboard";
      showSection(target);
    });
  });
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

  notifOverlay = document.getElementById("notifOverlay");
  notifList = document.getElementById("notifList");
  notifTitle = document.getElementById("notifTitle");
  notifIntro = document.getElementById("notifIntro");
  notifClose = document.getElementById("notifClose");
  notifCloseBottom = document.getElementById("notifCloseBottom");
  notifSegnaTutte = document.getElementById("notifSegnaTutte");

  if (notifClose) {
    notifClose.addEventListener("click", () => closeNotificationOverlay(true));
  }
  if (notifCloseBottom) {
    notifCloseBottom.addEventListener("click", () =>
      closeNotificationOverlay(true)
    );
  }
  if (notifSegnaTutte) {
    notifSegnaTutte.addEventListener("click", () =>
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
  renderCambioList();

  updateAllBadges();

  // calendario
  if (calMonth == null || calYear == null) {
    initCalendarState();
  }
  renderCalendar();
}

// ------------------- NOTIFICHE DEMO INIZIALI -----------------

function initDemoNotifications() {
  createNotification(
    "assenze",
    ["farmacia", "titolare"],
    "Nuova assenza approvata",
    "Mario Rossi assente il 26/11 (demo)."
  );
}

// ------------------- DOM READY -------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Login / ruoli
  initLogin();

  // pulsanti nav dashboard
  initDashboardButtons();

  // form
  initAssenzaForm();
  initArriviForm();
  initScadenzeForm();
  initConsumabiliForm();
  initCambioCassaForm();

  // notifiche (pallini + overlay)
  initNotificationButtons();

  // calendario nav
  initCalendarNav();

  // se per qualche motivo partiamo già loggati (es. debug)
  const appCheck = document.getElementById("app");
  const authCheck = document.getElementById("authContainer");
  if (appCheck && !appCheck.classList.contains("hidden") && authCheck) {
    setRole(currentRole);
    renderAll();
  }

  initDemoNotifications();
});
// ============================================================
// FINE SCRIPT – PORTALE FARMACIA MONTESANO
// ============================================================