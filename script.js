// =====================
// DATI DI BASE (DEMO)
// =====================

const procedureData = {
  cassa: [
    {
      id: "C1",
      titolo: "Doppio scontrino / errore importo",
      scorciatoia: "Alt + D",
      passi: [
        "Metti subito in pausa il cliente e avvisa che stai correggendo l'errore.",
        "Annulla lo scontrino errato secondo la procedura fiscale interna.",
        "Riemetti lo scontrino con l'importo corretto.",
        "Fai firmare eventuale modulo interno per segnalare l'errore."
      ],
      note:
        "Segnala sempre questi casi al titolare a fine giornata per eventuali controlli."
    },
    {
      id: "C2",
      titolo: "Reso merce con rimborso contanti / carta",
      scorciatoia: "Alt + R",
      passi: [
        "Verifica scontrino, data di acquisto e stato della merce.",
        "Applica le regole interne su tempi massimi e condizioni del reso.",
        "Registra il reso sul gestionale selezionando la causale corretta.",
        "Eroga il rimborso (contanti o carta) e fai firmare il modulo di reso."
      ],
      note: "In caso di dubbi, blocca l'operazione e coinvolgi il titolare."
    },
    {
      id: "C3",
      titolo: "Mancanza resto in cassa",
      scorciatoia: "Alt + M",
      passi: [
        "Avvisa con calma il cliente e proponi il regolamento interno (es. arrotondamento).",
        "Se necessario, chiedi supporto al collega di un'altra cassa.",
        "Registra sul gestionale l'eventuale differenza come previsto dalla procedura.",
        "Segna l'episodio sul registro cassa per controllo a fine giornata."
      ],
      note:
        "Mantieni sempre la massima trasparenza: niente operazioni 'a memoria'."
    }
  ],

  banco: [
    {
      id: "B1",
      titolo: "Vendita con consiglio di banco",
      scorciatoia: "B1",
      passi: [
        "Ascolta il bisogno del cliente e fai le domande minime di sicurezza.",
        "Verifica controindicazioni principali (età, terapie in corso, allergie note).",
        "Proponi massimo 2–3 alternative chiare, spiegando differenze principali.",
        "Registra sul gestionale e verifica eventuali alert (interazioni, duplicati)."
      ],
      note:
        "In caso di dubbio clinico, rimanda sempre al medico o al farmacista responsabile."
    },
    {
      id: "B2",
      titolo: "Gestione cliente nervoso al banco",
      scorciatoia: "B2",
      passi: [
        "Mantieni tono calmo e professionale, senza alzare la voce.",
        "Riformula il problema per far capire che hai compreso la richiesta.",
        "Proponi una soluzione concreta (cambio prodotto, reso, spiegazione).",
        "Se non basta, coinvolgi un collega o il titolare."
      ],
      note:
        "Mai discutere davanti agli altri clienti: spostati se possibile in zona più tranquilla."
    }
  ],

  magazzino: [
    {
      id: "M1",
      titolo: "Controllo scadenze mensile",
      scorciatoia: "M1",
      passi: [
        "Stampa o apri l'elenco scadenze dal gestionale (mese corrente + 2 successivi).",
        "Controlla fisicamente gli scaffali interni e confronta con la lista.",
        "Sposta i prodotti in scadenza in area dedicata o evidenziata.",
        "Compila il report mensile scadenze da condividere col titolare."
      ],
      note:
        "Meglio anticipare di 1 mese il controllo per reparti critici (es. integratori, cosmetica)."
    },
    {
      id: "M2",
      titolo: "Prodotto non trovato a scaffale",
      scorciatoia: "M2",
      passi: [
        "Verifica sul gestionale se il prodotto risulta presente in giacenza.",
        "Controlla ripiano, cassetti e eventuale esposizione in vetrina o isola promozionale.",
        "Se non trovato, segnala sul gestionale come 'mancante a scaffale' o applica etichetta interna.",
        "Compila la lista prodotti da ricercare/riordinare a fine turno."
      ],
      note: "Riduci al minimo il tempo di ricerca per non lasciare il banco scoperto."
    }
  ],

  servizi: [
    {
      id: "S1",
      titolo: "Prenotazione servizio (es. ECG, holter, MOC)",
      scorciatoia: "S1",
      passi: [
        "Apri agenda servizi e verifica disponibilità di data e fascia oraria.",
        "Inserisci i dati essenziali del cliente (nome, telefono, servizio richiesto).",
        "Conferma la prenotazione e ricorda eventuali preparazioni (es. digiuno).",
        "Invia o consegna promemoria cartaceo/digitale al cliente."
      ],
      note:
        "Quando sarà attivo il server/NAS potrai collegare direttamente la prenotazione al calendario."
    },
    {
      id: "S2",
      titolo: "Gestione no-show (cliente non si presenta)",
      scorciatoia: "S2",
      passi: [
        "Segna sull'agenda che il cliente non si è presentato.",
        "Se previsto dal regolamento, contatta il cliente per riprogrammare.",
        "Libera la fascia oraria per altri appuntamenti.",
        "Registra in un elenco i no-show del mese per eventuali valutazioni."
      ],
      note:
        "In futuro questa procedura potrà generare notifiche automatiche al cliente."
    }
  ]
};

