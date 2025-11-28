// =======================
// DATI DEMO VELOCISSIMI
// (quando avrai il server li sostituiamo)
// =======================

const assenzeDemo = [
  {
    nome: "Rosalia – banco etico",
    tipo: "Ferie",
    dal: "28/11",
    al: "30/11",
    oggi: true
  },
  {
    nome: "Daniele – magazzino",
    tipo: "Permesso",
    dal: "29/11",
    al: "29/11",
    oggi: false
  }
];

const appuntamentiDemo = [
  {
    ora: "09:00",
    cliente: "Bianchi Luca",
    servizio: "ECG"
  },
  {
    ora: "11:30",
    cliente: "Rossi Maria",
    servizio: "Holter pressorio"
  }
];

const comunicazioniDemo = [
  {
    titolo: "Nuova procedura chiusura serale",
    testo: "Usare la nuova check-list in cassa e firmare sul registro.",
    urgente: true
  },
  {
    titolo: "Verifica armadietto stupefacenti",
    testo: "Controllare giacenze e scadenze entro fine settimana.",
    urgente: false
  }
];

const turniDemo = {
  attuale: {
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    orario: "08:00 – 08:00",
    note: "Turno completo 24h"
  },
  prossimi: [
    {
      data: "Domani",
      principale: "Farmacia Centrale",
      appoggio: "Farmacia Montesano",
      orario: "08:00 – 20:00"
    },
    {
      data: "Tra 2 giorni",
      principale: "Farmacia Madonna delle Grazie",
      appoggio: "Farmacia Montesano",
      orario: "20:00 – 08:00"
    }
  ]
};

const scadenzeDemo = [
  { prodotto: "Omeprazolo 20mg cps", giorni: 5 },
  { prodotto: "Vitamina D gocce", giorni: 7 },
  { prodotto: "Antibiotico pediatrico", giorni: 3 }
];

const consumabiliDemo = [
  { voce: "Guanti lattice S", livello: "OK per 2 settimane" },
  { voce: "Siringhe 5 ml", livello: "Scorta per 10 giorni" },
  { voce: "Rotoli scontrini", livello: "Da riordinare tra 3 giorni" }
];

const consegneDemo = [
  { tipo: "Consegna grossista", orario: "10:30", note: "3 colli + frigo" },
  { tipo: "Ritiro resi", orario: "16:00", note: "Dermocosmesi – 1 scatolone" }
];

const cambiCassaDemo = [
  { ora: "14:22", operatore: "Valerio", note: "Confermata quadratura" },
  { ora: "09:05", operatore: "Giovanni", note: "Avvio turno mattina" }
];

const archivioDemo = [
  { nome: "Procedura chiusura serale.pdf", data: "20/11/2025" },
  { nome: "Check-list magazzino.xlsx", data: "18/11/2025" },
  { nome: "Protocollo stupefacenti.docx", data: "12/11/2025" },
  { nome: "Manuale nuovo gestionale.pdf", data: "05/11/2025" }
];

const magazzinoDemo = [
  "Controllo banco automedicazione – lunedì",
  "Inventario dermocosmesi – mercoledì",
  "Verifica prodotti frigorifero – ogni venerdì",
  "Pianificazione resi mensili – fine mese"
];

// =======================
// SETUP PAGINA
// =======================

document.addEventListener("DOMContentLoaded", () => {
  aggiornaDataOggi();
  aggiornaAssenti();
  aggiornaAppuntamenti();
  popolaComunicazioni();
  popolaTurni();
  popolaScadenze();
  popolaConsumabili();
  popolaConsegne();
  popolaCambiCassa();
  popolaArchivio();
  popolaMagazzino();

  setupNavigazione();
});

// Data in header desktop
function aggiornaDataOggi() {
  const target = document.getElementById("today-date-desktop");
  if (!target) return;

  const oggi = new Date();
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  target.textContent = formatter.format(oggi);
}

