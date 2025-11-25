// ======================================================
// PORTALE COMPLETO FARMACIA MONTESANO – SCRIPT COMPLETO
// Versione: 3.0 (con Admin secreto + Archivio + Pannello Titolare)
// ======================================================

// ======================================================
// CONTROLLO VERSIONE (per aggiornamenti automatici)
// ======================================================
const APP_VERSION = "3.0";

if (!localStorage.getItem("app_version")) {
    localStorage.setItem("app_version", APP_VERSION);
} else {
    const saved = localStorage.getItem("app_version");
    if (saved !== APP_VERSION) {
        // se un giorno vuoi notificare aggiornamento:
        console.log("Nuova versione disponibile:", APP_VERSION);
    }
}

// ======================================================
// DATI DI BASE (demo) – IN FUTURO ANDRANNO SU SERVER
// ======================================================

// TABELLA TURNI
const turniFarmacie = [
  {
    data: "2025-12-17",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 335921",
    note: "Turno completo",
    tipoRange: "oggi",
    mese: 12
  },
  {
    data: "2025-12-18",
    orario: "08:00 – 20:00",
    principale: "Farmacia Centrale",
    appoggio: "Farmacia Montesano",
    telefono: "0835 111111",
    note: "Diurno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-19",
    orario: "20:00 – 08:00",
    principale: "Farmacia Madonna delle Grazie",
    appoggio: "Farmacia Montesano",
    telefono: "0835 222222",
    note: "Notturno",
    tipoRange: "settimana",
    mese: 12
  },
  {
    data: "2025-12-24",
    orario: "00:00 – 24:00",
    principale: "Farmacia Montesano",
    appoggio: "Farmacia Centrale",
    telefono: "0835 000000",
    note: "Vigilia di Natale",
    tipoRange: "mese",
    mese: 12
  }
];

// COMUNICAZIONI
let comunicazioni = [
  {
    id: 1,
    titolo: "Nuova procedura notturni",
    categoria: "urgente",
    autore: "Titolare",
    data: "Oggi",
    testo: "Seguire la nuova check-list di chiusura farmacia.",
    letta: false
  },
  {
    id: 2,
    titolo: "Verifica armadietto stupefacenti",
    categoria: "importante",
    autore: "Titolare",
    data: "Ieri",
    testo: "Controllare giacenze e scadenze entro fine settimana.",
    letta: false
  },
  {
    id: 3,
    titolo: "Aggiornamento promo vetrina",
    categoria: "informativa",
    autore: "Admin",
    data: "2 giorni fa",
    testo: "Nuova esposizione prodotti stagionali.",
    letta: true
  }
];

// PROCEDURE
const procedureData = [
  {
    id: "proc1",
    titolo: "Chiusura cassa serale",
    reparto: "cassa",
    aggiornamento: "12/11/2025",
    testo: "1) Verifica giacenza contanti.\n2) Stampa chiusura fiscale.\n3) Conta fondo cassa."
  },
  {
    id: "proc2",
    titolo: "Gestione buoni SSN",
    reparto: "cassa",
    aggiornamento: "05/10/2025",
    testo: "Controllare ricetta, inserire dati paziente, allegare scontrino."
  },
  {
    id: "proc3",
    titolo: "Ricezione merce",
    reparto: "magazzino",
    aggiornamento: "22/09/2025",
    testo: "Controllo colli, verifica scadenze, etichettatura, carico."
  }
];

// NOTIFICHE DELLE CARD
const notificationConfig = {
    assenze: {
        titolo: "Notifiche assenze",
        descrizioneVuota: "Nessuna nuova assenza.",
        notifiche: [
            {
                id: "ass-1",
                titolo: "Permesso approvato",
                testo: "Il permesso del 20/12 è stato approvato.",
                letto: false
            }
        ]
    },
    turni: {
        titolo: "Notifiche turni",
        descrizioneVuota: "Nessun cambio turno.",
        notifiche: [
            {
                id: "turni-1",
                titolo: "Cambio turno notturno",
                testo: "Il turno del 19/12 è stato modificato.",
                letto: false
            }
        ]
    },
    comunicazioni: {
        titolo: "Nuove comunicazioni",
        descrizioneVuota: "Tutte lette.",
        notifiche: [
            {
                id: "com-1",
                titolo: "Nuova comunicazione urgente",
                testo: "Aggiornato regolamento retro-banco.",
                letto: false
            }
        ]
    },
    procedure: {
        titolo: "Aggiornamenti procedure",
        descrizioneVuota: "Nessuna procedura nuova.",
        notifiche: [
            {
                id: "proc-1",
                titolo: "Procedura aggiornata",
                testo: "Aggiornata 'Chiusura cassa serale'.",
                letto: false
            }
        ]
    },
    archivio: {
        titolo: "Notifiche Archivio",
        descrizioneVuota: "Nessun file nuovo.",
        notifiche: [
            {
                id: "arch-1",
                titolo: "Nuova cartella creata",
                testo: "È stata creata la cartella 'Documenti'.",
                letto: true
            }
        ]
    }
};

// ======================================================
// STATO GENERALE
// ======================================================
let currentRole = "farmacia";       // farmacia / dipendente / titolare / admin
let currentTurniView = "oggi";      // oggi / settimana / mese
let procedureFilter = "tutti";
let procSearchTerm = "";
let openNotificationCardKey = null;

// ======================================================
// ARCHIVIO FILE – STATO INIZIALE
// ======================================================
let fsRoot = null;
let currentFolder = null;
let selectedItem = null;
let clipboardItem = null;

