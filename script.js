// ===== STATO E COSTANTI =====
let currentUser = null;
let panoramicaTimer = null;
/* offset in giorni rispetto ad oggi per il widget */
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

  // ASSENTI / PERMESSI
  if (sec === "assenti") {
    const assenze = loadData(STORAGE_KEYS.ASSENZE, []);
    let listHtml = "";
    if (assenze.length === 0) {
      listHtml = "<p>Nessuna assenza registrata.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      assenze
        .sort((a, b) => parseISO(a.dal) - parseISO(b.dal))
        .forEach((a) => {
          listHtml += `<li>
            <div class="row-main">
              <span class="row-title">${a.nome} – ${a.tipo}</span>
              <span class="row-sub">${formatDateShortIT(a.dal)} → ${formatDateShortIT(a.al)}</span>
            </div>
          </li>`;
        });
      listHtml += "</ul>";
    }

    const html = `
      <p><strong>Assenti / permessi approvati</strong></p>
      ${listHtml}
      <p class="hint-text small">
        L'inserimento e la modifica delle assenze verranno gestiti in una schermata dedicata.
      </p>
    `;
    showSezioneDettaglio("Assenti / Permessi", html);
  }

  // FARMACIA DI TURNO
  else if (sec === "turno") {
    const turnoKey = "fm_turno";
    const turno = loadData(turnoKey, {
      farmacia: "Farmacia Montesano",
      appoggio: "Farmacia Centrale",
      orario: "08:00 – 20:00",
      note: ""
    });

    const html = `
      <p><strong>Farmacia di turno</strong></p>
      <p>Oggi: <strong>${turno.farmacia}</strong></p>
      <p>Appoggio: <strong>${turno.appoggio}</strong></p>
      <p>Orario: <strong>${turno.orario}</strong></p>
      <p class="small">${turno.note || ""}</p>
      <p class="hint-text small">
        La modifica dei dati di turno sarà disponibile in un pannello di configurazione.
      </p>
    `;
    showSezioneDettaglio("Farmacia di turno", html);
  }

  // COMUNICAZIONI INTERNE
  else if (sec === "comunicazioni") {
    const comunicazioni = loadData(STORAGE_KEYS.COMUNICAZIONI, []);
    let listHtml = "";
    if (comunicazioni.length === 0) {
      listHtml = "<p>Nessuna comunicazione inserita.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      comunicazioni
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach((c) => {
          const data = new Date(c.timestamp);
          const hh = String(data.getHours()).padStart(2, "0");
          const mm = String(data.getMinutes()).padStart(2, "0");
          listHtml += `<li>
            <div class="row-main">
              <span class="row-title">${c.autore || "Anonimo"} – ${hh}:${mm}</span>
              <span class="row-sub">${c.testo}</span>
            </div>
          </li>`;
        });
      listHtml += "</ul>";
    }

    const html = `
      <p><strong>Comunicazioni interne</strong></p>
      ${listHtml}
      <p class="hint-text small">
        L'invio di nuove comunicazioni sarà gestito in una sezione dedicata tipo chat interna.
      </p>
    `;
    showSezioneDettaglio("Comunicazioni interne", html);
  }

  // PROCEDURE
  else if (sec === "procedure") {
    const procedure = loadData(STORAGE_KEYS.PROCEDURE, []);
    let listHtml = "";
    if (procedure.length === 0) {
      listHtml = "<p>Nessuna procedura salvata.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      procedure.forEach((p) => {
        listHtml += `<li>
          <div class="row-main">
            <span class="row-title">${p.titolo}</span>
            <span class="row-sub">${p.descrizione}</span>
          </div>
        </li>`;
      });
      listHtml += "</ul>";
    }
    const html = `
      <p><strong>Procedure operative</strong></p>
      ${listHtml}
      <p class="hint-text small">
        La creazione e modifica delle procedure verrà ottimizzata con un editor dedicato.
      </p>
    `;
    showSezioneDettaglio("Procedure", html);
  }

  // LOGISTICA
  else if (sec === "logistica") {
    const logistica = loadData(STORAGE_KEYS.LOGISTICA, []);
    let listHtml = "";
    if (logistica.length === 0) {
      listHtml = "<p>Nessuna nota di logistica.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      logistica.forEach((l) => {
        listHtml += `<li>
          <div class="row-main">
            <span class="row-title">${l.titolo}</span>
            <span class="row-sub">${l.det}</span>
          </div>
        </li>`;
      });
      listHtml += "</ul>";
    }
    const html = `
      <p><strong>Logistica e movimentazione</strong></p>
      ${listHtml}
      <p class="hint-text small">
        L'inserimento delle note logistiche sarà gestito con una maschera semplice e veloce.
      </p>
    `;
    showSezioneDettaglio("Logistica", html);
  }

  // MAGAZZINIERA
  else if (sec === "magazzino") {
    const note = loadData(STORAGE_KEYS.MAGAZZINO_NOTE, []);
    const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);

    let listNote = "";
    if (note.length === 0) {
      listNote = "<p>Nessuna nota magazzino.</p>";
    } else {
      listNote = '<ul class="simple-list">';
      note.forEach((n) => {
        listNote += `<li>
          <div class="row-main">
            <span class="row-title">${n.titolo}</span>
            <span class="row-sub">${n.testo}</span>
          </div>
        </li>`;
      });
      listNote += "</ul>";
    }

    let listScad = "";
    if (scadenze.length === 0) {
      listScad = "<p>Nessuna scadenza registrata.</p>";
    } else {
      listScad = '<ul class="simple-list">';
      scadenze
        .sort((a, b) => parseISO(a.dataScadenza) - parseISO(b.dataScadenza))
        .forEach((s) => {
          listScad += `<li>
            <div class="row-main">
              <span class="row-title">${s.nome}</span>
              <span class="row-sub">Scade il ${formatDateShortIT(s.dataScadenza)} · ${s.pezzi} pz</span>
            </div>
          </li>`;
        });
      listScad += "</ul>";
    }

    const html = `
      <p><strong>Magazziniera – note veloci e scadenze</strong></p>
      <h4 class="subsection-title">Note magazzino</h4>
      ${listNote}
      <h4 class="subsection-title">Scadenze registrate</h4>
      ${listScad}
      <p class="hint-text small">
        La compilazione delle note e delle scadenze sarà ottimizzata con una maschera separata.
      </p>
    `;
    showSezioneDettaglio("Magazziniera", html);
  }

  // PRODOTTI IN SCADENZA (già solo lettura)
  else if (sec === "scadenze") {
    const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);
    if (scadenze.length === 0) {
      showSezioneDettaglio(
        "Prodotti in scadenza",
        "<p>Nessuna scadenza registrata.</p>"
      );
      return;
    }
    let htmlList = '<ul class="simple-list">';
    scadenze
      .sort((a, b) => parseISO(a.dataScadenza) - parseISO(b.dataScadenza))
      .forEach((s) => {
        htmlList += `<li>
          <div class="row-main">
            <span class="row-title">${s.nome}</span>
            <span class="row-sub">Scadenza: ${formatDateShortIT(s.dataScadenza)} · ${s.pezzi} pz</span>
          </div>
        </li>`;
      });
    htmlList += "</ul>";
    const html = `
      <p><strong>Prodotti in scadenza</strong></p>
      ${htmlList}
      <p class="hint-text small">
        La registrazione delle scadenze continuerà ad essere gestita dall'area promozioni / scadenze.
      </p>
    `;
    showSezioneDettaglio("Prodotti in scadenza", html);
  }

  // CONSUMABILI
  else if (sec === "consumabili") {
    const cons = loadData(STORAGE_KEYS.CONSUMABILI, []);
    let listHtml = "";
    if (cons.length === 0) {
      listHtml = "<p>Nessun consumabile registrato.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      cons.forEach((c) => {
        listHtml += `<li>
          <div class="row-main">
            <span class="row-title">${c.nome}</span>
            <span class="row-sub">Scorta: ${c.scorta}</span>
          </div>
        </li>`;
      });
      listHtml += "</ul>";
    }
    const html = `
      <p><strong>Consumabili</strong></p>
      ${listHtml}
      <p class="hint-text small">
        L'aggiornamento delle scorte dei consumabili sarà gestito in una sezione dedicata.
      </p>
    `;
    showSezioneDettaglio("Consumabili", html);
  }

  // CONSEGNE / ARCHIVIO
  else if (sec === "consegne") {
    const cons = loadData(STORAGE_KEYS.CONSEGNE, []);
    let listHtml = "";
    if (cons.length === 0) {
      listHtml = "<p>Nessuna consegna / ritiro registrato.</p>";
    } else {
      listHtml = '<ul class="simple-list">';
      cons.forEach((c) => {
        listHtml += `<li>
          <div class="row-main">
            <span class="row-title">${c.titolo}</span>
            <span class="row-sub">${formatDateShortIT(c.data)} – ${c.note}</span>
          </div>
        </li>`;
      });
      listHtml += "</ul>";
    }
    const html = `
      <p><strong>Consegne / Archivio</strong></p>
      ${listHtml}
      <p class="hint-text small">
        L'inserimento di nuove consegne sarà gestito come archivio strutturato in una fase successiva.
      </p>
    `;
    showSezioneDettaglio("Consegne / Archivio", html);
  }
}