// =====================
// STATO
// =====================

let currentReparto = "cassa";
let currentProcedureId = null;

// =====================
// INIZIALIZZAZIONE
// =====================

document.addEventListener("DOMContentLoaded", () => {
  // Statistiche
  aggiornaStatistiche();

  // Reparti
  const repartoButtons = document.querySelectorAll(".reparto-pill");
  repartoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reparto = btn.dataset.reparto;
      selezionaReparto(reparto);
    });
  });

  // Barra di ricerca
  const searchInput = document.getElementById("procedureSearch");
  const clearBtn = document.getElementById("clearSearch");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length === 0) {
      clearBtn.classList.add("hidden");
      document.getElementById("searchHint").textContent =
        "Suggerimento: scrivi 2-3 lettere (es. “scon”, “reso”, “scad”) e poi tocca la procedura.";
      // Torna alla lista del reparto corrente
      renderProcedureListForReparto(currentReparto);
    } else {
      clearBtn.classList.remove("hidden");
      filtraProcedure(query);
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    document.getElementById("searchHint").textContent =
      "Suggerimento: scrivi 2-3 lettere (es. “scon”, “reso”, “scad”) e poi tocca la procedura.";
    renderProcedureListForReparto(currentReparto);
  });

  // Prima visualizzazione
  selezionaReparto(currentReparto);
});

// =====================
// FUNZIONI
// =====================

function aggiornaStatistiche() {
  const totali =
    procedureData.cassa.length +
    procedureData.banco.length +
    procedureData.magazzino.length +
    procedureData.servizi.length;

  document.getElementById("statTotali").textContent = totali;
  document.getElementById("statCassa").textContent = procedureData.cassa.length;
  document.getElementById("statBanco").textContent = procedureData.banco.length;
  document.getElementById("statMagazzino").textContent =
    procedureData.magazzino.length + procedureData.servizi.length; // se vuoi tenerli insieme
}

function selezionaReparto(reparto) {
  currentReparto = reparto;
  currentProcedureId = null;

  // Aggiorna pill attiva
  document.querySelectorAll(".reparto-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.reparto === reparto);
  });

  // Aggiorna etichetta contesto
  const label = document.getElementById("currentContextLabel");
  const nomeReparto = formatRepartoName(reparto);
  label.textContent = `Reparto: ${nomeReparto}`;

  // Svuota ricerca se c'era qualcosa
  const searchInput = document.getElementById("procedureSearch");
  const clearBtn = document.getElementById("clearSearch");
  if (searchInput.value.trim() !== "") {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
  }

  document.getElementById("searchHint").textContent =
    "Suggerimento: scrivi 2-3 lettere (es. “scon”, “reso”, “scad”) e poi tocca la procedura.";

  // Mostra lista del reparto
  renderProcedureListForReparto(reparto);

  // Reset dettaglio
  resetDettaglio();
}

