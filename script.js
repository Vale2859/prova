/* ============================================================
   PORTALE FARMACIA MONTESANO
   SCRIPT.JS — BLOCCO 1/6
   Bootstrap + Helpers + Storage + Auth
============================================================ */

// ===== STATO =====
let currentUser = null;
let panoramicaTimer = null;
let agendaMonthOffset = 0;

// ===== STORAGE KEYS =====
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
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== DATE TOOLS =====
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function parseISO(str) {
  const [y, m, d] = str.split("-");
  return new Date(+y, m - 1, +d);
}

function formatDateShortIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function isDateInRange(iso, dal, al) {
  const x = parseISO(iso);
  return x >= parseISO(dal) && x <= parseISO(al);
}

function diffDays(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000);
}

// ===== UTENTI DEMO =====
function initDemoUsers() {
  let utenti = loadData(STORAGE_KEYS.UTENTI, []);
  if (utenti.length === 0) {
    utenti = [
      { username: "farmacia", password: "farmacia", ruolo: "farmacia", nome: "Farmacia Montesano" },
      { username: "titolare", password: "titolare", ruolo: "titolare", nome: "Titolare" },
      { username: "fazzino", password: "1234", ruolo: "dipendente", nome: "Fazzino Cosimo" },
      { username: "rizzelli", password: "1234", ruolo: "dipendente", nome: "Rizzelli Patrizia" },
      { username: "andrisani", password: "1234", ruolo: "dipendente", nome: "Andrisani Daniela" },
      { username: "zavaliche", password: "1234", ruolo: "dipendente", nome: "Zavaliche Anamaria" },
      { username: "maragno", password: "1234", ruolo: "dipendente", nome: "Maragno Annalisa" },
      { username: "veneziano", password: "1234", ruolo: "dipendente", nome: "Veneziano Roberta" }
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
/* ============================================================
   SCRIPT.JS — BLOCCO 2/6
   Auth + Routing + Update Views
============================================================ */

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

  // cambia schermata
  function showView(id) {
    [viewAuth, viewFarmacia, viewTitolare, viewDip, viewCli].forEach(v => {
      if (v) v.classList.add("hidden");
    });
    const v = document.getElementById(id);
    if (v) v.classList.remove("hidden");
  }

  // LOGIN
  function loginAs(user) {
    currentUser = user;

    userLabel.textContent = user ? `${user.nome} (${user.ruolo})` : "Ospite";
    topSubtitle.textContent = user ? `Accesso come ${user.ruolo}` : "Accesso non effettuato";

    if (!user) {
      showView("view-auth");
      return;
    }

    if (user.ruolo === "farmacia") {
      showView("view-farmacia");
      updateFarmaciaView();
    }
    if (user.ruolo === "titolare") {
      showView("view-titolare");
      updateTitolareView();
    }
    if (user.ruolo === "dipendente") {
      showView("view-dipendente");
      updateDipendenteView();
    }
    if (user.ruolo === "cliente") {
      showView("view-cliente");
      updateClienteView();
    }
  }

  // LOGIN FORM
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();

      const all = getAllUsers();
      const found = all.find(u => u.username === username && u.password === password);

      if (!found) return alert("Credenziali non valide.");

      loginAs(found);
    });
  }

  // LOGIN RAPIDO FARMACIA
  if (btnDemoFarmacia) {
    btnDemoFarmacia.addEventListener("click", () => {
      const all = getAllUsers();
      const f = all.find(u => u.username === "farmacia");
      if (f) loginAs(f);
    });
  }

  // REGISTRAZIONE
  if (regForm) {
    regForm.addEventListener("submit", e => {
      e.preventDefault();

      const nome = document.getElementById("reg-fullname").value.trim();
      const ruolo = document.getElementById("reg-role").value;
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const user = document.getElementById("reg-username").value.trim();
      const pass = document.getElementById("reg-password").value.trim();

      if (!nome || !user || !pass) return alert("Dati mancanti.");

      const all = getAllUsers();
      if (all.some(u => u.username === user)) return alert("Username già usato.");

      if (ruolo === "cliente" && !phone) return alert("Telefono obbligatorio per i clienti.");

      const nuovo = { username: user, password: pass, ruolo, nome, telefono: phone, email };

      all.push(nuovo);
      saveData(STORAGE_KEYS.UTENTI, all);

      alert("Registrazione completata!");
    });
  }

  // LOGOUT
  if (btnEsci) {
    btnEsci.addEventListener("click", () => {
      currentUser = null;
      loginAs(null);
    });
  }

  loginAs(null);
}

