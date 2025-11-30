// ===============================
// DEMO LOGIN / REGISTER
// ===============================
const authScreen = document.getElementById("auth-screen");
const dashboard = document.getElementById("dashboard");
const headerRoleLabel = document.getElementById("header-role-label");
const dashboardSubtitle = document.getElementById("dashboard-subtitle");

const btnTabLogin = document.getElementById("btn-tab-login");
const btnTabRegister = document.getElementById("btn-tab-register");
const panelLogin = document.getElementById("auth-login");
const panelRegister = document.getElementById("auth-register");
const registerForm = document.getElementById("register-form");

let loggedUser = null;

function showDashboard(user) {
  loggedUser = user;
  headerRoleLabel.textContent = user.label;
  dashboardSubtitle.textContent = "Dashboard principale";
  authScreen.style.display = "none";
  dashboard.style.display = "block";
  inizializzaDatiDemo();
  renderTutto();
}

function logout() {
  loggedUser = null;
  dashboard.style.display = "none";
  authScreen.style.display = "flex";
}

document.getElementById("btn-logout").addEventListener("click", logout);

btnTabLogin.addEventListener("click", () => {
  btnTabLogin.classList.add("active");
  btnTabRegister.classList.remove("active");
  panelLogin.style.display = "block";
  panelRegister.style.display = "none";
});

btnTabRegister.addEventListener("click", () => {
  btnTabRegister.classList.add("active");
  btnTabLogin.classList.remove("active");
  panelLogin.style.display = "none";
  panelRegister.style.display = "block";
});

// Quick login demo
document.querySelectorAll(".auth-quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const role = btn.dataset.role;
    let label = "";
    if (role === "farmacia") label = "Farmacia Montesano (farmacia)";
    else if (role === "titolare") label = "Valerio (titolare demo)";
    else if (role === "cliente") label = "Cliente demo";
    showDashboard({ role, label });
  });
});

document.querySelectorAll(".auth-quick-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    showDashboard({ role: "dipendente", label: name + " (dipendente)" });
  });
});

// register demo
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ruolo = document.getElementById("reg-ruolo").value;
  const username = document.getElementById("reg-username").value.trim();
  if (!username) return;
  const utente = { role: ruolo, label: username + " (" + ruolo + " demo)" };
  // salviamo giusto per memoria demo
  const saved = JSON.parse(localStorage.getItem("fm_utenti_demo") || "[]");
  saved.push({
    ruolo,
    username,
    phone: document.getElementById("reg-phone").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
  });
  localStorage.setItem("fm_utenti_demo", JSON.stringify(saved));
  showDashboard(utente);
});

// ===============================
// DATI DEMO PER DASBOARD
// ===============================
let offerte = [];
let giornate = [];
let appuntamenti = [];

