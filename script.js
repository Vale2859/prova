// ===== STATO E COSTANTI =====
let currentUser = null;
let panoramicaTimer = null;
/* offset in giorni rispetto ad oggi (non usato ma tenuto per futuro) */
let agendaDayOffset = 0;

const STORAGE_KEYS = {
  UTENTI: "fm_utenti",
  ASSENZE: "fm_assenze",
  COMUNICAZIONI: "fm_comunicazioni",
  PROCEDURE: "fm_procedure",
  LOGISTICA: "fm_logistica",
  MAGAZZINO_NOTE: "fm_magazzino_note",
  CONSUMABILI: "fm_consumabili",
  CONSEGNE: "fm_consegne",
  OFFERTE: "fm_offerte",
  GIORNATE: "fm_giornate",
  APPUNTAMENTI: "fm_appuntamenti",
  SCADENZE: "fm_scadenze"
};

// ===== STORAGE =====
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== DATE HELPER =====
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatDateShortIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function isDateInRange(iso, dal, al) {
  const d = parseISO(iso);
  const start = parseISO(dal);
  const end = parseISO(al);
  return d >= start && d <= end;
}

function diffDays(fromIso, toIso) {
  const a = parseISO(fromIso);
  const b = parseISO(toIso);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ===== UTENTI =====
function initDemoUsers() {
  let utenti = loadData(STORAGE_KEYS.UTENTI, []);
  if (utenti.length === 0) {
    utenti = [
      { username: "farmacia", password: "farmacia", ruolo: "farmacia", nome: "Farmacia Montesano", telefono: "", email: "" },
      { username: "titolare", password: "titolare", ruolo: "titolare", nome: "Titolare", telefono: "", email: "" },

      { username: "fazzino", password: "1234", ruolo: "dipendente", nome: "Fazzino Cosimo", telefono: "", email: "" },
      { username: "rizzelli", password: "1234", ruolo: "dipendente", nome: "Rizzelli Patrizia", telefono: "", email: "" },
      { username: "andrisani", password: "1234", ruolo: "dipendente", nome: "Andrisani Daniela", telefono: "", email: "" },
      { username: "zavaliche", password: "1234", ruolo: "dipendente", nome: "Zavaliche Anamaria", telefono: "", email: "" },
      { username: "maragno", password: "1234", ruolo: "dipendente", nome: "Maragno Annalisa", telefono: "", email: "" },
      { username: "veneziano", password: "1234", ruolo: "dipendente", nome: "Veneziano Roberta", telefono: "", email: "" }
    ];
    saveData(STORAGE_KEYS.UTENTI, utenti);
  }
  return utenti;
}

function getAllUsers() {
  return loadData(STORAGE_KEYS.UTENTI, []);
}

// ===== BOOTSTRAP =====
document.addEventListener("DOMContentLoaded", () => {
  initDemoUsers();
  setupAuth();
  setupFarmaciaDashboard();
});

// ===== AUTH + ROUTING =====
function setupAuth() {
  const viewAuth = document.getElementById("view-auth");
  const viewFarmacia = document.getElementById("view-farmacia");
  const viewTitolare = document.getElementById("view-titolare");
  const viewDip = document.getElementById("view-dipendente");
  const viewCli = document.getElementById("view-cliente");

  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");
  const btnDemoFarmacia = document.getElementById("btn-demo-farmacia");
  const btnEsci = document.getElementById("btn-esci");
  const userLabel = document.getElementById("user-label");
  const topSubtitle = document.getElementById("topbar-subtitle");

  function showView(viewId) {
    const views = [viewAuth, viewFarmacia, viewTitolare, viewDip, viewCli];
    views.forEach((v) => v && v.classList.add("hidden"));
    const v = document.getElementById(viewId);
    if (v) v.classList.remove("hidden");
  }

  function loginAs(user) {
    currentUser = user;
    userLabel.textContent = user ? `${user.nome} (${user.ruolo})` : "Ospite";
    topSubtitle.textContent = user
      ? `Accesso come ${user.ruolo}`
      : "Accesso non effettuato";

    if (!user) {
      showView("view-auth");
      return;
    }

    if (user.ruolo === "farmacia") {
      showView("view-farmacia");
      updateFarmaciaView();
    } else if (user.ruolo === "titolare") {
      showView("view-titolare");
      updateTitolareView();
    } else if (user.ruolo === "dipendente") {
      showView("view-dipendente");
      updateDipendenteView();
    } else if (user.ruolo === "cliente") {
      showView("view-cliente");
      updateClienteView();
    }
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();
      const all = getAllUsers();
      const found = all.find(
        (u) => u.username === username && u.password === password
      );
      if (!found) {
        alert("Credenziali non valide.");
        return;
      }
      loginAs(found);
    });
  }

  // Demo farmacia
  if (btnDemoFarmacia) {
    btnDemoFarmacia.addEventListener("click", () => {
      const all = getAllUsers();
      const f = all.find((u) => u.username === "farmacia");
      if (f) loginAs(f);
    });
  }

  // Registrazione
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullname = document.getElementById("reg-fullname").value.trim();
      const ruolo = document.getElementById("reg-role").value;
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const username = document.getElementById("reg-username").value.trim();
      const password = document.getElementById("reg-password").value.trim();

      if (!fullname || !username || !password) {
        alert("Nome, username e password sono obbligatori.");
        return;
      }
      if (ruolo === "cliente" && !phone) {
        alert("Per i clienti il telefono è obbligatorio.");
        return;
      }

      const all = getAllUsers();
      if (all.some((u) => u.username === username)) {
        alert("Username già esistente.");
        return;
      }

      const nuovo = { username, password, ruolo, nome: fullname, telefono: phone, email };
      all.push(nuovo);
      saveData(STORAGE_KEYS.UTENTI, all);
      alert("Registrazione completata. Ora puoi accedere.");
    });
  }

  // Logout
  if (btnEsci) {
    btnEsci.addEventListener("click", () => {
      currentUser = null;
      loginAs(null);
    });
  }

  loginAs(null);
}

