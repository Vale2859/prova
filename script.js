// =======================
// DEMO UTENTI & AUTH
// =======================

const USERS_KEY = "pfmUsers_v1";
let pfmUsers = [];

// utenti demo iniziali
const DEFAULT_USERS = [
  {
    nome: "Valerio",
    cognome: "Montesano",
    username: "titolare",
    email: "titolare@farmaciamontesano.it",
    telefono: "",
    password: "titolare",
    ruolo: "titolare",
    targetView: "view-titolare",
  },
  {
    nome: "Farmacia",
    cognome: "Montesano",
    username: "farmacia",
    email: "info@farmaciamontesano.it",
    telefono: "",
    password: "farmacia",
    ruolo: "farmacia",
    targetView: "app-root",
  },
  {
    nome: "Cosimo",
    cognome: "Fazzino",
    username: "fazzino",
    email: "fazzino@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
  {
    nome: "Patrizia",
    cognome: "Rizzelli",
    username: "patrizia",
    email: "patrizia@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
  {
    nome: "Daniela",
    cognome: "Andrisani",
    username: "daniela",
    email: "daniela@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
  {
    nome: "Anamaria",
    cognome: "Zavaliche",
    username: "anamaria",
    email: "anamaria@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
  {
    nome: "Annalisa",
    cognome: "Maragno",
    username: "annalisa",
    email: "annalisa@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
  {
    nome: "Roberta",
    cognome: "Veneziano",
    username: "roberta",
    email: "roberta@farmacia.it",
    telefono: "",
    password: "demo",
    ruolo: "dipendente",
    targetView: "view-dipendente",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  initUsers();
  setupAuth();
  evidenziaOggiCalendario();
  setupNavigazioneSezioni();
  initPromo();
  initAgenda();
});

// carica utenti da localStorage o inizializza
function initUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      pfmUsers = JSON.parse(raw);
    } else {
      pfmUsers = DEFAULT_USERS;
      localStorage.setItem(USERS_KEY, JSON.stringify(pfmUsers));
    }
  } catch (e) {
    console.error("Errore lettura utenti:", e);
    pfmUsers = DEFAULT_USERS;
  }
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(pfmUsers));
}

// Mostra/nasconde viste in base all'utente loggato
function showViewForUser(user) {
  const authContainer = document.getElementById("auth-container");
  const appRoot = document.getElementById("app-root");
  const viewTitolare = document.getElementById("view-titolare");
  const viewDip = document.getElementById("view-dipendente");
  const viewCliente = document.getElementById("view-cliente");
  const userInfo = document.getElementById("currentUserInfo");
  const dipIntro = document.getElementById("dip-intro");

  // nascondo tutto
  [appRoot, viewTitolare, viewDip, viewCliente].forEach((v) => {
    if (v) v.classList.add("hidden");
  });

  authContainer.classList.add("hidden");

  const label = `${user.nome} ${user.cognome} (${user.ruolo})`;

  if (user.ruolo === "farmacia") {
    if (appRoot) appRoot.classList.remove("hidden");
    if (userInfo) userInfo.textContent = label;
  } else if (user.ruolo === "titolare") {
    if (viewTitolare) viewTitolare.classList.remove("hidden");
  } else if (user.ruolo === "dipendente") {
    if (viewDip) viewDip.classList.remove("hidden");
    if (dipIntro)
      dipIntro.textContent = `Benvenuto ${user.nome} ${user.cognome}. Area dipendente in lavorazione.`;
  } else if (user.ruolo === "cliente") {
    if (viewCliente) viewCliente.classList.remove("hidden");
  }
}

function doLogout() {
  const authContainer = document.getElementById("auth-container");
  const appRoot = document.getElementById("app-root");
  const viewTitolare = document.getElementById("view-titolare");
  const viewDip = document.getElementById("view-dipendente");
  const viewCliente = document.getElementById("view-cliente");

  [appRoot, viewTitolare, viewDip, viewCliente].forEach((v) => {
    if (v) v.classList.add("hidden");
  });
  authContainer.classList.remove("hidden");
}

// Setup login / register
function setupAuth() {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");
  const loginFeedback = document.getElementById("login-feedback");
  const regFeedback = document.getElementById("register-feedback");

  // tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-auth-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      panels.forEach((p) => {
        p.classList.remove("active");
      });
      const panel = document.getElementById("auth-" + target);
      if (panel) panel.classList.add("active");
      if (loginFeedback) loginFeedback.textContent = "";
      if (regFeedback) {
        regFeedback.textContent = "";
        regFeedback.classList.remove("auth-feedback--error", "auth-feedback--ok");
      }
    });
  });

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const identRaw = document.getElementById("login-ident").value.trim();
      const password = document.getElementById("login-password").value;

      if (!identRaw || !password) {
        loginFeedback.textContent = "Inserisci credenziali.";
        loginFeedback.classList.add("auth-feedback--error");
        return;
      }

      const identLower = identRaw.toLowerCase();

      const user = pfmUsers.find((u) => {
        const emailMatch =
          u.email && u.email.toLowerCase() === identLower;
        const telMatch =
          u.telefono && u.telefono === identRaw;
        const userMatch =
          u.username && u.username.toLowerCase() === identLower;

        return (emailMatch || telMatch || userMatch) && u.password === password;
      });

      if (!user) {
        loginFeedback.textContent = "Credenziali non valide.";
        loginFeedback.classList.add("auth-feedback--error");
        return;
      }

      loginFeedback.textContent = "";
      loginFeedback.classList.remove("auth-feedback--error");

      showViewForUser(user);
    });
  }

  // REGISTER
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!regFeedback) return;

      regFeedback.textContent = "";
      regFeedback.classList.remove("auth-feedback--error", "auth-feedback--ok");

      const nome = document.getElementById("reg-nome").value.trim();
      const cognome = document.getElementById("reg-cognome").value.trim();
      const username = document.getElementById("reg-username").value.trim();
      const emailRaw = document.getElementById("reg-email").value.trim();
      const email = emailRaw ? emailRaw.toLowerCase() : "";
      const telefono = document.getElementById("reg-telefono").value.trim();
      const password = document.getElementById("reg-password").value;
      const ruolo = document.getElementById("reg-ruolo").value;

      // Validazioni base comuni
      if (!nome || !cognome || !username || !password || !ruolo) {
        regFeedback.textContent = "Compila nome, cognome, username, password e ruolo.";
        regFeedback.classList.add("auth-feedback--error");
        return;
      }

      // Regole specifiche per ruolo
      if (ruolo === "dipendente") {
        if (!email) {
          regFeedback.textContent = "Per i dipendenti l'email è obbligatoria.";
          regFeedback.classList.add("auth-feedback--error");
          return;
        }
      } else if (ruolo === "cliente") {
        if (!telefono) {
          regFeedback.textContent = "Per i clienti il telefono è obbligatorio.";
          regFeedback.classList.add("auth-feedback--error");
          return;
        }
      }

      // Controllo duplicati
      if (
        pfmUsers.some(
          (u) =>
            (u.username &&
              u.username.toLowerCase() === username.toLowerCase()) ||
            (email && u.email === email) ||
            (telefono && u.telefono === telefono)
        )
      ) {
        regFeedback.textContent =
          "Esiste già un utente con questo username, email o telefono.";
        regFeedback.classList.add("auth-feedback--error");
        return;
      }

      const targetView =
        ruolo === "titolare"
          ? "view-titolare"
          : ruolo === "farmacia"
          ? "app-root"
          : ruolo === "cliente"
          ? "view-cliente"
          : "view-dipendente";

      const newUser = {
        nome,
        cognome,
        username,
        email,
        telefono,
        password,
        ruolo,
        targetView,
      };

      pfmUsers.push(newUser);
      saveUsers();

      regFeedback.textContent = "Account creato. Ora puoi fare login.";
      regFeedback.classList.add("auth-feedback--ok");

      // opzionale: passa a tab login
      const loginTab = document.querySelector('.auth-tab[data-auth-tab="login"]');
      if (loginTab) loginTab.click();
    });
  }

  // logout dai vari contesti
  const btnLogoutMain = document.getElementById("btn-logout");
  const logoutTitolare = document.getElementById("logout-titolare");
  const logoutDip = document.getElementById("logout-dipendente");
  const logoutCliente = document.getElementById("logout-cliente");

  [btnLogoutMain, logoutTitolare, logoutDip, logoutCliente].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        doLogout();
      });
    }
  });
}