function inizializzaDatiDemo() {
  // solo la prima volta
  if (offerte.length || giornate.length || appuntamenti.length) return;

  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = oggi.getMonth() + 1;

  function iso(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const oggiISO = iso(anno, mese, oggi.getDate());

  offerte = [
    {
      id: "off1",
      titolo: "LDF",
      tipo: "OFFERTA",
      dal: oggiISO,
      al: oggiISO,
      note: "30% di sconto.",
    },
  ];

  giornate = [
    {
      id: "gior1",
      titolo: "Giornata ECO",
      tipo: "GIORNATA",
      dal: oggiISO,
      al: oggiISO,
      note: "Elettrocardiogramma con referto cardiologo.",
    },
  ];

  appuntamenti = [
    {
      id: "app1",
      data: oggiISO,
      oraInizio: "08:00",
      oraFine: "09:00",
      nome: "Rossi Maria",
      motivo: "ECG",
    },
    {
      id: "app2",
      data: oggiISO,
      oraInizio: "09:30",
      oraFine: "10:30",
      nome: "Bianchi Luca",
      motivo: "Holter pressorio",
    },
    {
      id: "app3",
      data: oggiISO,
      oraInizio: "11:00",
      oraFine: "11:30",
      nome: "Verdi Anna",
      motivo: "Prelievo profilo lipidico",
    },
  ];

  // inizializza calendario al mese corrente
  currentMonth = oggi.getMonth();
  currentYear = anno;
  selectedDateISO = oggiISO;
}

// ===============================
// PANORAMICA + PROMO + AGENDA
// ===============================
const listaOfferte = document.getElementById("lista-offerte");
const listaGiornate = document.getElementById("lista-giornate");

const panServiziOggi = document.getElementById("pan-servizi-oggi");
const panAssenzeOggi = document.getElementById("pan-assenze-oggi");
const panOfferteAttive = document.getElementById("pan-offerte-attive");
const panComunicazioni = document.getElementById("pan-comunicazioni");

// Render panoramica rapida
function renderPanoramica() {
  const oggiISO = getTodayISO();

  const serviziOggi = appuntamenti.filter((a) => a.data === oggiISO).length;
  const offerteAttive = offerte.filter((o) => !isDateBefore(o.al, oggiISO)).length;
  const giornateAttive = giornate.filter((g) => !isDateBefore(g.al, oggiISO)).length;

  panServiziOggi.textContent = serviziOggi;
  panOfferteAttive.textContent = offerteAttive;
  panAssenzeOggi.textContent = 0; // per ora demo
  panComunicazioni.textContent = 1 + giornateAttive; // giusto per dare numeri
}

// Render liste promozioni / giornate
function renderPromozioni() {
  listaOfferte.innerHTML = "";
  listaGiornate.innerHTML = "";

  if (!offerte.length) {
    listaOfferte.innerHTML =
      '<li class="promo-item"><span class="promo-item-meta">Nessuna offerta in corso.</span></li>';
  } else {
    offerte.forEach((off) => {
      const li = document.createElement("li");
      li.className = "promo-item";
      li.innerHTML = `
        <div class="promo-item-title">${off.titolo}</div>
        <div class="promo-item-meta">${formatRangeIT(off.dal, off.al)}</div>
        <div class="promo-item-type">${off.tipo}</div>
        <div class="promo-actions">
          <button class="promo-btn-edit" aria-label="Modifica">✏️</button>
          <button class="promo-btn-delete" aria-label="Elimina">🗑</button>
        </div>
      `;
      li.querySelector(".promo-btn-edit").addEventListener("click", () =>
        apriModalPromo("offerta", off)
      );
      li.querySelector(".promo-btn-delete").addEventListener("click", () =>
        eliminaOfferta(off.id)
      );
      listaOfferte.appendChild(li);
    });
  }

  if (!giornate.length) {
    listaGiornate.innerHTML =
      '<li class="promo-item"><span class="promo-item-meta">Nessuna giornata programmata.</span></li>';
  } else {
    giornate.forEach((g) => {
      const li = document.createElement("li");
      li.className = "promo-item";
      li.innerHTML = `
        <div class="promo-item-title">${g.titolo}</div>
        <div class="promo-item-meta">${formatRangeIT(g.dal, g.al)}</div>
        <div class="promo-item-type">${g.tipo}</div>
        <div class="promo-actions">
          <button class="promo-btn-edit" aria-label="Modifica">✏️</button>
          <button class="promo-btn-delete" aria-label="Elimina">🗑</button>
        </div>
      `;
      li.querySelector(".promo-btn-edit").addEventListener("click", () =>
        apriModalPromo("giornata", g)
      );
      li.querySelector(".promo-btn-delete").addEventListener("click", () =>
        eliminaGiornata(g.id)
      );
      listaGiornate.appendChild(li);
    });
  }
}

// ===============================
// CALENDARIO MENSILE
// ===============================
const monthLabel = document.getElementById("agenda-month-label");
const daysGrid = document.getElementById("agenda-days-grid");
const btnMesePrev = document.getElementById("btn-mese-prev");
const btnMeseNext = document.getElementById("btn-mese-next");

let currentMonth = new Date().getMonth(); // 0-11
let currentYear = new Date().getFullYear();
let selectedDateISO = getTodayISO();

function renderCalendario() {
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // lun=0
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = firstOfMonth.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
  monthLabel.textContent = monthName;

  daysGrid.innerHTML = "";
  const totalCells = 42; // 6 righe
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "agenda-day";

    let dayNumber, monthOffset;
    if (i < startWeekday) {
      dayNumber = prevMonthDays - startWeekday + 1 + i;
      monthOffset = -1;
      cell.classList.add("out-month");
    } else if (i >= startWeekday + daysInMonth) {
      dayNumber = i - (startWeekday + daysInMonth) + 1;
      monthOffset = 1;
      cell.classList.add("out-month");
    } else {
      dayNumber = i - startWeekday + 1;
      monthOffset = 0;
    }

    const dateObj = new Date(currentYear, currentMonth + monthOffset, dayNumber);
    const iso = toISO(dateObj);

    const numSpan = document.createElement("div");
    numSpan.className = "agenda-day-number";
    numSpan.textContent = dateObj.getDate();

    const dots = document.createElement("div");
    dots.className = "agenda-day-dots";

    // Giorni con GIORNATE
    const haGiornata = giornate.some((g) => isDateInRange(iso, g.dal, g.al));
    if (haGiornata) {
      const dotG = document.createElement("div");
      dotG.className = "agenda-dot agenda-dot-giornata";
      dots.appendChild(dotG);
    }

    // Giorni con APPUNTAMENTI
    const haApp = appuntamenti.some((a) => a.data === iso);
    if (haApp) {
      const dotA = document.createElement("div");
      dotA.className = "agenda-dot agenda-dot-app";
      dots.appendChild(dotA);
    }

    cell.appendChild(numSpan);
    cell.appendChild(dots);

    if (iso === selectedDateISO) {
      cell.classList.add("selected");
    }

    // click = seleziona giorno
    cell.addEventListener("click", () => {
      selectedDateISO = iso;
      renderCalendario();
    });

    // long press = apri modal giornata
    setupLongPress(cell, () => {
      apriModalGiorno(iso);
    });

    daysGrid.appendChild(cell);
  }
}

