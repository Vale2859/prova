// script.js

document.addEventListener("DOMContentLoaded", function () {
  setupDesktopDetail();
  setupMobileNavigation();
  renderSummaryInDetail(); // riepilogo iniziale
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
// UTIL PER DATE
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
// CONTENUTI PER IL PANNELLO DESTRO
// =======================

function buildAssentiHTML() {
  const oggiDate = parseISO(oggiISO);
  const oggiList = [];
  const nextList = [];

  assenzeDemo.forEach((a) => {
    const dal = parseISO(a.dal);
    const al = parseISO(a.al);

    if (oggiDate >= dal && oggiDate <= al) {
      oggiList.push(a);
    } else if (oggiDate < dal) {
      nextList.push(a);
    }
  });

  nextList.sort((a, b) => parseISO(a.dal) - parseISO(b.dal));

  let html = '<h3 class="detail-section-title">Assenti oggi</h3>';
  if (oggiList.length === 0) {
    html += '<p class="panel-note">Nessuno assente oggi.</p>';
  } else {
    html += '<ul class="detail-list">';
    oggiList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      html += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
    });
    html += "</ul>";
  }

  html += '<h3 class="detail-section-title" style="margin-top:10px;">Prossimi giorni</h3>';
  if (nextList.length === 0) {
    html += '<p class="panel-note">Nessuna assenza approvata nei prossimi giorni.</p>';
  } else {
    html += '<ul class="detail-list">';
    nextList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      html += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
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

  let html = '<h3 class="detail-section-title">Turno di oggi</h3>';
  html += `<p><strong>${turnoOggi.farmacia}</strong> – ${formatLongDateIT(
    turnoOggi.data
  )}</p>`;
  html += `<p>Orario: <strong>${turnoOggi.orario}</strong></p>`;
  html += `<p>Appoggio: <strong>${turnoOggi.appoggio}</strong></p>`;
  html += `<p class="panel-note">${turnoOggi.note}</p>`;

  html += '<h3 class="detail-section-title" style="margin-top:10px;">Prossimi turni</h3>';
  if (altri.length === 0) {
    html += '<p class="panel-note">Nessun altro turno in elenco.</p>';
  } else {
    html += '<ul class="detail-list">';
    altri.forEach((t) => {
      html += `<li><strong>${formatShortDateIT(t.data)}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
    });
    html += "</ul>";
  }

  return html;
}

function buildPlaceholderHTML(sectionId) {
  const nomi = {
    comunicazioni: "Comunicazioni interne",
    procedure: "Procedure",
    logistica: "Logistica",
    magazziniera: "Magazziniera",
    scadenze: "Prodotti in scadenza",
    consumabili: "Consumabili",
    consegne: "Consegne / Ritiri",
    cassa: "Cambio cassa",
    archivio: "Archivio file",
  };
  const nome = nomi[sectionId] || "Sezione";

  return `
    <h3 class="detail-section-title">${nome}</h3>
    <p class="panel-note">
      Contenuto demo: in futuro qui vedrai i dati reali della sezione
      <strong>${nome}</strong> (liste, riepiloghi, pulsanti azione veloci).
    </p>
  `;
}

// =======================
// GESTIONE PANNELLO DESTRO + TIMER
// =======================

let inactivityTimer = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    renderSummaryInDetail();
  }, 60 * 1000); // 1 minuto
}

function setDetailContent(title, subtitle, html) {
  const titleEl = document.getElementById("detail-title");
  const subEl = document.getElementById("detail-subtitle");
  const bodyEl = document.getElementById("detail-body");
  if (!titleEl || !subEl || !bodyEl) return;

  titleEl.textContent = title;
  subEl.textContent = subtitle;
  bodyEl.innerHTML = html;
  resetInactivityTimer();
}

function renderSummaryInDetail() {
  const html = `
    <h3 class="detail-section-title">Riepilogo rapido</h3>
    <ul class="detail-list">
      <li><strong>Assenti / Permessi</strong> – mostra chi manca oggi e i prossimi giorni.</li>
      <li><strong>Farmacia di turno</strong> – turno attivo e turni successivi.</li>
      <li><strong>Comunicazioni</strong> – messaggi importanti per il personale.</li>
      <li><strong>Procedure</strong> – istruzioni operative veloci.</li>
      <li><strong>Logistica / Magazziniera</strong> – arrivi, espositori, inventari.</li>
      <li><strong>Prodotti in scadenza / Consumabili</strong> – controllo scorte.</li>
      <li><strong>Consegne / Ritiri</strong> – movimenti giornalieri.</li>
      <li><strong>Cambio cassa</strong> – ultimo cambio registrato.</li>
      <li><strong>Archivio file</strong> – documenti operativi e moduli.</li>
    </ul>
  `;
  setDetailContent(
    "Riepilogo rapido",
    "Seleziona una card a sinistra per entrare nel dettaglio.",
    html
  );
}

function setupDesktopDetail() {
  const isDesktop = window.matchMedia("(min-width: 769px)").matches;
  if (!isDesktop) return;

  const buttons = document.querySelectorAll(
    ".desktop-dashboard [data-section]"
  );
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-section");
      if (!id) return;

      if (id === "assenti") {
        setDetailContent(
          "Assenti / Permessi",
          "Vedi subito chi manca oggi e nei prossimi giorni.",
          buildAssentiHTML()
        );
      } else if (id === "turno") {
        setDetailContent(
          "Farmacia di turno",
          "Turno di oggi e prossimi turni programmati.",
          buildTurnoHTML()
        );
      } else {
        setDetailContent(
          "Sezione " + id,
          "Contenuto demo della sezione. In futuro sarà collegata al gestionale.",
          buildPlaceholderHTML(id)
        );
      }
    });
  });

  // avvio il timer per il riepilogo
  resetInactivityTimer();
}

// =======================
// NAVIGAZIONE MOBILE (schermate intere)
// =======================

function setupMobileNavigation() {
  const mobileDash = document.querySelector(".mobile-dashboard");
  const desktopDash = document.querySelector(".desktop-dashboard");
  const sezioni = document.querySelectorAll(".sezione-dettaglio");

  function mostraDashboardMobile() {
    if (mobileDash) mobileDash.style.display = "block";
    if (desktopDash) desktopDash.style.display = "none";
    sezioni.forEach((s) => (s.style.display = "none"));
    window.scrollTo(0, 0);
  }

  function mostraSezioneMobile(id) {
    if (mobileDash) mobileDash.style.display = "none";
    if (desktopDash) desktopDash.style.display = "none";
    sezioni.forEach((s) => {
      s.style.display = s.id === "sezione-" + id ? "block" : "none";
    });

    if (id === "assenti") {
      const wrap = document.getElementById("assenti-wrapper");
      if (wrap) wrap.innerHTML = buildAssentiHTML();
    } else if (id === "turno") {
      const wrap = document.getElementById("turno-wrapper");
      if (wrap) wrap.innerHTML = buildTurnoHTML();
    }
    window.scrollTo(0, 0);
  }

  // click card mobile
  const mobileButtons = document.querySelectorAll(".mobile-dashboard [data-section]");
  mobileButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-section");
      if (!id) return;

      if (id === "assenti" || id === "turno") {
        mostraSezioneMobile(id);
      } else {
        // per ora le altre solo messaggio rapido
        alert("Sezione '" + id + "' in lavorazione (demo).");
      }
    });
  });

  // pulsanti "torna alla dashboard"
  const closeButtons = document.querySelectorAll("[data-close='sezione']");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mostraDashboardMobile();
    });
  });

  // se siamo su mobile all'avvio, mostro dashboard mobile
  if (window.matchMedia("(max-width: 768px)").matches) {
    if (mobileDash) mobileDash.style.display = "block";
    if (desktopDash) desktopDash.style.display = "none";
  }
}