// Assenti – numeri, preview, liste pagina
function aggiornaAssenti() {
  const oggi = assenzeDemo.filter((a) => a.oggi);
  const prossimi = assenzeDemo.filter((a) => !a.oggi);

  const countOggi = oggi.length;

  // top strip
  const topAss = document.getElementById("top-assenti-count");
  if (topAss) topAss.textContent = String(countOggi);

  // badge desktop / mobile
  aggiornaBadge("assenti", assenzeDemo.length);

  // preview desktop
  const preview = document.getElementById("preview-assenti");
  if (preview) {
    if (assenzeDemo.length === 0) {
      preview.textContent = "Nessun assente registrato oggi.";
    } else {
      const prima = assenzeDemo[0];
      preview.textContent = `${prima.nome} – ${prima.tipo} (${prima.dal} → ${prima.al}).`;
    }
  }

  // pagina interna
  const ulOggi = document.getElementById("lista-assenti-oggi");
  const ulProssimi = document.getElementById("lista-assenti-prossimi");
  if (!ulOggi || !ulProssimi) return;

  ulOggi.innerHTML = "";
  ulProssimi.innerHTML = "";

  if (oggi.length === 0) {
    ulOggi.innerHTML = `<li class="page-item-row"><span class="page-item-meta">Nessun assente oggi.</span></li>`;
  } else {
    oggi.forEach((a) => {
      const li = document.createElement("li");
      li.className = "page-item-row";
      li.innerHTML = `
        <div class="page-item-title">${a.nome}</div>
        <div class="page-item-meta">${a.tipo} · ${a.dal} → ${a.al}</div>
      `;
      ulOggi.appendChild(li);
    });
  }

  if (prossimi.length === 0) {
    ulProssimi.innerHTML = `<li class="page-item-row"><span class="page-item-meta">Nessuna assenza programmata.</span></li>`;
  } else {
    prossimi.forEach((a) => {
      const li = document.createElement("li");
      li.className = "page-item-row";
      li.innerHTML = `
        <div class="page-item-title">${a.nome}</div>
        <div class="page-item-meta">${a.tipo} · ${a.dal} → ${a.al}</div>
      `;
      ulProssimi.appendChild(li);
    });
  }
}

// Appuntamenti
function aggiornaAppuntamenti() {
  const count = appuntamentiDemo.length;

  const top = document.getElementById("top-appuntamenti-count");
  if (top) top.textContent = String(count);

  const badge = document.getElementById("badge-appuntamenti");
  if (badge) badge.textContent = String(count);

  const preview = document.getElementById("preview-appuntamenti");
  if (preview) {
    if (count === 0) {
      preview.textContent = "Nessun appuntamento programmato.";
    } else {
      const primo = appuntamentiDemo[0];
      preview.textContent = `${count} appuntamenti · Prossimo: ${primo.ora} – ${primo.cliente}`;
    }
  }

  const ul = document.getElementById("lista-appuntamenti");
  if (!ul) return;

  ul.innerHTML = "";
  if (count === 0) {
    ul.innerHTML = `<div class="page-item-row"><span class="page-item-meta">Nessun appuntamento oggi.</span></div>`;
    return;
  }

  appuntamentiDemo.forEach((a) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${a.ora} – ${a.cliente}</div>
      <div class="page-item-meta">${a.servizio}</div>
    `;
    ul.appendChild(row);
  });
}

// Comunicazioni
function popolaComunicazioni() {
  aggiornaBadge("comunicazioni", comunicazioniDemo.length);

  const preview = document.getElementById("preview-comunicazioni");
  if (preview) {
    const nonLette = comunicazioniDemo.length;
    if (nonLette === 0) {
      preview.textContent = "Nessuna comunicazione non letta.";
    } else if (nonLette === 1) {
      preview.textContent = "1 comunicazione interna non letta.";
    } else {
      preview.textContent = `${nonLette} comunicazioni interne non lette.`;
    }
  }

  const container = document.getElementById("lista-comunicazioni");
  if (!container) return;

  container.innerHTML = "";
  comunicazioniDemo.forEach((c) => {
    const box = document.createElement("div");
    box.className = "page-item-row";
    box.innerHTML = `
      <div class="page-item-title">
        ${c.urgente ? "⚠️ " : ""}${c.titolo}
      </div>
      <div class="page-item-meta">${c.testo}</div>
    `;
    container.appendChild(box);
  });
}

// Turni
function popolaTurni() {
  // top strip
  const topTurno = document.getElementById("top-turno-value");
  const topAppoggio = document.getElementById("top-appoggio-value");
  if (topTurno && turniDemo.attuale) {
    topTurno.textContent = `${turniDemo.attuale.principale} · ${turniDemo.attuale.orario}`;
  }
  if (topAppoggio && turniDemo.attuale) {
    topAppoggio.textContent = `${turniDemo.attuale.appoggio} · fasce ${turniDemo.attuale.orario}`;
  }

  const box = document.getElementById("turno-attuale-box");
  if (box && turniDemo.attuale) {
    box.innerHTML = `
      <h2>Turno attuale</h2>
      <p class="page-item-title">${turniDemo.attuale.principale}</p>
      <p class="page-item-meta">Orario: ${turniDemo.attuale.orario}</p>
      <p class="page-item-meta">Appoggio: ${turniDemo.attuale.appoggio}</p>
      <p class="page-item-meta">${turniDemo.attuale.note}</p>
    `;
  }

  const ul = document.getElementById("lista-prossimi-turni");
  if (!ul) return;
  ul.innerHTML = "";

  turniDemo.prossimi.forEach((t) => {
    const li = document.createElement("div");
    li.className = "page-item-row";
    li.innerHTML = `
      <div class="page-item-title">${t.data} – ${t.principale}</div>
      <div class="page-item-meta">Appoggio: ${t.appoggio} · Orario: ${t.orario}</div>
    `;
    ul.appendChild(li);
  });
}

// Scadenze
function popolaScadenze() {
  const preview = document.getElementById("preview-scadenze");
  if (preview && scadenzeDemo.length > 0) {
    const min = scadenzeDemo.reduce((acc, p) => Math.min(acc, p.giorni), 999);
    preview.textContent = `${scadenzeDemo.length} articoli in scadenza entro ${min} giorni.`;
  }

  const ul = document.getElementById("lista-scadenze");
  if (!ul) return;
  ul.innerHTML = "";

  scadenzeDemo.forEach((s) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${s.prodotto}</div>
      <div class="page-item-meta">Scade entro ${s.giorni} giorni</div>
    `;
    ul.appendChild(row);
  });
}

