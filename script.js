// script.js

document.addEventListener("DOMContentLoaded", function () {
  setupLoginDemo();
  evidenziaOggiCalendario();
  setupNavigazioneSezioni();
});

// =======================
// LOGIN DEMO CON RUOLI
// =======================

const utentiDemo = [
  {
    email: "titolare@demo.it",
    password: "titolare123",
    role: "titolare",
  },
  {
    email: "dipendente@demo.it",
    password: "dipendente123",
    role: "dipendente",
  },
  {
    email: "cliente@demo.it",
    password: "cliente123",
    role: "cliente",
  },
];

function setupLoginDemo() {
  const authContainer = document.getElementById("authContainer");
  const app = document.getElementById("app");
  const loginForm = document.getElementById("loginForm");
  const loginRoleLabel = document.getElementById("loginRoleLabel");
  const loginError = document.getElementById("loginError");
  const topbarRole = document.getElementById("topbarRole");
  const logoutBtn = document.getElementById("logoutBtn");
  const authTabs = document.querySelectorAll(".auth-tab");

  if (!authContainer || !app || !loginForm) return;

  let currentRole = "titolare";

  function roleLabel(role) {
    if (role === "titolare") return "Titolare";
    if (role === "dipendente") return "Dipendente";
    if (role === "cliente") return "Cliente";
    return role;
  }

  function showRoleView(role) {
    document.querySelectorAll(".role-view").forEach((v) => {
      v.classList.add("hidden");
    });
    const target = document.getElementById("view-" + role);
    if (target) target.classList.remove("hidden");
  }

  function applyLogin(user) {
    authContainer.classList.add("hidden");
    app.classList.remove("hidden");

    if (topbarRole) {
      topbarRole.textContent = "Ruolo: " + roleLabel(user.role);
    }
    showRoleView(user.role);

    // salvo su localStorage per ricordare il login
    localStorage.setItem(
      "fm_portale_user",
      JSON.stringify({ email: user.email, role: user.role })
    );
  }

  // tabs ruolo (titolare / dipendente / cliente)
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentRole = tab.getAttribute("data-role") || "titolare";
      if (loginRoleLabel) loginRoleLabel.textContent = roleLabel(currentRole);
    });
  });

  // submit login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const user = utentiDemo.find(
      (u) => u.role === currentRole && u.email === email && u.password === password
    );

    if (!user) {
      if (loginError) loginError.classList.remove("hidden");
      return;
    }

    if (loginError) loginError.classList.add("hidden");
    applyLogin(user);
  });

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("fm_portale_user");
      app.classList.add("hidden");
      authContainer.classList.remove("hidden");
      // reset form
      loginForm.reset();
      if (loginError) loginError.classList.add("hidden");
    });
  }

  // auto-login se presente in localStorage
  try {
    const stored = localStorage.getItem("fm_portale_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user && user.role) {
        applyLogin(user);
      }
    }
  } catch (e) {
    console.warn("LocalStorage non disponibile o dati corrotti.", e);
  }
}

// =======================
// Evidenzia il giorno di oggi nel calendario
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
// NAVIGAZIONE: DASHBOARD ↔ SEZIONI DETTAGLIO
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

  const closeButtons = document.querySelectorAll("[data-close='sezione']");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      mostraDashboard();
    });
  });

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
}

// =======================
// FUNZIONI DI SUPPORTO DATE
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
