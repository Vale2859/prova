// script.js

// =========================
// UTILITY DATE
// =========================
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toISO(dateStr) {
  // assume 'YYYY-MM-DD'
  return dateStr;
}

function formatDateIT(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatDayLabel(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// =========================
// LOCAL STORAGE
// =========================
const LS_KEYS = {
  USERS: "fm_utenti",
  SESSION: "fm_sessione",
  OFFERTE: "fm_offerte",
  GIORNATE: "fm_giornate",
  AGENDA: "fm_agenda"
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// =========================
// STATO GLOBALE
// =========================
let utenti = loadLS(LS_KEYS.USERS, []);
let sessione = loadLS(LS_KEYS.SESSION, null);
let offerte = loadLS(LS_KEYS.OFFERTE, []);
let giornate = loadLS(LS_KEYS.GIORNATE, []);
let agenda = loadLS(LS_KEYS.AGENDA, []);

let currentMonth = (() => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() }; // 0-based
})();

let panoramicaTimer = null;
// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  setupAuthTabs();
  setupAuth();
  setupDashboard();
  decideInitialScreen();
});

// =========================
// AUTH UI
// =========================
function setupAuthTabs() {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = {
    login: document.getElementById("auth-panel-login"),
    register: document.getElementById("auth-panel-register")
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.authTab;
      tabs.forEach((t) => t.classList.remove("auth-tab--active"));
      tab.classList.add("auth-tab--active");

      Object.entries(panels).forEach(([key, panel]) => {
        panel.classList.toggle("auth-panel--active", key === id);
      });
    });
  });
}

function setupAuth() {
  // login classico
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;

      let user =
        utenti.find((u) => u.username === username && u.password === password) ||
        null;

      if (!user) {
        // fallback demo farmacia
        user = { ruolo: "farmacia", fullname: "Farmacia Montesano" };
      }

      startSession(user);
    });
  }

  // accesso veloce demo
  document.querySelectorAll("[data-demo-login]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.demoLogin;
      let user;
      if (value === "farmacia") {
        user = { ruolo: "farmacia", fullname: "Farmacia Montesano" };
      } else if (value === "titolare") {
        user = { ruolo: "titolare", fullname: "Valerio Montesano" };
      } else {
        user = { ruolo: "dipendente", fullname: value };
      }
      startSession(user);
    });
  });

  // registrazione
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const ruolo = document.getElementById("reg-role").value;
      const fullname = document.getElementById("reg-fullname").value.trim();
      const username = document.getElementById("reg-username").value.trim();
      const password = document.getElementById("reg-password").value;
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim();

      if (!ruolo || !fullname || !username || !password) {
        alert("Compila tutti i campi obbligatori.");
        return;
      }

      if (ruolo === "cliente" && !phone) {
        alert("Per i clienti il telefono è obbligatorio.");
        return;
      }

      if (utenti.some((u) => u.username === username)) {
        alert("Username già utilizzato.");
        return;
      }

      utenti.push({ ruolo, fullname, username, password, phone, email });
      saveLS(LS_KEYS.USERS, utenti);
      alert("Utente registrato. Ora puoi effettuare il login.");

      // passa al tab login
      document.querySelector('[data-auth-tab="login"]').click();
      document.getElementById("login-username").value = username;
    });
  }
}

function startSession(user) {
  sessione = user;
  saveLS(LS_KEYS.SESSION, sessione);
  document.getElementById("topbar-user-name").textContent =
    `${user.fullname || "Utente"} (${user.ruolo || "demo"})`;
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("dashboard-screen").style.display = "flex";
  refreshAllViews();
}

function endSession() {
  sessione = null;
  saveLS(LS_KEYS.SESSION, null);
  document.getElementById("auth-screen").style.display = "flex";
  document.getElementById("dashboard-screen").style.display = "none";
}