// funzione per caricare struttura archivio
function loadFS() {
    const saved = localStorage.getItem("fs_montesano_v3");
    if (saved) {
        fsRoot = JSON.parse(saved);
    } else {
        fsRoot = {
            name: "root",
            type: "folder",
            children: [
                { type: "folder", name: "Documenti", children: [] },
                { type: "folder", name: "Foto", children: [] },
                { type: "folder", name: "Ricette", children: [] },
                {
                    type: "file",
                    name: "Benvenuto.txt",
                    content: btoa("Benvenuto nell’Archivio della Farmacia Montesano!")
                }
            ]
        };
        saveFS();
    }
    currentFolder = fsRoot;
}

function saveFS() {
    localStorage.setItem("fs_montesano_v3", JSON.stringify(fsRoot));
}

// =======================================================================================
// Fine BLOCCO 1/10
// =======================================================================================
// ======================================================
// DOM READY
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    // ============================
    // RIFERIMENTI BASE
    // ============================
    const authContainer = document.getElementById("authContainer");
    const app = document.getElementById("app");

    const loginForm = document.getElementById("loginForm");
    const loginRoleLabel = document.getElementById("loginRoleLabel");
    const authTabs = document.querySelectorAll(".auth-tab");

    // sezioni principali
    const dashboardSection = document.getElementById("dashboard");
    const assenzePage = document.getElementById("assenzePage");
    const turniPage = document.getElementById("turniPage");
    const comunicazioniPage = document.getElementById("comunicazioniPage");
    const procedurePage = document.getElementById("procedurePage");
    const archivioPage = document.getElementById("archivioPage"); // se c'è

    // sidebar
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const logoutBtn = document.getElementById("logoutBtn");

    // pill ruolo + titolo assenze
    const rolePill = document.getElementById("currentRolePill");
    const assenzeTitle = document.getElementById("assenzeTitle");

    // bottoni da dashboard verso pagine
    const openAssenzeBtn = document.getElementById("openAssenze");
    const openTurniBtn = document.getElementById("openTurni");
    const openComunicazioniBtn = document.getElementById("openComunicazioni");
    const openProcedureBtn = document.getElementById("openProcedure");
    const openArchivioBtn = document.getElementById("openArchivio"); // card Archivio (se esiste)

    // bottoni "indietro" nelle pagine
    const backFromAssenzeBtn = document.getElementById("backFromAssenze");
    const backFromTurniBtn = document.getElementById("backFromTurni");
    const backFromComunicazioniBtn = document.getElementById("backFromComunicazioni");
    const backFromProcedureBtn = document.getElementById("backFromProcedure");
    const backFromArchivioBtn = document.getElementById("backFromArchivio");

    // DASHBOARD – logo per accesso admin segreto
    const dashLogo = document.querySelector(".dash-logo");

    // TURNI – elementi dashboard + pagina
    const turnoOrarioChip = document.getElementById("turnoOrarioChip");
    const turnoNome = document.getElementById("turnoNome");
    const turnoIndirizzo = document.getElementById("turnoIndirizzo");
    const turnoAppoggio = document.getElementById("turnoAppoggio");

    const turnoOggiNome = document.getElementById("turnoOggiNome");
    const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
    const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
    const turnoOggiOrario = document.getElementById("turnoOggiOrario");
    const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
    const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

    const turniTabs = document.querySelectorAll(".turni-tab");
    const turniRows = document.getElementById("turniRows");
    const turniMeseSelect = document.getElementById("turniMeseSelect");
    const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

    // COMUNICAZIONI
    const comunicazioniList = document.getElementById("comunicazioniList");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
    const comunicazioneForm = document.getElementById("comunicazioneForm");
    const comunicazioneFeedback = document.getElementById("comunicazioneFeedback");
    const badgeTotComunicazioni = document.getElementById("badgeTotComunicazioni");
    const badgeNonLette = document.getElementById("badgeNonLette");
    const badgeUrgenti = document.getElementById("badgeUrgenti");

    // ASSENZE – form
    const assenzeForm = document.querySelector(".assenze-form");
    const assenzeFeedback = document.getElementById("assenzeFeedback");

    // PROCEDURE
    const procedureListEl = document.getElementById("procedureList");
    const procedureDetail = document.getElementById("procedureDetail");
    const procedureSearch = document.getElementById("procedureSearch");
    const procedureButtons = document.querySelectorAll(".proc-filter-btn");

    // ARCHIVIO – elementi (se esiste la pagina)
    const archivioGrid = document.getElementById("archivioGrid");
    const archivioPath = document.getElementById("archivioPath");
    const archivioUpload = document.getElementById("archivioUpload");
    const archivioBtnUpload = document.getElementById("archivioBtnUpload");
    const archivioUpBtn = document.getElementById("archivioUp");
    const archivioNewFolderBtn = document.getElementById("archivioNewFolder");
    const archivioContextMenu = document.getElementById("archivioContextMenu");
    const menuNuova = document.getElementById("menuNuova");
    const menuRinomina = document.getElementById("menuRinomina");
    const menuElimina = document.getElementById("menuElimina");
    const menuCopia = document.getElementById("menuCopia");
    const menuIncolla = document.getElementById("menuIncolla");
    const menuDownload = document.getElementById("menuDownload");

    // OVERLAY NOTIFICHE
    const notifOverlay = document.getElementById("notificationOverlay");
    const notifTitle = document.getElementById("notifTitle");
    const notifIntro = document.getElementById("notifIntro");
    const notifList = document.getElementById("notifList");
    const notifClose = document.getElementById("notifClose");
    const notifCloseBottom = document.getElementById("notifCloseBottom");

    // ======================================================
    // FUNZIONI BASE: RUOLO + SEZIONI
    // ======================================================
    function setRole(role) {
        currentRole = role;

        if (!rolePill) return;

        if (role === "farmacia") {
            rolePill.textContent = "Farmacia (accesso generico)";
            if (assenzeTitle) assenzeTitle.textContent = "Assenze del personale";
        } else if (role === "titolare") {
            rolePill.textContent = "Titolare";
            if (assenzeTitle) assenzeTitle.textContent = "Assenze del personale";
        } else if (role === "dipendente") {
            rolePill.textContent = "Dipendente";
            if (assenzeTitle) assenzeTitle.textContent = "Le mie assenze";
        } else if (role === "admin") {
            rolePill.textContent = "ADMIN (pannello segreto)";
            if (assenzeTitle) assenzeTitle.textContent = "Assenze del personale";
        }
    }

    function showSection(section) {
        const allSections = [
            dashboardSection,
            assenzePage,
            turniPage,
            comunicazioniPage,
            procedurePage,
            archivioPage
        ];
        allSections.forEach(sec => {
            if (sec) sec.classList.add("hidden");
        });
        if (section) section.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "instant" });
    }

    // ======================================================
    // LOGIN – SELEZIONE RUOLO + SUBMIT
    // ======================================================
    if (authTabs && authTabs.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                authTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                const role = tab.dataset.role;
                if (!loginRoleLabel) return;
                if (role === "farmacia") loginRoleLabel.textContent = "Farmacia";
                else if (role === "titolare") loginRoleLabel.textContent = "Titolare";
                else if (role === "dipendente") loginRoleLabel.textContent = "Dipendente";
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const activeTab = document.querySelector(".auth-tab.active");
            const role = activeTab ? activeTab.dataset.role : "farmacia";

            // setta ruolo
            setRole(role);

            // mostra app
            if (authContainer) authContainer.classList.add("hidden");
            if (app) app.classList.remove("hidden");

            // dashboard iniziale
            showSection(dashboardSection);

            // inizializza pallini notifiche
            initNotificationBadges();

            // inizializza archivio se esiste
            if (archivioGrid) {
                loadFS();
                renderArchivio();
            }
        });
    }

    // ======================================================
    // SIDEBAR / HAMBURGER
    // ======================================================
    function openSidebar() {
        if (sidebar) sidebar.classList.add("open");
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
    }

    if (hamburger) {
        hamburger.addEventListener("click", openSidebar);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener("click", closeSidebar);
    }

    // chiusura cliccando fuori
    document.addEventListener("click", (e) => {
        if (
            sidebar &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) &&
            e.target !== hamburger
        ) {
            closeSidebar();
        }
    });

    // NAVIGAZIONE SIDEBAR
    if (sidebar) {
        sidebar.querySelectorAll("li[data-nav]").forEach(item => {
            item.addEventListener("click", () => {
                const target = item.dataset.nav;

                if (target === "dashboard") {
                    showSection(dashboardSection);
                } else if (target === "assenzePage") {
                    showSection(assenzePage);
                } else if (target === "turniPage") {
                    showSection(turniPage);
                    renderTurniTable();
                } else if (target === "comunicazioniPage") {
                    showSection(comunicazioniPage);
                    renderComunicazioni();
                } else if (target === "procedurePage") {
                    showSection(procedurePage);
                    renderProcedureList();
                } else if (target === "archivioPage") {
                    showSection(archivioPage);
                    if (!fsRoot) loadFS();
                    renderArchivio();
                }

                closeSidebar();
            });
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (app) app.classList.add("hidden");
            if (authContainer) authContainer.classList.remove("hidden");

            if (loginForm) loginForm.reset();
            if (authTabs && authTabs.length > 0) {
                authTabs.forEach(t => t.classList.remove("active"));
                authTabs[0].classList.add("active");
            }
            if (loginRoleLabel) loginRoleLabel.textContent = "Farmacia";
            setRole("farmacia");
        });
    }

    // ======================================================
    // NAVIGAZIONE BOTTONI DASHBOARD
    // ======================================================
    if (openAssenzeBtn) {
        openAssenzeBtn.addEventListener("click", () => {
            showSection(assenzePage);
        });
    }
    if (backFromAssenzeBtn) {
        backFromAssenzeBtn.addEventListener("click", () => {
            showSection(dashboardSection);
        });
    }

    if (openTurniBtn) {
        openTurniBtn.addEventListener("click", () => {
            showSection(turniPage);
            renderTurniTable();
        });
    }
    if (backFromTurniBtn) {
        backFromTurniBtn.addEventListener("click", () => {
            showSection(dashboardSection);
        });
    }

    if (openComunicazioniBtn) {
        openComunicazioniBtn.addEventListener("click", () => {
            showSection(comunicazioniPage);
            renderComunicazioni();
        });
    }
    if (backFromComunicazioniBtn) {
        backFromComunicazioniBtn.addEventListener("click", () => {
            showSection(dashboardSection);
        });
    }

    if (openProcedureBtn) {
        openProcedureBtn.addEventListener("click", () => {
            showSection(procedurePage);
            renderProcedureList();
        });
    }
    if (backFromProcedureBtn) {
        backFromProcedureBtn.addEventListener("click", () => {
            showSection(dashboardSection);
        });
    }

    if (openArchivioBtn) {
        openArchivioBtn.addEventListener("click", () => {
            showSection(archivioPage);
            if (!fsRoot) loadFS();
            renderArchivio();
        });
    }
    if (backFromArchivioBtn) {
        backFromArchivioBtn.addEventListener("click", () => {
            showSection(dashboardSection);
        });
    }

    // ======================================================
    // ACCESSO ADMIN SEGRETO – 5 TAP SUL LOGO
    // ======================================================
    let adminTapCount = 0;
    let adminTapTimeout = null;

    function resetAdminTap() {
        adminTapCount = 0;
        if (adminTapTimeout) {
            clearTimeout(adminTapTimeout);
            adminTapTimeout = null;
        }
    }

    function enterAdminMode() {
        setRole("admin");
        // in futuro potrai far apparire tab extra solo per admin
        showSection(dashboardSection);
        alert("Accesso ADMIN attivato (modalità segreta).");
    }

    if (dashLogo) {
        dashLogo.addEventListener("click", () => {
            adminTapCount++;
            if (adminTapTimeout) clearTimeout(adminTapTimeout);
            adminTapTimeout = setTimeout(resetAdminTap, 2000); // 2 secondi per fare 5 tap

            if (adminTapCount >= 5) {
                resetAdminTap();
                enterAdminMode();
            }
        });
    }

    // ======================================================
    // DA QUI IN POI: FUNZIONI SPECIFICHE (turni, comunicazioni,
    // procedure, archivio, notifiche, ecc.)
    // ======================================================

    // Inizializza subito:
    initTurnoOggi();
    renderComunicazioni();
    renderProcedureList();
    initNotificationBadges();
    if (archivioGrid) {
        loadFS();
        renderArchivio();
    }

    // Il resto delle funzioni arriva nei blocchi successivi...
