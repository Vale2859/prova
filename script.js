"use strict";

/* ======================
   DATI PROCEDURE (DEMO)
   ====================== */

const procedureData = {
  cassa: {
    label: "Cassa",
    themeClass: "theme-cassa",
    procedures: [
      {
        id: "C1",
        title: "Doppio scontrino / errore importo",
        short:
          "Quando è stato emesso uno scontrino sbagliato (importo o modalità di pagamento).",
        steps: [
          "Avvisa subito il cliente e conserva lo scontrino errato.",
          "Compila la procedura interna di annullo / storno secondo indicazioni del titolare.",
          "Registra un nuovo scontrino corretto.",
          "Segna la correzione sul registro interno (note cassa) per eventuali controlli."
        ],
        keywords: "doppio scontrino errore importo pagamento annullo storno"
      },
      {
        id: "C2",
        title: "Reso merce con rimborso contanti / carta",
        short:
          "Come gestire il reso di un prodotto con rimborso al cliente.",
        steps: [
          "Verifica che il prodotto sia conforme alle condizioni di reso (scontrino, integrità, tempi).",
          "Compila il modulo interno di reso indicando motivo e importo.",
          "Esegui il rimborso (contanti o carta) secondo la modalità concordata.",
          "Registra il reso sul gestionale e aggiorna il movimento di magazzino."
        ],
        keywords: "reso merce rimborso contanti carta restituzione prodotto"
      },
      {
        id: "C3",
        title: "Mancanza resto in cassa",
        short:
          "Cosa fare se manca il resto per chiudere correttamente l’operazione.",
        steps: [
          "Chiedi al collega o al titolare di fornire il taglio mancante (solo da cassa principale).",
          "Se non disponibile, concorda con il cliente una soluzione (arrotondamento o pagamento elettronico).",
          "Registra la situazione nelle note di cassa di fine turno.",
          "Segnala al titolare se l’episodio si ripete spesso (controllo cambio)."
        ],
        keywords: "mancanza resto spicci monete contanti"
      }
    ]
  },

  banco: {
    label: "Banco",
    themeClass: "theme-banco",
    procedures: [
      {
        id: "B1",
        title: "Consiglio integratore su richiesta cliente",
        short:
          "Guida rapida per consigliare integratori nel rispetto delle indicazioni.",
        steps: [
          "Ascolta la richiesta del cliente (sintomo, esigenza, età, eventuali terapie).",
          "Valuta se è possibile un consiglio da banco o se è necessario invio al medico.",
          "Proponi 1–2 prodotti chiari, spiegando modalità e tempi di assunzione.",
          "Registra eventuali note utili (cliente abituale, intolleranze) se previsto dalle policy interne."
        ],
        keywords: "banco consiglio integratore cliente richiesta"
      },
      {
        id: "B2",
        title: "Gestione cliente insoddisfatto al banco",
        short:
          "Come gestire in modo calmo e standardizzato un reclamo immediato.",
        steps: [
          "Ascolta senza interrompere, mantenendo tono calmo.",
          "Riformula il problema per assicurarti di aver capito bene.",
          "Se possibile risolvi subito (reso, cambio prodotto, spiegazione).",
          "Se serve il titolare, accompagna il cliente in uno spazio più tranquillo.",
          "Registra l’episodio nel registro reclami interno."
        ],
        keywords: "cliente arrabbiato reclamo insoddisfatto banco"
      }
    ]
  },

  magazzino: {
    label: "Magazzino",
    themeClass: "theme-magazzino",
    procedures: [
      {
        id: "M1",
        title: "Controllo scadenze mensile",
        short:
          "Procedura standard per controllo e gestione scadenze scaffali.",
        steps: [
          "Seleziona il reparto da controllare secondo il planning mensile.",
          "Controlla lotto e scadenza di ogni prodotto sullo scaffale.",
          "Sposta i prodotti in scadenza a breve nell’area dedicata (offerte / rientri).",
          "Aggiorna il registro scadenze interno o il modulo digitale previsto."
        ],
        keywords: "magazzino scadenze mensile controllo"
      },
      {
        id: "M2",
        title: "Prodotto non trovato a scaffale",
        short:
          "Cosa fare se a gestionale risulta disponibile ma non si trova fisicamente.",
        steps: [
          "Verifica rapidamente gli scaffali vicini (possibile spostamento errato).",
          "Controlla eventuale espositore dedicato o area promozioni.",
          "Se il prodotto non si trova, segnala l’anomalia in magazzino (tag mancante).",
          "Registra la discrepanza per successivo inventario / rettifica."
        ],
        keywords: "prodotto non trovato scaffale manca inventario"
      }
    ]
  },

  servizi: {
    label: "Servizi & Cup",
    themeClass: "theme-servizi",
    procedures: [
      {
        id: "S1",
        title: "Prenotazione servizio (es. ECG, Holter, MOC)",
        short:
          "Come registrare correttamente una prenotazione di servizio.",
        steps: [
          "Raccogli i dati essenziali: nome, telefono, tipologia di servizio, preferenza di giorno/orario.",
          "Verifica disponibilità sul calendario servizi o sulla piattaforma regionale.",
          "Conferma al cliente data, ora, luogo e eventuali preparazioni (es. digiuno).",
          "Registra la prenotazione sul gestionale interno / portale Cup.",
          "Consegnare promemoria cartaceo o digitale (SMS / WhatsApp aziendale) se previsto."
        ],
        keywords: "prenotazione servizio ecg holter moc appuntamento"
      },
      {
        id: "S2",
        title: "Gestione no-show (cliente non si presenta)",
        short:
          "Procedura rapida quando il cliente salta un appuntamento.",
        steps: [
          "Segna il servizio come &quot;non presentato&quot; sul calendario interno.",
          "Contatta il cliente per capire se desidera riprogrammare.",
          "Se necessario libera lo slot per nuovi appuntamenti.",
          "Registra l’episodio secondo le regole interne (es. dopo 3 no-show serve caparra)."
        ],
        keywords: "no-show cliente non si presenta appuntamento mancato"
      }
    ]
  }
};