// Aggiorna viste in base all'utente
function updateAllViews() {
  if (!currentUser) return;
  if (currentUser.ruolo === "farmacia") updateFarmaciaView();
  if (currentUser.ruolo === "titolare") updateTitolareView();
  if (currentUser.ruolo === "dipendente") updateDipendenteView();
  if (currentUser.ruolo === "cliente") updateClienteView();
}

// ===== FARMACIA – DASHBOARD =====
function setupFarmaciaDashboard() {
  setupSezioniListeners();
  setupPromoGiornateListeners();
  setupAgendaWidgetInteractions();
}

// Panoramica vs dettaglio
function resetPanoramicaTimer() {
  if (panoramicaTimer) clearTimeout(panoramicaTimer);
  panoramicaTimer = setTimeout(() => {
    showPanoramica();
  }, 20000);
}

function showPanoramica() {
  const pano = document.getElementById("panoramica-box");
  const det = document.getElementById("sezione-dettaglio");
  if (pano && det) {
    pano.classList.remove("hidden");
    det.classList.add("hidden");
  }
}

function showSezioneDettaglio(title, html) {
  const pano = document.getElementById("panoramica-box");
  const det = document.getElementById("sezione-dettaglio");
  const detTitle = document.getElementById("detail-title");
  const detBody = document.getElementById("detail-content");

  if (!pano || !det || !detTitle || !detBody) return;

  detTitle.textContent = title;
  detBody.innerHTML = html;

  pano.classList.add("hidden");
  det.classList.remove("hidden");

  resetPanoramicaTimer();
}

function updatePanoramica() {
  const valServ = document.getElementById("val-servizi-oggi");
  const valAssenze = document.getElementById("val-assenze-oggi");
  const valScad = document.getElementById("val-scadenze-60");

  const oggi = todayISO();
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
  const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);
  const assenze = loadData(STORAGE_KEYS.ASSENZE, []);

  const serviziOggi = app.filter((a) => a.data === oggi).length;
  const assenzeOggi = assenze.filter((a) => isDateInRange(oggi, a.dal, a.al)).length;
  const entro60 = scadenze.filter((s) => {
    const diff = diffDays(oggi, s.dataScadenza);
    return diff >= 0 && diff <= 60;
  }).length;

  if (valServ) valServ.textContent = serviziOggi;
  if (valAssenze) valAssenze.textContent = assenzeOggi;
  if (valScad) valScad.textContent = entro60;
}