// =======================
// CALENDARIO DASHBOARD (evidenzia oggi)
// =======================
function evidenziaOggiCalendario() {
  const oggi = new Date();
  const giorno = oggi.getDate().toString();

  const celle = document.querySelectorAll(".calendar-grid span");
  celle.forEach((cell) => {
    if (cell.textContent.trim() === giorno) {
      cell.classList.add("today");
    }
  });
}

// =======================
// DATI DEMO ASSENZE / TURNI
// =======================

const assenzeDemo = [
  {
    nome: "Mario Rossi",
    dal: "2025-11-29",
    al: "2025-11-30",
    tipo: "Ferie",
    stato: "approvato",
  },
  {
    nome: "Lucia Bianchi",
    dal: "2025-11-28",
    al: "2025-11-28",
    tipo: "Permesso",
    stato: "approvato",
  },
  {
    nome: "Giuseppe Neri",
    dal: "2025-12-03",
    al: "2025-12-05",
    tipo: "Malattia",
    stato: "approvato",
  },
  {
    nome: "Mario Rossi",
    dal: "2025-12-10",
    al: "2025-12-12",
    tipo: "Ferie",
    stato: "approvato",
  },
  {
    nome: "Test in attesa",
    dal: "2025-12-01",
    al: "2025-12-01",
    tipo: "Permesso",
    stato: "in attesa",
  },
];