// <<< il blocco 2/10 continua nel blocco 3/10 >>>
});
// ======================================================
// FUNZIONI GENERALI – FUORI DAL DOMContentLoaded
// (vengono usate dentro il codice già definito nel blocco 2/10)
// ======================================================

// ---------- TURNI ----------

function formatDateIT(iso) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function initTurnoOggi() {
    const oggi = turniFarmacie.find(t => t.tipoRange === "oggi");
    if (!oggi) return;

    const turnoOrarioChip = document.getElementById("turnoOrarioChip");
    const turnoNome = document.getElementById("turnoNome");
    const turnoIndirizzo = document.getElementById("turnoIndirizzo");
    const turnoAppoggio = document.getElementById("turnoAppoggio");

    const turnoOggiNome = document.getElementById("turnoOggiNome");
    const turnoOggiIndirizzo = document.getElementById("turnoOggiIndirizzo");
    const turnoOggiTelefono = document.getElementById("turnoOggiTelefono");
    const turnoOggiOrario = document.getElementById("turnoOggiOrario");
    const turnoOggiAppoggioNome = document.getElementById("turnoOggiAppoggioNome");
    const turnoOggiAppoggioDettagli = document.getElementById("turnoOggiAppoggioDettagli");

    if (turnoOrarioChip) turnoOrarioChip.textContent = oggi.orario;
    if (turnoNome) turnoNome.textContent = oggi.principale;
    if (turnoIndirizzo) {
        turnoIndirizzo.innerHTML = `Via Esempio 12, Matera<br />Tel: ${oggi.telefono}`;
    }
    if (turnoAppoggio) turnoAppoggio.textContent = oggi.appoggio;

    if (turnoOggiNome) turnoOggiNome.textContent = oggi.principale;
    if (turnoOggiIndirizzo) turnoOggiIndirizzo.textContent = "Via Esempio 12, Matera";
    if (turnoOggiTelefono) turnoOggiTelefono.textContent = `Tel: ${oggi.telefono}`;
    if (turnoOggiOrario) turnoOggiOrario.textContent = oggi.orario;
    if (turnoOggiAppoggioNome) turnoOggiAppoggioNome.textContent = oggi.appoggio;
    if (turnoOggiAppoggioDettagli) {
        turnoOggiAppoggioDettagli.textContent =
            "Via Dante 8, Matera – Tel: 0835 111111";
    }
}

