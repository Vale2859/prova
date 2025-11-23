// ===== DATI PROCEDURE (DEMO) =====
const procedureData = {
  cassa: {
    label: "Cassa",
    descrizione:
      "Procedure operative per chi lavora in cassa: scontrini, resi, errori di pagamento.",
    coloreChip: "Cassa",
    elenco: [
      {
        id: "doppio-scontrino",
        titolo: "Doppio scontrino / errore importo",
        scorciatoia: "Alt + D",
        passi: [
          "Avvisa subito il cliente e controlla l'importo corretto.",
          "Compila la procedura interna per l'annullo (se prevista dal gestionale).",
          "Registra l'operazione sul registro 'Errori cassa' con data, ora e nome operatore.",
          "Informa il titolare a fine turno se l'importo è rilevante."
        ]
      },
      {
        id: "reso-contante-card",
        titolo: "Reso merce con rimborso contanti / carta",
        scorciatoia: "Alt + R",
        passi: [
          "Verifica scontrino e integrità della confezione.",
          "Segui il flusso 'Reso' del gestionale (motivo reso + operatore).",
          "Rimborsa il cliente con lo stesso metodo di pagamento, se possibile.",
          "Archivia lo scontrino di reso nell'apposita busta giornaliera."
        ]
      },
      {
        id: "mancanza-resto",
        titolo: "Mancanza resto in cassa",
        scorciatoia: "Alt + M",
        passi: [
          "Chiedi cambio al collega/titolare senza usare soldi personali.",
          "Registra sul foglio 'Cambio cassa' data, ora, taglio richiesto e operatore.",
          "A fine giornata verifica che il cambio sia rientrato correttamente."
        ]
      }
    ]
  },
  banco: {
    label: "Banco",
    descrizione:
      "Procedure per il banco vendita: consiglio al paziente, ricette e note importanti.",
    coloreChip: "Banco",
    elenco: [
      {
        id: "vendita-senza-farmaco",
        titolo: "Farmaco mancante – cosa dire al cliente",
        scorciatoia: "B1",
        passi: [
          "Controlla subito nel gestionale la disponibilità in altre sedi / magazzino.",
          "Proponi alternativa equivalente secondo le regole interne e normative.",
          "Se il cliente vuole, registra una prenotazione con nome, telefono e data.",
          "Segna sul portale logistica se è un farmaco che manca spesso."
        ]
      },
      {
        id: "ricetta-illeggibile",
        titolo: "Ricetta illeggibile o dubbia",
        scorciatoia: "B2",
        passi: [
          "Non consegnare nulla se non sei sicuro del farmaco.",
          "Chiama il medico o lo studio per conferma, indicando nome paziente e data.",
          "Segna sul portale una breve nota per il titolare se l'episodio si ripete."
        ]
      }
    ]
  },
  magazzino: {
    label: "Magazzino",
    descrizione:
      "Procedure per scorte, scadenze e ordine degli scaffali interni.",
    coloreChip: "Magazzino",
    elenco: [
      {
        id: "controllo-scadenze",
        titolo: "Controllo scadenze mensile",
        scorciatoia: "M1",
        passi: [
          "Ogni inizio mese controlla il report scadenze dal gestionale.",
          "Sposta in 'zona da rendere' i prodotti con scadenza entro 3 mesi.",
          "Aggiorna la lista resa grossista seguendo le indicazioni del titolare."
        ]
      },
      {
        id: "prodotto-non-trovato",
        titolo: "Prodotto non trovato a scaffale",
        scorciatoia: "M2",
        passi: [
          "Controlla se il gestionale lo segna come presente in magazzino.",
          "Se non lo trovi, segnala sul portale 'Logistica' come 'Prodotto non rintracciato'.",
          "Se il caso si ripete per lo stesso articolo, avvisa il titolare."
        ]
      }
    ]
  },
  servizi: {
    label: "Servizi & CUP",
    descrizione:
      "Procedure per servizi al banco: CUP, ECG, holter, autoanalisi ecc.",
    coloreChip: "Servizi & CUP",
    elenco: [
      {
        id: "prenotazione-cup",
        titolo: "Prenotazione CUP per il cliente",
        scorciatoia: "S1",
        passi: [
          "Identifica il cliente con documento o codice fiscale, se richiesto.",
          "Verifica la prescrizione e il servizio da prenotare.",
          "Registra sul gestionale o portale CUP seguendo i campi obbligatori.",
          "Consegna al cliente la stampa/riepilogo con data, ora e luogo della prestazione."
        ]
      },
      {
        id: "referto-ecg",
        titolo: "Gestione referto ECG / esame",
        scorciatoia: "S2",
        passi: [
          "Verifica che il referto sia associato al paziente giusto.",
          "Carica, se previsto, il referto sul portale interno o invialo via canale concordato.",
          "Segna sul portale il campo 'Referto consegnato' con data e operatore."
        ]
      }
    ]
  },
  altro: {
    label: "Altro",
    descrizione:
      "Procedure generali: comunicazioni interne, emergenze, chiusura serale.",
    coloreChip: "Generale",
    elenco: [
      {
        id: "chiusura-serale",
        titolo: "Chiusura serale della farmacia",
        scorciatoia: "A1",
        passi: [
          "Verifica che tutte le casse siano chiuse secondo la procedura di fine turno.",
          "Controlla porte, allarme, frigoriferi e vetrine frigo.",
          "Aggiorna, se necessario, le comunicazioni interne sul portale."
        ]
      }
    ]
  }
};