function updateFarmaciaView() {
  updatePanoramica();
  renderPromoAndGiornate();
  renderAgenda();
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

// ===== PROMOZIONI & GIORNATE (Q3) =====
function setupPromoGiornateListeners() {
  const btnAddOff = document.getElementById("btn-add-offerta");
  const btnAddGio = document.getElementById("btn-add-giornata");
  const btnViewAll = document.getElementById("btn-view-all-promo");
  const btnAddScad = document.getElementById("btn-add-scadenza");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalClose = document.getElementById("modal-close");

  if (btnAddOff) btnAddOff.addEventListener("click", () => openModalOfferta());
  if (btnAddGio) btnAddGio.addEventListener("click", () => openModalGiornata());
  if (btnViewAll) btnViewAll.addEventListener("click", () => openModalTuttePromo());
  if (btnAddScad) btnAddScad.addEventListener("click", () => openModalScadenza());

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
}

// Offerte
function openModalOfferta(existingId) {
  const offerte = loadData(STORAGE_KEYS.OFFERTE, []);
  let off = null;
  if (existingId) off = offerte.find((o) => o.id === existingId);

  const html = `
    <form id="form-offerta">
      <label class="field">
        <span>Nome offerta</span>
        <input type="text" id="off-nome" value="${off ? off.nome : ""}" />
      </label>
      <div class="inline-row">
        <label class="field">
          <span>Dal</span>
          <input type="date" id="off-dal" value="${off ? off.dal : ""}" />
        </label>
        <label class="field">
          <span>Al</span>
          <input type="date" id="off-al" value="${off ? off.al : ""}" />
        </label>
      </div>
      <label class="field">
        <span>Note</span>
        <input type="text" id="off-note" value="${off ? (off.note || "") : ""}" />
      </label>
      <button type="submit" class="primary">Salva offerta</button>
    </form>
  `;
  openModal(existingId ? "Modifica offerta" : "Nuova offerta", html, () => {
    const form = document.getElementById("form-offerta");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("off-nome").value.trim();
      const dal = document.getElementById("off-dal").value;
      const al = document.getElementById("off-al").value;
      const note = document.getElementById("off-note").value.trim();
      if (!nome || !dal || !al) {
        alert("Compila almeno nome, dal e al.");
        return;
      }
      let all = loadData(STORAGE_KEYS.OFFERTE, []);
      if (off) {
        off.nome = nome;
        off.dal = dal;
        off.al = al;
        off.note = note;
      } else {
        all.push({ id: "off_" + Date.now(), nome, dal, al, note });
      }
      saveData(STORAGE_KEYS.OFFERTE, all);
      closeModal();
      renderPromoAndGiornate();
      updateTitolareView();
    });
  });
}