function renderProcedureListForReparto(reparto) {
  const listEl = document.getElementById("procedureList");
  listEl.innerHTML = "";

  const lista = procedureData[reparto] || [];
  lista.forEach((proc) => {
    const btn = creaBottoneProcedura(proc, reparto);
    listEl.appendChild(btn);
  });
}

function creaBottoneProcedura(proc, reparto, daRicerca = false) {
  const btn = document.createElement("button");
  btn.className = "procedure-btn";
  btn.dataset.id = proc.id;
  btn.dataset.reparto = reparto;

  const titleSpan = document.createElement("span");
  titleSpan.className = "procedure-title";
  titleSpan.textContent = proc.titolo;

  const metaDiv = document.createElement("div");
  metaDiv.className = "procedure-meta";

  if (proc.scorciatoia) {
    const shortSpan = document.createElement("span");
    shortSpan.className = "shortcut-pill";
    shortSpan.textContent = proc.scorciatoia;
    metaDiv.appendChild(shortSpan);
  }

  if (daRicerca) {
    const repSpan = document.createElement("span");
    repSpan.className = "rep-tag";
    repSpan.textContent = formatRepartoName(reparto);
    metaDiv.appendChild(repSpan);
  }

  btn.appendChild(titleSpan);
  btn.appendChild(metaDiv);

  btn.addEventListener("click", () => {
    // quando viene da ricerca, seleziono anche il reparto corretto
    if (daRicerca) {
      selezionaReparto(reparto);
    }
    mostraDettaglioProcedura(proc, reparto);

    // evidenzia il bottone selezionato
    document.querySelectorAll(".procedure-btn").forEach((b) => {
      b.classList.toggle(
        "active",
        b.dataset.id === proc.id && b.dataset.reparto === reparto
      );
    });
  });

  return btn;
}

function mostraDettaglioProcedura(proc, reparto) {
  currentProcedureId = proc.id;

  document.getElementById("detailTitle").textContent = proc.titolo;
  document.getElementById("detailRepartoTag").textContent =
    formatRepartoName(reparto);
  document.getElementById("detailIntro").textContent =
    "Passaggi operativi da seguire:";

  const stepsEl = document.getElementById("detailSteps");
  stepsEl.innerHTML = "";
  proc.passi.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsEl.appendChild(li);
  });

  document.getElementById("detailNote").textContent = proc.note || "";
}

function resetDettaglio() {
  document.getElementById("detailTitle").textContent =
    "Nessuna procedura selezionata";
  document.getElementById("detailRepartoTag").textContent = "—";
  document.getElementById("detailIntro").textContent =
    "Tocca una procedura sopra per vedere i passaggi operativi.";
  document.getElementById("detailSteps").innerHTML = "";
  document.getElementById("detailNote").textContent = "";
}

function filtraProcedure(query) {
  const listEl = document.getElementById("procedureList");
  listEl.innerHTML = "";

  const risultati = [];

  Object.keys(procedureData).forEach((reparto) => {
    procedureData[reparto].forEach((proc) => {
      const testo = `${proc.titolo} ${proc.scorciatoia || ""}`.toLowerCase();
      if (testo.includes(query)) {
        risultati.push({ reparto, proc });
      }
    });
  });

  const hintEl = document.getElementById("searchHint");

  if (risultati.length === 0) {
    hintEl.textContent = "Nessuna procedura trovata per questa ricerca.";
    return;
  }

  hintEl.textContent = `Risultati: ${risultati.length} procedur${
    risultati.length === 1 ? "a" : "e"
  } trovate. Tocca per vedere i passaggi.`;

  risultati.forEach(({ reparto, proc }) => {
    const btn = creaBottoneProcedura(proc, reparto, true);
    listEl.appendChild(btn);
  });
}

function formatRepartoName(key) {
  switch (key) {
    case "cassa":
      return "Cassa";
    case "banco":
      return "Banco";
    case "magazzino":
      return "Magazzino";
    case "servizi":
      return "Servizi & Cup";
    default:
      return key;
  }
}
