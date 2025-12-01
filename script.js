// script.js

// ===============================
// UTILITA' BASE
// ===============================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return formatDateISO(new Date());
}

function parseISO(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// -------------------------------
// LOCALSTORAGE HELPERS
// -------------------------------

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===============================
// STATO APP
// ===============================

let currentUser = null; // {id, name, role}

// dati demo
let promoState = loadLS("pfm_promozioni", {
  offerte: [],
  giornate: [],
});

let agendaState = loadLS("pfm_agenda", {
  appuntamenti: [],
});

let scadenzeState = loadLS("pfm_scadenze", {
  prodotti: [], // {id, mese: "2025-11", nome, pezzi}
});

// ===============================
// AVVIO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  setupAuth();
  setupDashboard();
  renderAll();
});
// ===============================
// AUTH (LOGIN / REGISTER)
// ===============================

function setupAuth() {
  const storedUser = loadLS("pfm_currentUser", null);
  if (storedUser) {
    currentUser = storedUser;
    showDashboard();
  } else {
    showAuth();
  }

  // accesso rapido demo
  $$(".auth-btn[data-demo-role]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.demoRole;
      currentUser = {
        id: `demo-${role}`,
        name: role === "farmacia" ? "Farmacia Montesano" : "Titolare demo",
        role,
      };
      saveLS("pfm_currentUser", currentUser);
      showDashboard();
    });
  });

  // popolamento select utenti registrati
  refreshLoginUserSelect();

  $("#loginExistingBtn").addEventListener("click", () => {
    const id = $("#login-user-select").value;
    if (!id) return;
    const users = loadLS("pfm_users", []);
    const found = users.find((u) => u.id === id);
    if (!found) return;
    currentUser = { id: found.id, name: found.name, role: found.role };
    saveLS("pfm_currentUser", currentUser);
    showDashboard();
  });

  $("#register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const role = $("#reg-role").value;
    const name = $("#reg-name").value.trim();
    const username = $("#reg-username").value.trim();
    const password = $("#reg-password").value.trim();
    const phone = $("#reg-phone").value.trim();
    const email = $("#reg-email").value.trim();

    if (!role || !name || !username || !password || !phone) return;

    const users = loadLS("pfm_users", []);
    const id = `u_${Date.now()}`;
    users.push({ id, role, name, username, password, phone, email });
    saveLS("pfm_users", users);

    $("#register-message").textContent =
      "Utente registrato. Ora puoi trovarlo nell'elenco a sinistra.";
    $("#register-form").reset();
    refreshLoginUserSelect();
  });

  $("#logoutBtn").addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("pfm_currentUser");
    showAuth();
  });
}

