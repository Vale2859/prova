/* ============================================================
   FARMACIA MONTESANO – PORTALE PROFESSIONALE
   Front-end completo con gestione ruoli e localStorage
   ----------------------------------------------------
   FILE: script.js – PARTE 1/7
   Contenuti:
   - Costanti ruoli e chiavi localStorage
   - Struttura dati base (utenti, impostazioni, moduli)
   - Funzioni helper per localStorage
   - Inizializzazione utenti di default (titolare + farmacia)
   ============================================================ */

/* ===============================
   1) COSTANTI GLOBALI / RUOLI
   =============================== */

// Identificatori dei ruoli (stringhe salvate anche in localStorage)
const ROLE_TITOLARE  = "titolare";
const ROLE_FARMACIA  = "farmacia";
const ROLE_DIPENDENTE = "dipendente";
const ROLE_CLIENTE   = "cliente";

// Chiavi usate in localStorage (tutte raggruppate qui)
const LS_KEY_USERS           = "fm_portale_utenti";           // array di utenti registrati
const LS_KEY_SETTINGS        = "fm_portale_impostazioni";     // impostazioni globali (dati farmacia, tema, ecc.)
const LS_KEY_CURRENT_USER    = "fm_portale_utente_corrente";  // utente attualmente loggato
const LS_KEY_ASSENZE         = "fm_portale_assenze";          // elenco assenze personale
const LS_KEY_TURNI_INFO      = "fm_portale_turni_info";       // dati farmacia di turno / appoggio
const LS_KEY_COMUNICAZIONI   = "fm_portale_comunicazioni";    // bacheca comunicazioni interne
const LS_KEY_PROCEDURE       = "fm_portale_procedure";        // elenco procedure interne
const LS_KEY_ARRIVI          = "fm_portale_arrivi";           // segnalazioni arrivi corrieri
const LS_KEY_SCADENZE        = "fm_portale_scadenze";         // scadenze prodotti
const LS_KEY_SCORTE          = "fm_portale_scorte";           // scorte interne (bicchieri, rotoli, ecc.)
const LS_KEY_CAMBIO_CASSA    = "fm_portale_cambio_cassa";     // registri di cambio cassa
const LS_KEY_ARCHIVIO_FILE   = "fm_portale_archivio_file";    // semplice archivio file (nome, categoria, link)
const LS_KEY_EVENTI_CLIENTI  = "fm_portale_eventi_clienti";   // eventi visibili ai clienti
const LS_KEY_PROMO_CLIENTI   = "fm_portale_promo_clienti";    // promozioni per i clienti

// Variabile di stato globale: utente attualmente loggato
let currentUser = null;

/* ===============================
   2) STRUTTURE DATI BASE
   =============================== */

/**
 * Modello base di un utente:
 * {
 *   id: string,          // id univoco
 *   ruolo: string,       // uno tra ROLE_TITOLARE, ROLE_FARMACIA, ROLE_DIPENDENTE, ROLE_CLIENTE
 *   nome: string,
 *   cognome: string,
 *   username: string,    // email o username
 *   password: string,    // (in chiaro, solo demo - nel vero server sarebbe hash)
 *   creatoIl: string     // ISO date
 * }
 *
 * N.B. Titolare e Farmacia VENGONO CREATI DI DEFAULT
 * negli helper di inizializzazione.
 */

/**
 * Modello impostazioni globali:
 * {
 *   farmaciaNome: string,
 *   farmaciaIndirizzo: string,
 *   farmaciaTelefono: string,
 *   theme: {
 *     primaryColor: string,
 *     accentColor: string
 *   },
 *   primoAccessoTitolare: boolean   // se true, al titolare possiamo mostrare banner "cambia password"
 * }
 */

/**
 * Modello assenza:
 * {
 *   id: string,
 *   nome: string,
 *   data: string,        // "YYYY-MM-DD"
 *   motivo: string,      // ferie / permesso ecc.
 *   inseritoDa: string,  // username di chi l'ha inserita
 *   creatoIl: string     // ISO
 * }
 *
 * (Strutture simili per arrivi, scadenze, scorte ecc. più avanti)
 */

/* ===============================
   3) FUNZIONI HELPER – LOCALSTORAGE
   =============================== */

/**
 * safeParseJSON:
 * prova a fare JSON.parse, restituisce fallbackValue
 * se qualcosa va storto.
 */
function safeParseJSON(value, fallbackValue) {
  try {
    if (value === null || value === undefined || value === "") {
      return fallbackValue;
    }
    return JSON.parse(value);
  } catch (err) {
    console.warn("Errore nel parse JSON:", err);
    return fallbackValue;
  }
}

/**
 * leggiDaStorage:
 * legge e parsa una chiave di localStorage.
 */
function leggiDaStorage(key, defaultValue) {
  const raw = window.localStorage.getItem(key);
  return safeParseJSON(raw, defaultValue);
}

/**
 * scriviInStorage:
 * salva un valore qualunque in localStorage (serializzato JSON).
 */
function scriviInStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (err) {
    console.error("Errore nel salvare su localStorage:", err);
  }
}

/**
 * rimuoviDaStorage:
 * rimuove una chiave dal localStorage.
 */
function rimuoviDaStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error("Errore nel rimuovere da localStorage:", err);
  }
}

/* ===============================
   4) FUNZIONI HELPER – GENERALI
   =============================== */

/**
 * generaId:
 * genera un ID pseudo-unico per gli elementi (utenti, record, ecc.)
 */
function generaId(prefix) {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return (prefix || "id") + "_" + randomPart + "_" + timePart;
}

/**
 * oggiISO:
 * restituisce la data di oggi in formato "YYYY-MM-DD"
 */
function oggiISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * formattaDataIT:
 * converte "YYYY-MM-DD" in "DD/MM/YYYY"
 */
function formattaDataIT(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * getNowISO:
 * data/ora corrente in formato ISO (per timestamp)
 */
function getNowISO() {
  return new Date().toISOString();
}

/* ===============================
   5) INIZIALIZZAZIONE DATI DI BASE
   =============================== */

/**
 * inizializzaUtentiDiDefault:
 * - controlla se esistono utenti in localStorage
 * - se non ci sono, crea:
 *   1) Titolare
 *   2) Farmacia (account operativo)
 *
 * NOTE:
 * - username/password provvisori (da modificare in Impostazioni)
 */
function inizializzaUtentiDiDefault() {
  const utentiEsistenti = leggiDaStorage(LS_KEY_USERS, []);

  if (utentiEsistenti && utentiEsistenti.length > 0) {
    // Ci sono già utenti salvati → non tocco nulla
    return;
  }

  const dataCreazione = getNowISO();

  const utenteTitolare = {
    id: generaId("user"),
    ruolo: ROLE_TITOLARE,
    nome: "Valerio",
    cognome: "Montesano",
    username: "titolare",      // username provvisorio
    password: "titolare123",   // password provvisoria
    creatoIl: dataCreazione
  };

  const utenteFarmacia = {
    id: generaId("user"),
    ruolo: ROLE_FARMACIA,
    nome: "Farmacia",
    cognome: "Montesano",
    username: "farmacia",      // username provvisorio
    password: "farmacia123",   // password provvisoria
    creatoIl: dataCreazione
  };

  const usersSeed = [utenteTitolare, utenteFarmacia];

  scriviInStorage(LS_KEY_USERS, usersSeed);

  console.info("Inizializzati utenti di default (titolare + farmacia).");
}

/**
 * inizializzaImpostazioniDiDefault:
 * - imposta dati base della farmacia (nome, indirizzo, telefono)
 * - imposta colori tema di default
 * - segna primoAccessoTitolare = true per mostrare eventuale banner
 */
function inizializzaImpostazioniDiDefault() {
  const impostazioniEsistenti = leggiDaStorage(LS_KEY_SETTINGS, null);
  if (impostazioniEsistenti) {
    return; // già configurato
  }

  const defaultSettings = {
    farmaciaNome: "Farmacia Montesano",
    farmaciaIndirizzo: "Via Esempio 12, 75100 Matera (MT)",
    farmaciaTelefono: "+39 0835 123456",
    theme: {
      primaryColor: "#007bff",
      accentColor: "#00b894"
    },
    primoAccessoTitolare: true
  };

  scriviInStorage(LS_KEY_SETTINGS, defaultSettings);

  console.info("Inizializzate impostazioni di default del portale.");
}

/**
 * inizializzaDatiSezioni:
 * crea dati demo per alcune sezioni (facoltativi, solo per partire)
 * - turni farmacie
 * - comunicazioni
 * - procedure
 * - eventi e promozioni per i clienti
 *
 * Tutto modificabile successivamente dal Titolare.
 */
function inizializzaDatiSezioni() {
  // Turni (farmacia di turno / appoggio)
  const turniInfo = leggiDaStorage(LS_KEY_TURNI_INFO, null);
  if (!turniInfo) {
    const defaultTurni = {
      turnoFarmacia: {
        nome: "Farmacia Montesano",
        indirizzo: "Via Esempio 12, Matera",
        telefono: "0835 123456"
      },
      appoggioFarmacia: {
        nome: "Farmacia Centrale",
        indirizzo: "Via Roma 45, Matera",
        telefono: "0835 654321"
      },
      ultimoAggiornamento: getNowISO()
    };
    scriviInStorage(LS_KEY_TURNI_INFO, defaultTurni);
  }

  // Comunicazioni
  const comunicazioni = leggiDaStorage(LS_KEY_COMUNICAZIONI, null);
  if (!comunicazioni) {
    const demoComunicazioni = [
      {
        id: generaId("com"),
        titolo: "Benvenuti nel Portale Professionale",
        testo: "Da qui puoi gestire assenze, turni, comunicazioni e molto altro.",
        data: oggiISO(),
        autore: "Sistema",
        ruoloAutore: ROLE_TITOLARE
      },
      {
        id: generaId("com"),
        titolo: "Nuova procedura per i turni notturni",
        testo: "Controllare l'armadietto stupefacenti a fine turno e firmare il registro.",
        data: oggiISO(),
        autore: "Titolare",
        ruoloAutore: ROLE_TITOLARE
      }
    ];
    scriviInStorage(LS_KEY_COMUNICAZIONI, demoComunicazioni);
  }

  // Procedure
  const procedure = leggiDaStorage(LS_KEY_PROCEDURE, null);
  if (!procedure) {
    const demoProcedure = [
      {
        id: generaId("proc"),
        titolo: "Chiusura cassa serale",
        descrizione:
          "1) Controlla fondo cassa.\n2) Stampa chiusura fiscale.\n3) Registra sul modulo dedicato.",
        reparto: "cassa",
        ultimoAggiornamento: oggiISO()
      },
      {
        id: generaId("proc"),
        titolo: "Ricezione merce da grossista",
        descrizione:
          "Verifica DDT, controlla scadenze, etichetta i prodotti e carica il magazzino.",
        reparto: "magazzino",
        ultimoAggiornamento: oggiISO()
      }
    ];
    scriviInStorage(LS_KEY_PROCEDURE, demoProcedure);
  }

  // Eventi per clienti
  const eventi = leggiDaStorage(LS_KEY_EVENTI_CLIENTI, null);
  if (!eventi) {
    const demoEventi = [
      {
        id: generaId("evt"),
        titolo: "Giornata prevenzione cardiovascolare",
        data: "2025-12-20",
        descrizioneBreve: "Screening pressione e colesterolo con il nostro personale.",
        visibile: true
      },
      {
        id: generaId("evt"),
        titolo: "Check-up della pelle",
        data: "2025-12-27",
        descrizioneBreve: "Analisi della pelle gratuita con consulente dermocosmetico.",
        visibile: true
      }
    ];
    scriviInStorage(LS_KEY_EVENTI_CLIENTI, demoEventi);
  }

  // Promozioni per clienti
  const promo = leggiDaStorage(LS_KEY_PROMO_CLIENTI, null);
  if (!promo) {
    const demoPromo = [
      {
        id: generaId("promo"),
        titolo: "Fermenti lattici Yovis",
        descrizione: "Confezione 10 flaconcini – supporto per la flora intestinale.",
        prezzo: "€ 14,90",
        prezzoBarrato: "€ 19,90",
        evidenza: true
      },
      {
        id: generaId("promo"),
        titolo: "Kit vitamina C",
        descrizione: "Integratore + siero viso per una pelle luminosa.",
        prezzo: "€ 24,90",
        prezzoBarrato: "€ 34,90",
        evidenza: true
      }
    ];
    scriviInStorage(LS_KEY_PROMO_CLIENTI, demoPromo);
  }

  // Le altre sezioni (assenze, arrivi, scadenze, scorte, cambio cassa, archivio)
  // possono iniziare semplicemente come array vuoti se non sono già presenti:
  if (!leggiDaStorage(LS_KEY_ASSENZE, null))       scriviInStorage(LS_KEY_ASSENZE, []);
  if (!leggiDaStorage(LS_KEY_ARRIVI, null))        scriviInStorage(LS_KEY_ARRIVI, []);
  if (!leggiDaStorage(LS_KEY_SCADENZE, null))      scriviInStorage(LS_KEY_SCADENZE, []);
  if (!leggiDaStorage(LS_KEY_SCORTE, null))        scriviInStorage(LS_KEY_SCORTE, []);
  if (!leggiDaStorage(LS_KEY_CAMBIO_CASSA, null))  scriviInStorage(LS_KEY_CAMBIO_CASSA, []);
  if (!leggiDaStorage(LS_KEY_ARCHIVIO_FILE, null)) scriviInStorage(LS_KEY_ARCHIVIO_FILE, []);
}

/* ===============================
   6) CARICAMENTO UTENTE CORRENTE
   =============================== */

/**
 * caricaUtenteCorrente:
 * legge da localStorage l'utente loggato (se esiste)
 */
function caricaUtenteCorrente() {
  const saved = leggiDaStorage(LS_KEY_CURRENT_USER, null);
  if (saved && saved.username) {
    currentUser = saved;
  } else {
    currentUser = null;
  }
}
/* ============================================================
   7) GESTIONE UTENTI (REGISTRAZIONE / LOGIN / LOGOUT)
   ============================================================ */

/**
 * getAllUsers:
 * legge tutti gli utenti registrati da localStorage.
 */
function getAllUsers() {
  const utenti = leggiDaStorage(LS_KEY_USERS, []);
  return Array.isArray(utenti) ? utenti : [];
}

/**
 * saveAllUsers:
 * salva l'array completo di utenti in localStorage.
 */
function saveAllUsers(usersArray) {
  if (!Array.isArray(usersArray)) return;
  scriviInStorage(LS_KEY_USERS, usersArray);
}

/**
 * findUserByUsername:
 * restituisce l'utente con quello username (se esiste).
 */
function findUserByUsername(username) {
  if (!username) return null;
  const utenti = getAllUsers();
  return utenti.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * isUsernameTaken:
 * verifica se esiste già un utente con quello username.
 */
function isUsernameTaken(username) {
  return !!findUserByUsername(username);
}

/* ------------------------------------------------------------
   7.1) REGISTRAZIONE DIPENDENTE / CLIENTE
   ------------------------------------------------------------ */

/**
 * validateRegistrationData:
 * controlla che i campi base di registrazione siano compilati.
 * Restituisce: { valid: boolean, message: string }
 */
function validateRegistrationData(nome, cognome, username, password) {
  if (!nome || !cognome || !username || !password) {
    return {
      valid: false,
      message: "Compila tutti i campi richiesti."
    };
  }

  if (username.length < 3) {
    return {
      valid: false,
      message: "Lo username deve avere almeno 3 caratteri."
    };
  }

  if (password.length < 4) {
    return {
      valid: false,
      message: "La password deve avere almeno 4 caratteri."
    };
  }

  if (isUsernameTaken(username)) {
    return {
      valid: false,
      message: "Esiste già un utente con questo username / email."
    };
  }

  return { valid: true, message: "" };
}

/**
 * registraNuovoUtente:
 * registra un nuovo utente di tipo DIPENDENTE o CLIENTE.
 *
 * roleType deve essere ROLE_DIPENDENTE oppure ROLE_CLIENTE.
 * Restituisce: { success: boolean, message: string }
 */
function registraNuovoUtente(roleType, nome, cognome, username, password) {
  // Controllo ruolo ammesso
  if (roleType !== ROLE_DIPENDENTE && roleType !== ROLE_CLIENTE) {
    return {
      success: false,
      message: "Ruolo non valido per la registrazione."
    };
  }

  // Validazione campi
  const validation = validateRegistrationData(nome, cognome, username, password);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message
    };
  }

  const utenti = getAllUsers();

  const nuovoUtente = {
    id: generaId("user"),
    ruolo: roleType,
    nome: nome.trim(),
    cognome: cognome.trim(),
    username: username.trim(),
    password: password,  // (in chiaro – solo demo)
    creatoIl: getNowISO()
  };

  utenti.push(nuovoUtente);
  saveAllUsers(utenti);

  return {
    success: true,
    message: "Registrazione completata. Ora puoi effettuare il login."
  };
}

