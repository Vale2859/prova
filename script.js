// ==========================================
// PORTALE FARMACIA MONTESANO – LOGIN DEMO
// ==========================================

const USERS_KEY = "fm_users_v1";

let selectedRole = "farmacia";
let currentUser = null;

// Map per descrizioni ruolo
const ROLE_LABELS = {
  farmacia: "Farmacia",
  titolare: "Titolare",
  dipendente: "Dipendente",
  cliente: "Cliente"
};

const ROLE_DESCRIPTIONS = {
  farmacia: "Farmacia (accesso generico)",
  titolare: "Titolare (controllo completo)",
  dipendente: "Dipendente / Farmacista",
  cliente: "Cliente"
};

// ---------- Utility localStorage ----------
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Errore lettura utenti", e);
    return [];
  }
}

function saveUsers(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Errore salvataggio utenti", e);
  }
}

// ---------- Gestione UI ----------
document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");

  const authTabs = document.querySelectorAll(".auth-tab");
  const loginPanel = document.getElementById("loginPanel");
  const registerPanel = document.getElementById("registerPanel");

  const roleBtns = document.querySelectorAll(".role-btn");
  const roleLabel = document.getElementById("roleLabel");
  const registerRoleLabel = document.getElementById("registerRoleLabel");

  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");

  const registerForm = document.getElementById("registerForm");
  const registerUsername = document.getElementById("registerUsername");
  const registerPassword = document.getElementById("registerPassword");
  const registerFeedback = document.getElementById("registerFeedback");

  const logoutBtn = document.getElementById("logoutBtn");
  const currentRolePill = document.getElementById("currentRolePill");
  const currentUserLabel = document.getElementById("currentUserLabel");
  const roleDescriptionEl = document.getElementById("roleDescription");

  // ---- Tabs Accedi / Registrati ----
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const panel = tab.dataset.panel;
      if (panel === "loginPanel") {
        loginPanel.classList.remove("hidden");
        registerPanel.classList.add("hidden");
      } else {
        loginPanel.classList.add("hidden");
        registerPanel.classList.remove("hidden");
      }
    });
  });

  // ---- Selettore ruolo ----
  function updateRoleUI() {
    const label = ROLE_LABELS[selectedRole] || "Farmacia";
    roleLabel.textContent = label;
    registerRoleLabel.textContent = label;
  }

  roleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      roleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedRole = btn.dataset.role || "farmacia";
      updateRoleUI();
    });
  });

  updateRoleUI();

  // ---- LOGIN ----
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginError.classList.add("hidden");
      loginError.textContent = "";

      const username = (loginUsername.value || "").trim();
      const password = (loginPassword.value || "").trim();

      // Caso DEMO: campi vuoti -> entra con ruolo selezionato
      if (!username && !password) {
        const demoName = "Demo " + ROLE_LABELS[selectedRole];
        doLogin({
          username: demoName,
          role: selectedRole,
          isDemo: true
        });
        return;
      }

      // Caso normale: cerco utente registrato
      const users = loadUsers();
      const found = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!found) {
        loginError.textContent =
          "Credenziali non valide. Verifica username e password oppure usa l'accesso demo.";
        loginError.classList.remove("hidden");
        return;
      }

      doLogin({
        username: found.username,
        role: found.role || selectedRole,
        isDemo: false
      });
    });
  }

  // ---- REGISTRAZIONE ----
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      registerFeedback.classList.add("hidden");
      registerFeedback.textContent = "";

      const username = (registerUsername.value || "").trim();
      const password = (registerPassword.value || "").trim();

      if (!username) {
        registerFeedback.textContent = "Inserisci uno username.";
        registerFeedback.classList.remove("hidden");
        return;
      }

      const users = loadUsers();
      const already = users.some((u) => u.username === username);
      if (already) {
        registerFeedback.textContent = "Questo username è già registrato.";
        registerFeedback.classList.remove("hidden");
        return;
      }

      const nuovo = {
        username,
        password,
        role: selectedRole // ruolo scelto dai bottoni
      };

      users.push(nuovo);
      saveUsers(users);

      registerFeedback.textContent =
        "✅ Utente creato (demo). Ora puoi accedere da 'Accedi' con queste credenziali.";
      registerFeedback.classList.remove("hidden");

      registerForm.reset();
    });
  }

  // ---- LOGOUT ----
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      currentUser = null;
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");
      loginForm.reset();
      loginError.classList.add("hidden");
      loginError.textContent = "";
      window.scrollTo(0, 0);
    });
  }

  // ---- Funzione centrale login -> apre app ----
  function doLogin({ username, role, isDemo }) {
    currentUser = { username, role, isDemo };

    const label = ROLE_LABELS[role] || "Farmacia";
    const desc = ROLE_DESCRIPTIONS[role] || "Farmacia";

    currentRolePill.textContent = label;
    currentUserLabel.textContent = isDemo
      ? `${username} · accesso demo`
      : `${username} · utente registrato`;
    roleDescriptionEl.textContent = desc;

    authContainer.classList.add("hidden");
    app.classList.remove("hidden");
    window.scrollTo(0, 0);
  }
});