function decideInitialScreen() {
  if (sessione) {
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("dashboard-screen").style.display = "flex";
    document.getElementById("topbar-user-name").textContent =
      `${sessione.fullname || "Utente"} (${sessione.ruolo || "demo"})`;
    refreshAllViews();
  } else {
    document.getElementById("auth-screen").style.display = "flex";
    document.getElementById("dashboard-screen").style.display = "none";
  }
}
// =========================
// DASHBOARD SETUP
// =========================
function setupDashboard() {
  // logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      endSession();
    });
  }

  // sezione contenuti (click card)
  document.querySelectorAll("[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.section;
      showSectionContent(id);
    });
  });

  // modali promo
  document.getElementById("btn-add-offerta").addEventListener("click", () =>
    openOffertaModal()
  );
  document.getElementById("btn-add-giornata").addEventListener("click", () =>
    openGiornataModal()
  );
  document.getElementById("btn-all-promos").addEventListener("click", () =>
    openPromosModal()
  );

  // modale appuntamento
  document.getElementById("btn-new-appt").addEventListener("click", () =>
    openApptModal()
  );

  // chiusura modali generica
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.close;
      const modal = document.getElementById(id);
      if (modal) modal.classList.add("hidden");
    });
  });

  // submit modali
  document
    .getElementById("form-offerta")
    .addEventListener("submit", onSubmitOfferta);

  document
    .getElementById("form-giornata")
    .addEventListener("submit", onSubmitGiornata);

  document
    .getElementById("form-appt")
    .addEventListener("submit", onSubmitAppt);

  // navigazione mese agenda
  document
    .getElementById("btn-month-prev")
    .addEventListener("click", () => changeMonth(-1));
  document
    .getElementById("btn-month-next")
    .addEventListener("click", () => changeMonth(1));

  // fab placeholder
  document.getElementById("fab-quick").addEventListener("click", () => {
    alert("In futuro qui potrai aggiungere azioni rapide.");
  });
}

function refreshAllViews() {
  renderPromos();
  renderAgenda();
  renderPanoramica();
}

// =========================
// PANORAMICA VS SEZIONI
// =========================
function vistaSezioneHtml(id) {
  const map = {
    assenti: {
      titolo: "Assenti / Permessi",
      testo:
        "Qui vedrai elenco assenze approvate, permessi e richieste del personale."
    },
    turno: {
      titolo: "Farmacia di turno",
      testo:
        "Turni di oggi, prossimi turni e farmacie di appoggio in chiaro per tutti."
    },
    comunicazioni: {
      titolo: "Comunicazioni interne",
      testo:
        "Messaggi rapidi tra titolare e personale: note operative, avvisi, memo."
    },
    procedure: {
      titolo: "Procedure",
      testo:
        "Procedure standard, protocolli operativi, schede da consultare rapidamente."
    },
    logistica: {
      titolo: "Logistica",
      testo:
        "Consegne, ritiri, corrieri e materiali: qui avrai lo stato aggiornato."
    },
    magazziniera: {
      titolo: "Magazziniera",
      testo:
        "Inventari, resi, giacenze critiche: in futuro questa sezione sarà il loro pannello."
    },
    scadenze: {
      titolo: "Prodotti in scadenza",
      testo:
        "Elenco prodotti in scadenza con priorità di smaltimento e note per il banco."
    },
    consumabili: {
      titolo: "Consumabili",
      testo:
        "Guanti, aghi, carta, modulistica: livelli, riordino e storico consumi."
    },
    archivio: {
      titolo: "Consegne / Archivio file",
      testo:
        "Documenti, moduli, allegati, consegne ai corrieri e storico caricamenti."
    }
  };

  const info = map[id] || {
    titolo: "Sezione",
    testo: "Contenuti in arrivo per questa sezione."
  };

  return `
    <h2>${info.titolo}</h2>
    <p>${info.testo}</p>
    <p style="margin-top:8px;font-size:0.8rem;opacity:0.65;">
      Suggerimento: se non tocchi nulla per 20 secondi, la panoramica rapida tornerà automaticamente.
    </p>
  `;
}

function showSectionContent(id) {
  const pano = document.getElementById("panoramica-wrapper");
  const content = document.getElementById("section-content");
  if (!pano || !content) return;

  if (panoramicaTimer) clearTimeout(panoramicaTimer);

  pano.style.display = "none";
  content.style.display = "block";
  content.innerHTML = vistaSezioneHtml(id);

  panoramicaTimer = setTimeout(() => {
    content.style.display = "none";
    pano.style.display = "block";
  }, 20000);
}