/* ------------------------------------------------------------
   7.2) LOGIN
   ------------------------------------------------------------ */

/**
 * validateLoginData:
 * controlla che username e password non siano vuoti.
 */
function validateLoginData(username, password) {
  if (!username || !password) {
    return {
      valid: false,
      message: "Inserisci username e password."
    };
  }
  return { valid: true, message: "" };
}

/**
 * effettuaLogin:
 * cerca un utente con username+password corrispondenti.
 *
 * Se trova un utente:
 *  - salva currentUser (in memoria e in localStorage)
 *  - richiama la funzione mostraVistaPerRuolo() per caricare la dashboard giusta
 *
 * Restituisce: { success: boolean, message: string }
 */
function effettuaLogin(username, password) {
  const check = validateLoginData(username, password);
  if (!check.valid) {
    return {
      success: false,
      message: check.message
    };
  }

  const utenti = getAllUsers();

  const trovato = utenti.find(u =>
    u.username.toLowerCase() === username.toLowerCase() &&
    u.password === password
  );

  if (!trovato) {
    return {
      success: false,
      message: "Credenziali non valide. Controlla username e password."
    };
  }

  // Salvo utente corrente in memoria e localStorage
  currentUser = {
    id: trovato.id,
    ruolo: trovato.ruolo,
    nome: trovato.nome,
    cognome: trovato.cognome,
    username: trovato.username
    // NOTA: la password NON viene salvata qui per sicurezza (non serve)
  };

  scriviInStorage(LS_KEY_CURRENT_USER, currentUser);

  // Inizializzo la vista corretta in base al ruolo
  try {
    mostraVistaPerRuolo();
  } catch (err) {
    console.warn(
      "mostraVistaPerRuolo non ancora definita – sarà definita nelle parti successive.",
      err
    );
  }

  return {
    success: true,
    message: "Login effettuato con successo."
  };
}

/* ------------------------------------------------------------
   7.3) LOGOUT
   ------------------------------------------------------------ */

/**
 * effettuaLogout:
 * cancella currentUser dalla memoria e dal localStorage,
 * e riporta l'interfaccia alla schermata iniziale.
 */
function effettuaLogout() {
  currentUser = null;
  rimuoviDaStorage(LS_KEY_CURRENT_USER);

  try {
    mostraSchermataIniziale();
  } catch (err) {
    console.warn(
      "mostraSchermataIniziale non ancora definita – sarà definita nelle parti successive.",
      err
    );
  }
}

/* ------------------------------------------------------------
   7.4) CONTROLLO RAPIDO RUOLO
   ------------------------------------------------------------ */

/**
 * isTitolare:
 * true se l'utente loggato è il Titolare.
 */
function isTitolare() {
  return currentUser && currentUser.ruolo === ROLE_TITOLARE;
}

/**
 * isFarmacia:
 * true se l'utente loggato è l'account Farmacia operativa.
 */
function isFarmacia() {
  return currentUser && currentUser.ruolo === ROLE_FARMACIA;
}

/**
 * isDipendente:
 * true se l'utente loggato è un dipendente.
 */
function isDipendente() {
  return currentUser && currentUser.ruolo === ROLE_DIPENDENTE;
}

/**
 * isCliente:
 * true se l'utente loggato è un cliente.
 */
function isCliente() {
  return currentUser && currentUser.ruolo === ROLE_CLIENTE;
}
/* ============================================================
   8) RIFERIMENTI DOM E GESTIONE DELLE SEZIONI
   ============================================================ */

// Riferimenti principali (verranno valorizzati in cacheDomReferences)
let landingSection;       // Schermata iniziale (Login / Registrati)
let loginSection;         // Schermata login
let registerSection;      // Schermata registrazione

let dashboardTitolare;    // Dashboard per il Titolare
let dashboardFarmacia;    // Dashboard account Farmacia
let dashboardDipendente;  // Dashboard Dipendenti
let dashboardCliente;     // Dashboard Clienti

// Navbar
let navbar;               // barra in alto
let navbarUserNameSpan;   // span con "Nome Cognome"
let navbarUserRoleSpan;   // span con il ruolo
let btnLogout;            // bottone logout

// Form LOGIN
let loginForm;
let loginUsernameInput;
let loginPasswordInput;
let loginErrorBox;
let btnBackFromLogin;

// Form REGISTRAZIONE
let registerForm;
let regNomeInput;
let regCognomeInput;
let regUsernameInput;
let regPasswordInput;
let regRuoloSelect;       // select [dipendente | cliente]
let registerErrorBox;
let btnBackFromRegister;

// Pulsanti nella schermata iniziale
let btnGoLogin;
let btnGoRegister;

/**
 * cacheDomReferences:
 * legge tutti gli elementi HTML che ci servono e li mette
 * nelle variabili globali sopra definite.
 *
 * IMPORTANTISSIMO:
 *  - Gli ID usati qui devono corrispondere a quelli presenti in index.html
 */
function cacheDomReferences() {
  // Sezioni principali
  landingSection      = document.getElementById("landingSection");
  loginSection        = document.getElementById("loginSection");
  registerSection     = document.getElementById("registerSection");

  dashboardTitolare   = document.getElementById("dashboardTitolare");
  dashboardFarmacia   = document.getElementById("dashboardFarmacia");
  dashboardDipendente = document.getElementById("dashboardDipendente");
  dashboardCliente    = document.getElementById("dashboardCliente");

  // Navbar
  navbar              = document.getElementById("appNavbar");
  navbarUserNameSpan  = document.getElementById("navbarUserName");
  navbarUserRoleSpan  = document.getElementById("navbarUserRole");
  btnLogout           = document.getElementById("btnLogout");

  // Pulsanti landing
  btnGoLogin          = document.getElementById("btnGoLogin");
  btnGoRegister       = document.getElementById("btnGoRegister");

  // Login form
  loginForm           = document.getElementById("loginForm");
  loginUsernameInput  = document.getElementById("loginUsername");
  loginPasswordInput  = document.getElementById("loginPassword");
  loginErrorBox       = document.getElementById("loginError");
  btnBackFromLogin    = document.getElementById("btnBackFromLogin");

  // Register form
  registerForm        = document.getElementById("registerForm");
  regNomeInput        = document.getElementById("regNome");
  regCognomeInput     = document.getElementById("regCognome");
  regUsernameInput    = document.getElementById("regUsername");
  regPasswordInput    = document.getElementById("regPassword");
  regRuoloSelect      = document.getElementById("regRuolo");
  registerErrorBox    = document.getElementById("registerError");
  btnBackFromRegister = document.getElementById("btnBackFromRegister");
}

/**
 * nascondiTutteLeSezioni:
 * nasconde tutte le sezioni principali (landing, login, register, dashboard).
 * Usiamo una classe CSS "hidden" per semplificare.
 */
function nascondiTutteLeSezioni() {
  const sezioni = [
    landingSection,
    loginSection,
    registerSection,
    dashboardTitolare,
    dashboardFarmacia,
    dashboardDipendente,
    dashboardCliente
  ];

  sezioni.forEach(sec => {
    if (sec) {
      sec.classList.add("hidden");
    }
  });
}

/**
 * mostraNavbar:
 * mostra la barra di navigazione in alto.
 */
function mostraNavbar() {
  if (navbar) {
    navbar.classList.remove("hidden");
  }
}

/**
 * nascondiNavbar:
 * nasconde la barra di navigazione in alto.
 */
function nascondiNavbar() {
  if (navbar) {
    navbar.classList.add("hidden");
  }
}

/**
 * updateNavbarUserInfo:
 * aggiorna i testi in navbar con nome / ruolo dell'utente loggato.
 */
function updateNavbarUserInfo() {
  if (!navbar) return;

  if (!currentUser) {
    // Nessun utente loggato
    if (navbarUserNameSpan) navbarUserNameSpan.textContent = "";
    if (navbarUserRoleSpan) navbarUserRoleSpan.textContent = "";
    return;
  }

  const fullName = (currentUser.nome || "") + " " + (currentUser.cognome || "");
  if (navbarUserNameSpan) {
    navbarUserNameSpan.textContent = fullName.trim() || currentUser.username;
  }

  let ruoloLabel = "";
  switch (currentUser.ruolo) {
    case ROLE_TITOLARE:
      ruoloLabel = "Titolare";
      break;
    case ROLE_FARMACIA:
      ruoloLabel = "Farmacia";
      break;
    case ROLE_DIPENDENTE:
      ruoloLabel = "Dipendente";
      break;
    case ROLE_CLIENTE:
      ruoloLabel = "Cliente";
      break;
    default:
      ruoloLabel = currentUser.ruolo || "";
  }

  if (navbarUserRoleSpan) {
    navbarUserRoleSpan.textContent = ruoloLabel;
  }
}

/* ============================================================
   9) GESTIONE VISTE PRINCIPALI
   ============================================================ */

/**
 * mostraSchermataIniziale:
 * utilizzata quando:
 *  - nessun utente è loggato
 *  - dopo il logout
 */
function mostraSchermataIniziale() {
  nascondiTutteLeSezioni();
  nascondiNavbar();

  if (landingSection) {
    landingSection.classList.remove("hidden");
  }

  // Pulisco eventuali messaggi di errore
  if (loginErrorBox) loginErrorBox.textContent = "";
  if (registerErrorBox) registerErrorBox.textContent = "";
}

/**
 * mostraVistaLogin:
 * mostra la sezione di login.
 */
function mostraVistaLogin() {
  nascondiTutteLeSezioni();
  nascondiNavbar();

  if (loginSection) {
    loginSection.classList.remove("hidden");
  }

  if (loginErrorBox) {
    loginErrorBox.textContent = "";
  }

  if (loginUsernameInput) loginUsernameInput.value = "";
  if (loginPasswordInput) loginPasswordInput.value = "";
}

/**
 * mostraVistaRegistrazione:
 * mostra la sezione di registrazione.
 */
