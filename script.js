// =========================
// DATI PROCEDURE (DEMO)
// =========================

const procedureData = {
  cassa: {
    nome: "Cassa",
    descrizione:
      "Procedure operative per chi lavora in cassa: scontrini, resi, errori di pagamento.",
    coloreClasse: "area-cassa",
    items: [
      {
        codice: "C1",
        scorciatoia: "Alt + D",
        titolo: "Doppio scontrino / errore importo",
        intro:
          "Da usare quando è stato emesso uno scontrino con importo errato oppure duplicato.",
        passi: [
          "Avvisa subito il cliente spiegando l'errore in modo chiaro e tranquillo.",
          "Chiudi la vendita errata come da procedura del gestionale (annullo o nota di credito).",
          "Emetti lo scontrino corretto verificando bene articolo, quantità e modalità di pagamento.",
          "Compila, se previsto, il registro interno errori cassa."
        ],
        nota:
          "In caso di dubbi su annullo / storno, contatta subito il titolare o il referente amministrativo."
      },
      {
        codice: "C2",
        scorciatoia: "Alt + R",
        titolo: "Reso merce con rimborso contanti / carta",
        intro:
          "Da usare quando un cliente restituisce un prodotto e deve essere effettuato un rimborso.",
        passi: [
          "Verifica che il prodotto sia reso integro e con scontrino, seguendo le regole della farmacia.",
          "Apri il gestionale, richiama la vendita originale e registra il reso.",
          "Storna l'importo con la stessa modalità di pagamento (contanti o POS).",
          "Metti il prodotto nell'area resi / da verificare indicata dal titolare."
        ],
        nota:
          "Per prodotti da distruggere o resi particolari (es. SSN) seguire sempre le istruzioni del titolare."
      },
      {
        codice: "C3",
        scorciatoia: "Alt + M",
        titolo: "Mancanza resto in cassa",
        intro:
          "Da usare quando non hai abbastanza monete/banconote per dare il resto esatto al cliente.",
        passi: [
          "Avvisa il collega alla cassa accanto, se presente, per un cambio rapido.",
          "Se non è possibile, spiega al cliente la situazione e proponi un pagamento elettronico.",
          "Se il cliente paga comunque in contanti, segnala la necessità di cambio nel quaderno cassa.",
          "A fine turno segnala al titolare o al referente di cassa il taglio mancante."
        ],
        nota:
          "Questa procedura aiuta a non lasciare buchi di cassa non tracciati e a programmare meglio il cambio."
      }
    ]
  },
  banco: {
    nome: "Banco",
    descrizione:
      "Procedure per il banco vendita: gestione cliente, consigli, problemi su prodotti.",
    coloreClasse: "area-banco",
    items: [
      {
        codice: "B1",
        scorciatoia: "Alt + C",
        titolo: "Cliente insoddisfatto per prodotto",
        intro:
          "Da usare quando un cliente torna lamentando un prodotto che non ha funzionato come si aspettava.",
        passi: [
          "Ascolta con calma il cliente lasciandolo spiegare senza interrompere.",
          "Valuta se il problema è di utilizzo, aspettativa o difetto del prodotto.",
          "Se possibile, proponi una soluzione (spiegazione migliore, sostituzione, rimborso secondo regole interne).",
          "Segna sul quaderno banco il caso, indicando nome prodotto e tipo di lamentela."
        ],
        nota:
          "I casi ripetuti sullo stesso prodotto vanno segnalati al titolare per eventuale rimozione dall'assortimento."
      },
      {
        codice: "B2",
        scorciatoia: "Alt + P",
        titolo: "Prodotto non disponibile a scaffale",
        intro:
          "Da usare quando il cliente chiede un prodotto che di solito c'è ma non è disponibile a scaffale.",
        passi: [
          "Verifica subito a magazzino o al terminale la reale disponibilità.",
          "Se è disponibile in magazzino, recuperalo e riempi anche lo scaffale.",
          "Se non è disponibile, proponi un'alternativa adeguata spiegando bene le differenze.",
          "Offri la possibilità di prenotarlo e avvisare il cliente quando arriva."
        ],
        nota:
          "Questa procedura riduce i 'no stock' al banco e migliora la percezione di servizio al cliente."
      }
    ]
  },
  magazzino: {
    nome: "Magazzino",
    descrizione:
      "Procedure per scorte, scadenze e ordine degli scaffali interni.",
    coloreClasse: "area-magazzino",
    items: [
      {
        codice: "M1",
        scorciatoia: "M1",
        titolo: "Controllo scadenze mensile",
        intro:
          "Da usare per il controllo periodico delle scadenze in magazzino e a scaffale.",
        passi: [
          "Seleziona il reparto da controllare (OTC, integratori, cosmetica, ecc.).",
          "Controlla le date di scadenza partendo dai ripiani più alti verso il basso.",
          "Sposta in area 'scadenze prossime' i prodotti con scadenza entro la soglia decisa dal titolare.",
          "Aggiorna il foglio o il file dedicato alle scadenze segnando reparto, prodotto e quantità."
        ],
        nota:
          "Le scadenze devono essere controllate almeno una volta al mese o con la frequenza decisa dal titolare."
      },
      {
        codice: "M2",
        scorciatoia: "M2",
        titolo: "Prodotto non trovato a scaffale",
        intro:
          "Da usare quando il gestionale indica disponibilità ma il prodotto fisicamente non si trova.",
        passi: [
          "Controlla se il prodotto è stato spostato nei cestoni promo o in espositori speciali.",
          "Verifica anche nel retro/magazzino in eventuali scatole di arrivo non ancora sistemate.",
          "Se non viene trovato, segnala l'anomalia nel registro mancanze di magazzino.",
          "A fine giornata confronta le mancanze con il titolare per eventuale rettifica di giacenza."
        ],
        nota:
          "Ridurre al minimo le differenze tra gestionale e scorte reali evita problemi di ordini e di servizio al cliente."
      }
    ]
  }
};

