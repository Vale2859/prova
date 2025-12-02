// ===== STATO E COSTANTI =====
let currentUser = null;
let panoramicaTimer = null;
let agendaMonthOffset = 0;

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

// ===== HELPER VARI =====
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  setupAgendaListeners();
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

// Sezioni Q1
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

// ====== MODALI PER LE SEZIONI Q1 ======

// Assenze
function openModalNuovaAssenza() {
  const html = `
    <form id="form-assenza">
      <p class="small">Aggiungi una nuova assenza / permesso.</p>
      <label class="field">
        <span>Nome dipendente</span>
        <input type="text" id="ass-nome" />
      </label>
      <div class="inline-row">
        <label class="field">
          <span>Dal</span>
          <input type="date" id="ass-dal" value="${todayISO()}" />
        </label>
        <label class="field">
          <span>Al</span>
          <input type="date" id="ass-al" value="${todayISO()}" />
        </label>
      </div>
      <label class="field">
        <span>Tipo (ferie, permesso, malattia...)</span>
        <input type="text" id="ass-tipo" />
      </label>
      <button type="submit" class="primary full-width">Salva assenza</button>
    </form>
  `;

  openModal("Nuova assenza / permesso", html, () => {
    const form = document.getElementById("form-assenza");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("ass-nome").value.trim();
      const dal = document.getElementById("ass-dal").value;
      const al = document.getElementById("ass-al").value;
      const tipo = document.getElementById("ass-tipo").value.trim() || "Assenza";
      if (!nome || !dal || !al) {
        alert("Compila almeno nome, dal e al.");
        return;
      }
      const arr = loadData(STORAGE_KEYS.ASSENZE, []);
      arr.push({ id: "ass_" + Date.now(), nome, dal, al, tipo });
      saveData(STORAGE_KEYS.ASSENZE, arr);
      closeModal();
      openSection("assenti");
      updatePanoramica();
      updateDipendenteView();
    });
  });
}

// Turno
function openModalTurnoEdit(turnoKey, turno) {
  const html = `
    <form id="form-turno">
      <p class="small">Aggiorna i dati della farmacia di turno.</p>
      <label class="field">
        <span>Farmacia di turno</span>
        <input type="text" id="t-farmacia" value="${escapeHtml(turno.farmacia)}" />
      </label>
      <label class="field">
        <span>Farmacia di appoggio</span>
        <input type="text" id="t-appoggio" value="${escapeHtml(turno.appoggio)}" />
      </label>
      <label class="field">
        <span>Orario</span>
        <input type="text" id="t-orario" value="${escapeHtml(turno.orario)}" />
      </label>
      <label class="field">
        <span>Note</span>
        <input type="text" id="t-note" value="${escapeHtml(turno.note || "")}" />
      </label>
      <button type="submit" class="primary full-width">Salva dati turno</button>
    </form>
  `;
  openModal("Modifica farmacia di turno", html, () => {
    const form = document.getElementById("form-turno");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nuovo = {
        farmacia: document.getElementById("t-farmacia").value.trim() || turno.farmacia,
        appoggio: document.getElementById("t-appoggio").value.trim() || turno.appoggio,
        orario: document.getElementById("t-orario").value.trim() || turno.orario,
        note: document.getElementById("t-note").value.trim()
      };
      saveData(turnoKey, nuovo);
      closeModal();
      openSection("turno");
    });
  });
}

// Comunicazioni
function openModalNuovaComunicazione() {
  const defaultAutore = currentUser ? currentUser.nome : "";
  const html = `
    <form id="form-comunicazione">
      <p class="small">Aggiungi un messaggio veloce (tipo chat interna).</p>
      <label class="field">
        <span>Chi scrive</span>
        <input type="text" id="com-autore" value="${escapeHtml(defaultAutore)}" />
      </label>
      <label class="field">
        <span>Messaggio</span>
        <input type="text" id="com-testo" />
      </label>
      <button type="submit" class="primary full-width">Invia comunicazione</button>
    </form>
  `;
  openModal("Nuova comunicazione interna", html, () => {
    const form = document.getElementById("form-comunicazione");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const autore = document.getElementById("com-autore").value.trim() || "Anonimo";
      const testo = document.getElementById("com-testo").value.trim();
      if (!testo) {
        alert("Scrivi un messaggio.");
        return;
      }
      const arr = loadData(STORAGE_KEYS.COMUNICAZIONI, []);
      arr.push({ id: "com_" + Date.now(), autore, testo, timestamp: Date.now() });
      saveData(STORAGE_KEYS.COMUNICAZIONI, arr);
      closeModal();
      openSection("comunicazioni");
    });
  });
}