// Giornate
function openModalGiornata(existingId) {
  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);
  let gio = null;
  if (existingId) gio = giornate.find((g) => g.id === existingId);

  const html = `
    <form id="form-giornata">
      <label class="field">
        <span>Nome giornata</span>
        <input type="text" id="gio-nome" value="${gio ? gio.nome : ""}" />
      </label>
      <div class="inline-row">
        <label class="field">
          <span>Dal</span>
          <input type="date" id="gio-dal" value="${gio ? gio.dal : ""}" />
        </label>
        <label class="field">
          <span>Al</span>
          <input type="date" id="gio-al" value="${gio ? gio.al : ""}" />
        </label>
      </div>
      <label class="field">
        <span>Note</span>
        <input type="text" id="gio-note" value="${gio ? (gio.note || "") : ""}" />
      </label>
      <p class="small">
        La giornata viene evidenziata in agenda sul giorno di inizio.
      </p>
      <button type="submit" class="primary">Salva giornata</button>
    </form>
  `;
  openModal(existingId ? "Modifica giornata" : "Nuova giornata", html, () => {
    const form = document.getElementById("form-giornata");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("gio-nome").value.trim();
      const dal = document.getElementById("gio-dal").value;
      const al = document.getElementById("gio-al").value;
      const note = document.getElementById("gio-note").value.trim();
      if (!nome || !dal || !al) {
        alert("Compila almeno nome, dal e al.");
        return;
      }
      let all = loadData(STORAGE_KEYS.GIORNATE, []);
      if (gio) {
        gio.nome = nome;
        gio.dal = dal;
        gio.al = al;
        gio.note = note;
      } else {
        all.push({ id: "gio_" + Date.now(), nome, dal, al, note });
      }
      saveData(STORAGE_KEYS.GIORNATE, all);
      closeModal();
      renderPromoAndGiornate();
      renderAgenda();
      updateTitolareView();
    });
  });
}