const turniDemo = [
  {
    data: "2025-11-28",
    farmacia: "Farmacia Montesano",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Centrale",
    note: "Turno ordinario diurno.",
  },
  {
    data: "2025-11-29",
    farmacia: "Farmacia Centrale",
    orario: "08:00 – 20:00",
    appoggio: "Farmacia Montesano",
    note: "Turno di scambio tra farmacie.",
  },
  {
    data: "2025-11-30",
    farmacia: "Farmacia Madonna delle Grazie",
    orario: "20:00 – 08:00",
    appoggio: "Farmacia Montesano",
    note: "Turno notturno.",
  },
  {
    data: "2025-12-01",
    farmacia: "Farmacia Montesano",
    orario: "00:00 – 24:00",
    appoggio: "Farmacia Centrale",
    note: "Turno festivo.",
  },
];

// data di oggi in ISO (yyyy-mm-dd)
const oggiISO = (function () {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
})();

// =======================
// NAVIGAZIONE: DASHBOARD ↔ SEZIONI (assenti / turno)
// =======================
function setupNavigazioneSezioni() {
  const dashboards = document.querySelectorAll(
    ".mobile-dashboard, .desktop-dashboard"
  );
  const sezioni = document.querySelectorAll(".sezione-dettaglio");

  dashboards.forEach((d) => {
    const computed = window.getComputedStyle(d);
    d.dataset.displayOriginal = computed.display || "block";
  });

  function mostraDashboard() {
    sezioni.forEach((sec) => {
      sec.style.display = "none";
    });
    dashboards.forEach((d) => {
      d.style.display = d.dataset.displayOriginal || "block";
    });
    window.scrollTo(0, 0);
  }

  function mostraSezione(id) {
    dashboards.forEach((d) => {
      d.style.display = "none";
    });

    sezioni.forEach((sec) => {
      if (sec.id === "sezione-" + id) {
        sec.style.display = "block";
      } else {
        sec.style.display = "none";
      }
    });

    if (id === "assenti") {
      renderAssenti();
    } else if (id === "turno") {
      renderTurno();
    }

    window.scrollTo(0, 0);
  }

  // click su pillole / card che hanno data-section
  const sectionButtons = document.querySelectorAll("[data-section]");
  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = btn.getAttribute("data-section");
      if (id) {
        mostraSezione(id);
      }
    });
  });

  // pulsanti "Torna alla dashboard"
  const closeButtons = document.querySelectorAll("[data-close='sezione']");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      mostraDashboard();
    });
  });

  // select ruolo nella sezione assenti
  const ruoloAssSelect = document.getElementById("ruolo-assenti");
  if (ruoloAssSelect) {
    ruoloAssSelect.addEventListener("change", renderAssenti);
  }
}