// Procedure
function openModalNuovaProcedura() {
  const html = `
    <form id="form-procedura">
      <p class="small">Aggiungi una nuova procedura.</p>
      <label class="field">
        <span>Titolo</span>
        <input type="text" id="proc-titolo" />
      </label>
      <label class="field">
        <span>Descrizione</span>
        <input type="text" id="proc-desc" />
      </label>
      <button type="submit" class="primary full-width">Salva procedura</button>
    </form>
  `;
  openModal("Nuova procedura operativa", html, () => {
    const form = document.getElementById("form-procedura");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titolo = document.getElementById("proc-titolo").value.trim();
      const desc = document.getElementById("proc-desc").value.trim();
      if (!titolo) {
        alert("Inserisci un titolo.");
        return;
      }
      const arr = loadData(STORAGE_KEYS.PROCEDURE, []);
      arr.push({ id: "proc_" + Date.now(), titolo, descrizione: desc });
      saveData(STORAGE_KEYS.PROCEDURE, arr);
      closeModal();
      openSection("procedure");
    });
  });
}

// Logistica
function openModalNuovaNotaLogistica() {
  const html = `
    <form id="form-logistica">
      <p class="small">Aggiungi una nota di logistica.</p>
      <label class="field">
        <span>Titolo</span>
        <input type="text" id="log-titolo" />
      </label>
      <label class="field">
        <span>Dettagli</span>
        <input type="text" id="log-det" />
      </label>
      <button type="submit" class="primary full-width">Salva nota</button>
    </form>
  `;
  openModal("Nuova nota di logistica", html, () => {
    const form = document.getElementById("form-logistica");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titolo = document.getElementById("log-titolo").value.trim();
      const det = document.getElementById("log-det").value.trim();
      if (!titolo) {
        alert("Inserisci un titolo.");
        return;
      }
      const arr = loadData(STORAGE_KEYS.LOGISTICA, []);
      arr.push({ id: "log_" + Date.now(), titolo, det });
      saveData(STORAGE_KEYS.LOGISTICA, arr);
      closeModal();
      openSection("logistica");
    });
  });
}

// Magazzino – nota
function openModalNuovaNotaMagazzino() {
  const html = `
    <form id="form-mag-note">
      <p class="small">Aggiungi una nota veloce di magazzino.</p>
      <label class="field">
        <span>Titolo nota</span>
        <input type="text" id="mag-titolo" />
      </label>
      <label class="field">
        <span>Dettagli</span>
        <input type="text" id="mag-det" />
      </label>
      <button type="submit" class="primary full-width">Salva nota</button>
    </form>
  `;
  openModal("Nuova nota magazzino", html, () => {
    const form = document.getElementById("form-mag-note");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titolo = document.getElementById("mag-titolo").value.trim();
      const det = document.getElementById("mag-det").value.trim();
      if (!titolo) {
        alert("Inserisci un titolo.");
        return;
      }
      const arr = loadData(STORAGE_KEYS.MAGAZZINO_NOTE, []);
      arr.push({ id: "mag_" + Date.now(), titolo, testo: det });
      saveData(STORAGE_KEYS.MAGAZZINO_NOTE, arr);
      closeModal();
      openSection("magazzino");
    });
  });
}

// Consumabili
function openModalNuovoConsumabile() {
  const html = `
    <form id="form-consumabili">
      <p class="small">Aggiungi o aggiorna un consumabile.</p>
      <label class="field">
        <span>Nome</span>
        <input type="text" id="cons-nome" />
      </label>
      <label class="field">
        <span>Scorta / note</span>
        <input type="text" id="cons-scorta" />
      </label>
      <button type="submit" class="primary full-width">Salva</button>
    </form>
  `;
  openModal("Nuovo consumabile", html, () => {
    const form = document.getElementById("form-consumabili");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("cons-nome").value.trim();
      const scorta