// FORZA L’AGGIORNAMENTO DI TUTTE LE VISTE
function updateAllViews() {
  if (!currentUser) return;

  if (currentUser.ruolo === "farmacia") updateFarmaciaView();
  if (currentUser.ruolo === "titolare") updateTitolareView();
  if (currentUser.ruolo === "dipendente") updateDipendenteView();
  if (currentUser.ruolo === "cliente") updateClienteView();
}
/* ============================================================
   SCRIPT.JS — BLOCCO 3/6
   Panoramica + Sezioni Q1
============================================================ */

// TIMER per il ritorno automatico alla panoramica
function resetPanoramicaTimer() {
  if (panoramicaTimer) clearTimeout(panoramicaTimer);
  panoramicaTimer = setTimeout(() => {
    showPanoramica();
  }, 20000);
}

function showPanoramica() {
  const pano = document.getElementById("panoramica-box");
  const det = document.getElementById("sezione-dettaglio");

  if (!pano || !det) return;

  pano.classList.remove("hidden");
  det.classList.add("hidden");
}

// PASSA ALLA SEZIONE DETTAGLIO
function showSezioneDettaglio(title, html) {
  const pano = document.getElementById("panoramica-box");
  const det = document.getElementById("sezione-dettaglio");
  const detTitle = document.getElementById("detail-title");
  const detBody = document.getElementById("detail-content");

  pano.classList.add("hidden");
  det.classList.remove("hidden");

  detTitle.textContent = title;
  detBody.innerHTML = html;

  resetPanoramicaTimer();
}

// AGGIORNA I NUMERI DELLA PANORAMICA
function updatePanoramica() {
  const oggi = todayISO();

  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
  const sc = loadData(STORAGE_KEYS.SCADENZE, []);
  const ass = loadData(STORAGE_KEYS.ASSENZE, []);

  const serviziOggi = app.filter(a => a.data === oggi).length;
  const assenzeOggi = ass.filter(a => isDateInRange(oggi, a.dal, a.al)).length;
  const entro60 = sc.filter(s => {
    const giorni = diffDays(oggi, s.dataScadenza);
    return giorni >= 0 && giorni <= 60;
  }).length;

  document.getElementById("val-servizi-oggi").textContent = serviziOggi;
  document.getElementById("val-assenze-oggi").textContent = assenzeOggi;
  document.getElementById("val-scadenze-60").textContent = entro60;
}

// SETUP SEZIONI FARMACIA (Q1)
function setupSezioniListeners() {
  document.querySelectorAll(".sec-card").forEach(btn => {
    btn.addEventListener("click", () => {
      const sec = btn.getAttribute("data-section");
      openSection(sec);
    });
  });

  const back = document.getElementById("btn-back-panorama");
  if (back) back.addEventListener("click", showPanoramica);
}

