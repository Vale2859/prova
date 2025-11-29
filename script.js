// script.js

let inactivityTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  renderRiepilogoRapido();
  renderOfferte();
  renderEventi();
  setupCardClicks();
  resetInactivityTimer();
});

// =======================
// DATI DEMO
// =======================

const assenzeDemo = [
  { nome: "Mario Rossi", dal: "2025-11-29", al: "2025-11-30", tipo: "Ferie" },
  { nome: "Lucia Bianchi", dal: "2025-11-28", al: "2025-11-28", tipo: "Permesso" },
  { nome: "Giuseppe Neri", dal: "2025-12-03", al: "2025-12-05", tipo: "Malattia" },
];

const comunicazioniDemo = [
  { titolo: "Nuova procedura ricetta dematerializzata", data: "28/11", tipo: "Importante" },
  { titolo: "Aggiornamento orari turno dicembre", data: "27/11", tipo: "Info" },
];

const turnoOggiDemo = {
  data: "2025-11-28",
  farmacia: "Farmacia Montesano",
  orario: "08:00 – 20:00",
  appoggio: "Farmacia Centrale",
  note: "Turno ordinario diurno.",
};

const turniProssimiDemo = [
  { data: "29/11", farmacia: "Farmacia Centrale", orario: "08:00 – 20:00", appoggio: "Farmacia Montesano" },
  { data: "30/11", farmacia: "Farmacia Madonna delle Grazie", orario: "20:00 – 08:00", appoggio: "Farmacia Montesano" },
];

const offerteDemo = [
  "Promozione Colesterolo – test a 5€ per tutto il mese.",
  "Linea solari 30% di sconto fino a esaurimento scorte.",
];

const eventiDemo = [
  "Lun 02/12 – Giornata nutrizionista (solo su appuntamento).",
  "Gio 05/12 – Misurazione pressione gratuita in orario 09:00–12:30.",
];

// =======================
// TIMER INATTIVITÀ
// =======================
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    renderRiepilogoRapido();
  }, 20000); // 20 secondi
}

// =======================
// UTILITY PER QUADRANTE 2
// =======================
function setQuad2(title, html) {
  const titleEl = document.getElementById("quad2-title");
  const contentEl = document.getElementById("quad2-content");
  if (!titleEl || !contentEl) return;
  titleEl.textContent = title;
  contentEl.innerHTML = html;
}

// =======================
// RIEPILOGO RAPIDO
// =======================
function renderRiepilogoRapido() {
  const html = `
    <div class="riepilogo-rapido">
      <h3>Assenti oggi</h3>
      <ul>
        ${assenzeDemo
          .map(a => `<li>${a.nome} – ${a.tipo} (${formatShortDateIT(a.dal)} → ${formatShortDateIT(a.al)})</li>`)
          .join("")}
      </ul>

      <h3>Comunicazioni non lette</h3>
      <ul>
        ${comunicazioniDemo
          .map(c => `<li><strong>${c.data}</strong> – ${c.titolo} (${c.tipo})</li>`)
          .join("")}
      </ul>

      <h3>Farmacia di turno oggi</h3>
      <p><strong>${turnoOggiDemo.farmacia}</strong> – ${turnoOggiDemo.orario}<br/>
      Appoggio: ${turnoOggiDemo.appoggio}</p>
    </div>
  `;
  setQuad2("Riepilogo rapido", html);
}
// =======================
// DETTAGLIO SEZIONI
// =======================

function renderDettaglio(section) {
  resetInactivityTimer();

  switch (section) {
    case "assenti":
      renderDettaglioAssenti();
      break;
    case "comunicazioni":
      renderDettaglioComunicazioni();
      break;
    case "turno":
      renderDettaglioTurno();
      break;
    case "procedure":
      setQuad2("Procedure", "<p>Elenco procedure operative interne (demo).</p>");
      break;
    case "logistica":
      setQuad2("Logistica", "<p>Stato ordini, arrivi e materiale (demo).</p>");
      break;
    case "magazziniera":
      setQuad2("Magazziniera", "<p>Scorte, scadenze e inventari veloci (demo).</p>");
      break;
    case "scadenze":
      setQuad2("Prodotti in scadenza", "<p>Lista prodotti in scadenza nei prossimi giorni (demo).</p>");
      break;
    case "consumabili":
      setQuad2("Consumabili", "<p>Disponibilità consumabili per banco, laboratorio, servizi (demo).</p>");
      break;
    case "consegne":
      setQuad2("Consegne / Ritiri", "<p>Consegne programmate ai clienti e ritiri previsti (demo).</p>");
      break;
    case "cassa":
      setQuad2("Cambio cassa", "<p>Storico cambi cassa e quadrature veloci (demo).</p>");
      break;
    case "archivio":
      setQuad2("Archivio file", "<p>Documenti operativi, procedure firmate, contratti (demo).</p>");
      break;
    default:
      renderRiepilogoRapido();
  }
}

function renderDettaglioAssenti() {
  const html = `
    <h3>Assenti / Permessi approvati</h3>
    <ul>
      ${assenzeDemo
        .map(a => `<li><strong>${a.nome}</strong> – ${a.tipo} (${formatShortDateIT(a.dal)} → ${formatShortDateIT(a.al)})</li>`)
        .join("")}
    </ul>
    <p style="font-size:0.8rem; opacity:0.8;">
      (In futuro: filtro per ruolo, stampa riepilogo, invio su WhatsApp al team.)
    </p>
  `;
  setQuad2("Assenti / Permessi", html);
}

function renderDettaglioComunicazioni() {
  const html = `
    <h3>Comunicazioni interne</h3>
    <ul>
      ${comunicazioniDemo
        .map(c => `<li><strong>${c.data}</strong> – ${c.titolo} <em>(${c.tipo})</em></li>`)
        .join("")}
    </ul>
    <p style="font-size:0.8rem; opacity:0.8;">
      (In futuro: lettura/da leggere per ogni dipendente, allegati, conferma lettura.)
    </p>
  `;
  setQuad2("Comunicazioni", html);
}

function renderDettaglioTurno() {
  const html = `
    <h3>Turno di oggi</h3>
    <p><strong>${turnoOggiDemo.farmacia}</strong><br/>
       Orario: ${turnoOggiDemo.orario}<br/>
       Appoggio: ${turnoOggiDemo.appoggio}<br/>
       Note: ${turnoOggiDemo.note}</p>

    <h3>Prossimi turni</h3>
    <ul>
      ${turniProssimiDemo
        .map(t => `<li><strong>${t.data}</strong> – ${t.farmacia} (${t.orario}) · Appoggio: ${t.appoggio}</li>`)
        .join("")}
    </ul>
  `;
  setQuad2("Farmacia di turno", html);
}

// =======================
// OFFERTE & EVENTI (QUADRANTE 3)
// =======================

function renderOfferte() {
  const box = document.getElementById("offerte-content");
  if (!box) return;
  box.innerHTML = `
    <ul>
      ${offerteDemo.map(o => `<li>${o}</li>`).join("")}
    </ul>
  `;
}

function renderEventi() {
  const box = document.getElementById("eventi-content");
  if (!box) return;
  box.innerHTML = `
    <ul>
      ${eventiDemo.map(e => `<li>${e}</li>`).join("")}
    </ul>
  `;
}

// =======================
// CLICK CARD (MOBILE + DESKTOP)
// =======================

function setupCardClicks() {
  const buttons = document.querySelectorAll("[data-section]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-section");
      renderDettaglio(section);
    });
  });
}

// =======================
// UTILITY DATE
// =======================

function formatShortDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}