function renderPanoramica() {
  const today = todayISO();
  const serviziOggi = agenda.filter((a) => a.data === today).length;
  const offerteAttive = offerte.filter((o) => !isScaduta(o)).length;
  const assenzeFittizie = 0; // placeholder
  const scadenzeFittizie = 0;
  const comunicazioniFittizie = 1;

  document.getElementById("p-servizi-oggi").textContent = serviziOggi;
  document.getElementById("p-offerte").textContent = offerteAttive;
  document.getElementById("p-assenze").textContent = assenzeFittizie;
  document.getElementById("p-scadenze").textContent = scadenzeFittizie;
  document.getElementById("p-comunicazioni").textContent = comunicazioniFittizie;
}
// =========================
// PROMOZIONI & GIORNATE
// =========================
function isScaduta(item) {
  if (!item.al) return false;
  return item.al < todayISO();
}

function renderPromos() {
  const offCont = document.getElementById("offerte-list");
  const gioCont = document.getElementById("giornate-list");
  offCont.innerHTML = "";
  gioCont.innerHTML = "";

  if (!offerte.length) {
    offCont.innerHTML =
      '<div class="promo-empty">Nessuna offerta in corso.</div>';
  } else {
    offerte.forEach((o) => {
      const div = document.createElement("div");
      const scaduta = isScaduta(o);
      div.className = "promo-item" + (scaduta ? " promo-item--expired" : "");
      div.innerHTML = `
        <div>
          <div class="promo-title">${o.titolo}</div>
          <span class="promo-date">${formatDateIT(o.dal)} → ${formatDateIT(
        o.al
      )}</span>
        </div>
        <div class="promo-actions">
          <span class="promo-tag">${
            scaduta ? "OFFERTA SCADUTA" : "OFFERTA"
          }</span>
          <button class="icon-button" data-edit-offerta="${o.id}">✏️</button>
          <button class="icon-button" data-del-offerta="${o.id}">🗑</button>
        </div>
      `;
      offCont.appendChild(div);
    });
  }

  if (!giornate.length) {
    gioCont.innerHTML =
      '<div class="promo-empty">Nessuna giornata programmata.</div>';
  } else {
    giornate.forEach((g) => {
      const div = document.createElement("div");
      const scaduta = isScaduta(g);
      div.className = "promo-item" + (scaduta ? " promo-item--expired" : "");
      div.innerHTML = `
        <div>
          <div class="promo-title">${g.titolo}</div>
          <span class="promo-date">${formatDateIT(g.dal)} → ${formatDateIT(
        g.al
      )}</span>
        </div>
        <div class="promo-actions">
          <span class="promo-tag">${
            scaduta ? "GIORNATA CONCLUSA" : "GIORNATA"
          }</span>
          <button class="icon-button" data-edit-giornata="${g.id}">✏️</button>
          <button class="icon-button" data-del-giornata="${g.id}">🗑</button>
        </div>
      `;
      gioCont.appendChild(div);
    });
  }

  // delega eventi edit/del
  offCont.querySelectorAll("[data-edit-offerta]").forEach((btn) =>
    btn.addEventListener("click", () =>
      openOffertaModal(btn.dataset.editOfferta)
    )
  );
  offCont.querySelectorAll("[data-del-offerta]").forEach((btn) =>
    btn.addEventListener("click", () => deleteOfferta(btn.dataset.delOfferta))
  );

  gioCont.querySelectorAll("[data-edit-giornata]").forEach((btn) =>
    btn.addEventListener("click", () =>
      openGiornataModal(btn.dataset.editGiornata)
    )
  );
  gioCont.querySelectorAll("[data-del-giornata]").forEach((btn) =>
    btn.addEventListener("click", () =>
      deleteGiornata(btn.dataset.delGiornata)
    )
  );
}

