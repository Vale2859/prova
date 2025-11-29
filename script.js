// script.js

document.addEventListener("DOMContentLoaded", function () {
  initTodayLabel();
  initMobileSections();
  initDesktopCardPanel();
});

/* =======================
   DATA OGGI (header desktop)
   ======================= */
function initTodayLabel() {
  const el = document.getElementById("desk-today-label");
  if (!el) return;
  const d = new Date();
  const opt = { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" };
  el.textContent = new Intl.DateTimeFormat("it-IT", opt).format(d);
}

/* =======================
   DATI DEMO
   ======================= */

// assenze/permessi approvati (demo)
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

// turni demo
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

/* =======================
   FUNZIONI SUPPORTO DATE
   ======================= */
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

/* =======================
   LOGICA MOBILE (sezioni a schermo intero)
   ======================= */

function initMobileSections() {
  const mobileDashboard = document.querySelector(".mobile-dashboard");
  const sezioni = document.querySelectorAll(".sezione-dettaglio");
  if (!mobileDashboard || sezioni.length === 0) return;

  function mostraDashboard() {
    sezioni.forEach((sec) => (sec.style.display = "none"));
    mobileDashboard.style.display = "block";
    window.scrollTo(0, 0);
  }

  function mostraSezione(id) {
    mobileDashboard.style.display = "none";
    sezioni.forEach((sec) => {
      sec.style.display = sec.id === "sezione-" + id ? "block" : "none";
    });

    if (id === "assenti") {
      renderAssentiMobile();
    } else if (id === "turno") {
      renderTurnoMobile();
    }
    window.scrollTo(0, 0);
  }

  // click sulle card mobile con data-section
  document.querySelectorAll(".mobile-dashboard [data-section]").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = btn.getAttribute("data-section");
      if (id) mostraSezione(id);
    });
  });

  // pulsanti "Torna alla dashboard"
  document.querySelectorAll("[data-close='sezione']").forEach((btn) => {
    btn.addEventListener("click", mostraDashboard);
  });

  // select ruolo nella sezione assenti
  const ruoloAssSelect = document.getElementById("ruolo-assenti");
  if (ruoloAssSelect) {
    ruoloAssSelect.addEventListener("change", renderAssentiMobile);
  }
}

/* ====== ASSENTI / PERMESSI – LOGICA CONDIVISA ====== */

function computeAssenze(ruolo) {
  let lista = assenzeDemo.filter((a) => a.stato === "approvato");
  const oggiDate = parseISO(oggiISO);

  // se ruolo = dipendente → mostro solo Mario Rossi (demo)
  if (ruolo === "dipendente") {
    const mioNome = "Mario Rossi";
    lista = lista.filter((a) => a.nome === mioNome);
  }

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
  return { oggiList, nextList };
}

function createAssenzeHTML(oggiList, nextList) {
  // blocco "oggi"
  let htmlOggi = '<h3 class="detail-section-title">Assenti oggi</h3>';
  if (oggiList.length === 0) {
    htmlOggi +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Nessuno assente oggi.</p>';
  } else {
    htmlOggi += '<ul class="detail-list">';
    oggiList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlOggi += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
    });
    htmlOggi += "</ul>";
  }

  // blocco "prossimi"
  let htmlNext = '<h3 class="detail-section-title">Assenze prossimi giorni</h3>';
  if (nextList.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altre assenze approvate nei prossimi giorni.</p>';
  } else {
    htmlNext += '<ul class="detail-list">';
    nextList.forEach((a) => {
      const range = formatRangeIT(a.dal, a.al);
      htmlNext += `<li><strong>${a.nome}</strong> – ${a.tipo} (${range})</li>`;
    });
    htmlNext += "</ul>";
  }

  return { htmlOggi, htmlNext };
}

/* Mobile: riempio la sezione dedicata */

function renderAssentiMobile() {
  const containerOggi = document.getElementById("assenti-oggi");
  const containerNext = document.getElementById("assenti-prossimi");
  if (!containerOggi || !containerNext) return;

  const ruoloSelect = document.getElementById("ruolo-assenti");
  const ruolo = ruoloSelect ? ruoloSelect.value : "farmacia";

  const { oggiList, nextList } = computeAssenze(ruolo);
  const { htmlOggi, htmlNext } = createAssenzeHTML(oggiList, nextList);

  containerOggi.innerHTML = htmlOggi;
  containerNext.innerHTML = htmlNext;
}

/* ====== FARMACIA DI TURNO – LOGICA CONDIVISA ====== */

function computeTurni() {
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

  return { turnoOggi, altri };
}

/* Mobile: sezione a parte */

