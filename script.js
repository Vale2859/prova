/* ============================================================
   FARMACIA MONTESANO – PORTALE PROFESSIONALE
   SCRIPT.JS – LOGICA FRONTEND (LOCALSTORAGE DEMO)
   ------------------------------------------------------------
   Gestisce:
   - Navigazione view (landing, auth, dashboard ruoli)
   - Login / registrazione utenti
   - Role selector (Dipendente / Cliente)
   - Topbar utente + logout
   - Assenti, Arrivi, Scadenze, Scorte, Cambio cassa, Archivio
   - Comunicazioni, Procedure (demo)
   - Toast, loading bar, overlay base
   ------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------------------------------------
     UTILITY BASE
     ---------------------------------------------------------- */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const LS_KEYS = {
    USERS: "fm_users",
    CURRENT_USER: "fm_current_user",
    ASSENTI: "fm_assenti",
    ARRIVI: "fm_arrivi",
    SCADENZE: "fm_scadenze",
    SCORTE: "fm_scorte",
    CASSA: "fm_cassa",
    ARCHIVIO: "fm_archivio",
    COMUNICAZIONI: "fm_comunicazioni",
    PROCEDURE: "fm_procedure",
  };

  const ROLE_LABELS = {
    titolare: "Titolare",
    farmacia: "Farmacia",
    dipendente: "Dipendente",
    cliente: "Cliente",
  };

  /* ----------------------------------------------------------
     TOAST / LOADING BAR
     ---------------------------------------------------------- */

  function ensureToastContainer() {
    let c = qs(".toast-container");
    if (!c) {
      c = document.createElement("div");
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(type = "info", message = "") {
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const iconSpan = document.createElement("span");
    iconSpan.className = "toast-icon";
    iconSpan.textContent =
      type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️";

    const textDiv = document.createElement("div");
    textDiv.className = "toast-text";
    textDiv.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.textContent = "Chiudi";
    closeBtn.addEventListener("click", () => {
      toast.remove();
    });

    toast.appendChild(iconSpan);
    toast.appendChild(textDiv);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4500);
  }

  // Loading bar
  let loadingBar = qs(".loading-bar");
  if (!loadingBar) {
    loadingBar = document.createElement("div");
    loadingBar.className = "loading-bar";
    document.body.appendChild(loadingBar);
  }

  function startLoading() {
    loadingBar.classList.add("visible");
    loadingBar.classList.remove("complete");
  }

  function endLoading() {
    loadingBar.classList.add("complete");
    setTimeout(() => {
      loadingBar.classList.remove("visible");
      loadingBar.classList.remove("complete");
    }, 220);
  }

  /* ----------------------------------------------------------
     LOCALSTORAGE HELPERS
     ---------------------------------------------------------- */

  function lsGet(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      if (!val) return fallback;
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("localStorage set error", err);
      showToast("error", "Errore nel salvataggio locale.");
    }
  }

  /* ----------------------------------------------------------
     VIEW MANAGER
     ---------------------------------------------------------- */

  const views = qsa(".view");
  const appPageTitleEl = qs("#appPageTitle");

  function showView(viewId, pageTitle) {
    views.forEach((v) => v.classList.remove("active"));
    const target = qs(`#${viewId}`);
    if (target) {
      target.classList.add("active");
    }
    if (appPageTitleEl && pageTitle) {
      appPageTitleEl.textContent = pageTitle;
    }
  }

  /* ----------------------------------------------------------
     TOPBAR USER CHIP + LOGOUT
     ---------------------------------------------------------- */

  const userChipNameEl = qs("#userChipName");
  const userChipRoleEl = qs("#userChipRole");
  const userChipAvatarEl = qs("#userChipAvatar");
  const btnLogout = qs("#btnLogout");

  function updateTopbarUser(user) {
    if (!user) {
      if (userChipNameEl) userChipNameEl.textContent = "";
      if (userChipRoleEl) userChipRoleEl.textContent = "";
      if (userChipAvatarEl) userChipAvatarEl.textContent = "";
      return;
    }
    const initials = (user.nome?.[0] || "?") + (user.cognome?.[0] || "");
    if (userChipNameEl)
      userChipNameEl.textContent = `${user.nome || ""} ${user.cognome || ""}`;
    if (userChipRoleEl)
      userChipRoleEl.textContent = ROLE_LABELS[user.ruolo] || "Utente";
    if (userChipAvatarEl) userChipAvatarEl.textContent = initials.toUpperCase();
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      lsSet(LS_KEYS.CURRENT_USER, null);
      showToast("info", "Disconnessione effettuata.");
      showView("view-landing", "Portale Professionale");
      updateTopbarUser(null);
    });
  }

  /* ----------------------------------------------------------
     AUTH: TABS LOGIN / REGISTRAZIONE
     ---------------------------------------------------------- */

  const authTabButtons = qsa(".auth-tab-btn");
  const authForms = qsa(".auth-form");

  function setActiveAuthTab(tabName) {
    authTabButtons.forEach((btn) => {
      const target = btn.getAttribute("data-auth-tab");
      btn.classList.toggle("active", target === tabName);
    });
    authForms.forEach((form) => {
      const target = form.getAttribute("data-auth-tab");
      form.classList.toggle("active", target === tabName);
    });
  }

  authTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-auth-tab");
      if (!tab) return;
      setActiveAuthTab(tab);
    });
  });

  /* Pulsanti landing → auth */
  const btnVaiAlLogin = qs("#btnVaiAlLogin");
  const btnVaiAllaRegistrazione = qs("#btnVaiAllaRegistrazione");

  if (btnVaiAlLogin) {
    btnVaiAlLogin.addEventListener("click", () => {
      showView("view-auth", "Accedi al Portale");
      setActiveAuthTab("login");
    });
  }
  if (btnVaiAllaRegistrazione) {
    btnVaiAllaRegistrazione.addEventListener("click", () => {
      showView("view-auth", "Registrati al Portale");
      setActiveAuthTab("register");
    });
  }

  /* ----------------------------------------------------------
     AUTH: ROLE SELECTOR (DIPENDENTE / CLIENTE) IN REGISTRAZIONE
     ---------------------------------------------------------- */

  const roleSelectorBtns = qsa(".role-pill-btn");
  const regRuoloHiddenInput = qs("#regRuoloHidden");

  function updateRoleSelector(role) {
    roleSelectorBtns.forEach((btn) => {
      const r = btn.getAttribute("data-role");
      btn.classList.toggle("active", r === role);
    });
    if (regRuoloHiddenInput) regRuoloHiddenInput.value = role;
    const summary = qs("#roleSummary");
    if (summary) {
      summary.textContent =
        role === "dipendente"
          ? "Accesso dedicato al personale della Farmacia Montesano."
          : "Accesso dedicato ai clienti per promozioni, eventi e turni.";
    }
  }

  roleSelectorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.getAttribute("data-role");
      if (!role) return;
      updateRoleSelector(role);
    });
  });

  // Imposto default
  if (roleSelectorBtns.length && regRuoloHiddenInput && !regRuoloHiddenInput.value) {
    updateRoleSelector("dipendente");
  }

  /* ----------------------------------------------------------
     AUTH: REGISTRAZIONE
     ---------------------------------------------------------- */

  const registerForm = qs("#registerForm");
  const registerMessage = qs("#registerMessage");

  function setFormMessage(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className = "form-message " + type;
  }

  function getUsers() {
    return lsGet(LS_KEYS.USERS, []);
  }

  function saveUsers(users) {
    lsSet(LS_KEYS.USERS, users);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const nome = (formData.get("nome") || "").toString().trim();
      const cognome = (formData.get("cognome") || "").toString().trim();
      const email = (formData.get("email") || "").toString().trim().toLowerCase();
      const password = (formData.get("password") || "").toString().trim();
      const ruolo =
        (formData.get("ruolo") || regRuoloHiddenInput?.value || "dipendente")
          .toString()
          .trim();

      if (!nome || !cognome || !email || !password) {
        setFormMessage(registerMessage, "error", "Compila tutti i campi obbligatori.");
        return;
      }

      const users = getUsers();
      if (users.some((u) => u.email === email)) {
        setFormMessage(
          registerMessage,
          "error",
          "Esiste già un utente registrato con questa email."
        );
        return;
      }

      const newUser = {
        id: Date.now(),
        nome,
        cognome,
        email,
        password,
        ruolo, // titolare / farmacia / dipendente / cliente
      };

      users.push(newUser);
      saveUsers(users);
      setFormMessage(
        registerMessage,
        "success",
        "Registrazione completata! Ora puoi effettuare il login."
      );
      showToast("success", "Utente registrato correttamente.");
      registerForm.reset();
      // reset ruolo
      updateRoleSelector("dipendente");
    });
  }

  /* ----------------------------------------------------------
     AUTH: LOGIN
     ---------------------------------------------------------- */

  const loginForm = qs("#loginForm");
  const loginMessage = qs("#loginMessage");

  function setCurrentUser(user) {
    lsSet(LS_KEYS.CURRENT_USER, user);
  }

  function getCurrentUser() {
    return lsGet(LS_KEYS.CURRENT_USER, null);
  }

  function goToDashboardForRole(ruolo) {
    switch (ruolo) {
      case "titolare":
        showView("view-dashboard-titolare", "Dashboard Titolare");
        break;
      case "farmacia":
        showView("view-dashboard-farmacia", "Dashboard Farmacia");
        break;
      case "dipendente":
        showView("view-dashboard-dipendente", "Dashboard Dipendente");
        break;
      case "cliente":
        showView("view-dashboard-cliente", "Area Clienti");
        break;
      default:
        showView("view-dashboard-dipendente", "Dashboard");
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const email = (formData.get("email") || "").toString().trim().toLowerCase();
      const password = (formData.get("password") || "").toString().trim();

      if (!email || !password) {
        setFormMessage(loginMessage, "error", "Inserisci email e password.");
        return;
      }

      const users = getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        setFormMessage(
          loginMessage,
          "error",
          "Credenziali non valide. Controlla email e password."
        );
        showToast("error", "Accesso negato.");
        return;
      }

      setCurrentUser(user);
      updateTopbarUser(user);
      setFormMessage(loginMessage, "success", "Accesso effettuato.");
      showToast("success", `Benvenuto, ${user.nome}!`);
      goToDashboardForRole(user.ruolo);
    });
  }

  /* ----------------------------------------------------------
     RIPRISTINA SESSIONE SE UTENTE GIÀ LOGGATO
     ---------------------------------------------------------- */

  (function restoreSession() {
    const cu = getCurrentUser();
    if (cu) {
      updateTopbarUser(cu);
      goToDashboardForRole(cu.ruolo);
    } else {
      showView("view-landing", "Portale Professionale");
    }
  })();

  /* ----------------------------------------------------------
     ASSENTI OGGI
     ---------------------------------------------------------- */

  const assentiListEl = qs("#assentiList");
  const assentiFormEl = qs("#assentiForm");
  const assentiTotaliEl = qs("#assentiTotali");
  const assentiOggiEl = qs("#assentiOggi");
  const assentiFerieEl = qs("#assentiFerie");
  const assentiFormFeedbackEl = qs("#assentiFormFeedback");

  function getAssenti() {
    return lsGet(LS_KEYS.ASSENTI, []);
  }

  function saveAssenti(list) {
    lsSet(LS_KEYS.ASSENTI, list);
  }

  function renderAssenti() {
    if (!assentiListEl) return;
    const assenti = getAssenti();

    // stats
    if (assentiTotaliEl) assentiTotaliEl.textContent = assenti.length.toString();
    if (assentiOggiEl)
      assentiOggiEl.textContent = assenti.filter((a) => a.data === todayStr()).length.toString();
    if (assentiFerieEl)
      assentiFerieEl.textContent = assenti.filter((a) => a.tipo === "ferie").length.toString();

    assentiListEl.innerHTML = "";
    if (!assenti.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "Nessuna assenza registrata.";
      assentiListEl.appendChild(empty);
      return;
    }

    assenti
      .slice()
      .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
      .forEach((item) => {
        const row = document.createElement("div");
        row.className = "assente-item";

        const main = document.createElement("div");
        main.className = "assente-main";

        const nomeEl = document.createElement("div");
        nomeEl.className = "assente-nome";
        nomeEl.textContent = item.nome;

        const meta = document.createElement("div");
        meta.className = "assente-meta";
        meta.textContent = `${item.data || ""} · ${item.motivo || ""}`;

        main.appendChild(nomeEl);
        main.appendChild(meta);

        const tag = document.createElement("span");
        tag.className = "assente-tag " + (item.tipo || "");
        tag.textContent = (item.tipo || "").toUpperCase();

        row.appendChild(main);
        row.appendChild(tag);
        assentiListEl.appendChild(row);
      });
  }

  function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (assentiFormEl) {
    assentiFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(assentiFormEl);
      const nome = (fd.get("nome") || "").toString().trim();
      const data = (fd.get("data") || "").toString().trim() || todayStr();
      const tipo = (fd.get("tipo") || "ferie").toString().trim();
      const motivo = (fd.get("motivo") || "").toString().trim();

      if (!nome) {
        if (assentiFormFeedbackEl) {
          assentiFormFeedbackEl.textContent = "Inserisci il nome.";
        }
        return;
      }

      const list = getAssenti();
      list.push({
        id: Date.now(),
        nome,
        data,
        tipo,
        motivo,
      });
      saveAssenti(list);
      assentiFormEl.reset();
      if (assentiFormFeedbackEl) {
        assentiFormFeedbackEl.textContent = "Assenza registrata.";
      }
      showToast("success", "Assenza aggiunta.");
      renderAssenti();
    });
  }

  renderAssenti();

  /* ----------------------------------------------------------
     ARRIVI
     ---------------------------------------------------------- */

  const arriviFormEl = qs("#arriviForm");
  const arriviTableBody = qs("#arriviTableBody");
  const arriviFormFeedbackEl = qs("#arriviFormFeedback");

  function getArrivi() {
    return lsGet(LS_KEYS.ARRIVI, []);
  }
  function saveArrivi(arr) {
    lsSet(LS_KEYS.ARRIVI, arr);
  }

  function renderArrivi() {
    if (!arriviTableBody) return;
    const arr = getArrivi();
    arriviTableBody.innerHTML = "";
    if (!arr.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "table-empty";
      td.textContent = "Nessun arrivo registrato.";
      tr.appendChild(td);
      arriviTableBody.appendChild(tr);
      return;
    }

    arr
      .slice()
      .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
      .forEach((a) => {
        const tr = document.createElement("tr");
        const tdData = document.createElement("td");
        const tdForn = document.createElement("td");
        const tdDescr = document.createElement("td");
        const tdUrg = document.createElement("td");

        tdData.textContent = a.data || "";
        tdForn.innerHTML = `<span class="arrivo-fornitore">${a.fornitore || ""}</span>`;
        tdDescr.textContent = a.descrizione || "";

        if (a.urgente) {
          const badge = document.createElement("span");
          badge.className = "arrivo-badge-urgente";
          badge.textContent = "Urgente";
          tdUrg.appendChild(badge);
        } else {
          tdUrg.textContent = "-";
        }

        tr.appendChild(tdData);
        tr.appendChild(tdForn);
        tr.appendChild(tdDescr);
        tr.appendChild(tdUrg);
        arriviTableBody.appendChild(tr);
      });
  }

  if (arriviFormEl) {
    arriviFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(arriviFormEl);
      const fornitore = (fd.get("fornitore") || "").toString().trim();
      const data = (fd.get("data") || "").toString().trim() || todayStr();
      const descrizione = (fd.get("descrizione") || "").toString().trim();
      const urgente = fd.get("urgente") === "on";

      if (!fornitore) {
        if (arriviFormFeedbackEl) {
          arriviFormFeedbackEl.textContent = "Inserisci il fornitore.";
        }
        return;
      }

      const arr = getArrivi();
      arr.push({
        id: Date.now(),
        fornitore,
        data,
        descrizione,
        urgente,
      });
      saveArrivi(arr);
      arriviFormEl.reset();
      if (arriviFormFeedbackEl) {
        arriviFormFeedbackEl.textContent = "Arrivo registrato.";
      }
      showToast("success", "Nuovo arrivo salvato.");
      renderArrivi();
    });
  }

  renderArrivi();

  /* ----------------------------------------------------------
     SCADENZE PRODOTTI
     ---------------------------------------------------------- */

  const scadenzeFormEl = qs("#scadenzeForm");
  const scadenzeBodyEl = qs("#scadenzeTableBody");
  const scadenzeFormFeedbackEl = qs("#scadenzeFormFeedback");

  function getScadenze() {
    return lsGet(LS_KEYS.SCADENZE, []);
  }
  function saveScadenze(list) {
    lsSet(LS_KEYS.SCADENZE, list);
  }

  function diffDays(fromIso) {
    if (!fromIso) return Infinity;
    const today = new Date(todayStr());
    const target = new Date(fromIso);
    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  function renderScadenze() {
    if (!scadenzeBodyEl) return;
    const list = getScadenze();
    scadenzeBodyEl.innerHTML = "";

    if (!list.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "table-empty";
      td.textContent = "Nessuna scadenza registrata.";
      tr.appendChild(td);
      scadenzeBodyEl.appendChild(tr);
      return;
    }

    list
      .slice()
      .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
      .forEach((s) => {
        const tr = document.createElement("tr");
        const giorni = diffDays(s.data);
        if (giorni <= 45) {
          tr.classList.add("scadenza-critical");
        }

        const tdData = document.createElement("td");
        const tdProd = document.createElement("td");
        const tdQt = document.createElement("td");
        const tdGg = document.createElement("td");

        tdData.textContent = s.data || "";
        tdProd.textContent = s.prodotto || "";
        tdQt.textContent = s.quantita || "";

        if (giorni <= 45) {
          const pill = document.createElement("span");
          pill.className = "scadenza-pill-warning";
          pill.textContent = `${giorni} gg`;
          tdGg.appendChild(pill);
        } else {
          tdGg.textContent = `${giorni} gg`;
        }

        tr.appendChild(tdData);
        tr.appendChild(tdProd);
        tr.appendChild(tdQt);
        tr.appendChild(tdGg);
        scadenzeBodyEl.appendChild(tr);
      });
  }

  if (scadenzeFormEl) {
    scadenzeFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(scadenzeFormEl);
      const prodotto = (fd.get("prodotto") || "").toString().trim();
      const data = (fd.get("data") || "").toString().trim();
      const quantita = (fd.get("quantita") || "").toString().trim();

      if (!prodotto || !data) {
        if (scadenzeFormFeedbackEl) {
          scadenzeFormFeedbackEl.textContent =
            "Inserisci prodotto e data di scadenza.";
        }
        return;
      }

      const list = getScadenze();
      list.push({
        id: Date.now(),
        prodotto,
        data,
        quantita,
      });
      saveScadenze(list);
      scadenzeFormEl.reset();
      if (scadenzeFormFeedbackEl) {
        scadenzeFormFeedbackEl.textContent = "Scadenza registrata.";
      }
      showToast("success", "Nuova scadenza aggiunta.");
      renderScadenze();
    });
  }

  renderScadenze();

  /* ----------------------------------------------------------
     SCORTE INTERNE
     ---------------------------------------------------------- */

  const scorteFormEl = qs("#scorteForm");
  const scorteListEl = qs("#scorteList");
  const scorteFormFeedbackEl = qs("#scorteFormFeedback");

  function getScorte() {
    return lsGet(LS_KEYS.SCORTE, []);
  }
  function saveScorte(list) {
    lsSet(LS_KEYS.SCORTE, list);
  }

  function renderScorte() {
    if (!scorteListEl) return;
    const list = getScorte();
    scorteListEl.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "Nessuna scorta registrata.";
      scorteListEl.appendChild(empty);
      return;
    }

    list.forEach((s) => {
      const item = document.createElement("div");
      item.className = "scorta-item";

      const main = document.createElement("div");
      main.className = "scorta-main";

      const nomeEl = document.createElement("div");
      nomeEl.className = "scorta-nome";
      nomeEl.textContent = s.nome || "";

      const meta = document.createElement("div");
      meta.className = "scorta-meta";
      meta.textContent = s.note || "";

      main.appendChild(nomeEl);
      main.appendChild(meta);

      const side = document.createElement("div");
      side.className = "scorta-actions";

      const levelPill = document.createElement("span");
      levelPill.className =
        "scorta-level-pill " +
        (s.livello === "ok"
          ? "scorta-ok"
          : s.livello === "bassa"
          ? "scorta-bassa"
          : "scorta-critica");
      levelPill.textContent =
        s.livello === "ok"
          ? "OK"
          : s.livello === "bassa"
          ? "Bassa"
          : "Critica";

      const btnSegnala = document.createElement("button");
      btnSegnala.type = "button";
      btnSegnala.className = "btn-secondary small";
      btnSegnala.textContent = "Segnala bassa";
      btnSegnala.addEventListener("click", () => {
        if (s.livello !== "critica") {
          s.livello = "bassa";
          saveScorte(list);
          renderScorte();
          showToast("info", `Scorta "${s.nome}" segnalata come bassa.`);
        }
      });

      side.appendChild(levelPill);
      side.appendChild(btnSegnala);

      item.appendChild(main);
      item.appendChild(side);

      scorteListEl.appendChild(item);
    });
  }

  if (scorteFormEl) {
    scorteFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(scorteFormEl);
      const nome = (fd.get("nome") || "").toString().trim();
      const livello = (fd.get("livello") || "ok").toString().trim();
      const note = (fd.get("note") || "").toString().trim();

      if (!nome) {
        if (scorteFormFeedbackEl) {
          scorteFormFeedbackEl.textContent = "Inserisci il nome della scorta.";
        }
        return;
      }

      const list = getScorte();
      list.push({
        id: Date.now(),
        nome,
        livello,
        note,
      });
      saveScorte(list);
      scorteFormEl.reset();
      if (scorteFormFeedbackEl) {
        scorteFormFeedbackEl.textContent = "Scorta salvata.";
      }
      showToast("success", "Nuova scorta aggiunta.");
      renderScorte();
    });
  }

  renderScorte();

  /* ----------------------------------------------------------
     CAMBIO CASSA
     ---------------------------------------------------------- */

  const cassaFormEl = qs("#cassaForm");
  const cassaTableBody = qs("#cassaTableBody");
  const cassaFormFeedbackEl = qs("#cassaFormFeedback");

  function getCassa() {
    return lsGet(LS_KEYS.CASSA, []);
  }
  function saveCassa(list) {
    lsSet(LS_KEYS.CASSA, list);
  }

  function renderCassa() {
    if (!cassaTableBody) return;
    const list = getCassa();
    cassaTableBody.innerHTML = "";

    if (!list.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "table-empty";
      td.textContent = "Nessun cambio cassa registrato.";
      tr.appendChild(td);
      cassaTableBody.appendChild(tr);
      return;
    }

    list
      .slice()
      .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
      .forEach((c) => {
        const tr = document.createElement("tr");
        const tdData = document.createElement("td");
        const tdOra = document.createElement("td");
        const tdTurno = document.createElement("td");
        const tdOperatore = document.createElement("td");
        const tdNote = document.createElement("td");

        tdData.textContent = c.data || "";
        tdOra.textContent = c.ora || "";

        const pill = document.createElement("span");
        pill.className = "cassa-turno-pill";
        pill.textContent = c.turno || "";
        tdTurno.appendChild(pill);

        tdOperatore.textContent = c.operatore || "";
        tdNote.textContent = c.note || "";

        tr.appendChild(tdData);
        tr.appendChild(tdOra);
        tr.appendChild(tdTurno);
        tr.appendChild(tdOperatore);
        tr.appendChild(tdNote);
        cassaTableBody.appendChild(tr);
      });
  }

  if (cassaFormEl) {
    cassaFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(cassaFormEl);
      const data = (fd.get("data") || "").toString().trim() || todayStr();
      const ora = (fd.get("ora") || "").toString().trim();
      const turno = (fd.get("turno") || "").toString().trim();
      const operatore = (fd.get("operatore") || "").toString().trim();
      const note = (fd.get("note") || "").toString().trim();

      if (!operatore || !turno) {
        if (cassaFormFeedbackEl) {
          cassaFormFeedbackEl.textContent =
            "Inserisci almeno operatore e turno.";
        }
        return;
      }

      const list = getCassa();
      list.push({
        id: Date.now(),
        data,
        ora,
        turno,
        operatore,
        note,
      });
      saveCassa(list);
      cassaFormEl.reset();
      if (cassaFormFeedbackEl) {
        cassaFormFeedbackEl.textContent = "Cambio cassa registrato.";
      }
      showToast("success", "Cambio cassa salvato.");
      renderCassa();
    });
  }

  renderCassa();

  /* ----------------------------------------------------------
     ARCHIVIO FILE
     ---------------------------------------------------------- */

  const archivioFormEl = qs("#archivioForm");
  const archivioListEl = qs("#archivioList");
  const archivioFormFeedbackEl = qs("#archivioFormFeedback");

  function getArchivio() {
    return lsGet(LS_KEYS.ARCHIVIO, []);
  }
  function saveArchivio(list) {
    lsSet(LS_KEYS.ARCHIVIO, list);
  }

  function renderArchivio() {
    if (!archivioListEl) return;
    const list = getArchivio();
    archivioListEl.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "Nessun file in archivio.";
      archivioListEl.appendChild(empty);
      return;
    }

    list.forEach((f) => {
      const item = document.createElement("div");
      item.className = "archivio-item";

      const icon = document.createElement("div");
      icon.className = "archivio-icon";
      icon.textContent = f.emoji || "📄";

      const main = document.createElement("div");
      main.className = "archivio-main";

      const fn = document.createElement("div");
      fn.className = "archivio-filename";
      fn.textContent = f.nome || "";

      const meta = document.createElement("div");
      meta.className = "archivio-meta";
      meta.textContent = `${f.categoria || ""} · ${f.data || ""}`;

      main.appendChild(fn);
      main.appendChild(meta);

      if (f.note || f.link) {
        const note = document.createElement("div");
        note.className = "archivio-note";
        if (f.link) {
          const a = document.createElement("a");
          a.href = f.link;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = f.note || "Apri";
          note.appendChild(a);
        } else {
          note.textContent = f.note;
        }
        main.appendChild(note);
      }

      const cat = document.createElement("div");
      cat.className = "archivio-category-pill";
      cat.textContent = f.categoria || "Altro";

      item.appendChild(icon);
      item.appendChild(main);
      item.appendChild(cat);

      archivioListEl.appendChild(item);
    });
  }

  if (archivioFormEl) {
    archivioFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(archivioFormEl);
      const nome = (fd.get("nome") || "").toString().trim();
      const categoria = (fd.get("categoria") || "").toString().trim() || "Generale";
      const note = (fd.get("note") || "").toString().trim();
      const link = (fd.get("link") || "").toString().trim();
      const emoji = (fd.get("emoji") || "").toString().trim() || "📄";

      if (!nome) {
        if (archivioFormFeedbackEl) {
          archivioFormFeedbackEl.textContent = "Inserisci il nome del file.";
        }
        return;
      }

      const list = getArchivio();
      list.push({
        id: Date.now(),
        nome,
        categoria,
        note,
        link,
        emoji,
        data: todayStr(),
      });
      saveArchivio(list);
      archivioFormEl.reset();
      if (archivioFormFeedbackEl) {
        archivioFormFeedbackEl.textContent = "File aggiunto all'archivio.";
      }
      showToast("success", "File salvato in archivio.");
      renderArchivio();
    });
  }

  renderArchivio();

  /* ----------------------------------------------------------
     COMUNICAZIONI (DEMO)
     ---------------------------------------------------------- */

  const comFormEl = qs("#comunicazioniForm");
  const comListEl = qs("#comunicazioniList");
  const comFilterBtns = qsa(".btn-com-filter");
  const comCounterEl = qs("#comCounter");
  const comFormFeedbackEl = qs("#comFormFeedback");

  function getComunicazioni() {
    return lsGet(LS_KEYS.COMUNICAZIONI, []);
  }
  function saveComunicazioni(list) {
    lsSet(LS_KEYS.COMUNICAZIONI, list);
  }

  let currentComFilter = "tutte";

  function renderComunicazioni() {
    if (!comListEl) return;
    let list = getComunicazioni();

    if (currentComFilter !== "tutte") {
      list = list.filter((c) => c.categoria === currentComFilter);
    }

    comListEl.innerHTML = "";

    if (comCounterEl) {
      comCounterEl.textContent = `${getComunicazioni().length} totali`;
    }

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "Nessuna comunicazione.";
      comListEl.appendChild(empty);
      return;
    }

    list
      .slice()
      .sort((a, b) => (b.dataIso || "").localeCompare(a.dataIso || ""))
      .forEach((c) => {
        const card = document.createElement("div");
        card.className = "com-card";

        const pill = document.createElement("div");
        pill.className = `com-pill ${c.categoria}`;
        pill.textContent = (c.categoria || "info").toUpperCase();

        const title = document.createElement("div");
        title.className = "com-title";
        title.textContent = c.titolo || "";

        const meta = document.createElement("div");
        meta.className = "com-meta";
        meta.textContent = `${c.autore || ""} · ${c.dataVis || ""}`;

        const text = document.createElement("div");
        text.className = "com-text";
        text.textContent = c.testo || "";

        if (!c.letta) {
          const badge = document.createElement("div");
          badge.className = "com-badge-unread";
          card.appendChild(badge);
        }

        card.appendChild(pill);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(text);
        comListEl.appendChild(card);
      });
  }

  comFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-cat") || "tutte";
      currentComFilter = cat;
      comFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderComunicazioni();
    });
  });

  if (comFormEl) {
    comFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(comFormEl);
      const titolo = (fd.get("titolo") || "").toString().trim();
      const testo = (fd.get("testo") || "").toString().trim();
      const categoria = (fd.get("categoria") || "informativa").toString().trim();

      if (!titolo || !testo) {
        if (comFormFeedbackEl) {
          comFormFeedbackEl.textContent = "Inserisci titolo e testo.";
        }
        return;
      }

      const cu = getCurrentUser();
      const fullList = getComunicazioni();
      const nowIso = new Date().toISOString();
      const dataVis = new Date().toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      fullList.push({
        id: Date.now(),
        titolo,
        testo,
        categoria,
        autore: cu ? `${cu.nome} ${cu.cognome}` : "Anonimo",
        dataIso: nowIso,
        dataVis,
        letta: false,
      });
      saveComunicazioni(fullList);
      comFormEl.reset();
      if (comFormFeedbackEl) {
        comFormFeedbackEl.textContent = "Comunicazione inviata.";
      }
      showToast("success", "Comunicazione salvata.");
      renderComunicazioni();
    });
  }

  renderComunicazioni();

  /* ----------------------------------------------------------
     PROCEDURE (DEMO)
     ---------------------------------------------------------- */

  const procedureListEl = qs("#procedureList");
  const procedureDetailEl = qs("#procedureDetail");
  const procedureSearchInput = qs("#procedureSearch");
  const procedureFilterBtns = qsa(".btn-procedure-filter");

  function getProcedure() {
    return lsGet(LS_KEYS.PROCEDURE, []);
  }
  function saveProcedure(list) {
    lsSet(LS_KEYS.PROCEDURE, list);
  }

  // Se non ci sono procedure, aggiungo qualche demo
  (function seedProcedureIfEmpty() {
    const existing = getProcedure();
    if (existing.length) return;
    const base = [
      {
        id: 1,
        titolo: "Gestione temperature frigo",
        reparto: "magazzino",
        descrizione:
          "Controllo e registrazione delle temperature di frigoriferi e freezer.",
        testo:
          "1. Verificare le temperature due volte al giorno.\n2. Registrare su apposito registro.\n3. In caso di anomalia avvisare il titolare.",
      },
      {
        id: 2,
        titolo: "Consegna farmaci a domicilio",
        reparto: "servizi",
        descrizione: "Procedura standard per consegna a domicilio.",
        testo:
          "1. Compilare modulo con dati paziente.\n2. Preparare confezioni in busta sigillata.\n3. Registrare consegna e firma ricevuta.",
      },
    ];
    saveProcedure(base);
  })();

  let currentProcedureFilter = "tutti";
  let currentProcedureSearch = "";

  function renderProcedureList() {
    if (!procedureListEl) return;
    const all = getProcedure();
    let list = all;

    if (currentProcedureFilter !== "tutti") {
      list = list.filter((p) => p.reparto === currentProcedureFilter);
    }

    if (currentProcedureSearch) {
      const term = currentProcedureSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.titolo.toLowerCase().includes(term) ||
          p.descrizione.toLowerCase().includes(term)
      );
    }

    procedureListEl.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "Nessuna procedura trovata.";
      procedureListEl.appendChild(empty);
      if (procedureDetailEl) {
        procedureDetailEl.innerHTML =
          '<div class="procedure-empty">Seleziona una procedura sulla sinistra.</div>';
      }
      return;
    }

    list.forEach((p) => {
      const item = document.createElement("div");
      item.className = "procedure-item";

      const main = document.createElement("div");
      main.className = "procedure-item-main";

      const title = document.createElement("div");
      title.className = "procedure-item-title";
      title.textContent = p.titolo;

      const meta = document.createElement("div");
      meta.className = "procedure-item-meta";
      meta.textContent = p.descrizione || "";

      main.appendChild(title);
      main.appendChild(meta);

      const tag = document.createElement("span");
      tag.className = "procedure-tag";
      tag.textContent = "Apri";

      item.appendChild(main);
      item.appendChild(tag);

      item.addEventListener("click", () => {
        renderProcedureDetail(p.id);
      });

      procedureListEl.appendChild(item);
    });

    // Mostro dettaglio della prima se non c'è selezione
    if (list.length && procedureDetailEl) {
      renderProcedureDetail(list[0].id);
    }
  }

  function renderProcedureDetail(id) {
    if (!procedureDetailEl) return;
    const all = getProcedure();
    const p = all.find((x) => x.id === id);
    if (!p) {
      procedureDetailEl.innerHTML =
        '<div class="procedure-empty">Seleziona una procedura sulla sinistra.</div>';
      return;
    }

    const html = `
      <h3>${p.titolo}</h3>
      <p class="text-soft mb-4">${p.descrizione || ""}</p>
      <p>${(p.testo || "").replace(/\n/g, "<br>")}</p>
    `;
    procedureDetailEl.innerHTML = html;
  }

  procedureFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const rep = btn.getAttribute("data-reparto") || "tutti";
      currentProcedureFilter = rep;
      procedureFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProcedureList();
    });
  });

  if (procedureSearchInput) {
    procedureSearchInput.addEventListener("input", () => {
      currentProcedureSearch = procedureSearchInput.value.trim();
      renderProcedureList();
    });
  }

  renderProcedureList();

  /* ----------------------------------------------------------
     OVERLAY GENERICO (SE TI SERVIRÀ IN FUTURO)
     ---------------------------------------------------------- */

  const overlayEl = qs("#genericOverlay");
  const overlayCloseBtns = qsa(".overlay-close-btn");

  function openOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove("hidden");
  }

  function closeOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.add("hidden");
  }

  overlayCloseBtns.forEach((btn) => {
    btn.addEventListener("click", closeOverlay);
  });

  // Espongo alcune funzioni globalmente se vuoi usarle dall'HTML
  window.FMPortal = {
    showToast,
    startLoading,
    endLoading,
    openOverlay,
    closeOverlay,
    goToDashboardForRole,
  };
});