// Scadenze prodotti
function openModalScadenza() {
  const html = `
    <form id="form-scadenza">
      <label class="field">
        <span>Mese di scadenza</span>
        <input type="month" id="scad-mese" />
      </label>
      <div id="scad-items-wrap">
        <div class="inline-row">
          <label class="field">
            <span>Nome prodotto</span>
            <input type="text" class="scad-nome" />
          </label>
          <label class="field">
            <span>Pezzi</span>
            <input type="number" min="1" class="scad-pezzi" />
          </label>
        </div>
      </div>
      <button type="button" id="btn-add-riga-scad" class="small-secondary">+ Altro prodotto</button>
      <button type="submit" class="primary">Salva scadenze</button>
    </form>
  `;
  openModal("Nuove scadenze prodotti", html, () => {
    const wrap = document.getElementById("scad-items-wrap");
    const btnAdd = document.getElementById("btn-add-riga-scad");
    if (btnAdd && wrap) {
      btnAdd.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "inline-row";
        div.innerHTML = `
          <label class="field">
            <span>Nome prodotto</span>
            <input type="text" class="scad-nome" />
          </label>
          <label class="field">
            <span>Pezzi</span>
            <input type="number" min="1" class="scad-pezzi" />
          </label>`;
        wrap.appendChild(div);
      });
    }

    const form = document.getElementById("form-scadenza");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const meseVal = document.getElementById("scad-mese").value;
      if (!meseVal) {
        alert("Seleziona il mese.");
        return;
      }
      const [year, month] = meseVal.split("-");
      const baseDate = new Date(Number(year), Number(month) - 1, 1);

      const nomi = Array.from(document.querySelectorAll(".scad-nome"));
      const pezzi = Array.from(document.querySelectorAll(".scad-pezzi"));
      const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);

      for (let i = 0; i < nomi.length; i++) {
        const nome = nomi[i].value.trim();
        const pz = Number(pezzi[i].value || 0);
        if (!nome || !pz) continue;

        const day = 28;
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const iso = `${y}-${m}-${d}`;

        scadenze.push({
          id: "scad_" + Date.now() + "_" + i,
          nome,
          pezzi: pz,
          dataScadenza: iso
        });
      }
      saveData(STORAGE_KEYS.SCADENZE, scadenze);
      closeModal();
      renderPromoAndGiornate();
      updatePanoramica();
      updateTitolareView();
    });
  });
}

