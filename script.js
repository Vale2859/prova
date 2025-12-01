// script.js

// =========================
// VARIABILI GLOBALI
// =========================
let currentUser = null;
let inactivityTimer = null;

// dati demo per promozioni e giornate
let offerte = [
  { id: 1, titolo: "Sconto 20% Vitamina C", dal: "2025-12-01", al: "2025-12-15" },
  { id: 2, titolo: "Promo Dermocosmesi Natale", dal: "2025-12-10", al: "2025-12-31" }
];

let giornate = [
  { id: 1, titolo: "Giornata ECG", data: "2025-12-05" },
  { id: 2, titolo: "Giornata HOLTER PRESSORIO", data: "2025-12-12" }
];

// agenda appuntamenti: { "2025-12-05": [ {ora, nome, motivo, telefono} ] }
let agenda = {};

// chat demo
let chatMessages = [
  {
    id: 1,
    autore: "Farmacia",
    ruolo: "titolare",
    testo: "Ricordarsi di controllare scadenze banco automedicazione.",
    lato: "right"
  },
  {
    id: 2,
    autore: "Patrizia",
    ruolo: "dipendente",
    testo: "Ho già verificato la corsia 2, mancano solo 3 prodotti.",
    lato: "left"
  }
];

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  setupAuth();
  setupSidebar();
  setupMobileHeader();
  setupSezioniFarmacia();
  setupPromozioniGiornate();
  setupAgenda();

  // se esiste un utente salvato in localStorage, login diretto
  const savedUser = localStorage.getItem("fm_currentUser");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      mostraAppPerRuolo(currentUser.ruolo);
    } catch (e) {
      console.warn("Errore nel parse utente salvato", e);
    }
  }
});

// =========================
// AUTH (LOGIN / REGISTER)
// =========================
function setupAuth() {
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginError = document.getElementById("loginError");
  const registerError = document.getElementById("registerError");
  const registerOk = document.getElementById("registerOk");

  // tab switch
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.dataset.tab;
      if (target === "login") {
        loginForm.classList.add("auth-form--active");
        registerForm.classList.remove("auth-form--active");
      } else {
        registerForm.classList.add("auth-form--active");
        loginForm.classList.remove("auth-form--active");
      }

      loginError && (loginError.textContent = "");
      registerError && (registerError.textContent = "");
      registerOk && registerOk.classList.add("hidden");
    });
  });

  // inizializza utenti demo se non ci sono
  initDemoUsers();

  // login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const allUsers = getAllUsers();
    const found = allUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!found) {
      loginError.textContent = "Credenziali non valide (demo).";
      loginError.classList.remove("hidden");
      return;
    }

    loginError.classList.add("hidden");
    currentUser = found;
    localStorage.setItem("fm_currentUser", JSON.stringify(found));
    mostraAppPerRuolo(found.ruolo);
  });

  // accesso rapido demo
  document.querySelectorAll(".btn-chip[data-demo-role]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.demoRole;
      const allUsers = getAllUsers();
      const found = allUsers.find((u) => u.ruolo === role);
      if (!found) return;
      currentUser = found;
      localStorage.setItem("fm_currentUser", JSON.stringify(found));
      mostraAppPerRuolo(found.ruolo);
    });
  });

  // register
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    registerError.classList.add("hidden");
    registerOk.classList.add("hidden");

    const name = document.getElementById("regName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("regRole").value;
    const phone = document.getElementById("regPhone").value.trim();
    const email = document.getElementById("regEmail").value.trim();

    if (!name || !username || !password || !role) {
      registerError.textContent = "Compila tutti i campi obbligatori.";
      registerError.classList.remove("hidden");
      return;
    }

    if (role === "cliente" && !phone) {
      registerError.textContent = "Per i clienti il cellulare è obbligatorio.";
      registerError.classList.remove("hidden");
      return;
    }

    const allUsers = getAllUsers();
    if (allUsers.find((u) => u.username === username)) {
      registerError.textContent = "Username già esistente (scegline un altro).";
      registerError.classList.remove("hidden");
      return;
    }

    const nuovo = {
      id: Date.now(),
      nome: name,
      username,
      password,
      ruolo: role,
      telefono: phone,
      email
    };
    allUsers.push(nuovo);
    localStorage.setItem("fm_users", JSON.stringify(allUsers));

    registerOk.classList.remove("hidden");
    registerForm.reset();
  });
}