// Sezioni Q1 – SOLO RIEPILOGO, NIENTE FORM
function setupSezioniListeners() {
  const secButtons = document.querySelectorAll(".sec-card");
  const btnBackPano = document.getElementById("btn-back-panorama");
  if (btnBackPano) {
    btnBackPano.addEventListener("click", () => {
      showPanoramica();
    });
  }

  secButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sec = btn.getAttribute("data-section");
      openSection(sec);
    });
  });
}

function openSection(sec) {
  resetPanoramicaTimer();
  const oggi = todayISO();

  // ... (TUTTE LE SEZIONI SONO IDENTICHE A QUELLE CHE HAI GIÀ)
  // Per brevità non ricommento ogni blocco: il codice è lo stesso
  // che mi hai incollato, non l'ho modificato.

  // (qui dentro lascia invariato tutto da "if (sec === 'assenti')" 
  // fino alla fine della funzione openSection, come nel tuo script)
}

/* --- per non farti scorrere 200 righe, riassumo:
   DA QUI FINO A PRIMA DI "updateFarmaciaView()" è IDENTICO al tuo,
   copialo uguale a come l'hai incollato (assenze, turno, comunicazioni,
   procedure, logistica, magazzino, scadenze, consumabili, consegne).
   --- */

/* ======================= FINE openSection ======================= */

function updateFarmaciaView() {
  updatePanoramica();
  renderPromoAndGiornate();
  renderAgenda();          // alias del widget
}

// ===== MODALE GENERICA =====
function openModal(title, innerHtml, onReady) {
  const mb = document.getElementById("modal-backdrop");
  const mt = document.getElementById("modal-title");
  const mbd = document.getElementById("modal-body");
  if (!mb || !mt || !mbd) return;
  mt.textContent = title;
  mbd.innerHTML = innerHtml;
  mb.classList.remove("hidden");
  if (onReady) onReady();
}

function closeModal() {
  const mb = document.getElementById("modal-backdrop");
  if (mb) mb.classList.add("hidden");
}

/* ===== PROMOZIONI & GIORNATE – da qui fino a renderPromoAndGiornate()
   lascia TUTTO identico al tuo file: openModalOfferta, openModalGiornata,
   openModalScadenza, openModalTuttePromo ecc. Non ho cambiato nulla.    */

/* =================== INIZIO SEZIONE AGENDA (NUOVA) =================== */

// helper nome giorno
function weekdayNameIT(date) {
  const giorni = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato"
  ];
  return giorni[date.getDay()];
}

/**
 * Render del widget agenda in basso a destra
 * (stile Mac: giorno grande + prossimi giorni)
 */