// OFFERTA
function openOffertaModal(id = null) {
  const modal = document.getElementById("modal-offerta");
  const title = document.getElementById("modal-offerta-title");
  const inputId = document.getElementById("offerta-id");
  const t = document.getElementById("offerta-titolo");
  const from = document.getElementById("offerta-from");
  const to = document.getElementById("offerta-to");
  const note = document.getElementById("offerta-note");

  if (id) {
    const off = offerte.find((o) => o.id === id);
    inputId.value = off.id;
    t.value = off.titolo;
    from.value = off.dal;
    to.value = off.al;
    note.value = off.note || "";
    title.textContent = "Modifica offerta";
  } else {
    inputId.value = "";
    t.value = "";
    from.value = todayISO();
    to.value = todayISO();
    note.value = "";
    title.textContent = "Nuova offerta in corso";
  }

  modal.classList.remove("hidden");
}

function onSubmitOfferta(e) {
  e.preventDefault();
  const id = document.getElementById("offerta-id").value;
  const titolo = document.getElementById("offerta-titolo").value.trim();
  const dal = document.getElementById("offerta-from").value;
  const al = document.getElementById("offerta-to").value;
  const note = document.getElementById("offerta-note").value.trim();
  if (!titolo || !dal || !al) {
    alert("Compila tutti i campi obbligatori.");
    return;
  }
  if (al < dal) {
    alert("La data 'al' deve essere successiva o uguale a 'dal'.");
    return;
  }

  if (id) {
    const off = offerte.find((o) => o.id === id);
    off.titolo = titolo;
    off.dal = dal;
    off.al = al;
    off.note = note;
  } else {
    offerte.push({
      id: crypto.randomUUID(),
      titolo,
      dal,
      al,
      note
    });
  }

  saveLS(LS_KEYS.OFFERTE, offerte);
  document.getElementById("modal-offerta").classList.add("hidden");
  renderPromos();
  renderPanoramica();
}

function deleteOfferta(id) {
  if (!confirm("Eliminare questa offerta?")) return;
  offerte = offerte.filter((o) => o.id !== id);
  saveLS(LS_KEYS.OFFERTE, offerte);
  renderPromos();
  renderPanoramica();
}
// GIORNATA
function openGiornataModal(id = null) {
  const modal = document.getElementById("modal-giornata");
  const title = document.getElementById("modal-giornata-title");
  const inputId = document.getElementById("giornata-id");
  const t = document.getElementById("giornata-titolo");
  const from = document.getElementById("giornata-from");
  const to = document.getElementById("giornata-to");
  const note = document.getElementById("giornata-note");

  if (id) {
    const g = giornate.find((x) => x.id === id);
    inputId.value = g.id;
    t.value = g.titolo;
    from.value = g.dal;
    to.value = g.al;
    note.value = g.note || "";
    title.textContent = "Modifica giornata in farmacia";
  } else {
    inputId.value = "";
    t.value = "";
    from.value = todayISO();
    to.value = todayISO();
    note.value = "";
    title.textContent = "Nuova giornata in farmacia";
  }

  modal.classList.remove("hidden");
}

function onSubmitGiornata(e) {
  e.preventDefault();
  const id = document.getElementById("giornata-id").value;
  const titolo = document.getElementById("giornata-titolo").value.trim();
  const dal = document.getElementById("giornata-from").value;
  const al = document.getElementById("giornata-to").value;
  const note = document.getElementById("giornata-note").value.trim();
  if (!titolo || !dal || !al) {
    alert("Compila tutti i campi obbligatori.");
    return;
  }
  if (al < dal) {
    alert("La data 'al' deve essere successiva o uguale a 'dal'.");
    return;
  }

  if (id) {
    const g = giornate.find((x) => x.id === id);
    g.titolo = titolo;
    g.dal = dal;
    g.al = al;
    g.note = note;
    // aggiorna agenda legata alla giornata
    agenda = agenda.filter((a) => a.giornataId !== id);
    addGiornataToAgenda(g);
  } else {
    const gid = crypto.randomUUID();
    const g = { id: gid, titolo, dal, al, note };
    giornate.push(g);
    addGiornataToAgenda(g);
  }

  saveLS(LS_KEYS.GIORNATE, giornate);
  saveLS(LS_KEYS.AGENDA, agenda);
  document.getElementById("modal-giornata").classList.add("hidden");
  renderPromos();
  renderAgenda();
}