function initDemoUsers() {
  const existing = localStorage.getItem("fm_users");
  if (existing) return;

  const demoUsers = [
    { id: 1, nome: "Farmacia Montesano", username: "farmacia", password: "1234", ruolo: "farmacia" },
    { id: 2, nome: "Titolare", username: "titolare", password: "1234", ruolo: "titolare" },
    { id: 3, nome: "Cosimo Fazzino", username: "fazzino", password: "1234", ruolo: "dipendente" },
    { id: 4, nome: "Patrizia Rizzelli", username: "rizzelli", password: "1234", ruolo: "dipendente" },
    { id: 5, nome: "Daniela Andrisani", username: "andrisani", password: "1234", ruolo: "dipendente" },
    { id: 6, nome: "Anamaria Zavaliche", username: "zavaliche", password: "1234", ruolo: "dipendente" },
    { id: 7, nome: "Annalisa Maragno", username: "maragno", password: "1234", ruolo: "dipendente" },
    { id: 8, nome: "Roberta Veneziano", username: "veneziano", password: "1234", ruolo: "dipendente" }
  ];
  localStorage.setItem("fm_users", JSON.stringify(demoUsers));
}

function getAllUsers() {
  const json = localStorage.getItem("fm_users");
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

// mostra app secondo ruolo
function mostraAppPerRuolo(ruolo) {
  const auth = document.getElementById("authContainer");
  const app = document.getElementById("app");
  if (!app || !auth) return;

  auth.classList.add("hidden");
  app.classList.remove("hidden");

  // badge utente
  const badge = document.getElementById("currentUserBadge");
  const sidebarRole = document.getElementById("sidebarUserRole");
  const sidebarName = document.getElementById("sidebarUserName");

  if (currentUser) {
    const roleLabel =
      currentUser.ruolo === "farmacia"
        ? "Farmacia"
        : currentUser.ruolo === "titolare"
        ? "Titolare"
        : currentUser.ruolo === "dipendente"
        ? "Dipendente"
        : "Cliente";

    badge.textContent = `${roleLabel} · ${currentUser.username}`;
    sidebarRole.textContent = roleLabel;
    sidebarName.textContent = currentUser.nome || currentUser.username;
  }

  // mostra dashboard corretta
  const farmaciaDash = document.getElementById("farmaciaDashboard");
  const titolareDash = document.getElementById("titolareDashboard");
  const dipendenteDash = document.getElementById("dipendenteDashboard");
  const clienteDash = document.getElementById("clienteDashboard");

  [farmaciaDash, titolareDash, dipendenteDash, clienteDash].forEach((d) => {
    if (d) d.classList.add("hidden");
  });

  if (ruolo === "farmacia") {
    farmaciaDash.classList.remove("hidden");
  } else if (ruolo === "titolare") {
    titolareDash.classList.remove("hidden");
  } else if (ruolo === "dipendente") {
    dipendenteDash.classList.remove("hidden");
  } else if (ruolo === "cliente") {
    clienteDash.classList.remove("hidden");
  } else {
    farmaciaDash.classList.remove("hidden");
  }

  // reset area contenuti a panoramica
  mostraPanoramicaRapida();

  // inizializza quick link
  setupQuickLinks();
}
// =========================
// SIDEBAR + QUICK LINKS
// =========================
function setupSidebar() {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  document.addEventListener("click", (e) => {
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
      localStorage.removeItem("fm_currentUser");
      currentUser = null;
      document.getElementById("app").classList.add("hidden");
      document.getElementById("authContainer").classList.remove("hidden");
    });
  }

  // nav ruoli
  document.querySelectorAll(".sidebar-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (!target) return;
      if (!currentUser) return;

      if (target === "farmacia") {
        mostraAppPerRuolo("farmacia");
      } else if (target === "titolare") {
        mostraAppPerRuolo("titolare");
      } else if (target === "dipendente") {
        mostraAppPerRuolo("dipendente");
      } else if (target === "cliente") {
        mostraAppPerRuolo("cliente");
      }
      sidebar.classList.remove("open");
    });
  });
}