btnMesePrev.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendario();
});
btnMeseNext.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendario();
});
// ===============================
// MODAL GENERICO (offerte / giornate / appuntamenti)
// ===============================
const modalBackdrop = document.getElementById("modal-backdrop");
const modalDialog = document.getElementById("modal-dialog");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

modalClose.addEventListener("click", chiudiModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) chiudiModal();
});

function chiudiModal() {
  modalBackdrop.style.display = "none";
  modalBody.innerHTML = "";
}

// UTIL DATE
function getTodayISO() {
  const d = new Date();
  return toISO(d);
}
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isDateBefore(a, b) {
  return a < b;
}
function isDateInRange(target, dal, al) {
  return target >= dal && target <= al;
}
function formatRangeIT(dal, al) {
  if (dal === al) return formatShortDateIT(dal);
  return formatShortDateIT(dal) + " – " + formatShortDateIT(al);
}
function formatShortDateIT(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}
function formatLongDateIT(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// LONG PRESS
function setupLongPress(element, callback) {
  let timer = null;
  const delay = 600; // ms

  const start = () => {
    timer = setTimeout(() => {
      timer = null;
      callback();
    }, delay);
  };
  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener("mousedown", start);
  element.addEventListener("touchstart", start);
  element.addEventListener("mouseup", cancel);
  element.addEventListener("mouseleave", cancel);
  element.addEventListener("touchend", cancel);
  element.addEventListener("touchcancel", cancel);
}

// Apertura modale promozione/giornata
function apriModalPromo(tipo, esistente) {
  modalBackdrop.style.display = "flex";
  modalTitle.textContent =
    (esistente ? "Modifica " : "Nuova ") +
    (tipo === "offerta" ? "offerta in corso" : "giornata in farmacia");

  const obj = esistente || {
    titolo: "",
    tipo: tipo === "offerta" ? "OFFERTA" : "GIORNATA",
    dal: getTodayISO(),
    al: getTodayISO(),
    note: "",
  };

  modalBody.innerHTML = `
    <form id="promo-form" class="modal-form">
      <label>
        Titolo
        <input id="promo-titolo" type="text" value="${obj.titolo || ""}" required />
      </label>
      <label>
        Tipo
        <input id="promo-tipo" type="text" value="${obj.tipo || ""}" />
      </label>
      <label>
        Dal
        <input id="promo-dal" type="date" value="${obj.dal}" />
      </label>
      <label>
        Al
        <input id="promo-al" type="date" value="${obj.al}" />
      </label>
      <label>
        Note
        <textarea id="promo-note">${obj.note || ""}</textarea>
      </label>
      <div class="modal-footer">
        <button type="button" class="btn-outline" id="btn-cancel-promo">Annulla</button>
        <button type="submit" class="btn-primary">Salva</button>
      </div>
    </form>
  `;

  document
    .getElementById("btn-cancel-promo")
    .addEventListener("click", chiudiModal);

  document.getElementById("promo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nuovo = {
      id: esistente ? esistente.id : tipo + "-" + Date.now(),
      titolo: document.getElementById("promo-titolo").value.trim(),
      tipo: document.getElementById("promo-tipo").value.trim() || obj.tipo,
      dal: document.getElementById("promo-dal").value || obj.dal,
      al: document.getElementById("promo-al").value || obj.al,
      note: document.getElementById("promo-note").value.trim(),
    };

    if (tipo === "offerta") {
      if (esistente) {
        const idx = offerte.findIndex((o) => o.id === esistente.id);
        if (idx !== -1) offerte[idx] = nuovo;
      } else {
        offerte.push(nuovo);
      }
    } else {
      // giornata: anche per il calendario
      if (esistente) {
        const idx = giornate.findIndex((g) => g.id === esistente.id);
        if (idx !== -1) giornate[idx] = nuovo;
      } else {
        giornate.push(nuovo);
      }
    }

    chiudiModal();
    renderPromozioni();
    renderCalendario();
    renderPanoramica();
  });
}