function deleteGiornata(id) {
  if (!confirm("Eliminare questa giornata e gli slot agenda collegati?")) return;
  giornate = giornate.filter((g) => g.id !== id);
  agenda = agenda.filter((a) => a.giornataId !== id);
  saveLS(LS_KEYS.GIORNATE, giornate);
  saveLS(LS_KEYS.AGENDA, agenda);
  renderPromos();
  renderAgenda();
}

function addGiornataToAgenda(g) {
  const start = new Date(g.dal);
  const end = new Date(g.al);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    agenda.push({
      id: crypto.randomUUID(),
      data: iso,
      oraDa: "08:00",
      oraA: "20:00",
      nome: g.titolo,
      servizio: "Giornata in farmacia",
      telefono: "",
      tipo: "giornata",
      giornataId: g.id
    });
  }
}

// MODALE PROMOS
function openPromosModal() {
  const m = document.getElementById("modal-promos");
  const offAtt = document.getElementById("modal-offerte-attive");
  const offScad = document.getElementById("modal-offerte-scadute");
  const gioAtt = document.getElementById("modal-giornate-attive");
  const gioScad = document.getElementById("modal-giornate-scadute");

  offAtt.innerHTML = "";
  offScad.innerHTML = "";
  gioAtt.innerHTML = "";
  gioScad.innerHTML = "";

  const renderList = (arr, container, emptyText) => {
    if (!arr.length) {
      container.innerHTML = `<div class="promo-empty">${emptyText}</div>`;
      return;
    }
    arr
      .slice()
      .sort((a, b) => a.dal.localeCompare(b.dal))
      .forEach((item) => {
        const div = document.createElement("div");
        div.className = "promo-item";
        div.innerHTML = `
          <div>
            <div class="promo-title">${item.titolo}</div>
            <span class="promo-date">${formatDateIT(item.dal)} → ${formatDateIT(
          item.al
        )}</span>
          </div>
        `;
        container.appendChild(div);
      });
  };

  renderList(
    offerte.filter((o) => !isScaduta(o)),
    offAtt,
    "Nessuna offerta attiva."
  );
  renderList(
    offerte.filter((o) => isScaduta(o)),
    offScad,
    "Nessuna offerta scaduta."
  );
  renderList(
    giornate.filter((g) => !isScaduta(g)),
    gioAtt,
    "Nessuna giornata in programma."
  );
  renderList(
    giornate.filter((g) => isScaduta(g)),
    gioScad,
    "Nessuna giornata conclusa."
  );

  m.classList.remove("hidden");
}

// =========================
// AGENDA
// =========================
function changeMonth(delta) {
  currentMonth.month += delta;
  if (currentMonth.month < 0) {
    currentMonth.month = 11;
    currentMonth.year--;
  } else if (currentMonth.month > 11) {
    currentMonth.month = 0;
    currentMonth.year++;
  }
  renderAgenda();
}

function renderAgenda() {
  const label = document.getElementById("agenda-month-label");
  const cal = document.getElementById("agenda-calendar");
  const date = new Date(currentMonth.year, currentMonth.month, 1);
  const monthLabel = date.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });
  label.textContent = monthLabel;

  const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // lun=0
  const daysInMonth = new Date(
    currentMonth.year,
    currentMonth.month + 1,
    0
  ).getDate();

  let html = '<table class="calendar-grid"><thead><tr>';
  ["LU", "MA", "ME", "GI", "VE", "SA", "DO"].forEach((d) => {
    html += `<th>${d}</th>`;
  });
  html += "</tr></thead><tbody><tr>";

  let cell = 0;
  for (let i = 0; i < startWeekday; i++, cell++) {
    html += `<td></td>`;
  }

  const today = todayISO();
  for (let day = 1; day <= daysInMonth; day++, cell++) {
    if (cell > 0 && cell % 7 === 0) html += "</tr><tr>";
    const iso = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const dayEvents = agenda.filter((a) => a.data === iso);
    const hasEvents = dayEvents.length > 0;

    const classes = ["calendar-day"];
    if (iso === today) classes.push("calendar-day--today");
    if (!hasEvents) {
      // nothing
    } else {
      classes.push("calendar-day--has-events");
    }

    html += `<td>
      <div class="${classes.join(" ")}" data-date-iso="${iso}">
        <span>${day}</span>
      </div>
    </td>`;
  }

  while (cell % 7 !== 0) {
    html += "<td></td>";
    cell++;
  }

  html += "</tr></tbody></table>";
  cal.innerHTML = html;

  // attach events click + long press
  cal.querySelectorAll(".calendar-day").forEach((el) => {
    const iso = el.dataset.dateIso;
    let pressTimer = null;

    el.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => {
        openDayModal(iso);
      }, 500);
    });

    ["mouseup", "mouseleave"].forEach((ev) =>
      el.addEventListener(ev, () => {
        if (pressTimer) clearTimeout(pressTimer);
      })
    );

    el.addEventListener("click", () => {
      openDayModal(iso);
    });
  });
}