function renderTurniTable() {
    const turniRows = document.getElementById("turniRows");
    const turniMeseSelect = document.getElementById("turniMeseSelect");
    const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");
    if (!turniRows) return;

    const mese = turniMeseSelect ? turniMeseSelect.value : "all";
    const farmacia = turniFarmaciaSelect ? turniFarmaciaSelect.value : "all";

    let filtered = turniFarmacie.filter(t => t.tipoRange === currentTurniView);

    if (mese !== "all") {
        filtered = filtered.filter(t => t.mese === Number(mese));
    }
    if (farmacia !== "all") {
        filtered = filtered.filter(t => t.principale === farmacia);
    }

    turniRows.innerHTML = "";

    if (filtered.length === 0) {
        const row = document.createElement("div");
        row.className = "turni-row";
        row.innerHTML = "<span>Nessun turno per i filtri selezionati.</span>";
        turniRows.appendChild(row);
        return;
    }

    filtered.forEach(t => {
        const row = document.createElement("div");
        row.className = "turni-row";

        let noteClass = "normale";
        const lower = t.note.toLowerCase();
        if (lower.includes("notturno")) noteClass = "notturno";
        if (lower.includes("vigilia") || lower.includes("festivo")) noteClass = "festivo";

        row.innerHTML = `
            <span>${formatDateIT(t.data)}</span>
            <span>${t.orario}</span>
            <span>${t.principale}</span>
            <span>${t.appoggio}</span>
            <span>${t.telefono}</span>
            <span><span class="turno-type-pill ${noteClass}">${t.note}</span></span>
        `;
        turniRows.appendChild(row);
    });
}

// ---------- COMUNICAZIONI ----------