function setupQuickLinks() {
  document.querySelectorAll(".quick-link").forEach((btn) => {
    btn.onclick = () => {
      const q = btn.dataset.q;
      if (q === "mail") {
        window.open("mailto:info@farmaciamontesano.it", "_blank");
      } else if (q === "whatsapp") {
        window.open("https://wa.me/390000000000", "_blank");
      } else if (q === "medybox") {
        window.open("https://www.google.com/search?q=medybox", "_blank");
      } else if (q === "pharmercure") {
        window.open("https://www.google.com/search?q=pharmercure", "_blank");
      }
    };
  });
}

// mobile header (solo per futuro)
function setupMobileHeader() {
  const mHamburger = document.querySelector(".m-hamburger");
  if (mHamburger) {
    mHamburger.addEventListener("click", () => {
      // per ora niente menu mobile complesso
      alert("Menu mobile in demo. Usa la dashboard desktop per tutte le funzioni.");
    });
  }

  // tap sulle card mobile → mostra sezione in modal
  document.querySelectorAll(".m-card[data-section]").forEach((card) => {
    card.addEventListener("click", () => {
      const sezione = card.dataset.section;
      apriModalSezioneMobile(sezione);
    });
  });
}

function apriModalSezioneMobile(sezione) {
  const titolo = {
    assenti: "Assenti / Permessi",
    turno: "Farmacia di turno",
    comunicazioni: "Comunicazioni",
    procedure: "Procedure",
    logistica: "Logistica",
    magazzino: "Magazzino",
    scadenze: "Prodotti in scadenza",
    consumabili: "Consumabili",
    consegne: "Consegne / Ritiri",
    cassa: "Cambio cassa",
    archivio: "Archivio file"
  }[sezione] || "Sezione";

  const testo = `
    <p>Questa è una vista rapida mobile della sezione <strong>${titolo}</strong>.</p>
    <p>Per utilizzare tutte le funzioni complete ti conviene aprire la dashboard da un monitor in farmacia.</p>
  `;
  openModal(titolo, testo);
}