// Render elenchi promo/giornate
function renderPromoAndGiornate() {
  const oggi = todayISO();
  const offerte = loadData(STORAGE_KEYS.OFFERTE, []);
  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);
  const scadenze = loadData(STORAGE_KEYS.SCADENZE, []);

  const offAtt = offerte.filter((o) => isDateInRange(oggi, o.dal, o.al));
  const offScad = offerte.filter((o) => parseISO(oggi) > parseISO(o.al));

  const listOffAtt = document.getElementById("lista-offerte-attive");
  const listOffScad = document.getElementById("lista-offerte-scadute");
  if (listOffAtt) {
    listOffAtt.innerHTML = "";
    offAtt.forEach((o) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row-main">
          <span class="row-title">${o.nome}</span>
          <span class="row-sub">${formatDateShortIT(o.dal)} → ${formatDateShortIT(o.al)}</span>
        </div>
        <div class="row-actions">
          <button class="icon-btn" data-edit-off="${o.id}" title="Modifica">✏️</button>
          <button class="icon-btn" data-del-off="${o.id}" title="Elimina">🗑️</button>
        </div>`;
      listOffAtt.appendChild(li);
    });
  }
  if (listOffScad) {
    listOffScad.innerHTML = "";
    offScad.forEach((o) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row-main">
          <span class="row-title">${o.nome}</span>
          <span class="row-sub">Offerta scaduta (${formatDateShortIT(o.dal)} → ${formatDateShortIT(o.al)})</span>
        </div>
        <span class="tag-status">Scaduta</span>`;
      listOffScad.appendChild(li);
    });
  }

  const gioAttive = giornate.filter((g) => parseISO(oggi) <= parseISO(g.al));
  const gioScad = giornate.filter((g) => parseISO(oggi) > parseISO(g.al));

  const listGioAtt = document.getElementById("lista-giornate-attive");
  const listGioScad = document.getElementById("lista-giornate-scadute");
  if (listGioAtt) {
    listGioAtt.innerHTML = "";
    gioAttive.forEach((g) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row-main">
          <span class="row-title">${g.nome}</span>
          <span class="row-sub">${formatDateShortIT(g.dal)} → ${formatDateShortIT(g.al)}</span>
        </div>
        <div class="row-actions">
          <button class="icon-btn" data-open-gio="${g.id}" title="Appuntamenti">📆</button>
          <button class="icon-btn" data-edit-gio="${g.id}" title="Modifica">✏️</button>
          <button class="icon-btn" data-del-gio="${g.id}" title="Elimina">🗑️</button>
        </div>`;
      listGioAtt.appendChild(li);
    });
  }
  if (listGioScad) {
    listGioScad.innerHTML = "";
    gioScad.forEach((g) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row-main">
          <span class="row-title">${g.nome}</span>
          <span class="row-sub">Giornata conclusa (${formatDateShortIT(g.dal)} → ${formatDateShortIT(g.al)})</span>
        </div>
        <span class="tag-status">Conclusa</span>`;
      listGioScad.appendChild(li);
    });
  }

  // Azioni
  document.querySelectorAll("[data-edit-off]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-off");
      openModalOfferta(id);
    });
  });
  document.querySelectorAll("[data-del-off]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del-off");
      let all = loadData(STORAGE_KEYS.OFFERTE, []);
      all = all.filter((o) => o.id !== id);
      saveData(STORAGE_KEYS.OFFERTE, all);
      renderPromoAndGiornate();
      updateTitolareView();
    });
  });
  document.querySelectorAll("[data-edit-gio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-gio");
      openModalGiornata(id);
    });
  });
  document.querySelectorAll("[data-del-gio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del-gio");
      let all = loadData(STORAGE_KEYS.GIORNATE, []);
      all = all.filter((g) => g.id !== id);
      saveData(STORAGE_KEYS.GIORNATE, all);
      renderPromoAndGiornate();
      renderAgenda();
      updateTitolareView();
    });
  });
  document.querySelectorAll("[data-open-gio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open-gio");
      openModalGiornataAppuntamenti(id);
    });
  });

  // aggiornamento stat scadenze per titolare
  const oggi2 = todayISO();
  const entro60 = scadenze.filter((s) => {
    const diff = diffDays(oggi2, s.dataScadenza);
    return diff >= 0 && diff <= 60;
  }).length;
  const elStat = document.getElementById("stat-scadenze-tot");
  if (elStat) elStat.textContent = entro60;
}

