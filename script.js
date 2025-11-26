// ======================================================
// FARMACIA MONTESANO – PORTALE PROFESSIONALE
// SCRIPT.JS – PARTE 1/7
// ------------------------------------------------------
// In questo file gestiamo tutta la logica del portale:
// - utenti e ruoli (titolare, farmacia, dipendente, cliente)
// - autenticazione e sessione "finta" via localStorage
// - caricamento dashboard corrette in base al ruolo
// - gestione dei dati (assenze, arrivi, scorte, ecc.) sempre in localStorage
// ======================================================

/* =====================================================
   COSTANTI GLOBALI / CHIAVI DI LOCALSTORAGE
   ===================================================== */

// Chiavi centralizzate per non sbagliare mai a scriverle
const LS_KEYS = {
  USERS: "fm_users",             // Lista utenti registrati (tutti i ruoli)
  SETTINGS: "fm_settings",       // Impostazioni varie (es. dati farmacia, tema)
  DATA: "fm_data",               // Dati operativi (assenze, scorte, arrivi, ecc.)
  SESSION: "fm_session"          // Utente attualmente loggato
};

// Ruoli supportati dal portale
const ROLES = {
  TITOLARE: "titolare",
  FARMACIA: "farmacia",
  DIPENDENTE: "dipendente",
  CLIENTE: "cliente"
};

// Piccolo helper per sapere se siamo in "modalità debug" (utile se vuoi loggare)
const DEBUG = true;

/* =====================================================
   FUNZIONI DI UTILITÀ GENERALI
   ===================================================== */

/**
 * Log condizionale: se DEBUG è true, mostra nel console.log il messaggio.
 * Così puoi spegnere tutti i log mettendo DEBUG = false.
 */
function logDebug(...args) {
  if (DEBUG) {
    console.log("[FM DEBUG]", ...args);
  }
}

/**
 * Legge un valore dal localStorage e lo converte da JSON.
 * Se non esiste, restituisce il valore di default passato.
 */
function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Errore lettura localStorage per key:", key, err);
    return defaultValue;
  }
}

/**
 * Salva un valore in localStorage convertendolo in JSON.
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Errore salvataggio localStorage per key:", key, err);
  }
}

/**
 * Genera un ID semplice (non sicuro, ma perfetto per il front-end locale).
 */