function renderAgendaWidget() {
  const todayDateEl   = document.getElementById("agenda-today-date");
  const todayListEl   = document.getElementById("agenda-today-list");
  const nextListEl    = document.getElementById("agenda-next-list");
  const headerDateEl  = document.getElementById("agenda-header-date");

  if (!todayDateEl || !todayListEl || !nextListEl) return;

  const todayIso = todayISO(); // "YYYY-MM-DD"
  const [y, m, d] = todayIso.split("-");
  const todayDate = new Date(Number(y), Number(m) - 1, Number(d));

  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []).sort((a, b) => {
    if (a.data === b.data) return a.ora.localeCompare(b.ora);
    return a.data.localeCompare(b.data);
  });

  const monthNamesFull = [
    "gennaio","febbraio","marzo","aprile","maggio","giugno",
    "luglio","agosto","settembre","ottobre","novembre","dicembre"
  ];

  const weekdayUpper = weekdayNameIT(todayDate).toUpperCase();
  const dayNumber = Number(d);
  const monthName = monthNamesFull[Number(m) - 1];

  // parte sinistra: giorno grande + mese
  todayDateEl.innerHTML = `
    <div class="agenda-day-big">${dayNumber}</div>
    <div class="agenda-day-info">
      <div class="agenda-day-weekday">${weekdayUpper}</div>
      <div class="agenda-day-month">${monthName} ${y}</div>
    </div>
  `;

  // pillola in alto a destra
  if (headerDateEl) {
    headerDateEl.textContent = `${weekdayUpper} ${dayNumber} ${monthName} ${y}`;
  }

  // ===== COLONNA SINISTRA: APPUNTAMENTI DI OGGI =====
  const todayApps = app.filter((a) => a.data === todayIso);

  todayListEl.innerHTML = "";
  if (todayApps.length === 0) {
    todayListEl.innerHTML = `<p class="agenda-empty">Nessun appuntamento per oggi.</p>`;
  } else {
    todayApps.forEach((a) => {
      const card = document.createElement("div");
      card.className = "agenda-app-card";
      card.innerHTML = `
        <div class="agenda-app-time">${a.ora || "--:--"}</div>
        <div class="agenda-app-main">${a.nome}</div>
        <div class="agenda-app-sub">
          ${a.telefono || ""} ${a.motivo ? " · " + a.motivo : ""}
        </div>
      `;
      card.addEventListener("click", () => openModalAgendaDay(todayIso));
      todayListEl.appendChild(card);
    });
  }

  // ===== COLONNA DESTRA: PROSSIMI 4 GIORNI =====
  nextListEl.innerHTML = "";
  for (let offset = 1; offset <= 4; offset++) {
    const dt = new Date(todayDate);
    dt.setDate(dt.getDate() + offset);

    const yy  = dt.getFullYear();
    const mm  = String(dt.getMonth() + 1).padStart(2, "0");
    const dd  = String(dt.getDate()).padStart(2, "0");
    const iso = `${yy}-${mm}-${dd}`;

    const count = app.filter((a) => a.data === iso).length;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "agenda-next-day-card";
    btn.innerHTML = `
      <span class="and-day">${weekdayNameIT(dt)}</span>
      <span class="and-date">${dd}/${mm}</span>
      <span class="and-count">
        ${count > 0 ? count + " appuntamento" + (count > 1 ? "i" : "") : "Nessun appuntamento"}
      </span>
    `;
    btn.addEventListener("click", () => openModalAgendaDay(iso));
    nextListEl.appendChild(btn);
  }
}

/**
 * Alias per compatibilità con vecchie chiamate
 */
function renderAgenda() {
  renderAgendaWidget();
}

/**
 * Modale "giorno" stile vista calendario:
 * elenco appuntamenti del giorno cliccato
 */
function openModalAgendaDay(iso) {
  const d = parseISO(iso);
  const monthNamesFull = [
    "gennaio","febbraio","marzo","aprile","maggio","giugno",
    "luglio","agosto","settembre","ottobre","novembre","dicembre"
  ];
  const titoloData =
    `${weekdayNameIT(d)} ${d.getDate()} ${monthNamesFull[d.getMonth()]} ${d.getFullYear()}`;

  const apps = loadData(STORAGE_KEYS.APPUNTAMENTI, [])
    .filter((a) => a.data === iso)
    .sort((a, b) => (a.ora || "").localeCompare(b.ora || ""));

  let html = `<p class="small"><strong>${titoloData}</strong></p>`;

  if (apps.length === 0) {
    html += `<p>Nessun appuntamento per questo giorno.</p>`;
  } else {
    html += `<ul class="simple-list">`;
    apps.forEach((a) => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${a.ora || "--:--"} – ${a.nome}</span>
            <span class="row-sub">
              ${a.telefono || ""} ${a.motivo ? " · " + a.motivo : ""}
            </span>
          </div>
        </li>`;
    });
    html += `</ul>`;
  }

  openModal("Agenda del giorno", html);
}

/**
 * Inizializza il widget agenda
 */
function setupAgendaWidgetInteractions() {
  // render iniziale quando la dashboard viene caricata
  renderAgendaWidget();
}

/* =================== FINE SEZIONE AGENDA =================== */

// ===== VISTE RUOLI =====
function updateTitolareView() {
  if (!currentUser || currentUser.ruolo !== "titolare") return;
  const offerte = loadData(STORAGE_KEYS.OFFERTE, []);
  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
  const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);

  const statOff = document.getElementById("stat-offerte-tot");
  const statGio = document.getElementById("stat-giornate-tot");
  const statApp = document.getElementById("stat-appuntamenti-tot");
  const statScad = document.getElementById("stat-scadenze-tot");
  if (statOff) statOff.textContent = offerte.length;
  if (statGio) statGio.textContent = giornate.length;
  if (statApp) statApp.textContent = app.length;

  const oggi = todayISO();
  const entro60 = scadenze.filter((s) => {
    const diff = diffDays(oggi, s.dataScadenza);
    return diff >= 0 && diff <= 60;
  }).length;
  if (statScad) statScad.textContent = entro60;

  const listDip = document.getElementById("lista-dipendenti-titolare");
  if (listDip) {
    const all = getAllUsers().filter((u) => u.ruolo === "dipendente");
    listDip.innerHTML = "";
    all.forEach((u) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row-main">
          <span class="row-title">${u.nome}</span>
          <span class="row-sub">Username: ${u.username}</span>
        </div>`;
      listDip.appendChild(li);
    });
  }
}