// Vedi tutte
function openModalTuttePromo() {
  const oggi = todayISO();
  const offerte = loadData(STORAGE_KEYS.OFFERTE, []);
  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);

  const offAtt = offerte.filter((o) => isDateInRange(oggi, o.dal, o.al));
  const offScad = offerte.filter((o) => parseISO(oggi) > parseISO(o.al));
  const gioAtt = giornate.filter((g) => parseISO(oggi) <= parseISO(g.al));
  const gioScad = giornate.filter((g) => parseISO(oggi) > parseISO(g.al));

  let html = `<p class="small"><strong>Offerte in corso</strong></p><ul class="simple-list">`;
  if (offAtt.length === 0) {
    html += `<li><span>Nessuna offerta attiva.</span></li>`;
  } else {
    offAtt.forEach((o) => {
      html += `<li><div class="row-main"><span class="row-title">${o.nome}</span><span class="row-sub">${formatDateShortIT(o.dal)} → ${formatDateShortIT(o.al)}</span></div></li>`;
    });
  }
  html += `</ul><p class="small"><strong>Offerte scadute</strong></p><ul class="simple-list simple-list-muted">`;
  if (offScad.length === 0) {
    html += `<li><span>Nessuna offerta scaduta.</span></li>`;
  } else {
    offScad.forEach((o) => {
      html += `<li><div class="row-main"><span class="row-title">${o.nome}</span><span class="row-sub">${formatDateShortIT(o.dal)} → ${formatDateShortIT(o.al)}</span></div></li>`;
    });
  }
  html += `</ul><hr/><p class="small"><strong>Giornate attive</strong></p><ul class="simple-list">`;
  if (gioAtt.length === 0) {
    html += `<li><span>Nessuna giornata attiva.</span></li>`;
  } else {
    gioAtt.forEach((g) => {
      html += `<li><div class="row-main"><span class="row-title">${g.nome}</span><span class="row-sub">${formatDateShortIT(g.dal)} → ${formatDateShortIT(g.al)}</span></div></li>`;
    });
  }
  html += `</ul><p class="small"><strong>Giornate concluse</strong></p><ul class="simple-list simple-list-muted">`;
  if (gioScad.length === 0) {
    html += `<li><span>Nessuna giornata conclusa.</span></li>`;
  } else {
    gioScad.forEach((g) => {
      html += `<li><div class="row-main"><span class="row-title">${g.nome}</span><span class="row-sub">${formatDateShortIT(g.dal)} → ${formatDateShortIT(g.al)}</span></div></li>`;
    });
  }
  html += `</ul>`;

  openModal("Tutte le promozioni e giornate", html);
}