function refreshLoginUserSelect() {
  const select = $("#login-user-select");
  const users = loadLS("pfm_users", []);
  select.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "— Seleziona utente —";
  select.appendChild(opt0);
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.name} (${u.role})`;
    select.appendChild(opt);
  });
}

function showAuth() {
  $("#auth-screen").style.display = "flex";
  $("#dashboard-screen").style.display = "none";
  $("#topbar-subtitle").textContent = "Accesso";
  $("#current-role-label").textContent = "Non autenticato";
}

function showDashboard() {
  $("#auth-screen").style.display = "none";
  $("#dashboard-screen").style.display = "block";
  const roleText =
    currentUser?.role === "farmacia"
      ? "Farmacia Montesano (farmacia)"
      : currentUser?.role === "titolare"
      ? "Titolare"
      : currentUser
      ? `${currentUser.name} (${currentUser.role})`
      : "Demo";
  $("#current-role-label").textContent = roleText;
  $("#topbar-subtitle").textContent = "Dashboard principale";
}
// ===============================
// DASHBOARD SETUP
// ===============================

let currentMonthDate = new Date();

function setupDashboard() {
  // click card sezioni → dettaglio area contenuti
  $$(".section-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.section;
      showSectionDetail(id);
    });
  });

  $("#back-to-panoramica").addEventListener("click", () => {
    $("#detail-area").style.display = "none";
    $("#panoramica-rapida").style.display = "grid";
  });

  // promozioni / giornate
  $("#btn-add-offerta").addEventListener("click", openModalAddOfferta);
  $("#btn-add-giornata").addEventListener("click", openModalAddGiornata);
  $("#btn-vedi-tutte-offerte").addEventListener("click", openModalVediOfferte);
  $("#btn-giornate-attive").addEventListener("click", () =>
    openModalListaGiornate(false)
  );
  $("#btn-giornate-scadute").addEventListener("click", () =>
    openModalListaGiornate(true)
  );

  // agenda
  $("#prev-month").addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    renderAgendaCalendar();
  });
  $("#next-month").addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    renderAgendaCalendar();
  });
  $("#btn-new-appointment").addEventListener("click", openModalNewAppointment);

  // fab azioni rapide → include "Nuove scadenze"
  $("#quickActionsBtn").addEventListener("click", openQuickActionsModal);

  // modale base chiusura
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
}

// ===============================
// RENDER PRINCIPALE
// ===============================

function renderAll() {
  renderPromozioni();
  renderAgendaCalendar();
  renderPanoramicaRapida();
}

// ---------------------
// PANORAMICA RAPIDA
// ---------------------

function renderPanoramicaRapida() {
  // servizi di oggi
  const oggi = todayISO();
  const countServiziOggi = agendaState.appuntamenti.filter(
    (a) => a.data === oggi
  ).length;
  $("#pan-servizi-oggi-count").textContent = countServiziOggi;

  // assenze: demo fissa (0)
  $("#pan-assenze-count").textContent = 0;

  // offerte attive
  const todayDate = parseISO(oggi);
  const attive = promoState.offerte.filter((o) => {
    const dal = parseISO(o.dal);
    const al = parseISO(o.al);
    return todayDate >= dal && todayDate <= al;
  });
  $("#pan-offerte-count").textContent = attive.length;

  // comunicazioni non lette: demo 0
  $("#pan-comunicazioni-count").textContent = 0;
}
// ---------------------
// DETTAGLIO SEZIONI
// ---------------------

function showSectionDetail(sectionId) {
  const titleMap = {
    assenti: "Assenti / Permessi",
    turno: "Farmacia di turno",
    comunicazioni: "Comunicazioni",
    procedure: "Procedure interne",
    logistica: "Logistica",
    magazzino: "Magazziniera",
    scadenze: "Prodotti in scadenza",
    consumabili: "Consumabili",
    archivio: "Consegne / Archivio file",
  };

  $("#detail-title").textContent = titleMap[sectionId] || "Dettaglio sezione";
  $("#panoramica-rapida").style.display = "none";
  $("#detail-area").style.display = "block";

  const box = $("#detail-content");
  box.innerHTML = "";

  if (sectionId === "scadenze") {
    const info = document.createElement("p");
    info.textContent =
      "Gestione rapida dei prodotti in scadenza. Usa il pulsante qui sotto per inserire nuove scadenze per mese.";
    box.appendChild(info);

    const btn = document.createElement("button");
    btn.className = "btn-primary btn-small";
    btn.textContent = "Inserisci nuove scadenze";
    btn.addEventListener("click", () => {
      openModalNuoveScadenze();
    });
    box.appendChild(btn);

    const listWrap = document.createElement("div");
    listWrap.style.marginTop = "10px";
    listWrap.innerHTML = "<h4>Scadenze inserite</h4>";
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    ul.style.fontSize = "0.8rem";

    const byMonth = {};
    scadenzeState.prodotti.forEach((p) => {
      if (!byMonth[p.mese]) byMonth[p.mese] = [];
      byMonth[p.mese].push(p);
    });

    const months = Object.keys(byMonth).sort();
    if (months.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nessun prodotto in scadenza registrato.";
      ul.appendChild(li);
    } else {
      months.forEach((m) => {
        const liMonth = document.createElement("li");
        liMonth.style.marginTop = "6px";
        liMonth.innerHTML = `<strong>${m}</strong>`;
        ul.appendChild(liMonth);
        byMonth[m].forEach((p) => {
          const li = document.createElement("li");
          li.textContent = `• ${p.nome} – ${p.pezzi} pz`;
          ul.appendChild(li);
        });
      });
    }
    listWrap.appendChild(ul);
    box.appendChild(listWrap);
  } else {
    const p = document.createElement("p");
    p.textContent =
      "Contenuto demo della sezione. In futuro qui vedrai tabelle, note e funzioni specifiche.";
    box.appendChild(p);
  }

  // timer auto ritorno alla panoramica dopo 20 secondi senza interazioni
  let timer = box.dataset.timer;
  if (timer) {
    clearTimeout(Number(timer));
  }
  const newTimer = setTimeout(() => {
    $("#detail-area").style.display = "none";
    $("#panoramica-rapida").style.display = "grid";
  }, 20000);
  box.dataset.timer = String(newTimer);
}

// ===============================
// PROMOZIONI & GIORNATE
// ===============================

function renderPromozioni() {
  const ulOfferte = $("#offerte-list");
  ulOfferte.innerHTML = "";
  if (promoState.offerte.length === 0) {
    const li = document.createElement("li");
    li.className = "promo-empty";
    li.textContent = "Nessuna offerta in corso.";
    ulOfferte.appendChild(li);
  } else {
    promoState.offerte.forEach((o) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="promo-item-title">${o.titolo}</div>
        <div class="promo-meta">
          Dal ${o.dal} al ${o.al}
          &nbsp;·&nbsp;
          <span class="promo-badge">${
            isOffertaScaduta(o) ? "Offerta scaduta" : "Offerta attiva"
          }</span>
        </div>
      `;
      ulOfferte.appendChild(li);
    });
  }

  const ulGior = $("#giornate-list");
  ulGior.innerHTML = "";
  if (promoState.giornate.length === 0) {
    const li = document.createElement("li");
    li.className = "promo-empty";
    li.textContent = "Nessuna giornata programmata.";
    ulGior.appendChild(li);
  } else {
    promoState.giornate.forEach((g) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="promo-item-title">${g.titolo}</div>
        <div class="promo-meta">
          Dal ${g.dal} al ${g.al}
          &nbsp;·&nbsp;
          <span class="promo-badge">${
            isGiornataScaduta(g) ? "Giornata conclusa" : "Giornata attiva"
          }</span>
        </div>
      `;
      ulGior.appendChild(li);
    });
  }

  renderAgendaCalendar(); // per aggiornare evidenze giornate
}

function isOffertaScaduta(o) {
  const today = parseISO(todayISO());
  return parseISO(o.al) < today;
}

function isGiornataScaduta(g) {
  const today = parseISO(todayISO());
  return parseISO(g.al) < today;
}
// ---------------------
// MODAL OFFERTA / GIORNATA
// ---------------------

function openModalAddOfferta() {
  openModal({
    title: "Nuova offerta in corso",
    body: `
      <label class="auth-label">
        Titolo offerta
        <input id="offerta-titolo" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Dal
        <input id="offerta-dal" type="date" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Al
        <input id="offerta-al" type="date" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Note (facoltative)
        <textarea id="offerta-note" class="auth-input" rows="3" style="border-radius:14px;"></textarea>
      </label>
    `,
    buttons: [
      { label: "Annulla", variant: "outline" },
      {
        label: "Salva",
        variant: "primary",
        onClick: () => {
          const titolo = $("#offerta-titolo").value.trim();
          const dal = $("#offerta-dal").value || todayISO();
          const al = $("#offerta-al").value || dal;
          const note = $("#offerta-note").value.trim();
          if (!titolo) return;
          promoState.offerte.push({ id: Date.now(), titolo, dal, al, note });
          saveLS("pfm_promozioni", promoState);
          renderPromozioni();
          closeModal();
        },
      },
    ],
  });
}

function openModalAddGiornata() {
  openModal({
    title: "Nuova giornata in farmacia",
    body: `
      <label class="auth-label">
        Titolo giornata
        <input id="giornata-titolo" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Dal
        <input id="giornata-dal" type="date" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Al
        <input id="giornata-al" type="date" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Descrizione
        <textarea id="giornata-note" class="auth-input" rows="3" style="border-radius:14px;"></textarea>
      </label>
    `,
    buttons: [
      { label: "Annulla", variant: "outline" },
      {
        label: "Salva",
        variant: "primary",
        onClick: () => {
          const titolo = $("#giornata-titolo").value.trim();
          const dal = $("#giornata-dal").value || todayISO();
          const al = $("#giornata-al").value || dal;
          const note = $("#giornata-note").value.trim();
          if (!titolo) return;
          promoState.giornate.push({ id: Date.now(), titolo, dal, al, note });
          saveLS("pfm_promozioni", promoState);
          renderPromozioni();
          closeModal();
        },
      },
    ],
  });
}

function openModalVediOfferte() {
  const attive = promoState.offerte.filter((o) => !isOffertaScaduta(o));
  const scadute = promoState.offerte.filter((o) => isOffertaScaduta(o));
  let html = "<h4>Offerte attive</h4>";
  if (attive.length === 0) {
    html += "<p class='promo-empty'>Nessuna offerta attiva.</p>";
  } else {
    html += "<ul>";
    attive.forEach((o) => {
      html += `<li><strong>${o.titolo}</strong> – ${o.dal} → ${o.al}</li>`;
    });
    html += "</ul>";
  }
  html += "<h4 style='margin-top:10px;'>Offerte scadute</h4>";
  if (scadute.length === 0) {
    html += "<p class='promo-empty'>Nessuna offerta scaduta.</p>";
  } else {
    html += "<ul>";
    scadute.forEach((o) => {
      html += `<li><strong>${o.titolo}</strong> – ${o.dal} → ${o.al}</li>`;
    });
    html += "</ul>";
  }

  openModal({
    title: "Tutte le offerte",
    body: html,
    buttons: [{ label: "Chiudi", variant: "primary" }],
  });
}

function openModalListaGiornate(onlyScadute) {
  const lista = promoState.giornate.filter((g) =>
    onlyScadute ? isGiornataScaduta(g) : !isGiornataScaduta(g)
  );
  let html = "";
  if (lista.length === 0) {
    html = "<p class='promo-empty'>Nessuna giornata in elenco.</p>";
  } else {
    html = "<ul>";
    lista.forEach((g) => {
      html += `<li><strong>${g.titolo}</strong> – ${g.dal} → ${g.al}</li>`;
    });
    html += "</ul>";
  }
  openModal({
    title: onlyScadute ? "Giornate concluse" : "Giornate attive",
    body: html,
    buttons: [{ label: "Chiudi", variant: "primary" }],
  });
}

// ===============================
// AGENDA – CALENDARIO & APPUNTAMENTI
// ===============================

function renderAgendaCalendar() {
  const monthLabel = $("#month-label");
  const locale = "it-IT";
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  monthLabel.textContent = formatter.format(currentMonthDate);

  const y = currentMonthDate.getFullYear();
  const m = currentMonthDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // lun=0

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = startWeekday;

  const totalCells = Math.ceil((prevDays + daysInMonth) / 7) * 7;

  const calendar = document.createElement("div");
  calendar.className = "calendar-grid";

  const todayIso = todayISO();

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - prevDays + 1;
    const date = new Date(y, m, dayNum);
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (!inMonth) {
      cell.classList.add("calendar-day-out");
      cell.innerHTML = "&nbsp;";
    } else {
      const iso = formatDateISO(date);
      const numSpan = document.createElement("div");
      numSpan.className = "calendar-day-number";
      numSpan.textContent = dayNum;
      cell.appendChild(numSpan);

      if (iso === todayIso) {
        cell.classList.add("calendar-day-today");
      }

      const hasEvents = agendaState.appuntamenti.some(
        (a) => a.data === iso
      );
      if (hasEvents) {
        cell.classList.add("calendar-day-has-events");
      }

      const hasGiornata = promoState.giornate.some((g) => {
        const d = parseISO(iso);
        return d >= parseISO(g.dal) && d <= parseISO(g.al);
      });
      if (hasGiornata) {
        cell.classList.add("calendar-day-has-giornata");
      }

      cell.addEventListener("click", () => openModalAppuntamentiGiorno(iso));
    }

    calendar.appendChild(cell);
  }

  const container = $("#agenda-calendar");
  container.innerHTML = "";
  container.appendChild(calendar);
}

function openModalNewAppointment() {
  const today = todayISO();
  openModal({
    title: "Nuovo appuntamento",
    body: `
      <label class="auth-label">
        Data
        <input id="app-data" type="date" class="auth-input" value="${today}" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Ora inizio
        <input id="app-ora-inizio" type="time" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Ora fine
        <input id="app-ora-fine" type="time" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Nome e cognome
        <input id="app-nome" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Servizio / motivo
        <input id="app-servizio" class="auth-input" />
      </label>
      <label class="auth-label" style="margin-top:8px;">
        Numero di telefono
        <input id="app-phone" type="tel" class="auth-input" required />
      </label>
    `,
    buttons: [
      { label: "Annulla", variant: "outline" },
      {
        label: "Salva",
        variant: "primary",
        onClick: () => {
          const data = $("#app-data").value || today;
          const oraInizio = $("#app-ora-inizio").value || "08:00";
          const oraFine = $("#app-ora-fine").value || "08:30";
          const nome = $("#app-nome").value.trim() || "Cliente";
          const servizio = $("#app-servizio").value.trim() || "Servizio";
          const phone = $("#app-phone").value.trim();
          if (!phone) return;

          agendaState.appuntamenti.push({
            id: Date.now(),
            data,
            oraInizio,
            oraFine,
            nome,
            servizio,
            phone,
          });
          saveLS("pfm_agenda", agendaState);
          renderAgendaCalendar();
          renderPanoramicaRapida();
          closeModal();
        },
      },
    ],
  });
}

function openModalAppuntamentiGiorno(iso) {
  const lista = agendaState.appuntamenti
    .filter((a) => a.data === iso)
    .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

  let html = "";
  if (lista.length === 0) {
    html = "<p class='promo-empty'>Nessun appuntamento per questo giorno.</p>";
  } else {
    html = "<ul>";
    lista.forEach((a) => {
      html += `<li><strong>${a.oraInizio} – ${a.oraFine}</strong> · ${a.nome} – ${a.servizio} &nbsp;&nbsp;${a.phone}</li>`;
    });
    html += "</ul>";
  }

  openModal({
    title: `Appuntamenti – ${iso}`,
    body: html,
    buttons: [{ label: "Chiudi", variant: "primary" }],
  });
}

// ===============================
// SCADENZE – INSERIMENTO PER MESE
// ===============================

function openModalNuoveScadenze() {
  openModal({
    title: "Nuove scadenze – scegli il mese",
    body: `
      <label class="auth-label">
        Mese di scadenza
        <input id="scad-mese" type="month" class="auth-input" />
      </label>
    `,
    buttons: [
      { label: "Annulla", variant: "outline" },
      {
        label: "Avanti",
        variant: "primary",
        onClick: () => {
          const mese = $("#scad-mese").value;
          if (!mese) return;
          closeModal();
          openModalInserisciScadenzePerMese(mese);
        },
      },
    ],
  });
}

function openModalInserisciScadenzePerMese(mese) {
  const bodyHtml = `
    <p style="font-size:0.8rem; color:#6b7280;">
      Mese selezionato: <strong>${mese}</strong>. Inserisci i prodotti in scadenza.
      Quando compili una riga comparirà in automatico quella successiva.
    </p>
    <div id="scad-righe"></div>
  `;

  openModal({
    title: "Prodotti in scadenza",
    body: bodyHtml,
    buttons: [
      { label: "Annulla", variant: "outline" },
      {
        label: "Salva tutte",
        variant: "primary",
        onClick: () => {
          const rows = $$("#scad-righe .scad-row");
          rows.forEach((row) => {
            const nome = row.querySelector(".scad-nome").value.trim();
            const pezzi = row.querySelector(".scad-pezzi").value.trim();
            if (nome && pezzi) {
              scadenzeState.prodotti.push({
                id: Date.now() + Math.random(),
                mese,
                nome,
                pezzi: Number(pezzi),
              });
            }
          });
          saveLS("pfm_scadenze", scadenzeState);
          renderPanoramicaRapida();
          closeModal();
        },
      },
    ],
  });

  const container = $("#scad-righe");
  addScadenzaRow(container);
}

function addScadenzaRow(container) {
  const row = document.createElement("div");
  row.className = "scad-row";
  row.style.display = "flex";
  row.style.gap = "6px";
  row.style.marginTop = "6px";

  row.innerHTML = `
    <input class="auth-input scad-nome" placeholder="Nome prodotto" style="flex:2;" />
    <input class="auth-input scad-pezzi" placeholder="Pezzi" type="number" style="flex:1;" />
  `;

  container.appendChild(row);

  const pezziInput = row.querySelector(".scad-pezzi");
  pezziInput.addEventListener("change", () => {
    // quando compili l'ultima riga, aggiungo automaticamente la successiva
    const rows = $$("#scad-righe .scad-row");
    if (rows[rows.length - 1] === row) {
      addScadenzaRow(container);
    }
  });
}

// ===============================
// QUICK ACTIONS MODAL
// ===============================

function openQuickActionsModal() {
  openModal({
    title: "Azioni rapide",
    body: `
      <ul style="list-style:none; padding:0; margin:0; font-size:0.86rem;">
        <li><button id="qa-nuove-scadenze" class="btn-outline" style="width:100%; margin-top:4px;">Inserisci nuove scadenze</button></li>
        <li><button id="qa-nuovo-app" class="btn-outline" style="width:100%; margin-top:4px;">Nuovo appuntamento</button></li>
      </ul>
    `,
    buttons: [{ label: "Chiudi", variant: "primary" }],
  });

  $("#qa-nuove-scadenze").addEventListener("click", () => {
    closeModal();
    openModalNuoveScadenze();
  });
  $("#qa-nuovo-app").addEventListener("click", () => {
    closeModal();
    openModalNewAppointment();
  });
}

// ===============================
// MODAL GENERICO
// ===============================

function openModal({ title, body, buttons }) {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = body;
  const footer = $("#modal-footer");
  footer.innerHTML = "";
  buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.className =
      b.variant === "primary" ? "btn-primary btn-small" : "btn-outline btn-small";
    btn.addEventListener("click", () => {
      if (b.onClick) b.onClick();
      if (!b.onClick || b.label === "Chiudi") {
        // alcuni bottoni chiudono direttamente
      }
    });
    footer.appendChild(btn);
  });
  $("#modal-backdrop").style.display = "flex";
}

function closeModal() {
  $("#modal-backdrop").style.display = "none";
}
