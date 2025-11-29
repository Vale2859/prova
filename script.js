// script.js

document.addEventListener("DOMContentLoaded", function () {
  setupMobileSections();
  setupDesktopDetail();
  resetInactivityTimer();
  setupInactivityListeners();
});

// =======================
// DATI DEMO
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
    stato: "in attesa", // NON deve comparire
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

const oggiISO = (function () {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
})();

// =======================
// MOBILE: NAVIGAZIONE SEZIONI
// =======================
function setupMobileSections() {
  const dashboards = document.querySelectorAll(".mobile-dashboard");
  const sezioni = document.querySelectorAll(".sezione-dettaglio");

  dashboards.forEach((d) => {
    const computed = window.getComputedStyle(d);
    d.dataset.displayOriginal = computed.display || "block";
  });

  function mostraDashboardMobile() {
    sezioni.forEach((sec) => {
      sec.style.display = "none";
    });
    dashboards.forEach((d) => {
      d.style.display = d.dataset.displayOriginal || "block";
    });
    window.scrollTo(0, 0);
  }

  function mostraSezioneMobile(id) {
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
      renderAssentiMobile();
    } else if (id === "turno") {
      renderTurnoMobile();
    }

    window.scrollTo(0, 0);
  }

  const sectionButtons = document.querySelectorAll(
    ".mobile-dashboard [data-section]"
  );
  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = btn.getAttribute("data-section");
      if (id) {
        mostraSezioneMobile(id);
      }
    });
  });

  const closeButtons = document.querySelectorAll("[data-close='sezione']");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      mostraDashboardMobile();
    });
  });

  const ruoloAssSelect = document.getElementById("ruolo-assenti");
  if (ruoloAssSelect) {
    ruoloAssSelect.addEventListener("change", renderAssentiMobile);
  }
}
// =======================
// DESKTOP: DETTAGLIO A DESTRA
// =======================
let inactivityTimer = null;

function setupDesktopDetail() {
  const cards = document.querySelectorAll(".desk-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const detail = card.getAttribute("data-detail");
      mostraDettaglioDesktop(detail);
      resetInactivityTimer();
    });
  });

  // all'avvio mostro subito il riepilogo
  mostraRiepilogoDesktop();
}

function mostraDettaglioDesktop(key) {
  const titleEl = document.getElementById("desktop-detail-title");
  const bodyEl = document.getElementById("desktop-detail-body");
  if (!titleEl || !bodyEl) return;

  switch (key) {
    case "assenti":
      titleEl.textContent = "Assenti / Permessi (oggi e prossimi giorni)";
      bodyEl.innerHTML = buildAssentiHTML();
      break;
    case "turno":
      titleEl.textContent = "Farmacia di turno";
      bodyEl.innerHTML = buildTurnoHTML();
      break;
    case "comunicazioni":
      titleEl.textContent = "Comunicazioni interne";
      bodyEl.innerHTML =
        "<p><strong>Comunicazioni interne</strong></p><p>Nuove procedure, note operative e messaggi importanti per il team compariranno qui in modo sintetico.</p>";
      break;
    case "procedure":
      titleEl.textContent = "Procedure";
      bodyEl.innerHTML =
        "<p><strong>Procedure interne</strong></p><p>Accesso rapido alle procedure più usate: ricette dematerializzate, gestione DPC, resi, carico magazzino, gestione scadenze.</p>";
      break;
    case "logistica":
      titleEl.textContent = "Logistica";
      bodyEl.innerHTML =
        "<p><strong>Logistica</strong></p><p>Stato arrivi corrieri, giacenze critiche, note su spedizioni in arrivo o in ritardo.</p>";
      break;
    case "magazziniera":
      titleEl.textContent = "Magazziniera";
      bodyEl.innerHTML =
        "<p><strong>Magazziniera</strong></p><p>Inventari veloci, controlli periodici e resi programmati. Qui vedrai le attività più urgenti da fare in magazzino.</p>";
      break;
    case "scadenze":
      titleEl.textContent = "Prodotti in scadenza";
      bodyEl.innerHTML =
        "<p><strong>Prodotti in scadenza</strong></p><p>Elenco sintetico degli articoli che scadono nei prossimi giorni, con priorità altissima per quelli a rischio perdita.</p>";
      break;
    case "consumabili":
      titleEl.textContent = "Consumabili";
      bodyEl.innerHTML =
        "<p><strong>Consumabili</strong></p><p>Stato di guanti, garze, sacchetti, carta, toner, ecc. Obiettivo: non rimanere mai senza materiale.</p>";
      break;
    case "consegne":
      titleEl.textContent = "Consegne / Ritiri";
      bodyEl.innerHTML =
        "<p><strong>Consegne / Ritiri</strong></p><p>Qui compariranno i ritiri conto-terzi (SDA, Bartolini, ecc.) e le consegne da preparare per i clienti.</p>";
      break;
    default:
      mostraRiepilogoDesktop();
  }
}