function mostraVistaRegistrazione() {
  nascondiTutteLeSezioni();
  nascondiNavbar();

  if (registerSection) {
    registerSection.classList.remove("hidden");
  }

  if (registerErrorBox) {
    registerErrorBox.textContent = "";
  }

  if (regNomeInput) regNomeInput.value = "";
  if (regCognomeInput) regCognomeInput.value = "";
  if (regUsernameInput) regUsernameInput.value = "";
  if (regPasswordInput) regPasswordInput.value = "";
  if (regRuoloSelect) regRuoloSelect.value = ROLE_DIPENDENTE; // default
}

/**
 * mostraDashboardTitolare:
 * dashboard principale del Titolare
 */
function mostraDashboardTitolare() {
  nascondiTutteLeSezioni();
  mostraNavbar();
  updateNavbarUserInfo();

  if (dashboardTitolare) {
    dashboardTitolare.classList.remove("hidden");
  }

  // Qui in seguito richiameremo funzioni tipo:
  //   caricaCardAssentiTitolare();
  //   caricaCardTurni();
  // ecc...
}

/**
 * mostraDashboardFarmacia:
 * dashboard per account "Farmacia" (vista operativa)
 */
function mostraDashboardFarmacia() {
  nascondiTutteLeSezioni();
  mostraNavbar();
  updateNavbarUserInfo();

  if (dashboardFarmacia) {
    dashboardFarmacia.classList.remove("hidden");
  }
}

/**
 * mostraDashboardDipendente:
 * dashboard per utenti di ruolo DIPENDENTE
 */
function mostraDashboardDipendente() {
  nascondiTutteLeSezioni();
  mostraNavbar();
  updateNavbarUserInfo();

  if (dashboardDipendente) {
    dashboardDipendente.classList.remove("hidden");
  }
}

/**
 * mostraDashboardCliente:
 * dashboard per utenti di ruolo CLIENTE
 */
function mostraDashboardCliente() {
  nascondiTutteLeSezioni();
  mostraNavbar();
  updateNavbarUserInfo();

  if (dashboardCliente) {
    dashboardCliente.classList.remove("hidden");
  }
}

/**
 * mostraVistaPerRuolo:
 * decide in quale dashboard mandare l'utente
 * in base al ruolo salvato in currentUser.
 */
function mostraVistaPerRuolo() {
  if (!currentUser) {
    mostraSchermataIniziale();
    return;
  }

  if (isTitolare()) {
    mostraDashboardTitolare();
  } else if (isFarmacia()) {
    mostraDashboardFarmacia();
  } else if (isDipendente()) {
    mostraDashboardDipendente();
  } else if (isCliente()) {
    mostraDashboardCliente();
  } else {
    // Ruolo sconosciuto: torniamo alla schermata iniziale
    console.warn("Ruolo utente non riconosciuto:", currentUser.ruolo);
    mostraSchermataIniziale();
  }
}

/* ============================================================
   10) EVENT LISTENERS: LOGIN, REGISTRAZIONE, LANDING, LOGOUT
   ============================================================ */

/**
 * setupEventListeners:
 * collega i vari bottoni e form alle funzioni di logica.
 */
function setupEventListeners() {
  // --- Pulsanti nella schermata iniziale ---
  if (btnGoLogin) {
    btnGoLogin.addEventListener("click", () => {
      mostraVistaLogin();
    });
  }

  if (btnGoRegister) {
    btnGoRegister.addEventListener("click", () => {
      mostraVistaRegistrazione();
    });
  }

  // --- Torna indietro da LOGIN --> landing ---
  if (btnBackFromLogin) {
    btnBackFromLogin.addEventListener("click", () => {
      mostraSchermataIniziale();
    });
  }

  // --- Torna indietro da REGISTRAZIONE --> landing ---
  if (btnBackFromRegister) {
    btnBackFromRegister.addEventListener("click", () => {
      mostraSchermataIniziale();
    });
  }

  // --- Form LOGIN ---
  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!loginUsernameInput || !loginPasswordInput) return;

      const username = loginUsernameInput.value.trim();
      const password = loginPasswordInput.value;

      const res = effettuaLogin(username, password);

      if (!res.success) {
        if (loginErrorBox) {
          loginErrorBox.textContent = res.message;
        } else {
          alert(res.message);
        }
      } else {
        if (loginErrorBox) {
          loginErrorBox.textContent = "";
        }
        // La funzione effettuaLogin chiama già mostraVistaPerRuolo()
      }
    });
  }

  // --- Form REGISTRAZIONE ---
  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      if (
        !regNomeInput ||
        !regCognomeInput ||
        !regUsernameInput ||
        !regPasswordInput ||
        !regRuoloSelect
      ) {
        return;
      }

      const nome = regNomeInput.value.trim();
      const cognome = regCognomeInput.value.trim();
      const username = regUsernameInput.value.trim();
      const password = regPasswordInput.value;
      const ruolo = regRuoloSelect.value;

      const res = registraNuovoUtente(ruolo, nome, cognome, username, password);

      if (!res.success) {
        if (registerErrorBox) {
          registerErrorBox.textContent = res.message;
        } else {
          alert(res.message);
        }
      } else {
        if (registerErrorBox) {
          registerErrorBox.textContent = "";
        }
        alert("✅ Registrazione completata! Ora effettua il login.");
        mostraVistaLogin();
      }
    });
  }

  // --- LOGOUT ---
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      effettuaLogout();
    });
  }
}

/* ============================================================
   11) INIZIALIZZAZIONE GENERALE DELL'APP
   ============================================================ */

/**
 * initApp:
 * - legge o crea i dati demo (titolare, farmacia, impostazioni)
 * - cache DOM
 * - setta gli event listeners
 * - se c'è un utente loggato in localStorage lo carica, altrimenti
 *   mostra la schermata iniziale.
 */
function initApp() {
  // Prima di tutto: inizializzo i dati demo se mancano
  try {
    inizializzaDemoSeNecessario();
  } catch (err) {
    console.error("Errore in inizializzaDemoSeNecessario:", err);
  }

  // Cache degli elementi DOM
  cacheDomReferences();

  // Event listeners
  setupEventListeners();

  // Verifico se esiste già un utente loggato
  const storedUser = leggiDaStorage(LS_KEY_CURRENT_USER, null);
  if (storedUser && storedUser.username && storedUser.ruolo) {
    currentUser = storedUser;
    mostraVistaPerRuolo();
  } else {
    mostraSchermataIniziale();
  }
}

// Avvio dell'app quando il DOM è pronto
document.addEventListener("DOMContentLoaded", initApp);
/* ============================================================
   12) CHIAVI LOCALSTORAGE PER I MODULI GESTIONALI
   ============================================================ */

const LS_KEY_IMPOSTAZIONI_FARMACIA = "fm_portale_impostazioni_farmacia";
const LS_KEY_TURNI_FARMACIA        = "fm_portale_turni_farmacia";
const LS_KEY_EVENTI                = "fm_portale_eventi";
const LS_KEY_PROMOZIONI            = "fm_portale_promozioni";

/* ============================================================
   13) HELPER GENERALE PER GENERARE ID SEMPLICI
   ============================================================ */

/**
 * generaIdSequenziale:
 * data una lista di oggetti con proprietà "id",
 * restituisce un nuovo id numerico incrementale.
 *
 * Esempio:
 *   [ {id: 1}, {id: 2}, {id: 5} ] -> ritorna 6
 */
function generaIdSequenziale(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return 1;
  }
  const max = list.reduce((acc, el) => {
    const n = typeof el.id === "number" ? el.id : parseInt(el.id, 10) || 0;
    return n > acc ? n : acc;
  }, 0);
  return max + 1;
}

/* ============================================================
   14) IMPOSTAZIONI FARMACIA + FARMACIA DI TURNO / APPOGGIO
   ============================================================ */

/**
 * getImpostazioniFarmacia:
 * legge da localStorage i dati generali della Farmacia
 * (nome, indirizzo, telefono, email, ecc.).
 * Se non esistono, crea un set di default e lo salva.
 */
function getImpostazioniFarmacia() {
  let impostazioni = leggiDaStorage(LS_KEY_IMPOSTAZIONI_FARMACIA, null);

  if (!impostazioni) {
    // Valori demo di base, modificabili dal Titolare
    impostazioni = {
      nomeFarmacia:   "Farmacia Montesano",
      indirizzo:      "Via Esempio 12, 75100 Matera (MT)",
      telefono:       "0835 000000",
      email:          "info@farmaciamontesano.it",
      sitoWeb:        "www.farmaciamontesano.it",
      colorePrimario: "#009879",    // per eventuali temi futuri
      coloreSecondario: "#1f7ae0"
    };
    salvaInStorage(LS_KEY_IMPOSTAZIONI_FARMACIA, impostazioni);
  }

  return impostazioni;
}

/**
 * salvaImpostazioniFarmacia:
 * salva in localStorage le impostazioni generali della farmacia.
 */
function salvaImpostazioniFarmacia(nuoveImpostazioni) {
  if (!nuoveImpostazioni || typeof nuoveImpostazioni !== "object") {
    console.warn("salvaImpostazioniFarmacia: dati non validi");
    return;
  }
  salvaInStorage(LS_KEY_IMPOSTAZIONI_FARMACIA, nuoveImpostazioni);
}

/**
 * getTurniFarmacia:
 * letto da localStorage:
 *  - farmacia di turno (nome, indirizzo, tel)
 *  - farmacia di appoggio (nome, indirizzo, tel)
 *
 * Se non ci sono dati, crea valori demo e li salva.
 */
function getTurniFarmacia() {
  let turni = leggiDaStorage(LS_KEY_TURNI_FARMACIA, null);

  if (!turni) {
    turni = {
      farmaciaTurnoNome:       "Farmacia Montesano",
      farmaciaTurnoIndirizzo:  "Via Esempio 12, 75100 Matera (MT)",
      farmaciaTurnoTelefono:   "0835 000000",

      farmaciaAppoggioNome:      "Farmacia Centrale",
      farmaciaAppoggioIndirizzo: "Via Roma 25, 75100 Matera (MT)",
      farmaciaAppoggioTelefono:  "0835 111111",

      // Info extra utili per clienti (es. orari notturni, specifiche turno)
      noteTurno: "Turno completo 00:00 – 24:00"
    };

    salvaInStorage(LS_KEY_TURNI_FARMACIA, turni);
  }

  return turni;
}

/**
 * salvaTurniFarmacia:
 * il Titolare da Impostazioni può cambiare questi valori
 * (farmacia di turno / appoggio).
 */
function salvaTurniFarmacia(nuoviTurni) {
  if (!nuoviTurni || typeof nuoviTurni !== "object") {
    console.warn("salvaTurniFarmacia: dati non validi");
    return;
  }
  salvaInStorage(LS_KEY_TURNI_FARMACIA, nuoviTurni);
}

/* ============================================================
   15) EVENTI (VISIBILI IN DASHBOARD CLIENTE)
   ============================================================ */

/**
 * getEventi:
 * ritorna un array di eventi:
 *   [{ id, titolo, dataISO, descrizione }, ...]
 *
 * Se la lista non esiste, ne crea alcuni demo e li salva.
 */
function getEventi() {
  let eventi = leggiDaStorage(LS_KEY_EVENTI, null);

  if (!Array.isArray(eventi)) {
    eventi = [
      {
        id: 1,
        titolo: "Giornata misurazione pressione",
        dataISO: "2025-12-20",
        descrizione: "Misurazione gratuita della pressione arteriosa tutto il giorno."
      },
      {
        id: 2,
        titolo: "Consulenza dermocosmetica",
        dataISO: "2025-12-22",
        descrizione: "Consulente in farmacia per analisi pelle e consiglio prodotti."
      }
    ];
    salvaInStorage(LS_KEY_EVENTI, eventi);
  }

  return eventi;
}

/**
 * salvaEventi:
 * sovrascrive l'elenco completo di eventi.
 */