function openDayModal(iso) {
  const modal = document.getElementById("modal-day");
  const title = document.getElementById("modal-day-title");
  const list = document.getElementById("modal-day-list");

  const items = agenda
    .filter((a) => a.data === iso)
    .sort((a, b) => a.oraDa.localeCompare(b.oraDa));

  title.textContent = `Appuntamenti – ${formatDayLabel(iso)}`;
  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = "<li>Nessun appuntamento.</li>";
  } else {
    items.forEach((a) => {
      const li = document.createElement("li");
      li.className = "day-popup-row";
      li.innerHTML = `
        <span class="day-popup-time">${a.oraDa} – ${a.oraA}</span>
        <span class="day-popup-main">${a.nome} – ${a.servizio}</span>
        <span class="day-popup-phone">${a.telefono || ""}</span>
      `;
      list.appendChild(li);
    });
  }

  modal.classList.remove("hidden");
}

function openApptModal(id = null) {
  const modal = document.getElementById("modal-appt");
  const title = document.getElementById("modal-appt-title");
  const inputId = document.getElementById("appt-id");
  const date = document.getElementById("appt-date");
  const from = document.getElementById("appt-from");
  const to = document.getElementById("appt-to");
  const name = document.getElementById("appt-name");
  const service = document.getElementById("appt-service");
  const phone = document.getElementById("appt-phone");

  if (id) {
    const a = agenda.find((x) => x.id === id);
    inputId.value = a.id;
    date.value = a.data;
    from.value = a.oraDa;
    to.value = a.oraA;
    name.value = a.nome;
    service.value = a.servizio;
    phone.value = a.telefono;
    title.textContent = "Modifica appuntamento";
  } else {
    inputId.value = "";
    date.value = todayISO();
    from.value = "09:00";
    to.value = "09:30";
    name.value = "";
    service.value = "";
    phone.value = "";
    title.textContent = "Nuovo appuntamento";
  }

  modal.classList.remove("hidden");
}

function onSubmitAppt(e) {
  e.preventDefault();
  const id = document.getElementById("appt-id").value;
  const data = document.getElementById("appt-date").value;
  const from = document.getElementById("appt-from").value;
  const to = document.getElementById("appt-to").value;
  const name = document.getElementById("appt-name").value.trim();
  const service = document.getElementById("appt-service").value.trim();
  const phone = document.getElementById("appt-phone").value.trim();

  if (!data || !from || !to || !name || !service || !phone) {
    alert("Compila tutti i campi obbligatori.");
    return;
  }

  if (to <= from) {
    alert("L'ora di fine deve essere successiva a quella di inizio.");
    return;
  }

  if (id) {
    const a = agenda.find((x) => x.id === id);
    a.data = data;
    a.oraDa = from;
    a.oraA = to;
    a.nome = name;
    a.servizio = service;
    a.telefono = phone;
  } else {
    agenda.push({
      id: crypto.randomUUID(),
      data,
      oraDa: from,
      oraA: to,
      nome: name,
      servizio: service,
      telefono: phone,
      tipo: "appuntamento"
    });
  }

  saveLS(LS_KEYS.AGENDA, agenda);
  document.getElementById("modal-appt").classList.add("hidden");
  renderAgenda();
  renderPanoramica();
}