function eliminaOfferta(id) {
  if (!confirm("Eliminare questa offerta?")) return;
  offerte = offerte.filter((o) => o.id !== id);
  renderPromozioni();
  renderPanoramica();
}

function eliminaGiornata(id) {
  if (!confirm("Eliminare questa giornata?")) return;
  giornate = giornate.filter((g) => g.id !== id);
  renderPromozioni();
  renderCalendario();
  renderPanoramica();
}

// Pulsanti "Aggiungi"
document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tipo = btn.dataset.openModal;
    apriModalPromo(tipo);
  });
});

// ===============================
// MODAL RIEPILOGO PROMO + GIORNATE
// ===============================
const modalRiepilogo = document.getElementById("modal-riepilogo");
const riepilogoClose = document.getElementById("riepilogo-close");
const riepilogoOfferteAttive = document.getElementById("riepilogo-offerte-attive");
const riepilogoGiornateAttive = document.getElementById("riepilogo-giornate-attive");
const riepilogoOfferteScadute = document.getElementById("riepilogo-offerte-scadute");
const riepilogoGiornateScadute = document.getElementById("riepilogo-giornate-scadute");

document
  .getElementById("btn-riepilogo-promozioni")
  .addEventListener("click", () => {
    renderRiepilogo();
    modalRiepilogo.style.display = "flex";
  });

riepilogoClose.addEventListener("click", () => {
  modalRiepilogo.style.display = "none";
});
modalRiepilogo.addEventListener("click", (e) => {
  if (e.target === modalRiepilogo) modalRiepilogo.style.display = "none";
});

function renderRiepilogo() {
  const oggi = getTodayISO();

  const offerteAttive = offerte.filter((o) => !isDateBefore(o.al, oggi));
  const offerteScadute = offerte.filter((o) => isDateBefore(o.al, oggi));
  const giornateAttive = giornate.filter((g) => !isDateBefore(g.al, oggi));
  const giornateScadute = giornate.filter((g) => isDateBefore(g.al, oggi));

  function renderLista(arr, ul, tipo) {
    ul.innerHTML = "";
    if (!arr.length) {
      ul.innerHTML =
        '<li class="riepilogo-item"><span class="riepilogo-item-meta">Nessuna voce.</span></li>';
      return;
    }
    arr.forEach((el) => {
      const li = document.createElement("li");
      li.className = "riepilogo-item";
      li.innerHTML = `
        <div class="riepilogo-item-title">${el.titolo}</div>
        <div class="riepilogo-item-meta">${formatRangeIT(el.dal, el.al)}</div>
        <div class="riepilogo-actions">
          <button class="edit">✏️</button>
          <button class="del">🗑</button>
        </div>
      `;
      li.querySelector(".edit").addEventListener("click", () => {
        modalRiepilogo.style.display = "none";
        apriModalPromo(tipo, el);
      });
      li.querySelector(".del").addEventListener("click", () => {
        if (tipo === "offerta") eliminaOfferta(el.id);
        else eliminaGiornata(el.id);
        renderRiepilogo();
      });
      ul.appendChild(li);
    });
  }

  renderLista(offerteAttive, riepilogoOfferteAttive, "offerta");
  renderLista(offerteScadute, riepilogoOfferteScadute, "offerta");
  renderLista(giornateAttive, riepilogoGiornateAttive, "giornata");
  renderLista(giornateScadute, riepilogoGiornateScadute, "giornata");
}

// ===============================
// MODAL GIORNO AGENDA
// ===============================
const modalGiorno = document.getElementById("modal-giorno");
const modalGiornoTitle = document.getElementById("modal-giorno-title");
const modalGiornoList = document.getElementById("modal-giorno-list");
const modalGiornoClose = document.getElementById("modal-giorno-close");