// ===== AGENDA (Q4) =====
function setupAgendaListeners() {
  const btnPrev = document.getElementById("btn-prev-month");
  const btnNext = document.getElementById("btn-next-month");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      agendaMonthOffset -= 1;
      renderAgenda();
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      agendaMonthOffset += 1;
      renderAgenda();
    });
  }
}

function renderAgenda() {
  const label = document.getElementById("agenda-month-label");
  const daysWrap = document.getElementById("agenda-days");
  if (!label || !daysWrap) return;

  const base = new Date();
  base.setMonth(base.getMonth() + agendaMonthOffset);
  const year = base.getFullYear();
  const month = base.getMonth();

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  label.textContent = `${monthNames[month]} ${year}`;

  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);
  const oggi = todayISO();

  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  daysWrap.innerHTML = "";
  for (let i = 0; i < firstWeekday; i++) {
    const span = document.createElement("div");
    span.className = "day-cell empty";
    daysWrap.appendChild(span);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    const iso = `${y}-${m}-${day}`;

    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.textContent = d.toString();

    if (iso === oggi) cell.classList.add("today");
    const hasGiornata = giornate.some((g) => isDateInRange(iso, g.dal, g.al));
    if (hasGiornata) cell.classList.add("giornata");

    cell.addEventListener("click", () => openModalAgendaDay(iso));
    daysWrap.appendChild(cell);
  }
}