// Consumabili
function popolaConsumabili() {
  const ul = document.getElementById("lista-consumabili");
  if (!ul) return;
  ul.innerHTML = "";

  consumabiliDemo.forEach((c) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${c.voce}</div>
      <div class="page-item-meta">${c.livello}</div>
    `;
    ul.appendChild(row);
  });
}

// Consegne
function popolaConsegne() {
  const preview = document.getElementById("preview-logistica");
  if (preview && consegneDemo.length > 0) {
    preview.textContent = `${consegneDemo.length} movimenti previsti oggi.`;
  }

  const ul = document.getElementById("lista-consegne");
  if (!ul) return;
  ul.innerHTML = "";

  consegneDemo.forEach((c) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${c.tipo}</div>
      <div class="page-item-meta">${c.orario} · ${c.note}</div>
    `;
    ul.appendChild(row);
  });

  const box = document.getElementById("logistica-oggi-box");
  if (box) {
    box.innerHTML = `
      <h2>Riepilogo di oggi</h2>
      <p class="page-item-meta">${consegneDemo.length} movimenti tra consegne e ritiri.</p>
    `;
  }
}

// Cambi cassa
function popolaCambiCassa() {
  const ul = document.getElementById("lista-cambi-cassa");
  if (!ul) return;
  ul.innerHTML = "";

  cambiCassaDemo.forEach((c) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${c.ora} – ${c.operatore}</div>
      <div class="page-item-meta">${c.note}</div>
    `;
    ul.appendChild(row);
  });
}

// Archivio
function popolaArchivio() {
  const ul = document.getElementById("lista-archivio");
  if (!ul) return;
  ul.innerHTML = "";

  archivioDemo.forEach((f) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `
      <div class="page-item-title">${f.nome}</div>
      <div class="page-item-meta">Caricato il ${f.data}</div>
    `;
    ul.appendChild(row);
  });
}

// Magazzino
function popolaMagazzino() {
  const box = document.getElementById("magazzino-box");
  if (!box) return;

  box.innerHTML = "";
  magazzinoDemo.forEach((voce) => {
    const row = document.createElement("div");
    row.className = "page-item-row";
    row.innerHTML = `<div class="page-item-title">${voce}</div>`;
    box.appendChild(row);
  });
}

// Aggiorna badge (mobile + desktop)
function aggiornaBadge(key, value) {
  document.querySelectorAll(`[data-badge="${key}"]`).forEach((el) => {
    el.textContent = String(value);
    el.style.display = value > 0 ? "inline-flex" : "none";
  });
}

// =======================
// NAVIGAZIONE PAGINE
// =======================

function setupNavigazione() {
  const mobileDash = document.querySelector(".mobile-dashboard");
  const desktopDash = document.querySelector(".desktop-dashboard");
  const pages = document.querySelectorAll(".page");

  function mostraDashboard() {
    if (mobileDash) mobileDash.classList.remove("hidden");
    if (desktopDash) desktopDash.classList.remove("hidden");
    pages.forEach((p) => p.classList.add("hidden"));
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function apriPagina(key) {
    if (mobileDash) mobileDash.classList.add("hidden");
    if (desktopDash) desktopDash.classList.add("hidden");
    pages.forEach((p) => p.classList.add("hidden"));

    const page = document.getElementById(`page-${key}`);
    if (page) {
      page.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  // click su tutte le card con data-open
  document.querySelectorAll("[data-open]").forEach((el) => {
    const key = el.getAttribute("data-open");
    el.addEventListener("click", () => {
      if (!key) return;
      apriPagina(key);
    });
  });

  // bottoni "torna alla dashboard"
  document.querySelectorAll('[data-back="dashboard"]').forEach((btn) => {
    btn.addEventListener("click", mostraDashboard);
  });
}