function salvaEventi(nuovaLista) {
  if (!Array.isArray(nuovaLista)) {
    console.warn("salvaEventi: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_EVENTI, nuovaLista);
}

/**
 * aggiungiEvento:
 * funzione di comodo per il Titolare (o Farmacia) per aggiungere un evento.
 */
function aggiungiEvento(titolo, dataISO, descrizione) {
  const eventi = getEventi();
  const id = generaIdSequenziale(eventi);

  const nuovo = {
    id,
    titolo: titolo || "Evento",
    dataISO: dataISO || new Date().toISOString().slice(0, 10),
    descrizione: descrizione || ""
  };

  eventi.push(nuovo);
  salvaEventi(eventi);
  return nuovo;
}

/**
 * eliminaEvento:
 * rimuove un evento per id.
 */
function eliminaEvento(id) {
  const eventi = getEventi();
  const filtrati = eventi.filter(ev => ev.id !== id);
  salvaEventi(filtrati);
}

/* ============================================================
   16) PROMOZIONI (CAROSELLO CLIENTI)
   ============================================================ */

/**
 * getPromozioni:
 * restituisce array di promozioni:
 *  [
 *    {
 *      id,
 *      titolo,
 *      descrizioneBreve,
 *      prezzo,          // stringa (es. "€ 9,90")
 *      prezzoPieno,     // opzionale (es. "€ 14,90")
 *      coloreBox,       // background card promo
 *      evidenza         // boolean: se evidenziata
 *    },
 *    ...
 *  ]
 *
 * Se non trovate, genera promozioni demo.
 */
function getPromozioni() {
  let promo = leggiDaStorage(LS_KEY_PROMOZIONI, null);

  if (!Array.isArray(promo)) {
    promo = [
      {
        id: 1,
        titolo: "Fermenti lattici Yovis 10 flaconcini",
        descrizioneBreve: "Supporto per l'equilibrio della flora intestinale.",
        prezzo: "€ 9,90",
        prezzoPieno: "€ 14,90",
        coloreBox: "#e3f2fd",
        evidenza: true
      },
      {
        id: 2,
        titolo: "Vitamina C 1000mg 20 cpr",
        descrizioneBreve: "Per sostenere le difese immunitarie.",
        prezzo: "€ 6,50",
        prezzoPieno: "€ 9,90",
        coloreBox: "#fce4ec",
        evidenza: false
      },
      {
        id: 3,
        titolo: "Crema mani nutriente",
        descrizioneBreve: "Mani morbide e idratate anche in inverno.",
        prezzo: "€ 4,90",
        prezzoPieno: "",
        coloreBox: "#e8f5e9",
        evidenza: false
      }
    ];
    salvaInStorage(LS_KEY_PROMOZIONI, promo);
  }

  return promo;
}

/**
 * salvaPromozioni:
 * salva l'intera lista di promozioni.
 */
function salvaPromozioni(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaPromozioni: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_PROMOZIONI, lista);
}

/**
 * aggiungiPromozione:
 * funzione di comodo per aggiungere una promo.
 */
function aggiungiPromozione({
  titolo,
  descrizioneBreve,
  prezzo,
  prezzoPieno = "",
  coloreBox = "#f5f5f5",
  evidenza = false
}) {
  const promo = getPromozioni();
  const id = generaIdSequenziale(promo);

  const nuova = {
    id,
    titolo: titolo || "Promozione",
    descrizioneBreve: descrizioneBreve || "",
    prezzo: prezzo || "",
    prezzoPieno,
    coloreBox,
    evidenza: !!evidenza
  };

  promo.push(nuova);
  salvaPromozioni(promo);
  return nuova;
}

/**
 * eliminaPromozione:
 * rimuove una promozione per id.
 */
function eliminaPromozione(id) {
  const promo = getPromozioni();
  const filtrate = promo.filter(p => p.id !== id);
  salvaPromozioni(filtrate);
}
/* ============================================================
   17) CHIAVI LOCALSTORAGE MODULI GESTIONALI
   ============================================================ */

const LS_KEY_ASSENZE        = "fm_portale_assenze";
const LS_KEY_COMUNICAZIONI  = "fm_portale_comunicazioni";
const LS_KEY_ARRIVI         = "fm_portale_arrivi";
const LS_KEY_SCADENZE       = "fm_portale_scadenze";
const LS_KEY_SCORTE         = "fm_portale_scorte";
const LS_KEY_CAMBIO_CASSA   = "fm_portale_cambiocassa";
const LS_KEY_ARCHIVIO       = "fm_portale_archivio_file";

/* ============================================================
   18) ASSENZE PERSONALE
   ============================================================ */
/**
 * Struttura singola assenza:
 * {
 *   id: number,
 *   nome: string,
 *   dataISO: "YYYY-MM-DD",
 *   motivo: string,
 *   creatoDaRuolo: "titolare" | "farmacia" | "dipendente",
 *   creatoDaUtente: "Valerio" ecc...
 * }
 */

/**
 * getAssenze:
 * legge l'elenco assenze da localStorage.
 * Se non esiste, crea qualche riga demo.
 */
function getAssenze() {
  let assenze = leggiDaStorage(LS_KEY_ASSENZE, null);

  if (!Array.isArray(assenze)) {
    assenze = [
      {
        id: 1,
        nome: "Cosimo",
        dataISO: "2025-12-18",
        motivo: "Ferie",
        creatoDaRuolo: RUOLO_TITOLARE,
        creatoDaUtente: "Titolare"
      },
      {
        id: 2,
        nome: "Patrizia",
        dataISO: "2025-12-19",
        motivo: "Permesso",
        creatoDaRuolo: RUOLO_TITOLARE,
        creatoDaUtente: "Titolare"
      }
    ];
    salvaInStorage(LS_KEY_ASSENZE, assenze);
  }

  return assenze;
}

/**
 * salvaAssenze:
 * sovrascrive l'elenco completo delle assenze.
 */
function salvaAssenze(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaAssenze: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_ASSENZE, lista);
}

/**
 * aggiungiAssenza:
 * aggiunge una nuova riga di assenza.
 */
function aggiungiAssenza({ nome, dataISO, motivo, creatoDaRuolo, creatoDaUtente }) {
  const assenze = getAssenze();
  const id = generaIdSequenziale(assenze);

  const nuova = {
    id,
    nome: nome || "",
    dataISO: dataISO || new Date().toISOString().slice(0, 10),
    motivo: motivo || "",
    creatoDaRuolo: creatoDaRuolo || RUOLO_TITOLARE,
    creatoDaUtente: creatoDaUtente || ""
  };

  assenze.push(nuova);
  salvaAssenze(assenze);
  return nuova;
}

/**
 * eliminaAssenza:
 * rimuove un record di assenza per id.
 */
function eliminaAssenza(id) {
  const assenze = getAssenze();
  const filtrate = assenze.filter(a => a.id !== id);
  salvaAssenze(filtrate);
}

/* ============================================================
   19) COMUNICAZIONI INTERNE
   ============================================================ */
/**
 * Struttura comunicazione:
 * {
 *   id: number,
 *   titolo: string,
 *   testo: string,
 *   dataISO: "YYYY-MM-DD",
 *   autoreRuolo: "titolare" | "farmacia" | "dipendente",
 *   autoreNome: string,
 *   visibileAFarmacia: boolean,
 *   visibileADipendenti: boolean,
 *   visibileAClienti: boolean
 * }
 */

/**
 * getComunicazioni:
 * legge la bacheca interna da localStorage.
 * Se vuota, crea alcune comunicazioni demo.
 */
function getComunicazioni() {
  let comunicazioni = leggiDaStorage(LS_KEY_COMUNICAZIONI, null);

  if (!Array.isArray(comunicazioni)) {
    const oggiISO = new Date().toISOString().slice(0, 10);

    comunicazioni = [
      {
        id: 1,
        titolo: "Nuova procedura notturni",
        testo: "Dal prossimo turno seguire la nuova check-list di chiusura farmacia.",
        dataISO: oggiISO,
        autoreRuolo: RUOLO_TITOLARE,
        autoreNome: "Titolare",
        visibileAFarmacia: true,
        visibileADipendenti: true,
        visibileAClienti: false
      },
      {
        id: 2,
        titolo: "Verifica armadietto stupefacenti",
        testo: "Controllare giacenze e scadenze entro fine settimana.",
        dataISO: oggiISO,
        autoreRuolo: RUOLO_TITOLARE,
        autoreNome: "Titolare",
        visibileAFarmacia: true,
        visibileADipendenti: true,
        visibileAClienti: false
      },
      {
        id: 3,
        titolo: "Evento dermocosmesi",
        testo: "Sabato consulente in farmacia, visibile anche ai clienti in app.",
        dataISO: oggiISO,
        autoreRuolo: RUOLO_TITOLARE,
        autoreNome: "Titolare",
        visibileAFarmacia: true,
        visibileADipendenti: true,
        visibileAClienti: true
      }
    ];
    salvaInStorage(LS_KEY_COMUNICAZIONI, comunicazioni);
  }

  return comunicazioni;
}

/**
 * salvaComunicazioni:
 * sovrascrive l'intera bacheca.
 */
function salvaComunicazioni(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaComunicazioni: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_COMUNICAZIONI, lista);
}

/**
 * aggiungiComunicazione:
 * aggiunge una nuova comunicazione interna.
 */
function aggiungiComunicazione({
  titolo,
  testo,
  autoreRuolo,
  autoreNome,
  visibileAFarmacia = true,
  visibileADipendenti = true,
  visibileAClienti = false
}) {
  const lista = getComunicazioni();
  const id = generaIdSequenziale(lista);

  const oggiISO = new Date().toISOString().slice(0, 10);

  const nuova = {
    id,
    titolo: titolo || "Comunicazione",
    testo: testo || "",
    dataISO: oggiISO,
    autoreRuolo: autoreRuolo || RUOLO_TITOLARE,
    autoreNome: autoreNome || "",
    visibileAFarmacia: !!visibileAFarmacia,
    visibileADipendenti: !!visibileADipendenti,
    visibileAClienti: !!visibileAClienti
  };

  lista.unshift(nuova); // in cima
  salvaComunicazioni(lista);
  return nuova;
}

/**
 * filtraComunicazioniPerRuolo:
 * ritorna solo le comunicazioni visibili a un certo ruolo
 * (titolare vede tutto).
 */
function filtraComunicazioniPerRuolo(ruolo) {
  const lista = getComunicazioni();

  if (ruolo === RUOLO_TITOLARE || ruolo === RUOLO_FARMACIA) {
    // Titolare e Farmacia vedono tutto
    return lista;
  }

  if (ruolo === RUOLO_DIPENDENTE) {
    return lista.filter(c => c.visibileADipendenti);
  }

  if (ruolo === RUOLO_CLIENTE) {
    return lista.filter(c => c.visibileAClienti);
  }

  return lista;
}

/* ============================================================
   20) ARRIVI (CORRIERI, ESPOSITORI, ECC.)
   ============================================================ */
/**
 * Struttura arrivo:
 * {
 *   id: number,
 *   dataISO: "YYYY-MM-DD",
 *   fornitore: string,
 *   descrizione: string,
 *   urgente: boolean,
 *   creatoDaRuolo: string,
 *   creatoDaUtente: string
 * }
 */

function getArrivi() {
  let arrivi = leggiDaStorage(LS_KEY_ARRIVI, null);

  if (!Array.isArray(arrivi)) {
    const oggiISO = new Date().toISOString().slice(0, 10);
    arrivi = [
      {
        id: 1,
        dataISO: oggiISO,
        fornitore: "Unico",
        descrizione: "Espositore dermocosmesi + ricarico scaffali banco 1",
        urgente: true,
        creatoDaRuolo: RUOLO_TITOLARE,
        creatoDaUtente: "Titolare"
      },
      {
        id: 2,
        dataISO: oggiISO,
        fornitore: "Alliance",
        descrizione: "Ordine giornaliero + tamponi rapidi",
        urgente: false,
        creatoDaRuolo: RUOLO_FARMACIA,
        creatoDaUtente: "Farmacia"
      }
    ];
    salvaInStorage(LS_KEY_ARRIVI, arrivi);
  }

  return arrivi;
}

function salvaArrivi(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaArrivi: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_ARRIVI, lista);
}

function aggiungiArrivo({ dataISO, fornitore, descrizione, urgente, creatoDaRuolo, creatoDaUtente }) {
  const arrivi = getArrivi();
  const id = generaIdSequenziale(arrivi);

  const nuovo = {
    id,
    dataISO: dataISO || new Date().toISOString().slice(0, 10),
    fornitore: fornitore || "",
    descrizione: descrizione || "",
    urgente: !!urgente,
    creatoDaRuolo: creatoDaRuolo || "",
    creatoDaUtente: creatoDaUtente || ""
  };

  arrivi.unshift(nuovo);
  salvaArrivi(arrivi);
  return nuovo;
}

function eliminaArrivo(id) {
  const arrivi = getArrivi();
  const filtrati = arrivi.filter(a => a.id !== id);
  salvaArrivi(filtrati);
}

/* ============================================================
   21) SCADENZE PRODOTTI (NON FARMACOLOGICHE / MISTE)
   ============================================================ */
/**
 * Struttura scadenza:
 * {
 *   id: number,
 *   descrizione: string,
 *   dataScadenzaISO: "YYYY-MM-DD",
 *   note: string
 * }
 */

function getScadenze() {
  let scadenze = leggiDaStorage(LS_KEY_SCADENZE, null);

  if (!Array.isArray(scadenze)) {
    scadenze = [
      {
        id: 1,
        descrizione: "Crema viso idratante 50ml",
        dataScadenzaISO: "2026-01-15",
        note: "Riporre in vetrina promo 30 giorni prima."
      },
      {
        id: 2,
        descrizione: "Integratore vitamina D gocce",
        dataScadenzaISO: "2025-12-30",
        note: "Controllare giacenza magazzino."
      },
      {
        id: 3,
        descrizione: "Fermenti lattici bambini",
        dataScadenzaISO: "2025-12-22",
        note: "Spingere sul banco e affiancare cartello promozionale."
      }
    ];
    salvaInStorage(LS_KEY_SCADENZE, scadenze);
  }

  return scadenze;
}

function salvaScadenze(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaScadenze: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_SCADENZE, lista);
}

function aggiungiScadenza({ descrizione, dataScadenzaISO, note }) {
  const scadenze = getScadenze();
  const id = generaIdSequenziale(scadenze);

  const nuova = {
    id,
    descrizione: descrizione || "",
    dataScadenzaISO: dataScadenzaISO || new Date().toISOString().slice(0, 10),
    note: note || ""
  };

  scadenze.push(nuova);
  salvaScadenze(scadenze);
  return nuova;
}

function eliminaScadenza(id) {
  const scadenze = getScadenze();
  const filtrate = scadenze.filter(s => s.id !== id);
  salvaScadenze(filtrate);
}

/**
 * isScadenzaEntroGiorni:
 * Ritorna true se la dataScadenzaISO è entro "giorni" rispetto ad oggi.
 * (serve per colorare di rosso quelle entro 45 giorni)
 */