function renderTurnoMobile() {
  const boxOggi = document.getElementById("turno-oggi");
  const boxNext = document.getElementById("turno-prossimi");
  if (!boxOggi || !boxNext) return;

  const { turnoOggi, altri } = computeTurni();
  const labelDataOggi = formatLongDateIT(turnoOggi.data);

  boxOggi.innerHTML = `
    <h3 class="detail-section-title">Turno di oggi</h3>
    <p style="margin:0 0 4px; font-size:0.9rem;">
      <strong>${turnoOggi.farmacia}</strong> – ${labelDataOggi}
    </p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Orario: <strong>${turnoOggi.orario}</strong></p>
    <p style="margin:0 0 4px; font-size:0.9rem;">Appoggio: <strong>${turnoOggi.appoggio}</strong></p>
    <p style="margin:0; font-size:0.9rem; opacity:0.85;">${turnoOggi.note}</p>
  `;

  let htmlNext = '<h3 class="detail-section-title">Prossimi turni</h3>';
  if (altri.length === 0) {
    htmlNext +=
      '<p style="margin:0; font-size:0.9rem; opacity:0.8;">Non ci sono altri turni in elenco.</p>';
  } else {
    htmlNext += '<ul class="detail-list">';
    altri.forEach((t) => {
      htmlNext += `<li><strong>${formatShortDateIT(
        t.data
      )}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
    });
    htmlNext += "</ul>";
  }
  boxNext.innerHTML = htmlNext;
}

/* =======================
   DESKTOP: CARD → DETTAGLIO (DESTRA)
   ======================= */

const INACTIVITY_MS = 60000; // 1 minuto
let inactivityTimer = null;

function initDesktopCardPanel() {
  const detailPanel = document.getElementById("detail-panel");
  if (!detailPanel) return;

  const cards = document.querySelectorAll(".desk-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.getAttribute("data-card-key");
      if (!key) return;
      renderCardDetail(key);
      resetInactivityTimer();
    });
  });

  // Riepilogo iniziale + timer
  renderSummary();
  resetInactivityTimer();
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(renderSummary, INACTIVITY_MS);
}

/* RIEPILOGO (mostrato dopo 1 min e all'inizio) */

function renderSummary() {
  const detailPanel = document.getElementById("detail-panel");
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <h2 class="detail-title">Riepilogo rapido</h2>
    <p class="detail-subtitle">
      Nessuna interazione da un po'… Ti mostro una panoramica di tutte le aree.
      Clicca una card a sinistra per aprire il dettaglio.
    </p>
    <div class="summary-grid">
      <div class="summary-card" style="background:rgba(0, 200, 83, 0.12);">
        <strong>Assenti / Permessi</strong><br />
        Oggi: controlla chi non è presente e quando rientra.
      </div>
      <div class="summary-card" style="background:rgba(27, 120, 255, 0.18);">
        <strong>Farmacia di turno</strong><br />
        Turno attivo ora e prossimi 3 turni.
      </div>
      <div class="summary-card" style="background:rgba(255, 61, 154, 0.16);">
        <strong>Comunicazioni</strong><br />
        Ultime note operative da leggere.
      </div>
      <div class="summary-card" style="background:rgba(38, 198, 218, 0.16);">
        <strong>Procedure</strong><br />
        Passaggi chiave per cassa, ricette, servizi.
      </div>
      <div class="summary-card" style="background:rgba(246, 166, 35, 0.18);">
        <strong>Logistica</strong><br />
        Corrieri, consegne e ritiri in arrivo.
      </div>
      <div class="summary-card" style="background:rgba(25, 193, 216, 0.16);">
        <strong>Magazziniera</strong><br />
        Scorte, resi e inventari veloci.
      </div>
      <div class="summary-card" style="background:rgba(255, 138, 101, 0.18);">
        <strong>Prodotti in scadenza</strong><br />
        Suggerimenti per smaltire i prodotti critici.
      </div>
      <div class="summary-card" style="background:rgba(67, 160, 71, 0.2);">
        <strong>Consumabili</strong><br />
        Controllo rapido di guanti, sacchetti, carta, ecc.
      </div>
      <div class="summary-card" style="background:rgba(57, 73, 171, 0.2);">
        <strong>Consegne / Ritiri</strong><br />
        Cosa deve arrivare oggi e cosa deve uscire.
      </div>
    </div>
  `;
}

/* DETTAGLIO SINGOLA CARD (PC) */

function renderCardDetail(key) {
  const detailPanel = document.getElementById("detail-panel");
  if (!detailPanel) return;

  if (key === "assenti") {
    const { oggiList, nextList } = computeAssenze("farmacia");
    const { htmlOggi, htmlNext } = createAssenzeHTML(oggiList, nextList);

    detailPanel.innerHTML = `
      <h2 class="detail-title">Assenti / Permessi</h2>
      <p class="detail-subtitle">
        Vista unica per sapere subito chi manca oggi e nei prossimi giorni.
      </p>
      ${htmlOggi}
      ${htmlNext}
    `;
    return;
  }

  if (key === "turno") {
    const { turnoOggi, altri } = computeTurni();
    const labelDataOggi = formatLongDateIT(turnoOggi.data);

    let htmlNext = "";
    if (altri.length === 0) {
      htmlNext =
        '<p style="margin:8px 0 0; font-size:0.9rem; opacity:0.8;">Non ci sono altri turni in elenco.</p>';
    } else {
      htmlNext = '<h3 class="detail-section-title">Prossimi turni</h3><ul class="detail-list">';
      altri.forEach((t) => {
        htmlNext += `<li><strong>${formatShortDateIT(
          t.data
        )}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`;
      });
      htmlNext += "</ul>";
    }

    detailPanel.innerHTML = `
      <h2 class="detail-title">Farmacia di turno</h2>
      <p class="detail-subtitle">
        Oggi in evidenza, più panoramica dei prossimi turni.
      </p>
      <h3 class="detail-section-title">Turno di oggi</h3>
      <ul class="detail-list">
        <li><strong>Farmacia:</strong> ${turnoOggi.farmacia}</li>
        <li><strong>Data:</strong> ${labelDataOggi}</li>
        <li><strong>Orario:</strong> ${turnoOggi.orario}</li>
        <li><strong>Appoggio:</strong> ${turnoOggi.appoggio}</li>
      </ul>
      <p style="margin:4px 0 0; font-size:0.9rem; opacity:0.85;">${turnoOggi.note}</p>
      ${htmlNext}
    `;
    return;
  }

  // Le altre card: testo super sintetico (demo)
  let title = "";
  let body = "";

  switch (key) {
    case "comunicazioni":
      title = "Comunicazioni interne";
      body = `
        <p class="detail-subtitle">
          Qui troverai solo le informazioni operative davvero importanti.
        </p>
        <h3 class="detail-section-title">Cosa puoi fare in 1 minuto</h3>
        <ul class="detail-list">
          <li>Vedi subito le <strong>ultime 3 comunicazioni</strong>.</li>
          <li>Filtra per: urgenti, da leggere, già lette.</li>
          <li>Segna “presa visione” con un click.</li>
        </ul>
      `;
      break;

    case "procedure":
      title = "Procedure rapide";
      body = `
        <p class="detail-subtitle">
          Mini-manuale operativo per i momenti di panico al banco.
        </p>
        <h3 class="detail-section-title">Blocchi principali</h3>
        <ul class="detail-list">
          <li>Cassa &amp; chiusura giornaliera.</li>
          <li>Ricette SSN, dematerializzate e buoni.</li>
          <li>Servizi (ECG, holter, CUP, autoanalisi).</li>
        </ul>
        <p style="margin-top:6px; font-size:0.85rem; opacity:0.8;">
          In futuro ogni voce sarà cliccabile con check-list passo-passo.
        </p>
      `;
      break;

    case "logistica":
      title = "Logistica";
      body = `
        <p class="detail-subtitle">
          Panoramica corrieri e movimenti di merce in e out.
        </p>
        <h3 class="detail-section-title">Oggi</h3>
        <ul class="detail-list">
          <li>Consegne programmate (grossisti + diretti).</li>
          <li>Ritiri resi ai fornitori.</li>
          <li>Note speciali (bancali, espositori, frigo ecc.).</li>
        </ul>
      `;
      break;

    case "magazzino":
      title = "Magazziniera";
      body = `
        <p class="detail-subtitle">
          Per chi gestisce scaffali, resi e inventari.
        </p>
        <h3 class="detail-section-title">Azioni veloci</h3>
        <ul class="detail-list">
          <li>Lista scaffali “caldi” da controllare oggi.</li>
          <li>Resi da preparare o in attesa di ritiro.</li>
          <li>Inventari flash (banco automedicazione, OTC, ecc.).</li>
        </ul>
      `;
      break;

    case "scadenze":
      title = "Prodotti in scadenza";
      body = `
        <p class="detail-subtitle">
          Focus sui prodotti critici da smaltire subito.
        </p>
        <h3 class="detail-section-title">Vista rapida (idea futura)</h3>
        <ul class="detail-list">
          <li>Scadenze &lt; 30 giorni.</li>
          <li>Proposte di promo o spostamento esposizione.</li>
          <li>Report da condividere con i fornitori.</li>
        </ul>
      `;
      break;

    case "consumabili":
      title = "Consumabili";
      body = `
        <p class="detail-subtitle">
          Guanti, sacchetti, carta, etichette, rotoli POS, ecc.
        </p>
        <h3 class="detail-section-title">Cosa saprai subito</h3>
        <ul class="detail-list">
          <li>Scorte sotto soglia minima.</li>
          <li>Ordini già programmati.</li>
          <li>Note per il prossimo acquisto grande.</li>
        </ul>
      `;
      break;

    case "consegne":
      title = "Consegne / Ritiri";
      body = `
        <p class="detail-subtitle">
          Agenda giornaliera di ciò che entra ed esce.
        </p>
        <h3 class="detail-section-title">Oggi</h3>
        <ul class="detail-list">
          <li>Consegne previste per fascia oraria.</li>
          <li>Ritiri programmati (resi, conto deposito, espositori).</li>
          <li>Flag “arrivato” / “mancato” in un click.</li>
        </ul>
      `;
      break;

    default:
      title = "Sezione in lavorazione";
      body = `
        <p class="detail-subtitle">
          Questa sezione sarà personalizzata per il tuo flusso di lavoro in farmacia.
        </p>
      `;
      break;
  }

  detailPanel.innerHTML = `
    <h2 class="detail-title">${title}</h2>
    ${body}
  `;
}