// =========================
// SEZIONI FARMACIA → AREA CONTENUTI
// =========================
function setupSezioniFarmacia() {
  document.querySelectorAll(".section-card[data-section]").forEach((card) => {
    card.addEventListener("click", () => {
      const sezione = card.dataset.section;
      mostraSezioneInAreaContenuti(sezione);
    });
  });

  // reset panoramica dopo inattività
  resetInactivityTimer();
  document.addEventListener("click", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
}

function mostraPanoramicaRapida() {
  const area = document.getElementById("areaContenuti");
  if (!area) return;
  area.innerHTML = "";
  const div = document.createElement("div");
  div.id = "panoramicaRapida";
  div.className = "panoramica-rapida";
  div.innerHTML = `
    <h3>Panoramica rapida</h3>
    <div class="pan-row">
      <div class="pan-box">
        <span class="pan-label">Servizi di oggi</span>
        <span id="panServiziOggi" class="pan-value">ECG · Holter pressorio</span>
      </div>
      <div class="pan-box">
        <span class="pan-label">Assenze confermate</span>
        <span id="panAssenzeOggi" class="pan-value">2 assenti</span>
      </div>
    </div>
    <div class="pan-row">
      <div class="pan-box">
        <span class="pan-label">Prodotti in scadenza (&lt; 60gg)</span>
        <span id="panScadenze" class="pan-value">5 articoli da controllare</span>
      </div>
      <div class="pan-box">
        <span class="pan-label">Promozioni attive</span>
        <span id="panPromo" class="pan-value">${offerte.length} promo in corso</span>
      </div>
    </div>
    <p class="pan-hint">
      Clicca una card in <strong>Sezioni farmacia</strong> per vedere i dettagli qui.
      Dopo 20 secondi senza tocchi tornerai a questa panoramica.
    </p>
  `;
  area.appendChild(div);
}

function mostraSezioneInAreaContenuti(sezione) {
  const area = document.getElementById("areaContenuti");
  if (!area) return;
  area.innerHTML = "";

  if (sezione === "assenti") {
    area.innerHTML = `
      <h3>Assenti / Permessi</h3>
      <p>Oggi assenti confermati:</p>
      <ul>
        <li><strong>Fazzino Cosimo</strong> – Ferie (dal 02/12 al 05/12)</li>
        <li><strong>Rizzelli Patrizia</strong> – Permesso (oggi pomeriggio)</li>
      </ul>
      <p style="margin-top:8px;font-size:0.85rem;color:#6b7280;">
        In futuro qui potrai gestire tutte le richieste di permesso/ferie.
      </p>
    `;
  } else if (sezione === "turno") {
    area.innerHTML = `
      <h3>Farmacia di turno</h3>
      <p><strong>Oggi:</strong> Farmacia Montesano</p>
      <p>Orario: 08:00 – 20:00 · Appoggio: Farmacia Centrale</p>
      <p style="margin-top:8px;font-size:0.85rem;">
        Per il calendario ufficiale dei turni puoi aprire il sito Federfarma.<br/>
        <button class="btn-small" onclick="window.open('https://www.google.com/search?q=turni+farmacie+matera+federfarma','_blank')">
          Apri sito Federfarma
        </button>
      </p>
    `;
  } else if (sezione === "comunicazioni") {
    renderChatInArea(area);
  } else if (sezione === "procedure") {
    area.innerHTML = `
      <h3>Procedure rapide</h3>
      <ul>
        <li><strong>Chiusura cassa serale</strong> – check list in 3 step.</li>
        <li><strong>Gestione buoni SSN</strong> – verifica dati e allega scontrino.</li>
        <li><strong>Ricezione merce</strong> – controllo colli, scadenze, carico in magazzino.</li>
      </ul>
      <p style="margin-top:8px;font-size:0.85rem;color:#6b7280;">
        In futuro questa sezione potrà aprire la procedura dettagliata con passi ben evidenziati.
      </p>
    `;
  } else if (sezione === "logistica") {
    area.innerHTML = `
      <h3>Logistica</h3>
      <ul>
        <li>Oggi in arrivo: 2 colli grossista + 1 corriere dermocosmesi.</li>
        <li>Domani previsto ritiro resi scaduti.</li>
      </ul>
    `;
  } else if (sezione === "magazzino") {
    area.innerHTML = `
      <h3>Magazzino</h3>
      <p>Situazione rapida:</p>
      <ul>
        <li>5 articoli in sottoscorta (da riordinare).</li>
        <li>1 scaffale in inventario (banco automedicazione).</li>
      </ul>
    `;
  } else if (sezione === "scadenze") {
    renderScadenzeInArea(area);
  } else if (sezione === "consumabili") {
    area.innerHTML = `
      <h3>Consumabili</h3>
      <p>Disponibilità per le prossime 2 settimane: OK.</p>
      <ul>
        <li>Guanti: sufficiente.</li>
        <li>Aghi e lancette: sufficiente.</li>
        <li>Rotoli scontrini: 3 confezioni.</li>
      </ul>
    `;
  } else if (sezione === "consegne") {
    area.innerHTML = `
      <h3>Consegne / Ritiri</h3>
      <ul>
        <li>Ore 10:30 – Corriere A – 3 colli.</li>
        <li>Ore 12:00 – Reso dermocosmesi.</li>
        <li>Ore 17:00 – Consegna urgente paziente cronico.</li>
      </ul>
    `;
  } else if (sezione === "cassa") {
    area.innerHTML = `
      <h3>Cambio cassa</h3>
      <p>Ultimo cambio effettuato alle <strong>14:22</strong>.</p>
      <p style="margin-top:6px;">In futuro qui potrai avere il modulo guidato per il cambio cassa.</p>
    `;
  } else if (sezione === "archivio") {
    area.innerHTML = `
      <h3>Archivio file</h3>
      <p>Ultimi documenti caricati:</p>
      <ul>
        <li>Turni dicembre 2025 (PDF).</li>
        <li>Protocollo vaccini aggiornato.</li>
        <li>Listino dermocosmesi Natale.</li>
      </ul>
    `;
  }

  // reset timer panoramica
  resetInactivityTimer();
}

// chat interna in area contenuti
function renderChatInArea(container) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-wrapper";
  const msgBox = document.createElement("div");
  msgBox.className = "chat-messages";
  chatMessages.forEach((m) => {
    const bubble = document.createElement("div");
    bubble.className =
      "chat-bubble " + (m.lato === "right" ? "chat-bubble-right" : "chat-bubble-left");
    bubble.innerHTML = `
      <div class="chat-meta"><strong>${m.autore}</strong> · ${m.ruolo}</div>
      <div>${m.testo}</div>
    `;
    msgBox.appendChild(bubble);
  });

  const form = document.createElement("div");
  form.className = "chat-form";
  form.innerHTML = `
    <select id="chatMittente">
      <option value="Farmacia">Farmacia</option>
      <option value="Titolare">Titolare</option>
      <option value="Dipendente">Dipendente</option>
    </select>
    <input id="chatInput" class="chat-input" type="text" placeholder="Scrivi una comunicazione veloce…" />
    <button id="chatSend" class="chat-send-btn">Invia</button>
  `;

  wrapper.appendChild(msgBox);
  wrapper.appendChild(form);
  container.appendChild(wrapper);

  const sendBtn = form.querySelector("#chatSend");
  const input = form.querySelector("#chatInput");
  const mittenteSel = form.querySelector("#chatMittente");

  sendBtn.addEventListener("click", () => {
    const txt = input.value.trim();
    if (!txt) return;
    const mitt = mittenteSel.value;

    const lato = mitt === "Farmacia" || mitt === "Titolare" ? "right" : "left";
    const nuovo = {
      id: Date.now(),
      autore: mitt,
      ruolo: mitt.toLowerCase(),
      testo: txt,
      lato
    };
    chatMessages.push(nuovo);

    const bubble = document.createElement("div");
    bubble.className =
      "chat-bubble " + (lato === "right" ? "chat-bubble-right" : "chat-bubble-left");
    bubble.innerHTML = `
      <div class="chat-meta"><strong>${nuovo.autore}</strong> · ${nuovo.ruolo}</div>
      <div>${nuovo.testo}</div>
    `;
    msgBox.appendChild(bubble);
    msgBox.scrollTop = msgBox.scrollHeight;
    input.value = "";
  });
}