function isScadenzaEntroGiorni(scadenza, giorni) {
  if (!scadenza || !scadenza.dataScadenzaISO) return false;
  const oggi = new Date();
  const data = new Date(scadenza.dataScadenzaISO);
  const diffMs = data.getTime() - oggi.getTime();
  const diffG = diffMs / (1000 * 60 * 60 * 24);
  return diffG <= giorni;
}

/* ============================================================
   22) SCORTE SERVIZI INTERNI (carta igienica, rotoli, ecc.)
   ============================================================ */
/**
 * Struttura scorta:
 * {
 *   id: number,
 *   nome: string,
 *   quantita: number,
 *   livelloMinimo: number,
 *   note: string,
 *   scortaBassaSegnalata: boolean
 * }
 */

function getScorte() {
  let scorte = leggiDaStorage(LS_KEY_SCORTE, null);

  if (!Array.isArray(scorte)) {
    scorte = [
      {
        id: 1,
        nome: "Carta igienica",
        quantita: 24,
        livelloMinimo: 8,
        note: "Scorta per bagno clienti e bagno personale",
        scortaBassaSegnalata: false
      },
      {
        id: 2,
        nome: "Rotoli POS",
        quantita: 15,
        livelloMinimo: 10,
        note: "Controllare mensilmente",
        scortaBassaSegnalata: false
      },
      {
        id: 3,
        nome: "Toner Brother",
        quantita: 2,
        livelloMinimo: 1,
        note: "Stampante laboratorio",
        scortaBassaSegnalata: false
      }
    ];
    salvaInStorage(LS_KEY_SCORTE, scorte);
  }

  return scorte;
}

function salvaScorte(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaScorte: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_SCORTE, lista);
}

function aggiungiScorta({ nome, quantita, livelloMinimo, note }) {
  const scorte = getScorte();
  const id = generaIdSequenziale(scorte);

  const nuova = {
    id,
    nome: nome || "",
    quantita: typeof quantita === "number" ? quantita : 0,
    livelloMinimo: typeof livelloMinimo === "number" ? livelloMinimo : 0,
    note: note || "",
    scortaBassaSegnalata: false
  };

  scorte.push(nuova);
  salvaScorte(scorte);
  return nuova;
}

/**
 * segnaScortaBassa:
 * usata da Farmacia / Dipendenti per segnalare che un prodotto
 * è sotto scorta / sta finendo.
 */
function segnaScortaBassa(id) {
  const scorte = getScorte();
  const item = scorte.find(s => s.id === id);
  if (!item) return;

  item.scortaBassaSegnalata = true;
  salvaScorte(scorte);
}

/* ============================================================
   23) CAMBIO CASSA
   ============================================================ */
/**
 * Struttura cambio cassa:
 * {
 *   id: number,
 *   dataISO: "YYYY-MM-DD",
 *   turno: string,         // es. "Mattina", "Pomeriggio", "Notte"
 *   dettagliImporti: string,
 *   note: string,
 *   creatoDaRuolo: string,
 *   creatoDaUtente: string
 * }
 */

function getCambiCassa() {
  let cambi = leggiDaStorage(LS_KEY_CAMBIO_CASSA, null);

  if (!Array.isArray(cambi)) {
    const oggiISO = new Date().toISOString().slice(0, 10);
    cambi = [
      {
        id: 1,
        dataISO: oggiISO,
        turno: "Mattina",
        dettagliImporti: "50€ in monete (1€ / 2€)",
        note: "Richiesta banco 1",
        creatoDaRuolo: RUOLO_FARMACIA,
        creatoDaUtente: "Farmacia"
      },
      {
        id: 2,
        dataISO: oggiISO,
        turno: "Pomeriggio",
        dettagliImporti: "2×20€ · 2×10€ · monete miste",
        note: "Fondo cassa turno serale",
        creatoDaRuolo: RUOLO_DIPENDENTE,
        creatoDaUtente: "Banco 2"
      }
    ];
    salvaInStorage(LS_KEY_CAMBIO_CASSA, cambi);
  }

  return cambi;
}

function salvaCambiCassa(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaCambiCassa: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_CAMBIO_CASSA, lista);
}

function aggiungiCambioCassa({ dataISO, turno, dettagliImporti, note, creatoDaRuolo, creatoDaUtente }) {
  const cambi = getCambiCassa();
  const id = generaIdSequenziale(cambi);

  const nuovo = {
    id,
    dataISO: dataISO || new Date().toISOString().slice(0, 10),
    turno: turno || "",
    dettagliImporti: dettagliImporti || "",
    note: note || "",
    creatoDaRuolo: creatoDaRuolo || "",
    creatoDaUtente: creatoDaUtente || ""
  };

  cambi.unshift(nuovo);
  salvaCambiCassa(cambi);
  return nuovo;
}

function eliminaCambioCassa(id) {
  const cambi = getCambiCassa();
  const filtrati = cambi.filter(c => c.id !== id);
  salvaCambiCassa(filtrati);
}

/* ============================================================
   24) ARCHIVIO FILE (SOLO METADATI, NO UPLOAD REALE)
   ============================================================ */
/**
 * Struttura voce archivio:
 * {
 *   id: number,
 *   nomeFile: string,
 *   categoria: string,
 *   link: string,         // link esterno o "n.d."
 *   descrizione: string
 * }
 */

function getArchivioVoci() {
  let voci = leggiDaStorage(LS_KEY_ARCHIVIO, null);

  if (!Array.isArray(voci)) {
    voci = [
      {
        id: 1,
        nomeFile: "Procedura_chiusura_cassa.pdf",
        categoria: "Procedure",
        link: "#",
        descrizione: "Versione aggiornata procedura chiusura cassa serale."
      },
      {
        id: 2,
        nomeFile: "Turni_dicembre_2025.xlsx",
        categoria: "Turni",
        link: "#",
        descrizione: "Turni mensili personale dicembre 2025."
      },
      {
        id: 3,
        nomeFile: "Check-list_logistica.txt",
        categoria: "Logistica",
        link: "#",
        descrizione: "Lista di controllo arrivi corrieri e espositori."
      }
    ];
    salvaInStorage(LS_KEY_ARCHIVIO, voci);
  }

  return voci;
}

function salvaArchivioVoci(lista) {
  if (!Array.isArray(lista)) {
    console.warn("salvaArchivioVoci: lista non valida");
    return;
  }
  salvaInStorage(LS_KEY_ARCHIVIO, lista);
}

function aggiungiArchivioVoce({ nomeFile, categoria, link, descrizione }) {
  const voci = getArchivioVoci();
  const id = generaIdSequenziale(voci);

  const nuova = {
    id,
    nomeFile: nomeFile || "Documento",
    categoria: categoria || "Altro",
    link: link || "#",
    descrizione: descrizione || ""
  };

  voci.push(nuova);
  salvaArchivioVoci(voci);
  return nuova;
}

function eliminaArchivioVoce(id) {
  const voci = getArchivioVoci();
  const filtrate = voci.filter(v => v.id !== id);
  salvaArchivioVoci(filtrate);
}
/* ============================================================
   25) RIFERIMENTI DOM MODULI GESTIONALI
   ------------------------------------------------------------
   Qui NON agganciamo ancora gli eventi globali (login ecc.),
   ma solo i riferimenti per le pagine "gestionali":
   - Assenze
   - Comunicazioni
   - Arrivi
   - Scadenze
   - Scorte
   - Cambio cassa
   - Archivio file
   ============================================================ */

const domModuli = {
  assenze: {
    tableBody: null,
    form: null,
    inputNome: null,
    inputData: null,
    inputMotivo: null
  },
  comunicazioni: {
    list: null,
    form: null,
    inputTitolo: null,
    inputTesto: null,
    checkFarmacia: null,
    checkDipendenti: null,
    checkClienti: null
  },
  arrivi: {
    tableBody: null,
    form: null,
    inputData: null,
    inputFornitore: null,
    inputDescrizione: null,
    inputUrgente: null
  },
  scadenze: {
    tableBody: null,
    form: null,
    inputDescrizione: null,
    inputData: null,
    inputNote: null
  },
  scorte: {
    tableBody: null,
    form: null,
    inputNome: null,
    inputQuantita: null,
    inputMinimo: null,
    inputNote: null
  },
  cambioCassa: {
    tableBody: null,
    form: null,
    inputData: null,
    inputTurno: null,
    inputDettagli: null,
    inputNote: null
  },
  archivio: {
    tableBody: null,
    form: null,
    inputNomeFile: null,
    inputCategoria: null,
    inputLink: null,
    inputDescrizione: null
  }
};

/**
 * cacheDomModuli:
 * chiamiamo questa funzione una sola volta all'inizializzazione
 * per salvare comodi riferimenti agli elementi HTML.
 *
 * NOTA:
 * - tutti questi ID sono "convenzionali":
 *   se nel tuo index.html usi nomi diversi,
 *   basta modificare qui.
 */
function cacheDomModuli() {
  // Assenze
  domModuli.assenze.tableBody   = document.getElementById("assenzeTableBody");
  domModuli.assenze.form        = document.getElementById("assenzeForm");
  domModuli.assenze.inputNome   = document.getElementById("assenzaNome");
  domModuli.assenze.inputData   = document.getElementById("assenzaData");
  domModuli.assenze.inputMotivo = document.getElementById("assenzaMotivo");

  // Comunicazioni
  domModuli.comunicazioni.list          = document.getElementById("comunicazioniList");
  domModuli.comunicazioni.form          = document.getElementById("comunicazioniForm");
  domModuli.comunicazioni.inputTitolo   = document.getElementById("comTitolo");
  domModuli.comunicazioni.inputTesto    = document.getElementById("comTesto");
  domModuli.comunicazioni.checkFarmacia = document.getElementById("comVisibileFarmacia");
  domModuli.comunicazioni.checkDipendenti = document.getElementById("comVisibileDipendenti");
  domModuli.comunicazioni.checkClienti  = document.getElementById("comVisibileClienti");

  // Arrivi
  domModuli.arrivi.tableBody      = document.getElementById("arriviTableBody");
  domModuli.arrivi.form           = document.getElementById("arriviForm");
  domModuli.arrivi.inputData      = document.getElementById("arrivoData");
  domModuli.arrivi.inputFornitore = document.getElementById("arrivoFornitore");
  domModuli.arrivi.inputDescrizione = document.getElementById("arrivoDescrizione");
  domModuli.arrivi.inputUrgente   = document.getElementById("arrivoUrgente");

  // Scadenze
  domModuli.scadenze.tableBody     = document.getElementById("scadenzeTableBody");
  domModuli.scadenze.form          = document.getElementById("scadenzeForm");
  domModuli.scadenze.inputDescrizione = document.getElementById("scadenzaDescrizione");
  domModuli.scadenze.inputData     = document.getElementById("scadenzaData");
  domModuli.scadenze.inputNote     = document.getElementById("scadenzaNote");

  // Scorte
  domModuli.scorte.tableBody   = document.getElementById("scorteTableBody");
  domModuli.scorte.form        = document.getElementById("scorteForm");
  domModuli.scorte.inputNome   = document.getElementById("scortaNome");
  domModuli.scorte.inputQuantita = document.getElementById("scortaQuantita");
  domModuli.scorte.inputMinimo = document.getElementById("scortaMinimo");
  domModuli.scorte.inputNote   = document.getElementById("scortaNote");

  // Cambio cassa
  domModuli.cambioCassa.tableBody     = document.getElementById("cambioCassaTableBody");
  domModuli.cambioCassa.form          = document.getElementById("cambioCassaForm");
  domModuli.cambioCassa.inputData     = document.getElementById("cambioData");
  domModuli.cambioCassa.inputTurno    = document.getElementById("cambioTurno");
  domModuli.cambioCassa.inputDettagli = document.getElementById("cambioDettagli");
  domModuli.cambioCassa.inputNote     = document.getElementById("cambioNote");

  // Archivio file
  domModuli.archivio.tableBody        = document.getElementById("archivioTableBody");
  domModuli.archivio.form             = document.getElementById("archivioForm");
  domModuli.archivio.inputNomeFile    = document.getElementById("archivioNomeFile");
  domModuli.archivio.inputCategoria   = document.getElementById("archivioCategoria");
  domModuli.archivio.inputLink        = document.getElementById("archivioLink");
  domModuli.archivio.inputDescrizione = document.getElementById("archivioDescrizione");
}

/* ============================================================
   26) RENDER PAGINA ASSENZE
   ============================================================ */

/**
 * renderAssenzeTable:
 * riempie la tabella delle assenze con i dati da localStorage.
 *
 * Tabella HTML prevista:
 * <tbody id="assenzeTableBody"></tbody>
 *  colonne: Nome | Data | Motivo | Azioni
 */
function renderAssenzeTable() {
  const tb = domModuli.assenze.tableBody;
  if (!tb) return;

  const assenze = getAssenze();
  tb.innerHTML = "";

  if (assenze.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Nessuna assenza registrata.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  assenze
    .sort((a, b) => (a.dataISO > b.dataISO ? 1 : -1))
    .forEach(rec => {
      const tr = document.createElement("tr");

      const tdNome = document.createElement("td");
      tdNome.textContent = rec.nome;

      const tdData = document.createElement("td");
      tdData.textContent = formatDateIT(rec.dataISO);

      const tdMotivo = document.createElement("td");
      tdMotivo.textContent = rec.motivo || "";

      const tdAzioni = document.createElement("td");
      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn-secondary btn-table";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        if (confirm(`Eliminare assenza di ${rec.nome}?`)) {
          eliminaAssenza(rec.id);
          renderAssenzeTable();
        }
      });
      tdAzioni.appendChild(btnDel);

      tr.appendChild(tdNome);
      tr.appendChild(tdData);
      tr.appendChild(tdMotivo);
      tr.appendChild(tdAzioni);
      tb.appendChild(tr);
    });
}