function updateDipendenteView() {
  if (!currentUser || currentUser.ruolo !== "dipendente") return;
  const title = document.getElementById("dipendente-title");
  if (title) title.textContent = `Area dipendente – ${currentUser.nome}`;

  const lista = document.getElementById("lista-appuntamenti-dip");
  if (!lista) return;
  const oggi = todayISO();
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []).filter(
    (a) => a.data === oggi
  );

  lista.innerHTML = "";
  if (app.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessun appuntamento per oggi.";
    lista.appendChild(li);
    return;
  }

  app.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="row-main">
        <span class="row-title">${a.ora} – ${a.nome}</span>
        <span class="row-sub">${a.telefono || ""} · ${a.motivo || ""}</span>
      </div>`;
    lista.appendChild(li);
  });
}

function updateClienteView() {
  if (!currentUser || currentUser.ruolo !== "cliente") return;
  const title = document.getElementById("cliente-title");
  const dati = document.getElementById("cliente-dati");
  const lista = document.getElementById("lista-appuntamenti-cli");

  if (title) title.textContent = `Area cliente – ${currentUser.nome}`;
  if (dati) {
    dati.textContent = `Telefono: ${currentUser.telefono || "-"} · Email: ${
      currentUser.email || "-"
    }`;
  }

  if (!lista) return;
  const oggi = todayISO();
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []).filter(
    (a) => a.clienteUsername === currentUser.username && a.data >= oggi
  );
  lista.innerHTML = "";
  if (app.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Non hai appuntamenti futuri.";
    lista.appendChild(li);
    return;
  }
  app.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="row-main">
        <span class="row-title">${formatDateShortIT(a.data)} – ${a.ora}</span>
        <span class="row-sub">${a.motivo || ""}</span>
      </div>`;
    lista.appendChild(li);
  });
}

// === PULSANTE QUICK ACTION CENTRALE + MENU RADIALE ===
document.addEventListener("DOMContentLoaded", () => {
  const quickBtn = document.getElementById("quick-btn");
  const quickMenu = document.getElementById("quick-menu");

  if (!quickBtn || !quickMenu) return;

  // clic sul tasto centrale
  quickBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    quickMenu.classList.toggle("hidden");
    quickBtn.classList.toggle("open");
  });

  // clic fuori: chiude il menu
  document.addEventListener("click", () => {
    quickMenu.classList.add("hidden");
    quickBtn.classList.remove("open");
  });

  // azioni dei pulsanti del menu
  quickMenu.querySelectorAll(".qm-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.getAttribute("data-action");

      if (action === "nuova-com") {
        alert("Azione rapida: nuova comunicazione interna");
      } else if (action === "nuovo-app") {
        alert("Azione rapida: nuovo appuntamento");
      } else if (action === "consegne") {
        alert("Azione rapida: consegna / ritiro");
      } else if (action === "consumabili") {
        alert("Azione rapida: aggiornamento consumabili");
      } else if (action === "scadenza") {
        alert("Azione rapida: nuova scadenza prodotto");
      } else if (action === "procedura") {
        alert("Azione rapida: nuova procedura");
      } else if (action === "cambio-farmacia") {
        alert("Azione rapida: cambio farmacia");
      }

      quickMenu.classList.add("hidden");
      quickBtn.classList.remove("open");
    });
  });
});