// =========================
// INIZIALIZZAZIONE PAGINA
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const statTotali = document.getElementById("statTotali");
  const statCassa = document.getElementById("statCassa");
  const statBanco = document.getElementById("statBanco");
  const statMagazzino = document.getElementById("statMagazzino");

  const repartiTabs = document.getElementById("repartiTabs");
  const procedureList = document.getElementById("procedureList");

  const currentAreaLabel = document.getElementById("currentAreaLabel");
  const currentAreaTitle = document.getElementById("currentAreaTitle");
  const currentAreaDesc = document.getElementById("currentAreaDesc");

  const detailAreaChip = document.getElementById("detailAreaChip");
  const detailCode = document.getElementById("detailCode");
  const detailTitle = document.getElementById("detailTitle");
  const detailIntro = document.getElementById("detailIntro");
  const detailSteps = document.getElementById("detailSteps");
  const detailNote = document.getElementById("detailNote");

  const backToReparti = document.getElementById("backToReparti");

  // Calcolo statistiche
  const countCassa = procedureData.cassa.items.length;
  const countBanco = procedureData.banco.items.length;
  const countMagazzino = procedureData.magazzino.items.length;
  const countTotali = countCassa + countBanco + countMagazzino;

  statTotali.textContent = countTotali;
  statCassa.textContent = countCassa;
  statBanco.textContent = countBanco;
  statMagazzino.textContent = countMagazzino;

  // Crea tab dei reparti
  let currentAreaKey = "cassa";

  function renderRepartiTabs() {
    repartiTabs.innerHTML = "";

    Object.entries(procedureData).forEach(([key, area]) => {
      const btn = document.createElement("button");
      btn.className =
        "reparto-chip" + (key === currentAreaKey ? " active" : "");
      btn.dataset.areaKey = key;

      const label = document.createElement("span");
      label.textContent = area.nome;

      const countSpan = document.createElement("span");
      countSpan.className = "count";
      countSpan.textContent = area.items.length;

      btn.appendChild(label);
      btn.appendChild(countSpan);

      btn.addEventListener("click", () => {
        if (currentAreaKey === key) return;
        currentAreaKey = key;
        renderRepartiTabs();
        renderProcedureList();
        resetDetailForArea();
      });

      repartiTabs.appendChild(btn);
    });
  }

  // Crea lista procedure del reparto selezionato
  function renderProcedureList() {
    const area = procedureData[currentAreaKey];
    procedureList.innerHTML = "";

    currentAreaLabel.textContent = "Reparto";
    currentAreaTitle.textContent = area.nome;
    currentAreaDesc.textContent = area.descrizione;

    area.items.forEach((proc) => {
      const btn = document.createElement("button");
      btn.className = `procedure-item ${area.coloreClasse}`;
      btn.dataset.code = proc.codice;

      const titleSpan = document.createElement("span");
      titleSpan.className = "procedure-title";
      titleSpan.textContent = proc.titolo;

      const shortcutSpan = document.createElement("span");
      shortcutSpan.className = "procedure-shortcut";
      shortcutSpan.textContent = proc.scorciatoia;

      btn.appendChild(titleSpan);
      btn.appendChild(shortcutSpan);

      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".procedure-item.active")
          .forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        renderDetail(proc, area);
      });

      procedureList.appendChild(btn);
    });
  }

  // Mostra dettaglio procedura
  function renderDetail(proc, area) {
    detailAreaChip.textContent = area.nome;
    detailCode.textContent = proc.codice;
    detailTitle.textContent = proc.titolo;
    detailIntro.textContent = proc.intro;

    detailSteps.innerHTML = "";
    proc.passi.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      detailSteps.appendChild(li);
    });

    detailNote.textContent = proc.nota || "";
  }

  // Quando cambio reparto resetto il dettaglio
  function resetDetailForArea() {
    const area = procedureData[currentAreaKey];
    detailAreaChip.textContent = area.nome;
    detailCode.textContent = "";
    detailTitle.textContent = "Seleziona una procedura";
    detailIntro.textContent =
      "Tocca una procedura dalla lista in alto per vedere i passaggi da seguire.";
    detailSteps.innerHTML = "";
    detailNote.textContent = "";
  }

  // Bottone "torna ai reparti principali"
  backToReparti.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Inizializzo
  renderRepartiTabs();
  renderProcedureList();
  resetDetailForArea();
});