/**
 * bindAssenzeForm:
 * collega il form "Nuova assenza" al modulo dati.
 *
 * Form HTML previsto:
 * <form id="assenzeForm">
 *   <input id="assenzaNome">
 *   <input id="assenzaData" type="date">
 *   <input id="assenzaMotivo">
 * </form>
 */
function bindAssenzeForm() {
  const f = domModuli.assenze.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = domModuli.assenze.inputNome ? domModuli.assenze.inputNome.value.trim() : "";
    const dataISO = domModuli.assenze.inputData ? domModuli.assenze.inputData.value : "";
    const motivo = domModuli.assenze.inputMotivo ? domModuli.assenze.inputMotivo.value.trim() : "";

    if (!nome) {
      alert("Inserisci almeno il nome.");
      return;
    }

    const utente = getUtenteLoggato();
    aggiungiAssenza({
      nome,
      dataISO,
      motivo,
      creatoDaRuolo: utente ? utente.role : "",
      creatoDaUtente: utente ? utente.fullName || utente.username : ""
    });

    f.reset();
    renderAssenzeTable();
  });
}

/* ============================================================
   27) RENDER PAGINA COMUNICAZIONI
   ============================================================ */

/**
 * renderComunicazioniList:
 * riempie la "bacheca" delle comunicazioni.
 *
 * Contenitore HTML previsto:
 * <div id="comunicazioniList"></div>
 */
function renderComunicazioniList() {
  const wrap = domModuli.comunicazioni.list;
  if (!wrap) return;

  const utente = getUtenteLoggato();
  const ruolo = utente ? utente.role : null;

  const lista = ruolo ? filtraComunicazioniPerRuolo(ruolo) : getComunicazioni();

  wrap.innerHTML = "";

  if (lista.length === 0) {
    const p = document.createElement("p");
    p.className = "small-text";
    p.textContent = "Nessuna comunicazione presente.";
    wrap.appendChild(p);
    return;
  }

  lista
    .sort((a, b) => (a.dataISO < b.dataISO ? 1 : -1))
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "com-card";

      const pill = document.createElement("div");
      pill.className = "com-pill informativa";
      pill.textContent = (c.autoreRuolo || "Info").toUpperCase();

      const title = document.createElement("div");
      title.className = "com-title";
      title.textContent = c.titolo;

      const meta = document.createElement("div");
      meta.className = "com-meta";
      const dataStr = c.dataISO ? formatDateIT(c.dataISO) : "";
      meta.textContent = `${dataStr} · ${c.autoreNome || c.autoreRuolo || ""}`;

      const text = document.createElement("div");
      text.className = "com-text";
      text.textContent = c.testo;

      card.appendChild(pill);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(text);

      wrap.appendChild(card);
    });
}

/**
 * bindComunicazioniForm:
 * collega il form "Nuova comunicazione".
 *
 * Form HTML previsto:
 * <form id="comunicazioniForm">
 *   <input id="comTitolo">
 *   <textarea id="comTesto"></textarea>
 *   <input type="checkbox" id="comVisibileFarmacia">
 *   <input type="checkbox" id="comVisibileDipendenti">
 *   <input type="checkbox" id="comVisibileClienti">
 * </form>
 */
function bindComunicazioniForm() {
  const f = domModuli.comunicazioni.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const titolo = domModuli.comunicazioni.inputTitolo
      ? domModuli.comunicazioni.inputTitolo.value.trim()
      : "";
    const testo = domModuli.comunicazioni.inputTesto
      ? domModuli.comunicazioni.inputTesto.value.trim()
      : "";

    if (!titolo || !testo) {
      alert("Inserisci almeno titolo e testo.");
      return;
    }

    const utente = getUtenteLoggato();
    const ruolo = utente ? utente.role : RUOLO_FARMACIA;
    const nome = utente ? utente.fullName || utente.username : "";

    const visFarmacia = domModuli.comunicazioni.checkFarmacia
      ? domModuli.comunicazioni.checkFarmacia.checked
      : true;
    const visDip = domModuli.comunicazioni.checkDipendenti
      ? domModuli.comunicazioni.checkDipendenti.checked
      : true;
    const visCli = domModuli.comunicazioni.checkClienti
      ? domModuli.comunicazioni.checkClienti.checked
      : false;

    aggiungiComunicazione({
      titolo,
      testo,
      autoreRuolo: ruolo,
      autoreNome: nome,
      visibileAFarmacia: visFarmacia,
      visibileADipendenti: visDip,
      visibileAClienti: visCli
    });

    f.reset();
    renderComunicazioniList();
  });
}

/* ============================================================
   28) RENDER PAGINA ARRIVI
   ============================================================ */

function renderArriviTable() {
  const tb = domModuli.arrivi.tableBody;
  if (!tb) return;

  const arrivi = getArrivi();
  tb.innerHTML = "";

  if (arrivi.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Nessun arrivo registrato.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  arrivi.forEach(a => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(a.dataISO);

    const tdFornitore = document.createElement("td");
    tdFornitore.textContent = a.fornitore;

    const tdDescrizione = document.createElement("td");
    tdDescrizione.textContent = a.descrizione;

    const tdUrgente = document.createElement("td");
    tdUrgente.textContent = a.urgente ? "URGENTE" : "-";

    const tdAzioni = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-secondary btn-table";
    btnDel.textContent = "Elimina";
    btnDel.addEventListener("click", () => {
      if (confirm("Eliminare questo arrivo?")) {
        eliminaArrivo(a.id);
        renderArriviTable();
      }
    });
    tdAzioni.appendChild(btnDel);

    tr.appendChild(tdData);
    tr.appendChild(tdFornitore);
    tr.appendChild(tdDescrizione);
    tr.appendChild(tdUrgente);
    tr.appendChild(tdAzioni);
    tb.appendChild(tr);
  });
}

function bindArriviForm() {
  const f = domModuli.arrivi.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const dataISO = domModuli.arrivi.inputData ? domModuli.arrivi.inputData.value : "";
    const fornitore = domModuli.arrivi.inputFornitore
      ? domModuli.arrivi.inputFornitore.value.trim()
      : "";
    const descrizione = domModuli.arrivi.inputDescrizione
      ? domModuli.arrivi.inputDescrizione.value.trim()
      : "";
    const urgente = domModuli.arrivi.inputUrgente
      ? domModuli.arrivi.inputUrgente.checked
      : false;

    if (!fornitore || !descrizione) {
      alert("Inserisci almeno fornitore e descrizione.");
      return;
    }

    const utente = getUtenteLoggato();
    aggiungiArrivo({
      dataISO,
      fornitore,
      descrizione,
      urgente,
      creatoDaRuolo: utente ? utente.role : "",
      creatoDaUtente: utente ? utente.fullName || utente.username : ""
    });

    f.reset();
    renderArriviTable();
  });
}

/* ============================================================
   29) RENDER PAGINA SCADENZE
   ============================================================ */

function renderScadenzeTable() {
  const tb = domModuli.scadenze.tableBody;
  if (!tb) return;

  const scadenze = getScadenze();
  tb.innerHTML = "";

  if (scadenze.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Nessuna scadenza registrata.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  scadenze
    .sort((a, b) => (a.dataScadenzaISO > b.dataScadenzaISO ? 1 : -1))
    .forEach(rec => {
      const tr = document.createElement("tr");

      // se entro 45 giorni la coloriamo in rosso
      if (isScadenzaEntroGiorni(rec, 45)) {
        tr.classList.add("riga-scadenza-urgente");
      }

      const tdDescr = document.createElement("td");
      tdDescr.textContent = rec.descrizione;

      const tdData = document.createElement("td");
      tdData.textContent = formatDateIT(rec.dataScadenzaISO);

      const tdNote = document.createElement("td");
      tdNote.textContent = rec.note || "";

      const tdAzioni = document.createElement("td");
      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn-secondary btn-table";
      btnDel.textContent = "Elimina";
      btnDel.addEventListener("click", () => {
        if (confirm("Eliminare questa scadenza?")) {
          eliminaScadenza(rec.id);
          renderScadenzeTable();
        }
      });
      tdAzioni.appendChild(btnDel);

      tr.appendChild(tdDescr);
      tr.appendChild(tdData);
      tr.appendChild(tdNote);
      tr.appendChild(tdAzioni);
      tb.appendChild(tr);
    });
}

function bindScadenzeForm() {
  const f = domModuli.scadenze.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const descrizione = domModuli.scadenze.inputDescrizione
      ? domModuli.scadenze.inputDescrizione.value.trim()
      : "";
    const dataISO = domModuli.scadenze.inputData ? domModuli.scadenze.inputData.value : "";
    const note = domModuli.scadenze.inputNote
      ? domModuli.scadenze.inputNote.value.trim()
      : "";

    if (!descrizione) {
      alert("Inserisci almeno la descrizione del prodotto.");
      return;
    }

    aggiungiScadenza({
      descrizione,
      dataScadenzaISO: dataISO,
      note
    });

    f.reset();
    renderScadenzeTable();
  });
}

/* ============================================================
   30) RENDER PAGINA SCORTE
   ============================================================ */

function renderScorteTable() {
  const tb = domModuli.scorte.tableBody;
  if (!tb) return;

  const scorte = getScorte();
  tb.innerHTML = "";

  if (scorte.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Nessuna scorta interna registrata.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  scorte.forEach(s => {
    const tr = document.createElement("tr");

    if (s.scortaBassaSegnalata || (s.livelloMinimo && s.quantita <= s.livelloMinimo)) {
      tr.classList.add("riga-scorta-bassa");
    }

    const tdNome = document.createElement("td");
    tdNome.textContent = s.nome;

    const tdQuantita = document.createElement("td");
    tdQuantita.textContent = s.quantita;

    const tdMinimo = document.createElement("td");
    tdMinimo.textContent = s.livelloMinimo || "-";

    const tdNote = document.createElement("td");
    tdNote.textContent = s.note || "";

    const tdAzioni = document.createElement("td");

    const btnSegnala = document.createElement("button");
    btnSegnala.type = "button";
    btnSegnala.className = "btn-primary btn-table";
    btnSegnala.textContent = "Scorta bassa";
    btnSegnala.addEventListener("click", () => {
      segnaScortaBassa(s.id);
      renderScorteTable();
    });

    tdAzioni.appendChild(btnSegnala);
    tr.appendChild(tdNome);
    tr.appendChild(tdQuantita);
    tr.appendChild(tdMinimo);
    tr.appendChild(tdNote);
    tr.appendChild(tdAzioni);
    tb.appendChild(tr);
  });
}

function bindScorteForm() {
  const f = domModuli.scorte.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = domModuli.scorte.inputNome
      ? domModuli.scorte.inputNome.value.trim()
      : "";
    const quantitaRaw = domModuli.scorte.inputQuantita
      ? domModuli.scorte.inputQuantita.value
      : "";
    const minimoRaw = domModuli.scorte.inputMinimo
      ? domModuli.scorte.inputMinimo.value
      : "";
    const note = domModuli.scorte.inputNote
      ? domModuli.scorte.inputNote.value.trim()
      : "";

    if (!nome) {
      alert("Inserisci il nome della scorta (es. rotoli POS, toner, ecc.).");
      return;
    }

    const quantita = parseInt(quantitaRaw, 10) || 0;
    const minimo = parseInt(minimoRaw, 10) || 0;

    aggiungiScorta({
      nome,
      quantita,
      livelloMinimo: minimo,
      note
    });

    f.reset();
    renderScorteTable();
  });
}

/* ============================================================
   31) RENDER PAGINA CAMBIO CASSA
   ============================================================ */

function renderCambioCassaTable() {
  const tb = domModuli.cambioCassa.tableBody;
  if (!tb) return;

  const cambi = getCambiCassa();
  tb.innerHTML = "";

  if (cambi.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Nessuna operazione di cambio cassa registrata.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  cambi.forEach(c => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = formatDateIT(c.dataISO);

    const tdTurno = document.createElement("td");
    tdTurno.textContent = c.turno || "";

    const tdDettagli = document.createElement("td");
    tdDettagli.textContent = c.dettagliImporti || "";

    const tdNote = document.createElement("td");
    tdNote.textContent = c.note || "";

    const tdAzioni = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-secondary btn-table";
    btnDel.textContent = "Elimina";
    btnDel.addEventListener("click", () => {
      if (confirm("Eliminare questa operazione di cambio cassa?")) {
        eliminaCambioCassa(c.id);
        renderCambioCassaTable();
      }
    });
    tdAzioni.appendChild(btnDel);

    tr.appendChild(tdData);
    tr.appendChild(tdTurno);
    tr.appendChild(tdDettagli);
    tr.appendChild(tdNote);
    tr.appendChild(tdAzioni);
    tb.appendChild(tr);
  });
}