// =======================
// ASSENTI / PERMESSI
// =======================
function renderAssenti() {
  const containerOggi = document.getElementById("assenti-oggi");
  const containerNext = document.getElementById("assenti-prossimi");
  if (!containerOggi || !containerNext) return;

  const ruoloSelect = document.getElementById("ruolo-assenti");
  const ruolo = ruoloSelect ? ruoloSelect.value : "farmacia";

  let lista = assenzeDemo.filter((a) => a.stato === "approvato");

  if (ruolo === "dipendente") {
    const mioNome = "Mario Rossi";
    lista = lista.filter((a) => a.nome === mioNome);
  }

  const oggiDate = parseISO(oggiISO);
  const oggiList = [];
  const nextList = [];

  lista.forEach((a) => {
    const dal = parseISO(a.dal);
    const al = parseISO(a.al);

    if (oggiDate >= dal && oggiDate <= al) {
      oggiList.push(a);
    } else if (oggiDate < dal) {
      nextList.push(a);
    }
  });

  nextList.sort((a, b) => parseISO(a.dal) - parseISO(b.dal));

  let htmlOggi = '<h3 style="margin:0 0 6px;">Assenti oggi</h3>';
  if (oggiList.length === 0) {
    htmlOggi +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Nessuno assente oggi.</p>';
  } else {
    htmlOggi += '<ul style="list-style:none; padding:0; margin:0;">';
    oggiList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlOggi += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${a.nome}</strong> – ${a.tipo} (${range})
      </li>`;
    });
    htmlOggi += "</ul>";
  }

  let htmlNext = '<h3 style="margin:12px 0 6px;">Assenze prossimi giorni</h3>';
  if (nextList.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altre assenze approvate nei prossimi giorni.</p>';
  } else {
    htmlNext += '<ul style="list-style:none; padding:0; margin:0;">';
    nextList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlNext += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${a.nome}</strong> – ${a.tipo} (${range})
      </li>`;
    });
    htmlNext += "</ul>";
  }

  containerOggi.innerHTML = htmlOggi;
  containerNext.innerHTML = htmlNext;

  // aggiorno anche "panoramica rapida" (assenti oggi)
  const panAssOggi = document.getElementById("pan-assenze-oggi");
  if (panAssOggi) panAssOggi.textContent = oggiList.length.toString();
}

// =======================
// FARMACIA DI TURNO
// =======================
function renderTurno() {
  const boxOggi = document.getElementById("turno-oggi");
  const boxNext = document.getElementById("turno-prossimi");
  if (!boxOggi || !boxNext) return;

  const oggiDate = parseISO(oggiISO);

  let turnoOggi = turniDemo.find((t) => t.data === oggiISO);
  if (!turnoOggi) {
    const futuri = turniDemo
      .filter((t) => parseISO(t.data) >= oggiDate)
      .sort((a, b) => parseISO(a.data) - parseISO(b.data));
    turnoOggi = futuri[0] || turniDemo[0];
  }

  const altri = turniDemo
    .filter((t) => t !== turnoOggi)
    .sort((a, b) => parseISO(a.data) - parseISO(b.data));

  const labelDataOggi = formatLongDateIT(turnoOggi.data);

  boxOggi.innerHTML = `
    <h3 style="margin:0 0 6px;">Turno di oggi</h3>
    <p style="margin:0 0 4px; font-size:0.9rem;">
      <strong>${turnoOggi.farmacia}</strong> – ${labelDataOggi}
    </p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Orario: <strong>${turnoOggi.orario}</strong></p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Appoggio: <strong>${turnoOggi.appoggio}</strong></p>
    <p style="margin:0; font-size:0.9rem; opacity:0.85;">${turnoOggi.note}</p>
  `;

  let htmlNext = '<h3 style="margin:12px 0 6px;">Prossimi turni</h3>';
  if (altri.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altri turni in elenco.</p>';
  } else {
    htmlNext += '<ul style="list-style:none; padding:0; margin:0;">';
    altri.forEach((t) => {
      htmlNext += `<li style="margin-bottom:4px; font-size:0.9rem;">
        <strong>${formatShortDateIT(t.data)}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}
      </li>`;
    });
    htmlNext += "</ul>";
  }
  boxNext.innerHTML = htmlNext;

  const panTurno = document.getElementById("pan-turno-oggi");
  if (panTurno) panTurno.textContent = turnoOggi.farmacia;
}
// =======================
// SUPPORTO DATE
// =======================
function parseISO(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatShortDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function formatRangeIT(dalISO, alISO) {
  const dal = formatShortDateIT(dalISO);
  const al = formatShortDateIT(alISO);
  if (dal === al) return dal;
  return `${dal} → ${al}`;
}

function formatLongDateIT(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
  return formatter.format(date);
}

// =======================
// PROMO & GIORNATE (Q2)
// =======================
let promoState = {
  offerte: [],
  eventi: [],
};

function initPromo() {
  const btnOfferta = document.getElementById("btn-add-offerta");
  const btnEvento = document.getElementById("btn-add-evento");

  if (btnOfferta) {
    btnOfferta.addEventListener("click", () => openPromoPopup("offerta"));
  }
  if (btnEvento) {
    btnEvento.addEventListener("click", () => openPromoPopup("evento"));
  }

  renderPromoLists();
}

let currentPromoType = null;

function openPromoPopup(tipo) {
  currentPromoType = tipo;
  const overlay = document.getElementById("popup-overlay");
  const title = document.getElementById("popup-title");
  const titolo = document.getElementById("popup-titolo");
  const data = document.getElementById("popup-data");
  const note = document.getElementById("popup-note");

  if (!overlay || !title || !titolo || !data || !note) return;

  title.textContent =
    tipo === "offerta" ? "Nuova offerta in corso" : "Nuova giornata in farmacia";
  titolo.value = "";
  note.value = "";

  const oggi = new Date();
  const iso = oggi.toISOString().slice(0, 10);
  data.value = iso;

  overlay.classList.remove("hidden");
}

function closePromoPopup() {
  const overlay = document.getElementById("popup-overlay");
  if (overlay) overlay.classList.add("hidden");
  currentPromoType = null;
}

// submit popup
const popupForm = document.getElementById("popup-form");
const popupCancel = document.getElementById("popup-cancel");

if (popupForm) {
  popupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentPromoType) return;

    const titolo = document.getElementById("popup-titolo").value.trim();
    const data = document.getElementById("popup-data").value;
    const note = document.getElementById("popup-note").value.trim();

    if (!titolo || !data) return;

    const entry = { titolo, data, note };

    if (currentPromoType === "offerta") {
      promoState.offerte.push(entry);
      promoState.offerte.sort((a, b) => (a.data > b.data ? 1 : -1));
    } else {
      promoState.eventi.push(entry);
      promoState.eventi.sort((a, b) => (a.data > b.data ? 1 : -1));
    }

    renderPromoLists();
    closePromoPopup();
  });
}