// ===== RIFERIMENTI DOM =====
const repartiSection = document.getElementById("repartiSection");
const procedureSection = document.getElementById("procedureSection");
const dettaglioSection = document.getElementById("dettaglioSection");

const repartiGrid = document.getElementById("repartiGrid");
const procedureButtons = document.getElementById("procedureButtons");

const currentRepartoTitle = document.getElementById("currentRepartoTitle");
const currentRepartoDesc = document.getElementById("currentRepartoDesc");
const dettaglioTitle = document.getElementById("dettaglioTitle");
const dettaglioTag = document.getElementById("dettaglioTag");
const dettaglioBody = document.getElementById("dettaglioBody");

const backToRepartiBtn = document.getElementById("backToReparti");

// Statistiche in alto
const statTotali = document.getElementById("statTotali");
const statCassa = document.getElementById("statCassa");
const statBanco = document.getElementById("statBanco");
const statMagazzino = document.getElementById("statMagazzino");

let currentRepartoKey = null;

// ===== FUNZIONI =====
function calcolaStatistiche() {
  let tot = 0;
  Object.values(procedureData).forEach((rep) => {
    tot += rep.elenco.length;
  });

  statTotali.textContent = tot;
  statCassa.textContent = procedureData.cassa.elenco.length;
  statBanco.textContent = procedureData.banco.elenco.length;
  statMagazzino.textContent = procedureData.magazzino.elenco.length;
}

function creaBottoniReparti() {
  repartiGrid.innerHTML = "";

  Object.entries(procedureData).forEach(([key, rep]) => {
    const btn = document.createElement("button");
    btn.className = `reparto-btn reparto-${key}`;
    btn.dataset.key = key;

    btn.innerHTML = `
      <span>${rep.label}</span>
      <span class="desc">${rep.descrizione}</span>
      <span class="count">${rep.elenco.length} procedure</span>
    `;

    btn.addEventListener("click", () => apriReparto(key));
    repartiGrid.appendChild(btn);
  });
}

function apriReparto(key) {
  currentRepartoKey = key;
  const rep = procedureData[key];

  // Aggiorna header sezione procedure
  currentRepartoTitle.textContent = rep.label;
  currentRepartoDesc.textContent = rep.descrizione;

  // Crea bottoni procedura
  procedureButtons.innerHTML = "";
  rep.elenco.forEach((proc) => {
    const pBtn = document.createElement("button");
    pBtn.className = "procedure-btn";
    pBtn.dataset.id = proc.id;

    pBtn.innerHTML = `
      <span class="label">${proc.titolo}</span>
      <span class="shortcut">${proc.scorciatoia}</span>
    `;

    pBtn.addEventListener("click", () => mostraProcedura(key, proc.id));
    procedureButtons.appendChild(pBtn);
  });

  // Mostra sezioni
  repartiSection.classList.add("hidden");
  procedureSection.classList.remove("hidden");
  dettaglioSection.classList.remove("hidden");

  // Reset testo dettaglio
  dettaglioTitle.textContent = "Seleziona una procedura";
  dettaglioTag.textContent = rep.coloreChip;
  dettaglioBody.innerHTML =
    '<p class="muted">Tocca una procedura per vedere i passaggi.</p>';

  // Scroll in alto (utile su telefono)
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostraProcedura(repartoKey, procId) {
  const rep = procedureData[repartoKey];
  const proc = rep.elenco.find((p) => p.id === procId);
  if (!proc) return;

  dettaglioTitle.textContent = proc.titolo;
  dettaglioTag.textContent = rep.coloreChip;

  const listaPassi = proc.passi
    .map((step) => `<li>${step}</li>`)
    .join("");

  dettaglioBody.innerHTML = `
    <h3>Passaggi operativi</h3>
    <ol>${listaPassi}</ol>
  `;
}

function tornaAiReparti() {
  currentRepartoKey = null;
  repartiSection.classList.remove("hidden");
  procedureSection.classList.add("hidden");
  dettaglioSection.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== INIZIALIZZAZIONE =====
document.addEventListener("DOMContentLoaded", () => {
  calcolaStatistiche();
  creaBottoniReparti();
  backToRepartiBtn.addEventListener("click", tornaAiReparti);
});