function bindCambioCassaForm() {
  const f = domModuli.cambioCassa.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const dataISO = domModuli.cambioCassa.inputData
      ? domModuli.cambioCassa.inputData.value
      : "";
    const turno = domModuli.cambioCassa.inputTurno
      ? domModuli.cambioCassa.inputTurno.value.trim()
      : "";
    const dettagli = domModuli.cambioCassa.inputDettagli
      ? domModuli.cambioCassa.inputDettagli.value.trim()
      : "";
    const note = domModuli.cambioCassa.inputNote
      ? domModuli.cambioCassa.inputNote.value.trim()
      : "";

    if (!turno && !dettagli) {
      alert("Inserisci almeno il turno e qualche dettaglio sugli importi.");
      return;
    }

    const utente = getUtenteLoggato();
    aggiungiCambioCassa({
      dataISO,
      turno,
      dettagliImporti: dettagli,
      note,
      creatoDaRuolo: utente ? utente.role : "",
      creatoDaUtente: utente ? utente.fullName || utente.username : ""
    });

    f.reset();
    renderCambioCassaTable();
  });
}

/* ============================================================
   32) RENDER PAGINA ARCHIVIO FILE
   ============================================================ */

function renderArchivioTable() {
  const tb = domModuli.archivio.tableBody;
  if (!tb) return;

  const voci = getArchivioVoci();
  tb.innerHTML = "";

  if (voci.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Archivio vuoto.";
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }

  voci.forEach(v => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = v.nomeFile;

    const tdCat = document.createElement("td");
    tdCat.textContent = v.categoria || "";

    const tdLink = document.createElement("td");
    if (v.link && v.link !== "#") {
      const a = document.createElement("a");
      a.href = v.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Apri";
      tdLink.appendChild(a);
    } else {
      tdLink.textContent = "-";
    }

    const tdAzioni = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-secondary btn-table";
    btnDel.textContent = "Elimina";
    btnDel.addEventListener("click", () => {
      if (confirm(`Eliminare "${v.nomeFile}" dall'archivio?`)) {
        eliminaArchivioVoce(v.id);
        renderArchivioTable();
      }
    });
    tdAzioni.appendChild(btnDel);

    tr.appendChild(tdNome);
    tr.appendChild(tdCat);
    tr.appendChild(tdLink);
    tr.appendChild(tdAzioni);
    tb.appendChild(tr);
  });
}

function bindArchivioForm() {
  const f = domModuli.archivio.form;
  if (!f) return;

  f.addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeFile = domModuli.archivio.inputNomeFile
      ? domModuli.archivio.inputNomeFile.value.trim()
      : "";
    const categoria = domModuli.archivio.inputCategoria
      ? domModuli.archivio.inputCategoria.value.trim()
      : "";
    const link = domModuli.archivio.inputLink
      ? domModuli.archivio.inputLink.value.trim()
      : "";
    const descrizione = domModuli.archivio.inputDescrizione
      ? domModuli.archivio.inputDescrizione.value.trim()
      : "";

    if (!nomeFile) {
      alert("Inserisci almeno il nome del file.");
      return;
    }

    aggiungiArchivioVoce({
      nomeFile,
      categoria,
      link,
      descrizione
    });

    f.reset();
    renderArchivioTable();
  });
}

/* ============================================================
   33) INIZIALIZZAZIONE MODULI GESTIONALI
   ------------------------------------------------------------
   Questa funzione verrà chiamata nella init generale (PARTE 7):
   - cacheDomModuli()
   - bind*Form()
   - render*Table()
   ============================================================ */

function initModuliGestionali() {
  cacheDomModuli();

  // Assenze
  bindAssenzeForm();
  renderAssenzeTable();

  // Comunicazioni
  bindComunicazioniForm();
  renderComunicazioniList();

  // Arrivi
  bindArriviForm();
  renderArriviTable();

  // Scadenze
  bindScadenzeForm();
  renderScadenzeTable();

  // Scorte
  bindScorteForm();
  renderScorteTable();

  // Cambio cassa
  bindCambioCassaForm();
  renderCambioCassaTable();

  // Archivio
  bindArchivioForm();
  renderArchivioTable();
}
/* ============================================================
   34) GESTIONE UTENTI / SESSIONE (VERSIONE 2, INDIPENDENTE)
   ------------------------------------------------------------
   Usiamo chiavi dedicate per NON andare in conflitto con
   eventuali test precedenti:
   - fm2_utenti
   - fm2_sessione
   ============================================================ */

var FM2_USERS_KEY = "fm2_utenti";
var FM2_SESSION_KEY = "fm2_sessione";

/**
 * fm2_loadUsers:
 * legge tutti gli utenti salvati per questo portale.
 */