// Appuntamenti per giorno
function openModalAgendaDay(iso) {
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
  const dayList = app
    .filter((a) => a.data === iso)
    .sort((a, b) => a.ora.localeCompare(b.ora));

  const niceDate = formatDateShortIT(iso);
  let html = `
    <p class="small">
      Appuntamenti per il giorno <strong>${niceDate}</strong>.
    </p>
    <ul class="simple-list">
  `;
  if (dayList.length === 0) {
    html += `<li><span>Nessun appuntamento.</span></li>`;
  } else {
    dayList.forEach((a) => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${a.ora} – ${a.nome}</span>
            <span class="row-sub">${a.telefono || ""} · ${a.motivo || ""}</span>
          </div>
        </li>`;
    });
  }
  html += `</ul>
    <button type="button" id="btn-new-app-day" class="primary full-width">
      + Nuovo appuntamento
    </button>
  `;
  openModal(`Agenda del ${niceDate}`, html, () => {
    const btn = document.getElementById("btn-new-app-day");
    if (btn) {
      btn.addEventListener("click", () => openModalNewAppointment(iso));
    }
  });
}

function openModalNewAppointment(iso) {
  const html = `
    <form id="form-app">
      <p class="small">Inserisci i dati dell'appuntamento.</p>
      <label class="field">
        <span>Nome e cognome</span>
        <input type="text" id="app-nome" />
      </label>
      <label class="field">
        <span>Telefono</span>
        <input type="tel" id="app-tel" />
      </label>
      <label class="field">
        <span>Motivo</span>
        <input type="text" id="app-motivo" />
      </label>
      <label class="field">
        <span>Orario</span>
        <input type="time" id="app-ora" />
      </label>
      <button type="submit" class="primary">Salva appuntamento</button>
    </form>
  `;
  openModal("Nuovo appuntamento", html, () => {
    const form = document.getElementById("form-app");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("app-nome").value.trim();
      const tel = document.getElementById("app-tel").value.trim();
      const motivo = document.getElementById("app-motivo").value.trim();
      const ora = document.getElementById("app-ora").value;

      if (!nome || !ora) {
        alert("Nome e orario sono obbligatori.");
        return;
      }

      const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
      app.push({
        id: "app_" + Date.now(),
        data: iso,
        ora,
        nome,
        telefono: tel,
        motivo,
        giornataId: null,
        clienteUsername: null
      });
      saveData(STORAGE_KEYS.APPUNTAMENTI, app);
      closeModal();
      renderAgenda();
      updatePanoramica();
      updateTitolareView();
      updateDipendenteView();
      updateClienteView();
    });
  });
}

// Giornata → appuntamenti
function openModalGiornataAppuntamenti(g) {
  const giornate = loadData(STORAGE_KEYS.GIORNATE, []);
  const gio = giornate.find((x) => x.id === g);
  if (!gio) return;
  const data = gio.dal;
  const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
  const list = app
    .filter((a) => a.data === data && a.giornataId === gio.id)
    .sort((a, b) => a.ora.localeCompare(b.ora));

  let html = `
    <p class="small">
      Appuntamenti per la giornata <strong>${gio.nome}</strong> (${formatDateShortIT(gio.dal)}).
    </p>
    <ul class="simple-list">
  `;
  if (list.length === 0) {
    html += `<li><span>Nessun appuntamento inserito.</span></li>`;
  } else {
    list.forEach((a) => {
      html += `
        <li>
          <div class="row-main">
            <span class="row-title">${a.ora} – ${a.nome}</span>
            <span class="row-sub">${a.telefono || ""} · ${a.motivo || ""}</span>
          </div>
        </li>`;
    });
  }
  html += `</ul>
    <button type="button" id="btn-new-app-gio" class="primary full-width">
      + Nuovo appuntamento per la giornata
    </button>
  `;
  openModal(`Giornata: ${gio.nome}`, html, () => {
    const btn = document.getElementById("btn-new-app-gio");
    if (btn) {
      btn.addEventListener("click", () => openModalNewAppForGiornata(gio));
    }
  });
}

function openModalNewAppForGiornata(gio) {
  const html = `
    <form id="form-app-gio">
      <label class="field">
        <span>Nome e cognome</span>
        <input type="text" id="appg-nome" />
      </label>
      <label class="field">
        <span>Telefono</span>
        <input type="tel" id="appg-tel" />
      </label>
      <label class="field">
        <span>Motivo</span>
        <input type="text" id="appg-motivo" />
      </label>
      <label class="field">
        <span>Orario (8:30 – 20:00, slot 30 min)</span>
        <input type="time" id="appg-ora" step="1800" />
      </label>
      <button type="submit" class="primary">Salva appuntamento</button>
    </form>
  `;
  openModal("Nuovo appuntamento giornata", html, () => {
    const form = document.getElementById("form-app-gio");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("appg-nome").value.trim();
      const tel = document.getElementById("appg-tel").value.trim();
      const motivo = document.getElementById("appg-motivo").value.trim();
      const ora = document.getElementById("appg-ora").value;

      if (!nome || !ora) {
        alert("Nome e orario sono obbligatori.");
        return;
      }

      const app = loadData(STORAGE_KEYS.APPUNTAMENTI, []);
      app.push({
        id: "app_" + Date.now(),
        data: gio.dal,
        ora,
        nome,
        telefono: tel,
        motivo,
        giornataId: gio.id,
        clienteUsername: null
      });
      saveData(STORAGE_KEYS.APPUNTAMENTI, app);
      closeModal();
      renderPromoAndGiornate();
      renderAgenda();
      updatePanoramica();
      updateTitolareView();
      updateDipendenteView();
      updateClienteView();
    });
  });
}

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

      if (action === "nuova-assenza") {
        // per ora solo dimostrazione
        alert("Azione rapida: nuova assenza");
        // in futuro → openSection("assenti");
      } else if (action === "nuovo-app") {
        alert("Azione rapida: nuovo appuntamento");
      } else if (action === "nuova-nota") {
        alert("Azione rapida: nota magazzino");
      } else if (action === "nuova-com") {
        alert("Azione rapida: comunicazione interna");
      }

      quickMenu.classList.add("hidden");
      quickBtn.classList.remove("open");
    });
  });
});
