// ===========================================
// PORTALE FARMACIA MONTESANO – SCRIPT BASE
// Login + Registrazione (demo) + Navigazione
// ===========================================

// -------------------------
// Costanti per localStorage
// -------------------------
const STORAGE_KEY_USERS = "fm_utenti_v1";
const STORAGE_KEY_SESSION = "fm_sessione_v1";

// -------------------------
// Utility dati utenti
// -------------------------
function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Errore nel leggere utenti da localStorage", e);
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.warn("Errore nel salvare utenti su localStorage", e);
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Errore nel leggere sessione da localStorage", e);
    return null;
  }
}

function saveSession(user) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  } catch (e) {
    console.warn("Errore nel salvare sessione su localStorage", e);
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.warn("Errore nel cancellare sessione da localStorage", e);
  }
}

// -------------------------
// Gestione ruolo (etichette)
// -------------------------
function getRoleLabel(role) {
  switch (role) {
    case "titolare":
      return "Titolare · vista completa";
    case "dipendente":
      return "Dipendente";
    case "cliente":
      return "Cliente";
    case "farmacia":
    default:
      return "Farmacia (accesso generico)";
  }
}

// -------------------------
// Login / Registrazione
// -------------------------
/**
 * Gestisce login + eventuale registrazione.
 *
 * ✔ Se username + password sono compilati:
 *    - se utente esiste: lo usa
 *    - se non esiste: lo registra (solo localStorage)
 * ✔ Se username/password sono vuoti:
 *    - permette comunque l'accesso in modalità DEMO
 */
function handleLoginOrRegister(username, password, role) {
  const users = loadUsers();

  // Cerca utente esistente (stesso username + ruolo)
  let existing = null;
  if (username) {
    existing = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.role === role
    );
  }

  // Se ha scritto username+password e non esiste ancora -> registrazione automatica
  if (!existing && username && password) {
    const nuovo = {
      id: Date.now(),
      username: username.trim(),
      role,
      // NOTA: password salvata in chiaro -> solo demo,
      // quando arriverà il server useremo hash lato server
      password: password,
      createdAt: new Date().toISOString()
    };
    users.push(nuovo);
    saveUsers(users);
    existing = nuovo;
    console.log("Registrato nuovo utente (demo):", nuovo);
  }

  // Se non ha messo niente, accesso demo
  if (!existing && (!username || !password)) {
    return {
      username: username || "Accesso demo",
      role,
      demo: true
    };
  }

  // Se abbiamo trovato l'utente o appena registrato
  return {
    username: existing.username,
    role: existing.role,
    demo: false
  };
}

// -------------------------
// UI: mostra/nasconde sezioni
// -------------------------
function showSectionById(id) {
  const app = document.getElementById("app");
  if (!app) return;

  const sections = app.querySelectorAll("section");
  sections.forEach(sec => sec.classList.add("hidden"));

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
  } else {
    const dash = document.getElementById("dashboard");
    if (dash) dash.classList.remove("hidden");
  }

  window.scrollTo(0, 0);
}

// -------------------------
// UI: applica dati utente loggato
// -------------------------
function applyUserToUI(user) {
  const rolePill = document.getElementById("currentRolePill");
  if (rolePill) {
    rolePill.textContent = getRoleLabel(user.role);
  }

  // se un domani aggiungiamo lo span col nome nel header
  const headerUserName = document.getElementById("headerUserName");
  if (headerUserName) {
    headerUserName.textContent = user.username;
  }
}

// -------------------------
// Init DOM
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginRoleLabel = document.getElementById("loginRoleLabel");

  const authTabs = document.querySelectorAll(".auth-tab");

  // Sidebar / nav
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeSidebar = document.getElementById("closeSidebar");
  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------------
  // Se c'è una sessione salvata, entra direttamente
  // -------------------------
  const sessionUser = loadSession();
  if (sessionUser && authContainer && app) {
    authContainer.classList.add("hidden");
    app.classList.remove("hidden");
    applyUserToUI(sessionUser);
    showSectionById("dashboard");
  }

  // -------------------------
  // Tabs RUOLO (Farmacia / Titolare / Dipendente / Cliente)
  // -------------------------
  function getActiveRoleFromTabs() {
    const active = document.querySelector(".auth-tab.active");
    if (!active) return "farmacia";
    return active.dataset.role || "farmacia";
  }

  function updateLoginRoleLabel() {
    if (!loginRoleLabel) return;
    const role = getActiveRoleFromTabs();
    if (role === "farmacia") loginRoleLabel.textContent = "Farmacia";
    else if (role === "titolare") loginRoleLabel.textContent = "Titolare";
    else if (role === "dipendente") loginRoleLabel.textContent = "Dipendente";
    else if (role === "cliente") loginRoleLabel.textContent = "Cliente";
    else loginRoleLabel.textContent = "Farmacia";
  }

  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      updateLoginRoleLabel();
    });
  });

  updateLoginRoleLabel();

  // -------------------------
  // SUBMIT LOGIN (con registrazione demo)
  // -------------------------
  if (loginForm && authContainer && app) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();

      const username = loginUsername ? loginUsername.value.trim() : "";
      const password = loginPassword ? loginPassword.value.trim() : "";
      const role = getActiveRoleFromTabs();

      const user = handleLoginOrRegister(username, password, role);

      // Salva sessione (anche se demo)
      saveSession(user);

      // Mostra app
      authContainer.classList.add("hidden");
      app.classList.remove("hidden");
      applyUserToUI(user);
      showSectionById("dashboard");
    });
  }

  // -------------------------
  // SIDEBAR: apri/chiudi
  // -------------------------
  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (closeSidebar && sidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  // Chiudi sidebar cliccando fuori (su mobile)
  document.addEventListener("click", e => {
    if (
      sidebar &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== hamburger
    ) {
      sidebar.classList.remove("open");
    }
  });

  // -------------------------
  // SIDEBAR: navigazione sezioni
  // -------------------------
  if (sidebar) {
    sidebar.querySelectorAll("li[data-nav]").forEach(item => {
      item.addEventListener("click", () => {
        const targetId = item.getAttribute("data-nav");

        if (targetId === "dashboard") {
          showSectionById("dashboard");
        } else {
          showSectionById(targetId);
        }

        sidebar.classList.remove("open");
      });
    });
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  if (logoutBtn && authContainer && app) {
    logoutBtn.addEventListener("click", () => {
      clearSession();

      // reset form
      if (loginForm) loginForm.reset();
      updateLoginRoleLabel();

      // torna alla schermata di login
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");

      // di default ruolo "Farmacia"
      authTabs.forEach(t => t.classList.remove("active"));
      if (authTabs[0]) authTabs[0].classList.add("active");
      updateLoginRoleLabel();
    });
  }
});
