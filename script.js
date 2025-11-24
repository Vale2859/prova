// Dati demo procedure – 2 click
const procedureData = {
  cassa: [
    {
      id: 'c1',
      titolo: 'Doppio scontrino / errore importo',
      breve: 'Correggere uno scontrino battuto male.',
      codice: 'C1',
      tag: 'Reparto: Cassa · Tempo medio: 2 min',
      passi: [
        'Avvisa subito il cliente dell’errore.',
        'Chiama il titolare o chi è abilitato alla rettifica.',
        'Segui la procedura di storno sul gestionale (tasto apposito).',
        'Emetti lo scontrino corretto e consegnalo al cliente.',
        'Annota l’errore sul registro interno errori cassa.'
      ]
    },
    {
      id: 'c2',
      titolo: 'Reso merce con rimborso contanti / carta',
      breve: 'Quando il cliente restituisce un prodotto.',
      codice: 'C2',
      tag: 'Reparto: Cassa · Tempo medio: 3 min',
      passi: [
        'Verifica che il prodotto sia rendibile (scontrino, stato della confezione, normative).',
        'Controlla la data sullo scontrino e le note del gestionale.',
        'Esegui la procedura di reso su gestionale selezionando la causale corretta.',
        'Rimborsa il cliente con il metodo concordato (contanti / carta).',
        'Archivia lo scontrino di reso nella cartellina dedicata.'
      ]
    },
    {
      id: 'c3',
      titolo: 'Mancanza resto in cassa',
      breve: 'Gestire quando mancano monete o piccoli tagli.',
      codice: 'C3',
      tag: 'Reparto: Cassa · Tempo medio: 1 min',
      passi: [
        'Mettiti d’accordo con il collega più vicino per avere il cambio.',
        'Segna sul foglio “Cambio cassa” quanto è stato spostato e in che tagli.',
        'Aggiorna la scatola del resto secondo la procedura interna.',
        'Comunica al titolare se la mancanza di resto è frequente.'
      ]
    }
  ],
  banco: [
    {
      id: 'b1',
      titolo: 'Gestione anticipi con ricetta SSR',
      breve: 'Cliente lascia anticipo e ritira dopo la ricetta.',
      codice: 'B1',
      tag: 'Reparto: Banco · Tempo medio: 3 min',
      passi: [
        'Raccogli i dati del cliente (nome, telefono) e del medico se necessario.',
        'Compila il modulo interno “Anticipi” con data e importo.',
        'Applica l’etichetta al prodotto e riponilo nell’area dedicata anticipi.',
        'Avvisa il cliente su tempi e modalità di ritiro.',
        'Aggiorna il registro quando la ricetta viene consegnata e il cliente ritira.'
      ]
    },
    {
      id: 'b2',
      titolo: 'Prodotto non disponibile a magazzino',
      breve: 'Gestione ordine al fornitore / altra farmacia.',
      codice: 'B2',
      tag: 'Reparto: Banco · Tempo medio: 2 min',
      passi: [
        'Verifica a computer la disponibilità presso i grossisti.',
        'Se necessario, proponi un equivalente conforme alla normativa.',
        'Se il cliente accetta l’ordine, registra la prenotazione con nominativo e recapito.',
        'Spiega tempi indicativi di arrivo e modalità di avviso (telefono / SMS / app).'
      ]
    },
    {
      id: 'b3',
      titolo: 'Cliente in attesa di ricetta dematerializzata',
      breve: 'Ricetta non ancora arrivata dal medico.',
      codice: 'B3',
      tag: 'Reparto: Banco · Tempo medio: 2 min',
      passi: [
        'Verifica con il cliente dati anagrafici e medico di riferimento.',
        'Controlla nel gestionale se la ricetta è già stata generata.',
        'Se non presente, compila il modulo interno “Ricetta in attesa”.',
        'Concorda con il cliente se tornare più tardi o essere ricontattato.'
      ]
    }
  ],
  magazzino: [
    {
      id: 'm1',
      titolo: 'Controllo scadenze mensile',
      breve: 'Verifica mensile delle scadenze a scaffale.',
      codice: 'M1',
      tag: 'Reparto: Magazzino · Tempo medio: 20 min a reparto',
      passi: [
        'Prendi il carrellino e l’apposito contenitore per prodotti in scadenza.',
        'Controlla scaffale per scaffale i prodotti con scadenza ≤ 6 mesi.',
        'Sposta i prodotti in scadenza nel ripiano dedicato.',
        'Compila il foglio “Scadenze” con codice prodotto, lotto e data.',
        'Consegna il foglio al titolare / responsabile acquisti.'
      ]
    },
    {
      id: 'm2',
      titolo: 'Prodotto non trovato a scaffale',
      breve: 'Gestire quando il gestionale dice “presente” ma non si trova.',
      codice: 'M2',
      tag: 'Reparto: Magazzino · Tempo medio: 4 min',
      passi: [
        'Controlla eventuali espositori fuori banco o vetrine dedicate.',
        'Verifica se il prodotto è stato spostato in promozione / isola tematica.',
        'Se non trovato, registra la mancanza sul modulo “Prodotto non rintracciato”.',
        'Avvisa il titolare per eventuale rettifica giacenza sul gestionale.'
      ]
    }
  ],
  servizi: [
    {
      id: 's1',
      titolo: 'Prenotazione servizio (es. ECG, holter, MOC)',
      breve: 'Registrare la prenotazione del cliente.',
      codice: 'S1',
      tag: 'Reparto: Servizi / Cup · Tempo medio: 3 min',
      passi: [
        'Verifica il servizio richiesto e le eventuali preparazioni (digiuno, ecc.).',
        'Consulta l’agenda servizi e proponi gli slot disponibili.',
        'Registra i dati del cliente (nome, telefono, eventuale email).',
        'Consegna il promemoria cartaceo o digitale con data e ora.',
        'Segna eventuali note importanti (farmaci, patologie rilevanti).'
      ]
    },
    {
      id: 's2',
      titolo: 'Gestione no-show (cliente non si presenta)',
      breve: 'Cosa fare se il cliente non arriva all’appuntamento.',
      codice: 'S2',
      tag: 'Reparto: Servizi / Cup · Tempo medio: 2 min',
      passi: [
        'Dopo 10–15 minuti chiama il cliente per capire il motivo.',
        'Se richiede un nuovo appuntamento, riprogramma seguendo le disponibilità.',
        'Segna il no-show nell’agenda con una nota.',
        'Se i no-show sono frequenti, segnala il nominativo al titolare.'
      ]
    }
  ]
};