// APERTURA SEZIONI
function openSection(sec) {
  resetPanoramicaTimer();
  const oggi = todayISO();

  // ===== ASSENTI =====
  if (sec === "assenti") {
    const list = loadData(STORAGE_KEYS.ASSENZE, []);
    if (list.length === 0) {
      showSezioneDettaglio("Assenti / Permessi", "<p>Nessuna assenza registrata.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.sort((a,b)=>parseISO(a.dal)-parseISO(b.dal))
        .forEach(a => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${a.nome} – ${a.tipo}</span>
            <span class="row-sub">${formatDateShortIT(a.dal)} → ${formatDateShortIT(a.al)}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Assenti / Permessi", html);
  }

  // ===== FARMACIA DI TURNO =====
  else if (sec === "turno") {
    const turno = loadData("fm_turno", {
      farmacia: "Farmacia Montesano",
      appoggio: "Farmacia Centrale",
      orario: "08:00 – 20:00",
      note: ""
    });

    const html = `
      <p><strong>Farmacia di turno oggi:</strong></p>
      <p>Farmacia: <b>${turno.farmacia}</b></p>
      <p>Appoggio: <b>${turno.appoggio}</b></p>
      <p>Orario: <b>${turno.orario}</b></p>
      <p class="small">${turno.note}</p>
    `;

    showSezioneDettaglio("Farmacia di turno", html);
  }

  // ===== COMUNICAZIONI =====
  else if (sec === "comunicazioni") {
    const list = loadData(STORAGE_KEYS.COMUNICAZIONI, []);

    if (list.length === 0) {
      showSezioneDettaglio("Comunicazioni interne", "<p>Nessuna comunicazione.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.sort((a,b)=>b.timestamp-a.timestamp).forEach(c => {
      const t = new Date(c.timestamp);
      const hh = String(t.getHours()).padStart(2,"0");
      const mm = String(t.getMinutes()).padStart(2,"0");

      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${c.autore || "Anonimo"} – ${hh}:${mm}</span>
            <span class="row-sub">${c.testo}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Comunicazioni interne", html);
  }

  // ===== PROCEDURE =====
  else if (sec === "procedure") {
    const list = loadData(STORAGE_KEYS.PROCEDURE, []);

    if (list.length === 0) {
      showSezioneDettaglio("Procedure", "<p>Nessuna procedura presente.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.forEach(p => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${p.titolo}</span>
            <span class="row-sub">${p.descrizione}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Procedure", html);
  }

  // ===== LOGISTICA =====
  else if (sec === "logistica") {
    const list = loadData(STORAGE_KEYS.LOGISTICA, []);

    if (list.length === 0) {
      showSezioneDettaglio("Logistica", "<p>Nessuna nota logistica.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.forEach(l => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${l.titolo}</span>
            <span class="row-sub">${l.det}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Logistica", html);
  }

  // ===== MAGAZZINO =====
  else if (sec === "magazzino") {
    const note = loadData(STORAGE_KEYS.MAGAZZINO_NOTE, []);
    const sc = loadData(STORAGE_KEYS.SCADENZE, []);

    let html = `<h4 class="subsection-title">Note magazzino</h4>`;

    if (note.length === 0) {
      html += "<p>Nessuna nota.</p>";
    } else {
      html += '<ul class="simple-list">';
      note.forEach(n => {
        html += `
          <li>
            <div class="row-main">
              <span class="row-title">${n.titolo}</span>
              <span class="row-sub">${n.testo}</span>
            </div>
          </li>`;
      });
      html += "</ul>";
    }

    html += `<h4 class="subsection-title">Scadenze</h4>`;

    if (sc.length === 0) {
      html += "<p>Nessuna scadenza registrata.</p>";
    } else {
      html += '<ul class="simple-list">';
      sc.sort((a,b)=>parseISO(a.dataScadenza)-parseISO(b.dataScadenza))
        .forEach(s => {
        html += `
          <li>
            <div class="row-main">
              <span class="row-title">${s.nome}</span>
              <span class="row-sub">Scade il ${formatDateShortIT(s.dataScadenza)} – ${s.pezzi} pz</span>
            </div>
          </li>`;
      });
      html += "</ul>";
    }

    showSezioneDettaglio("Magazziniera", html);
  }

  // ===== CONSUMABILI =====
  else if (sec === "consumabili") {
    const list = loadData(STORAGE_KEYS.CONSUMABILI, []);

    if (list.length === 0) {
      showSezioneDettaglio("Consumabili", "<p>Nessun consumabile registrato.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.forEach(c => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${c.nome}</span>
            <span class="row-sub">Scorta: ${c.scorta}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Consumabili", html);
  }

  // ===== CONSEGNE =====
  else if (sec === "consegne") {
    const list = loadData(STORAGE_KEYS.CONSEGNE, []);

    if (list.length === 0) {
      showSezioneDettaglio("Consegne / Archivio", "<p>Nessuna consegna registrata.</p>");
      return;
    }

    let html = '<ul class="simple-list">';
    list.forEach(c => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${c.titolo}</span>
            <span class="row-sub">${formatDateShortIT(c.data)} – ${c.note}</span>
          </div>
        </li>`;
    });
    html += "</ul>";

    showSezioneDettaglio("Consegne / Archivio", html);
  }
}
/* ============================================================
   SCRIPT.JS — BLOCCO 4/6
   Offerte + Giornate + Modali
============================================================ */


/* ============================================================
   OFFERTE / PROMOZIONI
============================================================ */

function aggiornaOfferteView() {
  const list = loadData(STORAGE_KEYS.OFFERTE, []);
  const box = document.getElementById("offerte-list");

  if (!box) return;

  if (list.length === 0) {
    box.innerHTML = "<p>Nessuna offerta registrata.</p>";
    return;
  }

  let html = "";
  list.forEach(o => {
    html += `
      <div class="list-item">
        <strong>${o.nome}</strong><br>
        <span class="item-info">${o.prezzo} € — ${o.note}</span>
      </div>
    `;
  });

  box.innerHTML = html;
}

/* Aggiunta nuova offerta */
function openModalNuovaOfferta() {
  openModal("Nuova Offerta", `
    <input type="text" id="off-nome" placeholder="Nome prodotto">
    <input type="text" id="off-prezzo" placeholder="Prezzo">
    <textarea id="off-note" placeholder="Note"></textarea>

    <button class="modal-btn" onclick="salvaNuovaOfferta()">Salva</button>
  `);
}

function salvaNuovaOfferta() {
  const nome = document.getElementById("off-nome").value.trim();
  const prezzo = document.getElementById("off-prezzo").value.trim();
  const note = document.getElementById("off-note").value.trim();

  if (!nome || !prezzo) return alert("Compila tutti i campi.");

  const list = loadData(STORAGE_KEYS.OFFERTE, []);
  list.push({ nome, prezzo, note });

  saveData(STORAGE_KEYS.OFFERTE, list);
  closeModal();
  aggiornaOfferteView();
}


/* ============================================================
   GIORNATE — Registro Lavorativo
============================================================ */

function aggiornaGiornateView() {
  const list = loadData(STORAGE_KEYS.GIORNATE, []);
  const box = document.getElementById("giornate-list");

  if (!box) return;

  if (list.length === 0) {
    box.innerHTML = "<p>Nessuna giornata registrata.</p>";
    return;
  }

  let html = "";
  list.forEach(g => {
    html += `
      <div class="list-item">
        <strong>${formatDateShortIT(g.data)}</strong><br>
        <span class="item-info">${g.note}</span>
      </div>
    `;
  });

  box.innerHTML = html;
}

/* Modale nuova giornata */
function openModalNuovaGiornata() {
  openModal("Nuova Giornata", `
    <input type="date" id="gior-data" value="${todayISO()}">
    <textarea id="gior-note" placeholder="Note giornata"></textarea>

    <button class="modal-btn" onclick="salvaNuovaGiornata()">Salva</button>
  `);
}

function salvaNuovaGiornata() {
  const data = document.getElementById("gior-data").value;
  const note = document.getElementById("gior-note").value.trim();

  if (!data) return alert("Scegli una data.");

  const list = loadData(STORAGE_KEYS.GIORNATE, []);
  list.push({ data, note });

  saveData(STORAGE_KEYS.GIORNATE, list);
  closeModal();
  aggiornaGiornateView();
}


/* ============================================================
   MODALE GENERALE (usata per TUTTE le funzioni)
============================================================ */

function openModal(titolo, contenuto) {
  const backdrop = document.getElementById("modal-backdrop");
  const cont = document.getElementById("modal-container");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");

  title.textContent = titolo;
  body.innerHTML = contenuto;

  backdrop.classList.remove("hidden");
  cont.classList.remove("hidden");

  // Chiudi quick menu se era aperto
  chiudiQuickMenu();
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.add("hidden");
  document.getElementById("modal-container").classList.add("hidden");
}
/* ============================================================
   SCRIPT.JS — BLOCCO 5/6
   Agenda + Appuntamenti + Calendario Mensile
============================================================ */


/* ============================================================
   AGENDA — VISTA GIORNALIERA
============================================================ */

function aggiornaAgendaView() {
    const giorniBox = document.getElementById("agenda-days-container");
    if (!giorniBox) return;

    const appuntamenti = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
    const oggi = todayISO();

    // Raggruppiamo per data
    const gruppi = {};
    appuntamenti.forEach(a => {
        if (!gruppi[a.data]) gruppi[a.data] = [];
        gruppi[a.data].push(a);
    });

    let html = "";

    // Ordina per data
    Object.keys(gruppi)
        .sort((a, b) => parseISO(a) - parseISO(b))
        .forEach(data => {
            html += `
                <div class="section-card">
                    <h4>${formatDateShortIT(data)}</h4>
                    <div class="agenda-list">
            `;

            gruppi[data].forEach(app => {
                html += `
                    <div class="list-item">
                        <strong>${app.ora} — ${app.nome}</strong><br>
                        <span class="item-info">${app.note}</span>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

    if (html.trim() === "") html = "<p>Nessun appuntamento registrato.</p>";

    giorniBox.innerHTML = html;
}


/* ============================================================
   NUOVO APPUNTAMENTO — OGGI
============================================================ */

function openAgendaToday() {
    openModal("Nuovo Appuntamento", `
        <input type="date" id="app-data" value="${todayISO()}">
        <input type="time" id="app-ora">
        <input type="text" id="app-nome" placeholder="Nome cliente">
        <textarea id="app-note" placeholder="Note opzionali"></textarea>

        <button class="modal-btn" onclick="salvaAppuntamento()">Salva</button>
    `);
}

function salvaAppuntamento() {
    const data = document.getElementById("app-data").value;
    const ora = document.getElementById("app-ora").value.trim();
    const nome = document.getElementById("app-nome").value.trim();
    const note = document.getElementById("app-note").value.trim();

    if (!data || !ora || !nome) {
        alert("Compila i campi obbligatori.");
        return;
    }

    const list = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
    list.push({ data, ora, nome, note });

    saveData(STORAGE_KEYS.APPUNTAMENTI, list);
    closeModal();
    aggiornaAgendaView();
}


/* ============================================================
   CALENDARIO MENSILE (SCORRIMENTO MENSILE)
============================================================ */

function buildAgendaMonth(offset) {
    const box = document.getElementById("agenda-days-container");
    if (!box) return;

    const oggi = new Date();
    const y = oggi.getFullYear();
    const m = oggi.getMonth() + offset;

    const primo = new Date(y, m, 1);
    const ultimo = new Date(y, m + 1, 0);

    let html = `
        <div class="section-card">
            <h4>${meseItaliano(m)} ${primo.getFullYear()}</h4>
            <div class="calendar-grid">
    `;

    const appuntamenti = loadData(STORAGE_KEYS.APPUNTAMENTI, []);

    for (let d = 1; d <= ultimo.getDate(); d++) {
        const dataIso = new Date(y, m, d).toISOString().slice(0, 10);

        const has = appuntamenti.filter(a => a.data === dataIso).length;

        html += `
            <div class="calendar-day" onclick="openModalNewDay('${dataIso}')">
                <span class="day-num">${d}</span>
                ${has > 0 ? `<span class="badge-green">${has}</span>` : ""}
            </div>
        `;
    }

    html += "</div></div>";

    box.innerHTML = html;
}

function meseItaliano(m) {
    const nomi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    m = ((m % 12) + 12) % 12;
    return nomi[m];
}


/* ============================================================
   CLICK SU UN GIORNO NEL CALENDARIO → NUOVO APPUNTAMENTO
============================================================ */

function openModalNewDay(dataIso) {
    openModal(`Appuntamento — ${formatDateShortIT(dataIso)}`, `
        <input type="time" id="app-ora">
        <input type="text" id="app-nome" placeholder="Nome cliente">
        <textarea id="app-note" placeholder="Note"></textarea>

        <button class="modal-btn" onclick="salvaAppuntamentoData('${dataIso}')">
            Salva
        </button>
    `);
}

function salvaAppuntamentoData(dataIso) {
    const ora = document.getElementById("app-ora").value.trim();
    const nome = document.getElementById("app-nome").value.trim();
    const note = document.getElementById("app-note").value.trim();

    if (!ora || !nome) {
        alert("Compila i campi obbligatori.");
        return;
    }

    const list = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
    list.push({ data: dataIso, ora, nome, note });

    saveData(STORAGE_KEYS.APPUNTAMENTI, list);
    closeModal();
    aggiornaAgendaView();
}
/* ============================================================
   SCRIPT.JS — BLOCCO 6/6
   Quick Menu + Tasto Centrale + Animazioni
============================================================ */


/* ============================================================
   TASTO CENTRALE — APERTURA / CHIUSURA MENU RADIALE
============================================================ */

const quickBtn = document.getElementById("quick-btn");
const quickMenu = document.getElementById("quick-menu");

function apriQuickMenu() {
    quickMenu.classList.remove("hidden");
    quickBtn.classList.add("open");

    // Piccola animazione di apertura
    quickMenu.style.opacity = "0";
    quickMenu.style.transform = "translate(-50%, -50%) scale(0.8)";

    setTimeout(() => {
        quickMenu.style.opacity = "1";
        quickMenu.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);
}

function chiudiQuickMenu() {
    if (!quickBtn.classList.contains("open")) return;

    quickMenu.style.opacity = "0";
    quickMenu.style.transform = "translate(-50%, -50%) scale(0.8)";

    setTimeout(() => {
        quickMenu.classList.add("hidden");
        quickBtn.classList.remove("open");
    }, 150);
}

if (quickBtn) {
    quickBtn.addEventListener("click", () => {
        if (quickBtn.classList.contains("open")) {
            chiudiQuickMenu();
        } else {
            apriQuickMenu();
        }
    });
}


/* ============================================================
   CHIUDI QUICK MENU SE CLICCHI FUORI
============================================================ */

document.addEventListener("click", e => {
    if (!quickBtn || !quickMenu) return;

    const clickedInside =
        quickBtn.contains(e.target) || quickMenu.contains(e.target);

    // se clicchi fuori → chiudi
    if (!clickedInside) chiudiQuickMenu();
});


/* ============================================================
   FIX: NON SI SOVRAPPONE ALLE MODALI
============================================================ */

const modalBackdrop = document.getElementById("modal-backdrop");
const modalContainer = document.getElementById("modal-container");

// Quando una modale si apre → chiudi il quick menu
function fixModalQuickMenu() {
    if (!modalBackdrop || !modalContainer) return;

    const observer = new MutationObserver(() => {
        const modalOpen =
            !modalBackdrop.classList.contains("hidden") ||
            !modalContainer.classList.contains("hidden");

        if (modalOpen) chiudiQuickMenu();
    });

    observer.observe(modalBackdrop, { attributes: true });
    observer.observe(modalContainer, { attributes: true });
}

fixModalQuickMenu();


/* ============================================================
   GESTIONE CLICK DEI BOTTONI RADIALI
============================================================ */

document.querySelectorAll(".qm-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const act = btn.dataset.action;
        chiudiQuickMenu();

        switch (act) {
            case "comunicazione":
                openModalNuovaComunicazione();
                break;

            case "appuntamento":
                openAgendaToday();
                break;

            case "consegna":
                openModalNewConsegna();
                break;

            case "consumabili":
                openModalNewConsumabile();
                break;

            case "scadenza":
                openModalNewScadenza();
                break;

            case "procedura":
                openModalNewProcedura();
                break;

            case "cassa":
                openModalCassa();
                break;

            case "turni":
                openModalTurno();
                break;

            default:
                console.warn("Azione non riconosciuta:", act);
        }
    });
});


/* ============================================================
   FINE SCRIPT — BLOCCO 6/6
============================================================ */