// reset panoramica dopo 20s
function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    mostraPanoramicaRapida();
  }, 20000);
}

// =========================
// PROMOZIONI & GIORNATE
// =========================
function setupPromozioniGiornate() {
  renderOfferte();
  renderGiornate();

  const btnAddOfferta = document.getElementById("btnAddOfferta");
  const btnAddGiornata = document.getElementById("btnAddGiornata");
  const btnVediOfferte = document.getElementById("btnVediOfferte");
  const btnVediGiornate = document.getElementById("btnVediGiornate");

  if (btnAddOfferta) {
    btnAddOfferta.addEventListener("click", () => {
      apriModalNuovaOfferta();
    });
  }

  if (btnAddGiornata) {
    btnAddGiornata.addEventListener("click", () => {
      apriModalNuovaGiornata();
    });
  }

  if (btnVediOfferte) {
    btnVediOfferte.addEventListener("click", () => {
      apriModalListaOfferte();
    });
  }

  if (btnVediGiornate) {
    btnVediGiornate.addEventListener("click", () => {
      apriModalListaGiornate();
    });
  }
}

function renderOfferte() {
  const ul = document.getElementById("listaOfferte");
  if (!ul) return;
  ul.innerHTML = "";

  const oggi = todayISO();
  const sorted = [...offerte].sort((a, b) => (a.dal || "").localeCompare(b.dal || ""));
  sorted.forEach((o) => {
    const li = document.createElement("li");
    const scaduta = o.al && o.al < oggi;
    li.innerHTML = `
      <span>${o.titolo}<br/><small>${o.dal || ""} – ${o.al || ""}</small></span>
      <span class="badge-status ${scaduta ? "badge-scaduta" : "badge-attiva"}">
        ${scaduta ? "Scaduta" : "Attiva"}
      </span>
    `;
    ul.appendChild(li);
  });
}

function renderGiornate() {
  const ul = document.getElementById("listaGiornate");
  if (!ul) return;
  ul.innerHTML = "";

  const oggi = todayISO();
  const sorted = [...giornate].sort((a, b) => a.data.localeCompare(b.data));
  sorted.forEach((g) => {
    const li = document.createElement("li");
    const scaduta = g.data < oggi;
    li.innerHTML = `
      <span>${g.titolo}<br/><small>${g.data}</small></span>
      <span class="badge-status ${scaduta ? "badge-scaduta" : "badge-attiva"}">
        ${scaduta ? "Conclusa" : "Attiva"}
      </span>
    `;
    li.addEventListener("click", () => {
      apriGestioneAppuntamentiGiornata(g);
    });
    ul.appendChild(li);
  });
}