modalGiornoClose.addEventListener("click", () => {
  modalGiorno.style.display = "none";
});
modalGiorno.addEventListener("click", (e) => {
  if (e.target === modalGiorno) modalGiorno.style.display = "none";
});

function apriModalGiorno(iso) {
  modalGiorno.style.display = "flex";
  modalGiornoTitle.textContent = "Appuntamenti – " + formatLongDateIT(iso);
  modalGiornoList.innerHTML = "";

  const eventiGiornate = giornate.filter((g) => isDateInRange(iso, g.dal, g.al));
  const eventiApp = appuntamenti
    .filter((a) => a.data === iso)
    .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

  if (!eventiGiornate.length && !eventiApp.length) {
    modalGiornoList.innerHTML =
      '<li class="giorno-item">Nessun evento per questo giorno.</li>';
    return;
  }

  eventiGiornate.forEach((g) => {
    const li = document.createElement("li");
    li.className = "giorno-item";
    li.textContent = "GIORNATA – " + g.titolo + " (" + formatRangeIT(g.dal, g.al) + ")";
    modalGiornoList.appendChild(li);
  });

  eventiApp.forEach((a) => {
    const li = document.createElement("li");
    li.className = "giorno-item";
    li.textContent = `${a.oraInizio} – ${a.oraFine} · ${a.nome} (${a.motivo})`;
    modalGiornoList.appendChild(li);
  });
}

// ===============================
// NUOVO APPUNTAMENTO
// ===============================
document
  .getElementById("btn-nuovo-appuntamento")
  .addEventListener("click", () => apriModalAppuntamento());

function apriModalAppuntamento(esistente) {
  modalBackdrop.style.display = "flex";
  modalTitle.textContent = esistente
    ? "Modifica appuntamento"
    : "Nuovo appuntamento";

  const dataDefault = esistente ? esistente.data : selectedDateISO || getTodayISO();

  modalBody.innerHTML = `
    <form id="app-form" class="modal-form">
      <label>
        Data
        <input id="app-data" type="date" value="${dataDefault}" />
      </label>
      <label>
        Ora inizio
        <input id="app-ora-inizio" type="time" value="${
          (esistente && esistente.oraInizio) || "09:00"
        }" />
      </label>
      <label>
        Ora fine
        <input id="app-ora-fine" type="time" value="${
          (esistente && esistente.oraFine) || "10:00"
        }" />
      </label>
      <label>
        Nome e cognome
        <input id="app-nome" type="text" value="${(esistente && esistente.nome) || ""}" />
      </label>
      <label>
        Motivo / servizio
        <input id="app-motivo" type="text" value="${
          (esistente && esistente.motivo) || ""
        }" />
      </label>
      <div class="modal-footer">
        <button type="button" class="btn-outline" id="btn-cancel-app">Annulla</button>
        <button type="submit" class="btn-primary">Salva</button>
      </div>
    </form>
  `;

  document.getElementById("btn-cancel-app").addEventListener("click", chiudiModal);

  document.getElementById("app-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nuovo = {
      id: esistente ? esistente.id : "app-" + Date.now(),
      data: document.getElementById("app-data").value || dataDefault,
      oraInizio: document.getElementById("app-ora-inizio").value || "09:00",
      oraFine: document.getElementById("app-ora-fine").value || "10:00",
      nome: document.getElementById("app-nome").value.trim(),
      motivo: document.getElementById("app-motivo").value.trim(),
    };

    if (esistente) {
      const idx = appuntamenti.findIndex((a) => a.id === esistente.id);
      if (idx !== -1) appuntamenti[idx] = nuovo;
    } else {
      appuntamenti.push(nuovo);
    }

    chiudiModal();
    renderCalendario();
    renderPanoramica();
  });
}

// ===============================
// PANORAMICA AUTO-RITORNO (20s)
// ===============================
let lastInteractionTs = Date.now();

document.addEventListener("click", () => {
  lastInteractionTs = Date.now();
});

setInterval(() => {
  const elapsed = Date.now() - lastInteractionTs;
  if (elapsed > 20000) {
    // potremmo in futuro cambiare contenuto Q2, per ora solo contiamo
    // (se vorrai potremo far apparire una vista riassuntiva più complessa)
  }
}, 5000);

// ===============================
// RENDER TOTALE
// ===============================
function renderTutto() {
  renderPanoramica();
  renderPromozioni();
  renderCalendario();
}

// Avvio automatico in modalità login schermata
// (nothing else)