function aggiornaBadgeComunicazioni() {
    const badgeTotComunicazioni = document.getElementById("badgeTotComunicazioni");
    const badgeNonLette = document.getElementById("badgeNonLette");
    const badgeUrgenti = document.getElementById("badgeUrgenti");

    if (!badgeTotComunicazioni || !badgeNonLette || !badgeUrgenti) return;

    const tot = comunicazioni.length;
    const nonLette = comunicazioni.filter(c => !c.letta).length;
    const urgenti = comunicazioni.filter(c => c.categoria === "urgente").length;

    badgeTotComunicazioni.textContent = `Totali: ${tot}`;
    badgeNonLette.textContent = `Non lette: ${nonLette}`;
    badgeUrgenti.textContent = `Urgenti: ${urgenti}`;
}

function renderComunicazioni() {
    const comunicazioniList = document.getElementById("comunicazioniList");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");
    if (!comunicazioniList) return;

    const cat = filtroCategoria ? filtroCategoria.value : "tutte";
    const soloNL = filtroSoloNonLette ? filtroSoloNonLette.checked : false;

    let filtered = [...comunicazioni];

    if (cat !== "tutte") {
        filtered = filtered.filter(c => c.categoria === cat);
    }
    if (soloNL) {
        filtered = filtered.filter(c => !c.letta);
    }

    comunicazioniList.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "small-text";
        empty.textContent = "Nessuna comunicazione per i filtri selezionati (demo).";
        comunicazioniList.appendChild(empty);
        aggiornaBadgeComunicazioni();
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement("div");
        card.className = "com-card";

        const pill = document.createElement("div");
        pill.className = `com-pill ${c.categoria}`;
        pill.textContent =
            c.categoria === "urgente"
                ? "URGENTE"
                : c.categoria === "importante"
                ? "IMPORTANTE"
                : "INFORMATIVA";

        const title = document.createElement("div");
        title.className = "com-title";
        title.textContent = c.titolo;

        const meta = document.createElement("div");
        meta.className = "com-meta";
        const stato = c.letta ? "Letta" : "Non letta";
        meta.textContent = `${c.data} · ${c.autore} · ${stato}`;

        const text = document.createElement("div");
        text.className = "com-text";
        text.textContent = c.testo;

        card.appendChild(pill);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(text);

        comunicazioniList.appendChild(card);
    });

    aggiornaBadgeComunicazioni();
}

// ---------- ASSENZE – FORM SEMPLICE ----------

(function initAssenzeForm() {
    const assenzeForm = document.querySelector(".assenze-form");
    const assenzeFeedback = document.getElementById("assenzeFeedback");
    if (!assenzeForm || !assenzeFeedback) return;

    assenzeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        assenzeFeedback.classList.remove("hidden");
        assenzeFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
    });
})();

// ---------- PROCEDURE ----------

function renderProcedureList() {
    const procedureListEl = document.getElementById("procedureList");
    const procedureDetail = document.getElementById("procedureDetail");
    if (!procedureListEl) return;

    let filtered = procedureData.filter(p => {
        const matchCat = (procedureFilter === "tutti" || p.reparto === procedureFilter);
        const testoRicerca = (p.titolo + " " + p.testo).toLowerCase();
        const matchSearch = !procSearchTerm || testoRicerca.includes(procSearchTerm);
        return matchCat && matchSearch;
    });

    procedureListEl.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "small-text";
        empty.textContent = "Nessuna procedura trovata per i filtri impostati (demo).";
        procedureListEl.appendChild(empty);
        if (procedureDetail) {
            procedureDetail.innerHTML =
                '<p class="small-text muted">Nessuna procedura selezionata.</p>';
        }
        return;
    }

    filtered.forEach(p => {
        const item = document.createElement("div");
        item.className = "proc-item";
        item.dataset.procId = p.id;

        const main = document.createElement("div");
        main.className = "proc-item-main";

        const title = document.createElement("div");
        title.className = "proc-item-title";
        title.textContent = p.titolo;

        const meta = document.createElement("div");
        meta.className = "proc-item-meta";
        const repLabel =
            p.reparto === "cassa"
                ? "Cassa / Banco"
                : p.reparto === "magazzino"
                ? "Magazzino"
                : p.reparto === "servizi"
                ? "Servizi"
                : "Logistica";
        meta.textContent = `${repLabel} · Agg.: ${p.aggiornamento}`;

        main.appendChild(title);
        main.appendChild(meta);

        const tag = document.createElement("div");
        tag.className = "proc-tag";
        tag.textContent = "Apri";

        item.appendChild(main);
        item.appendChild(tag);

        item.addEventListener("click", () => {
            showProcedure(p.id);
        });

        procedureListEl.appendChild(item);
    });
}

function showProcedure(procId) {
    const procedureDetail = document.getElementById("procedureDetail");
    if (!procedureDetail) return;
    const proc = procedureData.find(p => p.id === procId);
    if (!proc) return;

    const repLabel =
        proc.reparto === "cassa"
            ? "Cassa / Banco"
            : proc.reparto === "magazzino"
            ? "Magazzino"
            : proc.reparto === "servizi"
            ? "Servizi"
            : "Logistica";

    const paragrafi = proc.testo.split("\n").map((row) => `<p>${row}</p>`).join("");

    procedureDetail.innerHTML = `
        <h3>${proc.titolo}</h3>
        <p class="small-text">Reparto: <strong>${repLabel}</strong> · Ultimo aggiornamento: <strong>${proc.aggiornamento}</strong></p>
        <div class="divider"></div>
        <div>${paragrafi}</div>
    `;
}