function apriModalNuovaOfferta() {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="modal-form-row">
      <label>Titolo offerta
        <input type="text" id="offTitolo" />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Dal
        <input type="date" id="offDal" />
      </label>
      <label>Al
        <input type="date" id="offAl" />
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="offCancel">Annulla</button>
      <button class="btn-primary" id="offSave">Salva</button>
    </div>
  `;
  openModal("Nuova offerta", body);

  body.querySelector("#offCancel").onclick = closeModal;
  body.querySelector("#offSave").onclick = () => {
    const titolo = body.querySelector("#offTitolo").value.trim();
    const dal = body.querySelector("#offDal").value;
    const al = body.querySelector("#offAl").value;
    if (!titolo || !dal || !al) {
      alert("Compila titolo e date.");
      return;
    }
    offerte.push({ id: Date.now(), titolo, dal, al });
    renderOfferte();
    closeModal();
  };
}

function apriModalNuovaGiornata() {
  const body = document.createElement("div");
  body.innerHTML = `
    <p style="font-size:0.85rem;margin-top:0;">
      In alto ricorda: <strong>prendere appuntamenti per la giornata scelta</strong>.
    </p>
    <div class="modal-form-row">
      <label>Titolo giornata
        <input type="text" id="giorTitolo" placeholder="Es. Giornata ECG" />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Data
        <input type="date" id="giorData" />
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="giorCancel">Annulla</button>
      <button class="btn-primary" id="giorSave">Salva</button>
    </div>
  `;
  openModal("Nuova giornata in farmacia", body);

  body.querySelector("#giorCancel").onclick = closeModal;
  body.querySelector("#giorSave").onclick = () => {
    const titolo = body.querySelector("#giorTitolo").value.trim();
    const data = body.querySelector("#giorData").value;
    if (!titolo || !data) {
      alert("Compila titolo e data.");
      return;
    }
    giornate.push({ id: Date.now(), titolo, data });
    renderGiornate();
    closeModal();
  };
}

function apriModalListaOfferte() {
  const oggi = todayISO();
  const attive = offerte.filter((o) => !o.al || o.al >= oggi);
  const scadute = offerte.filter((o) => o.al && o.al < oggi);

  const body = document.createElement("div");
  let html = "<h4>Offerte in corso</h4>";
  if (attive.length === 0) {
    html += "<p>Nessuna offerta in corso.</p>";
  } else {
    html += "<ul>";
    attive.forEach((o) => {
      html += `<li>${o.titolo} – ${o.dal} → ${o.al}</li>`;
    });
    html += "</ul>";
  }

  html += "<h4>Offerte scadute</h4>";
  if (scadute.length === 0) {
    html += "<p>Nessuna offerta scaduta.</p>";
  } else {
    html += "<ul>";
    scadute.forEach((o) => {
      html += `<li>${o.titolo} – ${o.dal} → ${o.al}</li>`;
    });
    html += "</ul>";
  }

  body.innerHTML = html;
  openModal("Tutte le offerte", body);
}

function apriModalListaGiornate() {
  const oggi = todayISO();
  const attive = giornate.filter((g) => g.data >= oggi);
  const scadute = giornate.filter((g) => g.data < oggi);

  const body = document.createElement("div");
  let html = "<h4>Giornate attive</h4>";
  if (attive.length === 0) {
    html += "<p>Nessuna giornata attiva.</p>";
  } else {
    html += "<ul>";
    attive.forEach((g) => {
      html += `<li>${g.titolo} – ${g.data}</li>`;
    });
    html += "</ul>";
  }

  html += "<h4>Giornate concluse</h4>";
  if (scadute.length === 0) {
    html += "<p>Nessuna giornata conclusa.</p>";
  } else {
    html += "<ul>";
    scadute.forEach((g) => {
      html += `<li>${g.titolo} – ${g.data}</li>`;
    });
    html += "</ul>";
  }

  body.innerHTML = html;
  openModal("Tutte le giornate", body);
}

// gestione appuntamenti di una giornata (30 min dalle 8:30 alle 20:00)
function apriGestioneAppuntamentiGiornata(giornata) {
  const key = giornata.data;
  if (!agenda[key]) agenda[key] = [];

  const body = document.createElement("div");
  const headerP = document.createElement("p");
  headerP.style.marginTop = "0";
  headerP.style.fontSize = "0.85rem";
  headerP.innerHTML = `<strong>${giornata.titolo}</strong> – Prendere appuntamenti per la giornata selezionata.`;
  body.appendChild(headerP);

  const listaDiv = document.createElement("div");
  aggiornaListaAppuntamenti(key, listaDiv);
  body.appendChild(listaDiv);

  const btnNew = document.createElement("button");
  btnNew.className = "btn-small";
  btnNew.textContent = "Nuovo appuntamento";
  btnNew.style.marginTop = "6px";
  btnNew.onclick = () => {
    apriModalNuovoAppuntamento(key, () => {
      aggiornaListaAppuntamenti(key, listaDiv);
    });
  };
  body.appendChild(btnNew);

  openModal(`Appuntamenti – ${giornata.data}`, body);
}

function aggiornaListaAppuntamenti(dataKey, container) {
  container.innerHTML = "";
  const list = agenda[dataKey] || [];
  if (list.length === 0) {
    container.innerHTML =
      '<p style="font-size:0.85rem;">Nessun appuntamento per questa giornata.</p>';
    return;
  }

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";
  ul.style.margin = "6px 0 0";

  const sorted = [...list].sort((a, b) => a.ora.localeCompare(b.ora));
  sorted.forEach((app) => {
    const li = document.createElement("li");
    li.style.marginBottom = "4px";
    li.innerHTML = `<strong>${app.ora}</strong> – ${app.nome} (${app.motivo}) · ${app.telefono}`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function apriModalNuovoAppuntamento(dataKey, onSave) {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="modal-form-row">
      <label>Data
        <input type="date" id="appData" value="${dataKey}" />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Ora
        <input type="time" id="appOra" />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Nome e cognome
        <input type="text" id="appNome" />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Motivo
        <input type="text" id="appMotivo" placeholder="ECG, Holter, ecc." />
      </label>
    </div>
    <div class="modal-form-row">
      <label>Telefono
        <input type="tel" id="appTelefono" placeholder="Numero paziente" />
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="appCancel">Annulla</button>
      <button class="btn-primary" id="appSave">Salva</button>
    </div>
  `;

  openModal("Nuovo appuntamento", body);

  body.querySelector("#appCancel").onclick = closeModal;
  body.querySelector("#appSave").onclick = () => {
    const data = body.querySelector("#appData").value;
    const ora = body.querySelector("#appOra").value;
    const nome = body.querySelector("#appNome").value.trim();
    const motivo = body.querySelector("#appMotivo").value.trim();
    const telefono = body.querySelector("#appTelefono").value.trim();

    if (!data || !ora || !nome || !motivo || !telefono) {
      alert("Compila tutti i campi.");
      return;
    }

    const key = data;
    if (!agenda[key]) agenda[key] = [];

    // controlla doppione orario
    if (agenda[key].some((a) => a.ora === ora)) {
      alert("Orario già occupato per questa giornata.");
      return;
    }

    agenda[key].push({ ora, nome, motivo, telefono });
    closeModal();
    onSave && onSave();
  };
}
// =========================
// AGENDA (CALENDARIO MENSILE)
// =========================
let agendaCurrentDate = new Date();