function fm2_loadUsers() {
  try {
    var raw = localStorage.getItem(FM2_USERS_KEY);
    if (!raw) return [];
    var arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (e) {
    console.warn("Errore lettura utenti (fm2):", e);
    return [];
  }
}

/**
 * fm2_saveUsers:
 * salva l'array utenti in localStorage.
 */
function fm2_saveUsers(list) {
  try {
    localStorage.setItem(FM2_USERS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.warn("Errore salvataggio utenti (fm2):", e);
  }
}

/**
 * fm2_findUserById
 */
function fm2_findUserById(id) {
  var utenti = fm2_loadUsers();
  return utenti.find(function (u) { return u.id === id; }) || null;
}

/**
 * fm2_findUserByIdentifierAndPassword:
 * cerca per email/username + password.
 */
function fm2_findUserByIdentifierAndPassword(identifier, password) {
  var utenti = fm2_loadUsers();
  var ident = (identifier || "").trim().toLowerCase();
  return (
    utenti.find(function (u) {
      var userField = (u.username || "").toLowerCase();
      var emailField = (u.email || "").toLowerCase();
      return (userField === ident || emailField === ident) && u.password === password;
    }) || null
  );
}

/**
 * fm2_existsUserWithIdentifier:
 * controlla se esiste già un utente con quella email/username.
 */
function fm2_existsUserWithIdentifier(identifier) {
  var utenti = fm2_loadUsers();
  var ident = (identifier || "").trim().toLowerCase();
  return utenti.some(function (u) {
    var userField = (u.username || "").toLowerCase();
    var emailField = (u.email || "").toLowerCase();
    return userField === ident || emailField === ident;
  });
}

/**
 * fm2_addUser:
 * aggiunge un nuovo utente (dipendente o cliente) all'archivio.
 */
function fm2_addUser(data) {
  var utenti = fm2_loadUsers();

  var newUser = {
    id: "u_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    nome: data.nome || "",
    cognome: data.cognome || "",
    fullName: (data.nome || "") + " " + (data.cognome || ""),
    username: data.username || data.email || "",
    email: data.email || data.username || "",
    password: data.password || "",
    role: data.role || RUOLO_CLIENTE, // usa le costanti di ruolo già definite
    createdAt: new Date().toISOString()
  };

  utenti.push(newUser);
  fm2_saveUsers(utenti);
  return newUser;
}

/* ============================================================
   35) SESSIONE UTENTE (get/set/clear)
   ------------------------------------------------------------
   NOTA:
   - sovrascriviamo eventuali versioni precedenti di
     getUtenteLoggato / setUtenteLoggato / clearUtenteLoggato
   - tutti i moduli (assenze, comunicazioni, ecc.) useranno
     QUESTE versioni aggiornate.
   ============================================================ */

function getUtenteLoggato() {
  try {
    var raw = localStorage.getItem(FM2_SESSION_KEY);
    if (!raw) return null;
    var sessionData = JSON.parse(raw);
    if (!sessionData || !sessionData.userId) return null;

    // cerco l'utente completo
    var utente = fm2_findUserById(sessionData.userId);
    if (!utente) return null;
    return utente;
  } catch (e) {
    console.warn("Errore lettura sessione (fm2):", e);
    return null;
  }
}

function setUtenteLoggato(utente) {
  if (!utente || !utente.id) {
    clearUtenteLoggato();
    return;
  }
  try {
    var toStore = {
      userId: utente.id,
      role: utente.role,
      username: utente.username || utente.email || "",
      fullName: utente.fullName || (utente.nome || "") + " " + (utente.cognome || "")
    };
    localStorage.setItem(FM2_SESSION_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn("Errore salvataggio sessione (fm2):", e);
  }
}

function clearUtenteLoggato() {
  try {
    localStorage.removeItem(FM2_SESSION_KEY);
  } catch (e) {
    console.warn("Errore clear sessione (fm2):", e);
  }
}

/* ============================================================
   36) DATI DI DEFAULT: TITOLARE, FARMACIA, EVENTI, PROMO, TURNI
   ============================================================ */

function ensureDefaultUsersAndSettings() {
  // --- Utenti di base: Titolare + Farmacia ---
  var utenti = fm2_loadUsers();

  var haTitolare = utenti.some(function (u) {
    return u.role === RUOLO_TITOLARE;
  });
  var haFarmacia = utenti.some(function (u) {
    return u.role === RUOLO_FARMACIA;
  });

  if (!haTitolare) {
    utenti.push({
      id: "u_titolare_default",
      nome: "Titolare",
      cognome: "Farmacia",
      fullName: "Titolare Farmacia",
      username: "titolare",
      email: "titolare@farmaciamontesano.local",
      password: "titolare123",       // da cambiare nelle impostazioni
      role: RUOLO_TITOLARE,
      createdAt: new Date().toISOString()
    });
  }

  if (!haFarmacia) {
    utenti.push({
      id: "u_farmacia_default",
      nome: "Farmacia",
      cognome: "Montesano",
      fullName: "Farmacia Montesano",
      username: "farmacia",
      email: "farmacia@farmaciamontesano.local",
      password: "farmacia123",
      role: RUOLO_FARMACIA,
      createdAt: new Date().toISOString()
    });
  }

  fm2_saveUsers(utenti);

  // --- Impostazioni farmacia base (se non esistono già) ---
  var rawImp = localStorage.getItem("fm2_impostazioni_farmacia");
  if (!rawImp) {
    var impBase = {
      nomeFarmacia: "Farmacia Montesano",
      indirizzoFarmacia: "Via Esempio 123, Matera",
      telefonoFarmacia: "0835 000000",
      coloriTema: {
        primario: "#0c8c7a",
        secondario: "#f3f7fb"
      }
    };
    localStorage.setItem("fm2_impostazioni_farmacia", JSON.stringify(impBase));
  }

  // --- Turno farmacia base (se non esiste) ---
  var rawTurno = localStorage.getItem("fm2_turno_farmacia");
  if (!rawTurno) {
    var turnoBase = {
      dataISO: new Date().toISOString().slice(0, 10),
      farmaciaTurnoNome: "Farmacia Montesano",
      farmaciaTurnoIndirizzo: "Via Esempio 123, Matera",
      farmaciaTurnoTelefono: "0835 000000",
      farmaciaAppoggioNome: "Farmacia Centrale",
      farmaciaAppoggioIndirizzo: "Via Dante 10, Matera",
      farmaciaAppoggioTelefono: "0835 111111"
    };
    localStorage.setItem("fm2_turno_farmacia", JSON.stringify(turnoBase));
  }

  // --- Eventi base per i clienti ---
  var rawEventi = localStorage.getItem("fm2_eventi_clienti");
  if (!rawEventi) {
    var eventiBase = [
      {
        id: "ev1",
        titolo: "Giornata prevenzione cardiovascolare",
        dataISO: new Date().toISOString().slice(0, 10),
        descrizione: "Screening gratuito pressione e colesterolo."
      },
      {
        id: "ev2",
        titolo: "Consulenza dermocosmetica",
        dataISO: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
        descrizione: "Consulenza personalizzata su pelle e capelli."
      }
    ];
    localStorage.setItem("fm2_eventi_clienti", JSON.stringify(eventiBase));
  }

  // --- Promozioni base per i clienti ---
  var rawPromo = localStorage.getItem("fm2_promo_clienti");
  if (!rawPromo) {
    var promoBase = [
      {
        id: "pr1",
        titolo: "Vitamina C 1000mg",
        descrizione: "Confezione 30 compresse",
        prezzo: "9,90€",
        nota: "Offerta valida fino a fine mese"
      },
      {
        id: "pr2",
        titolo: "Crema viso idratante",
        descrizione: "Linea dermocosmesi",
        prezzo: "14,90€",
        nota: "Sconto 20% alla cassa"
      }
    ];
    localStorage.setItem("fm2_promo_clienti", JSON.stringify(promoBase));
  }
}

/* ============================================================
   37) RENDER DASHBOARD CLIENTE (EVENTI, PROMO, TURNO)
   ============================================================ */

function fm2_getEventiClienti() {
  try {
    var raw = localStorage.getItem("fm2_eventi_clienti");
    if (!raw) return [];
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function fm2_getPromoClienti() {
  try {
    var raw = localStorage.getItem("fm2_promo_clienti");
    if (!raw) return [];
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function fm2_getTurnoFarmacia() {
  try {
    var raw = localStorage.getItem("fm2_turno_farmacia");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * renderClienteEventi:
 * riempie la lista Eventi nel pannello cliente.
 */
function renderClienteEventi() {
  var wrap = document.getElementById("clienteEventiList");
  if (!wrap) return;

  var eventi = fm2_getEventiClienti();
  wrap.innerHTML = "";

  if (eventi.length === 0) {
    var p = document.createElement("p");
    p.className = "small-text";
    p.textContent = "Al momento non ci sono eventi programmati.";
    wrap.appendChild(p);
    return;
  }

  eventi.forEach(function (ev) {
    var div = document.createElement("div");
    div.className = "cliente-evento";

    var h3 = document.createElement("h3");
    h3.textContent = ev.titolo;

    var pData = document.createElement("p");
    pData.className = "cliente-evento-data";
    pData.textContent = formatDateIT(ev.dataISO);

    var pDesc = document.createElement("p");
    pDesc.textContent = ev.descrizione || "";

    div.appendChild(h3);
    div.appendChild(pData);
    div.appendChild(pDesc);

    wrap.appendChild(div);
  });
}

/**
 * renderClientePromo:
 * mostra un semplice elenco/carosello di promozioni.
 */
function renderClientePromo() {
  var wrap = document.getElementById("clientePromoList");
  if (!wrap) return;

  var promo = fm2_getPromoClienti();
  wrap.innerHTML = "";

  if (promo.length === 0) {
    var p = document.createElement("p");
    p.className = "small-text";
    p.textContent = "Nessuna promozione attiva al momento.";
    wrap.appendChild(p);
    return;
  }

  promo.forEach(function (pr) {
    var card = document.createElement("div");
    card.className = "cliente-promo-card";

    var titolo = document.createElement("div");
    titolo.className = "cliente-promo-titolo";
    titolo.textContent = pr.titolo;

    var desc = document.createElement("div");
    desc.className = "cliente-promo-desc";
    desc.textContent = pr.descrizione || "";

    var prezzo = document.createElement("div");
    prezzo.className = "cliente-promo-prezzo";
    prezzo.textContent = pr.prezzo || "";

    var nota = document.createElement("div");
    nota.className = "cliente-promo-nota";
    nota.textContent = pr.nota || "";

    card.appendChild(titolo);
    card.appendChild(desc);
    card.appendChild(prezzo);
    if (nota.textContent) card.appendChild(nota);

    wrap.appendChild(card);
  });
}

/**
 * renderClienteTurno:
 * mostra nella card del cliente le info di turno/appoggio.
 */
function renderClienteTurno() {
  var box = document.getElementById("clienteTurnoInfo");
  if (!box) return;

  var turno = fm2_getTurnoFarmacia();
  box.innerHTML = "";

  if (!turno) {
    var p = document.createElement("p");
    p.textContent = "Informazioni sui turni non disponibili.";
    box.appendChild(p);
    return;
  }

  var pData = document.createElement("p");
  pData.className = "small-text";
  pData.textContent = "Data: " + formatDateIT(turno.dataISO || "");

  var pTurno = document.createElement("p");
  pTurno.innerHTML =
    "<strong>Farmacia di turno:</strong> " +
    (turno.farmaciaTurnoNome || "") +
    " – " +
    (turno.farmaciaTurnoIndirizzo || "") +
    " – Tel: " +
    (turno.farmaciaTurnoTelefono || "");

  var pApp = document.createElement("p");
  pApp.innerHTML =
    "<strong>Farmacia di appoggio:</strong> " +
    (turno.farmaciaAppoggioNome || "") +
    " – " +
    (turno.farmaciaAppoggioIndirizzo || "") +
    " – Tel: " +
    (turno.farmaciaAppoggioTelefono || "");

  box.appendChild(pData);
  box.appendChild(pTurno);
  box.appendChild(pApp);
}

/* ============================================================
   38) GESTIONE SEZIONI / NAVBAR / DASHBOARD
   ============================================================ */

var fm2_sectionLanding,
  fm2_sectionLogin,
  fm2_sectionRegister,
  fm2_sectionDashTitolare,
  fm2_sectionDashFarmacia,
  fm2_sectionDashCliente;

var fm2_headerUserName,
  fm2_headerUserRole,
  fm2_btnLogout;

var fm2_btnLandingLogin,
  fm2_btnLandingRegister,
  fm2_btnBackFromLogin,
  fm2_btnBackFromRegister;

var fm2_loginForm,
  fm2_loginIdentifier,
  fm2_loginPassword,
  fm2_loginError;

var fm2_registerForm,
  fm2_regNome,
  fm2_regCognome,
  fm2_regEmail,
  fm2_regPassword,
  fm2_regRuolo,
  fm2_registerError,
  fm2_registerSuccess;

/**
 * fm2_hideAllSections:
 * nasconde tutte le sezioni contrassegnate con .app-section
 */
function fm2_hideAllSections() {
  var sections = document.querySelectorAll(".app-section");
  sections.forEach(function (sec) {
    sec.classList.add("hidden");
  });
}

/**
 * fm2_showSection:
 * mostra una singola sezione DOM.
 */
function fm2_showSection(el) {
  if (!el) return;
  fm2_hideAllSections();
  el.classList.remove("hidden");
  window.scrollTo(0, 0);
}

/**
 * fm2_showHeader:
 * mostra/nasconde la barra in alto con utente/log out.
 */
function fm2_showHeader(visible) {
  var header = document.getElementById("appHeader");
  if (!header) return;
  if (visible) {
    header.classList.remove("hidden");
  } else {
    header.classList.add("hidden");
  }
}

/**
 * fm2_updateHeaderUserInfo:
 * scrive nome e ruolo dell'utente loggato nell'header.
 */
function fm2_updateHeaderUserInfo(utente) {
  if (!utente) {
    if (fm2_headerUserName) fm2_headerUserName.textContent = "";
    if (fm2_headerUserRole) fm2_headerUserRole.textContent = "";
    return;
  }

  var nome = utente.fullName || utente.username || utente.email || "";
  var ruoloLabel = "";
  switch (utente.role) {
    case RUOLO_TITOLARE:
      ruoloLabel = "Titolare";
      break;
    case RUOLO_FARMACIA:
      ruoloLabel = "Farmacia";
      break;
    case RUOLO_DIPENDENTE:
      ruoloLabel = "Dipendente";
      break;
    case RUOLO_CLIENTE:
      ruoloLabel = "Cliente";
      break;
    default:
      ruoloLabel = utente.role || "";
  }

  if (fm2_headerUserName) fm2_headerUserName.textContent = nome;
  if (fm2_headerUserRole) fm2_headerUserRole.textContent = ruoloLabel;
}

/**
 * fm2_showLanding / fm2_showLogin / fm2_showRegister
 */
function fm2_showLanding() {
  fm2_showHeader(false);
  fm2_showSection(fm2_sectionLanding);
}

function fm2_showLogin() {
  fm2_showHeader(false);
  if (fm2_loginError) fm2_loginError.textContent = "";
  fm2_showSection(fm2_sectionLogin);
}

function fm2_showRegister() {
  fm2_showHeader(false);
  if (fm2_registerError) fm2_registerError.textContent = "";
  if (fm2_registerSuccess) fm2_registerSuccess.textContent = "";
  fm2_showSection(fm2_sectionRegister);
}

/**
 * fm2_showDashboardForUser:
 * sceglie la pagina giusta in base al ruolo.
 */
function fm2_showDashboardForUser(utente) {
  if (!utente) {
    fm2_showLanding();
    return;
  }

  fm2_showHeader(true);
  fm2_updateHeaderUserInfo(utente);

  // per sicurezza, aggiorniamo i moduli gestionali
  if (typeof initModuliGestionali === "function") {
    initModuliGestionali();
  }

  if (utente.role === RUOLO_TITOLARE) {
    fm2_showSection(fm2_sectionDashTitolare);
  } else if (utente.role === RUOLO_FARMACIA || utente.role === RUOLO_DIPENDENTE) {
    fm2_showSection(fm2_sectionDashFarmacia);
  } else if (utente.role === RUOLO_CLIENTE) {
    // prima aggiorniamo i blocchi Eventi / Promo / Turno
    renderClienteEventi();
    renderClientePromo();
    renderClienteTurno();
    fm2_showSection(fm2_sectionDashCliente);
  } else {
    // fallback generico
    fm2_showSection(fm2_sectionDashFarmacia || fm2_sectionDashTitolare || fm2_sectionDashCliente);
  }
}

/* ============================================================
   39) LOGIN / REGISTRAZIONE / LOGOUT
   ============================================================ */

function fm2_handleLoginSubmit(e) {
  e.preventDefault();

  if (!fm2_loginIdentifier || !fm2_loginPassword) return;

  var ident = fm2_loginIdentifier.value.trim();
  var pass = fm2_loginPassword.value;

  if (!ident || !pass) {
    if (fm2_loginError) fm2_loginError.textContent = "Inserisci username/email e password.";
    return;
  }

  var utente = fm2_findUserByIdentifierAndPassword(ident, pass);
  if (!utente) {
    if (fm2_loginError) fm2_loginError.textContent = "Credenziali non valide.";
    return;
  }

  // login ok
  setUtenteLoggato(utente);
  if (fm2_loginError) fm2_loginError.textContent = "";
  fm2_loginForm && fm2_loginForm.reset();

  fm2_showDashboardForUser(utente);
}

function fm2_handleRegisterSubmit(e) {
  e.preventDefault();

  if (!fm2_regNome || !fm2_regCognome || !fm2_regEmail || !fm2_regPassword || !fm2_regRuolo) {
    return;
  }

  var nome = fm2_regNome.value.trim();
  var cognome = fm2_regCognome.value.trim();
  var email = fm2_regEmail.value.trim();
  var password = fm2_regPassword.value;
  var ruolo = fm2_regRuolo.value || RUOLO_CLIENTE;

  if (!nome || !cognome || !email || !password) {
    if (fm2_registerError) {
      fm2_registerError.textContent = "Compila tutti i campi richiesti.";
    }
    if (fm2_registerSuccess) fm2_registerSuccess.textContent = "";
    return;
  }

  if (fm2_existsUserWithIdentifier(email)) {
    if (fm2_registerError) {
      fm2_registerError.textContent = "Esiste già un utente registrato con questa email/username.";
    }
    if (fm2_registerSuccess) fm2_registerSuccess.textContent = "";
    return;
  }

  var nuovo = fm2_addUser({
    nome: nome,
    cognome: cognome,
    email: email,
    username: email,
    password: password,
    role: ruolo
  });

  if (fm2_registerError) fm2_registerError.textContent = "";
  if (fm2_registerSuccess) {
    fm2_registerSuccess.textContent =
      "Registrazione completata! Ora puoi effettuare il login con le tue credenziali.";
  }

  fm2_registerForm && fm2_registerForm.reset();
}

/* ============================================================
   40) INIZIALIZZAZIONE GENERALE (DOMContentLoaded)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  // --- Referenze sezioni principali ---
  fm2_sectionLanding = document.getElementById("sectionLanding");
  fm2_sectionLogin = document.getElementById("sectionAuthLogin");
  fm2_sectionRegister = document.getElementById("sectionAuthRegister");
  fm2_sectionDashTitolare = document.getElementById("sectionDashboardTitolare");
  fm2_sectionDashFarmacia = document.getElementById("sectionDashboardFarmacia");
  fm2_sectionDashCliente = document.getElementById("sectionDashboardCliente");

  // --- Header / navbar ---
  fm2_headerUserName = document.getElementById("headerUserName");
  fm2_headerUserRole = document.getElementById("headerUserRole");
  fm2_btnLogout = document.getElementById("btnLogout");

  // --- Pulsanti landing ---
  fm2_btnLandingLogin = document.getElementById("btnLandingLogin");
  fm2_btnLandingRegister = document.getElementById("btnLandingRegister");

  // --- Pulsanti back da login/registrazione ---
  fm2_btnBackFromLogin = document.getElementById("btnBackFromLogin");
  fm2_btnBackFromRegister = document.getElementById("btnBackFromRegister");

  // --- Form login ---
  fm2_loginForm = document.getElementById("loginForm");
  fm2_loginIdentifier = document.getElementById("loginIdentifier");
  fm2_loginPassword = document.getElementById("loginPassword");
  fm2_loginError = document.getElementById("loginError");

  // --- Form registrazione ---
  fm2_registerForm = document.getElementById("registerForm");
  fm2_regNome = document.getElementById("regNome");
  fm2_regCognome = document.getElementById("regCognome");
  fm2_regEmail = document.getElementById("regEmail");
  fm2_regPassword = document.getElementById("regPassword");
  fm2_regRuolo = document.getElementById("regRuolo");
  fm2_registerError = document.getElementById("registerError");
  fm2_registerSuccess = document.getElementById("registerSuccess");

  // --- Dati di default (titolare, farmacia, eventi, promo) ---
  ensureDefaultUsersAndSettings();

  // --- Inizializza tutti i moduli gestionali (assenze, ecc.) ---
  if (typeof initModuliGestionali === "function") {
    initModuliGestionali();
  }

  // --- Eventi pulsanti landing ---
  if (fm2_btnLandingLogin) {
    fm2_btnLandingLogin.addEventListener("click", fm2_showLogin);
  }
  if (fm2_btnLandingRegister) {
    fm2_btnLandingRegister.addEventListener("click", fm2_showRegister);
  }

  // --- Eventi pulsanti "indietro" ---
  if (fm2_btnBackFromLogin) {
    fm2_btnBackFromLogin.addEventListener("click", fm2_showLanding);
  }
  if (fm2_btnBackFromRegister) {
    fm2_btnBackFromRegister.addEventListener("click", fm2_showLanding);
  }

  // --- Eventi login / registrazione ---
  if (fm2_loginForm) {
    fm2_loginForm.addEventListener("submit", fm2_handleLoginSubmit);
  }
  if (fm2_registerForm) {
    fm2_registerForm.addEventListener("submit", fm2_handleRegisterSubmit);
  }

  // --- Logout ---
  if (fm2_btnLogout) {
    fm2_btnLogout.addEventListener("click", function () {
      clearUtenteLoggato();
      fm2_updateHeaderUserInfo(null);
      fm2_showLanding();
    });
  }

  // --- Se c'è una sessione attiva, vai subito alla dashboard ---
  var utente = getUtenteLoggato();
  if (utente) {
    fm2_showDashboardForUser(utente);
  } else {
    fm2_showLanding();
  }
});