// gestione filtri procedure (input + bottoni)
(function initProcedureFilters() {
    const procedureSearch = document.getElementById("procedureSearch");
    const procedureButtons = document.querySelectorAll(".proc-filter-btn");

    if (procedureSearch) {
        procedureSearch.addEventListener("input", (e) => {
            procSearchTerm = e.target.value.trim().toLowerCase();
            renderProcedureList();
        });
    }

    if (procedureButtons && procedureButtons.length > 0) {
        procedureButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                procedureButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                procedureFilter = btn.getAttribute("data-reparto") || "tutti";
                renderProcedureList();
            });
        });
    }
})();
// ======================================================
// NOTIFICHE DASHBOARD – PALLINI + POPUP
// ======================================================

function getUnreadNotifications(cardKey) {
    const cfg = notificationConfig[cardKey];
    if (!cfg) return [];
    return cfg.notifiche.filter(n => !n.letto);
}

function updateBadgeForCard(cardKey) {
    const badge = document.querySelector(`.card-badge[data-card-key="${cardKey}"]`);
    const label = document.querySelector(`.card-badge-label[data-card-key="${cardKey}"]`);
    if (!badge) return;

    const unread = getUnreadNotifications(cardKey);
    const count = unread.length;
    const countSpan = badge.querySelector(".badge-count");

    if (count > 0) {
        if (countSpan) countSpan.textContent = String(count);
        badge.classList.add("has-unread");
        badge.style.display = "flex";
        if (label) {
            label.textContent = count === 1 ? "Nuovo" : "Nuovi";
            label.style.display = "block";
        }
    } else {
        if (countSpan) countSpan.textContent = "";
        badge.classList.remove("has-unread");
        badge.style.display = "none";
        if (label) {
            label.textContent = "";
            label.style.display = "none";
        }
    }
}

function initNotificationBadges() {
    Object.keys(notificationConfig).forEach(key => {
        updateBadgeForCard(key);
    });

    // click sui pallini delle card per aprire popup
    document.querySelectorAll(".js-card-badge").forEach(badge => {
        const key = badge.getAttribute("data-card-key");
        badge.addEventListener("click", (e) => {
            e.stopPropagation();
            openNotificationPopup(key);
        });
    });

    // chiusura overlay (pulsanti + sfondo)
    const notifOverlay = document.getElementById("notificationOverlay");
    const notifClose = document.getElementById("notifClose");
    const notifCloseBottom = document.getElementById("notifCloseBottom");

    if (notifClose) {
        notifClose.addEventListener("click", closeNotificationPopup);
    }
    if (notifCloseBottom) {
        notifCloseBottom.addEventListener("click", closeNotificationPopup);
    }
    if (notifOverlay) {
        notifOverlay.addEventListener("click", (e) => {
            if (e.target === notifOverlay || e.target.classList.contains("notif-backdrop")) {
                closeNotificationPopup();
            }
        });
    }
}

function openNotificationPopup(cardKey) {
    const cfg = notificationConfig[cardKey];
    const notifOverlay = document.getElementById("notificationOverlay");
    const notifTitle = document.getElementById("notifTitle");
    const notifIntro = document.getElementById("notifIntro");
    const notifList = document.getElementById("notifList");
    if (!cfg || !notifOverlay || !notifTitle || !notifIntro || !notifList) return;

    openNotificationCardKey = cardKey;

    const unread = getUnreadNotifications(cardKey);

    notifTitle.textContent = cfg.titolo;
    if (unread.length === 0) {
        notifIntro.textContent = cfg.descrizioneVuota;
    } else if (unread.length === 1) {
        notifIntro.textContent = "Hai 1 nuova notifica.";
    } else {
        notifIntro.textContent = `Hai ${unread.length} nuove notifiche.`;
    }

    notifList.innerHTML = "";
    if (unread.length === 0) {
        const empty = document.createElement("div");
        empty.className = "small-text";
        empty.textContent = cfg.descrizioneVuota;
        notifList.appendChild(empty);
    } else {
        unread.forEach(n => {
            const item = document.createElement("div");
            item.className = "notif-item";
            item.dataset.notifId = n.id;

            const textWrap = document.createElement("div");
            textWrap.className = "notif-text";

            const h3 = document.createElement("h3");
            h3.textContent = n.titolo;

            const p = document.createElement("p");
            p.textContent = n.testo;

            textWrap.appendChild(h3);
            textWrap.appendChild(p);

            const btn = document.createElement("button");
            btn.className = "btn-primary small";
            btn.textContent = "Presa visione";
            btn.addEventListener("click", () => {
                markNotificationAsRead(cardKey, n.id);
            });

            item.appendChild(textWrap);
            item.appendChild(btn);

            notifList.appendChild(item);
        });
    }

    notifOverlay.classList.remove("hidden");
    notifOverlay.classList.add("active");
}

function closeNotificationPopup() {
    const notifOverlay = document.getElementById("notificationOverlay");
    if (!notifOverlay) return;
    notifOverlay.classList.add("hidden");
    notifOverlay.classList.remove("active");
    openNotificationCardKey = null;
}

function markNotificationAsRead(cardKey, notifId) {
    const cfg = notificationConfig[cardKey];
    if (!cfg) return;
    const n = cfg.notifiche.find(x => x.id === notifId);
    if (!n || n.letto) return;
    n.letto = true;

    // se popup aperto, ricarica
    if (openNotificationCardKey === cardKey) {
        openNotificationPopup(cardKey);
    }
    // aggiorna pallino card
    updateBadgeForCard(cardKey);
}
// ======================================================
// ARCHIVIO FILE – UTILITY
// ======================================================

let lastSelectedEl = null;