function setupAgenda() {
  const prev = document.getElementById("agendaPrevMonth");
  const next = document.getElementById("agendaNextMonth");
  const todayBtn = document.getElementById("agendaToday");

  if (prev) {
    prev.addEventListener("click", () => {
      agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() - 1);
      renderAgenda();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() + 1);
      renderAgenda();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      agendaCurrentDate = new Date();
      renderAgenda();
    });
  }

  renderAgenda();
}

function renderAgenda() {
  const grid = document.getElementById("agendaGrid");
  const label = document.getElementById("agendaMonthLabel");
  if (!grid || !label) return;

  grid.innerHTML = "";
  const year = agendaCurrentDate.getFullYear();
  const month = agendaCurrentDate.getMonth();

  const formatter = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric"
  });
  label.textContent =
    formatter.format(new Date(year, month, 1)).charAt(0).toUpperCase() +
    formatter
      .format(new Date(year, month, 1))
      .slice(1);

  const todayIso = todayISO();

  // header giorni
  const giorniLabel = ["lu", "ma", "me", "gi", "ve", "sa", "do"];
  giorniLabel.forEach((g) => {
    const div = document.createElement("div");
    div.className = "agenda-day-header";
    div.textContent = g;
    grid.appendChild(div);
  });

  const firstDay = new Date(year, month, 1);
  const startWeekDay = (firstDay.getDay() + 6) % 7; // 0=lu ... 6=do
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // celle vuote prima del primo giorno
  for (let i = 0; i < startWeekDay; i++) {
    const cell = document.createElement("div");
    cell.className = "agenda-cell agenda-cell-empty";
    grid.appendChild(cell);
  }

  // celle giorni
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "agenda-cell";

    const daySpan = document.createElement("div");
    daySpan.className = "agenda-cell-number";
    daySpan.textContent = d;
    cell.appendChild(daySpan);

    const dateIso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // se ci sono appuntamenti
    if (agenda[dateIso] && agenda[dateIso].length > 0) {
      const tag = document.createElement("span");
      tag.className = "agenda-cell-tag";
      tag.textContent = `${agenda[dateIso].length} appuntamenti`;
      cell.appendChild(tag);
      cell.classList.add("agenda-day-with-event");
    }

    // se è oggi
    if (dateIso === todayIso) {
      cell.classList.add("agenda-day-today");
    }

    cell.addEventListener("click", () => {
      apriPopupGiornoAgenda(dateIso);
    });

    grid.appendChild(cell);
  }
}