function mostraRiepilogoDesktop() {
  const titleEl = document.getElementById("desktop-detail-title");
  const bodyEl = document.getElementById("desktop-detail-body");
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = "Riepilogo rapido";
  bodyEl.innerHTML = `
    <p><strong>RIEPILOGO RAPIDO</strong></p>
    <p>
      • <strong>Assenti / Permessi:</strong> mostra solo le assenze già approvate.<br />
      • <strong>Comunicazioni:</strong> ultime note interne per il personale.<br />
      • <strong>Farmacia di turno:</strong> chi è di turno oggi e prossimi giorni.<br />
      • <strong>Prodotti in scadenza:</strong> articoli critici da svuotare subito.<br />
      • <strong>Consumabili, logistica, magazzino:</strong> stato operativo della farmacia.
    </p>
    <p style="margin-top:10px; font-size:0.85rem; opacity:0.85;">
      Clicca una card a sinistra per vedere il dettaglio. Se non tocchi nulla per 1 minuto,
      il sistema torna automaticamente a questo riepilogo.
    </p>
  `;
}

// =======================
// TIMER INATTIVITÀ (1 MINUTO)
// =======================
function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    mostraRiepilogoDesktop();
  }, 60 * 1000);
}

function setupInactivityListeners() {
  ["mousemove", "keydown", "click", "touchstart"].forEach((evt) => {
    document.addEventListener(evt, () => {
      resetInactivityTimer();
    });
  });
}

// =======================
// FUNZIONI MOBILE – ASSENTI
// =======================
function renderAssentiMobile() {
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
// FUNZIONI MOBILE – TURNO
// =======================
function renderTurnoMobile() {
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
// SUPPORTO DATE + HTML DESKTOP
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

// HTML per assenti / turno in versione desktop
function buildAssentiHTML() {
  const oggiDate = parseISO(oggiISO);
  let lista = assenzeDemo.filter((a) => a.stato === "approvato");
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

  let html = "<p><strong>Assenti oggi</strong></p>";
  if (oggiList.length === 0) {
    html += "<p>Nessuno assente oggi.</p>";
  } else {
    html += "<ul>";
    oggiList.forEach((a) => {
      html += `<li><strong>${a.nome}</strong> – ${a.tipo} (${formatRangeIT(
        a.dal,
        a.al
      )})</li>`;
    });
    html += "</ul>";
  }

  html += "<p style='margin-top:10px;'><strong>Assenze prossimi giorni</strong></p>";
  if (nextList.length === 0) {
    html += "<p>Non ci sono altre assenze approvate nei prossimi giorni.</p>";
  } else {
    html += "<ul>";
    nextList.forEach((a) => {
      html += `<li><strong>${a.nome}</strong> – ${a.tipo} (${formatRangeIT(
        a.dal,
        a.al
      )})</li>`;
    });
    html += "</ul>";
  }

  return html;
}

function buildTurnoHTML() {
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

  let html = "<p><strong>Turno di oggi</strong></p>";
  html += `<p>${formatLongDateIT(turnoOggi.data)} – <strong>${
    turnoOggi.farmacia
  }</strong></p>`;
  html += `<p>Orario: <strong>${turnoOggi.orario}</strong></p>`;
  html += `<p>Appoggio: <strong>${turnoOggi.appoggio}</strong></p>`;
  html += `<p style="opacity:0.85;">${turnoOggi.note}</p>`;

  html += "<p style='margin-top:10px;'><strong>Prossimi turni</strong></p>";
  if (altri.length === 0) {
    html += "<p>Non ci sono altri turni in elenco.</p>";
  } else {
    html += "<ul>";
    altri.forEach((t) => {
      html += `<li><strong>${formatShortDateIT(
        t.data
      )}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
    });
    html += "</ul>";
  }

  return html;
}