function getPathArray(target) {
    const path = [];

    function helper(node, stack) {
        if (node === target) {
            path.push(...stack, node.name);
            return true;
        }
        if (node.type === "folder" && node.children) {
            for (const child of node.children) {
                if (helper(child, [...stack, node.name])) return true;
            }
        }
        return false;
    }

    if (!fsRoot) return [];
    helper(fsRoot, []);
    return path;
}

function ensureUniqueName(base, list) {
    let name = base;
    let counter = 1;

    while (list.some(i => i.name === name)) {
        const parts = base.split(".");
        if (parts.length > 1) {
            const ext = parts.pop();
            name = parts.join(".") + ` (${counter}).` + ext;
        } else {
            name = base + ` (${counter})`;
        }
        counter++;
    }

    return name;
}

function getFileIconClass(item) {
    if (item.type === "folder") return "folder";
    const parts = item.name.split(".");
    if (parts.length < 2) return "";
    const ext = parts.pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) return "image";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["txt", "log"].includes(ext)) return "txt";
    return "";
}

function clearSelection() {
    if (lastSelectedEl) lastSelectedEl.classList.remove("selected");
    lastSelectedEl = null;
    selectedItem = null;
}
function renderArchivio() {
    const archivioGrid = document.getElementById("archivioGrid");
    const archivioPath = document.getElementById("archivioPath");
    const archivioUpBtn = document.getElementById("archivioUp");
    if (!archivioGrid || !archivioPath || !fsRoot || !currentFolder) return;

    // ordina: cartelle prima, poi file
    currentFolder.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
    });

    // path
    const pathArr = getPathArray(currentFolder);
    archivioPath.textContent = "/" + pathArr.join("/");

    // pulsante "su"
    archivioUpBtn.disabled = (currentFolder === fsRoot);

    // svuota
    archivioGrid.innerHTML = "";

    if (currentFolder.children.length === 0) {
        const empty = document.createElement("div");
        empty.className = "small-text";
        empty.textContent = "Nessun file in questa cartella.";
        archivioGrid.appendChild(empty);
        return;
    }

    currentFolder.children.forEach(item => {
        const el = document.createElement("div");
        el.className = "file-item";

        const icon = document.createElement("div");
        icon.className = "file-icon " + getFileIconClass(item);
        icon.textContent = item.type === "folder" ? "📁" : "📄";

        const name = document.createElement("div");
        name.className = "file-name";
        name.textContent = item.name;

        el.appendChild(icon);
        el.appendChild(name);
        archivioGrid.appendChild(el);

        // CLICK = selezione
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            clearSelection();
            el.classList.add("selected");
            lastSelectedEl = el;
            selectedItem = item;
            hideArchivioContextMenu();
        });

        // DOPPIO CLICK = apri cartella (se folder)
        el.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            if (item.type === "folder") {
                currentFolder = item;
                renderArchivio();
            }
        });

        // TASTO DESTRO = menu contestuale
        el.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearSelection();
            el.classList.add("selected");
            lastSelectedEl = el;
            selectedItem = item;
            showArchivioContextMenu(e.clientX, e.clientY);
        });

        // LONG PRESS SU MOBILE (circa 600ms)
        let touchTimer = null;
        el.addEventListener("touchstart", (e) => {
            touchTimer = setTimeout(() => {
                const touch = e.touches[0];
                clearSelection();
                el.classList.add("selected");
                lastSelectedEl = el;
                selectedItem = item;
                showArchivioContextMenu(touch.clientX, touch.clientY);
            }, 600);
        });
        el.addEventListener("touchend", () => {
            if (touchTimer) clearTimeout(touchTimer);
        });
        el.addEventListener("touchmove", () => {
            if (touchTimer) clearTimeout(touchTimer);
        });
    });

    // click vuoto = deseleziona
    archivioGrid.addEventListener("click", () => {
        clearSelection();
        hideArchivioContextMenu();
    });

    // pulsante "su"
    archivioUpBtn.addEventListener("click", () => {
        if (currentFolder === fsRoot) return;
        // trova parent
        function findParent(node, target, parent) {
            if (node === target) return parent;
            if (node.type === "folder" && node.children) {
                for (const child of node.children) {
                    const r = findParent(child, target, node);
                    if (r) return r;
                }
            }
            return null;
        }
        const parent = findParent(fsRoot, currentFolder, null);
        if (parent) {
            currentFolder = parent;
            renderArchivio();
        }
    });
}
// ======================================================
// ARCHIVIO – MENU CONTESTUALE
// ======================================================

function showArchivioContextMenu(x, y) {
    const menu = document.getElementById("archivioContextMenu");
    if (!menu) return;
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.classList.remove("hidden");
}

function hideArchivioContextMenu() {
    const menu = document.getElementById("archivioContextMenu");
    if (!menu) return;
    menu.classList.add("hidden");
}