function apriPopupGiornoAgenda(dateIso) {
  const body = document.createElement("div");
  const d = new Date(dateIso);
  const label = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);

  const headerP = document.createElement("p");
  headerP.style.marginTop = "0";
  headerP.style.fontSize = "0.85rem";
  headerP.textContent = label;
  body.appendChild(headerP);

  const containerList = document.createElement("div");
  aggiornaListaAppuntamenti(dateIso, containerList);
  body.appendChild(containerList);

  const btnNew = document.createElement("button");
  btnNew.className = "btn-small";
  btnNew.textContent = "Nuovo appuntamento";
  btnNew.style.marginTop = "6px";
  btnNew.onclick = () => {
    apriModalNuovoAppuntamento(dateIso, () => {
      aggiornaListaAppuntamenti(dateIso, containerList);
      renderAgenda();
    });
  };
  body.appendChild(btnNew);

  openModal("Appuntamenti del giorno", body);
}

// =========================
// SCADENZE IN AREA CONTENUTI
// =========================
function renderScadenzeInArea(container) {
  const oggi = todayISO();
  // demo: prodotti fittizi
  const prodotti = [
    { nome: "Omeprazolo 20mg", scadenza: "2026-01-10" },
    { nome: "Vitamina D gocce", scadenza: "2025-12-20" },
    { nome: "Antistaminico X", scadenza: "2026-02-05" },
    { nome: "Spray nasale Y", scadenza: "2025-12-05" },
    { nome: "Fermenti lattici Z", scadenza: "2026-01-02" }
  ];

  const entro60 = prodotti.filter((p) => diffInDays(oggi, p.scadenza) <= 60);

  let html = "<h3>Prodotti in scadenza (&lt;= 60 giorni)</h3>";
  if (entro60.length === 0) {
    html += "<p>Nessun prodotto in scadenza entro 60 giorni.</p>";
  } else {
    html += "<ul>";
    entro60.forEach((p) => {
      html += `<li>${p.nome} – Scad.: ${formatDateIT(p.scadenza)}</li>`;
    });
    html += "</ul>";
  }

  html += `
    <p style="margin-top:8px;font-size:0.85rem;color:#6b7280;">
      Dal tasto <strong>Azioni rapide</strong> (in futuro) potrai inserire velocemente nuove scadenze mese per mese.
    </p>
  `;
  container.innerHTML = html;
}

// =========================
// MODAL GENERICO
// =========================
function openModal(titolo, contenuto) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const closeBtn = document.getElementById("modalClose");
  if (!overlay || !titleEl || !bodyEl || !closeBtn) return;

  titleEl.textContent = titolo;
  bodyEl.innerHTML = "";
  if (typeof contenuto === "string") {
    bodyEl.innerHTML = contenuto;
  } else if (contenuto instanceof HTMLElement) {
    bodyEl.appendChild(contenuto);
  }

  overlay.classList.remove("hidden");

  closeBtn.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.classList.add("hidden");
}

// =========================
// UTILITY DATE
// =========================
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffInDays(fromIso, toIso) {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  const diff = b - a;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