if (popupCancel) {
  popupCancel.addEventListener("click", () => {
    closePromoPopup();
  });
}

function renderPromoLists() {
  const listaOfferte = document.getElementById("lista-offerte");
  const listaEventi = document.getElementById("lista-eventi");
  const panOfferte = document.getElementById("pan-offerte");
  const panEventi = document.getElementById("pan-eventi");

  if (listaOfferte) {
    listaOfferte.innerHTML = "";
    if (promoState.offerte.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna offerta in corso.";
      li.style.fontSize = "0.78rem";
      li.style.color = "#7a8b93";
      listaOfferte.appendChild(li);
    } else {
      promoState.offerte.forEach((o, idx) => {
        const li = document.createElement("li");
        li.className = "promo-item";
        li.innerHTML = `
          <span class="promo-label">${o.titolo}</span>
          <span class="promo-date">${formatShortDateIT(o.data)}</span>
          ${
            o.note
              ? `<span class="promo-note">${o.note}</span>`
              : ""
          }
          <div class="promo-delete" data-type="offerta" data-index="${idx}">✕</div>
        `;
        listaOfferte.appendChild(li);
      });
    }
  }

  if (listaEventi) {
    listaEventi.innerHTML = "";
    if (promoState.eventi.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessuna giornata programmata.";
      li.style.fontSize = "0.78rem";
      li.style.color = "#7a8b93";
      listaEventi.appendChild(li);
    } else {
      promoState.eventi.forEach((o, idx) => {
        const li = document.createElement("li");
        li.className = "promo-item";
        li.style.borderLeftColor = "#f6a623";
        li.innerHTML = `
          <span class="promo-label">${o.titolo}</span>
          <span class="promo-date">${formatShortDateIT(o.data)}</span>
          ${
            o.note
              ? `<span class="promo-note">${o.note}</span>`
              : ""
          }
          <div class="promo-delete" data-type="evento" data-index="${idx}">✕</div>
        `;
        listaEventi.appendChild(li);
      });
    }
  }

  // delete handler (delegation)
  document.querySelectorAll(".promo-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const type = btn.getAttribute("data-type");
      const index = Number(btn.getAttribute("data-index"));
      if (type === "offerta") {
        promoState.offerte.splice(index, 1);
      } else {
        promoState.eventi.splice(index, 1);
      }
      renderPromoLists();
    });
  });

  if (panOfferte) panOfferte.textContent = promoState.offerte.length.toString();
  if (panEventi) panEventi.textContent = promoState.eventi.length.toString();
}