// Azioni di menu
(function initArchivioMenu() {
    const menu = document.getElementById("archivioContextMenu");
    const menuNuova = document.getElementById("menuNuova");
    const menuRinomina = document.getElementById("menuRinomina");
    const menuElimina = document.getElementById("menuElimina");
    const menuCopia = document.getElementById("menuCopia");
    const menuIncolla = document.getElementById("menuIncolla");
    const menuDownload = document.getElementById("menuDownload");

    if (!menu) return;

    // click fuori = chiudi menu
    document.addEventListener("click", (e) => {
        if (!menu.classList.contains("hidden") && !menu.contains(e.target)) {
            hideArchivioContextMenu();
        }
    });

    // NUOVA CARTELLA
    if (menuNuova) {
        menuNuova.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!currentFolder) return;

            const baseName = "Nuova cartella";
            const unique = ensureUniqueName(baseName, currentFolder.children);
            currentFolder.children.push({
                type: "folder",
                name: unique,
                children: []
            });
            saveFS();
            renderArchivio();
        });
    }

    // RINOMINA
    if (menuRinomina) {
        menuRinomina.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!selectedItem || !currentFolder) return;
            const nuovoNome = prompt("Nuovo nome:", selectedItem.name);
            if (!nuovoNome) return;

            const siblings = currentFolder.children.filter(i => i !== selectedItem);
            const unique = ensureUniqueName(nuovoNome.trim(), siblings);
            selectedItem.name = unique;
            saveFS();
            renderArchivio();
        });
    }

    // ELIMINA
    if (menuElimina) {
        menuElimina.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!selectedItem || !currentFolder) return;
            const conferma = confirm(`Vuoi eliminare "${selectedItem.name}"?`);
            if (!conferma) return;
            currentFolder.children = currentFolder.children.filter(i => i !== selectedItem);
            selectedItem = null;
            saveFS();
            renderArchivio();
        });
    }

    // COPIA
    if (menuCopia) {
        menuCopia.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!selectedItem) return;
            // copia superficiale (senza clonare figli profondi – ma basta per demo)
            clipboardItem = JSON.parse(JSON.stringify(selectedItem));
            alert(`Copiato: ${clipboardItem.name}`);
        });
    }

    // INCOLLA
    if (menuIncolla) {
        menuIncolla.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!clipboardItem || !currentFolder) return;

            const cloned = JSON.parse(JSON.stringify(clipboardItem));
            cloned.name = ensureUniqueName(cloned.name, currentFolder.children);
            currentFolder.children.push(cloned);
            saveFS();
            renderArchivio();
        });
    }

    // DOWNLOAD (se file, demo)
    if (menuDownload) {
        menuDownload.addEventListener("click", () => {
            hideArchivioContextMenu();
            if (!selectedItem || selectedItem.type !== "file") {
                alert("Seleziona prima un file.");
                return;
            }
            // se ha content (base64) provo a scaricarlo, altrimenti demo
            if (!selectedItem.content) {
                alert("File demo senza contenuto (solo nome).");
                return;
            }

            try {
                const dataUrl = selectedItem.content;
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = selectedItem.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (err) {
                console.error(err);
                alert("Impossibile scaricare il file (demo).");
            }
        });
    }
})();
// ======================================================
// ARCHIVIO – BOTTONI BARRA SUPERIORE
// ======================================================

(function initArchivioToolbar() {
    const archivioNewFolderBtn = document.getElementById("archivioNewFolder");
    const archivioUpload = document.getElementById("archivioUpload");
    const archivioBtnUpload = document.getElementById("archivioBtnUpload");

    if (!archivioNewFolderBtn && !archivioUpload && !archivioBtnUpload) return;

    // NUOVA CARTELLA (bottone in alto)
    if (archivioNewFolderBtn) {
        archivioNewFolderBtn.addEventListener("click", () => {
            if (!currentFolder) {
                if (!fsRoot) loadFS();
                currentFolder = fsRoot;
            }
            const baseName = "Nuova cartella";
            const unique = ensureUniqueName(baseName, currentFolder.children);
            currentFolder.children.push({
                type: "folder",
                name: unique,
                children: []
            });
            saveFS();
            renderArchivio();
        });
    }

    // CLICK SU “CARICA FILE” – apre input nascosto
    if (archivioBtnUpload && archivioUpload) {
        archivioBtnUpload.addEventListener("click", () => {
            archivioUpload.click();
        });

        archivioUpload.addEventListener("change", (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            if (!currentFolder) {
                if (!fsRoot) loadFS();
                currentFolder = fsRoot;
            }

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    const unique = ensureUniqueName(file.name, currentFolder.children);
                    currentFolder.children.push({
                        type: "file",
                        name: unique,
                        content: dataUrl,
                        size: file.size,
                        mime: file.type || "application/octet-stream"
                    });
                    saveFS();
                    renderArchivio();
                };
                // per demo basta DataURL
                reader.readAsDataURL(file);
            });

            // reset input
            e.target.value = "";
        });
    }
})();
// ======================================================
// HOOK FILTRI COMUNICAZIONI & TURNI (per sicurezza doppia)
// ======================================================

(function initComunicazioniFilters() {
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroSoloNonLette = document.getElementById("filtroSoloNonLette");

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", renderComunicazioni);
    }
    if (filtroSoloNonLette) {
        filtroSoloNonLette.addEventListener("change", renderComunicazioni);
    }
})();

(function initTurniFilters() {
    const turniTabs = document.querySelectorAll(".turni-tab");
    const turniMeseSelect = document.getElementById("turniMeseSelect");
    const turniFarmaciaSelect = document.getElementById("turniFarmaciaSelect");

    if (turniTabs && turniTabs.length > 0) {
        turniTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                turniTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                currentTurniView = tab.dataset.view;
                renderTurniTable();
            });
        });
    }

    if (turniMeseSelect) {
        turniMeseSelect.addEventListener("change", renderTurniTable);
    }
    if (turniFarmaciaSelect) {
        turniFarmaciaSelect.addEventListener("change", renderTurniTable);
    }
})();
// ======================================================
// INIT DI SICUREZZA – SE LA PAGINA VIENE RICARICATA DOPO LOGIN
// ======================================================

// se per caso la pagina ricarica e l'utente era loggato, potresti un giorno
// leggere una chiave da localStorage per ripristinare ruolo, ecc.
// Per ora lasciamo solo un log:
console.log("Script Portale Farmacia Montesano v" + APP_VERSION + " caricato.");