/* ===== CALCOLO STATISTICHE ===== */
function computeStats() {
  const totali =
    procedureData.cassa.procedures.length +
    procedureData.banco.procedures.length +
    procedureData.magazzino.procedures.length +
    procedureData.servizi.procedures.length;

  return {
    totali,
    cassa: procedureData.cassa.procedures.length,
    banco: procedureData.banco.procedures.length,
    magazzino: procedureData.magazzino.procedures.length,
    servizi: procedureData.servizi.procedures.length
  };
}

/* ===== STATO CORRENTE ===== */
let currentReparto = "cassa";
let currentSearch = "";

/* ===== UTILITY DOM ===== */
function $(selector) {
  return document.querySelector(selector);
}

/* ===== RENDER ===== */

function applyTheme() {
  const step2 = $("#step2Card");
  const step3 = $("#step3Card");

  step2.classList.remove("theme-cassa", "theme-banco", "theme-magazzino", "theme-servizi");
  step3.classList.remove("theme-cassa", "theme-banco", "theme-magazzino", "theme-servizi");

  const themeClass = procedureData[currentReparto].themeClass;
  step2.classList.add(themeClass);
  step3.classList.add(themeClass);
}

function renderStats() {
  const stats = computeStats();
  $("#statTotali").textContent = stats.totali;
  $("#statCassa").textContent = stats.cassa;
  $("#statBanco").textContent = stats.banco;
  $("#statMagazzino").textContent = stats.magazzino;
  $("#statServizi").textContent = stats.servizi;
}

function renderProcedureButtons() {
  const container = $("#procedureList");
  container.innerHTML = "";

  const search = currentSearch.trim().toLowerCase();

  const all = procedureData[currentReparto].procedures;
  const filtered = all.filter((p) => {
    if (!search) return true;
    const text = (p.title + " " + (p.keywords || "")).toLowerCase();
    return text.includes(search);
  });

  if (filtered.length === 0) {
    $("#noResults").classList.remove("hidden");
  } else {
    $("#noResults").classList.add("hidden");
  }

  filtered.forEach((proc) => {
    const btn = document.createElement("button");
    btn.className = "procedure-btn";
    btn.type = "button";
    btn.dataset.id = proc.id;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = proc.title;

    const codeSpan = document.createElement("span");
    codeSpan.className = "code";
    codeSpan.textContent = proc.id;

    btn.appendChild(titleSpan);
    btn.appendChild(codeSpan);

    btn.addEventListener("click", () => showProcedureDetail(proc));

    container.appendChild(btn);
  });

  // Se dopo filtro c'è almeno una procedura, selezioniamo la prima di default
  if (filtered.length > 0) {
    showProcedureDetail(filtered[0], false);
  } else {
    resetDetail();
  }
}

function resetDetail() {
  $("#detailTitle").textContent = "Seleziona una procedura";
  $("#detailReparto").textContent =
    "Tocca una procedura sopra per vedere i passaggi operativi.";
  $("#detailSteps").innerHTML = "";
}

/* Mostra i passaggi della procedura scelta */
function showProcedureDetail(proc, scrollIntoView = true) {
  const repartoLabel = procedureData[currentReparto].label;

  $("#detailTitle").textContent = proc.title;
  $("#detailReparto").textContent = repartoLabel + " · " + (proc.short || "");

  const list = $("#detailSteps");
  list.innerHTML = "";
  proc.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    list.appendChild(li);
  });

  if (scrollIntoView) {
    // Su mobile porta il dettaglio a metà schermo
    $("#step3Card").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ===== EVENTI ===== */

function setupRepartiButtons() {
  const buttons = document.querySelectorAll(".reparto-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reparto = btn.dataset.reparto;
      if (!reparto || reparto === currentReparto) return;

      currentReparto = reparto;

      // Aggiorna stato visivo
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Reset ricerca quando cambio reparto
      currentSearch = $("#searchInput").value.trim();
      applyTheme();
      renderProcedureButtons();
    });
  });
}

function setupSearch() {
  const input = $("#searchInput");
  input.addEventListener("input", () => {
    currentSearch = input.value;
    renderProcedureButtons();
  });
}

/* ===== INIT ===== */

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  setupRepartiButtons();
  setupSearch();
  applyTheme();
  renderProcedureButtons();
});