// Stato attuale
let currentCategory = 'cassa';

// Riferimenti DOM
document.addEventListener('DOMContentLoaded', () => {
  const catButtons = document.querySelectorAll('.proc-cat-btn');
  const procButtonsContainer = document.getElementById('procButtonsContainer');
  const procTitle = document.getElementById('procTitle');
  const procTag = document.getElementById('procTag');
  const procStepsCard = document.getElementById('procStepsCard');
  const procStepsList = document.getElementById('procStepsList');

  // Cambia categoria (primo click)
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (cat === currentCategory) return;

      currentCategory = cat;

      catButtons.forEach(b => b.classList.toggle('active', b === btn));
      renderProcedureButtons();
      clearCurrentProcedure();
    });
  });

  // Mostra i pulsanti della categoria attuale
  function renderProcedureButtons() {
    procButtonsContainer.innerHTML = '';

    const list = procedureData[currentCategory] || [];

    list.forEach(proc => {
      const button = document.createElement('button');
      button.className = `proc-btn proc-btn--${currentCategory}`;
      button.setAttribute('data-id', proc.id);

      button.innerHTML = `
        <div class="proc-btn-main">
          <span class="proc-btn-title">${proc.titolo}</span>
          <span class="proc-btn-sub">${proc.breve}</span>
        </div>
        <span class="proc-btn-short">${proc.codice}</span>
      `;

      button.addEventListener('click', () => {
        showProcedure(proc);
      });

      procButtonsContainer.appendChild(button);
    });
  }

  // Mostra i passaggi della procedura scelta (secondo click)
  function showProcedure(proc) {
    procTitle.textContent = proc.titolo;
    procTag.textContent = proc.tag;

    procStepsList.innerHTML = '';
    proc.passi.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      procStepsList.appendChild(li);
    });

    procStepsCard.classList.remove('proc-steps-card--empty');
    document.querySelector('.proc-empty-text')?.remove();
  }

  // Quando cambio reparto, svuoto il dettaglio
  function clearCurrentProcedure() {
    procTitle.textContent = 'Seleziona una procedura';
    procTag.textContent = '—';
    procStepsList.innerHTML = '';
    procStepsCard.classList.add('proc-steps-card--empty');

    if (!document.querySelector('.proc-empty-text')) {
      const p = document.createElement('p');
      p.className = 'proc-empty-text';
      p.textContent = 'Tocca un pulsante sopra per vedere i passaggi operativi.';
      procStepsCard.prepend(p);
    }
  }

  // Inizializzazione
  renderProcedureButtons();
  clearCurrentProcedure();
});