// =======================
// AGENDA (Q4)
// =======================

let agendaState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-11
  appuntamenti: {}, // chiave: "YYYY-MM-DD" -> array di appuntamenti
};

function initAgenda() {
  const btnPrev = document.getElementById("btn-cal-prev");
  const btnNext = document.getElementById("btn-cal-next");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      changeMonth(-1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      changeMonth(1);
    });
  }

  renderAgendaCalendar();
  setupAgendaPopup();
}

function changeMonth(delta) {
  let { year, month } = agendaState;
  month += delta;
  if (month < 0) {
    month = 11;
    year -= 1;
  } else if (month > 11) {
    month = 0;
    year += 1;
  }
  agendaState.year = year;
  agendaState.month = month;
  renderAgendaCalendar();
}

function renderAgendaCalendar() {
  const grid = document.getElementById("agenda-grid");
  const label = document.getElementById("agenda-month-label");
  if (!grid || !label) return;

  const year = agendaState.year;
  const month = agendaState.month;
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // lun=0 ... dom=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatter = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  });
  label.textContent = formatter.format(firstDay);

  grid.innerHTML = "";

  const giorniSettimana = ["lu", "ma", "me", "gi", "ve", "sa", "do"];
  giorniSettimana.forEach((g) => {
    const head = document.createElement("div");
    head.textContent = g;
    head.style.fontSize = "0.7rem";
    head.style.fontWeight = "600";
    head.style.textTransform = "uppercase";
    grid.appendChild(head);
  });

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "agenda-cell";

    if (year === todayY && month === todayM && d === todayD) {
      cell.classList.add("today");
    }

    const dayEvents = agendaState.appuntamenti[iso] || [];
    if (dayEvents.length > 0) {
      cell.classList.add("has-event");
    }

    cell.innerHTML = `
      <div class="agenda-cell-header">
        <span class="agenda-day-number">${d}</span>
        <span class="agenda-day-events">${
          dayEvents.length > 0 ? dayEvents.length + " appt" : ""
        }</span>
      </div>
    `;

    cell.addEventListener("click", () => {
      openAgendaPopup(iso);
    });

    grid.appendChild(cell);
  }
}

// POPUP agenda
let currentAgendaDate = null;

function setupAgendaPopup() {
  const overlay = document.getElementById("agenda-popup-overlay");
  const form = document.getElementById("agenda-popup-form");
  const btnCancel = document.getElementById("agenda-popup-cancel");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentAgendaDate) return;

      const orario = document.getElementById("agenda-orario").value;
      const nome = document.getElementById("agenda-nome").value.trim();
      const motivo = document.getElementById("agenda-motivo").value.trim();

      if (!orario || !nome || !motivo) return;

      if (!agendaState.appuntamenti[currentAgendaDate]) {
        agendaState.appuntamenti[currentAgendaDate] = [];
      }

      agendaState.appuntamenti[currentAgendaDate].push({
        orario,
        nome,
        motivo,
      });

      renderAgendaPopupList(currentAgendaDate);
      renderAgendaCalendar();
      form.reset();
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      if (overlay) overlay.classList.add("hidden");
      currentAgendaDate = null;
    });
  }
}

function openAgendaPopup(isoDate) {
  currentAgendaDate = isoDate;
  const overlay = document.getElementById("agenda-popup-overlay");
  const title = document.getElementById("agenda-popup-title");
  const form = document.getElementById("agenda-popup-form");

  if (!overlay || !title || !form) return;

  title.textContent = `Appuntamenti del ${formatLongDateIT(isoDate)}`;
  form.reset();
  renderAgendaPopupList(isoDate);

  overlay.classList.remove("hidden");
}

function renderAgendaPopupList(isoDate) {
  const container = document.getElementById("agenda-popup-list");
  if (!container) return;

  const arr = agendaState.appuntamenti[isoDate] || [];
  if (arr.length === 0) {
    container.innerHTML =
      '<p style="margin:0 0 6px; font-size:0.85rem; color:#7a8b93;">Nessun appuntamento per questo giorno.</p>';
  } else {
    container.innerHTML = "";
    arr
      .slice()
      .sort((a, b) => (a.orario > b.orario ? 1 : -1))
      .forEach((a) => {
        const div = document.createElement("div");
        div.className = "agenda-popup-item";
        div.innerHTML = `<strong>${a.orario}</strong> – ${a.nome} (${a.motivo})`;
        container.appendChild(div);
      });
  }
}
