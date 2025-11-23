// Dati demo per le procedure: testo sintetico per i passaggi
const PROCEDURE = {
  C1: {
    titolo: "C1 · Doppio scontrino / errore importo",
    reparto: "Cassa",
    passi: [
      "Metti subito in pausa il cliente (spiega che stai sistemando l'errore).",
      "Avvisa il titolare o il responsabile di turno.",
      "Segui la procedura fiscale interna per annullare / correggere lo scontrino.",
      "Registra una nota nel registro errori di cassa."
    ]
  },
  C2: {
    titolo: "C2 · Scontrino contanti ma pagamento POS",
    reparto: "Cassa",
    passi: [
      "Verifica che l'importo sul POS coincida con lo scontrino.",
      "Registra l'errore nel registro interno (cliente, ora, importo).",
      "Compensa la differenza a fine giornata secondo le indicazioni del titolare.",
      "Informare il titolare se l'errore si ripete spesso."
    ]
  },
  C3: {
    titolo: "C3 · Annullamento vendita e riapertura scontrino",
    reparto: "Cassa",
    passi: [
      "Richiama la vendita da annullare sul gestionale.",
      "Segui i passaggi ufficiali per l'annullo (chiusura fiscale corretta).",
      "Riapri uno scontrino nuovo con i dati corretti.",
      "Consegnare solo l'ultimo scontrino al cliente."
    ]
  },
  B1: {
    titolo: "B1 · Gestione ricetta SSN con anticipi",
    reparto: "Banco",
    passi: [
      "Registra la ricetta nel gestionale con tutti i dati del paziente.",
      "Incassa l'anticipo dovuto e stampa la ricevuta.",
      "Segna chiaramente la ricetta come 'DA EVADERE'.",
      "Al momento del ritiro, completa la vendita e consegna la documentazione."
    ]
  },
  B2: {
    titolo: "B2 · Vendita farmaco etico senza ricetta",
    reparto: "Banco",
    passi: [
      "Verifica nel prontuario se la vendita è consentita senza ricetta.",
      "Se hai dubbi, chiedi sempre conferma al titolare o al farmacista responsabile.",
      "Registra la vendita correttamente nel gestionale.",
      "Annota eventuali note o osservazioni cliniche utili."
    ]
  },
  B3: {
    titolo: "B3 · Reso merce cliente al banco",
    reparto: "Banco",
    passi: [
      "Verifica se il prodotto è reso consentito (integro, corretta temperatura ecc.).",
      "Applica la procedura di rimborso prevista (buono, riaccredito, ecc.).",
      "Registra il reso nel gestionale con motivazione.",
      "Riponi il prodotto nell'area dedicata ai resi."
    ]
  },
  M1: {
    titolo: "M1 · Controllo scadenze mensile",
    reparto: "Magazzino",
    passi: [
      "Seleziona un reparto alla volta (es. etico, SOP/OTC, parafarmaco).",
      "Controlla gli scaffali partendo dai prodotti più vicini alla scadenza.",
      "Sposta i prodotti in scadenza in zona evidenziata / offerta se previsto.",
      "Registra le azioni fatte nell'apposito registro scadenze."
    ]
  },
  M2: {
    titolo: "M2 · Prodotto non trovato a scaffale",
    reparto: "Magazzino",
    passi: [
      "Controlla se il prodotto risulta presente a magazzino sul gestionale.",
      "Verifica nel retro, negli scaffali vicini e nelle ceste promozionali.",
      "Se non trovato, segnala la discrepanza in 'note magazzino' per correzione.",
      "Aggiorna la disponibilità nel gestionale se confermi la mancanza."
    ]
  },
  S1: {
    titolo: "S1 · Prenotazione ECG / Holter",
    reparto: "Servizi & Cup",
    passi: [
      "Verifica che il cliente abbia tutti i dati necessari (codice fiscale, telefono).",
      "Proponi le fasce orarie disponibili secondo il calendario servizi.",
      "Registra la prenotazione nel gestionale e consegna il promemoria.",
      "Spiega come riceverà il referto (ritiro, mail, app)."
    ]
  },
  S2: {
    titolo: "S2 · Consegna referto via mail / app",
    reparto: "Servizi & Cup",
    passi: [
      "Verifica l'identità del cliente (documento o conferma dati).",
      "Controlla che il referto sia firmato digitalmente o validato.",
      "Invia il file al recapito indicato (mail o app proprietaria).",
      "Annota l'avvenuta consegna nel gestionale servizi."
    ]
  }
};

// Gestione UI
document.addEventListener("DOMContentLoaded", () => {
  const repartoChips = document.querySelectorAll(".reparto-chip");
  const sezioni = document.querySelectorAll(".sezione-procedure");
  const tornaButtons = document.querySelectorAll("[id^='btnTornaPrincipali']");
  const procButtons = document.querySelectorAll(".proc-item");

  const titoloDettaglio = document.getElementById("dettaglioTitolo");
  const tagReparto = document.getElementById("dettaglioReparto");
  const listaPassi = document.getElementById("dettaglioPassi");

  // Cambio reparto principale
  repartoChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const reparto = chip.dataset.reparto;

      repartoChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      sezioni.forEach((sec) => {
        sec.classList.toggle("active", sec.dataset.reparto === reparto);
      });

      // Reset testo dettaglio
      titoloDettaglio.textContent = "Seleziona una procedura";
      tagReparto.textContent = "Reparto: " + chip.textContent;
      listaPassi.innerHTML = `
        <li>Tocca una delle procedure del reparto <strong>${chip.textContent}</strong>.</li>
        <li>I passaggi appariranno qui in modo numerato.</li>
      `;
    });
  });

  // Pulsanti "Torna ai reparti principali"
  tornaButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // visualmente: nessuna sezione selezionata, ma lasciamo l'ultima aperta;
      // ci limitiamo a riportare il focus sui bottoni principali.
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Selezione procedura
  procButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const data = PROCEDURE[id];

      if (!data) return;

      titoloDettaglio.textContent = data.titolo;
      tagReparto.textContent = "Reparto: " + data.reparto;

      listaPassi.innerHTML = "";
      data.passi.forEach((passo) => {
        const li = document.createElement("li");
        li.textContent = passo;
        listaPassi.appendChild(li);
      });

      // Scroll dolce al dettaglio su mobile
      const rect = document.querySelector(".dettaglio").getBoundingClientRect();
      const offset = window.scrollY + rect.top - 12;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  });
});