function generateId(prefix = "id") {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${now}_${rand}`;
}

/* =====================================================
   GESTIONE UTENTI · STRUTTURA DATI
   ===================================================== */

/**
 * Struttura di un utente tipo:
 * {
 *   id: "user_...",
 *   role: "titolare" | "farmacia" | "dipendente" | "cliente",
 *   nome: "Mario",
 *   cognome: "Rossi",
 *   username: "mario.rossi" (o email),
 *   password: "hash o testo semplice (per ora semplice)",
 *   createdAt: "ISO date string"
 * }
 */

/**
 * Restituisce l'array di tutti gli utenti dal localStorage.
 */
function getAllUsers() {
  const users = loadFromStorage(LS_KEYS.USERS, []);
  return Array.isArray(users) ? users : [];
}

/**
 * Salva l'array di utenti in localStorage.
 */
function saveAllUsers(users) {
  if (!Array.isArray(users)) return;
  saveToStorage(LS_KEYS.USERS, users);
}

/**
 * Trova un utente in base allo username (o email).
 */
function findUserByUsername(username) {
  const users = getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Aggiunge un nuovo utente se lo username non è già esistente.
 * Ritorna { ok: true, user } oppure { ok: false, error }
 */
function registerUser({ role, nome, cognome, username, password }) {
  const trimmedUsername = (username || "").trim();
  if (!trimmedUsername || !password) {
    return { ok: false, error: "Username e password sono obbligatori." };
  }

  const existing = findUserByUsername(trimmedUsername);
  if (existing) {
    return { ok: false, error: "Esiste già un utente con questo username." };
  }

  const users = getAllUsers();
  const newUser = {
    id: generateId("user"),
    role,
    nome: (nome || "").trim(),
    cognome: (cognome || "").trim(),
    username: trimmedUsername,
    password: password, // In futuro potresti sostituire con hash, qui va bene così.
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveAllUsers(users);

  return { ok: true, user: newUser };
}

/**
 * Controlla username + password e ritorna l'utente se valido.
 */
function authenticate(username, password) {
  const user = findUserByUsername(username || "");
  if (!user) {
    return { ok: false, error: "Utente non trovato." };
  }
  if (user.password !== password) {
    return { ok: false, error: "Password errata." };
  }
  return { ok: true, user };
}

/* =====================================================
   UTENTI DI DEFAULT: TITOLARE + FARMACIA
   ===================================================== */

/**
 * Inizializza gli utenti di default, se non esistono ancora:
 * - titolare / password: titolare123
 * - farmacia / password: farmacia123
 *
 * Questi NON passano dalla schermata di registrazione, sono pre-creati
 * e in futuro potrai far cambiare le password dalle impostazioni.
 */
function ensureDefaultUsers() {
  let users = getAllUsers();
  let changed = false;

  // Titolare di default
  if (!users.some(u => u.role === ROLES.TITOLARE)) {
    const titolareUser = {
      id: generateId("user"),
      role: ROLES.TITOLARE,
      nome: "Titolare",
      cognome: "Montesano",
      username: "titolare",      // login: titolare / titolare123
      password: "titolare123",
      createdAt: new Date().toISOString()
    };
    users.push(titolareUser);
    changed = true;
    logDebug("Creato utente di default Titolare");
  }

  // Farmacia di default (postazione banco)
  if (!users.some(u => u.role === ROLES.FARMACIA)) {
    const farmaciaUser = {
      id: generateId("user"),
      role: ROLES.FARMACIA,
      nome: "Farmacia",
      cognome: "Montesano",
      username: "farmacia",      // login: farmacia / farmacia123
      password: "farmacia123",
      createdAt: new Date().toISOString()
    };
    users.push(farmaciaUser);
    changed = true;
    logDebug("Creato utente di default Farmacia");
  }

  if (changed) {
    saveAllUsers(users);
  }
}

/* =====================================================
   IMPOSTAZIONI DI DEFAULT (FARMACIA, TEMA, ECC.)
   ===================================================== */

/**
 * Restituisce le impostazioni correnti (fm_settings).
 * Se non esistono, crea valori di default.
 */
function getSettings() {
  let settings = loadFromStorage(LS_KEYS.SETTINGS, null);
  if (!settings) {
    settings = {
      farmaciaNome: "Farmacia Montesano",
      farmaciaIndirizzo: "Via Esempio 123, 75100 Matera (MT)",
      farmaciaTelefono: "0835 000000",
      // Tema base: "light-premium" – in futuro potrai cambiare colori dinamicamente
      theme: "light-premium",
      // Config card cliente: eventi e promo possono usare queste impostazioni base
      cliente: {
        mostraEventi: true,
        mostraPromozioni: true
      }
    };
    saveToStorage(LS_KEYS.SETTINGS, settings);
  }
  return settings;
}

/**
 * Salva nuove impostazioni.
 */
function saveSettings(newSettings) {
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  saveToStorage(LS_KEYS.SETTINGS, merged);
}

/* =====================================================
   STRUTTURA DATI OPERATIVI (ASSENZE, ARRIVI, ECC.)
   ===================================================== */

/**
 * Restituisce la struttura completa dei dati "operativi".
 * Se non esiste, la inizializza con array vuoti.
 */
function getDataStore() {
  let data = loadFromStorage(LS_KEYS.DATA, null);
  if (!data) {
    data = {
      assenze: [],        // {id, nome, data, motivo}
      turni: {
        farmaciaTurno: "Farmacia Montesano – Via Esempio 123 – Tel: 0835 000000",
        farmaciaAppoggio: "Farmacia Centrale – Via Roma 10 – Tel: 0835 111111"
      },
      comunicazioni: [],  // {id, titolo, testo, autore, dataISO}
      procedure: [],      // {id, titolo, descrizione}
      arrivi: [],         // {id, data, fornitore, descrizione}
      scadenze: [],       // {id, descrizione, dataScadenza, note}
      scorte: [],         // {id, nome, quantita, minimo, note, bassa}
      cambioCassa: [],    // {id, data, turno, importi, note}
      eventiCliente: [],  // {id, titolo, data, descrizione}
      promoCliente: []    // {id, titolo, prezzo, descrizione, coloreBox, evidenza}
    };
    saveToStorage(LS_KEYS.DATA, data);
  }
  return data;
}

/**
 * Salva l'intero data store nel localStorage.
 */
function saveDataStore(data) {
  saveToStorage(LS_KEYS.DATA, data);
}

/* =====================================================
   SESSIONE UTENTE (LOGIN / LOGOUT)
   ===================================================== */

/**
 * Imposta la sessione con un utente loggato.
 */
function setSessionUser(user) {
  const session = {
    userId: user.id,
    loggedAt: new Date().toISOString()
  };
  saveToStorage(LS_KEYS.SESSION, session);
}

/**
 * Recupera l'utente attualmente in sessione (se esiste).
 */
function getSessionUser() {
  const session = loadFromStorage(LS_KEYS.SESSION, null);
  if (!session || !session.userId) return null;

  const users = getAllUsers();
  const user = users.find(u => u.id === session.userId) || null;
  return user;
}

/**
 * Cancella la sessione attuale (logout).
 */
function clearSession() {
  try {
    localStorage.removeItem(LS_KEYS.SESSION);
  } catch (err) {
    console.error("Errore durante il logout:", err);
  }
}

/* =====================================================
   GESTIONE VISTE / NAVIGAZIONE BASE
   ===================================================== */

// Riferimenti principali agli elementi del DOM (verranno riempiti su DOMContentLoaded)
let appShell = null;
let viewLanding = null;
let viewAuth = null;
let viewDashboardTitolare = null;
let viewDashboardFarmacia = null;
let viewDashboardCliente = null;

// Header / Nav
let navUserName = null;
let navUserRole = null;
let btnLogout = null;

// Form login / registrazione
let loginForm = null;
let loginErrorBox = null;

let registerForm = null;
let registerRoleSelect = null;
let registerErrorBox = null;

/**
 * Nasconde tutte le "view" principali e mostra solo quella passata.
 * Le view sono sezioni del tipo:
 *   <section class="app-view" id="view-...">...</section>
 */
function showView(viewElement) {
  const allViews = document.querySelectorAll(".app-view");
  allViews.forEach(v => v.classList.add("hidden"));
  if (viewElement) {
    viewElement.classList.remove("hidden");
  }
}

/**
 * Aggiorna il testo della barra in alto con nome utente e ruolo.
 */
function updateNavUserInfo(user) {
  if (!navUserName || !navUserRole) return;

  if (!user) {
    navUserName.textContent = "";
    navUserRole.textContent = "";
    return;
  }

  const fullName = [user.nome, user.cognome].filter(Boolean).join(" ") || user.username;
  navUserName.textContent = fullName;

  let roleLabel = "";
  switch (user.role) {
    case ROLES.TITOLARE:
      roleLabel = "Titolare";
      break;
    case ROLES.FARMACIA:
      roleLabel = "Farmacia (postazione banco)";
      break;
    case ROLES.DIPENDENTE:
      roleLabel = "Dipendente";
      break;
    case ROLES.CLIENTE:
      roleLabel = "Cliente";
      break;
    default:
      roleLabel = "Utente";
  }
  navUserRole.textContent = roleLabel;
}

/**
 * Mostra la dashboard corretta in base al ruolo dell'utente.
 */
function goToDashboardForRole(user) {
  if (!user) return;

  // Mostro il guscio dell'app (nav + main)
  if (appShell) {
    appShell.classList.remove("hidden");
  }

  // Nascondo eventuale view auth
  if (viewAuth) {
    viewAuth.classList.add("hidden");
  }
  if (viewLanding) {
    viewLanding.classList.add("hidden");
  }

  // Aggiorno la navbar
  updateNavUserInfo(user);

  // Mostro la dashboard corretta
  if (user.role === ROLES.TITOLARE) {
    showView(viewDashboardTitolare);
    // Funzione specifica che in futuro popolerà la dashboard titolare
    if (typeof renderDashboardTitolare === "function") {
      renderDashboardTitolare(user);
    }
  } else if (user.role === ROLES.FARMACIA || user.role === ROLES.DIPENDENTE) {
    showView(viewDashboardFarmacia);
    if (typeof renderDashboardFarmacia === "function") {
      renderDashboardFarmacia(user);
    }
  } else if (user.role === ROLES.CLIENTE) {
    showView(viewDashboardCliente);
    if (typeof renderDashboardCliente === "function") {
      renderDashboardCliente(user);
    }
  } else {
    // Ruolo non previsto -> fallback
    showView(viewDashboardFarmacia);
  }
}

/* =====================================================
   INIZIALIZZAZIONE DELL'APP (DOM READY)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  logDebug("Inizializzazione Portale Professionale – script.js PARTE 1/7");

  // 1) Garantisco che esistano Titolare e Farmacia di default
  ensureDefaultUsers();
  getSettings();   // inizializza impostazioni base
  getDataStore();  // inizializza struttura dati operativi

  // 2) Recupero riferimenti DOM principali
  appShell = document.getElementById("appShell");
  viewLanding = document.getElementById("view-landing");
  viewAuth = document.getElementById("view-auth");
  viewDashboardTitolare = document.getElementById("view-dashboard-titolare");
  viewDashboardFarmacia = document.getElementById("view-dashboard-farmacia");
  viewDashboardCliente = document.getElementById("view-dashboard-cliente");

  navUserName = document.getElementById("navUserName");
  navUserRole = document.getElementById("navUserRole");
  btnLogout = document.getElementById("btnLogout");

  loginForm = document.getElementById("loginForm");
  loginErrorBox = document.getElementById("loginErrorBox");

  registerForm = document.getElementById("registerForm");
  registerRoleSelect = document.getElementById("registerRole");
  registerErrorBox = document.getElementById("registerErrorBox");

  // 3) Se esiste una sessione attiva, mando subito l'utente nella sua dashboard
  const sessionUser = getSessionUser();
  if (sessionUser) {
    if (viewAuth) viewAuth.classList.add("hidden");
    if (viewLanding) viewLanding.classList.add("hidden");
    if (appShell) appShell.classList.remove("hidden");
    goToDashboardForRole(sessionUser);
  } else {
    // Nessun utente loggato: mostro schermata iniziale / auth
    if (appShell) appShell.classList.add("hidden");
    if (viewAuth) viewAuth.classList.remove("hidden");
    if (viewLanding) {
      // se hai una landing separata la mostri, altrimenti ignora
      viewLanding.classList.remove("hidden");
    }
  }

  // 4) Listener Logout
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      updateNavUserInfo(null);
      if (appShell) appShell.classList.add("hidden");
      if (viewAuth) viewAuth.classList.remove("hidden");
      if (viewLanding) viewLanding.classList.remove("hidden");
      showView(viewAuth);
    });
  }

  // Gli handler di login/registrazione, e tutte le logiche
  // specifiche delle pagine (assenze, arrivi, ecc.)
  // li aggiungiamo nelle PARTI successive di script.js.
});

// ======================================================
// SCRIPT.JS – PARTE 2/7
// Autenticazione: login, registrazione, switch viste
// ======================================================

/* =====================================================
   GESTIONE MODALITÀ LOGIN / REGISTRAZIONE
   ===================================================== */

// Riferimenti specifici per la vista auth (login/registrazione)
let authTabs = null;
let authTabLogin = null;
let authTabRegister = null;
let authBoxLogin = null;
let authBoxRegister = null;

// Pulsanti sulla landing iniziale (se presenti)
let btnLandingLogin = null;
let btnLandingRegister = null;

/**
 * Mostra la sezione LOGIN o REGISTRAZIONE nella view auth.
 * mode può essere "login" oppure "register".
 */
function showAuthMode(mode) {
  if (!authBoxLogin || !authBoxRegister) return;

  if (mode === "login") {
    authBoxLogin.classList.remove("hidden");
    authBoxRegister.classList.add("hidden");

    if (authTabLogin) authTabLogin.classList.add("active");
    if (authTabRegister) authTabRegister.classList.remove("active");
  } else {
    authBoxLogin.classList.add("hidden");
    authBoxRegister.classList.remove("hidden");

    if (authTabLogin) authTabLogin.classList.remove("active");
    if (authTabRegister) authTabRegister.classList.add("active");
  }

  // Pulisco eventuali messaggi di errore quando cambio scheda
  if (loginErrorBox) {
    loginErrorBox.textContent = "";
    loginErrorBox.classList.add("hidden");
  }
  if (registerErrorBox) {
    registerErrorBox.textContent = "";
    registerErrorBox.classList.add("hidden");
  }
}

/**
 * Inizializza tutti i riferimenti auth e i listener
 * (viene richiamata in DOMContentLoaded – parte 1).
 */
function initAuthArea() {
  authTabs = document.querySelectorAll(".auth-tab");
  authTabLogin = document.getElementById("authTabLogin");
  authTabRegister = document.getElementById("authTabRegister");
  authBoxLogin = document.getElementById("authLoginBox");
  authBoxRegister = document.getElementById("authRegisterBox");

  btnLandingLogin = document.getElementById("btnLandingLogin");
  btnLandingRegister = document.getElementById("btnLandingRegister");

  // Click sui tab "Login" / "Registrati" nella schermata auth
  if (authTabLogin) {
    authTabLogin.addEventListener("click", () => {
      showAuthMode("login");
    });
  }
  if (authTabRegister) {
    authTabRegister.addEventListener("click", () => {
      showAuthMode("register");
    });
  }

  // Pulsanti sulla landing (prima schermata) – se li hai nel tuo HTML
  if (btnLandingLogin) {
    btnLandingLogin.addEventListener("click", () => {
      if (viewAuth) viewAuth.classList.remove("hidden");
      showAuthMode("login");
      if (viewLanding) viewLanding.classList.add("hidden");
    });
  }
  if (btnLandingRegister) {
    btnLandingRegister.addEventListener("click", () => {
      if (viewAuth) viewAuth.classList.remove("hidden");
      showAuthMode("register");
      if (viewLanding) viewLanding.classList.add("hidden");
    });
  }

  // Di default mostro la modalità "login"
  showAuthMode("login");

  // Inizializzo i listener di login/registrazione
  initLoginForm();
  initRegisterForm();
}

/* =====================================================
   LOGIN
   ===================================================== */

/**
 * Inizializza il form di login:
 * - legge username + password
 * - chiama authenticate()
 * - in caso di successo salva sessione e apre dashboard corretta
 */
function initLoginForm() {
  if (!loginForm) return;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (loginErrorBox) {
      loginErrorBox.textContent = "";
      loginErrorBox.classList.add("hidden");
    }

    const inputUsername = loginForm.querySelector("input[name='loginUsername']");
    const inputPassword = loginForm.querySelector("input[name='loginPassword']");

    const username = inputUsername ? inputUsername.value.trim() : "";
    const password = inputPassword ? inputPassword.value : "";

    if (!username || !password) {
      if (loginErrorBox) {
        loginErrorBox.textContent = "Inserisci username e password.";
        loginErrorBox.classList.remove("hidden");
      }
      return;
    }

    const result = authenticate(username, password);
    if (!result.ok) {
      if (loginErrorBox) {
        loginErrorBox.textContent = result.error || "Credenziali non valide.";
        loginErrorBox.classList.remove("hidden");
      }
      return;
    }

    const user = result.user;
    setSessionUser(user);
    updateNavUserInfo(user);

    // Mostro il guscio app e vado alla dashboard giusta
    if (appShell) appShell.classList.remove("hidden");
    if (viewAuth) viewAuth.classList.add("hidden");
    if (viewLanding) viewLanding.classList.add("hidden");

    goToDashboardForRole(user);

    // resetto i campi del form
    loginForm.reset();
  });
}

/* =====================================================
   REGISTRAZIONE (DIPENDENTE / CLIENTE)
   ===================================================== */

/**
 * Inizializza il form di registrazione:
 * - consente di creare UTENTI di tipo DIPENDENTE o CLIENTE
 * - Titolare e Farmacia NON passano mai da qui (sono creati in ensureDefaultUsers)
 */
function initRegisterForm() {
  if (!registerForm) return;

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (registerErrorBox) {
      registerErrorBox.textContent = "";
      registerErrorBox.classList.add("hidden");
    }

    const roleSelect = registerRoleSelect;
    const nomeInput = registerForm.querySelector("input[name='regNome']");
    const cognomeInput = registerForm.querySelector("input[name='regCognome']");
    const usernameInput = registerForm.querySelector("input[name='regUsername']");
    const passwordInput = registerForm.querySelector("input[name='regPassword']");

    const selectedRole = roleSelect ? roleSelect.value : ROLES.CLIENTE;
    const nome = nomeInput ? nomeInput.value.trim() : "";
    const cognome = cognomeInput ? cognomeInput.value.trim() : "";
    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    // Regola: da questa schermata si possono creare SOLO Dipendente o Cliente
    if (![ROLES.DIPENDENTE, ROLES.CLIENTE].includes(selectedRole)) {
      if (registerErrorBox) {
        registerErrorBox.textContent = "Puoi registrare solo Dipendenti o Clienti.";
        registerErrorBox.classList.remove("hidden");
      }
      return;
    }

    if (!nome || !cognome || !username || !password) {
      if (registerErrorBox) {
        registerErrorBox.textContent = "Compila tutti i campi richiesti.";
        registerErrorBox.classList.remove("hidden");
      }
      return;
    }

    const result = registerUser({
      role: selectedRole,
      nome,
      cognome,
      username,
      password
    });

    if (!result.ok) {
      if (registerErrorBox) {
        registerErrorBox.textContent = result.error || "Errore in registrazione.";
        registerErrorBox.classList.remove("hidden");
      }
      return;
    }

    // Registrazione andata a buon fine: facoltativamente effettuiamo login diretto
    const newUser = result.user;
    setSessionUser(newUser);
    updateNavUserInfo(newUser);

    if (appShell) appShell.classList.remove("hidden");
    if (viewAuth) viewAuth.classList.add("hidden");
    if (viewLanding) viewLanding.classList.add("hidden");

    goToDashboardForRole(newUser);

    // Reset del form dopo la registrazione
    registerForm.reset();

    // Dopo la registrazione potremmo anche mostrare un messaggio toast (TODO)
    logDebug("Nuovo utente registrato:", newUser);
  });
}

/* =====================================================
   AGGANCIO INIT AUTH DOPO DOMCONTENTLOADED
   ===================================================== */

// Estendo il listener già definito nella PARTE 1
document.addEventListener("DOMContentLoaded", () => {
  // Nel listener precedente (parte 1) abbiamo già fatto:
  // - ensureDefaultUsers()
  // - getSettings()
  // - getDataStore()
  // - recupero sessione
  // Qui ci assicuriamo solo di inizializzare la parte AUTH
  initAuthArea();
});

// ======================================================
// SCRIPT.JS – PARTE 3/7
// Gestione view principali + dashboard per ruolo
// ======================================================

/* =====================================================
   RIFERIMENTI A SEZIONI / VISTE PRINCIPALI
   ===================================================== */

// Ogni "vista" (dashboard o pagina interna) avrà in HTML
// una sezione <section> con class="app-view" e un id unico.
// Qui memorizziamo i riferimenti principali:

let viewOwnerDashboard = null;     // Dashboard Titolare
let viewPharmacyDashboard = null;  // Dashboard Farmacia/Dipendenti
let viewClientDashboard = null;    // Dashboard Cliente

// In futuro: viste di dettaglio titolare (assenze, turni, ecc.)
let viewOwnerAssenze = null;
let viewOwnerTurni = null;
let viewOwnerComunicazioni = null;
let viewOwnerProcedure = null;
let viewOwnerArrivi = null;
let viewOwnerScadenze = null;
let viewOwnerScorte = null;
let viewOwnerCambioCassa = null;
let viewOwnerArchivio = null;

// Viste simili per farmacia/dipendenti (possono riutilizzare alcune del titolare
// oppure avere sezioni dedicate se preferisci separarle)
let viewPharmacyAssenze = null;
let viewPharmacyTurni = null;
let viewPharmacyComunicazioni = null;
let viewPharmacyProcedure = null;
let viewPharmacyArrivi = null;
let viewPharmacyScadenze = null;
let viewPharmacyScorte = null;
let viewPharmacyCambioCassa = null;
let viewPharmacyArchivio = null;

// Viste dedicate al cliente (sezioni semplici)
let viewClientEventi = null;
let viewClientPromozioni = null;
let viewClientTurni = null;

/**
 * Inizializza i riferimenti alle view principali.
 * Viene chiamata dopo DOMContentLoaded, quando l'HTML è pronto.
 */
function initMainViews() {
  // Dashboard principali
  viewOwnerDashboard = document.getElementById("viewOwnerDashboard");
  viewPharmacyDashboard = document.getElementById("viewPharmacyDashboard");
  viewClientDashboard = document.getElementById("viewClientDashboard");

  // Sezioni titolare (dettaglio cards)
  viewOwnerAssenze = document.getElementById("viewOwnerAssenze");
  viewOwnerTurni = document.getElementById("viewOwnerTurni");
  viewOwnerComunicazioni = document.getElementById("viewOwnerComunicazioni");
  viewOwnerProcedure = document.getElementById("viewOwnerProcedure");
  viewOwnerArrivi = document.getElementById("viewOwnerArrivi");
  viewOwnerScadenze = document.getElementById("viewOwnerScadenze");
  viewOwnerScorte = document.getElementById("viewOwnerScorte");
  viewOwnerCambioCassa = document.getElementById("viewOwnerCambioCassa");
  viewOwnerArchivio = document.getElementById("viewOwnerArchivio");

  // Sezioni farmacia/dipendente
  viewPharmacyAssenze = document.getElementById("viewPharmacyAssenze");
  viewPharmacyTurni = document.getElementById("viewPharmacyTurni");
  viewPharmacyComunicazioni = document.getElementById("viewPharmacyComunicazioni");
  viewPharmacyProcedure = document.getElementById("viewPharmacyProcedure");
  viewPharmacyArrivi = document.getElementById("viewPharmacyArrivi");
  viewPharmacyScadenze = document.getElementById("viewPharmacyScadenze");
  viewPharmacyScorte = document.getElementById("viewPharmacyScorte");
  viewPharmacyCambioCassa = document.getElementById("viewPharmacyCambioCassa");
  viewPharmacyArchivio = document.getElementById("viewPharmacyArchivio");

  // Sezioni cliente
  viewClientEventi = document.getElementById("viewClientEventi");
  viewClientPromozioni = document.getElementById("viewClientPromozioni");
  viewClientTurni = document.getElementById("viewClientTurni");
}

/* =====================================================
   MOSTRARE / NASCONDERE LE VIEW DELL'APP
   ===================================================== */

/**
 * Nasconde tutte le view principali dell'applicazione
 * (tutte le sezioni con class="app-view").
 */
function hideAllAppViews() {
  const allViews = document.querySelectorAll(".app-view");
  allViews.forEach((v) => v.classList.add("hidden"));
}

/**
 * Mostra una singola view della app (dashboard o pagina interna).
 * Accetta direttamente il nodo DOM della view.
 */
function showAppView(viewElement) {
  if (!viewElement) return;
  hideAllAppViews();
  viewElement.classList.remove("hidden");
  // Scroll automatico in alto quando apro una nuova view
  window.scrollTo({ top: 0, behavior: "instant" });
}

/**
 * Wrapper comodo: mostra una view a partire dal suo id.
 */
function showViewById(viewId) {
  if (!viewId) return;
  const el = document.getElementById(viewId);
  if (!el) {
    logDebug("showViewById: view non trovata:", viewId);
    return;
  }
  showAppView(el);
}

/* =====================================================
   FUNZIONI PER APRIRE LE DASHBOARD PER RUOLO
   (usate da goToDashboardForRole definita nella parte 1)
   ===================================================== */

/**
 * Dashboard per il TITOLARE.
 * Viene richiamata da goToDashboardForRole(user) se user.role === ROLES.TITOLARE.
 */
function showOwnerDashboard() {
  if (!appShell) return;

  // Mostro il guscio principale (nav + contenuto)
  appShell.classList.remove("hidden");

  // Mostro la dashboard titolare
  if (viewOwnerDashboard) {
    showAppView(viewOwnerDashboard);
  }

  // Imposto eventuali testi di intestazione
  const headerTitle = document.getElementById("mainHeaderTitle");
  const headerSubtitle = document.getElementById("mainHeaderSubtitle");
  if (headerTitle) headerTitle.textContent = "Dashboard Titolare";
  if (headerSubtitle) {
    headerSubtitle.textContent = "Controllo completo della Farmacia Montesano";
  }

  // In futuro qui possiamo aggiungere:
  // - refresh rapido dei counters
  // - badge notifiche
  // - riepiloghi veloci
}

/**
 * Dashboard per la FARMACIA / DIPENDENTI.
 * Usata quando role === ROLES.FARMACIA oppure role === ROLES.DIPENDENTE.
 */
function showPharmacyDashboard() {
  if (!appShell) return;
  appShell.classList.remove("hidden");

  if (viewPharmacyDashboard) {
    showAppView(viewPharmacyDashboard);
  }

  const headerTitle = document.getElementById("mainHeaderTitle");
  const headerSubtitle = document.getElementById("mainHeaderSubtitle");
  if (headerTitle) headerTitle.textContent = "Dashboard Farmacia";
  if (headerSubtitle) {
    headerSubtitle.textContent = "Operatività quotidiana in Banco e Retro";
  }

  // Qui in futuro:
  // - refresh vista assenti
  // - card con turni e comunicazioni aggiornate
}

/**
 * Dashboard per il CLIENTE.
 * Usata quando role === ROLES.CLIENTE.
 */
function showClientDashboard() {
  if (!appShell) return;
  appShell.classList.remove("hidden");

  if (viewClientDashboard) {
    showAppView(viewClientDashboard);
  }

  const headerTitle = document.getElementById("mainHeaderTitle");
  const headerSubtitle = document.getElementById("mainHeaderSubtitle");
  if (headerTitle) headerTitle.textContent = "Area Cliente";
  if (headerSubtitle) {
    headerSubtitle.textContent = "Eventi, promozioni e informazioni utili";
  }

  // In futuro:
  // - caricare eventi
  // - caricare promozioni
  // - mostrare farmacia di turno
}

/* =====================================================
   NAVIGAZIONE DAL MENU (NAVBAR / SIDEBAR)
   ===================================================== */

/**
 * Inizializza il menu di navigazione principale:
 * - link alle dashboard
 * - link ad alcune pagine chiave (es. Impostazioni)
 */
function initMainNavigation() {
  if (!appNav) return;

  // Esempio di elementi nella navbar:
  // <button id="navOwnerDashboard">Titolare</button>
  // <button id="navPharmacyDashboard">Farmacia</button>
  // <button id="navClientDashboard">Cliente</button>
  //
  // Se nel tuo HTML hai nomi diversi, basta cambiare gli id qui.

  const navOwnerDashboard = document.getElementById("navOwnerDashboard");
  const navPharmacyDashboard = document.getElementById("navPharmacyDashboard");
  const navClientDashboard = document.getElementById("navClientDashboard");

  if (navOwnerDashboard) {
    navOwnerDashboard.addEventListener("click", () => {
      const dummyOwner = {
        username: "titolare",
        role: ROLES.TITOLARE,
        nome: "Titolare",
        cognome: "Farmacia"
      };
      setSessionUser(dummyOwner);
      updateNavUserInfo(dummyOwner);
      showOwnerDashboard();
    });
  }

  if (navPharmacyDashboard) {
    navPharmacyDashboard.addEventListener("click", () => {
      const dummyPharma = {
        username: "farmacia",
        role: ROLES.FARMACIA,
        nome: "Farmacia",
        cognome: "Montesano"
      };
      setSessionUser(dummyPharma);
      updateNavUserInfo(dummyPharma);
      showPharmacyDashboard();
    });
  }

  if (navClientDashboard) {
    navClientDashboard.addEventListener("click", () => {
      const dummyClient = {
        username: "ospite",
        role: ROLES.CLIENTE,
        nome: "Cliente",
        cognome: "Ospite"
      };
      setSessionUser(dummyClient);
      updateNavUserInfo(dummyClient);
      showClientDashboard();
    });
  }

  // Link "Impostazioni" (solo esempio, verrà completato dopo)
  const navSettings = document.getElementById("navSettings");
  if (navSettings) {
    navSettings.addEventListener("click", () => {
      // Mostreremo una view apposita per le impostazioni del titolare
      showViewById("viewSettings");
    });
  }
}

/* =====================================================
   DOMCONTENTLOADED – INIT DELLA PARTE 3
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Inizializzo riferimenti alle view principali
  initMainViews();

  // Inizializzo navigazione principale
  initMainNavigation();

  // Se esiste un utente già loggato (gestito nella parte 1),
  // lo portiamo direttamente alla sua dashboard (goToDashboardForRole)
  const currentUser = getSessionUser();
  if (currentUser) {
    goToDashboardForRole(currentUser);
  }
});

// ======================================================
// SCRIPT.JS – PARTE 4/7
// Dati applicativi Titolare: Assenze, Turni, Comunicazioni
// ======================================================

/* =====================================================
   CHIAVI DI STORAGE PER I DATI DI GESTIONE
   ===================================================== */

// Assenti oggi / storico assenze personale
const KEY_ASSENZE = "fm_assenti_personale";

// Informazioni farmacia di turno / appoggio
const KEY_TURNI_INFO = "fm_turni_info";

// Comunicazioni interne
const KEY_COMUNICAZIONI = "fm_comunicazioni";

/* =====================================================
   HELPER GENERICI PER LOCALSTORAGE
   ===================================================== */

/**
 * Carica un array da localStorage.
 * Se non esiste nulla, ritorna [].
 */
function loadArrayFromStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    logDebug("Errore loadArrayFromStorage per chiave", key, err);
    return [];
  }
}

/**
 * Salva un array in localStorage in modo sicuro.
 */
function saveArrayToStorage(key, arr) {
  try {
    const serialized = JSON.stringify(arr || []);
    window.localStorage.setItem(key, serialized);
  } catch (err) {
    logDebug("Errore saveArrayFromStorage per chiave", key, err);
  }
}

/**
 * Carica un oggetto da localStorage.
 * Se non esiste, ritorna defaultValue (o {}).
 */
function loadObjectFromStorage(key, defaultValue = {}) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : defaultValue;
  } catch (err) {
    logDebug("Errore loadObjectFromStorage per chiave", key, err);
    return defaultValue;
  }
}

/**
 * Salva un oggetto in localStorage.
 */
function saveObjectToStorage(key, obj) {
  try {
    const serialized = JSON.stringify(obj || {});
    window.localStorage.setItem(key, serialized);
  } catch (err) {
    logDebug("Errore saveObjectToStorage per chiave", key, err);
  }
}

/* =====================================================
   ASSENZE – DATI + FUNZIONI TITOLARE
   ===================================================== */

// Riferimenti DOM (inizializzati in initOwnerSections())
let ownerAssenzeTableBody = null;
let ownerAssenzeForm = null;
let ownerAssenzeNomeInput = null;
let ownerAssenzeDataInput = null;
let ownerAssenzeMotivoInput = null;
let ownerAssenzeEmptyState = null;

/**
 * Ritorna l'elenco aggiornato delle assenze (array).
 */
function getAssenzeList() {
  return loadArrayFromStorage(KEY_ASSENZE);
}

/**
 * Salva l'elenco assenze.
 */
function setAssenzeList(list) {
  saveArrayToStorage(KEY_ASSENZE, list);
}

/**
 * Aggiunge una nuova assenza.
 */
function addAssenza({ nome, data, motivo }) {
  const list = getAssenzeList();
  const newItem = {
    id: Date.now(), // id semplice
    nome: nome.trim(),
    data: data.trim(),
    motivo: motivo.trim()
  };
  list.push(newItem);
  setAssenzeList(list);
}

/**
 * Inizializza la sezione "Assenti oggi" del Titolare.
 */
function initOwnerAssenzeSection() {
  if (!viewOwnerAssenze) return;

  ownerAssenzeTableBody = document.getElementById("ownerAssenzeTableBody");
  ownerAssenzeForm = document.getElementById("ownerAssenzeForm");
  ownerAssenzeNomeInput = document.getElementById("ownerAssenzeNome");
  ownerAssenzeDataInput = document.getElementById("ownerAssenzeData");
  ownerAssenzeMotivoInput = document.getElementById("ownerAssenzeMotivo");
  ownerAssenzeEmptyState = document.getElementById("ownerAssenzeEmptyState");

  // Se non ci sono assenze salvate, inizializzo qualche dato demo
  const currentList = getAssenzeList();
  if (!currentList || currentList.length === 0) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10); // AAAA-MM-GG
    const demo = [
      { id: Date.now(), nome: "Cosimo", data: iso, motivo: "Ferie" },
      {
        id: Date.now() + 1,
        nome: "Patrizia",
        data: iso,
        motivo: "Visita medica"
      }
    ];
    setAssenzeList(demo);
  }

  // Se esiste il form, aggancio l'evento submit
  if (ownerAssenzeForm) {
    ownerAssenzeForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const nomeVal = (ownerAssenzeNomeInput?.value || "").trim();
      const dataVal = (ownerAssenzeDataInput?.value || "").trim();
      const motivoVal = (ownerAssenzeMotivoInput?.value || "").trim();

      if (!nomeVal || !dataVal) {
        alert("Inserisci almeno NOME e DATA per l'assenza.");
        return;
      }

      addAssenza({
        nome: nomeVal,
        data: dataVal,
        motivo: motivoVal || "Non specificato"
      });

      if (ownerAssenzeForm) ownerAssenzeForm.reset();
      renderOwnerAssenzeTable();
    });
  }

  // Prima renderizzazione tabella
  renderOwnerAssenzeTable();
}

/**
 * Renderizza la tabella delle assenze nella pagina Titolare.
 */
function renderOwnerAssenzeTable() {
  if (!ownerAssenzeTableBody) return;

  const list = getAssenzeList().sort((a, b) => {
    return a.data.localeCompare(b.data);
  });

  ownerAssenzeTableBody.innerHTML = "";

  if (!list.length) {
    if (ownerAssenzeEmptyState) {
      ownerAssenzeEmptyState.classList.remove("hidden");
    }
    return;
  }

  if (ownerAssenzeEmptyState) {
    ownerAssenzeEmptyState.classList.add("hidden");
  }

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = item.nome;

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.data || "");

    const tdMotivo = document.createElement("td");
    tdMotivo.textContent = item.motivo || "–";

    tr.appendChild(tdNome);
    tr.appendChild(tdData);
    tr.appendChild(tdMotivo);

    ownerAssenzeTableBody.appendChild(tr);
  });
}

/* =====================================================
   TURNI FARMACIA / APPORGIO – DATI + FUNZIONI TITOLARE
   ===================================================== */

// Riferimenti DOM sezione turni titolare
let ownerTurniForm = null;
let ownerTurniFarmaciaNome = null;
let ownerTurniFarmaciaIndirizzo = null;
let ownerTurniFarmaciaTelefono = null;
let ownerTurniAppoggioNome = null;
let ownerTurniAppoggioIndirizzo = null;
let ownerTurniAppoggioTelefono = null;

// Riferimenti anche a qualche elemento di sola lettura (riassunto)
let ownerTurniSummaryFarmacia = null;
let ownerTurniSummaryAppoggio = null;

/**
 * Ritorna le info turno/appoggio.
 */
function getTurniInfo() {
  const defaults = {
    farmaciaNome: "Farmacia Montesano",
    farmaciaIndirizzo: "Via Esempio 12, Matera",
    farmaciaTelefono: "0835 000000",
    appoggioNome: "Farmacia Centrale",
    appoggioIndirizzo: "Via Dante 8, Matera",
    appoggioTelefono: "0835 111111"
  };
  return loadObjectFromStorage(KEY_TURNI_INFO, defaults);
}

/**
 * Salva le info turno/appoggio.
 */
function setTurniInfo(info) {
  saveObjectToStorage(KEY_TURNI_INFO, info);
}

/**
 * Inizializza la sezione "Farmacia di turno / appoggio" per Titolare.
 */
function initOwnerTurniSection() {
  if (!viewOwnerTurni) return;

  ownerTurniForm = document.getElementById("ownerTurniForm");
  ownerTurniFarmaciaNome = document.getElementById("ownerTurniFarmaciaNome");
  ownerTurniFarmaciaIndirizzo = document.getElementById("ownerTurniFarmaciaIndirizzo");
  ownerTurniFarmaciaTelefono = document.getElementById("ownerTurniFarmaciaTelefono");
  ownerTurniAppoggioNome = document.getElementById("ownerTurniAppoggioNome");
  ownerTurniAppoggioIndirizzo = document.getElementById("ownerTurniAppoggioIndirizzo");
  ownerTurniAppoggioTelefono = document.getElementById("ownerTurniAppoggioTelefono");

  ownerTurniSummaryFarmacia = document.getElementById("ownerTurniSummaryFarmacia");
  ownerTurniSummaryAppoggio = document.getElementById("ownerTurniSummaryAppoggio");

  // Carico i dati correnti
  const info = getTurniInfo();

  // Pre-compilo il form
  if (ownerTurniFarmaciaNome) ownerTurniFarmaciaNome.value = info.farmaciaNome || "";
  if (ownerTurniFarmaciaIndirizzo) ownerTurniFarmaciaIndirizzo.value = info.farmaciaIndirizzo || "";
  if (ownerTurniFarmaciaTelefono) ownerTurniFarmaciaTelefono.value = info.farmaciaTelefono || "";
  if (ownerTurniAppoggioNome) ownerTurniAppoggioNome.value = info.appoggioNome || "";
  if (ownerTurniAppoggioIndirizzo) ownerTurniAppoggioIndirizzo.value = info.appoggioIndirizzo || "";
  if (ownerTurniAppoggioTelefono) ownerTurniAppoggioTelefono.value = info.appoggioTelefono || "";

  // Renderizzo il riassunto (box info visibile anche in altre pagine)
  renderTurniSummary();

  // Gestione submit form
  if (ownerTurniForm) {
    ownerTurniForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const updated = {
        farmaciaNome: ownerTurniFarmaciaNome?.value || "",
        farmaciaIndirizzo: ownerTurniFarmaciaIndirizzo?.value || "",
        farmaciaTelefono: ownerTurniFarmaciaTelefono?.value || "",
        appoggioNome: ownerTurniAppoggioNome?.value || "",
        appoggioIndirizzo: ownerTurniAppoggioIndirizzo?.value || "",
        appoggioTelefono: ownerTurniAppoggioTelefono?.value || ""
      };

      setTurniInfo(updated);
      renderTurniSummary();

      alert("✅ Dati farmacia di turno / appoggio salvati (localStorage).");
    });
  }
}

/**
 * Aggiorna i box di riepilogo "Farmacia di turno" e "Farmacia di appoggio".
 * Verrà riutilizzato anche nelle dashboard Farmacia e Cliente.
 */
function renderTurniSummary() {
  const info = getTurniInfo();

  if (ownerTurniSummaryFarmacia) {
    ownerTurniSummaryFarmacia.innerHTML = `
      <strong>${info.farmaciaNome}</strong><br>
      ${info.farmaciaIndirizzo}<br>
      Tel: ${info.farmaciaTelefono}
    `;
  }

  if (ownerTurniSummaryAppoggio) {
    ownerTurniSummaryAppoggio.innerHTML = `
      <strong>${info.appoggioNome}</strong><br>
      ${info.appoggioIndirizzo}<br>
      Tel: ${info.appoggioTelefono}
    `;
  }

  // In futuro: possiamo aggiornare anche elementi della dashboard farmacia/cliente
}

/* =====================================================
   COMUNICAZIONI – DATI + FUNZIONI TITOLARE
   ===================================================== */

// Riferimenti DOM per la bacheca comunicazioni
let ownerComunicazioniList = null;
let ownerComunicazioniForm = null;
let ownerComunicazioniTitolo = null;
let ownerComunicazioniTesto = null;
let ownerComunicazioniVisibileFarmacia = null;
let ownerComunicazioniVisibileClienti = null;
let ownerComunicazioniEmptyState = null;

/**
 * Ottiene l'elenco delle comunicazioni.
 */
function getComunicazioniList() {
  return loadArrayFromStorage(KEY_COMUNICAZIONI);
}

/**
 * Salva la lista comunicazioni.
 */
function setComunicazioniList(list) {
  saveArrayToStorage(KEY_COMUNICAZIONI, list);
}

/**
 * Aggiunge una nuova comunicazione.
 */
function addComunicazione({ titolo, testo, visFarmacia, visClienti }) {
  const list = getComunicazioniList();
  const now = new Date();
  const dataISO = now.toISOString();
  const prettyDate = formatDateIT(dataISO.slice(0, 10));

  const currentUser = getSessionUser();
  const autore = currentUser
    ? `${currentUser.nome || ""} ${currentUser.cognome || ""}`.trim() ||
      currentUser.username ||
      "Titolare"
    : "Titolare";

  const newItem = {
    id: Date.now(),
    titolo: titolo.trim(),
    testo: testo.trim(),
    dataISO,
    data: prettyDate,
    autore,
    visibileFarmacia: !!visFarmacia,
    visibileClienti: !!visClienti
  };

  // Ultime comunicazioni in alto
  list.unshift(newItem);
  setComunicazioniList(list);
}

/**
 * Inizializza la sezione Comunicazioni del Titolare.
 */
function initOwnerComunicazioniSection() {
  if (!viewOwnerComunicazioni) return;

  ownerComunicazioniList = document.getElementById("ownerComunicazioniList");
  ownerComunicazioniForm = document.getElementById("ownerComunicazioniForm");
  ownerComunicazioniTitolo = document.getElementById("ownerComunicazioneTitolo");
  ownerComunicazioniTesto = document.getElementById("ownerComunicazioneTesto");
  ownerComunicazioniVisibileFarmacia = document.getElementById(
    "ownerComunicazioneVisibileFarmacia"
  );
  ownerComunicazioniVisibileClienti = document.getElementById(
    "ownerComunicazioneVisibileClienti"
  );
  ownerComunicazioniEmptyState = document.getElementById("ownerComunicazioniEmptyState");

  // Se non ci sono comunicazioni, preparo qualche esempio
  const current = getComunicazioniList();
  if (!current || current.length === 0) {
    const demo = [
      {
        id: Date.now(),
        titolo: "Aggiornamento orari natalizi",
        testo: "Dal 20/12 al 06/01 la farmacia seguirà l'orario continuato 8–20.",
        dataISO: new Date().toISOString(),
        data: formatDateIT(new Date().toISOString().slice(0, 10)),
        autore: "Titolare",
        visibileFarmacia: true,
        visibileClienti: true
      },
      {
        id: Date.now() + 1,
        titolo: "Inventario magazzino",
        testo:
          "Lunedì mattina dalle 8 alle 10 inventario rapido banco automedicazione.",
        dataISO: new Date().toISOString(),
        data: formatDateIT(new Date().toISOString().slice(0, 10)),
        autore: "Titolare",
        visibileFarmacia: true,
        visibileClienti: false
      }
    ];
    setComunicazioniList(demo);
  }

  // Gestione form invio nuova comunicazione
  if (ownerComunicazioniForm) {
    ownerComunicazioniForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const titoloVal = (ownerComunicazioniTitolo?.value || "").trim();
      const testoVal = (ownerComunicazioniTesto?.value || "").trim();
      const visFarmacia = !!ownerComunicazioniVisibileFarmacia?.checked;
      const visClienti = !!ownerComunicazioniVisibileClienti?.checked;

      if (!titoloVal || !testoVal) {
        alert("Inserisci almeno TITOLO e TESTO per la comunicazione.");
        return;
      }

      addComunicazione({
        titolo: titoloVal,
        testo: testoVal,
        visFarmacia,
        visClienti
      });

      ownerComunicazioniForm.reset();
      renderOwnerComunicazioniList();
    });
  }

  // Prima renderizzazione lista
  renderOwnerComunicazioniList();
}

/**
 * Renderizza la lista delle comunicazioni in modalità Titolare.
 */
function renderOwnerComunicazioniList() {
  if (!ownerComunicazioniList) return;

  const list = getComunicazioniList();
  ownerComunicazioniList.innerHTML = "";

  if (!list.length) {
    if (ownerComunicazioniEmptyState) {
      ownerComunicazioniEmptyState.classList.remove("hidden");
    }
    return;
  }
  if (ownerComunicazioniEmptyState) {
    ownerComunicazioniEmptyState.classList.add("hidden");
  }

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "com-card";

    const header = document.createElement("div");
    header.className = "com-card-header";

    const titleEl = document.createElement("h3");
    titleEl.className = "com-card-title";
    titleEl.textContent = item.titolo;

    const metaEl = document.createElement("div");
    metaEl.className = "com-card-meta";
    const visFarm = item.visibileFarmacia ? "Farmacia" : "";
    const visCli = item.visibileClienti ? "Clienti" : "";
    const visText = [visFarm, visCli].filter(Boolean).join(" · ") || "Solo titolare";
    metaEl.textContent = `${item.data} · ${item.autore} · ${visText}`;

    header.appendChild(titleEl);
    header.appendChild(metaEl);

    const body = document.createElement("p");
    body.className = "com-card-text";
    body.textContent = item.testo;

    card.appendChild(header);
    card.appendChild(body);

    ownerComunicazioniList.appendChild(card);
  });
}

/* =====================================================
   INIT SPECIFICO DELLE SEZIONI TITOLARE
   (viene eseguito dopo DOMContentLoaded)
   ===================================================== */

function initOwnerSections() {
  initOwnerAssenzeSection();
  initOwnerTurniSection();
  initOwnerComunicazioniSection();
}

// Aggiungo un altro listener DOMContentLoaded che si limita
// ad inizializzare le sezioni titolare (se esistono gli elementi).
document.addEventListener("DOMContentLoaded", () => {
  initOwnerSections();
});

// ======================================================
// SCRIPT.JS – PARTE 5/7
// Arrivi, Scadenze, Scorte, Cambio Cassa (Titolare)
// ======================================================

/* =====================================================
   CHIAVI STORAGE DATI GESTIONALI
   ===================================================== */

const KEY_ARRIVI = "fm_arrivi_logistica";
const KEY_SCADENZE_PRODOTTI = "fm_scadenze_prodotti";
const KEY_SCORTE = "fm_scorte_servizio";
const KEY_CAMBIO_CASSA = "fm_cambio_cassa";

/* =====================================================
   ARRIVI – DATI + FUNZIONI
   ===================================================== */

function getArriviList() {
  return loadArrayFromStorage(KEY_ARRIVI);
}

function setArriviList(list) {
  saveArrayToStorage(KEY_ARRIVI, list);
}

/**
 * Aggiunge un nuovo arrivo (consegna, espositore, corriere ecc.)
 */
function addArrivo({ data, descrizione, fornitore }) {
  const list = getArriviList();
  list.push({
    id: Date.now(),
    data: data.trim(),
    descrizione: descrizione.trim(),
    fornitore: fornitore.trim()
  });
  setArriviList(list);
}

// Riferimenti DOM sezione Arrivi Titolare
let ownerArriviForm = null;
let ownerArriviDataInput = null;
let ownerArriviDescrizioneInput = null;
let ownerArriviFornitoreInput = null;
let ownerArriviTableBody = null;
let ownerArriviEmptyState = null;

function initOwnerArriviSection() {
  if (!viewOwnerArrivi) return;

  ownerArriviForm = document.getElementById("ownerArriviForm");
  ownerArriviDataInput = document.getElementById("ownerArrivoData");
  ownerArriviDescrizioneInput = document.getElementById("ownerArrivoDescrizione");
  ownerArriviFornitoreInput = document.getElementById("ownerArrivoFornitore");
  ownerArriviTableBody = document.getElementById("ownerArriviTableBody");
  ownerArriviEmptyState = document.getElementById("ownerArriviEmptyState");

  // Dati demo se la lista è vuota
  const current = getArriviList();
  if (!current || current.length === 0) {
    const todayISO = new Date().toISOString().slice(0, 10);
    const demo = [
      {
        id: Date.now(),
        data: todayISO,
        descrizione: "Consegna espositore dermocosmesi + scatoloni promo",
        fornitore: "Unico"
      },
      {
        id: Date.now() + 1,
        data: todayISO,
        descrizione: "Ordine giornaliero + tamponi rapidi",
        fornitore: "Alliance"
      }
    ];
    setArriviList(demo);
  }

  // Gestione form
  if (ownerArriviForm) {
    ownerArriviForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const dataVal = (ownerArriviDataInput?.value || "").trim();
      const descVal = (ownerArriviDescrizioneInput?.value || "").trim();
      const fornVal = (ownerArriviFornitoreInput?.value || "").trim();

      if (!dataVal || !descVal) {
        alert("Inserisci almeno DATA e DESCRIZIONE dell'arrivo.");
        return;
      }

      addArrivo({
        data: dataVal,
        descrizione: descVal,
        fornitore: fornVal || "Non specificato"
      });

      ownerArriviForm.reset();
      renderOwnerArriviTable();
    });
  }

  renderOwnerArriviTable();
}

function renderOwnerArriviTable() {
  if (!ownerArriviTableBody) return;

  const list = getArriviList().sort((a, b) => a.data.localeCompare(b.data));

  ownerArriviTableBody.innerHTML = "";

  if (!list.length) {
    if (ownerArriviEmptyState) ownerArriviEmptyState.classList.remove("hidden");
    return;
  }
  if (ownerArriviEmptyState) ownerArriviEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.data || "");

    const tdFornitore = document.createElement("td");
    tdFornitore.textContent = item.fornitore || "–";

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione || "–";

    tr.appendChild(tdData);
    tr.appendChild(tdFornitore);
    tr.appendChild(tdDesc);

    ownerArriviTableBody.appendChild(tr);
  });
}

/* =====================================================
   SCADENZE – DATI + FUNZIONI
   ===================================================== */

function getScadenzeList() {
  return loadArrayFromStorage(KEY_SCADENZE_PRODOTTI);
}

function setScadenzeList(list) {
  saveArrayToStorage(KEY_SCADENZE_PRODOTTI, list);
}

/**
 * Aggiunge una nuova scadenza prodotto.
 */
function addScadenza({ descrizione, dataScadenza, note }) {
  const list = getScadenzeList();
  list.push({
    id: Date.now(),
    descrizione: descrizione.trim(),
    dataScadenza: dataScadenza.trim(),
    note: note.trim()
  });
  setScadenzeList(list);
}

/**
 * Ritorna true se la scadenza è entro 45 giorni da oggi.
 */
function isScadenzaCritica(isoDate) {
  if (!isoDate) return false;
  try {
    const today = new Date();
    const target = new Date(isoDate + "T00:00:00");
    const diffMs = target - today;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 45;
  } catch (err) {
    return false;
  }
}

// DOM scadenze titolare
let ownerScadenzeForm = null;
let ownerScadenzaDescrizioneInput = null;
let ownerScadenzaDataInput = null;
let ownerScadenzaNoteInput = null;
let ownerScadenzeTableBody = null;
let ownerScadenzeEmptyState = null;

function initOwnerScadenzeSection() {
  if (!viewOwnerScadenze) return;

  ownerScadenzeForm = document.getElementById("ownerScadenzeForm");
  ownerScadenzaDescrizioneInput = document.getElementById("ownerScadenzaDescrizione");
  ownerScadenzaDataInput = document.getElementById("ownerScadenzaData");
  ownerScadenzaNoteInput = document.getElementById("ownerScadenzaNote");
  ownerScadenzeTableBody = document.getElementById("ownerScadenzeTableBody");
  ownerScadenzeEmptyState = document.getElementById("ownerScadenzeEmptyState");

  // Dati demo se vuoto
  const current = getScadenzeList();
  if (!current || current.length === 0) {
    const today = new Date();
    const d1 = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);
    const d2 = new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000);

    const iso1 = d1.toISOString().slice(0, 10);
    const iso2 = d2.toISOString().slice(0, 10);

    const demo = [
      {
        id: Date.now(),
        descrizione: "Fermenti lattici bambini",
        dataScadenza: iso1,
        note: "Controllare rotazione scaffale"
      },
      {
        id: Date.now() + 1,
        descrizione: "Omeprazolo 20mg 28 cps",
        dataScadenza: iso2,
        note: "Backstock magazzino alto"
      }
    ];
    setScadenzeList(demo);
  }

  if (ownerScadenzeForm) {
    ownerScadenzeForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const descVal = (ownerScadenzaDescrizioneInput?.value || "").trim();
      const dataVal = (ownerScadenzaDataInput?.value || "").trim();
      const noteVal = (ownerScadenzaNoteInput?.value || "").trim();

      if (!descVal || !dataVal) {
        alert("Inserisci almeno DESCRIZIONE e DATA SCADENZA.");
        return;
      }

      addScadenza({
        descrizione: descVal,
        dataScadenza: dataVal,
        note: noteVal
      });

      ownerScadenzeForm.reset();
      renderOwnerScadenzeTable();
    });
  }

  renderOwnerScadenzeTable();
}

function renderOwnerScadenzeTable() {
  if (!ownerScadenzeTableBody) return;

  const list = getScadenzeList().sort((a, b) =>
    a.dataScadenza.localeCompare(b.dataScadenza)
  );

  ownerScadenzeTableBody.innerHTML = "";

  if (!list.length) {
    if (ownerScadenzeEmptyState) ownerScadenzeEmptyState.classList.remove("hidden");
    return;
  }
  if (ownerScadenzeEmptyState) ownerScadenzeEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione;

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.dataScadenza || "");

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    // Se scadenza entro 45 giorni, evidenzio la riga
    if (isScadenzaCritica(item.dataScadenza)) {
      tr.classList.add("row-scadenza-critica");
    }

    tr.appendChild(tdDesc);
    tr.appendChild(tdData);
    tr.appendChild(tdNote);

    ownerScadenzeTableBody.appendChild(tr);
  });
}

/* =====================================================
   SCORTE – DATI + FUNZIONI
   (prodotti di servizio: bicchieri, carta igienica ecc.)
   ===================================================== */

function getScorteList() {
  return loadArrayFromStorage(KEY_SCORTE);
}

function setScorteList(list) {
  saveArrayToStorage(KEY_SCORTE, list);
}

function addScorta({ descrizione, quantita, minimo, note }) {
  const list = getScorteList();
  list.push({
    id: Date.now(),
    descrizione: descrizione.trim(),
    quantita: Number(quantita) || 0,
    minimo: Number(minimo) || 0,
    note: note.trim()
  });
  setScorteList(list);
}

function segnaScortaBassa(scortaId) {
  const list = getScorteList();
  const found = list.find((s) => s.id === scortaId);
  if (found) {
    // Per ora semplicemente abbassiamo la quantità di 1
    found.quantita = Math.max(0, (Number(found.quantita) || 0) - 1);
    setScorteList(list);
  }
}

// DOM scorte titolare
let ownerScorteForm = null;
let ownerScortaDescrizioneInput = null;
let ownerScortaQuantitaInput = null;
let ownerScortaMinimoInput = null;
let ownerScortaNoteInput = null;
let ownerScorteTableBody = null;
let ownerScorteEmptyState = null;

function initOwnerScorteSection() {
  if (!viewOwnerScorte) return;

  ownerScorteForm = document.getElementById("ownerScorteForm");
  ownerScortaDescrizioneInput = document.getElementById("ownerScortaDescrizione");
  ownerScortaQuantitaInput = document.getElementById("ownerScortaQuantita");
  ownerScortaMinimoInput = document.getElementById("ownerScortaMinimo");
  ownerScortaNoteInput = document.getElementById("ownerScortaNote");
  ownerScorteTableBody = document.getElementById("ownerScorteTableBody");
  ownerScorteEmptyState = document.getElementById("ownerScorteEmptyState");

  // Dati demo se vuoto
  const current = getScorteList();
  if (!current || current.length === 0) {
    const demo = [
      {
        id: Date.now(),
        descrizione: "Bicchierini monouso",
        quantita: 500,
        minimo: 200,
        note: "Usati per acqua e sciroppi"
      },
      {
        id: Date.now() + 1,
        descrizione: "Rotoli POS",
        quantita: 8,
        minimo: 5,
        note: "Banco 1 + Banco 2"
      },
      {
        id: Date.now() + 2,
        descrizione: "Carta igienica",
        quantita: 12,
        minimo: 6,
        note: "Bagno clienti + bagno personale"
      }
    ];
    setScorteList(demo);
  }

  if (ownerScorteForm) {
    ownerScorteForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const descVal = (ownerScortaDescrizioneInput?.value || "").trim();
      const qtyVal = (ownerScortaQuantitaInput?.value || "").trim();
      const minVal = (ownerScortaMinimoInput?.value || "").trim();
      const noteVal = (ownerScortaNoteInput?.value || "").trim();

      if (!descVal) {
        alert("Inserisci la DESCRIZIONE della scorta.");
        return;
      }

      addScorta({
        descrizione: descVal,
        quantita: qtyVal,
        minimo: minVal,
        note: noteVal
      });

      ownerScorteForm.reset();
      renderOwnerScorteTable();
    });
  }

  renderOwnerScorteTable();
}

function renderOwnerScorteTable() {
  if (!ownerScorteTableBody) return;

  const list = getScorteList();

  ownerScorteTableBody.innerHTML = "";

  if (!list.length) {
    if (ownerScorteEmptyState) ownerScorteEmptyState.classList.remove("hidden");
    return;
  }
  if (ownerScorteEmptyState) ownerScorteEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione;

    const tdQty = document.createElement("td");
    tdQty.textContent = item.quantita ?? 0;

    const tdMin = document.createElement("td");
    tdMin.textContent = item.minimo ?? 0;

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    // Se quantità sotto il minimo, evidenzio
    if (Number(item.quantita) <= Number(item.minimo)) {
      tr.classList.add("row-scorta-bassa");
    }

    tr.appendChild(tdDesc);
    tr.appendChild(tdQty);
    tr.appendChild(tdMin);
    tr.appendChild(tdNote);

    ownerScorteTableBody.appendChild(tr);
  });
}

/* =====================================================
   CAMBIO CASSA – DATI + FUNZIONI
   ===================================================== */

function getCambioCassaList() {
  return loadArrayFromStorage(KEY_CAMBIO_CASSA);
}

function setCambioCassaList(list) {
  saveArrayToStorage(KEY_CAMBIO_CASSA, list);
}

function addCambioCassa({ data, turno, importo, note }) {
  const list = getCambioCassaList();
  list.push({
    id: Date.now(),
    data: data.trim(),
    turno: turno.trim(),
    importo: importo.trim(),
    note: note.trim()
  });
  setCambioCassaList(list);
}

// DOM cambio cassa titolare
let ownerCambioForm = null;
let ownerCambioDataInput = null;
let ownerCambioTurnoInput = null;
let ownerCambioImportoInput = null;
let ownerCambioNoteInput = null;
let ownerCambioTableBody = null;
let ownerCambioEmptyState = null;

function initOwnerCambioCassaSection() {
  if (!viewOwnerCambioCassa) return;

  ownerCambioForm = document.getElementById("ownerCambioForm");
  ownerCambioDataInput = document.getElementById("ownerCambioData");
  ownerCambioTurnoInput = document.getElementById("ownerCambioTurno");
  ownerCambioImportoInput = document.getElementById("ownerCambioImporto");
  ownerCambioNoteInput = document.getElementById("ownerCambioNote");
  ownerCambioTableBody = document.getElementById("ownerCambioTableBody");
  ownerCambioEmptyState = document.getElementById("ownerCambioEmptyState");

  // Dati demo se vuoto
  const current = getCambioCassaList();
  if (!current || current.length === 0) {
    const iso = new Date().toISOString().slice(0, 10);
    const demo = [
      {
        id: Date.now(),
        data: iso,
        turno: "Mattina",
        importo: "Fondo cassa 250€",
        note: "Banco 1 + Banco 2"
      },
      {
        id: Date.now() + 1,
        data: iso,
        turno: "Pomeriggio",
        importo: "Cambio 50€ in monete",
        note: "Richiesta Banco 1"
      }
    ];
    setCambioCassaList(demo);
  }

  if (ownerCambioForm) {
    ownerCambioForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const dataVal = (ownerCambioDataInput?.value || "").trim();
      const turnoVal = (ownerCambioTurnoInput?.value || "").trim();
      const importoVal = (ownerCambioImportoInput?.value || "").trim();
      const noteVal = (ownerCambioNoteInput?.value || "").trim();

      if (!dataVal || !turnoVal) {
        alert("Inserisci almeno DATA e TURNO per il cambio cassa.");
        return;
      }

      addCambioCassa({
        data: dataVal,
        turno: turnoVal,
        importo: importoVal,
        note: noteVal
      });

      ownerCambioForm.reset();
      renderOwnerCambioCassaTable();
    });
  }

  renderOwnerCambioCassaTable();
}

function renderOwnerCambioCassaTable() {
  if (!ownerCambioTableBody) return;

  const list = getCambioCassaList().sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  ownerCambioTableBody.innerHTML = "";

  if (!list.length) {
    if (ownerCambioEmptyState) ownerCambioEmptyState.classList.remove("hidden");
    return;
  }
  if (ownerCambioEmptyState) ownerCambioEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.data || "");

    const tdTurno = document.createElement("td");
    tdTurno.textContent = item.turno || "–";

    const tdImporto = document.createElement("td");
    tdImporto.textContent = item.importo || "–";

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    tr.appendChild(tdData);
    tr.appendChild(tdTurno);
    tr.appendChild(tdImporto);
    tr.appendChild(tdNote);

    ownerCambioTableBody.appendChild(tr);
  });
}

/* =====================================================
   RIDEFINIZIONE initOwnerSections
   (aggiungo le nuove sezioni Arrivi / Scadenze / Scorte / Cambio)
   ===================================================== */

function initOwnerSections() {
  initOwnerAssenzeSection();
  initOwnerTurniSection();
  initOwnerComunicazioniSection();
  initOwnerArriviSection();
  initOwnerScadenzeSection();
  initOwnerScorteSection();
  initOwnerCambioCassaSection();
}
// ======================================================
// SCRIPT.JS – PARTE 6/7
// Farmacia / Dipendente: Arrivi, Scadenze, Scorte, Cambio Cassa
// ======================================================

/* =====================================================
   ARRIVI – VISTA FARMACIA / DIPENDENTE
   ===================================================== */

// DOM Farmacia Arrivi
let farmArriviForm = null;
let farmArrivoDescrizioneInput = null;
let farmArrivoFornitoreInput = null;
let farmArriviTableBody = null;
let farmArriviEmptyState = null;

/**
 * Inizializza sezione ARRIVI per Farmacia/Dipendenti.
 * Usa gli stessi dati del Titolare (KEY_ARRIVI).
 */
function initFarmaciaArriviSection() {
  farmArriviForm = document.getElementById("farmArriviForm");
  farmArrivoDescrizioneInput = document.getElementById("farmArrivoDescrizione");
  farmArrivoFornitoreInput = document.getElementById("farmArrivoFornitore");
  farmArriviTableBody = document.getElementById("farmArriviTableBody");
  farmArriviEmptyState = document.getElementById("farmArriviEmptyState");

  // Se non esiste la sezione nel DOM, esco (magari non è in questa pagina)
  if (!farmArriviTableBody) return;

  // Form "Segnala arrivo" – lato Farmacia
  if (farmArriviForm) {
    farmArriviForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const descVal = (farmArrivoDescrizioneInput?.value || "").trim();
      const fornVal = (farmArrivoFornitoreInput?.value || "").trim();

      if (!descVal) {
        alert("Inserisci almeno una DESCRIZIONE dell'arrivo.");
        return;
      }

      const todayIso = new Date().toISOString().slice(0, 10);

      addArrivo({
        data: todayIso,
        descrizione: descVal,
        fornitore: fornVal || "Non specificato"
      });

      farmArriviForm.reset();
      renderFarmaciaArriviTable();
    });
  }

  renderFarmaciaArriviTable();
}

/**
 * Render tabella degli arrivi per Farmacia/Dipendenti (sola lettura elenco).
 */
function renderFarmaciaArriviTable() {
  if (!farmArriviTableBody) return;

  const list = getArriviList().sort((a, b) => a.data.localeCompare(b.data));

  farmArriviTableBody.innerHTML = "";

  if (!list.length) {
    if (farmArriviEmptyState) farmArriviEmptyState.classList.remove("hidden");
    return;
  }
  if (farmArriviEmptyState) farmArriviEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.data || "");

    const tdFornitore = document.createElement("td");
    tdFornitore.textContent = item.fornitore || "–";

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione || "–";

    tr.appendChild(tdData);
    tr.appendChild(tdFornitore);
    tr.appendChild(tdDesc);

    farmArriviTableBody.appendChild(tr);
  });
}

/* =====================================================
   SCADENZE – VISTA FARMACIA / DIPENDENTE
   (lettura + possibilità di aggiungere o eliminare)
   ===================================================== */

let farmScadenzeForm = null;
let farmScadDescrizioneInput = null;
let farmScadDataInput = null;
let farmScadNoteInput = null;
let farmScadenzeTableBody = null;
let farmScadenzeEmptyState = null;

function initFarmaciaScadenzeSection() {
  farmScadenzeForm = document.getElementById("farmScadenzeForm");
  farmScadDescrizioneInput = document.getElementById("farmScadDescrizione");
  farmScadDataInput = document.getElementById("farmScadData");
  farmScadNoteInput = document.getElementById("farmScadNote");
  farmScadenzeTableBody = document.getElementById("farmScadenzeTableBody");
  farmScadenzeEmptyState = document.getElementById("farmScadenzeEmptyState");

  if (!farmScadenzeTableBody) return;

  if (farmScadenzeForm) {
    farmScadenzeForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const descVal = (farmScadDescrizioneInput?.value || "").trim();
      const dataVal = (farmScadDataInput?.value || "").trim();
      const noteVal = (farmScadNoteInput?.value || "").trim();

      if (!descVal || !dataVal) {
        alert("Inserisci almeno DESCRIZIONE e DATA SCADENZA.");
        return;
      }

      addScadenza({
        descrizione: descVal,
        dataScadenza: dataVal,
        note: noteVal
      });

      farmScadenzeForm.reset();
      renderFarmaciaScadenzeTable();
      // Aggiorno anche la vista del Titolare se aperta
      renderOwnerScadenzeTable && renderOwnerScadenzeTable();
    });
  }

  // Delego gestione click "Elimina" sulla tabella
  farmScadenzeTableBody.addEventListener("click", (evt) => {
    const btn = evt.target.closest("[data-scadenza-id]");
    if (!btn) return;

    const idStr = btn.getAttribute("data-scadenza-id");
    const scadId = Number(idStr);

    if (!scadId) return;
    if (!confirm("Vuoi eliminare questa scadenza dall'elenco?")) return;

    const list = getScadenzeList().filter((item) => item.id !== scadId);
    setScadenzeList(list);

    renderFarmaciaScadenzeTable();
    renderOwnerScadenzeTable && renderOwnerScadenzeTable();
  });

  renderFarmaciaScadenzeTable();
}

function renderFarmaciaScadenzeTable() {
  if (!farmScadenzeTableBody) return;

  const list = getScadenzeList().sort((a, b) =>
    a.dataScadenza.localeCompare(b.dataScadenza)
  );

  farmScadenzeTableBody.innerHTML = "";

  if (!list.length) {
    if (farmScadenzeEmptyState) farmScadenzeEmptyState.classList.remove("hidden");
    return;
  }
  if (farmScadenzeEmptyState) farmScadenzeEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione;

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.dataScadenza || "");

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    const tdAzioni = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-table-small btn-danger-ghost";
    btnDel.textContent = "Elimina";
    btnDel.setAttribute("data-scadenza-id", String(item.id));
    tdAzioni.appendChild(btnDel);

    if (isScadenzaCritica(item.dataScadenza)) {
      tr.classList.add("row-scadenza-critica");
    }

    tr.appendChild(tdDesc);
    tr.appendChild(tdData);
    tr.appendChild(tdNote);
    tr.appendChild(tdAzioni);

    farmScadenzeTableBody.appendChild(tr);
  });
}

/* =====================================================
   SCORTE – VISTA FARMACIA / DIPENDENTE
   (lettura + segnala scorta bassa + aggiungi semplice)
   ===================================================== */

let farmScorteForm = null;
let farmScortaDescrizioneInput = null;
let farmScortaNoteInput = null;
let farmScorteTableBody = null;
let farmScorteEmptyState = null;

function initFarmaciaScorteSection() {
  farmScorteForm = document.getElementById("farmScorteForm");
  farmScortaDescrizioneInput = document.getElementById("farmScortaDescrizione");
  farmScortaNoteInput = document.getElementById("farmScortaNote");
  farmScorteTableBody = document.getElementById("farmScorteTableBody");
  farmScorteEmptyState = document.getElementById("farmScorteEmptyState");

  if (!farmScorteTableBody) return;

  // Aggiunta scorte "veloce" (solo descrizione + note; quantità iniziale 0, minimo 1)
  if (farmScorteForm) {
    farmScorteForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const descVal = (farmScortaDescrizioneInput?.value || "").trim();
      const noteVal = (farmScortaNoteInput?.value || "").trim();

      if (!descVal) {
        alert("Inserisci la DESCRIZIONE della scorta da segnalare.");
        return;
      }

      addScorta({
        descrizione: descVal,
        quantita: 0,
        minimo: 1,
        note: noteVal
      });

      farmScorteForm.reset();
      renderFarmaciaScorteTable();
      renderOwnerScorteTable && renderOwnerScorteTable();
    });
  }

  // Delego click su "Segnala scorta bassa"
  farmScorteTableBody.addEventListener("click", (evt) => {
    const btn = evt.target.closest("[data-scorta-id]");
    if (!btn) return;

    const idStr = btn.getAttribute("data-scorta-id");
    const scortaId = Number(idStr);
    if (!scortaId) return;

    segnaScortaBassa(scortaId);
    renderFarmaciaScorteTable();
    renderOwnerScorteTable && renderOwnerScorteTable();
  });

  renderFarmaciaScorteTable();
}

function renderFarmaciaScorteTable() {
  if (!farmScorteTableBody) return;

  const list = getScorteList();

  farmScorteTableBody.innerHTML = "";

  if (!list.length) {
    if (farmScorteEmptyState) farmScorteEmptyState.classList.remove("hidden");
    return;
  }
  if (farmScorteEmptyState) farmScorteEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.descrizione;

    const tdQty = document.createElement("td");
    tdQty.textContent = item.quantita ?? 0;

    const tdMin = document.createElement("td");
    tdMin.textContent = item.minimo ?? 0;

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    const tdAzioni = document.createElement("td");
    const btnSegnala = document.createElement("button");
    btnSegnala.type = "button";
    btnSegnala.className = "btn-table-small btn-warning-ghost";
    btnSegnala.textContent = "Scorta bassa";
    btnSegnala.setAttribute("data-scorta-id", String(item.id));
    tdAzioni.appendChild(btnSegnala);

    // Evidenzio righe sotto minimo
    if (Number(item.quantita) <= Number(item.minimo)) {
      tr.classList.add("row-scorta-bassa");
    }

    tr.appendChild(tdDesc);
    tr.appendChild(tdQty);
    tr.appendChild(tdMin);
    tr.appendChild(tdNote);
    tr.appendChild(tdAzioni);

    farmScorteTableBody.appendChild(tr);
  });
}

/* =====================================================
   CAMBIO CASSA – VISTA FARMACIA / DIPENDENTE
   (segnala cambio cassa + storico)
   ===================================================== */

let farmCambioForm = null;
let farmCambioTurnoInput = null;
let farmCambioImportoInput = null;
let farmCambioNoteInput = null;
let farmCambioTableBody = null;
let farmCambioEmptyState = null;

function initFarmaciaCambioCassaSection() {
  farmCambioForm = document.getElementById("farmCambioForm");
  farmCambioTurnoInput = document.getElementById("farmCambioTurno");
  farmCambioImportoInput = document.getElementById("farmCambioImporto");
  farmCambioNoteInput = document.getElementById("farmCambioNote");
  farmCambioTableBody = document.getElementById("farmCambioTableBody");
  farmCambioEmptyState = document.getElementById("farmCambioEmptyState");

  if (!farmCambioTableBody) return;

  // Segnalazione cambio cassa veloce
  if (farmCambioForm) {
    farmCambioForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const turnoVal = (farmCambioTurnoInput?.value || "").trim();
      const importoVal = (farmCambioImportoInput?.value || "").trim();
      const noteVal = (farmCambioNoteInput?.value || "").trim();

      if (!turnoVal) {
        alert("Inserisci almeno il TURNO (es. Mattina, Pomeriggio, Notte).");
        return;
      }

      const todayIso = new Date().toISOString().slice(0, 10);

      addCambioCassa({
        data: todayIso,
        turno: turnoVal,
        importo: importoVal,
        note: noteVal
      });

      farmCambioForm.reset();
      renderFarmaciaCambioCassaTable();
      renderOwnerCambioCassaTable && renderOwnerCambioCassaTable();
    });
  }

  renderFarmaciaCambioCassaTable();
}

function renderFarmaciaCambioCassaTable() {
  if (!farmCambioTableBody) return;

  const list = getCambioCassaList().sort((a, b) => a.data.localeCompare(b.data));

  farmCambioTableBody.innerHTML = "";

  if (!list.length) {
    if (farmCambioEmptyState) farmCambioEmptyState.classList.remove("hidden");
    return;
  }
  if (farmCambioEmptyState) farmCambioEmptyState.classList.add("hidden");

  list.forEach((item) => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(item.data || "");

    const tdTurno = document.createElement("td");
    tdTurno.textContent = item.turno || "–";

    const tdImporto = document.createElement("td");
    tdImporto.textContent = item.importo || "–";

    const tdNote = document.createElement("td");
    tdNote.textContent = item.note || "–";

    tr.appendChild(tdData);
    tr.appendChild(tdTurno);
    tr.appendChild(tdImporto);
    tr.appendChild(tdNote);

    farmCambioTableBody.appendChild(tr);
  });
}

/* =====================================================
   INIT SEZIONI FARMACIA / DIPENDENTI
   (versione estesa – sicura con typeof per funzioni già esistenti)
   ===================================================== */

function initFarmaciaSections() {
  // Se in parti precedenti avevamo già definito altre funzioni specifiche
  // per Farmacia (assenze, turni, comunicazioni, procedure, archivio...)
  // le richiamiamo solo se esistono davvero.
  if (typeof initFarmaciaAssenzeSection === "function") {
    initFarmaciaAssenzeSection();
  }
  if (typeof initFarmaciaTurniSection === "function") {
    initFarmaciaTurniSection();
  }
  if (typeof initFarmaciaComunicazioniSection === "function") {
    initFarmaciaComunicazioniSection();
  }
  if (typeof initFarmaciaProcedureSection === "function") {
    initFarmaciaProcedureSection();
  }
  if (typeof initFarmaciaArchivioSection === "function") {
    initFarmaciaArchivioSection();
  }

  // Nuove sezioni "gestionali" collegate ai dati del Titolare
  initFarmaciaArriviSection();
  initFarmaciaScadenzeSection();
  initFarmaciaScorteSection();
  initFarmaciaCambioCassaSection();
}
// ======================================================
// SCRIPT.JS – PARTE 7/7
// Dashboard CLIENTE: Eventi, Promozioni, Farmacia di turno
// ======================================================

/* =====================================================
   CLIENTE – DOM RIFERIMENTI
   ===================================================== */

// Eventi
let clientEventiList = null;
let clientEventiEmpty = null;

// Promozioni (carosello)
let clientPromoTrack = null;
let clientPromoEmpty = null;
let clientPromoPrev = null;
let clientPromoNext = null;
let clientPromoDotsContainer = null;
let clientPromoIndex = 0;
let clientPromoDataCache = [];

// Farmacia di turno / appoggio
let clientTurnoPrimarioNome = null;
let clientTurnoPrimarioIndirizzo = null;
let clientTurnoPrimarioTelefono = null;
let clientTurnoAppoggioNome = null;
let clientTurnoAppoggioIndirizzo = null;
let clientTurnoAppoggioTelefono = null;

/* =====================================================
   CLIENTE – EVENTI
   ===================================================== */

/**
 * Renderizza la lista Eventi per il Cliente.
 * I dati vengono dalle impostazioni del Titolare (localStorage).
 */
function renderClienteEventi() {
  if (!clientEventiList) return;

  // Se esiste una funzione di utilità per gli eventi, la uso.
  // Altrimenti considero una lista vuota.
  const eventi = typeof getEventiList === "function" ? getEventiList() : [];

  clientEventiList.innerHTML = "";

  if (!eventi.length) {
    if (clientEventiEmpty) clientEventiEmpty.classList.remove("hidden");
    return;
  }
  if (clientEventiEmpty) clientEventiEmpty.classList.add("hidden");

  // Mostro max 6 eventi sulla dashboard cliente
  eventi.slice(0, 6).forEach((ev) => {
    const li = document.createElement("li");
    li.className = "client-event-item";

    const title = document.createElement("div");
    title.className = "client-event-title";
    title.textContent = ev.titolo || "Evento";

    const meta = document.createElement("div");
    meta.className = "client-event-meta";
    const dataLabel = ev.data ? formatDateIT(ev.data) : "Data da definire";
    meta.textContent = dataLabel;

    const desc = document.createElement("div");
    desc.className = "client-event-desc";
    desc.textContent = ev.descrizione || "";

    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(desc);

    clientEventiList.appendChild(li);
  });
}

/* =====================================================
   CLIENTE – PROMOZIONI (CAROSELLO)
   ===================================================== */

/**
 * Prepara il carosello promozioni per il Cliente.
 * Usa i dati gestiti dal Titolare (localStorage).
 */
function renderClientePromozioni() {
  if (!clientPromoTrack) return;

  clientPromoTrack.innerHTML = "";
  clientPromoDataCache = [];

  const promos =
    typeof getPromozioniList === "function" ? getPromozioniList() : [];

  if (!promos.length) {
    if (clientPromoEmpty) clientPromoEmpty.classList.remove("hidden");
    return;
  }
  if (clientPromoEmpty) clientPromoEmpty.classList.add("hidden");

  clientPromoDataCache = promos;
  clientPromoIndex = 0;

  promos.forEach((promo, index) => {
    const slide = document.createElement("div");
    slide.className = "promo-slide";

    const inner = document.createElement("div");
    inner.className = "promo-slide-inner";

    // "Immagine" stilizzata – anche solo box colorato con testo
    const imageBox = document.createElement("div");
    imageBox.className = "promo-image-box";
    imageBox.textContent = promo.nomeBreve || promo.titolo || "Promo";

    const title = document.createElement("div");
    title.className = "promo-title";
    title.textContent = promo.titolo || "Promozione";

    const price = document.createElement("div");
    price.className = "promo-price";
    if (promo.prezzo && promo.prezzo !== "") {
      price.textContent = promo.prezzo;
    } else {
      price.textContent = promo.sottotitolo || "";
    }

    const desc = document.createElement("div");
    desc.className = "promo-desc";
    desc.textContent = promo.descrizione || "";

    inner.appendChild(imageBox);
    inner.appendChild(title);
    inner.appendChild(price);
    inner.appendChild(desc);

    slide.appendChild(inner);
    clientPromoTrack.appendChild(slide);
  });

  // Dots
  if (clientPromoDotsContainer) {
    clientPromoDotsContainer.innerHTML = "";
    promos.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "promo-dot";
      if (idx === clientPromoIndex) dot.classList.add("active");
      dot.setAttribute("data-promo-index", String(idx));
      clientPromoDotsContainer.appendChild(dot);
    });
  }

  updateClientePromoTransform();
}

/**
 * Aggiorna la posizione del carosello in base a clientPromoIndex.
 */
function updateClientePromoTransform() {
  if (!clientPromoTrack) return;

  const total = clientPromoDataCache.length || 0;
  if (!total) return;

  if (clientPromoIndex < 0) clientPromoIndex = total - 1;
  if (clientPromoIndex >= total) clientPromoIndex = 0;

  const offset = -clientPromoIndex * 100;
  clientPromoTrack.style.transform = `translateX(${offset}%)`;

  if (clientPromoDotsContainer) {
    const dots = clientPromoDotsContainer.querySelectorAll(".promo-dot");
    dots.forEach((dot, idx) => {
      if (idx === clientPromoIndex) dot.classList.add("active");
      else dot.classList.remove("active");
    });
  }
}

/**
 * Sposta il carosello avanti/indietro di 1 slide.
 * @param {number} delta +1 avanti, -1 indietro
 */
function moveClientePromo(delta) {
  const total = clientPromoDataCache.length || 0;
  if (!total) return;
  clientPromoIndex += delta;
  updateClientePromoTransform();
}

/* =====================================================
   CLIENTE – FARMACIA DI TURNO / APPOGGIO
   ===================================================== */

/**
 * Renderizza le informazioni su Farmacia di turno / appoggio
 * per il Cliente, usando le impostazioni del Titolare.
 */
function renderClienteTurno() {
  // Se esiste una funzione per recuperare le impostazioni turno, la uso
  const turnoSettings =
    typeof getTurnoSettings === "function" ? getTurnoSettings() : null;

  if (!turnoSettings) return;

  if (clientTurnoPrimarioNome) {
    clientTurnoPrimarioNome.textContent =
      turnoSettings.turnoNome || "Farmacia di turno non impostata";
  }
  if (clientTurnoPrimarioIndirizzo) {
    clientTurnoPrimarioIndirizzo.textContent =
      turnoSettings.turnoIndirizzo || "";
  }
  if (clientTurnoPrimarioTelefono) {
    clientTurnoPrimarioTelefono.textContent =
      turnoSettings.turnoTelefono || "";
  }

  if (clientTurnoAppoggioNome) {
    clientTurnoAppoggioNome.textContent =
      turnoSettings.appoggioNome || "Farmacia di appoggio non impostata";
  }
  if (clientTurnoAppoggioIndirizzo) {
    clientTurnoAppoggioIndirizzo.textContent =
      turnoSettings.appoggioIndirizzo || "";
  }
  if (clientTurnoAppoggioTelefono) {
    clientTurnoAppoggioTelefono.textContent =
      turnoSettings.appoggioTelefono || "";
  }
}

/* =====================================================
   CLIENTE – INIT SEZIONI
   ===================================================== */

function initClienteSections() {
  // Eventi – elementi DOM
  clientEventiList = document.getElementById("clientEventiList");
  clientEventiEmpty = document.getElementById("clientEventiEmpty");

  // Promozioni – elementi DOM
  clientPromoTrack = document.getElementById("clientPromoTrack");
  clientPromoEmpty = document.getElementById("clientPromoEmpty");
  clientPromoPrev = document.getElementById("clientPromoPrev");
  clientPromoNext = document.getElementById("clientPromoNext");
  clientPromoDotsContainer = document.getElementById("clientPromoDots");

  // Turno – elementi DOM
  clientTurnoPrimarioNome = document.getElementById("clientTurnoNome");
  clientTurnoPrimarioIndirizzo = document.getElementById("clientTurnoIndirizzo");
  clientTurnoPrimarioTelefono = document.getElementById("clientTurnoTelefono");
  clientTurnoAppoggioNome = document.getElementById("clientAppoggioNome");
  clientTurnoAppoggioIndirizzo = document.getElementById("clientAppoggioIndirizzo");
  clientTurnoAppoggioTelefono = document.getElementById("clientAppoggioTelefono");

  // Render iniziale Eventi / Promozioni / Turni
  renderClienteEventi();
  renderClientePromozioni();
  renderClienteTurno();

  // Eventi click dots carosello promozioni
  if (clientPromoDotsContainer) {
    clientPromoDotsContainer.addEventListener("click", (evt) => {
      const dot = evt.target.closest(".promo-dot");
      if (!dot) return;
      const idx = Number(dot.getAttribute("data-promo-index"));
      if (Number.isNaN(idx)) return;
      clientPromoIndex = idx;
      updateClientePromoTransform();
    });
  }

  // Bottoni prev/next promos
  if (clientPromoPrev) {
    clientPromoPrev.addEventListener("click", () => {
      moveClientePromo(-1);
    });
  }
  if (clientPromoNext) {
    clientPromoNext.addEventListener("click", () => {
      moveClientePromo(1);
    });
  }

  // Auto-scroll leggero del carosello (opzionale)
  // Lo faccio solo se ci sono almeno 2 promozioni.
  const totalPromos = clientPromoDataCache.length;
  if (totalPromos > 1) {
    setInterval(() => {
      // Se la dashboard cliente non è visibile potresti voler
      // aggiungere un controllo, ma per ora lasciamo semplice.
      moveClientePromo(1);
    }, 8000); // ogni 8 secondi
  }
}
